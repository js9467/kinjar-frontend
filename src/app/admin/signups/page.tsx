'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, RequireRole } from '@/lib/auth';
import { api } from '@/lib/api';

interface SignupRequest {
  id: string;
  email: string;
  tenant_name: string;
  desired_slug?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  decided_at?: string;
  decided_by?: string;
  decision_reason?: string;
}

export default function AdminSignups() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'deny'>('approve');
  const [decisionReason, setDecisionReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRequests: SignupRequest[] = [
        {
          id: '1',
          email: 'newuser1@example.com',
          tenant_name: 'Johnson Family',
          desired_slug: 'johnson-family',
          status: 'pending',
          created_at: '2024-02-20T10:00:00Z',
        },
        {
          id: '2',
          email: 'newuser2@example.com',
          tenant_name: 'Wilson Clan',
          desired_slug: 'wilson-clan',
          status: 'pending',
          created_at: '2024-02-19T15:30:00Z',
        },
        {
          id: '3',
          email: 'approved@example.com',
          tenant_name: 'Brown Family',
          desired_slug: 'brown-family',
          status: 'approved',
          created_at: '2024-02-18T09:15:00Z',
          decided_at: '2024-02-18T10:00:00Z',
          decided_by: 'admin@kinjar.com',
        },
        {
          id: '4',
          email: 'denied@example.com',
          tenant_name: 'Test Family',
          desired_slug: 'test-family',
          status: 'denied',
          created_at: '2024-02-17T14:20:00Z',
          decided_at: '2024-02-17T16:30:00Z',
          decided_by: 'admin@kinjar.com',
          decision_reason: 'Inappropriate family name',
        },
      ];

      const filtered = mockRequests.filter(req => req.status === filter);
      setRequests(filtered);
    } catch (error) {
      console.error('Failed to load signup requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (request: SignupRequest, decision: 'approve' | 'deny') => {
    try {
      // Mock implementation - replace with actual API call
      console.log(`${decision} signup request ${request.id}`, {
        reason: decisionReason,
      });

      // Update the request in the list
      setRequests(prev => prev.filter(r => r.id !== request.id));
      setShowDecisionModal(false);
      setSelectedRequest(null);
      setDecisionReason('');
    } catch (error) {
      console.error(`Failed to ${decision} signup request:`, error);
    }
  };

  const openDecisionModal = (request: SignupRequest, type: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setDecisionType(type);
    setShowDecisionModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                  <h1 className="text-3xl font-bold text-gray-900">Signup Requests</h1>
                  <p className="mt-2 text-gray-600">
                    Review and manage family registration requests
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
          {/* Filter Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {(['pending', 'approved', 'denied'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      filter === status
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} Requests
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Requests
              </h2>
            </div>
            
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No {filter} requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Family Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {filter !== 'pending' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Decision Details
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.tenant_name}
                          </div>
                          {request.desired_slug && (
                            <div className="text-sm text-gray-500">
                              Slug: {request.desired_slug}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(request.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        {filter !== 'pending' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              By: {request.decided_by}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.decided_at && new Date(request.decided_at).toLocaleString()}
                            </div>
                            {request.decision_reason && (
                              <div className="text-sm text-gray-500 mt-1">
                                Reason: {request.decision_reason}
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {filter === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openDecisionModal(request, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openDecisionModal(request, 'deny')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Deny
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              {request.status === 'approved' ? 'Approved' : 'Denied'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Decision Modal */}
        {showDecisionModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {decisionType === 'approve' ? 'Approve' : 'Deny'} Signup Request
                </h3>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Family:</strong> {selectedRequest.tenant_name}</p>
                    {selectedRequest.desired_slug && (
                      <p><strong>Slug:</strong> {selectedRequest.desired_slug}</p>
                    )}
                  </div>
                  {decisionType === 'deny' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for denial:
                      </label>
                      <textarea
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="Enter reason for denial..."
                      />
                    </div>
                  )}
                  {decisionType === 'approve' && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        This will create a new family "{selectedRequest.tenant_name}" with {selectedRequest.email} as the owner.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDecisionModal(false);
                      setSelectedRequest(null);
                      setDecisionReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDecision(selectedRequest, decisionType)}
                    disabled={decisionType === 'deny' && !decisionReason.trim()}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      decisionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-300'
                    }`}
                  >
                    {decisionType === 'approve' ? 'Approve Request' : 'Deny Request'}
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