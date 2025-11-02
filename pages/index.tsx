import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Kinjar - Family Social Platform</title>
        <meta name="description" content="Connect families through shared memories and stories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">Kinjar</h1>
              <div className="space-x-4">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Family's Digital Home
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Share memories, stay connected, and build lasting family bonds with 
            private family spaces and mobile-first sharing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium">
              Create Your Family Space
            </Link>
            <Link href="/demo" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 text-lg font-medium">
              View Demo
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile First</h3>
              <p className="text-gray-600">
                Share photos and videos instantly from your phone with our mobile-optimized interface.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Each family gets their own private space with subdomain routing and secure connections.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Connections</h3>
              <p className="text-gray-600">
                Connect with other families you trust and share special moments together.
              </p>
            </div>
          </div>

          {/* Example Family */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">See How It Works</h3>
            <p className="text-gray-600 mb-6">
              Every family gets their own subdomain like:
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <code className="text-blue-600 font-mono text-lg">slaughterbeck.kinjar.com</code>
            </div>
            <Link href="/families/demo" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Try Demo Family
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2025 Kinjar Family Platform. Built with ❤️ for families.</p>
          </div>
        </footer>
      </div>
    </>
  );
}