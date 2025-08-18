import { headers, cookies } from "next/headers";
import { getFeed } from "@/lib/api";
import ReactionBar from "@/components/ReactionBar";
import CommentList from "@/components/CommentList";
import NewPostForm from "@/components/NewPostForm";

function sameMonthDay(a: string, b: Date) {
  const d = new Date(a); return d.getUTCMonth()===b.getUTCMonth() && d.getUTCDate()===b.getUTCDate();
}

export default async function FeedPage() {
  const fam = cookies().get("family")?.value || "slaughterbecks";
  const posts = await getFeed(fam);
  const today = new Date();
  const onThisDay = posts.filter(p => sameMonthDay(p.created_at, today)).slice(0,3);

  return (
    <div className="grid">
      <section className="card">
        <div className="card-body">
          <h2 className="card-title">Private feed</h2>
          <div className="fade" style={{ marginBottom:12 }}>Posting as <b>{fam}</b></div>
          <NewPostForm family={fam} />
        </div>
        <div style={{ padding:"0 18px 18px" }}>
          {posts.map((p:any)=>(
            <article key={p.id} className="card" style={{ background:"#12161e", margin:"12px 0" }}>
              <div className="card-body">
                <div className="meta">{new Date(p.created_at).toLocaleString()} • {p.public ? "Public" : "Private"}</div>
                {p.kind==="text" && p.body && <p style={{ fontSize:16, margin:"8px 0 0" }}>{p.body}</p>}
                {p.kind==="image" && p.image_url && (
                  <img src={p.image_url} alt="" style={{ width:"100%", borderRadius:12, marginTop:10, border:"1px solid var(--line)" }}/>
                )}
                <div style={{ marginTop:10 }}>
                  <ReactionBar postId={p.id}/>
                  <CommentList postId={p.id}/>
                </div>
              </div>
            </article>
          ))}
          {posts.length===0 && <div className="fade">No posts yet — share a photo or note above.</div>}
        </div>
      </section>

      <aside style={{ display:"grid", gap:16 }}>
        <section className="card">
          <div className="card-body">
            <h3 className="card-title">On this day</h3>
            {onThisDay.length===0 && <div className="fade">No past memories for today yet.</div>}
            {onThisDay.map((p:any)=>(
              <div key={p.id} style={{ padding:"10px 0", borderBottom:"1px solid var(--line)" }}>
                <div className="meta">{new Date(p.created_at).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })}</div>
                {p.kind==="text" && <div>{p.body}</div>}
                {p.kind==="image" && p.image_url && <img src={p.image_url} style={{ width:"100%", borderRadius:10, marginTop:6, border:"1px solid var(--line)" }}/>}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h3 className="card-title">Tips</h3>
            <ul style={{ margin:0, paddingLeft:18 }}>
              <li>Kids can react with emojis in <a href="/kids">Kids</a></li>
              <li>Create a message to their future self in <a href="/capsules">Capsules</a></li>
              <li>Toggle “public” to share highlights on your family page</li>
            </ul>
          </div>
        </section>
      </aside>
    </div>
  );
}
