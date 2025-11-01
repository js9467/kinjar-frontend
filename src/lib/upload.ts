// Enhanced upload functionality with better CORS and error handling
import { API_BASE } from "@/lib/api";
import { retryWithBackoff, fetchWithRetry, getUserFriendlyErrorMessage } from "@/lib/api-utils";

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
    // Step 1: Health check with retry logic
    console.log('🔍 Checking API health...');
    
    try {
      await retryWithBackoff(async () => {
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 10000);
        
        try {
          const healthResponse = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            signal: healthController.signal,
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              'Accept': 'application/json',
            }
          });
          
          clearTimeout(healthTimeout);
          
          if (!healthResponse.ok) {
            throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
          }
          
          const healthData = await healthResponse.json();
          console.log('✅ API health check passed:', healthData);
          
        } catch (error) {
          clearTimeout(healthTimeout);
          throw error;
        }
      }, { maxRetries: 2, initialDelay: 1000 });
      
    } catch (healthError) {
      console.error('❌ API health check failed after retries:', healthError);
      throw new Error(getUserFriendlyErrorMessage(healthError));
    }
    
    // Step 2: Prepare form data
    console.log('📦 Preparing upload data...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('family_slug', familySlug);
    formData.append('type', type);
    
    // Log form data for debugging
    console.log('📋 Form data entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // Step 3: Upload with better configuration
    console.log('⬆️ Starting file upload...');
    
    const uploadController = new AbortController();
    const uploadTimeout = setTimeout(() => uploadController.abort(), 120000); // 2 minutes for large files
    
    onProgress?.(0);
    
    const uploadResponse = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      signal: uploadController.signal,
      mode: 'cors',
      cache: 'no-cache',
      // Note: Don't set Content-Type header when using FormData - browser sets it automatically with boundary
      // credentials: 'include' // Remove this if causing CORS issues
    });
    
    clearTimeout(uploadTimeout);
    
    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
    // Step 4: Process response
    let responseData: any;
    const responseText = await uploadResponse.text();
    
    console.log('📄 Raw response:', responseText);
    
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
      userFriendlyMessage = `Upload timed out. The ${type} file (${(file.size / 1024 / 1024).toFixed(2)}MB) may be too large or the connection is slow.`;
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      userFriendlyMessage = `Network error: Could not connect to the server.

Possible causes:
1. CORS issue - localhost:3000 may not be allowed by the API server
2. Network connectivity problem  
3. Server is not responding
4. Firewall blocking the request

Check the browser console for more details.

Current configuration:
- Frontend: ${window.location.origin}
- API: ${API_BASE}`;
    } else if (errorMessage.includes('CORS')) {
      userFriendlyMessage = `CORS error: The API server does not allow requests from ${window.location.origin}.

To fix this, the API server needs to add localhost:3000 to its ALLOWED_ORIGINS environment variable.`;
    } else {
      userFriendlyMessage = `Upload failed: ${errorMessage}

Check the browser console for technical details.`;
    }
    
    const finalError = new Error(userFriendlyMessage);
    onError?.(finalError);
    throw finalError;
  }
}

// Usage helper function with optional toast support
export function createFileUploadHandler(familySlug: string, showToast?: (toast: any) => void) {
  return async (type: 'photo' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.multiple = true;
    input.style.display = 'none';
    
    return new Promise<void>((resolve, reject) => {
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          resolve();
          return;
        }
        
        if (showToast) {
          showToast({
            type: 'info',
            title: 'Starting Upload',
            message: `Uploading ${files.length} ${type}${files.length > 1 ? 's' : ''}...`
          });
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // Process files sequentially to avoid overwhelming the server
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          try {
            console.log(`\n🚀 Processing file ${i + 1}/${files.length}: ${file.name}`);
            
            await uploadFile(file, {
              familySlug,
              type,
              onProgress: (progress) => {
                console.log(`📈 Upload progress: ${progress}%`);
              },
              onSuccess: (result) => {
                console.log(`✅ File uploaded successfully:`, result);
                successCount++;
                const message = `${file.name} uploaded successfully!`;
                if (showToast) {
                  showToast({
                    type: 'success',
                    title: 'Upload Complete',
                    message
                  });
                } else {
                  alert(message);
                }
              },
              onError: (error) => {
                console.error(`❌ File upload failed:`, error);
                errorCount++;
                const message = `Failed to upload ${file.name}: ${error.message}`;
                if (showToast) {
                  showToast({
                    type: 'error',
                    title: 'Upload Failed',
                    message,
                    duration: 10000 // Longer duration for errors
                  });
                } else {
                  alert(message);
                }
              }
            });
            
          } catch (error) {
            console.error(`💥 Failed to upload file ${file.name}:`, error);
            errorCount++;
            // Continue with next file instead of stopping
          }
        }
        
        // Show summary
        if (files.length > 1) {
          const message = `${successCount} of ${files.length} files uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
          if (showToast) {
            showToast({
              type: successCount === files.length ? 'success' : errorCount === files.length ? 'error' : 'warning',
              title: 'Upload Complete',
              message,
              duration: 8000
            });
          } else {
            alert(message);
          }
        }
        
        // Clean up
        try {
          document.body.removeChild(input);
        } catch (e) {
          // Input may already be removed
        }
        
        resolve();
      };
      
      input.oncancel = () => {
        try {
          document.body.removeChild(input);
        } catch (e) {
          // Input may already be removed
        }
        resolve();
      };
      
      // Add to DOM and trigger
      document.body.appendChild(input);
      input.click();
    });
  };
}