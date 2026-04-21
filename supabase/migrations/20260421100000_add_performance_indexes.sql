-- Migration: 레시피 조회 성능 인덱스 추가
-- CLA-4: 정렬, 필터링, 커서 페이징 쿼리 최적화

-- pg_trgm 확장 활성화 (ILIKE 검색 최적화에 필요)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. recipes 테이블 인덱스

-- 1-1. 커서 페이징: created_at DESC + id DESC 복합 인덱스
--      fetchRecipes의 ORDER BY created_at DESC, id DESC 및 커서 조건에 사용
CREATE INDEX IF NOT EXISTS idx_recipes_created_at_id
  ON recipes (created_at DESC, id DESC);

-- 1-2. 이름 ILIKE 검색 최적화 (GIN trigram)
--      fetchRecipes의 name ILIKE '%search%' 필터에 사용
CREATE INDEX IF NOT EXISTS idx_recipes_name_trgm
  ON recipes USING gin (name gin_trgm_ops);

-- 1-3. tags 배열 포함 필터 최적화 (GIN)
--      fetchRecipes의 tags @> ARRAY[...] 필터에 사용
CREATE INDEX IF NOT EXISTS idx_recipes_tags_gin
  ON recipes USING gin (tags);

-- 1-4. user_id 필터 (RLS 정책 및 사용자별 조회)
CREATE INDEX IF NOT EXISTS idx_recipes_user_id
  ON recipes (user_id);

-- 2. recipe_photos 테이블 인덱스

-- 2-1. recipe_id FK 조인 최적화 (레시피 상세/목록 조회 시 JOIN)
CREATE INDEX IF NOT EXISTS idx_recipe_photos_recipe_id
  ON recipe_photos (recipe_id);

-- 2-2. recipe_id + order 복합 인덱스 (사진 순서대로 조회)
CREATE INDEX IF NOT EXISTS idx_recipe_photos_recipe_id_order
  ON recipe_photos (recipe_id, "order");

-- 3. recipe_ingredients 테이블 인덱스

-- 3-1. recipe_id FK 조인 최적화 (레시피 상세 조회 시 JOIN)
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id
  ON recipe_ingredients (recipe_id);

-- 4. reviews 테이블 인덱스

-- 4-1. recipe_id FK 조인 최적화 (레시피별 리뷰 목록)
CREATE INDEX IF NOT EXISTS idx_reviews_recipe_id
  ON reviews (recipe_id);

-- 4-2. recipe_id + created_at DESC 복합 인덱스 (레시피별 최신 리뷰 정렬)
CREATE INDEX IF NOT EXISTS idx_reviews_recipe_id_created_at
  ON reviews (recipe_id, created_at DESC);

-- 5. ingredients 테이블 인덱스

-- 5-1. user_id 필터 (사용자별 재료 목록 조회)
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id
  ON ingredients (user_id);

-- 6. ingredient_reviews 테이블 인덱스

-- 6-1. ingredient_id FK 조인 최적화 (재료별 리뷰 목록)
CREATE INDEX IF NOT EXISTS idx_ingredient_reviews_ingredient_id
  ON ingredient_reviews (ingredient_id);

COMMENT ON INDEX idx_recipes_created_at_id IS '레시피 목록 커서 페이징 및 최신순 정렬 최적화';
COMMENT ON INDEX idx_recipes_name_trgm IS '레시피 이름 ILIKE 검색 최적화 (pg_trgm)';
COMMENT ON INDEX idx_recipes_tags_gin IS '레시피 태그 배열 포함 필터 최적화';
COMMENT ON INDEX idx_recipes_user_id IS '사용자별 레시피 조회 최적화';
COMMENT ON INDEX idx_recipe_photos_recipe_id IS '레시피-사진 JOIN 최적화';
COMMENT ON INDEX idx_recipe_photos_recipe_id_order IS '레시피 사진 순서 조회 최적화';
COMMENT ON INDEX idx_recipe_ingredients_recipe_id IS '레시피-재료 JOIN 최적화';
COMMENT ON INDEX idx_reviews_recipe_id IS '레시피별 리뷰 조회 최적화';
COMMENT ON INDEX idx_reviews_recipe_id_created_at IS '레시피별 최신 리뷰 정렬 최적화';
COMMENT ON INDEX idx_ingredients_user_id IS '사용자별 재료 조회 최적화';
COMMENT ON INDEX idx_ingredient_reviews_ingredient_id IS '재료별 리뷰 조회 최적화';
