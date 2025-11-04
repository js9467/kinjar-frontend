'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

interface InvitationDetails {
  email: string;
  role: string;
  familyName: string;
  familySlug: string;
  expiresAt: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token');
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(!!invitationToken);
  
  const [formData, setFormData] = useState({
    // Personal info
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    // Family info (only for new family creation)
    familyName: '',
    subdomain: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = personal info, 2 = family info

  // Load invitation details if token is provided
  useEffect(() => {
    if (invitationToken) {
      loadInvitationDetails();
    }
  }, [invitationToken]);

  const loadInvitationDetails = async () => {
    try {
      setLoadingInvitation(true);
      const details = await api.getInvitationDetails(invitationToken!);
      setInvitationDetails(details);
      
      // Pre-fill the email from invitation
      setFormData(prev => ({
        ...prev,
        adminEmail: details.email
      }));
      
      setError('');
    } catch (err) {
      setError('Invalid or expired invitation link');
    } finally {
      setLoadingInvitation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invitationDetails) {
      // Invitation-based registration
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await api.registerWithInvitation({
          email: formData.adminEmail,
          password: formData.password,
          token: invitationToken!
        });
        
        // Redirect to family page after successful registration
        if (response.family) {
          window.location.href = `https://${response.family.slug}.kinjar.com`;
        } else {
          router.push('/');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        setLoading(false);
      }
      return;
    }
    
    // Regular family creation flow
    if (step === 1) {
      // Validate personal info
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      // Move to step 2
      setStep(2);
      setError('');
      return;
    }

    // Step 2: Create family and user
    setLoading(true);
    setError('');

    try {
      // Create family and admin user
      const response = await api.createFamily({
        familyName: formData.familyName.trim(),
        subdomain: formData.subdomain.trim().toLowerCase(),
        description: formData.description.trim(),
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        password: formData.password,
        isPublic: formData.isPublic
      });
      
      // Redirect to family page after successful creation
      window.location.href = `https://${formData.subdomain}.kinjar.com`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-generate subdomain from family name
    if (name === 'familyName') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
        .substring(0, 20); // Limit length
      setFormData(prev => ({
        ...prev,
        subdomain
      }));
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {invitationDetails 
              ? `Join ${invitationDetails.familyName}` 
              : step === 1 ? 'Create Your Account' : 'Set Up Your Family'}
          </h1>
          <p className="text-gray-600">
            {invitationDetails 
              ? 'Complete your registration to join your family on Kinjar'
              : step === 1 
                ? 'Join Kinjar and create your family space' 
                : 'Choose your family name and subdomain'}
          </p>
        </div>

        {/* Invitation details banner */}
        {invitationDetails && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>You're invited!</strong> You'll be joining as a <strong>{invitationDetails.role.toLowerCase()}</strong> member.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Invitation expires: {new Date(invitationDetails.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator - only show for new family creation */}
        {!invitationDetails && (
          <div className="flex mb-8">
            <div className={`flex-1 h-2 rounded-l ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-2 rounded-r ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {(step === 1 || invitationDetails) && (
            <>
              {!invitationDetails && (
                <div>
                  <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  disabled={!!invitationDetails}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    invitationDetails ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your email address"
                />
                {invitationDetails && (
                  <p className="text-sm text-gray-500 mt-1">This email was specified in your invitation</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a secure password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          {step === 2 && !invitationDetails && (
            <>
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Family Name
                </label>
                <input
                  type="text"
                  id="familyName"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Smith Family, The Johnsons"
                />
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                  Family URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9-]+"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="smithfamily"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .kinjar.com
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your family will be available at: {formData.subdomain || 'your-family'}.kinjar.com
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Family Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your family..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this family discoverable publicly
                </label>
              </div>
            </>
          )}

          <div className="flex gap-4">
            {step === 2 && !invitationDetails && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {invitationDetails ? 'Joining Family...' : 'Creating Family...'}
                </>
              ) : (
                invitationDetails 
                  ? 'Join Family'
                  : step === 1 ? 'Next: Family Setup' : 'Create Family Space'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading registration form...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}