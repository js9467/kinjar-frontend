import { cookies, headers } from "next/headers";
import { getFeed } from "../../../lib/api";
import NewPostForm from "../../../components/NewPostForm";
import PostCard from "../../../components/PostCard";
import { resolveFamily } from "../../../lib/family";

export default async function FeedPage() {
  const hdrs = headers();
  const host = hdrs.get("host") || "";
  const familyCookie = cookies().get("family")?.value;
  const family = resolveFamily(host, familyCookie, process.env.KINJAR_LOCAL_FAMILY) || "demo";

  const posts = await getFeed(family);

  return (
    <div>
      <h1>{family} — Private Feed</h1>
      <NewPostForm family={family} />
      <div style={{ marginTop: 16 }}>
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}