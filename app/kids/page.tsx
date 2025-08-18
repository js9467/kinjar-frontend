import { getFeed, getMembers } from "../../src/lib/api";
import ReactionBar from "../../src/components/ReactionBar";
import PostCard from "../../src/components/PostCard";

export default async function KidsPage(){
  // show latest 5 posts + reaction buttons; no free-form text yet
  const members = await getMembers();
  const posts = (await getFeed((globalThis as any)?.family || ""))?.slice(0,5) ?? [];
  return (
    <main style={{ maxWidth:760, margin:"24px auto", padding:"0 16px" }}>
      <h1>Kids Zone</h1>
      <p>React with emojis! (Text comments are off here.)</p>
      <div style={{ display:"grid", gap:12 }}>
        {posts.map((p:any)=>(
          <div key={p.id} style={{ border:"1px dashed #ddd", padding:8, borderRadius:8 }}>
            <PostCard post={p}/>
            <ReactionBar postId={p.id}/>
          </div>
        ))}
      </div>
    </main>
  );
}