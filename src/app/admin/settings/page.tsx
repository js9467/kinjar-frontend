'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, RequireRole } from '@/lib/auth';
import { api } from '@/lib/api';

interface GlobalSetting {
  key: string;
  value: any;
  updated_at: string;
  description?: string;
}

const SETTING_DEFINITIONS = [
  {
    key: 'registration_enabled',
    name: 'User Registration',
    description: 'Allow new users to register for accounts',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'family_creation_enabled', 
    name: 'Family Creation',
    description: 'Allow users to create new families',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'max_families_per_user',
    name: 'Max Families Per User',
    description: 'Maximum number of families a user can own/join',
    type: 'number',
    defaultValue: 5,
  },
  {
    key: 'max_upload_size_mb',
    name: 'Max Upload Size (MB)',
    description: 'Maximum file size for media uploads',
    type: 'number',
    defaultValue: 150,
  },
  {
    key: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Put the application in maintenance mode',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'welcome_message',
    name: 'Welcome Message',
    description: 'Message shown to new users',
    type: 'text',
    defaultValue: 'Welcome to Kinjar!',
  },
  {
    key: 'support_email',
    name: 'Support Email',
    description: 'Contact email for user support',
    type: 'email',
    defaultValue: 'support@kinjar.com',
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, GlobalSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Mock implementation - replace with actual API call
      const mockSettings: Record<string, GlobalSetting> = {};
      SETTING_DEFINITIONS.forEach(def => {
        mockSettings[def.key] = {
          key: def.key,
          value: def.defaultValue,
          updated_at: new Date().toISOString(),
          description: def.description,
        };
      });
      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating setting ${key} to:`, value);
      
      setSettings(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          value,
          updated_at: new Date().toISOString(),
        }
      }));
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
    } finally {
      setSaving(null);
    }
  };

  const renderSettingInput = (definition: typeof SETTING_DEFINITIONS[0]) => {
    const setting = settings[definition.key];
    const value = setting?.value ?? definition.defaultValue;
    const isLoading = saving === definition.key;

    switch (definition.type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateSetting(definition.key, e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {isLoading && <span className="ml-2 text-sm text-gray-500">Saving...</span>}
          </div>
        );
      
      case 'number':
        return (
          <div className="flex items-center">
            <input
              type="number"
              value={value}
              onChange={(e) => updateSetting(definition.key, parseInt(e.target.value))}
              disabled={isLoading}
              className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {isLoading && <span className="ml-2 text-sm text-gray-500">Saving...</span>}
          </div>
        );
      
      case 'email':
        return (
          <div className="flex items-center">
            <input
              type="email"
              value={value}
              onChange={(e) => updateSetting(definition.key, e.target.value)}
              disabled={isLoading}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {isLoading && <span className="ml-2 text-sm text-gray-500">Saving...</span>}
          </div>
        );
      
      case 'text':
      default:
        return (
          <div className="flex items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => updateSetting(definition.key, e.target.value)}
              disabled={isLoading}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {isLoading && <span className="ml-2 text-sm text-gray-500">Saving...</span>}
          </div>
        );
    }
  };

  return (
    <RequireRole role="ROOT">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Global Settings</h1>
                  <p className="mt-2 text-gray-600">
                    Configure application-wide settings and preferences
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Application Settings</h2>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {SETTING_DEFINITIONS.map(definition => (
                  <div key={definition.key} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {definition.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {definition.description}
                      </p>
                      {settings[definition.key]?.updated_at && (
                        <p className="mt-1 text-xs text-gray-400">
                          Last updated: {new Date(settings[definition.key].updated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-6">
                      {renderSettingInput(definition)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">System Information</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">API Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Database Status</dt>
                  <dd className="mt-1 text-sm text-green-600">Connected</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Storage Status</dt>
                  <dd className="mt-1 text-sm text-green-600">Connected</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Backup</dt>
                  <dd className="mt-1 text-sm text-gray-900">Not configured</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}