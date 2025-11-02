import { useState } from 'react';
import { kinjarAPI } from '../lib/api';

export default function UploadComponent({ familySlug }: { familySlug: string }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setUploading(true);
    try {
      // Create the post (media upload would be handled separately)
      const result = await kinjarAPI.createPost(familySlug, {
        title: title.trim(),
        content: content.trim() || undefined,
      });

      if (result.ok) {
        // Reset form
        setTitle('');
        setContent('');
        setSelectedFile(null);
        // Refresh page or emit event
        window.location.reload();
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Share with your family</h2>
      
      {/* File upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-purple-400 transition-colors bg-gray-50 hover:bg-purple-50">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              📷
            </div>
            {selectedFile ? (
              <p className="text-purple-600 font-medium">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">Tap to select photo or video</p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG, MP4 up to 50MB</p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Title input */}
      <input
        type="text"
        placeholder="What's happening?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors mb-4"
      />

      {/* Content input */}
      <textarea
        placeholder="Add a description (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none mb-4"
      />

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !title.trim() || uploading}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          selectedFile && title.trim() && !uploading
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {uploading ? 'Sharing...' : 'Share with Family'}
      </button>
    </div>
  );
}