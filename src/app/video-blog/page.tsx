export default function VideoBlogPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
          📹 Family Video Blog
        </h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Share your special moments with the family
        </p>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
          <ActionButton href="/video-capture" text="🎥 Record Video" color="#ef4444" />
          <ActionButton href="/photo-capture" text="📷 Take Photo" color="#3b82f6" />
          <ActionButton href="/view-posts" text="👀 View All Posts" color="#10b981" />
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          Recent Posts
        </h2>
        
        <div style={{ display: 'grid', gap: 16 }}>
          <PostPreview 
            title="First day at the new playground!"
            author="Mom"
            timeAgo="2 hours ago"
            description="The kids had such a blast today. Sarah finally went down the big slide!"
            mediaType="video"
            thumbnailEmoji="🛝"
          />
          
          <PostPreview 
            title="Sunset from our backyard"
            author="Dad"
            timeAgo="1 day ago"
            description="Beautiful colors tonight. Had to capture this amazing view from the deck."
            mediaType="photo"
            thumbnailEmoji="🌅"
          />
          
          <PostPreview 
            title="Grandma's birthday surprise"
            author="Sarah"
            timeAgo="3 days ago"
            description="We surprised Grandma with her favorite cake and a video call from Uncle Tom!"
            mediaType="video"
            thumbnailEmoji="🎂"
          />
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #bae6fd',
        borderRadius: 8, 
        padding: 20, 
        marginTop: 32 
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0369a1' }}>📱 How to Use on Mobile:</h3>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#075985' }}>
          <li>Tap "Record Video" or "Take Photo"</li>
          <li>Allow camera access when prompted</li>
          <li>Record your moment (up to 60 seconds for videos)</li>
          <li>Add a title and description</li>
          <li>Share with your family!</li>
        </ol>
      </div>
    </main>
  )
}

function ActionButton({ href, text, color }: { href: string; text: string; color: string }) {
  return (
    <a 
      href={href}
      style={{
        display: 'inline-block',
        backgroundColor: color,
        color: 'white',
        padding: '16px 24px',
        borderRadius: 8,
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: 16,
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
    >
      {text}
    </a>
  )
}

function PostPreview({ 
  title, 
  author, 
  timeAgo, 
  description, 
  mediaType, 
  thumbnailEmoji 
}: {
  title: string
  author: string
  timeAgo: string
  description: string
  mediaType: 'video' | 'photo'
  thumbnailEmoji: string
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}>
      {/* Thumbnail */}
      <div style={{
        height: 120,
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        position: 'relative'
      }}>
        {thumbnailEmoji}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12
        }}>
          {mediaType === 'video' ? '🎥 VIDEO' : '📷 PHOTO'}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', margin: 0, color: '#111' }}>
            {title}
          </h3>
          <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', marginLeft: 8 }}>
            {timeAgo}
          </span>
        </div>
        
        <p style={{ color: '#666', margin: '0 0 12px 0', fontSize: 14, lineHeight: 1.4 }}>
          {description}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#666' }}>
            by {author}
          </span>
          
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
            <span>👁️ 8</span>
            <span>💬 3</span>
            <span>❤️ 5</span>
          </div>
        </div>
      </div>
    </div>
  )
}