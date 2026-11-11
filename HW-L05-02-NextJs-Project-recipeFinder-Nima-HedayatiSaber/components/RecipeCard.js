import Link from "next/link";
import styles from "./RecipeCard.module.css";

export default function RecipeCard({ recipe }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={recipe.image} alt={recipe.title} />
      </div>
      <div className={styles.body}>
        <h3>{recipe.title}</h3>
        <p>{recipe.summary || "A tasty recipe ready for your kitchen."}</p>
        <Link href={`/recipes/view/?id=${recipe.id}`} className={styles.btn}>
          جزئیات بیشتر
        </Link>
      </div>
    </article>
  );
}
