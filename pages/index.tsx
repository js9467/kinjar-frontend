import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Kinjar - The Badass Family Platform</title>
        <meta name="description" content="The most badass private family social platform - share memories, connect generations, and keep it in the family" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🏠</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Kinjar</h1>
              </div>
              <div className="space-x-4">
                <Link href="/families/demo" className="text-gray-600 hover:text-gray-900 font-medium">
                  View Demo
                </Link>
                <Link href="/families/demo" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium shadow-md">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🏠 The <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Badass</span> Family Platform
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Finally, a family social platform that doesn't suck. Private spaces for families, 
            mobile-first photo sharing, and subdomain routing that actually works.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/families/demo" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 text-lg font-semibold shadow-lg hover:shadow-xl">
              Try Demo Family 🚀
            </Link>
            <Link href="/families/demo" className="border-2 border-purple-200 text-gray-700 px-8 py-4 rounded-lg hover:bg-purple-50 text-lg font-semibold">
              See How It Works
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mobile First</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload photos and videos instantly from your phone. No more emailing photos to grandma - just share directly to your family space.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Actually Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your family gets a private subdomain. No algorithms, no ads, no random people seeing your kids. Just family.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Actually Works</h3>
              <p className="text-gray-600 leading-relaxed">
                Built by developers who are tired of crappy family apps. Fast, reliable, and designed for real families.
              </p>
            </div>
          </div>

          {/* Example Family */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">See The Magic</h3>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Every family gets their own subdomain. No shared feeds, no confusion, just your family:
            </p>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-8 text-center">
              <code className="text-xl font-mono text-purple-700">yourfamily.kinjar.com</code>
            </div>
            <div className="text-center">
              <Link href="/families/demo" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl">
                Try Demo Family 🚀
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-3xl mr-3">🏠</span>
              <span className="text-2xl font-bold">Kinjar Family Platform</span>
            </div>
            <p className="text-gray-400 mb-4">Finally, a family platform that doesn't suck.</p>
            <p className="text-sm text-gray-500">© 2025 Kinjar. Built with ❤️ and frustration with existing family apps.</p>
          </div>
        </footer>
      </div>
    </>
  );
}