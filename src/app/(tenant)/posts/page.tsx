export default function PostsPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
            Community Feed
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            See what everyone is sharing
          </p>
          <a href="/create" style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            📹 Share Something
          </a>
        </div>
        
        {/* Sample Posts */}
        <div style={{ space: 16 }}>
          <PostCard 
            title="First day at the park!"
            author="Mom"
            timeAgo="2 hours ago"
            description="The kids had such a blast on the new playground equipment. Sarah went down the big slide for the first time!"
            mediaType="video"
            viewCount={12}
            commentCount={3}
          />
          
          <PostCard 
            title="Sunset from the backyard"
            author="Dad"
            timeAgo="1 day ago"
            description="Beautiful colors tonight. Had to capture this amazing view."
            mediaType="photo"
            viewCount={8}
            commentCount={2}
          />
          
          <PostCard 
            title="Soccer practice highlights"
            author="Coach Mike"
            timeAgo="3 days ago"
            description="Great practice today! The team is really improving their passing."
            mediaType="video"
            viewCount={25}
            commentCount={7}
          />
        </div>
      </div>
    </main>
  )
}

function PostCard({ title, author, timeAgo, description, mediaType, viewCount, commentCount }: {
  title: string
  author: string
  timeAgo: string
  description: string
  mediaType: 'video' | 'photo'
  viewCount: number
  commentCount: number
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e5e5',
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden'
    }}>
      {/* Media placeholder */}
      <div style={{
        height: 200,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        color: '#999'
      }}>
        {mediaType === 'video' ? '🎥' : '📷'}
      </div>
      
      {/* Content */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, color: '#111' }}>
            {title}
          </h3>
          <span style={{ fontSize: 12, color: '#666' }}>
            {timeAgo}
          </span>
        </div>
        
        <p style={{ color: '#333', marginBottom: 12, lineHeight: 1.5 }}>
          {description}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#666' }}>
            by {author}
          </span>
          
          <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666' }}>
            <span>👁️ {viewCount}</span>
            <span>💬 {commentCount}</span>
          </div>
        </div>
        
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12
            }}>
              ❤️ Like
            </button>
            <button style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12
            }}>
              💬 Comment
            </button>
            <button style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12
            }}>
              📤 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}