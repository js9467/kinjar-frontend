'use client';

import { useEffect, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'search' | 'connections' | 'invite'>('connections');
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
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'connections') {
      loadConnections();
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
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
                      </div>
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
                                <button
                                  onClick={() => loadFamilyDetails(connection.otherFamilySlug)}
                                  disabled={loadingFamilyDetails}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                                >
                                  View Details
                                </button>
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
      </div>
    </div>
  );
}