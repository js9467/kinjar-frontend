'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface FamilySearchResult {
  id: string;
  slug: string;
  name: string;
  description?: string;
  familyPhoto?: string;
  themeColor: string;
  memberCount: number;
  createdAt: string;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'declined';
}

interface FamilyConnection {
  id: string;
  direction: 'incoming' | 'outgoing';
  otherFamilySlug: string;
  otherFamilyName: string;
  status: 'pending' | 'accepted' | 'declined';
  requestMessage?: string;
  responseMessage?: string;
  requesterName: string;
  responderName?: string;
  createdAt: string;
  respondedAt?: string;
  memberCount?: number;
  themeColor?: string;
}

interface FamilyDetails {
  id: string;
  slug: string;
  name: string;
  description?: string;
  themeColor: string;
  members: Array<{
    id: string;
    name: string;
    age?: number;
    role: string;
    avatarColor: string;
  }>;
  createdAt: string;
}

interface FamilyConnectionsManagerProps {
  tenantSlug: string;
}

export function FamilyConnectionsManager({ tenantSlug }: FamilyConnectionsManagerProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'connections' | 'invite' | 'pending'>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FamilySearchResult[]>([]);
  const [connections, setConnections] = useState<FamilyConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<FamilyDetails | null>(null);
  const [loadingFamilyDetails, setLoadingFamilyDetails] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'connections') {
      loadConnections();
    } else if (activeTab === 'pending') {
      loadPendingInvitations();
    }
  }, [activeTab, tenantSlug]);

  const searchFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.searchFamilies(searchQuery, 20, 0, tenantSlug);
      setSearchResults(response.families);
    } catch (error) {
      console.error('Failed to search families:', error);
      setError('Failed to search families');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getFamilyConnections(tenantSlug);
      setConnections(response.connections);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getPendingInvitations(tenantSlug);
      // Filter to only show family creation invitations - member invitations are in Family Admin
      const familyCreationInvitations = response.invitations.filter(
        invitation => invitation.type === 'family_creation'
      );
      setPendingInvitations(familyCreationInvitations);
    } catch (error) {
      console.error('Failed to load pending invitations:', error);
      // Don't show error to user if API endpoint doesn't exist yet (404)
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Pending invitations API not implemented yet, using empty state');
        setPendingInvitations([]);
        setError(null); // Don't show error for missing endpoint
      } else {
        setError('Failed to load pending invitations');
        setPendingInvitations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyDetails = async (familySlug: string) => {
    try {
      setLoadingFamilyDetails(true);
      const familyData = await api.getFamilyBySlug(familySlug);
      setSelectedFamily({
        id: familyData.id,
        slug: familyData.slug,
        name: familyData.name,
        description: familyData.description,
        themeColor: familyData.themeColor,
        members: familyData.members.map((member: any) => ({
          id: member.id,
          name: member.name,
          age: member.age,
          role: member.role,
          avatarColor: member.avatarColor
        })),
        createdAt: familyData.createdAt
      });
    } catch (error) {
      console.error('Failed to load family details:', error);
      setError('Failed to load family details');
    } finally {
      setLoadingFamilyDetails(false);
    }
  };

  const requestConnection = async (targetFamilySlug: string) => {
    try {
      await api.requestFamilyConnection(targetFamilySlug, undefined, tenantSlug);
      // Refresh search results to update connection status
      searchFamilies();
    } catch (error) {
      console.error('Failed to request connection:', error);
      setError('Failed to send connection request');
    }
  };

  const respondToConnection = async (connectionId: string, action: 'accept' | 'decline') => {
    try {
      await api.respondToFamilyConnection(connectionId, action);
      // Refresh connections list
      loadConnections();
    } catch (error) {
      console.error('Failed to respond to connection:', error);
      setError('Failed to respond to connection request');
    }
  };

  const sendFamilyInvitation = async () => {
    if (!inviteEmail || !inviteName) {
      setError('Email and name are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.sendFamilyCreationInvitation({
        email: inviteEmail,
        name: inviteName,
        message: inviteMessage
      }, tenantSlug);
      
      // Clear form
      setInviteEmail('');
      setInviteName('');
      setInviteMessage('');
      
      setError(null);
      alert(`Invitation sent to ${inviteEmail}!`);
    } catch (error) {
      console.error('Failed to send family invitation:', error);
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleResendInvitation = async (invitation: any) => {
    if (!confirm(`Resend invitation to ${invitation.recipientName} (${invitation.recipientEmail})?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.resendInvitation(invitation.id, tenantSlug);
      
      if (result.ok) {
        alert(`Invitation resent successfully! ${result.emailSent ? 'Email sent.' : 'Email sending failed - check logs.'}`);
        // Refresh the pending invitations list
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

  const handleCancelInvitation = async (invitation: any) => {
    if (!confirm(`Cancel invitation for ${invitation.recipientName} (${invitation.recipientEmail})? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.cancelInvitation(invitation.id, tenantSlug);
      
      if (result.ok) {
        alert('Invitation cancelled successfully');
        // Remove from list immediately and refresh
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        await loadPendingInvitations();
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

  const handleDisconnectFamily = async (connection: FamilyConnection) => {
    const familyName = connection.otherFamilyName;
    
    if (!confirm(`Are you sure you want to disconnect from ${familyName}? This will stop content sharing between your families and cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.disconnectFromFamily(connection.id, tenantSlug);
      
      if (result.ok) {
        alert(`Successfully disconnected from ${result.disconnected_family.name}`);
        // Remove from connections list and refresh
        setConnections(prev => prev.filter(conn => conn.id !== connection.id));
        await loadConnections();
      } else {
        alert('Failed to disconnect from family. Please try again.');
      }
    } catch (error) {
      console.error('Failed to disconnect from family:', error);
      alert('Failed to disconnect from family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Search Families
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Connections
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invite'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Invite New Family
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Invites
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Families to Connect With</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search family names..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchFamilies()}
                />
                <button
                  onClick={searchFamilies}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((family) => (
                  <div key={family.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: family.themeColor }}
                        >
                          {family.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{family.name}</h4>
                          <p className="text-sm text-gray-500">
                            {family.memberCount} member{family.memberCount === 1 ? '' : 's'} • Created {formatDate(family.createdAt)}
                          </p>
                          {family.description && (
                            <p className="text-sm text-gray-600 mt-1">{family.description}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {family.connectionStatus === 'none' && (
                          <button
                            onClick={() => requestConnection(family.slug)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                          >
                            Request Connection
                          </button>
                        )}
                        {family.connectionStatus === 'pending' && (
                          <span className="text-yellow-600 font-medium">Request Pending</span>
                        )}
                        {family.connectionStatus === 'accepted' && (
                          <span className="text-green-600 font-medium">Connected</span>
                        )}
                        {family.connectionStatus === 'declined' && (
                          <span className="text-red-600 font-medium">Request Declined</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">No families found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            {selectedFamily ? (
              // Show family details view
              <div>
                <button
                  onClick={() => setSelectedFamily(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Connections
                </button>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div 
                    className="w-full h-24 rounded-lg mb-4"
                    style={{ backgroundColor: selectedFamily.themeColor }}
                  />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedFamily.name}</h3>
                  {selectedFamily.description && (
                    <p className="text-gray-600 mb-4">{selectedFamily.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-6">
                    Connected since {new Date(selectedFamily.createdAt).toLocaleDateString()}
                  </p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Family Members ({selectedFamily.members.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedFamily.members.map((member) => (
                      <Link 
                        key={member.id} 
                        href={`/profile/${member.id}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: member.avatarColor }}
                        >
                          {member.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            {member.age ? `${member.age} years old` : 'Age not specified'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Show connections list
              <>
                <h3 className="text-lg font-semibold text-gray-900">
                  Family Connections ({connections.filter(c => c.status === 'accepted').length})
                </h3>
                
                {connections.length > 0 ? (
                  <div className="space-y-4">
                    {connections.map((connection) => (
                      <div key={connection.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                style={{ backgroundColor: connection.themeColor || '#0ea5e9' }}
                              >
                                {connection.otherFamilyName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{connection.otherFamilyName}</h4>
                                <p className="text-sm text-gray-500">
                                  {connection.direction === 'outgoing' ? 'You requested' : 'They requested'} • {formatDate(connection.createdAt)}
                                </p>
                                {connection.requestMessage && (
                                  <p className="text-sm text-gray-600 mt-1">"{connection.requestMessage}"</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Requested by: {connection.requesterName}
                                  {connection.responderName && ` • Responded by: ${connection.responderName}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col gap-2">
                            {connection.status === 'pending' && connection.direction === 'incoming' && (
                              <>
                                <button
                                  onClick={() => respondToConnection(connection.id, 'accept')}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondToConnection(connection.id, 'decline')}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 text-sm"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {connection.status === 'pending' && connection.direction === 'outgoing' && (
                              <span className="text-yellow-600 font-medium text-sm">Pending Response</span>
                            )}
                            {connection.status === 'accepted' && (
                              <>
                                <span className="text-green-600 font-medium text-sm">Connected</span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => loadFamilyDetails(connection.otherFamilySlug)}
                                    disabled={loadingFamilyDetails}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleDisconnectFamily(connection)}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                  >
                                    Disconnect
                                  </button>
                                </div>
                              </>
                            )}
                            {connection.status === 'declined' && (
                              <span className="text-red-600 font-medium text-sm">Declined</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No family connections yet</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Search for families to connect with
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Invite Tab */}
        {activeTab === 'invite' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Someone to Create a Family</h3>
              <p className="text-gray-600 mb-4">
                Send an invitation to someone to create their own family space on Kinjar. 
                When they accept, your families will automatically be connected.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Their Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Friend's name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="We'd love to connect our families on Kinjar!"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={sendFamilyInvitation}
                disabled={loading || !inviteEmail || !inviteName}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending Invitation...' : 'Send Family Invitation'}
              </button>
            </div>
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Family Creation Invitations</h3>
              <p className="text-gray-600 mb-4">
                Track family creation invitations you've sent that are still pending. Member invitations are managed in Family Admin.
              </p>
            </div>

            {pendingInvitations.length > 0 ? (
              <div className="space-y-4">
                {pendingInvitations.map((invitation, index) => (
                  <div key={invitation.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            invitation.type === 'family_creation' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {invitation.type === 'family_creation' ? 'Family Creation' : 'Connection Request'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Sent by {invitation.invitedBy || 'You'}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900">{invitation.recipientName}</h4>
                        <p className="text-sm text-gray-500">{invitation.recipientEmail}</p>
                        
                        {invitation.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{invitation.message}"</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Sent: {formatDate(invitation.sentAt)}</span>
                          {invitation.expiresAt && (
                            <span>Expires: {formatDate(invitation.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                        
                        <div className="flex space-x-2">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Family Creation Invitations</h3>
                <p className="text-gray-600 mb-4">
                  You haven't sent any family creation invitations yet, or all have been accepted.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Member invitations are managed in the Family Admin section.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Send a Family Invitation
                  </button>
                  <span className="text-gray-400">or</span>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Search for Families
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}