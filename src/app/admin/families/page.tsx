'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, RequireRole } from '@/lib/auth';
import { api } from '@/lib/api';

interface Family {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  member_count: number;
  post_count: number;
  is_suspended: boolean;
  suspension_reason?: string;
}

export default function AdminFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFamilies: Family[] = [
        {
          id: '1',
          slug: 'smith-family',
          name: 'Smith Family',
          created_at: '2024-01-15T10:00:00Z',
          member_count: 5,
          post_count: 24,
          is_suspended: false,
        },
        {
          id: '2', 
          slug: 'jones-clan',
          name: 'Jones Clan',
          created_at: '2024-02-01T14:30:00Z',
          member_count: 8,
          post_count: 47,
          is_suspended: true,
          suspension_reason: 'Inappropriate content reports',
        },
      ];
      setFamilies(mockFamilies);
    } catch (error) {
      console.error('Failed to load families:', error);
    } finally {
      setLoading(false);
    }
  };

  const suspendFamily = async (family: Family) => {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Suspending family ${family.slug} with reason: ${suspendReason}`);
      
      setFamilies(prev => prev.map(f => 
        f.id === family.id 
          ? { ...f, is_suspended: true, suspension_reason: suspendReason }
          : f
      ));
      
      setShowSuspendModal(false);
      setSelectedFamily(null);
      setSuspendReason('');
    } catch (error) {
      console.error('Failed to suspend family:', error);
    }
  };

  const unsuspendFamily = async (family: Family) => {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Unsuspending family ${family.slug}`);
      
      setFamilies(prev => prev.map(f => 
        f.id === family.id 
          ? { ...f, is_suspended: false, suspension_reason: undefined }
          : f
      ));
    } catch (error) {
      console.error('Failed to unsuspend family:', error);
    }
  };

  const filteredFamilies = families.filter(family =>
    family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    family.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RequireRole role="ROOT">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
                  <p className="mt-2 text-gray-600">
                    View and manage all family accounts
                  </p>
                </div>
                <a 
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white shadow rounded-lg mb-6 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search families by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredFamilies.length} families found
              </div>
            </div>
          </div>

          {/* Families Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Families</h2>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : filteredFamilies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No families found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Family
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFamilies.map((family) => (
                      <tr key={family.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {family.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{family.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(family.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {family.member_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {family.post_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {family.is_suspended ? (
                            <div>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Suspended
                              </span>
                              {family.suspension_reason && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {family.suspension_reason}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={`/families/${family.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                            {family.is_suspended ? (
                              <button
                                onClick={() => unsuspendFamily(family)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedFamily(family);
                                  setShowSuspendModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Suspend Family Modal */}
        {showSuspendModal && selectedFamily && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Suspend Family: {selectedFamily.name}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for suspension:
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSuspendModal(false);
                      setSelectedFamily(null);
                      setSuspendReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => suspendFamily(selectedFamily)}
                    disabled={!suspendReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 rounded-md"
                  >
                    Suspend Family
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireRole>
  );
}