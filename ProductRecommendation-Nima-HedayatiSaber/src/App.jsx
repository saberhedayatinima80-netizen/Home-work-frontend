import { useEffect, useMemo, useState } from "react";
import ProductCard from "./components/ProductCard";
import Filters from "./components/Filters";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import { useDebounce } from "./hooks/useDebounce";
import {
  loadCart,
  loadFilters,
  loadProductsCache,
  saveCart,
  saveFilters,
  saveProductsCache,
} from "./utils/storage";

function App() {
  const cached = loadProductsCache();
  const savedFilters = loadFilters();

  const [products, setProducts] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState(loadCart);

  const [search, setSearch] = useState(savedFilters.search || "");
  const [category, setCategory] = useState(savedFilters.category || "all");
  const [minPrice, setMinPrice] = useState(savedFilters.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState(savedFilters.maxPrice ?? 1000);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        saveProductsCache(data);
        setError("");
      } catch (err) {
        if (!cached) setError("Could not load products. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveFilters({ search, category, minPrice, maxPrice });
  }, [search, category, minPrice, maxPrice]);

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.title
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchCategory =
        category === "all" || product.category === category;
      const matchPrice =
        product.price >= minPrice && product.price <= maxPrice;
      return matchSearch && matchCategory && matchPrice;
    });
  }, [products, debouncedSearch, category, minPrice, maxPrice]);

  const related = useMemo(() => {
    if (!selected) return [];
    return products.filter(
      (p) => p.category === selected.category && p.id !== selected.id
    );
  }, [products, selected]);

  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          qty: 1,
        },
      ];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-violet-700 px-4 py-5 text-white shadow">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold">
            Product Recommendation System
          </h1>
          <p className="text-sm text-violet-100">
            Nima HedayatiSaber · FakeStoreAPI · Advanced Features
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Filters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            categories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
          />
        </aside>

        <section className="space-y-4">
          {selected && (
            <ProductDetail
              product={selected}
              related={related}
              onSelect={setSelected}
              onAddToCart={addToCart}
              onClose={() => setSelected(null)}
            />
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              Products ({filtered.length})
            </h2>
            {loading && (
              <span className="text-sm text-violet-600">Loading...</span>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && filtered.length === 0 ? (
            <p className="rounded-lg bg-white px-4 py-8 text-center text-gray-500 shadow-sm">
              No products found with current filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelected}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
