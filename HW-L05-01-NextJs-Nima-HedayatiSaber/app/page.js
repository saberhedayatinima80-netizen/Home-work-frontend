import Link from "next/link";
import styles from "./page.module.css";

async function getPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  const posts = await res.json();
  return posts.slice(0, 5);
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>HW-L05-01 · Next.js</p>
        <h1>Simple Blog</h1>
        <p className={styles.subtitle}>
          First 5 posts from JSONPlaceholder
        </p>
      </header>

      <section className={styles.list}>
        {posts.map((post) => (
          <article key={post.id} className={styles.card}>
            <span className={styles.badge}>Post #{post.id}</span>
            <h2>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p className={styles.excerpt}>
              {post.body.length > 120
                ? `${post.body.slice(0, 120)}...`
                : post.body}
            </p>
            <Link href={`/posts/${post.id}`} className={styles.readMore}>
              Read more →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
