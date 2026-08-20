const PRODUCTS_KEY = "prs-products-cache";
const CART_KEY = "prs-cart";
const FILTERS_KEY = "prs-filters";

export function loadProductsCache() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProductsCache(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function loadFilters() {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    return raw
      ? JSON.parse(raw)
      : { search: "", category: "all", minPrice: 0, maxPrice: 1000 };
  } catch {
    return { search: "", category: "all", minPrice: 0, maxPrice: 1000 };
  }
}

export function saveFilters(filters) {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}
