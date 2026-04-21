-- Migration: 레시피 댓글 기능 추가
-- CLA-58: 공개 레시피 소통을 위한 댓글 테이블 생성

CREATE TABLE recipe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 레시피별 댓글 조회 성능 최적화
CREATE INDEX recipe_comments_recipe_id_idx ON recipe_comments(recipe_id, created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_recipe_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipe_comments_updated_at
  BEFORE UPDATE ON recipe_comments
  FOR EACH ROW
  EXECUTE FUNCTION set_recipe_comments_updated_at();

-- RLS 정책
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- 공개 레시피 댓글은 누구나 읽을 수 있음
CREATE POLICY "공개 레시피 댓글 조회" ON recipe_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_comments.recipe_id
        AND recipes.is_public = true
    )
  );

-- 로그인한 사용자는 댓글 작성 가능
CREATE POLICY "로그인 사용자 댓글 작성" ON recipe_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 수정 가능
CREATE POLICY "본인 댓글 수정" ON recipe_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 삭제 가능
CREATE POLICY "본인 댓글 삭제" ON recipe_comments
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE recipe_comments IS '레시피 댓글 — 공개 레시피에 대한 사용자 소통';
COMMENT ON COLUMN recipe_comments.content IS '댓글 내용 (1~500자)';
