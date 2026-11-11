"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  initialQuery = "",
  large = false,
  placeholder = "مواد اولیه یا نام غذا را جستجو کنید...",
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set("query", q);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form className={`${styles.form} ${large ? styles.large : ""}`} onSubmit={onSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search recipes"
      />
      <button type="submit">Search</button>
    </form>
  );
}
