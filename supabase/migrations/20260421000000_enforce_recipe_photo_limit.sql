-- Migration: 레시피당 최대 사진 2장 DB 제한 강제
-- CLA-69 / Fix for CLA-11
-- CLA-96: TOCTOU 경쟁 조건 수정 — advisory lock으로 원자성 보장

-- 트리거 함수: INSERT/UPDATE 전에 레시피당 사진 수가 2장을 초과하는지 검사
-- 동시 INSERT 경쟁 조건 방지를 위해 pg_advisory_xact_lock 사용
CREATE OR REPLACE FUNCTION check_recipe_photo_limit()
RETURNS TRIGGER AS $$
DECLARE
  photo_count integer;
  target_recipe_id uuid;
BEGIN
  -- UPDATE 시 recipe_id가 바뀔 수 있으므로 NEW 기준으로 확인
  target_recipe_id := NEW.recipe_id;

  -- 동시 INSERT 직렬화: recipe_id 단위로 트랜잭션 어드바이저리 락을 획득하여
  -- COUNT 검사와 INSERT 사이에 다른 트랜잭션이 끼어드는 TOCTOU 경쟁 조건 방지
  PERFORM pg_advisory_xact_lock(hashtextextended(target_recipe_id::text, 0));

  SELECT COUNT(*) INTO photo_count
  FROM recipe_photos
  WHERE recipe_id = target_recipe_id
    -- UPDATE의 경우 자기 자신은 제외
    AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF photo_count >= 2 THEN
    RAISE EXCEPTION 'recipe_photos_limit: recipe % already has 2 photos', target_recipe_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 등록 (INSERT, UPDATE 모두 적용)
DROP TRIGGER IF EXISTS trg_recipe_photo_limit ON recipe_photos;
CREATE TRIGGER trg_recipe_photo_limit
  BEFORE INSERT OR UPDATE ON recipe_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_recipe_photo_limit();

COMMENT ON FUNCTION check_recipe_photo_limit() IS '레시피당 사진을 최대 2장으로 제한한다. pg_advisory_xact_lock으로 recipe_id 단위 직렬화 후 COUNT 검사. 동시 INSERT TOCTOU 경쟁 조건 방지. 3번째 INSERT 또는 다른 레시피로의 UPDATE 시 check_violation 예외를 발생시킨다.';
