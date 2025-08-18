"use client";

import { useState } from "react";

export default function MembersPage() {
  return (
    <section>
      <h1 style={{ marginBottom: 12 }}>Members</h1>
      <AddMember />
    </section>
  );
}

function AddMember() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: point to your API route
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    setName("");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        required
        style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
        style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
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
        Add member
      </button>
    </form>
  );
}
