"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../../lib/favorites";
import styles from "./page.module.css";

export default function FavoritesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getFavorites());
  }, []);

  function onRemove(id) {
    setItems(removeFavorite(id));
  }

  return (
    <main className="container">
      <h1 className="pageTitle">Favorites</h1>
      <p className="pageLead">دستورهایی که ذخیره کردی اینجاست.</p>

      {items.length === 0 ? (
        <div className={styles.empty}>
          No favorites yet. Start saving your favorite recipes!
          <Link href="/">Go search recipes</Link>
        </div>
      ) : (
        <section className={styles.list}>
          {items.map((item) => (
            <article key={item.id} className={styles.item}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} />
              <div className={styles.info}>
                <h3>
                  <Link href={`/recipes/view/?id=${item.id}`}>{item.title}</Link>
                </h3>
                <button type="button" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
