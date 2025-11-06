'use client';

import { AuthUser, CreateFamilyRequest, FamilyProfile, InviteMemberRequest, SubdomainInfo, FamilyPost, MediaAttachment, NotificationSettings, PostVisibility, PostComment } from './types';

// Export types that components might need
export type Post = FamilyPost;
export interface MediaUpload {
  file: File;
  type: 'image' | 'video';
  alt?: string;
}

export interface UploadResponse {
  url: string;
}

// Hardcode the API base URL to prevent any environment variable issues
const API_BASE_URL = 'https://kinjar-api.fly.dev';

// Debug: log the API base URL for troubleshooting
if (typeof window !== 'undefined') {
  console.log(`[API] Environment API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`[API] Final API_BASE_URL: ${API_BASE_URL}`);
}

// Utility to get subdomain information
export function getSubdomainInfo(): SubdomainInfo {
  if (typeof window === 'undefined') {
    return { isSubdomain: false, isRootDomain: true };
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const parts = hostname.split('.');
  
  console.log(`[Subdomain Detection] hostname: ${hostname}, pathname: ${pathname}, search: ${window.location.search}`);

  // Handle localhost development
  if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('127.0.0.1')) {
    const urlParams = new URLSearchParams(window.location.search);
    const devFamily = urlParams.get('family');
    console.log(`[Subdomain Detection] localhost detected, devFamily param: ${devFamily}`);
    if (devFamily) {
      const result = {
        isSubdomain: true,
        subdomain: devFamily,
        familySlug: devFamily,
        isRootDomain: false
      };
      console.log(`[Subdomain Detection] localhost result:`, result);
      return result;
    }
    const result = { isSubdomain: false, isRootDomain: true };
    console.log(`[Subdomain Detection] localhost no family param result:`, result);
    return result;
  }

  // Check for path-based family access (e.g., www.kinjar.com/family/smithfamily or /families/smithfamily)
  const pathMatch = pathname.match(/^\/(family|families)\/([^\/]+)/);
  if (pathMatch) {
    const familySlug = pathMatch[2];
    console.log(`[Subdomain Detection] path-based family detected: ${familySlug}`);
    const result = {
      isSubdomain: true, // Treat as subdomain for API purposes
      subdomain: familySlug,
      familySlug: familySlug,
      isRootDomain: false
    };
    console.log(`[Subdomain Detection] path-based result:`, result);
    return result;
  }

  // Production subdomain detection for kinjar.com
  if (parts.length >= 3 && parts[parts.length - 2] === 'kinjar' && parts[parts.length - 1] === 'com') {
    const subdomain = parts.slice(0, -2).join('.');
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
      return {
        isSubdomain: true,
        subdomain,
        familySlug: subdomain,
        isRootDomain: false
      };
    }
  }

  // Handle direct .kinjar.com subdomains (like familyname.kinjar.com)
  if (parts.length === 3 && parts[1] === 'kinjar' && parts[2] === 'com') {
    const subdomain = parts[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
      return {
        isSubdomain: true,
        subdomain,
        familySlug: subdomain,
        isRootDomain: false
      };
    }
  }

  return { isSubdomain: false, isRootDomain: true };
}

// API client class
class KinjarAPI {
  private baseURL: string;
  private token: string | null = null;
  private _currentUser: AuthUser | null = null;
  private _actingAsChild: { id: string; name: string; avatarColor: string; avatarUrl?: string } | null = null;

  get currentUser(): AuthUser | null {
    return this._currentUser;
  }

  get actingAsChild(): { id: string; name: string; avatarColor: string; avatarUrl?: string } | null {
    return this._actingAsChild;
  }

  setActingAsChild(child: { id: string; name: string; avatarColor: string; avatarUrl?: string } | null) {
    this._actingAsChild = child;
  }

  constructor() {
    this.baseURL = API_BASE_URL;
    console.log(`[API Client] Initialized with baseURL: ${this.baseURL}`);
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('kinjar-auth-token');
      console.log(`[API] Token loaded: ${this.token ? this.token.substring(0, 20) + '...' : 'none'}`);
    }
  }

  private determineMediaType(contentType?: string, filename?: string): 'image' | 'video' {
    // Check filename extension first (more reliable than content type)
    if (filename) {
      const extension = filename.toLowerCase().split('.').pop();
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv', 'm4v', '3gp'];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'];
      
      if (videoExtensions.includes(extension || '')) return 'video';
      if (imageExtensions.includes(extension || '')) return 'image';
    }
    
    // Fallback to content type if extension detection fails
    if (contentType) {
      if (contentType.startsWith('image/')) return 'image';
      if (contentType.startsWith('video/')) return 'video';
    }
    
    // Default to image if we can't determine
    return 'image';
  }

  private saveToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinjar-auth-token', token);
      console.log(`[API] Token saved: ${token.substring(0, 20)}...`);
    }
  }

  private removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinjar-auth-token');
    }
  }

  setCurrentUser(user: AuthUser | null) {
  this._currentUser = user;
  }

  private async request(endpoint: string, options: RequestInit = {}, tenantSlug?: string) {
    // Ensure baseURL is absolute
    if (!this.baseURL.startsWith('http')) {
      console.error(`[API] Invalid baseURL: ${this.baseURL}. Using fallback.`);
      this.baseURL = 'https://kinjar-api.fly.dev';
    }
    
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug logging for development and production to troubleshoot
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);
    console.log(`[API Request] baseURL: ${this.baseURL}, endpoint: ${endpoint}`);
    
    const headers: Record<string, string> = {};
    
    // Only set Content-Type if not FormData and headers don't explicitly override it
    const providedHeaders = (options.headers as Record<string, string>) || {};
    const isFormData = options.body instanceof FormData;
    
    if (!isFormData && !providedHeaders.hasOwnProperty('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Merge provided headers
    Object.assign(headers, providedHeaders);

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log(`[API Request] Auth token present: ${this.token.substring(0, 20)}...`);
    } else {
      console.log(`[API Request] No auth token available`);
    }

    // Use provided tenant slug or get from subdomain context
    let targetTenantSlug = tenantSlug;
    if (!targetTenantSlug) {
      const subdomainInfo = getSubdomainInfo();
      console.log(`[API Request] Subdomain info:`, subdomainInfo);
      if (subdomainInfo.isSubdomain && subdomainInfo.familySlug) {
        targetTenantSlug = subdomainInfo.familySlug;
      }
    }

    if (targetTenantSlug) {
      headers['x-tenant-slug'] = targetTenantSlug;
      console.log(`[API Request] Setting x-tenant-slug: ${targetTenantSlug}`);
    } else {
      console.log(`[API Request] No tenant slug to set`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        // Don't automatically redirect - let the auth context handle it
        // This prevents redirect loops
      }
      
      // Enhanced error logging for debugging
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error(`[API Error] ${response.status} ${response.statusText}:`, errorData);
      
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.saveToken(response.token);
    this.setCurrentUser(response.user);
    return { user: response.user, token: response.token };
  }

  async register(userData: { name: string; email: string; password: string }): Promise<{ ok: boolean; user?: any; error?: string }> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
      this.setCurrentUser(null);
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await this.request('/auth/me');
      console.log('[API] Successfully got current user:', response.user);
      const user = response.user;
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.warn('[API] Authentication failed:', error);
      
      // If token is expired or invalid, clear it
      if (this.token) {
        console.log('[API] Clearing invalid token');
        this.removeToken();
      }
      
      // Clear current user state
      this.setCurrentUser(null);
      
      // Re-throw the error so the auth context can handle it properly
      throw error;
    }
  }

  // Family Management
  async createFamily(familyData: CreateFamilyRequest): Promise<{ family: FamilyProfile; user: AuthUser; token: string }> {
    const response = await this.request('/families/create', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });

    this.saveToken(response.token);
    this.setCurrentUser(response.user);
    return response;
  }

  async getFamilyBySlug(slug: string): Promise<FamilyProfile> {
    const response = await this.request(`/families/${slug}`);
    // Unwrap family object if present
    if (response.family) {
      const family = response.family;
      
      // Transform members to match frontend expectations
      const transformedMembers = (family.members || response.members || []).map((member: any) => ({
        ...member,
        // Backend returns user_id as 'id', but frontend expects both 'id' and 'userId'  
        id: member.id, // Keep the original id (user_id from backend)
        userId: member.id, // Also set userId to the same value for consistency
        name: member.name || member.display_name || member.email?.split('@')[0] || 'User',
        avatarColor: member.avatar_color || '#3B82F6',
        joinedAt: member.joined_at || member.createdAt || new Date().toISOString()
      }));
      
      console.log('[API] Transformed family members:', transformedMembers.map((m: any) => ({ id: m.id, userId: m.userId, name: m.name })));
      
      return {
        ...family,
        posts: family.posts || response.posts || [],
        members: transformedMembers,
        connections: family.connections || response.connections || [],
        connectedFamilies: family.connectedFamilies || response.connectedFamilies || [],
        admins: family.admins || response.admins || [],
        highlights: family.highlights || response.highlights || [],
        pendingMembers: family.pendingMembers || response.pendingMembers || [],
        invitesSentThisMonth: family.invitesSentThisMonth ?? response.invitesSentThisMonth ?? 0,
        storageUsedMb: family.storageUsedMb ?? response.storageUsedMb ?? 0,
      } as FamilyProfile;
    }
    
    // If no nested family object, transform the response directly
    const transformedMembers = (response.members || []).map((member: any) => ({
      ...member,
      id: member.id,
      userId: member.id,
      name: member.name || member.display_name || member.email?.split('@')[0] || 'User',
      avatarColor: member.avatar_color || '#3B82F6',
      joinedAt: member.joined_at || member.createdAt || new Date().toISOString()
    }));
    
    console.log('[API] Transformed family members (direct):', transformedMembers.map((m: any) => ({ id: m.id, userId: m.userId, name: m.name })));
    
    return {
      ...response,
      members: transformedMembers
    };
  }

  async getCurrentFamily(): Promise<FamilyProfile> {
    const subdomainInfo = getSubdomainInfo();
    if (!subdomainInfo.isSubdomain || !subdomainInfo.familySlug) {
      throw new Error('Not in a family context');
    }
    return this.getFamilyBySlug(subdomainInfo.familySlug);
  }

  async updateFamily(familyId: string, updates: Partial<FamilyProfile>): Promise<FamilyProfile> {
    return this.request(`/api/families/${familyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async uploadFamilyPhoto(familyId: string, file: File): Promise<{ familyPhotoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/api/families/${familyId}/upload-photo`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Member Management
  async inviteMember(invite: InviteMemberRequest): Promise<void> {
    return this.request('/families/invite', {
      method: 'POST',
      body: JSON.stringify(invite),
    });
  }

  // Media and Posts
  async uploadMedia(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        // Remove Content-Type for FormData to set boundary automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  async createPost(postData: {
  content: string;
  familyId: string;
  authorId: string;
  media?: MediaAttachment;
  visibility?: 'family_only' | 'family_and_connections';
  tags?: string[];
  postedAsMember?: {
    id: string;
    name: string;
    role: string;
  };
  actingAsChild?: { id: string; name: string; avatarColor: string; avatarUrl?: string };
  }): Promise<FamilyPost> {
    // Use actingAsChild if provided, otherwise use the instance-level one, otherwise use postedAsMember for backwards compatibility
    const childToActAs = postData.actingAsChild || this._actingAsChild;
    const memberToPostAs = childToActAs ? {
      id: childToActAs.id,
      name: childToActAs.name,
      role: 'CHILD' // This will be corrected by backend
    } : postData.postedAsMember;

    // Transform frontend data to backend format
    const backendData: any = {
      content: postData.content,
      title: postData.content.length > 50 ? postData.content.substring(0, 47) + '...' : postData.content,
      visibility: postData.visibility || 'family_and_connections',
      tenant_id: postData.familyId, // Explicitly set tenant_id
      // author_id is always the logged-in user (backend handles this from JWT)
      // posted_as_id is the member being posted as (can be different)
      posted_as_id: memberToPostAs?.id || postData.authorId
    };

    console.log('[API] Acting as child:', childToActAs);
    console.log('[API] Posted as member:', memberToPostAs);
    console.log('[API] Sending posted_as_id:', backendData.posted_as_id);

    // Handle media transformation
    if (postData.media) {
      if (postData.media.url.startsWith('http') && !postData.media.url.includes('blob.vercel-storage.com')) {
        // Only use media_id for actual backend media IDs, not blob URLs
        backendData.media_id = postData.media.url;
      } else {
        // For Vercel Blob URLs, send the URL as media data
        console.log('[API] Sending blob URL as media:', postData.media.url);
        backendData.media = {
          url: postData.media.url,
          type: postData.media.type
        };
      }
    }

    // Note: tags are not yet supported by backend, but include for future compatibility
    if (postData.tags && postData.tags.length > 0) {
      backendData.tags = postData.tags;
    }

    console.log('[API] Sending post data to backend (v3):', backendData);
    console.log('[API] PostData.familyId for tenant header:', postData.familyId);

    const response = await this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(backendData),
      headers: {
        'x-tenant-slug': postData.familyId // Ensure tenant header is set for post creation
      }
    });

    // Transform backend response to frontend format
    const backendPost = response.post;
    
    const fallbackAuthor = this.currentUser;

    const frontendPost: FamilyPost = {
      id: backendPost.id,
      familyId: backendPost.tenant_id || postData.familyId,
      authorId: backendPost.author_id || fallbackAuthor?.id || 'current-user',
      // Use posted_as_name from backend if available, otherwise fall back to backend author_name
      authorName: backendPost.posted_as_name || backendPost.author_name || fallbackAuthor?.name || 'User',
      authorAvatarColor: backendPost.posted_as_avatar_color || backendPost.author_avatar_color || fallbackAuthor?.avatarColor || '#3B82F6',
      authorAvatarUrl: backendPost.posted_as_avatar || backendPost.author_avatar || fallbackAuthor?.avatarUrl,
      createdAt: backendPost.published_at || backendPost.created_at,
      content: backendPost.content,
      media: postData.media, // Use original media from frontend
      visibility: postData.visibility || 'family_and_connections',
      status: 'approved', // Backend posts are auto-approved
      reactions: 0, // Default
      comments: [], // Default
      tags: postData.tags || [] // Use original tags from frontend
    };

    return frontendPost;
  }

  async getFamilyPosts(familySlugOrId: string, limit: number = 20, offset: number = 0): Promise<FamilyPost[]> {
    console.log(`[API] getFamilyPosts called for: ${familySlugOrId}, limit: ${limit}, offset: ${offset}`);
    console.log(`[API] Current acting as child during getFamilyPosts:`, this._actingAsChild?.name || 'none');
    
    // Try the API endpoint first (uses slug)
    let response;
    try {
      response = await this.request(`/api/families/${familySlugOrId}/posts?limit=${limit}&offset=${offset}`);
    } catch (error) {
      // Fallback to families endpoint (uses ID) 
      response = await this.request(`/families/${familySlugOrId}/posts?limit=${limit}&offset=${offset}`);
    }

    // Transform backend posts to frontend format
    const backendPosts = response.posts || response || [];
    console.log(`[API] Raw backend posts received: ${backendPosts.length}`);
    
    const frontendPosts: FamilyPost[] = [];
    
    // Process each post and load its comments
    for (const backendPost of backendPosts) {
      const post: FamilyPost = {
        id: backendPost.id,
        familyId: backendPost.tenantId || backendPost.tenant_id || familySlugOrId,
        authorId: backendPost.authorId || backendPost.author_id,
        // Backend now returns camelCase directly
        authorName: backendPost.authorName || 'User',
        authorAvatarColor: backendPost.authorAvatarColor || '#3B82F6',
        authorAvatarUrl: backendPost.authorAvatarUrl,
        createdAt: backendPost.publishedAt || backendPost.published_at || backendPost.createdAt || backendPost.created_at,
        content: backendPost.content,
        media: (backendPost.media_filename || backendPost.media_url || backendPost.media_external_url || backendPost.mediaUrl) ? {
          type: this.determineMediaType(
            backendPost.media_content_type || backendPost.mediaType, 
            backendPost.media_filename || backendPost.media_url || backendPost.media_external_url || backendPost.mediaUrl
          ),
          url: backendPost.media_url || backendPost.media_external_url || backendPost.mediaUrl || `/api/media/${backendPost.media_id}`,
          alt: backendPost.title
        } : undefined,
        // Map backend visibility to frontend - backend has 'visibility' field or fallback to is_public
        visibility: backendPost.visibility || (backendPost.is_public ? 'family_and_connections' : 'family_only'),
        status: 'approved', // Backend posts are auto-approved
        reactions: 0, // TODO: Get from backend
        comments: [], // Load comments separately
        tags: [] // TODO: Get from backend
      };
      
      // Load comments for this post
      try {
        console.log(`[API] About to load comments for post ${post.id}, acting as child:`, this._actingAsChild?.name || 'none');
        const comments = await this.getPostComments(post.id);
        post.comments = comments;
        console.log(`[API] Loaded ${comments.length} comments for post ${post.id}`);
      } catch (error) {
        console.warn(`[API] Failed to load comments for post ${post.id}:`, error);
        post.comments = [];
      }
      
      frontendPosts.push(post);
    }

    console.log(`[API] Transformed ${frontendPosts.length} posts from backend with comments`);
    return frontendPosts;
  }

  async addComment(postId: string, content: string, actingAsChild?: { id: string; name: string; avatarColor: string; avatarUrl?: string }): Promise<PostComment> {
    console.log(`[API] Adding comment to post ${postId}:`, content);
    
    const requestBody: any = { content };
    
    // Use provided actingAsChild, or the instance-level one, or nothing
    const childToActAs = actingAsChild || this._actingAsChild;
    if (childToActAs) {
      requestBody.posted_as_id = childToActAs.id;
      console.log(`[API] Adding comment as child:`, childToActAs);
    }
    
    const response = await this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    console.log(`[API] Comment response:`, response);
    
    // Backend returns { ok: true, comment: {...} }, we need just the comment
    const comment = response.comment || response;
    
    // Backend now returns camelCase fields directly
    const formattedComment: PostComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
      // Use posted_as_* fields if available (when acting as child), otherwise fall back to author fields
      authorName: comment.posted_as_name || comment.authorName || comment.author_name || 
                 (childToActAs ? childToActAs.name : this.currentUser?.name) || 'User',
      authorAvatarColor: comment.posted_as_avatar_color || comment.authorAvatarColor || comment.author_avatar_color || 
                        (childToActAs ? childToActAs.avatarColor : this.currentUser?.avatarColor) || '#3B82F6',
      authorAvatarUrl: comment.posted_as_avatar || comment.authorAvatarUrl || comment.author_avatar || 
                      (childToActAs ? childToActAs.avatarUrl : this.currentUser?.avatarUrl)
    };
    
    console.log(`[API] Formatted comment:`, formattedComment);
    return formattedComment;
  }

  async editComment(commentId: string, content: string): Promise<PostComment> {
    console.log(`[API] Editing comment ${commentId} with content:`, content);
    const response = await this.request(`/api/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
    
    console.log(`[API] Edit comment response:`, response);
    
    // Backend returns { ok: true, comment: {...} }, we need just the comment
    const comment = response.comment || response;
    
    // Backend now returns camelCase fields directly
    const formattedComment: PostComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt || comment.created_at,
      authorName: comment.authorName || comment.author_name || this.currentUser?.name || 'User',
      authorAvatarColor: comment.authorAvatarColor || comment.author_avatar_color || this.currentUser?.avatarColor || '#3B82F6',
      authorAvatarUrl: comment.authorAvatarUrl || comment.author_avatar || this.currentUser?.avatarUrl
    };
    
    console.log(`[API] Formatted edited comment:`, formattedComment);
    return formattedComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    console.log(`[API] Deleting comment ${commentId}`);
    const response = await this.request(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
    
    console.log(`[API] Delete comment response:`, response);
    
    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.error || 'Unknown error'}`);
    }
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      console.log(`[API] Loading comments for post ${postId}`);
      console.log(`[API] Current acting as child:`, this._actingAsChild?.name || 'none');
      
      const response = await this.request(`/api/posts/${postId}/comments`);
      
      console.log(`[API] Raw comments response:`, response);
      
      // Backend returns { ok: true, comments: [...] }
      const backendComments = response.comments || [];
      
      // Transform backend comments to frontend format
      // Backend now returns camelCase (authorName, authorAvatarColor, authorAvatarUrl, createdAt)
      // Handle both regular comments and comments posted as children
      const formattedComments: PostComment[] = backendComments.map((comment: any) => {
        console.log(`[API] Processing comment:`, comment);
        
        const formattedComment = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt || comment.created_at || new Date().toISOString(),
          // Use posted_as_* fields if available (when comment was made as child), otherwise fall back to author fields
          authorName: comment.posted_as_name || comment.authorName || comment.author_name || 'User',
          authorAvatarColor: comment.posted_as_avatar_color || comment.authorAvatarColor || comment.author_avatar_color || '#3B82F6',
          authorAvatarUrl: comment.posted_as_avatar || comment.authorAvatarUrl || comment.author_avatar
        };
        
        console.log(`[API] Formatted comment:`, formattedComment);
        return formattedComment;
      });
      
      console.log(`[API] Loaded ${formattedComments.length} comments for post ${postId}`);
      return formattedComments;
    } catch (error) {
      console.warn(`[API] Failed to load comments for post ${postId}:`, error);
      return [];
    }
  }

  async addReaction(postId: string, reaction: string): Promise<void> {
    return this.request(`/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await this.request(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async editPost(postId: string, content: string, tenantSlug?: string): Promise<FamilyPost> {
    try {
      console.log(`[API] Editing post ${postId} with content: "${content.substring(0, 50)}..."`);
      console.log(`[API] Using tenant slug: ${tenantSlug}`);
      
      const response = await this.request(
        `/api/posts/${postId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ content }),
        },
        tenantSlug
      );

      console.log('[API] Edit post response:', response);

      // Backend returns { ok: true, post: {...} }
      const postData = response.post;
      if (!postData) {
        throw new Error('Invalid response format from server');
      }

      // Transform backend response to frontend format
      // Use posted_as_name from backend if available
      return {
        id: postData.id,
        content: postData.content,
        authorId: postData.author_id,
        authorName: postData.posted_as_name || postData.author_name || 'User',
        authorAvatarColor: postData.posted_as_avatar_color || postData.author_avatar_color || '#3B82F6',
  authorAvatarUrl: postData.posted_as_avatar || postData.author_avatar,
        createdAt: postData.created_at,
        familyId: postData.tenant_id,
        media: postData.media_url ? {
          url: postData.media_url,
          type: this.determineMediaType(postData.media_type, postData.media_url),
          alt: postData.media_alt || 'User uploaded media'
        } as MediaAttachment : undefined,
        visibility: postData.visibility || 'family',
        status: postData.status || 'approved',
        reactions: 0, // TODO: Get from backend
        comments: [], // TODO: Get from backend
        tags: [] // TODO: Get from backend
      };
    } catch (error: any) {
      console.error('[API] Edit post failed with error:', error);
      console.error('[API] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // If we get a network error (Failed to fetch), let's try to diagnose
      if (error.message === 'Failed to fetch') {
        console.error('[API] Network error detected. Checking connectivity...');
        console.error('[API] Current baseURL:', this.baseURL);
        console.error('[API] Current token:', this.token ? 'Present' : 'Missing');
        console.error('[API] Request details:', {
          url: `${this.baseURL}/api/posts/${postId}`,
          method: 'PATCH',
          tenantSlug: tenantSlug
        });
      }
      
      // If we get a 500 error but the edit might have succeeded,
      // fetch the post to see if the content was actually updated
      if (error.message.includes('500')) {
        try {
          // Get the current family slug for fetching posts
          const subdomainInfo = getSubdomainInfo();
          if (subdomainInfo.familySlug) {
            // Fetch the current posts to see if the edit succeeded
            const posts = await this.getFamilyPosts(subdomainInfo.familySlug);
            const updatedPost = posts.find(p => p.id === postId);
            
            if (updatedPost && updatedPost.content === content) {
              console.log('[API] Edit actually succeeded despite 500 error, returning updated post');
              return updatedPost;
            }
          }
        } catch (fetchError) {
          console.log('[API] Failed to verify if edit succeeded:', fetchError);
        }
      }
      
      // Re-throw the original error if we couldn't verify success
      throw error;
    }
  }

  // Root Admin Functions
  async getAllFamilies(): Promise<FamilyProfile[]> {
    const response = await this.request('/admin/families');
    // Handle nested response structure
    return response.families || response || [];
  }

  async getAllUsers(): Promise<AuthUser[]> {
    return this.request('/admin/users');
  }

  async createRootAdmin(email: string, password: string, name: string): Promise<AuthUser> {
    return this.request('/admin/create-root', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Utility method to check if subdomain is available
  async checkSubdomainAvailable(subdomain: string): Promise<boolean> {
    try {
      await this.request(`/families/check-subdomain/${subdomain}`);
      return true;
    } catch {
      return false;
    }
  }

  // Health check method for debugging connectivity issues
  async healthCheck(): Promise<boolean> {
    try {
      console.log('[API] Performing health check...');
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const isHealthy = response.ok;
      console.log(`[API] Health check result: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
      return isHealthy;
    } catch (error) {
      console.error('[API] Health check failed:', error);
      return false;
    }
  }

  // Password Management
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User Profile Management
  async updateUserProfile(data: {
    displayName?: string;
    bio?: string;
    phone?: string;
    avatarColor?: string;
    avatarUrl?: string;
    birthdate?: string;
  }): Promise<void> {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Family Member Management
  async inviteFamilyMember(data: {
    email: string;
    name: string;
    familyId: string;
    birthdate?: string;
    role?: string;
  }): Promise<{ 
    userId?: string; 
    assignedRole: string; 
    emailSent: boolean;
    invitationId?: string;
    expiresAt?: string;
    message: string;
  }> {
    return this.request('/auth/invite-member', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvitationDetails(token: string): Promise<{
    email: string;
    role: string;
    familyName: string;
    familySlug: string;
    expiresAt: string;
  }> {
    const response = await this.request(`/auth/invitation/${token}`);
    return response.invitation;
  }

  async registerWithInvitation(data: {
    email: string;
    password: string;
    token: string;
  }): Promise<{
    user: AuthUser;
    family?: {
      id: string;
      name: string;
      slug: string;
      role: string;
    };
  }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Family Creation Invitations
  async sendFamilyCreationInvitation(data: {
    email: string;
    name: string;
    message?: string;
  }, tenantSlug: string): Promise<{
    invitation: any;
    message: string;
    expiresAt: string;
  }> {
    return this.request('/api/families/invite-new-family', {
      method: 'POST',
      body: JSON.stringify(data),
    }, tenantSlug);
  }

  async getPendingInvitations(tenantSlug: string): Promise<{
    invitations: Array<{
      id: string;
      type: 'member_invitation' | 'family_creation';
      recipientEmail: string;
      recipientName: string;
      message?: string;
      sentAt: string;
      expiresAt?: string;
      status: 'pending' | 'accepted' | 'declined' | 'expired';
      invitedBy: string;
    }>;
  }> {
    return this.request('/api/families/pending-invitations', {
      method: 'GET',
    }, tenantSlug);
  }

  async cancelInvitation(invitationId: string, tenantSlug: string): Promise<{
    ok: boolean;
    message: string;
    type: 'member_invitation' | 'family_creation';
  }> {
    return this.request(`/api/families/invitations/${invitationId}`, {
      method: 'DELETE',
    }, tenantSlug);
  }

  async resendInvitation(invitationId: string, tenantSlug: string): Promise<{
    ok: boolean;
    message: string;
    type: 'member_invitation' | 'family_creation';
    emailSent: boolean;
    expiresAt: string;
  }> {
    return this.request(`/api/families/invitations/${invitationId}/resend`, {
      method: 'POST',
    }, tenantSlug);
  }

  async getFamilyCreationInvitationDetails(token: string): Promise<{
    invitation: {
      id: string;
      email: string;
      invitedName: string;
      message?: string;
      requestingFamily: {
        name: string;
        slug: string;
      };
      invitedBy: {
        email: string;
        name: string;
      };
      expiresAt: string;
      createdAt: string;
    };
  }> {
    return this.request(`/api/families/invitation/${token}`);
  }

  async createFamilyWithInvitation(data: {
    invitationToken: string;
    familyName: string;
    subdomain: string;
    description?: string;
    adminName: string;
    adminEmail: string;
    password: string;
    isPublic?: boolean;
  }): Promise<{
    user: AuthUser;
    family: {
      id: string;
      name: string;
      slug: string;
      role: string;
      memberCount: number;
      createdAt: string;
      connectedTo: string;
    };
    message: string;
  }> {
    return this.request('/families/create-with-invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Family Search and Connections
  async searchFamilies(query: string = '', limit = 20, offset = 0, tenantSlug?: string): Promise<{
    families: Array<{
      id: string;
      slug: string;
      name: string;
      description?: string;
      familyPhoto?: string;
      themeColor: string;
      memberCount: number;
      createdAt: string;
      connectionStatus: 'none' | 'pending' | 'accepted' | 'declined';
    }>;
  }> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    return this.request(`/api/families/search?${params}`, {}, tenantSlug);
  }

  async requestFamilyConnection(targetFamilySlug: string, message?: string, tenantSlug?: string): Promise<{
    connection: any;
    requestingFamily: any;
    targetFamily: any;
  }> {
    return this.request('/api/families/connect', {
      method: 'POST',
      body: JSON.stringify({
        target_family: targetFamilySlug,
        message: message || ''
      }),
    }, tenantSlug);
  }

  async getFamilyConnections(tenantSlug: string): Promise<{
    connections: Array<{
      id: string;
      direction: 'incoming' | 'outgoing';
      otherFamilySlug: string;
      otherFamilyName: string;
      status: 'pending' | 'accepted' | 'declined';
      requestMessage?: string;
      responseMessage?: string;
      requesterName: string;
      responderName?: string;
      createdAt: string;
      respondedAt?: string;
    }>;
  }> {
    return this.request('/api/families/connections', {}, tenantSlug);
  }

  async respondToFamilyConnection(connectionId: string, action: 'accept' | 'decline', message?: string): Promise<{
    connection: any;
  }> {
    return this.request(`/api/families/connections/${connectionId}/respond`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        message: message || ''
      }),
    });
  }

  async disconnectFromFamily(connectionId: string, tenantSlug: string): Promise<{
    ok: boolean;
    message: string;
    disconnected_family: {
      name: string;
      slug: string;
    };
  }> {
    return this.request(`/api/families/connections/${connectionId}`, {
      method: 'DELETE'
    }, tenantSlug);
  }

  // Admin Functions
  async listAllFamilies(search = '', limit = 50, offset = 0): Promise<{
    families: Array<{
      id: string;
      slug: string;
      name: string;
      createdAt: string;
      memberCount: number;
      postCount: number;
      mediaCount: number;
      storageBytes: number;
      familyPhoto?: string;
      description?: string;
      isPublic: boolean;
      lastPostAt?: string;
      lastActivityAt?: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    return this.request(`/admin/families?${params}`);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request('/auth/upload-avatar', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it for FormData
      headers: {},
    });
  }

  async uploadMemberAvatar(familyId: string, memberId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request(`/api/family/${familyId}/member/${memberId}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async updateFamilyMember(familyId: string, memberId: string, data: {
    name?: string;
    quote?: string;
    birthdate?: string;
    role?: string;
  }): Promise<{ message: string }> {
    return this.request(`/api/family/${familyId}/member/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeFamilyMember(familyId: string, memberId: string): Promise<{ message: string }> {
    return this.request(`/api/family/${familyId}/member/${memberId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(familyId: string, memberId: string, role: string, manualOverride = false): Promise<{
    newRole: string;
    permissions: any;
  }> {
    return this.request(`/families/${familyId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, manualOverride }),
    });
  }

  // Post Approval System
  async getPendingPosts(tenantSlug?: string): Promise<FamilyPost[]> {
    const response = await this.request('/api/posts/pending', {}, tenantSlug);
    return response.posts || [];
  }

  async approvePost(postId: string, action: 'approve' | 'reject', reason = ''): Promise<{ newStatus: string }> {
    return this.request(`/api/posts/${postId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  }

  // Connected Families Feed
  async getConnectedFamiliesFeed(tenantSlug: string, limit = 20, offset = 0): Promise<FamilyPost[]> {
    const response = await this.request(`/api/posts?tenant=${tenantSlug}&include_connected=true&limit=${limit}&offset=${offset}`);
    const posts = response.posts || [];
    
    // Load comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const comments = await this.getPostComments(post.id);

          const visibility = this.normalizePostVisibility(post.visibility);

          // Transform backend post to frontend format
          // Backend now returns camelCase (authorName, authorAvatarUrl, etc.)
          const transformedPost: FamilyPost = {
            id: post.id,
            familyId: post.tenantId || post.tenant_id,
            familySlug: post.familySlug || post.family_slug,
            familyName: post.familyName || post.family_name,
            familyThemeColor: post.familyThemeColor || post.family_theme_color || '#2563eb',
            authorId: post.authorId || post.author_id,
            authorName: post.authorName || post.posted_as_name || post.author_name || 'User',
            authorAvatarColor: post.authorAvatarColor || post.posted_as_avatar_color || post.author_avatar_color || '#3B82F6',
            authorAvatarUrl: post.authorAvatarUrl || post.posted_as_avatar || post.author_avatar,
            createdAt: post.publishedAt || post.published_at || post.createdAt || post.created_at,
            content: post.content,
            title: post.title,
            media: (post.media_filename || post.media_url || post.media_external_url || post.mediaUrl) ? {
              type: this.determineMediaType(
                post.media_content_type || post.mediaType, 
                post.media_filename || post.media_url || post.media_external_url || post.mediaUrl
              ),
              url: post.media_url || post.media_external_url || post.mediaUrl || `${this.baseURL}/api/media/${post.media_id}`,
              alt: post.title
            } : undefined,
            visibility,
            status: post.status || 'published',
            tags: post.tags || [],
            comments,
            reactions: post.reactions || 0
          };
          
          return transformedPost;
        } catch (error) {
          console.warn(`Failed to load comments for connected feed post ${post.id}:`, error);
          
          // Transform without comments
          const visibility = this.normalizePostVisibility(post.visibility);

          const transformedPost: FamilyPost = {
            id: post.id,
            familyId: post.tenantId || post.tenant_id,
            familySlug: post.familySlug || post.family_slug,
            familyName: post.familyName || post.family_name,
            familyThemeColor: post.familyThemeColor || post.family_theme_color || '#2563eb',
            authorId: post.authorId || post.author_id,
            authorName: post.authorName || post.posted_as_name || post.author_name || 'User',
            authorAvatarColor: post.authorAvatarColor || post.posted_as_avatar_color || post.author_avatar_color || '#3B82F6',
            authorAvatarUrl: post.authorAvatarUrl || post.posted_as_avatar || post.author_avatar,
            createdAt: post.publishedAt || post.published_at || post.createdAt || post.created_at,
            content: post.content,
            title: post.title,
            media: (post.media_filename || post.media_url || post.media_external_url || post.mediaUrl) ? {
              type: this.determineMediaType(
                post.media_content_type || post.mediaType, 
                post.media_filename || post.media_url || post.media_external_url || post.mediaUrl
              ),
              url: post.media_url || post.media_external_url || post.mediaUrl || `${this.baseURL}/api/media/${post.media_id}`,
              alt: post.title
            } : undefined,
            visibility,
            status: post.status || 'published',
            tags: post.tags || [],
            comments: [],
            reactions: post.reactions || 0
          };
          
          return transformedPost;
        }
      })
    );
    
    return postsWithComments;
  }

  // Public Feed
  async getPublicFeed(limit = 20, offset = 0): Promise<FamilyPost[]> {
    const response = await this.request(`/api/public-feed?limit=${limit}&offset=${offset}`);
    const posts = response.posts || [];
    
    // Load comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post: FamilyPost) => {
        try {
          const comments = await this.getPostComments(post.id);
          return { 
            ...post, 
            comments
          };
        } catch (error) {
          console.warn(`Failed to load comments for public post ${post.id}:`, error);
          return { 
            ...post, 
            comments: []
          };
        }
      })
    );
    
    return postsWithComments;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await this.request('/api/users/notification-settings');
    return response.settings || {
      emailNotifications: {
        familyInvitationAccepted: true,
        connectionRequestAccepted: true,
        newFamilyMemberJoined: true,
        familyConnectionEstablished: true,
        newPostInConnectedFamily: false,
      },
      pushNotifications: {
        enabled: false,
        newComments: false,
        newReactions: false,
      },
    };
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const response = await this.request('/api/users/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return response.settings;
  }

  async sendNotificationTestEmail(): Promise<{ message: string }> {
    return this.request('/api/users/test-notification-email', {
      method: 'POST',
    });
  }

  private normalizePostVisibility(rawVisibility: string | undefined): PostVisibility {
    if (!rawVisibility) {
      return 'family_and_connections';
    }

    const normalized = rawVisibility.toLowerCase();
    if (normalized === 'family_only') {
      return 'family_only';
    }

    if (normalized === 'family_and_connections' || normalized === 'connections') {
      return 'family_and_connections';
    }

    // Treat legacy/public posts fetched through this feed as shared with connections
    return 'family_and_connections';
  }
}

export const api = new KinjarAPI();