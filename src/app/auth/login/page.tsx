'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';

export default function LoginPage() {
  const { login, subdomainInfo } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

export default function LoginPage() {
  const { login, subdomainInfo } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(formData.email, formData.password);

      // Determine where to redirect based on user role and current context
      if (loggedInUser.globalRole === 'ROOT_ADMIN') {
        router.replace('/admin');
      } else if (subdomainInfo.isSubdomain) {
        // On a family subdomain, redirect to family page
        router.replace('/');
      } else {
        // On root domain, redirect to family selection
        router.replace('/families');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetLoading(true);
      setResetError('');
      setResetMessage('');
      
      await api.forgotPassword(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox for instructions.');
      setResetEmail('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const pageTitle = subdomainInfo.isSubdomain 
    ? `Welcome to ${subdomainInfo.familySlug} Family`
    : 'Welcome Back';

  const pageSubtitle = subdomainInfo.isSubdomain
    ? 'Sign in to your family space'
    : 'Sign in to Kinjar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-600">{pageSubtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!showResetPassword ? (
          // Sign In Form
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
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
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowResetPassword(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        ) : (
          // Reset Password Form
          <div>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {resetMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {resetError}
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {resetLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Email...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetEmail('');
                  setResetMessage('');
                  setResetError('');
                }}
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        )}

        {!subdomainInfo.isSubdomain && !showResetPassword && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Create your family space
              </Link>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}