export default function CreatePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
            Share Your Moment
          </h1>
          <p style={{ color: '#666' }}>
            Capture a video or photo to share with your community
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          minHeight: 600,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          padding: 16
        }}>
          <div style={{
            backgroundColor: 'black',
            borderRadius: 8,
            overflow: 'hidden',
            maxWidth: 400,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: 32
          }}>
            <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Video Capture</h2>
            <p style={{ textAlign: 'center', marginBottom: 24, opacity: 0.8 }}>
              Video capture will be available once React types are properly configured.
            </p>
            <div style={{ marginBottom: 16 }}>
              <button style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 64,
                height: 64,
                cursor: 'pointer',
                marginRight: 16
              }}>
                🎥
              </button>
              <button style={{
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                cursor: 'pointer'
              }}>
                📷
              </button>
            </div>
            <p style={{ fontSize: 12, opacity: 0.6 }}>
              Tap to record video or take photo
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}