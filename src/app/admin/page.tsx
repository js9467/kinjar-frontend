'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, RequireRole } from '@/lib/auth';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalFamilies: number;
  pendingSignups: number;
  totalPosts: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock data for now - will implement real API calls
        setStats({
          totalUsers: 0,
          totalFamilies: 0,
          pendingSignups: 0,
          totalPosts: 0,
          activeUsers: 0,
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <RequireRole role="ROOT" fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need root admin privileges to access this page.</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome, {user?.email} - Root Administrator
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats?.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Families</h3>
              <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats?.totalFamilies}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Pending Signups</h3>
              <p className="text-3xl font-bold text-orange-600">{loading ? '...' : stats?.pendingSignups}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
              <p className="text-3xl font-bold text-purple-600">{loading ? '...' : stats?.totalPosts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{loading ? '...' : stats?.activeUsers}</p>
            </div>
          </div>

          {/* Admin Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard
              title="User Management"
              description="View and manage all users, roles, and permissions"
              href="/admin/users"
              icon="👥"
            />
            <AdminCard
              title="Family Management"
              description="Manage families, suspend accounts, view statistics"
              href="/admin/families"
              icon="🏠"
            />
            <AdminCard
              title="Signup Requests"
              description="Review and approve pending family registration requests"
              href="/admin/signups"
              icon="📝"
            />
            <AdminCard
              title="Global Settings"
              description="Configure application-wide settings and preferences"
              href="/admin/settings"
              icon="⚙️"
            />
            <AdminCard
              title="Audit Log"
              description="View system events and administrative actions"
              href="/admin/audit"
              icon="📋"
            />
            <AdminCard
              title="System Status"
              description="Monitor system health, storage, and performance"
              href="/admin/status"
              icon="📊"
            />
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

function AdminCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a 
      href={href}
      className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </a>
  );
}