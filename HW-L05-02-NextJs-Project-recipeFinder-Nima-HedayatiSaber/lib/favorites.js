const KEY = "recipe-finder-favorites";

export function getFavorites() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFavorites(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isFavorite(id) {
  return getFavorites().some((item) => String(item.id) === String(id));
}

export function toggleFavorite(recipe) {
  const list = getFavorites();
  const exists = list.some((item) => String(item.id) === String(recipe.id));
  const next = exists
    ? list.filter((item) => String(item.id) !== String(recipe.id))
    : [
        {
          id: String(recipe.id),
          title: recipe.title,
          image: recipe.image,
        },
        ...list,
      ];
  saveFavorites(next);
  return { list: next, saved: !exists };
}

export function removeFavorite(id) {
  const next = getFavorites().filter((item) => String(item.id) !== String(id));
  saveFavorites(next);
  return next;
}
