export type GlobalRole = 'ROOT_ADMIN' | 'FAMILY_ADMIN' | 'MEMBER';

export type FamilyRole = 'ADMIN' | 'ADULT' | 'CHILD_0_5' | 'CHILD_5_10' | 'CHILD_10_14' | 'CHILD_14_16' | 'CHILD_16_ADULT';

export interface FamilyMembership {
  familyId: string;
  familySlug: string;
  familyName: string;
  memberId: string;
  role: FamilyRole;
  joinedAt: string;
  invitedBy?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarUrl?: string;
  birthdate?: string;
  age?: number;
  bio?: string;
  phone?: string;
  globalRole: GlobalRole;
  memberships: FamilyMembership[];
  createdAt: string;
  lastLoginAt?: string;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  emailNotifications: {
    familyInvitationAccepted: boolean;
    connectionRequestAccepted: boolean;
    newFamilyMemberJoined: boolean;
    familyConnectionEstablished: boolean;
    newPostInConnectedFamily: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newComments: boolean;
    newReactions: boolean;
  };
}

export interface FamilyMemberProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: FamilyRole;
  avatarColor: string;
  avatarUrl?: string;
  birthdate?: string;
  age?: number;
  bio?: string; // Adding bio field for display and editing
  quote?: string; // Adding quote field for display and editing
  permissions?: RolePermissions;
  joinedAt: string;
  birthYear?: number;
}

export interface RolePermissions {
  can_post: boolean;
  can_post_public: boolean;
  can_comment: boolean;
  can_react: boolean;
  can_invite_members: boolean;
  can_manage_family: boolean;
  requires_approval: boolean;
  can_moderate: boolean;
}

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export type PostVisibility = 'family_only' | 'family_and_connections';
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
  familySlug?: string;  // For public feed
  familyName?: string;  // For public feed
  familyThemeColor?: string;  // For public feed
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  createdAt: string;
  title?: string;  // For enhanced posts
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
  posts?: FamilyPost[]; // Make posts optional since new families might not have any
  connections: string[];
  connectedFamilies: FamilyConnection[];
  storageUsedMb: number;
  invitesSentThisMonth: number;
  pendingMembers: FamilyMemberProfile[];
  highlights: string[]; // store post ids
  isPublic: boolean;
  subdomain: string;
  createdAt: string;
  ownerId: string;
}

export interface FamilyConnection {
  id: string;
  familyId: string;
  familyName: string;
  familySlug: string;
  connectedAt: string;
  canShareContent: boolean;
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

export interface CreateFamilyRequest {
  familyName: string;
  subdomain: string;
  description?: string;
  adminName: string;
  adminEmail: string;
  password: string;
  isPublic?: boolean;
}

export interface SubdomainInfo {
  isSubdomain: boolean;
  subdomain?: string;
  familySlug?: string;
  isRootDomain: boolean;
}

export interface InviteMemberRequest {
  email: string;
  name: string;
  role: FamilyRole;
  familyId: string;
}
