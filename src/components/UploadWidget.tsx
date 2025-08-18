// src/components/UploadWidget.tsx
"use client";

import { useRef, useState } from "react";

export default function UploadWidget() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [msg, setMsg] = useState<string>("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsg("Requesting presign...");
    const pres = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: f.name, contentType: f.type || "application/octet-stream" }),
    }).then(r => r.json());

    if (!pres.ok) { setMsg(pres.error || "Presign failed"); return; }

    const { put: { url, headers }, key, maxMB } = pres;
    if (f.size > maxMB * 1024 * 1024) { setMsg(`File too large (max ${maxMB}MB)`); return; }

    setMsg("Uploading to storage...");
    const ok = await uploadWithProgress(url, f, setProgress, headers?.["Content-Type"] || f.type || "application/octet-stream");
    if (!ok) { setMsg("Upload failed"); return; }

    setMsg("Saving post...");
    const kind = f.type.startsWith("video/") ? "VIDEO" : (f.type.startsWith("image/") ? "PHOTO" : "TEXT");
    const save = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind, mediaKey: key, mediaType: f.type, mediaSize: f.size,
        isPublic: true
      }),
    }).then(r=>r.json());

    if (!save.ok) { setMsg(save.error || "Post save failed"); return; }
    setMsg("Done!");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
      <p><b>Upload a memory</b></p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFile}
      />
      {progress > 0 && <p>Uploading: {progress}%</p>}
      {!!msg && <p>{msg}</p>}
    </div>
  );
}

async function uploadWithProgress(url: string, file: File, onProg: (n:number)=>void, contentType: string) {
  const resp = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
  if (!resp.ok) return false;
  onProg(100);
  return true;
}
