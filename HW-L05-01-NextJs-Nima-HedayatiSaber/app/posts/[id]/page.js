import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

async function getPost(id) {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateStaticParams() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  return posts.slice(0, 5).map((post) => ({
    id: String(post.id),
  }));
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.body.slice(0, 140),
  };
}

export default async function PostDetailPage({ params }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        ← Back to posts
      </Link>

      <article className={styles.article}>
        <span className={styles.badge}>Post #{post.id}</span>
        <h1>{post.title}</h1>
        <p className={styles.body}>{post.body}</p>
      </article>
    </main>
  );
}
