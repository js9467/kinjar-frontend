# Post Edit Debugging Guide

When you encounter the "Failed to edit post: TypeError: Failed to fetch" error, follow these steps to diagnose the issue:

## 1. Browser Console Debugging

Open your browser's developer tools (F12) and run these commands in the console:

### Check API Health
```javascript
// Check if the API server is responding
window.api?.healthCheck?.().then(result => {
  console.log('API Health Check:', result ? 'HEALTHY' : 'UNHEALTHY');
}).catch(err => {
  console.error('Health check failed:', err);
});
```

### Check Authentication
```javascript
// Verify you're logged in
console.log('Current user:', window.api?.currentUser);
console.log('Auth token present:', !!localStorage.getItem('kinjar-auth-token'));
```

### Check Network Connectivity
```javascript
// Test basic connectivity to the API
fetch('https://kinjar-api.fly.dev/health')
  .then(response => console.log('Direct API test:', response.ok ? 'SUCCESS' : 'FAILED'))
  .catch(err => console.error('Direct API test failed:', err));
```

### Manual Post Edit Test
```javascript
// Replace POST_ID with the actual post ID you're trying to edit
// Replace NEW_CONTENT with the content you want to set
const postId = 'POST_ID';
const newContent = 'NEW_CONTENT';

window.api?.editPost?.(postId, newContent)
  .then(result => console.log('Edit successful:', result))
  .catch(err => console.error('Edit failed:', err));
```

## 2. Common Issues and Solutions

### "Failed to fetch" Error
This usually indicates:
- **Network connectivity issues**: Check your internet connection
- **API server is down**: Try refreshing the page or waiting a few minutes
- **CORS issues**: The API might be blocking requests from your domain
- **Firewall/proxy blocking**: Your network might be blocking the API requests

### Authorization Issues
- **Token expired**: Try logging out and logging back in
- **Insufficient permissions**: You might not have permission to edit this post
- **Session timeout**: Refresh the page and log in again

### Server Errors
- **500 Internal Server Error**: There's an issue on the server side
- **404 Not Found**: The post might have been deleted by another user
- **403 Forbidden**: You don't have permission to edit this post

## 3. Workarounds

If editing continues to fail:
1. **Refresh the page** and try again
2. **Log out and log back in** to refresh your session
3. **Try editing from a different device/browser** to rule out local issues
4. **Check if the post appears correctly** after a page refresh (sometimes the edit succeeds despite the error)

## 4. Reporting Issues

If the problem persists, provide this information:
- Console error messages (from F12 Developer Tools)
- Results of the debugging commands above
- Browser and operating system details
- Steps to reproduce the issue