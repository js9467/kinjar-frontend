'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FamilyProfile } from '@/lib/types';

export default function HomePage() {
  const { user, loading, isRootAdmin, subdomainInfo } = useAuth();
  const router = useRouter();
  const [familyData, setFamilyData] = useState<FamilyProfile | null>(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirected, setRedirected] = useState(false);

  const loadFamilyData = useCallback(async () => {
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
  }, [subdomainInfo.familySlug]);

  useEffect(() => {
    if (loading || redirected) return; // Don't redirect if already redirected

    // Handle different routing scenarios
    if (subdomainInfo.isSubdomain) {
      // On a family subdomain - load family data
      loadFamilyData();
    } else if (user && isRootAdmin && !redirected) {
      // Root admin on main domain - redirect to admin
      setRedirected(true);
      router.replace('/admin');
    } else if (user && !redirected) {
      // Regular user on main domain - redirect to family selection
      setRedirected(true);
      router.replace('/families');
    }
    // If not authenticated, stay on home page (landing page)
  }, [user, loading, isRootAdmin, subdomainInfo.isSubdomain, loadFamilyData, redirected]); // Added redirected

  // Loading state
  if (loading || familyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Family subdomain - show family landing page
  if (subdomainInfo.isSubdomain) {
    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Family Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="https://www.kinjar.com" className="text-blue-600 hover:text-blue-700">
              ← Back to Kinjar
            </Link>
          </div>
        </div>
      );
    }

    if (!familyData) {
      return null; // Still loading
    }

    // If user is logged in and member of this family, redirect to family dashboard
    if (user && user.memberships.some((m: { familySlug: string }) => m.familySlug === subdomainInfo.familySlug)) {
      router.replace('/family');
      return null;
    }

    // Show public family landing page
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to {familyData.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {familyData.description || 'A family sharing their journey on Kinjar'}
            </p>
            
            {!user ? (
              <div className="space-x-4">
                <Link 
                  href="/auth/login"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sign In
                </Link>
                <Link 
                  href="https://www.kinjar.com/auth/register"
                  className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700"
                >
                  Create Your Family
                </Link>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-yellow-800 mb-4">
                  You&apos;re not a member of this family. Contact a family admin to request access.
                </p>
                <Link 
                  href="/families"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Your Families →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main domain - show marketing landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Kinjar
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              The family social platform that brings everyone together
            </p>
            
            {!user ? (
              <div className="space-x-4">
                <Link 
                  href="/auth/register"
                  className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 text-lg"
                >
                  Create Your Family Space
                </Link>
                <Link 
                  href="/auth/login"
                  className="inline-block border border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-50 text-lg"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  href="/families"
                  className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 text-lg"
                >
                  View Your Families
                </Link>
                {isRootAdmin && (
                  <Link 
                    href="/admin"
                    className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 text-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </header>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2">Family-First Design</h3>
              <p className="text-gray-600">
                Every family gets their own subdomain and private space to share memories safely.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Privacy Controls</h3>
              <p className="text-gray-600">
                Control who sees what with family-only, connected families, or public visibility options.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Age-Appropriate Roles</h3>
              <p className="text-gray-600">
                Different roles for different ages, from young children to adults, with appropriate permissions.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white rounded-lg shadow-lg p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to start your family&apos;s journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Create your family space in minutes and start sharing memories with those who matter most.
            </p>
            
            {!user && (
              <Link 
                href="/auth/register"
                className="inline-block bg-purple-600 text-white px-12 py-4 rounded-lg font-medium hover:bg-purple-700 text-xl"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}