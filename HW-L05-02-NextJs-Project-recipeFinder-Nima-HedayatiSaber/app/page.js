import SearchBar from "../components/SearchBar";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.overlay}>
        <p className={styles.eyebrow}>Fresh ideas for every kitchen</p>
        <h1>Recipe Finder</h1>
        <p className={styles.subtitle}>
          مواد اولیه، نوع غذا یا کلمات کلیدی را بنویس و دستور پخت مناسب را پیدا کن.
        </p>
        <SearchBar large />
        <div className={styles.hints}>
          <span>pasta</span>
          <span>chicken</span>
          <span>salad</span>
          <span>soup</span>
        </div>
      </div>
    </main>
  );
}
