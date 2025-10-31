'use client';

// Simple login page that avoids React/Next.js import issues
const API_BASE = 'https://kinjar-api.fly.dev';

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 420, margin: '64px auto', fontFamily: 'system-ui' }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label>Email<br/>
          <input 
            id="email" 
            type="email" 
            required 
            autoComplete="email"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: 4,
              marginBottom: 16,
              boxSizing: 'border-box'
            }}
          />
        </label><br/>
        <label>Password<br/>
          <input 
            id="password" 
            type="password" 
            required 
            autoComplete="current-password"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: 4,
              marginBottom: 16,
              boxSizing: 'border-box'
            }}
          />
        </label><br/>
        <button 
          type="submit"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Sign in
        </button>
      </form>
      <div id="error" style={{ color: 'red', marginTop: 16, display: 'none' }}></div>
      <div id="loading" style={{ color: '#666', marginTop: 16, display: 'none' }}>Signing in...</div>
    </main>
  );
}

async function handleSubmit(e: any) {
  e.preventDefault();
  
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');
  const submitButton = e.target.querySelector('button[type="submit"]');
  
  if (!errorDiv || !loadingDiv || !submitButton) return;
  
  // Hide error, show loading
  errorDiv.style.display = 'none';
  loadingDiv.style.display = 'block';
  submitButton.disabled = true;
  
  try {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      throw new Error('Invalid email or password');
    }
    
    // Smart redirect based on domain
    const hostname = window.location.hostname;
    if (hostname.endsWith('.kinjar.com') && hostname !== 'www.kinjar.com') {
      // On family subdomain - go to family admin
      window.location.href = '/admin';
    } else {
      // On main domain - go to admin (will auto-detect)
      window.location.href = '/admin';
    }
    
  } catch (error: any) {
    errorDiv.textContent = error.message || 'Login failed';
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    submitButton.disabled = false;
  }
}