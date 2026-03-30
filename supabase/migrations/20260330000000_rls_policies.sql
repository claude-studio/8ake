-- RLS 활성화
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_reviews ENABLE ROW LEVEL SECURITY;

-- recipes: 공개 레시피는 누구나 조회, 수정/삭제는 소유자만
CREATE POLICY "recipes_select" ON recipes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update" ON recipes FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "recipes_delete" ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- recipe_ingredients: 소유자만
CREATE POLICY "recipe_ingredients_select" ON recipe_ingredients FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id)
    OR (SELECT is_public FROM recipes WHERE id = recipe_id) = true
  );
CREATE POLICY "recipe_ingredients_insert" ON recipe_ingredients FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));
CREATE POLICY "recipe_ingredients_update" ON recipe_ingredients FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));
CREATE POLICY "recipe_ingredients_delete" ON recipe_ingredients FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- recipe_photos: 소유자만
CREATE POLICY "recipe_photos_select" ON recipe_photos FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id)
    OR (SELECT is_public FROM recipes WHERE id = recipe_id) = true
  );
CREATE POLICY "recipe_photos_insert" ON recipe_photos FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));
CREATE POLICY "recipe_photos_update" ON recipe_photos FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));
CREATE POLICY "recipe_photos_delete" ON recipe_photos FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- reviews: 소유자만
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ingredients: 소유자만
CREATE POLICY "ingredients_select" ON ingredients FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "ingredients_insert" ON ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ingredients_update" ON ingredients FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "ingredients_delete" ON ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- ingredient_reviews: 소유자만
CREATE POLICY "ingredient_reviews_select" ON ingredient_reviews FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "ingredient_reviews_insert" ON ingredient_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ingredient_reviews_update" ON ingredient_reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "ingredient_reviews_delete" ON ingredient_reviews FOR DELETE
  USING (auth.uid() = user_id);
