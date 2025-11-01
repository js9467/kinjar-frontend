// Enhanced upload functionality with better CORS and error handling
import { API_BASE } from "@/lib/api";

const UPLOAD_API_BASE = typeof window !== "undefined" ? "/api/storage" : API_BASE;

export interface UploadOptions {
  familySlug: string;
  type: 'photo' | 'video';
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export async function uploadFile(file: File, options: UploadOptions): Promise<any> {
  const { familySlug, type, onProgress, onSuccess, onError } = options;
  
  console.log(`Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  console.log(`Upload API Base: ${UPLOAD_API_BASE}`);
  console.log(`Family: ${familySlug}`);
  console.log(`Type: ${type}`);
  
  try {
    console.log('Step 1: Requesting presigned URL...');
    
    // Step 1: Get presigned URL from API
    const presignResponse = await fetch(`${UPLOAD_API_BASE}/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-slug': familySlug,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      }),
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!presignResponse.ok) {
      const errorText = await presignResponse.text();
      throw new Error(`Failed to get presigned URL: ${errorText}`);
    }
    
    const presignData = await presignResponse.json();
    console.log('Presign response:', presignData);
    
    if (!presignData.ok || !presignData.put?.url) {
      throw new Error('Invalid presign response: ' + JSON.stringify(presignData));
    }
    
    console.log('Step 2: Uploading directly to R2...');
    onProgress?.(10); // Show some initial progress
    
    // Step 2: Upload directly to R2 using presigned URL
    const uploadResponse = await fetch(presignData.put.url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        ...presignData.put.headers
      },
      body: file,
      mode: 'cors',
    });
    
    console.log('R2 upload response status:', uploadResponse.status);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload to R2: ${uploadResponse.status} ${errorText}`);
    }
    
    onProgress?.(90);
    
    console.log('Step 3: Notifying API of upload completion...');
    
    // Step 3: Notify API that upload is complete (optional but recommended)
    try {
      const completeResponse = await fetch(`${UPLOAD_API_BASE}/upload/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': familySlug,
        },
        body: JSON.stringify({
          id: presignData.id,
          key: presignData.key,
          type: type,
          size: file.size
        }),
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (completeResponse.ok) {
        const completeData = await completeResponse.json();
        console.log('Upload completion notified:', completeData);
      } else {
        console.warn('Failed to notify upload completion, but file was uploaded successfully');
      }
    } catch (completeError) {
      console.warn('Failed to notify upload completion:', completeError);
      // Don't fail the entire upload for this
    }
    
    onProgress?.(100);
    
    const result = {
      ok: true,
      id: presignData.id,
      key: presignData.key,
      publicUrl: presignData.publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    };
    
    console.log('Upload successful!', result);
    onSuccess?.(result);
    return result;
    
  } catch (error) {
    console.error('Upload error:', error);
    
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