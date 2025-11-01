// Enhanced upload functionality with better CORS and error handling
import { API_BASE } from "@/lib/api";

export interface UploadOptions {
  familySlug: string;
  type: 'photo' | 'video';
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export async function uploadFile(file: File, options: UploadOptions): Promise<any> {
  const { familySlug, type, onProgress, onSuccess, onError } = options;
  
  console.log(`🚀 Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  console.log(`📡 API Base: ${API_BASE}`);
  console.log(`🏠 Family: ${familySlug}`);
  console.log(`📁 Type: ${type}`);
  
  try {
    console.log('📦 Preparing upload data...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('family_slug', familySlug);
    formData.append('type', type);
    
    console.log('📋 Form data entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    console.log('⬆️ Starting file upload...');
    
    onProgress?.(0);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
    const responseText = await uploadResponse.text();
    console.log('📄 Raw response:', responseText);
    
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('⚠️ Response is not valid JSON:', parseError);
      responseData = { rawResponse: responseText };
    }
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!', responseData);
      onProgress?.(100);
      onSuccess?.(responseData);
      return responseData;
    } else {
      const errorMessage = responseData?.error || responseText || `HTTP ${uploadResponse.status}`;
      console.error('❌ Upload failed:', errorMessage);
      throw new Error(`Upload failed: ${errorMessage}`);
    }
    
  } catch (error) {
    console.error('💥 Upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    
    let userFriendlyMessage = '';
    
    if (errorName === 'AbortError') {
      userFriendlyMessage = `Upload timed out. The ${type} file may be too large or the connection is slow.`;
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      userFriendlyMessage = `Network error: Could not connect to the server. Check the browser console for more details.`;
    } else {
      userFriendlyMessage = `Upload failed: ${errorMessage}`;
    }
    
    const finalError = new Error(userFriendlyMessage);
    onError?.(finalError);
    throw finalError;
  }
}
