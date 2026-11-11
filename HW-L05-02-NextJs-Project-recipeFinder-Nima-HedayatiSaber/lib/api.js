const SPOON_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || "";
const PAGE_SIZE = 9;

function hasSpoonacular() {
  return Boolean(SPOON_KEY && SPOON_KEY !== "your_api_key_here");
}

async function spoonacularSearch({ query, diet, sort, offset }) {
  const params = new URLSearchParams({
    apiKey: SPOON_KEY,
    number: String(PAGE_SIZE),
    offset: String(offset || 0),
    addRecipeInformation: "true",
  });

  if (query) params.set("query", query);
  if (diet) params.set("diet", diet);
  if (sort === "popularity") params.set("sort", "popularity");
  if (sort === "time") params.set("sort", "time");

  const res = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Spoonacular search failed");
  }

  const data = await res.json();
  return {
    total: data.totalResults || 0,
    pageSize: PAGE_SIZE,
    results: (data.results || []).map((item) => ({
      id: String(item.id),
      title: item.title,
      image: item.image,
      summary: stripHtml(item.summary || "").slice(0, 140),
      source: "spoonacular",
    })),
  };
}

async function spoonacularDetail(id) {
  const res = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOON_KEY}`
  );

  if (!res.ok) {
    throw new Error("Spoonacular detail failed");
  }

  const item = await res.json();
  const steps =
    item.analyzedInstructions?.[0]?.steps?.map((s) => s.step) ||
    (item.instructions
      ? stripHtml(item.instructions)
          .split(/\n+|(?<=\.)\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []);

  return {
    id: String(item.id),
    title: item.title,
    image: item.image,
    summary: stripHtml(item.summary || ""),
    readyInMinutes: item.readyInMinutes,
    servings: item.servings,
    ingredients: (item.extendedIngredients || []).map(
      (ing) => ing.original || ing.name
    ),
    steps,
    source: "spoonacular",
  };
}

async function mealDbSearch({ query, offset }) {
  const q = query || "pasta";
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
  );
  if (!res.ok) throw new Error("MealDB search failed");
  const data = await res.json();
  const all = data.meals || [];
  const start = offset || 0;
  const slice = all.slice(start, start + PAGE_SIZE);

  return {
    total: all.length,
    pageSize: PAGE_SIZE,
    demoMode: true,
    results: slice.map((item) => ({
      id: String(item.idMeal),
      title: item.strMeal,
      image: item.strMealThumb,
      summary: `${item.strArea || "International"} · ${item.strCategory || "Recipe"}`,
      source: "mealdb",
    })),
  };
}

async function mealDbDetail(id) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
  );
  if (!res.ok) throw new Error("MealDB detail failed");
  const data = await res.json();
  const item = data.meals?.[0];
  if (!item) throw new Error("Recipe not found");

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = item[`strIngredient${i}`];
    const measure = item[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push(`${measure || ""} ${name}`.trim());
    }
  }

  const steps = (item.strInstructions || "")
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: String(item.idMeal),
    title: item.strMeal,
    image: item.strMealThumb,
    summary: `${item.strArea || ""} ${item.strCategory || ""} recipe`.trim(),
    readyInMinutes: null,
    servings: null,
    ingredients,
    steps,
    source: "mealdb",
  };
}

export function stripHtml(html) {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchRecipes(options) {
  if (hasSpoonacular()) {
    try {
      return await spoonacularSearch(options);
    } catch (error) {
      console.warn(error);
    }
  }
  return mealDbSearch(options);
}

export async function getRecipeById(id) {
  if (hasSpoonacular() && !String(id).startsWith("m-")) {
    try {
      return await spoonacularDetail(id);
    } catch (error) {
      console.warn(error);
    }
  }
  return mealDbDetail(id);
}

export { PAGE_SIZE, hasSpoonacular };
