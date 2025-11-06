/*
 * Sample Data for Development and Testing
 * 
 * This file contains mock data for development purposes.
 * In production, all data comes from the live API endpoints.
 * This data is only used when the API is unavailable or for component testing.
 */

import {
  AuthUser,
  FamilyConnectionRequest,
  FamilyMemberProfile,
  FamilyPost,
  FamilyProfile,
  PendingFamilySignup,
} from './types';

const randomId = () => Math.random().toString(36).slice(2, 10);

const createMember = (
  data: Omit<FamilyMemberProfile, 'id'> & { id?: string }
): FamilyMemberProfile => ({
  id: data.id ?? randomId(),
  ...data,
});

const now = new Date();

const williamsMembers: FamilyMemberProfile[] = [
  {
    id: 'member-williams-admin',
    userId: 'user-williams-admin',
    name: 'Diana Williams',
    email: 'diana@williams.family',
    role: 'ADMIN',
    avatarColor: '#f97316',
    joinedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'member-williams-lucas',
    userId: 'user-williams-lucas',
    name: 'Lucas Williams',
    email: 'lucas@williams.family',
    role: 'ADULT',
    avatarColor: '#38bdf8',
    joinedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'member-williams-nora',
    userId: 'user-williams-nora',
    name: 'Nora Williams',
    email: 'nora@williams.family',
    role: 'CHILD_14_16',
    avatarColor: '#facc15',
    joinedAt: '2024-01-03T00:00:00Z',
  },
];

const fernandezMembers: FamilyMemberProfile[] = [
  {
    id: 'member-fernandez-admin',
    userId: 'user-fernandez-admin',
    name: 'Miguel Fernandez',
    email: 'miguel@fernandez.family',
    role: 'ADMIN',
    avatarColor: '#34d399',
    joinedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'member-fernandez-elena',
    userId: 'user-fernandez-elena',
    name: 'Elena Fernandez',
    email: 'elena@fernandez.family',
    role: 'ADULT',
    avatarColor: '#60a5fa',
    joinedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'member-fernandez-alejandro',
    userId: 'user-fernandez-alejandro',
    name: 'Alejandro Fernandez',
    email: 'alejandro@fernandez.family',
    role: 'CHILD_10_14',
    avatarColor: '#f472b6',
    joinedAt: '2024-01-03T00:00:00Z',
  },
];

const slaughterbeckMembers: FamilyMemberProfile[] = [
  {
    id: 'member-slaughterbeck-admin',
    userId: 'user-root-admin',
    name: 'Admin Slaughterbeck',
    email: 'admin.slaughterbeck@gmail.com',
    role: 'ADMIN',
    avatarColor: '#a855f7',
    joinedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'member-slaughterbeck-zoe',
    userId: 'user-slaughterbeck-zoe',
    name: 'Zoe Slaughterbeck',
    email: 'zoe@slaughterbeck.family',
    role: 'CHILD_16_ADULT',
    avatarColor: '#fbbf24',
    joinedAt: '2024-01-02T00:00:00Z',
  },
];

