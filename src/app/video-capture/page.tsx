export default function VideoCaptureSimple() {
  return (
    <div id="video-capture-app" style={{
      fontFamily: 'system-ui',
      maxWidth: '400px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '8px' }}>📹 Video Capture</h1>
        <p style={{ color: '#666', margin: 0 }}>Record a moment to share</p>
      </div>

      {/* Video Preview Area */}
      <div style={{
        backgroundColor: 'black',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
        aspectRatio: '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
          <div>Camera Preview</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
            (Enable camera access to see preview)
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
          <button 
            id="photo-btn"
            style={{
              backgroundColor: 'white',
              border: '2px solid #ddd',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            📷
          </button>
          
          <button 
            id="video-btn"
            style={{
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              cursor: 'pointer',
              fontSize: '24px',
              color: 'white'
            }}
          >
            🎥
          </button>
          
          <button 
            id="flip-btn"
            style={{
              backgroundColor: 'white',
              border: '2px solid #ddd',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            🔄
          </button>
        </div>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Tap 📷 for photo, 🎥 for video, 🔄 to flip camera
        </div>
      </div>

      {/* Form for captured content */}
      <form style={{ display: 'none' }} id="upload-form">
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Title:
          </label>
          <input 
            type="text" 
            placeholder="Add a title..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Description:
          </label>
          <textarea 
            placeholder="Add a description..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retake
          </button>
          <button 
            type="submit"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Share
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e0f2fe',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#0369a1'
      }}>
        <strong>📱 Mobile Instructions:</strong><br/>
        1. Allow camera access when prompted<br/>
        2. Position your camera and tap record<br/>
        3. Add title and description<br/>
        4. Share with your family!
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <a 
          href="/video-blog"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          ← Back to Video Blog
        </a>
      </div>
    </div>
  )
}