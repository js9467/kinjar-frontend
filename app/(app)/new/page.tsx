// app/(app)/new/page.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

type PresignResponse = {
  ok: boolean;
  key: string;
  presign: { url: string; fields: Record<string, string> };
  error?: string;
};

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [visibleAt, setVisibleAt] = useState<string>(""); // datetime-local
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const videoSelected = useMemo(() => !!file && file.type.startsWith("video/"), [file]);
  const imageSelected = useMemo(() => !!file && file.type.startsWith("image/"), [file]);
  const mediaUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickFile = useCallback(() => fileInputRef.current?.click(), []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setProgress(0);
    setError(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    setFile(f);
    setProgress(0);
    setError(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Upload with XHR so we can track progress (fetch doesn't support upload progress)
  async function uploadToR2WithXHR(url: string, fields: Record<string, string>, f: File) {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", f);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.send(formData);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    setProgress(0);

    try {
      let mediaKey: string | undefined;
      let mediaMime: string | undefined;

      if (file) {
        // 1) ask our Next.js route to presign (it will forward to Fly with the API key)
        const presign: PresignResponse = await fetch("/api/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
          cache: "no-store",
        }).then((r) => r.json());

        if (!presign.ok) {
          throw new Error(presign.error || "Failed to get upload URL");
        }

        // 2) direct upload to R2 with progress
        await uploadToR2WithXHR(presign.presign.url, presign.presign.fields, file);

        mediaKey = presign.key;
        mediaMime = file.type;
      }

      // 3) Save the post in your DB (you should have /api/posts implemented server-side)
      const save = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          body: body.trim() || null,
          mediaKey,
          mediaMime,
          isPublic,
          visibleAt: visibleAt || undefined, // ISO-like string from input[type=datetime-local]
        }),
        cache: "no-store",
      });

      if (!save.ok) {
        const msg = await save.text().catch(() => "");
        throw new Error(`Saving post failed: ${msg || save.status}`);
      }

      setSuccess("Posted! Redirecting…");
      // Optional: redirect to your feed page
      setTimeout(() => {
        window.location.href = "/feed";
      }, 600);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">New Daily Post</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="text"
          className="border rounded-lg px-3 py-2"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />

        <textarea
          className="border rounded-lg px-3 py-2 min-h-[140px]"
          placeholder="Say something…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
        />

        {/* Media picker */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="rounded-xl border border-dashed p-4 flex flex-col items-center gap-3 text-center"
        >
          <div className="text-sm opacity-80">
            Drag & drop a photo/video, or
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onPickFile}
              className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
              disabled={submitting}
            >
              Choose from device
            </button>
            <label className="rounded-lg border px-3 py-1.5 cursor-pointer hover:bg-gray-50">
              Take photo/video
              {/* capture hints mobile camera; accept images & videos */}
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={onFileChange}
                disabled={submitting}
              />
            </label>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={onFileChange}
            disabled={submitting}
          />

          {file && (
            <div className="w-full mt-3">
              <div className="text-xs mb-1 opacity-70">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB)
              </div>
              <div className="rounded-lg overflow-hidden border">
                {imageSelected && mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl} alt="preview" className="w-full object-contain max-h-[320px]" />
                )}
                {videoSelected && mediaUrl && (
                  <video
                    controls
                    className="w-full max-h-[360px]"
                    src={mediaUrl}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visibility + Time Capsule */}
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={submitting}
            />
            <span>Make public</span>
          </label>

          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap">Time-capsule unlock:</span>
            <input
              type="datetime-local"
              className="border rounded-lg px-2 py-1 w-full"
              value={visibleAt}
              onChange={(e) => setVisibleAt(e.target.value)}
              disabled={submitting}
            />
          </label>
        </div>

        {/* Progress bar */}
        {submitting && file && (
          <div className="w-full">
            <div className="text-xs mb-1 opacity-70">Uploading: {progress}%</div>
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className="h-2 bg-black rounded"
                style={{ width: `${progress}%`, transition: "width 120ms linear" }}
              />
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border px-4 py-2"
            onClick={() => {
              setTitle("");
              setBody("");
              setFile(null);
              setIsPublic(false);
              setVisibleAt("");
              setError(null);
              setSuccess(null);
              setProgress(0);
            }}
            disabled={submitting}
          >
            Clear
          </button>
          <button
            type="submit"
            className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {/* Optional: show how the public URL might render if using a CDN base */}
      {process.env.NEXT_PUBLIC_MEDIA_BASE && file && (
        <p className="text-xs mt-4 opacity-70">
          Note: uploaded media will be served from{" "}
          <code>{process.env.NEXT_PUBLIC_MEDIA_BASE}</code> with the saved key.
        </p>
      )}
    </div>
  );
}