const williamsPosts: FamilyPost[] = [
  {
    id: 'post-williams-1',
    familyId: 'family-williams',
    authorId: 'member-williams-admin',
    authorName: 'Diana Williams',
    authorAvatarColor: '#f97316',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
    content:
      'Recap from our family reunion last weekend! The kids loved the scavenger hunt and Grandpa told the best stories.',
    media: {
      type: 'image',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2Ij5TYW1wbGUgUGhvdG88L3RleHQ+Cjwvc3ZnPg==',
      alt: 'Family reunion picnic in the park',
    },
    visibility: 'family_and_connections',
    status: 'approved',
    reactions: 42,
    comments: [
      {
        id: 'comment-williams-1',
        authorId: 'member-williams-lucas',
        authorName: 'Lucas Williams',
        authorAvatarColor: '#38bdf8',
        content: 'Still laughing about the photo booth props! 😂',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
    tags: ['reunion', 'traditions'],
  },
  {
    id: 'post-williams-2',
    familyId: 'family-williams',
    authorId: 'member-williams-lucas',
    authorName: 'Lucas Williams',
    authorAvatarColor: '#38bdf8',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    content: 'Coach said Nora crushed her first soccer match. ⚽️ Proud big brother moment!',
    visibility: 'family_and_connections',
    status: 'approved',
    reactions: 18,
    comments: [],
    tags: ['sports', 'milestone'],
  },
  {
    id: 'post-williams-3',
    familyId: 'family-williams',
    authorId: 'member-williams-admin',
    authorName: 'Diana Williams',
    authorAvatarColor: '#f97316',
    createdAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    content: 'Should we make the July 4th block party invite public? Drafting details now.',
    visibility: 'family_and_connections',
    status: 'pending',
    reactions: 3,
    comments: [],
    tags: ['planning'],
  },
];

const fernandezPosts: FamilyPost[] = [
  {
    id: 'post-fernandez-1',
    familyId: 'family-fernandez',
    authorId: 'member-fernandez-admin',
    authorName: 'Miguel Fernandez',
    authorAvatarColor: '#34d399',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
    content: 'Abuela is turning 90 next month! Working on a tribute video, drop your clips here.',
    media: {
      type: 'video',
      url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
      alt: 'Birthday tribute video montage preview',
    },
    visibility: 'family_only',
    status: 'approved',
    reactions: 27,
    comments: [
      {
        id: 'comment-fernandez-1',
        authorId: 'member-fernandez-elena',
        authorName: 'Elena Fernandez',
        authorAvatarColor: '#60a5fa',
        content: 'Uploading some photos from her youth right now! 💜',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    tags: ['celebration'],
  },
  {
    id: 'post-fernandez-2',
    familyId: 'family-fernandez',
    authorId: 'member-fernandez-alejandro',
    authorName: 'Alejandro Fernandez',
    authorAvatarColor: '#f472b6',
    createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
    content: 'Sharing highlight reel from Sofia’s robotics competition – she placed first! 🤖',
    visibility: 'family_and_connections',
    status: 'approved',
    reactions: 61,
    comments: [],
    tags: ['achievement'],
  },
];

const slaughterbeckPosts: FamilyPost[] = [
  {
    id: 'post-slaughterbeck-1',
    familyId: 'family-slaughterbeck',
    authorId: 'member-slaughterbeck-admin',
    authorName: 'Admin Slaughterbeck',
    authorAvatarColor: '#a855f7',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    content: 'Kicked off the beta for the new Kinjar admin tooling. Send feedback as you explore!',
    visibility: 'family_and_connections',
    status: 'approved',
    reactions: 11,
    comments: [],
    tags: ['product'],
  },
];

export const initialFamilies: FamilyProfile[] = [
  {
    id: 'family-williams',
    slug: 'williams-clan',
    name: 'Williams Clan',
    description: 'Pacific Northwest crew keeping grandparents looped in on every soccer goal and science fair.',
    missionStatement: 'Document the everyday joy and celebrate big and small wins together.',
    bannerImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjNjM2NmYxIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4Ij5XaWxsaWFtcyBDbGFuPC90ZXh0Pgo8L3N2Zz4=',
    themeColor: '#6366f1',
    heroImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjOGI1Y2Y2Ii8+Cjx0ZXh0IHg9IjcwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2Ij5GYW1pbHkgUGhvdG88L3RleHQ+Cjwvc3ZnPg==',
    admins: ['member-williams-admin'],
    members: williamsMembers,
    posts: williamsPosts,
    connections: ['family-fernandez'],
    connectedFamilies: [
      {
        id: 'conn-williams-fernandez',
        familyId: 'family-fernandez',
        familyName: 'Fernandez Familia',
        familySlug: 'fernandez-familia',
        connectedAt: '2024-01-15T00:00:00Z',
        canShareContent: true,
      }
    ],
    storageUsedMb: 1832,
    invitesSentThisMonth: 12,
    pendingMembers: [
      {
        id: 'pending-williams-sasha',
        name: 'Sasha Martin',
        email: 'sasha@martin.family',
        role: 'ADULT',
        avatarColor: '#f97316',
        joinedAt: '2024-01-10T00:00:00Z',
      },
    ],
    highlights: ['post-williams-1'],
    isPublic: true,
    subdomain: 'williams-clan',
    createdAt: '2024-01-01T00:00:00Z',
    ownerId: 'user-williams-admin',
  },
  {
    id: 'family-fernandez',
    slug: 'fernandez-familia',
    name: 'Fernandez Familia',
    description: 'East coast foodies sharing recipes, celebrations, and music across generations.',
    missionStatement: 'Keep our heritage alive by sharing traditions and stories weekly.',
    bannerImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMjJjNTVlIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4Ij5GZXJuYW5kZXogRmFtaWx5PC90ZXh0Pgo8L3N2Zz4=',
    themeColor: '#22c55e',
    heroImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjMTZhMzRhIi8+Cjx0ZXh0IHg9IjcwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2Ij5GYW1pbHkgUGhvdG88L3RleHQ+Cjwvc3ZnPg==',
    admins: ['member-fernandez-admin'],
    members: fernandezMembers,
    posts: fernandezPosts,
    connections: ['family-williams'],
    connectedFamilies: [
      {
        id: 'conn-fernandez-williams',
        familyId: 'family-williams',
        familyName: 'Williams Clan',
        familySlug: 'williams-clan',
        connectedAt: '2024-01-15T00:00:00Z',
        canShareContent: true,
      }
    ],
    storageUsedMb: 2048,
    invitesSentThisMonth: 8,
    pendingMembers: [],
    highlights: ['post-fernandez-2'],
    isPublic: true,
    subdomain: 'fernandez-familia',
    createdAt: '2024-01-02T00:00:00Z',
    ownerId: 'user-fernandez-admin',
  },
  {
    id: 'family-slaughterbeck',
    slug: 'slaughterbeck',
    name: 'Slaughterbeck Family',
    description: 'Testing ground for every Kinjar feature. Early adopters and product champions.',
    missionStatement: 'Build and test the tools families need to feel connected.',
    bannerImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjYTg1NWY3Ii8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4Ij5TbGF1Z2h0ZXJiZWNrIEZhbWlseTwvdGV4dD4KPHN2Zz4=',
    themeColor: '#a855f7',
    heroImage:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjOWMzNGY0Ii8+Cjx0ZXh0IHg9IjcwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2Ij5GYW1pbHkgUGhvdG88L3RleHQ+Cjwvc3ZnPg==',
    admins: ['member-slaughterbeck-admin'],
    members: slaughterbeckMembers,
    posts: slaughterbeckPosts,
    connections: ['family-williams'],
    connectedFamilies: [
      {
        id: 'conn-slaughterbeck-williams',
        familyId: 'family-williams',
        familyName: 'Williams Clan',
        familySlug: 'williams-clan',
        connectedAt: '2024-01-20T00:00:00Z',
        canShareContent: true,
      }
    ],
    storageUsedMb: 956,
    invitesSentThisMonth: 3,
    pendingMembers: [],
    highlights: ['post-slaughterbeck-1'],
    isPublic: false,
    subdomain: 'slaughterbeck',
    createdAt: '2024-01-03T00:00:00Z',
    ownerId: 'user-root-admin',
  },
];

export const initialPendingSignups: PendingFamilySignup[] = [
  {
    id: 'signup-nguyen',
    familyName: 'Nguyen Family Collective',
    adminName: 'Kim Nguyen',
    adminEmail: 'kim@nguyen.family',
    message: 'We have a huge extended family that needs a private space to collaborate on reunions.',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
    status: 'pending',
  },
  {
    id: 'signup-johnson',
    familyName: 'Johnson Crew',
    adminName: 'Andre Johnson',
    adminEmail: 'andre@johnson.family',
    message: 'Looking to migrate our Facebook group here for better privacy.',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 80).toISOString(),
    status: 'pending',
  },
];

export const initialConnectionRequests: FamilyConnectionRequest[] = [
  {
    id: 'connection-fernandez-to-slaughterbeck',
    fromFamilyId: 'family-fernandez',
    toFamilyId: 'family-slaughterbeck',
    requestedBy: 'member-fernandez-admin',
    createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
    status: 'pending',
    notes: 'We would love to collaborate on the oral history project.',
  },
];

export const initialUsers: AuthUser[] = [
  {
    id: 'user-root-admin',
    name: 'Admin Slaughterbeck',
    email: 'admin.slaughterbeck@gmail.com',
    avatarColor: '#a855f7',
    globalRole: 'ROOT_ADMIN',
    memberships: [
      {
        familyId: 'family-slaughterbeck',
        familySlug: 'slaughterbeck',
        familyName: 'Slaughterbeck Family',
        memberId: 'member-slaughterbeck-admin',
        role: 'ADMIN',
        joinedAt: '2024-01-01T00:00:00Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-25T10:30:00Z',
  },
  {
    id: 'user-williams-admin',
    name: 'Diana Williams',
    email: 'diana@williams.family',
    avatarColor: '#f97316',
    globalRole: 'FAMILY_ADMIN',
    memberships: [
      {
        familyId: 'family-williams',
        familySlug: 'williams-clan',
        familyName: 'Williams Clan',
        memberId: 'member-williams-admin',
        role: 'ADMIN',
        joinedAt: '2024-01-01T00:00:00Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-25T09:15:00Z',
  },
  {
    id: 'user-fernandez-admin',
    name: 'Miguel Fernandez',
    email: 'miguel@fernandez.family',
    avatarColor: '#34d399',
    globalRole: 'FAMILY_ADMIN',
    memberships: [
      {
        familyId: 'family-fernandez',
        familySlug: 'fernandez-familia',
        familyName: 'Fernandez Familia',
        memberId: 'member-fernandez-admin',
        role: 'ADMIN',
        joinedAt: '2024-01-02T00:00:00Z',
      },
    ],
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-25T08:45:00Z',
  },
  {
    id: 'user-williams-lucas',
    name: 'Lucas Williams',
    email: 'lucas@williams.family',
    avatarColor: '#38bdf8',
    globalRole: 'MEMBER',
    memberships: [
      {
        familyId: 'family-williams',
        familySlug: 'williams-clan',
        familyName: 'Williams Clan',
        memberId: 'member-williams-lucas',
        role: 'ADULT',
        joinedAt: '2024-01-02T00:00:00Z',
      },
    ],
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-24T19:20:00Z',
  },
  {
    id: 'user-fernandez-elena',
    name: 'Elena Fernandez',
    email: 'elena@fernandez.family',
    avatarColor: '#60a5fa',
    globalRole: 'MEMBER',
    memberships: [
      {
        familyId: 'family-fernandez',
        familySlug: 'fernandez-familia',
        familyName: 'Fernandez Familia',
        memberId: 'member-fernandez-elena',
        role: 'ADULT',
        joinedAt: '2024-01-02T00:00:00Z',
      },
    ],
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-24T16:10:00Z',
  },
];

export const createEmptyMember = (
  overrides: Partial<FamilyMemberProfile> = {}
): FamilyMemberProfile =>
  createMember({
    name: 'New Family Member',
    email: 'member@example.com',
    role: 'ADULT',
    avatarColor: '#64748b',
    joinedAt: new Date().toISOString(),
    ...overrides,
  });

export const createEmptyPost = (
  familyId: string,
  author: FamilyMemberProfile
): FamilyPost => ({
  id: randomId(),
  familyId,
  authorId: author.id,
  authorName: author.name,
  authorAvatarColor: author.avatarColor,
  createdAt: new Date().toISOString(),
  content: '',
  visibility: 'family_only',
  status: 'pending',
  reactions: 0,
  comments: [],
  tags: [],
});
