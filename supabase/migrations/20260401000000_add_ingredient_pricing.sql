-- Migration: 재료 가격 추적 + 원가 계산 기능
-- AKE-22 > AKE-27: DB 스키마 확장

-- 1. ingredients 테이블에 가격 필드 추가
ALTER TABLE ingredients
  ADD COLUMN unit_price numeric DEFAULT NULL,
  ADD COLUMN price_unit text DEFAULT NULL,
  ADD COLUMN price_updated_at timestamptz DEFAULT NULL;

-- price_unit 값 제약: 원/g, 원/ml, 원/개 만 허용
ALTER TABLE ingredients
  ADD CONSTRAINT ingredients_price_unit_check
  CHECK (price_unit IS NULL OR price_unit IN ('원/g', '원/ml', '원/개'));

-- unit_price와 price_unit은 함께 설정되어야 함
ALTER TABLE ingredients
  ADD CONSTRAINT ingredients_price_pair_check
  CHECK (
    (unit_price IS NULL AND price_unit IS NULL)
    OR (unit_price IS NOT NULL AND price_unit IS NOT NULL)
  );

-- 2. recipe_ingredients 테이블에 단가 스냅샷 필드 추가
ALTER TABLE recipe_ingredients
  ADD COLUMN unit_price_snapshot numeric DEFAULT NULL;

-- 3. COMMENT 추가
COMMENT ON COLUMN ingredients.unit_price IS '재료 단가 (숫자)';
COMMENT ON COLUMN ingredients.price_unit IS '단가 단위: 원/g, 원/ml, 원/개';
COMMENT ON COLUMN ingredients.price_updated_at IS '가격 최종 갱신일';
COMMENT ON COLUMN recipe_ingredients.unit_price_snapshot IS '레시피 작성 시점의 재료 단가 스냅샷';
