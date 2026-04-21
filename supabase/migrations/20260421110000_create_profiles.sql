-- Migration: 사용자 프로필 테이블 생성
-- 댓글 작성자 이메일 표시를 위해 auth.users 이메일을 공개 스키마에 노출

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 또는 공개 레시피에 댓글을 작성한 사용자 프로필만 조회 가능
-- (로그인 사용자 전체 이메일 노출 방지)
CREATE POLICY "댓글 작성자 프로필 조회" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM recipe_comments rc
      JOIN recipes r ON r.id = rc.recipe_id
      WHERE rc.user_id = profiles.id
        AND r.is_public = true
    )
  );

-- 본인 프로필만 수정 가능
CREATE POLICY "본인 프로필 수정" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 회원가입 시 profiles에 자동 삽입하는 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 이메일 변경 시 profiles도 업데이트
CREATE TRIGGER trg_on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON TABLE profiles IS '사용자 프로필 — auth.users의 이메일을 공개 스키마에 노출';
