'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NotificationSettings } from '@/lib/types';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettingsComponent({ className = '' }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await api.getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setError('Failed to load notification settings');
      // Set default settings if load fails
      setSettings({
        emailNotifications: {
          familyInvitationAccepted: true,
          connectionRequestAccepted: true,
          newFamilyMemberJoined: true,
          familyConnectionEstablished: true,
          newPostInConnectedFamily: false,
        },
        pushNotifications: {
          enabled: false,
          newComments: false,
          newReactions: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.updateNotificationSettings(settings);
      setSuccess('Notification settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setError('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await api.sendNotificationTestEmail();
      setSuccess(response.message || 'Test email sent successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Failed to send test email:', error);
      setError('Failed to send test email');
    } finally {
      setSaving(false);
    }
  };

  const updateEmailSetting = (key: keyof NotificationSettings['emailNotifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: value,
      },
    });
  };

  const updatePushSetting = (key: keyof NotificationSettings['pushNotifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600">Failed to load notification settings</p>
          <button
            onClick={loadSettings}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600 mt-1">Manage how and when you receive notifications from Kinjar.</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Family invitation accepted</span>
                <p className="text-sm text-gray-500">Get notified when someone accepts your family creation invitation</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications.familyInvitationAccepted}
                onChange={(e) => updateEmailSetting('familyInvitationAccepted', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Connection request accepted</span>
                <p className="text-sm text-gray-500">Get notified when a family accepts your connection request</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications.connectionRequestAccepted}
                onChange={(e) => updateEmailSetting('connectionRequestAccepted', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">New family member joined</span>
                <p className="text-sm text-gray-500">Get notified when someone joins your family</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications.newFamilyMemberJoined}
                onChange={(e) => updateEmailSetting('newFamilyMemberJoined', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Family connection established</span>
                <p className="text-sm text-gray-500">Get notified when two families connect successfully</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications.familyConnectionEstablished}
                onChange={(e) => updateEmailSetting('familyConnectionEstablished', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Posts from connected families</span>
                <p className="text-sm text-gray-500">Get notified about new posts from families you're connected with</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications.newPostInConnectedFamily}
                onChange={(e) => updateEmailSetting('newPostInConnectedFamily', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Enable push notifications</span>
                <p className="text-sm text-gray-500">Allow Kinjar to send push notifications to your device</p>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications.enabled}
                onChange={(e) => updatePushSetting('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            {settings.pushNotifications.enabled && (
              <>
                <label className="flex items-center justify-between pl-6">
                  <div>
                    <span className="text-gray-700 font-medium">New comments</span>
                    <p className="text-sm text-gray-500">Get notified when someone comments on your posts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications.newComments}
                    onChange={(e) => updatePushSetting('newComments', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between pl-6">
                  <div>
                    <span className="text-gray-700 font-medium">New reactions</span>
                    <p className="text-sm text-gray-500">Get notified when someone reacts to your posts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications.newReactions}
                    onChange={(e) => updatePushSetting('newReactions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={sendTestEmail}
            disabled={saving}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Test Email
          </button>
        </div>
      </div>
    </div>
  );
}