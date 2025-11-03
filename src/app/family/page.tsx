'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function FamilyPage() {
  const { user, loading, subdomainInfo } = useAuth();
  const router = useRouter();
  const [familyData, setFamilyData] = useState(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!subdomainInfo.isSubdomain) {
      // Not on a family subdomain, redirect to home
      router.replace('/');
      return;
    }

    if (!user) {
      // Not authenticated, redirect to login
      router.replace('/auth/login');
      return;
    }

    // Check if user is member of this family
    const isMember = user.memberships.some(m => m.familySlug === subdomainInfo.familySlug);
    if (!isMember) {
      // Not a member, redirect to home
      router.replace('/');
      return;
    }

    loadFamilyData();
  }, [user, loading, subdomainInfo, router]);

  const loadFamilyData = async () => {
    if (!subdomainInfo.familySlug) return;

    setFamilyLoading(true);
    try {
      const family = await api.getFamilyBySlug(subdomainInfo.familySlug);
      setFamilyData(family);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family');
    } finally {
      setFamilyLoading(false);
    }
  };

  if (loading || familyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!familyData || !user) {
    return null;
  }

  const userMembership = user.memberships.find(m => m.familySlug === subdomainInfo.familySlug);
  const isAdmin = userMembership?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{familyData.name}</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: {userMembership?.role.replace('_', ' ').toLowerCase()}
              </span>
              <button 
                onClick={() => api.logout()}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Family Info */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Family Information</h2>
            <p className="text-gray-600 mb-4">{familyData.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Members:</span> {familyData.members?.length || 0}
              </div>
              <div>
                <span className="font-medium">Storage Used:</span> {familyData.storageUsedMb || 0} MB
              </div>
            </div>
          </div>

          {/* Family Feed Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Family Feed</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">🏠</p>
              <p>Family feed coming soon!</p>
              <p className="text-sm">Share photos, videos, and memories with your family.</p>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Family Admin</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Invite Members
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                  Manage Settings
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Family Connections
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Privacy Controls
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}