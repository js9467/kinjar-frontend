'use client';

import { AuthUser, CreateFamilyRequest, FamilyProfile, InviteMemberRequest, SubdomainInfo, FamilyPost, MediaAttachment } from './types';

// Export types that components might need
export type Post = FamilyPost;
export interface MediaUpload {
  file: File;
  type: 'image' | 'video';
  alt?: string;
}

const API_BASE_URL = typeof window !== 'undefined' 
  ? (window as any).ENV?.NEXT_PUBLIC_API_URL || 'https://kinjar-api.fly.dev'
  : 'https://kinjar-api.fly.dev';

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

  // Production subdomain detection
  if (parts.length >= 3 && parts[parts.length - 2] === 'kinjar' && parts[parts.length - 1] === 'com') {
    const subdomain = parts.slice(0, -2).join('.');
    if (subdomain && subdomain !== 'www') {
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
      headers['X-Family-Context'] = subdomainInfo.familySlug;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        // Redirect to login if unauthorized
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
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
  async uploadMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
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
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
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