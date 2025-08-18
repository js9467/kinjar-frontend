"use client";

import { useState } from "react";

export default function NewCapsulePage() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Normalize and type the release fields
    const rawReleaseType = String(fd.get("release_type") ?? "").toLowerCase();
    const release_type: "date" | "age" | undefined =
      rawReleaseType === "date" || rawReleaseType === "age"
        ? (rawReleaseType as "date" | "age")
        : undefined;

    const rawReleaseValue = fd.get("release_value");
    const release_value =
      release_type === "age"
        ? rawReleaseValue
          ? Number(rawReleaseValue)
          : undefined
        : release_type === "date"
        ? rawReleaseValue
          ? String(rawReleaseValue)
          : undefined
        : undefined;

    const payload = {
      message: String(fd.get("message") || ""),
      media: [] as string[],
      release_type,
      release_value,
      for_member_id: String(fd.get("for_member_id") || "") || undefined,
      guardians: [] as string[],
    };

    // Call your API
    await fetch("/api/capsules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Create New Capsule</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <textarea
          name="message"
          placeholder="Message"
          style={{ minHeight: 100, padding: 8 }}
        />

        <select name="release_type" defaultValue="">
          <option value="">Select release type</option>
          <option value="date">Release on a date</option>
          <option value="age">Release at an age</option>
        </select>

        <input
          name="release_value"
          placeholder="Release value"
          style={{ padding: 8 }}
        />

        <input
          name="for_member_id"
          placeholder="For member ID"
          style={{ padding: 8 }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #222",
            background: "#111",
            color: "white",
          }}
        >
          Save Capsule
        </button>
      </form>
    </div>
  );
}
