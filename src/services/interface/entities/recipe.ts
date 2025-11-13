import { ImageList, IngredientList, RECOMMAND_RECIPE_PREFIX, UTCString } from "./types";


export enum RecipeSource {
  recipe_family = "recipe_family",
  recipe_recommend = "recipe_recommend",
}
// Create ingredient request type
interface CreateIngredientRequest {
  name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
}

// Cooking step related types
interface InstructionStep {
  step: number;
  content: string;
}

type InstructionList = InstructionStep[];

// Family recipe base type

// Family recipe entity type (FamilyRecipeEntity)
export interface IFamilyRecipeEntity {
  from: RecipeSource;
  // Inherits all properties from FamilyRecipe
  id: string;
  source_recipe_id?: string | null;
  source_version_at?: UTCString | null;
  family_id: string;
  name: string;
  cooking_time?: number | null;
  servings?: number | null;
  images?: ImageList;
  instructions: InstructionList;
  ingredients: IngredientList;
  nutrition_info?: string | null;
  note?: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_at?: UTCString | null;
  deleted_by_user?: string | null;
  deleted_by_role?: string | null;
  created_by_role?: string | null;
  created_by_user?: string | null;
  created_at: UTCString;
  updated_at: UTCString;

  // Wrapper-specific properties
  reference_count: number;
  tags: string[];
  allergy_tags: string[];
}

//-----------------
// Create family recipe request type
interface CreateFamilyRecipeRequestItem {
  name: string;
  cooking_time?: number | null;
  servings?: number | null;
  images: ImageList;
  instructions: InstructionList;
  ingredients_query?: string[];
  note?: string | null;
  nutrition_info?: string | null;
}

/**
 * Batch create family recipes request type
 */
export interface IBatchCreateFamilyRecipeRequest {
  items: CreateFamilyRecipeRequestItem[];
}

/**
 * Batch update family recipe item type
 */
export interface IBatchUpdateFamilyRecipeItem {
  id: string;
  name?: string | null;
  from?: RecipeSource;
  cooking_time?: number | null;
  servings?: number | null;
  images?: ImageList;
  instructions?: InstructionList;
  note?: string | null;
  nutrition_info?: string | null;
  ingredients_query?: string[] | null;
}

/**
 * Batch update family recipes request type
 */
export interface IBatchUpdateFamilyRecipeRequest {
  items: IBatchUpdateFamilyRecipeItem[];
}

/**
 * Batch delete family recipes request type
 */
export interface IBatchDeleteFamilyRecipesRequest {
  ids: string[];
}

// Batch operation response type
export interface IBatchRecipeOperationResult {
  recipes: IFamilyRecipeEntity[];
}

// Family recipe entity type (FamilyRecipeEntity)
export interface IFamilyRecipe {
  id: string;
  // source_recipe_id?: string | null;
  name: string;
  cooking_time?: number | null;
  servings?: number | null;
  images?: ImageList;
  instructions: string;
  ingredients: string;
  nutrition_info?: string | null;
  note?: string | null;
  reference_count: number;
  tags: string[];
  allergy_tags: string[];
}






export function convertFamilyRecipeEntityToItem(
  familyRecipe: IFamilyRecipeEntity,
): IFamilyRecipe {
  const isRecommandRecipe = familyRecipe.from === RecipeSource.recipe_recommend;
  const idPrefix = isRecommandRecipe ? RECOMMAND_RECIPE_PREFIX : "";
  return {
    id: `${idPrefix}${familyRecipe.id}`,
    // source_recipe_id: `${idPrefix}${familyRecipe.source_recipe_id}`,
    name: familyRecipe.name,
    cooking_time: familyRecipe.cooking_time,
    servings: familyRecipe.servings,
    // images: familyRecipe.images,
    instructions: (familyRecipe.instructions ?? []).map((instruction) => (`${instruction.step}. ${instruction.content}`)).join(';'),
    ingredients: (familyRecipe.ingredients ?? []).map((ingredient) => `${ingredient.name}: ${ingredient.unit} ${ingredient.quantity} , is_optional: ${ingredient.is_optional ? 'is optional' : ''}`).join(';'),
    // nutrition_info: familyRecipe.nutrition_info,
    // note: familyRecipe.note,
    reference_count: familyRecipe.reference_count,
    tags: familyRecipe.tags,
    allergy_tags: familyRecipe.allergy_tags,
  };
}