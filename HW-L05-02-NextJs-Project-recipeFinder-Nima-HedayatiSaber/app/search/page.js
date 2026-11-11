"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RecipeCard from "../../components/RecipeCard";
import SearchBar from "../../components/SearchBar";
import { PAGE_SIZE, searchRecipes } from "../../lib/api";
import styles from "./page.module.css";

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const diet = searchParams.get("diet") || "";
  const sort = searchParams.get("sort") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const [data, setData] = useState({ results: [], total: 0, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || PAGE_SIZE))),
    [data]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    searchRecipes({
      query,
      diet,
      sort,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then((result) => {
        if (!alive) return;
        setData(result);
      })
      .catch(() => {
        if (!alive) return;
        setError("نتیجه‌ای دریافت نشد. دوباره تلاش کنید.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [query, diet, sort, page]);

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  function goToPage(nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <>
      <h1 className="pageTitle">Search Results</h1>
      <p className="pageLead">
        {query ? `Results for “${query}”` : "Browse recipes and refine with filters."}
      </p>

      <div className={styles.topBar}>
        <SearchBar initialQuery={query} />
      </div>

      <div className={styles.filters}>
        <label>
          Diet
          <select value={diet} onChange={(e) => updateParam("diet", e.target.value)}>
            <option value="">All</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten free">Gluten Free</option>
            <option value="ketogenic">Ketogenic</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
            <option value="">Default</option>
            <option value="popularity">Popularity</option>
            <option value="time">Time</option>
          </select>
        </label>
      </div>

      {loading && <p className={styles.state}>Loading recipes...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && data.results.length === 0 && (
        <p className={styles.state}>No recipes found. Try another keyword.</p>
      )}

      <section className={styles.grid}>
        {data.results.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>

      {data.results.length > 0 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="container">
      <Suspense fallback={<p>Loading search...</p>}>
        <SearchInner />
      </Suspense>
    </main>
  );
}
