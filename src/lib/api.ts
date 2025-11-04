'use client';

import { AuthUser, CreateFamilyRequest, FamilyProfile, InviteMemberRequest, SubdomainInfo, FamilyPost, MediaAttachment } from './types';

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

  // Check for path-based family access (e.g., www.kinjar.com/families/smithfamily)
  const pathMatch = pathname.match(/^\/families\/([^\/]+)/);
  if (pathMatch) {
    const familySlug = pathMatch[1];
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
  private currentUser: AuthUser | null = null;

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
    this.currentUser = user;
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

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
    return this.request(`/families/${slug}`);
  }

  async getCurrentFamily(): Promise<FamilyProfile> {
    const subdomainInfo = getSubdomainInfo();
    if (!subdomainInfo.isSubdomain || !subdomainInfo.familySlug) {
      throw new Error('Not in a family context');
    }
    return this.getFamilyBySlug(subdomainInfo.familySlug);
  }

  async updateFamily(familyId: string, updates: Partial<FamilyProfile>): Promise<FamilyProfile> {
    return this.request(`/families/${familyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
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
    media?: MediaAttachment;
    visibility?: 'family' | 'connections' | 'public';
    tags?: string[];
  }): Promise<FamilyPost> {
    // Transform frontend data to backend format
    const backendData: any = {
      content: postData.content,
      title: postData.content.length > 50 ? postData.content.substring(0, 47) + '...' : postData.content,
      visibility: postData.visibility || 'family',
      tenant_id: postData.familyId // Explicitly set tenant_id
    };

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

    console.log('[API] Sending post data to backend (v2):', backendData);
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
      authorName: backendPost.author_name || fallbackAuthor?.name || 'User',
      authorAvatarColor:
        backendPost.author_avatar || fallbackAuthor?.avatarColor || '#3B82F6',
      createdAt: backendPost.published_at || backendPost.created_at,
      content: backendPost.content,
      media: postData.media, // Use original media from frontend
      visibility: postData.visibility || 'family',
      status: 'approved', // Backend posts are auto-approved
      reactions: 0, // Default
      comments: [], // Default
      tags: postData.tags || [] // Use original tags from frontend
    };

    return frontendPost;
  }

  async getFamilyPosts(familySlugOrId: string, limit: number = 20, offset: number = 0): Promise<FamilyPost[]> {
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
    const frontendPosts: FamilyPost[] = backendPosts.map((backendPost: any) => ({
      id: backendPost.id,
      familyId: backendPost.tenant_id || familySlugOrId,
      authorId: backendPost.author_id,
      authorName: backendPost.author_name || 'User', // Use author name if available
      authorAvatarColor: backendPost.author_avatar || '#3B82F6', // Default color
      createdAt: backendPost.published_at || backendPost.created_at,
      content: backendPost.content,
      media: (backendPost.media_filename || backendPost.media_url || backendPost.media_external_url) ? {
        type: this.determineMediaType(
          backendPost.media_content_type, 
          backendPost.media_filename || backendPost.media_url || backendPost.media_external_url
        ),
        url: backendPost.media_url || backendPost.media_external_url || `/api/media/${backendPost.media_id}`,
        alt: backendPost.title
      } : undefined,
      visibility: backendPost.is_public ? 'public' : 'family',
      status: 'approved', // Backend posts are auto-approved
      reactions: 0, // TODO: Get from backend
      comments: [], // TODO: Get from backend
      tags: [] // TODO: Get from backend
    }));

    console.log(`[API] Transformed ${frontendPosts.length} posts from backend`);
    return frontendPosts;
  }

  async addComment(postId: string, content: string): Promise<{ id: string; authorName: string; authorAvatarColor: string; content: string; createdAt: string }> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
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

  async editPost(postId: string, content: string): Promise<FamilyPost> {
    try {
      const response = await this.request(`/api/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });

      console.log('[API] Edit post response:', response);

      // Backend returns { ok: true, post: {...} }
      const postData = response.post;
      if (!postData) {
        throw new Error('Invalid response format from server');
      }

      // Transform backend response to frontend format
      return {
        id: postData.id,
        content: postData.content,
        authorId: postData.author_id,
        authorName: postData.author_name,
        authorAvatarColor: postData.author_avatar_color || '#3B82F6',
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
      console.log('[API] Edit post failed, checking if edit actually succeeded...', error);
      
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
    return this.request('/admin/families');
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
  }): Promise<{ userId: string; assignedRole: string }> {
    return this.request('/auth/invite-member', {
      method: 'POST',
      body: JSON.stringify(data),
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
    return this.request('/api/posts/pending', {}, tenantSlug);
  }

  async approvePost(postId: string, action: 'approve' | 'reject', reason = ''): Promise<{ newStatus: string }> {
    return this.request(`/api/posts/${postId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  }

  // Public Feed
  async getPublicFeed(limit = 20, offset = 0): Promise<FamilyPost[]> {
    return this.request(`/api/public-feed?limit=${limit}&offset=${offset}`);
  }
}

export const api = new KinjarAPI();