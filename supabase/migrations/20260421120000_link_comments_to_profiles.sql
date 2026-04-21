-- Migration: recipe_comments.user_id → profiles.id 외래키 추가
-- PostgREST가 recipe_comments와 profiles 간 관계를 인식하도록 함

-- 기존 auth.users 데이터를 profiles에 backfill (FK 추가 전 선행 필수)
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- FK 제약 추가
ALTER TABLE recipe_comments
  ADD CONSTRAINT recipe_comments_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
