export interface UploadOptions {
  familySlug: string;
  type: 'photo' | 'video';
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export async function uploadFile(file: File, options: UploadOptions): Promise<any> {
  const { familySlug, type, onProgress, onSuccess, onError } = options;
  
  console.log(`🚀 Starting upload: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
  
  // File size check - 800KB max for reliable uploads
  const maxFileSize = 800 * 1024; // 800KB
  if (file.size > maxFileSize) {
    const error = new Error(`File too large: ${(file.size / 1024).toFixed(1)}KB. Maximum size is 800KB. Please compress your image first.`);
    onError?.(error);
    throw error;
  }
  
  try {
    onProgress?.(25);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('family_slug', familySlug);
    formData.append('type', type);
    
    onProgress?.(50);
    
    console.log('📡 Making upload request...');
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Use absolute URL to ensure correct domain
      const uploadUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/upload`
        : '/api/upload';
        
      console.log('🎯 Upload URL:', uploadUrl);
        
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📨 Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
      }
      
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload response:', uploadData);
      
      if (!uploadData.ok) {
        throw new Error(`Upload failed: ${uploadData.error || 'Unknown error'}`);
      }
      
      onProgress?.(100);
      
      const result = {
        ok: true,
        id: uploadData.id,
        key: uploadData.key,
        publicUrl: uploadData.publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      };
      
      console.log('🎉 Upload successful!', result);
      onSuccess?.(result);
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ Upload timed out after 30 seconds');
        throw new Error('Upload timed out. Please try with a smaller file or check your connection.');
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('💥 Upload error:', error);
    const finalError = error instanceof Error ? error : new Error(String(error));
    onError?.(finalError);
    throw finalError;
  }
}

export function createFileUploadHandler(familySlug: string, onToast?: (message: string, type: 'success' | 'error') => void) {
  return async (type: 'photo' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.multiple = true;
    input.style.display = 'none';
    
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      console.log(`📁 Selected ${files.length} file(s) for upload`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n🚀 Processing file ${i + 1}/${files.length}: ${file.name}`);
        console.log(`📏 File size: ${(file.size / 1024).toFixed(1)}KB`);
        
        try {
          await uploadFile(file, {
            familySlug,
            type,
            onProgress: (progress) => {
              console.log(`📊 Upload progress: ${progress}%`);
            },
            onSuccess: (result) => {
              console.log(`✅ Successfully uploaded: ${file.name}`);
              onToast?.(`Successfully uploaded ${file.name}`, 'success');
            },
            onError: (error) => {
              console.error(`💥 Failed to upload file ${file.name}:`, error);
              onToast?.(error.message, 'error');
            }
          });
        } catch (error) {
          console.error(`💥 Failed to upload file ${file.name}:`, error);
          onToast?.(error instanceof Error ? error.message : 'Upload failed', 'error');
        }
      }
      
      console.log('📋 Upload batch completed');
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };
}