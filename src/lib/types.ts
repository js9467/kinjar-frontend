export type GlobalRole = 'ROOT_ADMIN' | 'FAMILY_ADMIN' | 'MEMBER';

export interface FamilyMembership {
  familyId: string;
  familySlug: string;
  familyName: string;
  memberId: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  globalRole: GlobalRole;
  memberships: FamilyMembership[];
}

export interface FamilyMemberProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  avatarColor: string;
}

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export type PostVisibility = 'family' | 'connections' | 'public';
export type PostStatus = 'approved' | 'pending' | 'flagged';

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  createdAt: string;
}

export interface FamilyPost {
  id: string;
  familyId: string;
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  createdAt: string;
  content: string;
  media?: MediaAttachment;
  visibility: PostVisibility;
  status: PostStatus;
  reactions: number;
  comments: PostComment[];
  tags: string[];
}

export interface PendingFamilySignup {
  id: string;
  familyName: string;
  adminName: string;
  adminEmail: string;
  message?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FamilyConnectionRequest {
  id: string;
  fromFamilyId: string;
  toFamilyId: string;
  requestedBy: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface FamilyProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  missionStatement: string;
  bannerImage: string;
  themeColor: string;
  heroImage: string;
  admins: string[];
  members: FamilyMemberProfile[];
  posts: FamilyPost[];
  connections: string[];
  storageUsedMb: number;
  invitesSentThisMonth: number;
  pendingMembers: FamilyMemberProfile[];
  highlights: string[]; // store post ids
}

export interface FamilyDirectoryCard {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  themeColor: string;
  connectionCount: number;
  publicHighlights: number;
}
