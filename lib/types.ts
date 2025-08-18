// lib/types.ts

export type PostKind = "text" | "image" | "video" | "link";

/** Post as used by the UI. Supports both camelCase and snake_case. */
export interface KinjarPost {
  id: string;
  family?: string;
  author?: string;
  kind: PostKind;

  // preferred camelCase
  body?: string;
  mediaUrl?: string;
  linkUrl?: string;
  createdAt?: string;   // ISO
  updatedAt?: string;   // ISO

  reactions?: Record<string, number>;
  commentsCount?: number;
  public?: boolean;

  // snake_case aliases used by current UI
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  link_url?: string;
}

/** Minimal shape your CommentList uses. */
export interface Comment {
  id: string;
  post_id?: string;
  author?: string;
  kind: "text" | "image" | "video" | "link";
  body?: string;
  created_at: string;   // UI reads this directly
  // optional camelCase alias if backend ever returns it
  createdAt?: string;
}

/** Minimal shape your ReactionBar uses. */
export interface Reaction {
  id?: string;
  post_id?: string;
  emoji: string;        // UI filters by this
  user_id?: string;
  created_at?: string;
}

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  // backend snake_case alias
  avatar_url?: string;
}

export interface Capsule {
  id: string;
  title: string;
  opensAt: string;      // ISO (camelCase in UI)
  coverUrl?: string;

  // snake_case from backend
  opens_at?: string;
  cover_url?: string;
}
