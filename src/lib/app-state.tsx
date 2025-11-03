'use client';

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import {
  FamilyConnectionRequest,
  FamilyMemberProfile,
  FamilyPost,
  FamilyProfile,
  PendingFamilySignup,
  PostStatus,
  PostVisibility,
} from './types';
import {
  createEmptyMember,
  createEmptyPost,
  initialConnectionRequests,
  initialFamilies,
  initialPendingSignups,
} from './sample-data';

interface AppState {
  families: FamilyProfile[];
  pendingFamilySignups: PendingFamilySignup[];
  connectionRequests: FamilyConnectionRequest[];
}

const randomId = () => Math.random().toString(36).slice(2, 10);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

type Action =
  | { type: 'SET_FAMILIES'; payload: FamilyProfile[] }
  | { type: 'UPDATE_FAMILY'; payload: FamilyProfile }
  | { type: 'SET_PENDING_SIGNUPS'; payload: PendingFamilySignup[] }
  | { type: 'SET_CONNECTION_REQUESTS'; payload: FamilyConnectionRequest[] };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_FAMILIES':
      return { ...state, families: action.payload };
    case 'UPDATE_FAMILY':
      return {
        ...state,
        families: state.families.map((family) =>
          family.id === action.payload.id ? action.payload : family
        ),
      };
    case 'SET_PENDING_SIGNUPS':
      return { ...state, pendingFamilySignups: action.payload };
    case 'SET_CONNECTION_REQUESTS':
      return { ...state, connectionRequests: action.payload };
    default:
      return state;
  }
};

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

const initialState: AppState = {
  families: [], // Start with empty data instead of sample data
  pendingFamilySignups: [],
  connectionRequests: [],
};

