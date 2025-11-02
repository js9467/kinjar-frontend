'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createFileUploadHandler } from '@/lib/upload'

interface Photo {
  id: string
  publicUrl: string
  filename: string
  size: number
  uploadedAt: string
}

export default function FamilyPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has access to this family
    if (session.user.familySlug !== params.slug) {
      router.push(`/family/${session.user.familySlug}`)
      return
    }
  }, [session, status, params.slug, router])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const uploadHandler = createFileUploadHandler(params.slug, showToast)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {session.user.name || params.slug} Family Photos
              </h1>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Upload Photos
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => uploadHandler('photo')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  📸 Upload Photos
                </button>
                <button
                  onClick={() => uploadHandler('video')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  🎥 Upload Videos
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Maximum file size: 800KB. For larger files, please compress them first.
              </p>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Photo Gallery
              </h3>
              
              {photos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                  <p className="text-gray-500 mb-6">Start by uploading your first family photo!</p>
                  <button
                    onClick={() => uploadHandler('photo')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload Your First Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={photo.publicUrl}
                          alt={photo.filename}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {photo.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(photo.size / 1024).toFixed(1)}KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}