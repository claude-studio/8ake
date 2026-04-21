-- Migration: recipe_comments.user_id → profiles.id 외래키 추가
-- PostgREST가 recipe_comments와 profiles 간 관계를 인식하도록 함

ALTER TABLE recipe_comments
  ADD CONSTRAINT recipe_comments_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
