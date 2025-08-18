// lib/types.ts

export type PostKind = 'text' | 'image' | 'video' | 'link';

export interface KinjarPost {
  id: string;
  family: string;           // tenant key sent via X-Family
  author: string;
  kind: PostKind;
  body?: string;            // for text/link
  mediaUrl?: string;        // for image/video
  linkUrl?: string;         // for link kind
  createdAt: string;        // ISO string
  updatedAt?: string;       // ISO string
  reactions?: Record<string, number>; // e.g., { like: 3, heart: 2 }
  commentsCount?: number;
}

export interface KinjarComment {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: string;        // ISO string
}

export interface ReactionPayload {
  postId: string;
  reaction: string;         // e.g., "like" | "heart"
  delta: 1 | -1;
}
