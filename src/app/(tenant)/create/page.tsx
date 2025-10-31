import React from 'react'
import VideoCapture from '@/components/VideoCapture'

export default function CreatePage() {
  // Get tenant from URL params or use default
  // Note: In production, you'd extract this from subdomain via middleware
  const tenant = 'default' // TODO: Extract from subdomain
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Moment</h1>
          <p className="text-gray-600">
            Capture a video or photo to share with your community
          </p>
        </div>
        
        <div className="flex justify-center">
          <VideoCapture tenant={tenant} />
        </div>
      </div>
    </div>
  )
}