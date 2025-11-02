import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface Family {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content?: string;
  author_email: string;
  author_name?: string;
  created_at: string;
  media_url?: string;
  media_filename?: string;
  view_count: number;
}

interface FamilyPageProps {
  family: Family | null;
  posts: Post[];
  isAuthenticated: boolean;
  familySlug: string;
  isSubdomain: boolean;
  error?: string;
}

export default function FamilyPage({ 
  family, 
  posts, 
  isAuthenticated, 
  familySlug, 
  isSubdomain,
  error 
}: FamilyPageProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Family Not Found</h1>
          <p className="text-gray-600">{error}</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{family?.name} - Kinjar Family Platform</title>
        <meta name="description" content={`${family?.name} family memories and connections`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Family Header */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{family?.name}</h1>
                <p className="text-gray-600">
                  {isSubdomain ? `${familySlug}.kinjar.com` : `kinjar.com/${familySlug}`}
                </p>
              </div>
              
              <div className="flex space-x-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={isSubdomain ? "/admin" : `/${familySlug}/admin`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Admin
                    </Link>
                    <button
                      onClick={() => router.push('/auth/logout')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {isAuthenticated ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2">
                {/* Post Creation Form */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Share a Memory</h2>
                  <form 
                    className="space-y-4" 
                    action={isSubdomain ? "/api/posts" : `/api/families/${familySlug}/posts`}
                    method="POST"
                    encType="multipart/form-data"
                  >
                    <input
                      type="text"
                      name="title"
                      placeholder="What's the story behind this memory?"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <textarea
                      name="content"
                      placeholder="Tell us more..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="media-upload"
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 cursor-pointer"
                      >
                        📷 Add Photo/Video
                      </label>
                      <input
                        type="file"
                        id="media-upload"
                        name="media"
                        accept="image/*,video/*"
                        className="hidden"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                      >
                        Share
                      </button>
                    </div>
                  </form>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                          <div>
                            <h3 className="font-semibold">{post.author_name || post.author_email}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                        {post.content && (
                          <p className="text-gray-700 mb-4">{post.content}</p>
                        )}
                        
                        {post.media_url && (
                          <div className="mb-4">
                            {post.media_filename?.includes('.mp4') || post.media_filename?.includes('.mov') ? (
                              <video controls className="w-full rounded-lg">
                                <source src={post.media_url} type="video/mp4" />
                              </video>
                            ) : (
                              <img 
                                src={post.media_url} 
                                alt={post.title}
                                className="w-full rounded-lg"
                              />
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👁 {post.view_count} views</span>
                          <button type="button" className="hover:text-blue-600">💬 Comment</button>
                          <button type="button" className="hover:text-blue-600">❤️ Like</button>
                          <button type="button" className="hover:text-blue-600">🔗 Share</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No memories yet</h3>
                      <p className="text-gray-500">Be the first to share a family memory!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Family Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Family Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Members:</span> Loading...</p>
                    <p><span className="font-medium">Posts:</span> {posts.length}</p>
                    <p><span className="font-medium">Created:</span> {family?.created_at ? new Date(family.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link 
                      href={isSubdomain ? "/posts" : `/${familySlug}/posts`} 
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      📝 All Posts
                    </Link>
                    <Link 
                      href={isSubdomain ? "/admin" : `/${familySlug}/admin`} 
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      ⚙️ Family Settings
                    </Link>
                    <Link 
                      href={isSubdomain ? "/connections" : `/${familySlug}/connections`} 
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      🔗 Family Connections
                    </Link>
                    <Link 
                      href={isSubdomain ? "/upload" : `/${familySlug}/upload`} 
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      📱 Quick Upload
                    </Link>
                  </div>
                </div>

                {/* Mobile Upload Shortcut */}
                <div className="bg-blue-50 rounded-lg p-4 md:hidden">
                  <h4 className="font-semibold text-blue-900 mb-2">📱 Mobile Upload</h4>
                  <p className="text-sm text-blue-700 mb-3">Quickly share photos from your phone</p>
                  <Link
                    href={isSubdomain ? "/upload" : `/${familySlug}/upload`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 block text-center"
                  >
                    Open Camera
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to {family?.name}
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in to view family memories and connect with loved ones
              </p>
              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-block"
                >
                  Sign In to Continue
                </Link>
                <p className="text-sm text-gray-500">
                  Don't have access? Contact a family admin to get invited.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { family_slug } = context.params!;
  const { req } = context;
  
  // Determine if this is a subdomain request
  const host = req.headers.host || '';
  const isSubdomain = host.includes('.kinjar.com') && !host.startsWith('www.');
  const subdomainSlug = isSubdomain ? host.split('.')[0] : null;
  const finalFamilySlug = subdomainSlug || family_slug;

  if (!finalFamilySlug) {
    return {
      props: {
        family: null,
        posts: [],
        isAuthenticated: false,
        familySlug: '',
        isSubdomain: false,
        error: 'Family not found',
      },
    };
  }

  try {
    // Get family from API
    const API_BASE = process.env.KINJAR_API_URL || 'https://kinjar-api.fly.dev';
    const FLY_API_KEY = process.env.FLY_API_KEY;

    const familyResponse = await fetch(`${API_BASE}/api/families/${finalFamilySlug}`, {
      headers: {
        'Authorization': `Bearer ${FLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!familyResponse.ok) {
      return {
        props: {
          family: null,
          posts: [],
          isAuthenticated: false,
          familySlug: finalFamilySlug as string,
          isSubdomain,
          error: 'Family not found',
        },
      };
    }

    const familyData = await familyResponse.json();
    
    // Get posts for this family
    const postsResponse = await fetch(`${API_BASE}/api/families/${finalFamilySlug}/posts`, {
      headers: {
        'Authorization': `Bearer ${FLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let posts: Post[] = [];
    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      posts = postsData.posts || [];
    }

    // Check authentication (simplified for now)
    const cookies = req.headers.cookie || '';
    const isAuthenticated = cookies.includes('kinjar_session=');

    return {
      props: {
        family: familyData.family || null,
        posts,
        isAuthenticated,
        familySlug: finalFamilySlug as string,
        isSubdomain,
      },
    };
  } catch (error) {
    console.error('Family page error:', error);
    return {
      props: {
        family: null,
        posts: [],
        isAuthenticated: false,
        familySlug: finalFamilySlug as string,
        isSubdomain,
        error: 'Failed to load family data',
      },
    };
  }
};