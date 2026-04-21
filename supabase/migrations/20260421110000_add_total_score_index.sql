-- Migration: total_score 평점순 정렬 인덱스 추가
-- CLA-142 (Fix CLA-4): fetchRecipes sortBy='total_score' 시 전체 테이블 스캔 방지

-- 평점순 정렬 최적화: ORDER BY total_score DESC, id DESC 커버
CREATE INDEX IF NOT EXISTS idx_recipes_total_score_id
  ON recipes (total_score DESC NULLS LAST, id DESC);

COMMENT ON INDEX idx_recipes_total_score_id IS '레시피 평점순 정렬 최적화';
