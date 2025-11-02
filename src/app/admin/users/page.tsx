'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, RequireRole } from '@/lib/auth';
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  email: string;
  global_role: 'ROOT' | 'USER';
  created_at: string;
  display_name?: string;
  avatar_url?: string;
  family_count: number;
  post_count: number;
  comment_count: number;
  last_activity?: string;
  families: {
    slug: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
  }[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'admin@kinjar.com',
          global_role: 'ROOT',
          created_at: '2024-01-01T00:00:00Z',
          display_name: 'Admin User',
          family_count: 0,
          post_count: 0,
          comment_count: 0,
          families: [],
        },
        {
          id: '2',
          email: 'john.smith@example.com',
          global_role: 'USER',
          created_at: '2024-01-15T10:00:00Z',
          display_name: 'John Smith',
          family_count: 2,
          post_count: 15,
          comment_count: 23,
          last_activity: '2024-02-20T14:30:00Z',
          families: [
            { slug: 'smith-family', name: 'Smith Family', role: 'OWNER' },
            { slug: 'extended-smiths', name: 'Extended Smiths', role: 'MEMBER' },
          ],
        },
        {
          id: '3',
          email: 'jane.doe@example.com',
          global_role: 'USER',
          created_at: '2024-02-01T14:30:00Z',
          display_name: 'Jane Doe',
          family_count: 1,
          post_count: 8,
          comment_count: 12,
          last_activity: '2024-02-21T09:15:00Z',
          families: [
            { slug: 'doe-clan', name: 'Doe Clan', role: 'OWNER' },
          ],
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (user: AdminUser, newRole: 'ROOT' | 'USER') => {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating user ${user.email} role to: ${newRole}`);
      
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, global_role: newRole }
          : u
      ));
      
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RequireRole role="ROOT">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="mt-2 text-gray-600">
                    View and manage all user accounts and permissions
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
                  placeholder="Search users by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} users found
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Users</h2>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Families
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              {user.avatar_url ? (
                                <img 
                                  src={user.avatar_url} 
                                  alt={user.display_name}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-700">
                                  {user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.display_name || 'No display name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.global_role === 'ROOT' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.global_role === 'ROOT' ? 'Root Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.family_count} families
                          </div>
                          {user.families.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.families.map(f => (
                                <div key={f.slug}>
                                  {f.name} ({f.role})
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{user.post_count} posts</div>
                          <div className="text-xs text-gray-500">
                            {user.comment_count} comments
                          </div>
                          {user.last_activity && (
                            <div className="text-xs text-gray-500">
                              Last: {new Date(user.last_activity).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRoleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit Role
                            </button>
                            <a
                              href={`mailto:${user.email}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Contact
                            </a>
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

        {/* Role Update Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update User Role: {selectedUser.email}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Current role: <strong>{selectedUser.global_role === 'ROOT' ? 'Root Admin' : 'User'}</strong>
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="USER"
                        checked={selectedUser.global_role === 'USER'}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Regular User - Can create/join families
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="ROOT"
                        checked={selectedUser.global_role === 'ROOT'}
                        onChange={() => {}}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Root Admin - Full system access
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateUserRole(selectedUser, selectedUser.global_role === 'ROOT' ? 'USER' : 'ROOT')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Update Role
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