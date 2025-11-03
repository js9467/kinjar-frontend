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

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).ENV?.NEXT_PUBLIC_API_URL || '/api/backend'
  : '/api/backend';

// Demo mode configuration for development/testing
const DEMO_MODE = {
  enabled: true,
  credentials: {
    email: 'testuser@kinjar.com',
    password: 'TestPass123!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNjc0Njc0ZS04ZDA1LTQ1ZjYtODA3NS04OWJjNDdlNDkyZDgiLCJpYXQiOjE3NjIxODU0NDcsImV4cCI6MTc2MzM5NTA0N30.pTwpnFEOaNL8VIvPn6CjI9cQ40pUNIZuWxUo3sAGwQc'
  }
};

// Utility to get subdomain information
export function getSubdomainInfo(): SubdomainInfo {
  if (typeof window === 'undefined') {
    return { isSubdomain: false, isRootDomain: true };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Handle localhost development
  if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('127.0.0.1')) {
    const urlParams = new URLSearchParams(window.location.search);
    const devFamily = urlParams.get('family');
    if (devFamily) {
      return {
        isSubdomain: true,
        subdomain: devFamily,
        familySlug: devFamily,
        isRootDomain: false
      };
    }
    return { isSubdomain: false, isRootDomain: true };
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

  // Handle direct .kinjar.com subdomains (like slaughterbeck.kinjar.com)
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

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('kinjar-auth-token');
      
      // In demo mode, auto-load the demo token if no token exists
      if (DEMO_MODE.enabled && !this.token) {
        this.token = DEMO_MODE.credentials.token;
        localStorage.setItem('kinjar-auth-token', this.token);
      }
    }
  }

  private saveToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinjar-auth-token', token);
    }
  }

  private removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinjar-auth-token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug logging for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API Request] ${options.method || 'GET'} ${url}`);
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add subdomain context for API calls
    const subdomainInfo = getSubdomainInfo();
    if (subdomainInfo.isSubdomain && subdomainInfo.familySlug) {
      headers['x-tenant-slug'] = subdomainInfo.familySlug;
      
      // Debug logging
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API Request] Setting x-tenant-slug: ${subdomainInfo.familySlug}`);
      }
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
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
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
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.request('/auth/me');
  }

  // Family Management
  async createFamily(familyData: CreateFamilyRequest): Promise<{ family: FamilyProfile; user: AuthUser; token: string }> {
    const response = await this.request('/families/create', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });

    this.saveToken(response.token);
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

  async updateMemberRole(familyId: string, memberId: string, role: string): Promise<void> {
    return this.request(`/families/${familyId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
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
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getFamilyPosts(familyId: string): Promise<FamilyPost[]> {
    return this.request(`/families/${familyId}/posts`);
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
}

export const api = new KinjarAPI();