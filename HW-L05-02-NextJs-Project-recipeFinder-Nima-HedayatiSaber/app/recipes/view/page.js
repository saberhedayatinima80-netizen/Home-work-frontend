"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getRecipeById } from "../../../lib/api";
import { isFavorite, toggleFavorite } from "../../../lib/favorites";
import styles from "./page.module.css";

function RecipeDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Recipe id is missing.");
      return;
    }

    let alive = true;
    setLoading(true);

    getRecipeById(id)
      .then((data) => {
        if (!alive) return;
        setRecipe(data);
        setSaved(isFavorite(data.id));
      })
      .catch(() => {
        if (!alive) return;
        setError("Recipe not found.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  function onToggleFavorite() {
    if (!recipe) return;
    const result = toggleFavorite(recipe);
    setSaved(result.saved);
  }

  if (loading) {
    return <p>Loading recipe...</p>;
  }

  if (error || !recipe) {
    return (
      <>
        <p>{error || "Recipe not found."}</p>
        <Link href="/">Back home</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/search" className={styles.back}>
        ← Back to results
      </Link>

      <article className={styles.article}>
        <div className={styles.heroImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.image} alt={recipe.title} />
        </div>

        <div className={styles.content}>
          <h1>{recipe.title}</h1>
          <p className={styles.summary}>{recipe.summary}</p>

          <div className={styles.meta}>
            <span>
              ⏱ {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Time varies"}
            </span>
            <span>
              🍽 {recipe.servings ? `${recipe.servings} servings` : "Servings vary"}
            </span>
          </div>

          <button
            type="button"
            className={`${styles.favBtn} ${saved ? styles.saved : ""}`}
            onClick={onToggleFavorite}
          >
            {saved ? "Saved in Favorites ✓" : "ذخیره در علاقه‌مندی‌ها"}
          </button>

          <section className={styles.section}>
            <h2>مواد لازم</h2>
            <ul>
              {recipe.ingredients.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>مراحل تهیه</h2>
            <ol>
              {recipe.steps.map((step, index) => (
                <li key={`${index}-${step.slice(0, 12)}`}>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </>
  );
}

export default function RecipeDetailPage() {
  return (
    <main className="container">
      <Suspense fallback={<p>Loading recipe...</p>}>
        <RecipeDetailInner />
      </Suspense>
    </main>
  );
}
