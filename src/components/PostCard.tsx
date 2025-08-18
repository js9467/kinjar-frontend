import { Post } from "@prisma/client";
import { fmtDate } from "../utils/dates";

function mediaUrl(key?: string) {
  if (!key) return "";
  const base = process.env.KINJAR_MEDIA_BASE || "";
  return base ? `${base}/${key}` : `/${key}`; // if you later add a proxy, update here
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article style={{ borderBottom:"1px solid #eee", padding:"12px 0" }}>
      <div style={{ opacity:0.7, fontSize:12 }}>{fmtDate(post.publishedAt)}</div>
      {post.title && <h3 style={{ margin:"6px 0" }}>{post.title}</h3>}
      {post.body && <p>{post.body}</p>}

      {post.mediaKey && post.mediaType?.startsWith("image/") && (
        <img
          src={mediaUrl(post.mediaKey)}
          alt=""
          style={{ width:"100%", maxHeight:480, objectFit:"contain", marginTop:8 }}
        />
      )}
      {post.mediaKey && post.mediaType?.startsWith("video/") && (
        <video style={{ width:"100%", marginTop:8 }} controls src={mediaUrl(post.mediaKey)} />
      )}

      {!post.isPublic && <div style={{ fontSize:12, opacity:0.6 }}>Private</div>}
      {post.unlockAt && <div style={{ fontSize:12, opacity:0.6 }}>Unlocks: {fmtDate(post.unlockAt)}</div>}
    </article>
  );
}

export { PostCard };
