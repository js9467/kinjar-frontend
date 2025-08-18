// lib/types.ts

export type PostKind = 'text' | 'image' | 'video' | 'link';

export interface KinjarPost {
  id: string;
  family: string;
  author: string;
  kind: PostKind;
  body?: string;
  mediaUrl?: string;
  linkUrl?: string;
  createdAt: string;          // ISO
  updatedAt?: string;         // ISO
  reactions?: Record<string, number>;
  commentsCount?: number;
}

export interface NewPostPayload {
  kind: PostKind;
  body?: string;
  mediaUrl?: string;
  linkUrl?: string;
  author: string;
}

export interface KinjarComment {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: string;          // ISO
}

export interface ReactionSummary {
  [reaction: string]: number; // e.g. { like: 2, heart: 5 }
}

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Capsule {
  id: string;
  title: string;
  opensAt: string;            // ISO
  coverUrl?: string;
}
