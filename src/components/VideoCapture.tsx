'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface VideoCaptureProps {
  onVideoCapture?: (blob: Blob, duration: number) => void
  onPhotoCapture?: (blob: Blob) => void
  maxDuration?: number // in seconds
  tenant?: string
}

export default function VideoCapture({ 
  onVideoCapture, 
  onPhotoCapture, 
  maxDuration = 60,
  tenant 
}: VideoCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<{
    blob: Blob
    url: string
    type: 'video' | 'photo'
    duration?: number
  } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const router = useRouter()

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      setError('')
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera access failed:', err)
      setError('Camera access denied. Please allow camera permissions.')
    }
  }, [facingMode])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
    setRecordingTime(0)
  }, [stream])

  // Start video recording
  const startRecording = useCallback(() => {
    if (!stream) return

    try {
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Good mobile support
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setCapturedMedia({
          blob,
          url,
          type: 'video',
          duration: recordingTime
        })
        
        if (onVideoCapture) {
          onVideoCapture(blob, recordingTime)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

    } catch (err) {
      console.error('Recording failed:', err)
      setError('Recording failed. Please try again.')
    }
  }, [stream, maxDuration, recordingTime, onVideoCapture])

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // Take photo
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !stream) return

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setCapturedMedia({
            blob,
            url,
            type: 'photo'
          })
          
          if (onPhotoCapture) {
            onPhotoCapture(blob)
          }
        }
      }, 'image/jpeg', 0.9)
    }
  }, [stream, onPhotoCapture])

  // Upload media to backend
  const uploadMedia = async (title: string, description: string = '') => {
    if (!capturedMedia) return

    setIsUploading(true)
    setError('')

    try {
      // Step 1: Get presigned URL
      const presignResponse = await fetch('/api/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': tenant || 'default'
        },
        body: JSON.stringify({
          filename: `${Date.now()}.${capturedMedia.type === 'video' ? 'webm' : 'jpg'}`,
          contentType: capturedMedia.blob.type
        })
      })

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const presignData = await presignResponse.json()
      
      // Step 2: Upload to R2
      const uploadResponse = await fetch(presignData.put.url, {
        method: 'PUT',
        headers: presignData.put.headers,
        body: capturedMedia.blob
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      // Step 3: Create content post
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': tenant || 'default'
        },
        body: JSON.stringify({
          title,
          content: description,
          media_id: presignData.id,
          content_type: capturedMedia.type === 'video' ? 'video_blog' : 'photo_blog'
        })
      })

      if (!postResponse.ok) {
        throw new Error('Failed to create post')
      }

      const postData = await postResponse.json()
      
      // Success! Navigate to the new post
      router.push(`/posts/${postData.post.id}`)
      
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Initialize camera on mount
  useEffect(() => {
    initCamera()
    return cleanup
  }, [initCamera, cleanup])

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-600 text-center mb-4">{error}</p>
        <button 
          onClick={initCamera}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry Camera Access
        </button>
      </div>
    )
  }

  if (capturedMedia) {
    return (
      <CapturedMediaEditor 
        media={capturedMedia}
        onUpload={uploadMedia}
        onRetake={() => {
          setCapturedMedia(null)
          URL.revokeObjectURL(capturedMedia.url)
        }}
        isUploading={isUploading}
      />
    )
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-black rounded-lg overflow-hidden">
      {/* Video Preview */}
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Camera flip button */}
        <button
          onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-900">
        <div className="flex items-center justify-center space-x-8">
          {/* Photo button */}
          <button
            onClick={takePhoto}
            disabled={isRecording}
            className="p-3 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Video record button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isRecording ? (
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            ) : (
              <div className="w-8 h-8 bg-white rounded-full"></div>
            )}
          </button>

          {/* Spacer for symmetry */}
          <div className="w-14 h-14"></div>
        </div>
      </div>
    </div>
  )
}

// Component for editing captured media before upload
function CapturedMediaEditor({ 
  media, 
  onUpload, 
  onRetake, 
  isUploading 
}: {
  media: { blob: Blob; url: string; type: 'video' | 'photo'; duration?: number }
  onUpload: (title: string, description: string) => void
  onRetake: () => void
  isUploading: boolean
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onUpload(title.trim(), description.trim())
    }
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg overflow-hidden">
      {/* Media Preview */}
      <div className="relative flex-1 bg-black">
        {media.type === 'video' ? (
          <video
            src={media.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media.url}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
        
        {media.duration && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Add a title for your ${media.type}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onRetake}
            disabled={isUploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Retake
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isUploading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Share'}
          </button>
        </div>
      </form>
    </div>
  )
}