interface AppStateContextType {
  families: FamilyProfile[];
  pendingFamilySignups: PendingFamilySignup[];
  connectionRequests: FamilyConnectionRequest[];
  globalStats: {
    totalFamilies: number;
    totalMembers: number;
    pendingModeration: number;
    publicHighlights: number;
    storageUsedMb: number;
  };
  getFamilyById: (familyId: string) => FamilyProfile | undefined;
  getFamilyBySlug: (slug: string) => FamilyProfile | undefined;
  updateFamilyProfile: (
    familyId: string,
    updates: Partial<FamilyProfile>
  ) => FamilyProfile | null;
  submitFamilySignup: (payload: {
    familyName: string;
    adminName: string;
    adminEmail: string;
    message?: string;
  }) => PendingFamilySignup;
  approveFamilySignup: (signupId: string) => FamilyProfile | null;
  rejectFamilySignup: (signupId: string) => void;
  addFamilyMember: (
    familyId: string,
    member: Pick<FamilyMemberProfile, 'name' | 'email' | 'role'>
  ) => FamilyMemberProfile | null;
  inviteFamilyMember: (
    familyId: string,
    member: Pick<FamilyMemberProfile, 'name' | 'email'>
  ) => void;
  createFamilyPost: (
    familyId: string,
    authorId: string,
    content: string,
    visibility: PostVisibility,
    media?: FamilyPost['media']
  ) => FamilyPost | null;
  updatePostVisibility: (
    familyId: string,
    postId: string,
    visibility: PostVisibility
  ) => void;
  updatePostStatus: (
    familyId: string,
    postId: string,
    status: PostStatus
  ) => void;
  toggleHighlight: (familyId: string, postId: string) => void;
  deleteFamilyPost: (familyId: string, postId: string) => boolean;
  requestConnection: (
    fromFamilyId: string,
    toFamilyId: string,
    requestedBy: string,
    notes?: string
  ) => FamilyConnectionRequest;
  respondToConnectionRequest: (
    requestId: string,
    status: 'approved' | 'rejected'
  ) => void;
}

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateFamily = useCallback(
    (familyId: string, updater: (family: FamilyProfile) => FamilyProfile) => {
      const existing = state.families.find((family) => family.id === familyId);
      if (!existing) {
        return null;
      }

      const updated = updater(existing);
      dispatch({ type: 'UPDATE_FAMILY', payload: updated });
      return updated;
    },
    [state.families]
  );

  const getFamilyById = useCallback(
    (familyId: string) => state.families.find((family) => family.id === familyId),
    [state.families]
  );

  const getFamilyBySlug = useCallback(
    (slug: string) => state.families.find((family) => family.slug === slug),
    [state.families]
  );

  const submitFamilySignup: AppStateContextType['submitFamilySignup'] = useCallback(
    (payload) => {
      const signup: PendingFamilySignup = {
        id: `signup-${randomId()}`,
        familyName: payload.familyName,
        adminName: payload.adminName,
        adminEmail: payload.adminEmail,
        message: payload.message,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      dispatch({
        type: 'SET_PENDING_SIGNUPS',
        payload: [signup, ...state.pendingFamilySignups],
      });

      return signup;
    },
    [state.pendingFamilySignups]
  );

  const updateFamilyProfile: AppStateContextType['updateFamilyProfile'] = useCallback(
    (familyId, updates) =>
      updateFamily(familyId, (family) => ({
        ...family,
        ...updates,
      })),
    [updateFamily]
  );

  const approveFamilySignup: AppStateContextType['approveFamilySignup'] = useCallback(
    (signupId) => {
      const signup = state.pendingFamilySignups.find((s) => s.id === signupId);
      if (!signup) {
        return null;
      }

      const adminMember = createEmptyMember({
        name: signup.adminName,
        email: signup.adminEmail,
        role: 'ADMIN',
        avatarColor: '#2563eb',
      });

      const newFamily: FamilyProfile = {
        id: `family-${randomId()}`,
        slug: slugify(signup.familyName),
        name: signup.familyName,
        description:
          signup.message ?? 'Newly approved family space ready to customize.',
        missionStatement: 'Define your family mission to inspire relatives.',
        bannerImage:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxNjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjgwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4Ij5OZXcgRmFtaWx5PC90ZXh0Pgo8L3N2Zz4=',
        themeColor: '#2563eb',
        heroImage:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxNDAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE0MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjcwMCIgeT0iNDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2Ij5GYW1pbHkgUGhvdG88L3RleHQ+Cjwvc3ZnPg==',
        admins: [adminMember.id],
        members: [adminMember],
        posts: [],
        connections: [],
        connectedFamilies: [],
        storageUsedMb: 0,
        invitesSentThisMonth: 0,
        pendingMembers: [],
        highlights: [],
        isPublic: true,
        subdomain: slugify(signup.familyName),
        createdAt: new Date().toISOString(),
        ownerId: adminMember.userId || adminMember.id,
      };

      const updatedSignups = state.pendingFamilySignups.map((pending) =>
        pending.id === signupId
          ? { ...pending, status: 'approved' as const }
          : pending
      );

      dispatch({ type: 'SET_FAMILIES', payload: [newFamily, ...state.families] });
      dispatch({ type: 'SET_PENDING_SIGNUPS', payload: updatedSignups });

      return newFamily;
    },
    [state.families, state.pendingFamilySignups]
  );

  const rejectFamilySignup: AppStateContextType['rejectFamilySignup'] = useCallback(
    (signupId) => {
      const updated = state.pendingFamilySignups.map((signup) =>
        signup.id === signupId
          ? {
              ...signup,
              status: 'rejected' as const,
            }
          : signup
      );
      dispatch({ type: 'SET_PENDING_SIGNUPS', payload: updated });
    },
    [state.pendingFamilySignups]
  );

  const addFamilyMember: AppStateContextType['addFamilyMember'] = useCallback(
    (familyId, member) => {
      const newMember = createEmptyMember({
        name: member.name,
        email: member.email,
        role: member.role,
        avatarColor: '#0ea5e9',
      });

      const updated = updateFamily(familyId, (family) => ({
        ...family,
        members: [...family.members, newMember],
      }));

      return updated ? newMember : null;
    },
    [updateFamily]
  );

  const inviteFamilyMember: AppStateContextType['inviteFamilyMember'] = useCallback(
    (familyId, member) => {
      updateFamily(familyId, (family) => ({
        ...family,
        pendingMembers: [
          ...family.pendingMembers,
          createEmptyMember({
            name: member.name,
            email: member.email,
            role: 'ADULT',
            avatarColor: '#f97316',
          }),
        ],
      }));
    },
    [updateFamily]
  );

  const createFamilyPost: AppStateContextType['createFamilyPost'] = useCallback(
    (familyId, authorId, content, visibility, media) => {
      const family = getFamilyById(familyId);
      if (!family) {
        return null;
      }

      const author = family.members.find((member) => member.id === authorId);
      if (!author) {
        return null;
      }

      const post: FamilyPost = {
        ...createEmptyPost(familyId, author),
        content,
        visibility,
        media,
        status: author.role === 'ADMIN' ? 'approved' : 'pending',
      };

      updateFamily(familyId, (current) => ({
        ...current,
        posts: [post, ...(current.posts || [])],
      }));

      return post;
    },
    [getFamilyById, updateFamily]
  );

  const updatePostVisibility: AppStateContextType['updatePostVisibility'] =
    useCallback(
      (familyId, postId, visibility) => {
        updateFamily(familyId, (family) => ({
          ...family,
          posts: (family.posts || []).map((post) =>
            post.id === postId
              ? {
                  ...post,
                  visibility,
                }
              : post
          ),
        }));
      },
      [updateFamily]
    );

  const updatePostStatus: AppStateContextType['updatePostStatus'] = useCallback(
    (familyId, postId, status) => {
      updateFamily(familyId, (family) => ({
        ...family,
        posts: (family.posts || []).map((post) =>
          post.id === postId
            ? {
                ...post,
                status,
              }
            : post
        ),
      }));
    },
    [updateFamily]
  );

  const toggleHighlight: AppStateContextType['toggleHighlight'] = useCallback(
    (familyId, postId) => {
      updateFamily(familyId, (family) => ({
        ...family,
        highlights: family.highlights.includes(postId)
          ? family.highlights.filter((id) => id !== postId)
          : [...family.highlights, postId],
      }));
    },
    [updateFamily]
  );

  const deleteFamilyPost: AppStateContextType['deleteFamilyPost'] = useCallback(
    (familyId, postId) => {
      const family = getFamilyById(familyId);
      if (!family || !(family.posts || []).some((post) => post.id === postId)) {
        return false;
      }

      updateFamily(familyId, (current) => ({
        ...current,
        posts: (current.posts || []).filter((post) => post.id !== postId),
        highlights: current.highlights.filter((id) => id !== postId),
      }));

      return true;
    },
    [getFamilyById, updateFamily]
  );

  const requestConnection: AppStateContextType['requestConnection'] =
    useCallback(
      (fromFamilyId, toFamilyId, requestedBy, notes) => {
        const request: FamilyConnectionRequest = {
          id: `request-${randomId()}`,
          fromFamilyId,
          toFamilyId,
          requestedBy,
          createdAt: new Date().toISOString(),
          status: 'pending',
          notes,
        };

        dispatch({
          type: 'SET_CONNECTION_REQUESTS',
          payload: [request, ...state.connectionRequests],
        });

        return request;
      },
      [state.connectionRequests]
    );

  const respondToConnectionRequest: AppStateContextType['respondToConnectionRequest'] =
    useCallback(
      (requestId, status) => {
        const requests = state.connectionRequests.map((request) =>
          request.id === requestId ? { ...request, status } : request
        );
        dispatch({ type: 'SET_CONNECTION_REQUESTS', payload: requests });

        const resolved = requests.find((request) => request.id === requestId);
        if (!resolved || status !== 'approved') {
          return;
        }

        updateFamily(resolved.fromFamilyId, (family) => ({
          ...family,
          connections: family.connections.includes(resolved.toFamilyId)
            ? family.connections
            : [...family.connections, resolved.toFamilyId],
        }));

        updateFamily(resolved.toFamilyId, (family) => ({
          ...family,
          connections: family.connections.includes(resolved.fromFamilyId)
            ? family.connections
            : [...family.connections, resolved.fromFamilyId],
        }));
      },
      [state.connectionRequests, updateFamily]
    );

  const globalStats = useMemo(() => {
    const totalMembers = state.families.reduce(
      (count, family) => count + family.members.length,
      0
    );
    const pendingModeration = state.families.reduce(
      (count, family) =>
        count + (family.posts || []).filter((post) => post.status === 'pending').length,
      0
    );
    const publicHighlights = state.families.reduce((count, family) => {
      const approvedPublicPosts = (family.posts || []).filter(
        (post) => post.visibility === 'public' && post.status === 'approved'
      );
      return count + approvedPublicPosts.length;
    }, 0);
    const storageUsedMb = state.families.reduce(
      (total, family) => total + family.storageUsedMb,
      0
    );

    return {
      totalFamilies: state.families.length,
      totalMembers,
      pendingModeration,
      publicHighlights,
      storageUsedMb,
    };
  }, [state.families]);

  const value: AppStateContextType = {
    families: state.families,
    pendingFamilySignups: state.pendingFamilySignups,
    connectionRequests: state.connectionRequests,
    globalStats,
    getFamilyById,
    getFamilyBySlug,
    submitFamilySignup,
    updateFamilyProfile,
    approveFamilySignup,
    rejectFamilySignup,
    addFamilyMember,
    inviteFamilyMember,
    createFamilyPost,
    updatePostVisibility,
    updatePostStatus,
    toggleHighlight,
    deleteFamilyPost,
    requestConnection,
    respondToConnectionRequest,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
