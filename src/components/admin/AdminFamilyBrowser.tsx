'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface AdminFamily {
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
}

export function AdminFamilyBrowser() {
  const [families, setFamilies] = useState<AdminFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const { isRootAdmin } = useAuth();

  useEffect(() => {
    if (isRootAdmin) {
      loadFamilies();
    }
  }, [isRootAdmin]);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.listAllFamilies(search, 50, 0);
      setFamilies(response.families);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load families:', error);
      setError('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFamilies();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isRootAdmin) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You need root admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Browser (Root Admin)</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search families..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {total} families total
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading families...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {families.map((family) => (
              <div key={family.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {family.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{family.name}</h3>
                        <p className="text-sm text-gray-500">@{family.slug}</p>
                      </div>
                      {family.isPublic && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    
                    {family.description && (
                      <p className="text-sm text-gray-600 mb-2">{family.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">{family.memberCount}</span> members
                      </div>
                      <div>
                        <span className="font-medium">{family.postCount}</span> posts
                      </div>
                      <div>
                        <span className="font-medium">{family.mediaCount}</span> media files
                      </div>
                      <div>
                        <span className="font-medium">{formatBytes(family.storageBytes)}</span> storage
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Created: {formatDate(family.createdAt)}</span>
                      <span>Last post: {formatDate(family.lastPostAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/families/${family.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      View Family
                    </Link>
                    <Link
                      href={`/admin/families/${family.slug}`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-center"
                    >
                      Admin Panel
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {families.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {search ? `No families found matching "${search}"` : 'No families found'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}