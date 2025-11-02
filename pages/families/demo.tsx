import Head from 'next/head';
import { useState } from 'react';

// Demo data for the demo family
const demoFamily = {
  name: 'Demo Family',
  slug: 'demo',
  description: 'Welcome to our family space! This is what your family homepage will look like.',
  members: [
    { name: 'Sarah Demo', role: 'Admin', avatar: '👩' },
    { name: 'Mike Demo', role: 'Member', avatar: '👨' },
    { name: 'Emma Demo', role: 'Member', avatar: '👧' },
    { name: 'Jake Demo', role: 'Member', avatar: '👦' }
  ]
};

const demoPosts = [
  {
    id: 1,
    author: 'Sarah Demo',
    avatar: '👩',
    title: 'Family Vacation Photos',
    content: 'Just got back from our amazing trip to the mountains! The kids loved hiking and we made so many memories. Can\'t wait to share all the photos with everyone!',
    image: '/api/placeholder/400/300',
    timestamp: '2 hours ago',
    likes: 8,
    comments: 3
  },
  {
    id: 2,
    author: 'Mike Demo',
    avatar: '👨',
    title: 'Emma\'s Soccer Game',
    content: 'Emma scored the winning goal today! So proud of our little athlete. The whole team played amazingly.',
    image: '/api/placeholder/400/250',
    timestamp: '1 day ago',
    likes: 12,
    comments: 7
  },
  {
    id: 3,
    author: 'Emma Demo',
    avatar: '👧',
    title: 'Baking with Grandma',
    content: 'Made cookies with Grandma today! She taught me her secret recipe. They taste even better than the store-bought ones!',
    image: '/api/placeholder/400/300',
    timestamp: '3 days ago',
    likes: 15,
    comments: 5
  }
];

export default function DemoFamily() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <Head>
        <title>{demoFamily.name} - Kinjar Family</title>
        <meta name="description" content={demoFamily.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{demoFamily.name}</h1>
                  <p className="text-sm text-gray-600">demo.kinjar.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  📷 Share
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Family Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to {demoFamily.name}!</h2>
              <p className="text-lg text-gray-600">{demoFamily.description}</p>
            </div>
            
            {/* Family Members */}
            <div className="flex justify-center space-x-6">
              {demoFamily.members.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-2xl mb-2">
                    {member.avatar}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-gray-800">This is a Demo Family</h3>
                <p className="text-gray-600">This shows what your actual family homepage will look like. Create your own family space to get started!</p>
              </div>
            </div>
          </div>

          {/* Upload Component */}
          {showUpload && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Share with your family</h3>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload Photos & Videos</h4>
                  <p className="text-gray-500 mb-4">This would be your mobile-optimized upload interface</p>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                    Demo Upload (Not Functional)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {demoPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-xl">
                      {post.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{post.author}</h4>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Image */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-600">Demo Family Photo</p>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="p-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                        <span>❤️</span>
                        <span className="font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                        <span>💬</span>
                        <span className="font-medium">{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                        <span>📤</span>
                        <span className="font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Create Your Own Family Space?</h3>
            <p className="text-gray-600 mb-6">Get your own private family homepage with photo uploads, family connections, and more!</p>
            <a 
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Create Your Family Space
            </a>
          </div>
        </div>
      </div>
    </>
  );
}