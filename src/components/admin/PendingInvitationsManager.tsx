'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PendingInvitation {
  id: string;
  type: 'member_invitation' | 'family_creation';
  recipientEmail: string;
  recipientName: string;
  message?: string;
  sentAt: string;
  expiresAt?: string;
  status: string;
  invitedBy: string;
}

interface PendingInvitationsManagerProps {
  familySlug: string;
}

export function PendingInvitationsManager({ familySlug }: PendingInvitationsManagerProps) {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPendingInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPendingInvitations(familySlug);
      // Filter to only show family member invitations - family creation invitations belong in Connections
      const memberInvitations = (response.invitations || []).filter(
        invitation => invitation.type === 'member_invitation'
      );
      setInvitations(memberInvitations);
    } catch (error) {
      console.error('Failed to load pending invitations:', error);
      setError('Failed to load pending invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familySlug) {
      loadPendingInvitations();
    }
  }, [familySlug]);

  const handleResendInvitation = async (invitation: PendingInvitation) => {
    if (!confirm(`Resend invitation to ${invitation.recipientName} (${invitation.recipientEmail})?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.resendInvitation(invitation.id, familySlug);
      
      if (result.ok) {
        alert(`Invitation resent successfully! ${result.emailSent ? 'Email sent.' : 'Email sending failed - check logs.'}`);
        // Refresh the list to get updated expiry dates
        await loadPendingInvitations();
      } else {
        alert('Failed to resend invitation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert('Failed to resend invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitation: PendingInvitation) => {
    if (!confirm(`Cancel invitation for ${invitation.recipientName} (${invitation.recipientEmail})? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.cancelInvitation(invitation.id, familySlug);
      
      if (result.ok) {
        alert('Invitation cancelled successfully');
        // Remove from list immediately
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      } else {
        alert('Failed to cancel invitation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      alert('Failed to cancel invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTypeLabel = (type: string) => {
    // Only member invitations are shown here - family creation invitations are in Connections
    return 'Family Member';
  };

  const getTypeColor = (type: string) => {
    // Only member invitations are shown here
    return 'bg-blue-100 text-blue-800';
  };

  if (loading && invitations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pending invitations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadPendingInvitations}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-5.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H1" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending member invitations</h3>
        <p className="mt-1 text-sm text-gray-500">All family member invitations have been accepted or expired.</p>
        <p className="mt-1 text-xs text-gray-400">Family creation invitations are managed in the Connections section.</p>
      </div>
    );
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Pending Member Invitations ({invitations.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              People invited to join your family. Family creation invitations are managed in Connections.
            </p>
          </div>
          <button
            onClick={loadPendingInvitations}
            disabled={loading}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(invitation.type)}`}>
                    {getTypeLabel(invitation.type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Sent by {invitation.invitedBy}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900">{invitation.recipientName}</h4>
                <p className="text-sm text-gray-600">{invitation.recipientEmail}</p>
                
                {invitation.message && (
                  <p className="text-sm text-gray-500 mt-1 italic">"{invitation.message}"</p>
                )}
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Sent: {formatDate(invitation.sentAt)}</span>
                  {invitation.expiresAt && (
                    <span>Expires: {formatDate(invitation.expiresAt)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleResendInvitation(invitation)}
                  disabled={loading}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend
                </button>
                <button
                  onClick={() => handleCancelInvitation(invitation)}
                  disabled={loading}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}