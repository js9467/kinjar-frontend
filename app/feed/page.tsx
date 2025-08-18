// app/feed/page.tsx
import Feed from "@/components/Feed";
import { fetchPosts } from "@/lib/api";
import { KinjarPost } from "@/lib/types";

function sameMonthDay(ts: string | undefined, today: Date): boolean {
  if (!ts) return false;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export default async function FeedPage() {
  let posts: KinjarPost[] = [];
  try {
    posts = await fetchPosts("slaughterbecks");
  } catch (err) {
    console.error("Failed to fetch posts", err);
  }

  const today = new Date();

  const onThisDay = posts
    .filter((p) =>
      sameMonthDay((p as any).createdAt ?? (p as any).created_at, today)
    )
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">Family Feed</h1>
      <Feed initialPosts={posts} />
      {onThisDay.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">On This Day</h2>
          <ul className="space-y-2">
            {onThisDay.map((p) => (
              <li key={p.id} className="text-sm text-gray-700">
                {p.body ||
                  p.mediaUrl ||
                  (p as any).image_url ||
                  (p as any).linkUrl ||
                  (p as any).link_url ||
                  "Post"}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
