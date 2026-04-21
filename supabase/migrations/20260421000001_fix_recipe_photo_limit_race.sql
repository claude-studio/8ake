-- Migration: 레시피 사진 제한 트리거 동시성 경합 수정
-- CLA-104 / Fix for CLA-99

-- 기존 트리거 함수를 삭제하고 행 수준 잠금을 추가한 버전으로 교체합니다.
-- 문제: COUNT(*) 만으로는 동시 INSERT 두 건이 모두 검사를 통과해 3장이 저장될 수 있음.
-- 수정: SELECT FOR UPDATE 로 부모 recipes 행을 잠가 같은 recipe_id의 INSERT/UPDATE 를 직렬화.

CREATE OR REPLACE FUNCTION check_recipe_photo_limit()
RETURNS TRIGGER AS $$
DECLARE
  photo_count integer;
  target_recipe_id uuid;
BEGIN
  target_recipe_id := NEW.recipe_id;

  -- 같은 recipe_id에 대한 동시 INSERT/UPDATE 를 직렬화하기 위해
  -- 부모 recipes 행에 배타 잠금을 획득한다.
  -- 이 잠금은 트랜잭션 종료 시 자동 해제된다.
  PERFORM id FROM recipes WHERE id = target_recipe_id FOR UPDATE;

  SELECT COUNT(*) INTO photo_count
  FROM recipe_photos
  WHERE recipe_id = target_recipe_id
    AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF photo_count >= 2 THEN
    RAISE EXCEPTION 'recipe_photos_limit: recipe % already has 2 photos', target_recipe_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_recipe_photo_limit() IS '레시피당 사진을 최대 2장으로 제한한다. FOR UPDATE 잠금으로 동시 INSERT 경합을 방지하고, 3번째 INSERT 또는 다른 레시피로의 UPDATE 시 check_violation 예외를 발생시킨다.';
