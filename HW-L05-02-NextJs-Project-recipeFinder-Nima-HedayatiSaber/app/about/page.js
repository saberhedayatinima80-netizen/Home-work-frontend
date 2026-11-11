import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <main className="container">
      <h1 className="pageTitle">About</h1>
      <p className="pageLead">
        Recipe Finder helps you discover meals by ingredients, cuisine, or keywords.
      </p>

      <section className={styles.card}>
        <h2>HW-L05-02-NextJs-Project-recipeFinder-Nima-HedayatiSaber</h2>
        <p>
          This app searches recipes, shows details (ingredients + steps), and lets you save
          favorites in localStorage. It uses Spoonacular when an API key is set, otherwise a
          free demo data source so the project still runs.
        </p>
        <ul>
          <li>Home search experience</li>
          <li>Grid results with filters and pagination</li>
          <li>Recipe detail page</li>
          <li>Favorites with add/remove</li>
        </ul>
      </section>
    </main>
  );
}
