// API client for Kinjar platform
const API_BASE = process.env.KINJAR_API_URL || process.env.FLY_BACKEND_URL || 'https://kinjar-api.fly.dev';
const FLY_API_KEY = process.env.FLY_API_KEY;

interface ApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export class KinjarAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = API_BASE;
    this.apiKey = FLY_API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        ok: true,
        data,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Family endpoints
  async getFamily(familySlug: string) {
    return this.request(`/api/families/${familySlug}`);
  }

  async getFamilyPosts(familySlug: string) {
    return this.request(`/api/families/${familySlug}/posts`);
  }

  async createPost(familySlug: string, post: { title: string; content?: string; media_id?: string }) {
    return this.request(`/api/families/${familySlug}/posts`, {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  // Admin endpoints
  async getAllFamilies() {
    return this.request('/api/admin/families');
  }

  async getPlatformStats() {
    return this.request('/api/admin/stats');
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, familyName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, family_name: familyName }),
    });
  }
}

export const kinjarAPI = new KinjarAPI();

// Utility function to extract family slug from hostname
export function getFamilySlugFromHostname(hostname: string): string | null {
  if (!hostname.includes('.kinjar.com')) return null;
  if (hostname.startsWith('www.')) return null;
  
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[1] === 'kinjar' && parts[2] === 'com') {
    return parts[0];
  }
  
  return null;
}