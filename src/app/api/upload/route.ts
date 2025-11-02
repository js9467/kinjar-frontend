import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Upload API route accessed')
    
    // Check if we have a blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is not set')
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Storage not configured. Please contact support.',
          code: 'STORAGE_NOT_CONFIGURED'
        }, 
        { status: 500 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const familySlug = formData.get('family_slug') as string || 'default'
    const uploadType = formData.get('type') as string || 'photo'

    if (!file) {
      console.log('❌ No file provided')
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (4.5MB limit for Vercel functions)
    const maxFileSize = 4.5 * 1024 * 1024
    if (file.size > maxFileSize) {
      console.log(`❌ File too large: ${file.size} bytes (max: ${maxFileSize})`)
      return NextResponse.json({ 
        ok: false, 
        error: `File too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(1)}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.` 
      }, { status: 413 })
    }

    console.log(`📤 Received: ${file.name} (${file.size} bytes) for family: ${familySlug}`)

    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${familySlug}/${uploadType}/${timestamp}-${file.name}`

    console.log(`📁 Storing file as: ${fileName}`)

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    })

    console.log('✅ Vercel Blob upload successful:', blob)

    const response = {
      ok: true,
      id: blob.pathname,
      key: fileName,
      filename: file.name,
      size: file.size,
      type: uploadType,
      publicUrl: blob.url,
      downloadUrl: blob.downloadUrl,
      message: 'File uploaded successfully to Vercel Blob'
    }

    console.log('✅ Returning success response:', response)
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    
    return NextResponse.json(
      { 
        ok: false, 
        error: errorMessage,
        code: 'UPLOAD_ERROR'
      }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  })
}