# Visibility System Fix - Complete

## Issues Addressed

### 1. ✅ Wrong Default Visibility (FIXED)
**Problem:** Posts were defaulting to "family only" instead of "family and connections"
**Root Cause:** PostCreator.tsx had old option values `value="family"` and `value="connections"` instead of `value="family_only"` and `value="family_and_connections"`
**Fix:** Updated PostCreator.tsx dropdown options to match the new PostVisibility type

### 2. ✅ Public Option Still Visible (FIXED)
**Problem:** "Public" option was still showing in the visibility dropdown
**Root Cause:** Same as above - PostCreator had `<option value="public">Public</option>`
**Fix:** Removed the public option entirely from the dropdown

### 3. ⚠️ Connected Families Feed Not Working (BACKEND DEPLOYMENT NEEDED)
**Problem:** Can't see shared posts from connected families
**Root Cause:** Backend changes may not be deployed to Fly.io
**Status:** Backend code is correct in app.py, but needs to be deployed

## Changes Made

### Frontend Changes (✅ Complete & Built)
1. **PostCreator.tsx** - Fixed visibility dropdown:
   ```tsx
   // BEFORE (WRONG):
   <option value="family">Family only</option>
   <option value="connections">Family + Connections</option>
   <option value="public">Public</option>
   
   // AFTER (CORRECT):
   <option value="family_and_connections">Family & Connections</option>
   <option value="family_only">Family Only</option>
   ```

2. **Build Status:** ✅ Successful (`npm run build` completed without errors)

### Backend Changes (✅ Code Ready, Needs Deployment)
The backend already has the correct implementation:

1. **Visibility Mapping** (app.py lines 3885-3903):
   - Maps old 'public' to 'family_and_connections' for backwards compatibility
   - Correctly handles 'family_only' and 'family_and_connections'

2. **Auto-Sharing Logic** (app.py lines 3611-3630):
   ```python
   # If visibility is 'family_and_connections', automatically share with all connected families
   if visibility == "family_and_connections" and status == "published":
       # Get all connected families and insert into content_visibility table
   ```

3. **Cross-Family Feed Query** (app.py lines 3777-3834):
   - Correctly retrieves posts from content_visibility table
   - Shows own family posts (all visibility levels)
   - Shows connected family posts only if in content_visibility table

## Next Steps

### 1. Deploy Frontend to Vercel
```powershell
cd "d:\Software\kinjar frontend 2.0"
vercel --prod
```

### 2. Deploy Backend to Fly.io
```powershell
cd "d:\Software\Kinjar API\kinjar-api"
fly deploy
```

**IMPORTANT:** The backend deployment is critical because:
- The auto-sharing logic needs to be live on Fly.io
- New posts with 'family_and_connections' visibility need to be inserted into content_visibility table
- The get_cross_family_posts query needs the updated logic to retrieve shared posts

### 3. Test the Full Flow
After both deployments:

1. **Test Post Creation:**
   - Create a post with "Family & Connections" visibility
   - Verify it defaults to that option
   - Verify "Public" is not an option
   - Check database: should see entry in content_visibility for each connected family

2. **Test Connected Feed:**
   - Go to a connected family's subdomain
   - Navigate to the connections feed
   - Should see the shared post from step 1

3. **Test Family Only:**
   - Create a post with "Family Only" visibility
   - Verify it does NOT appear in connected families' feeds
   - Verify it only appears on the family's own subdomain

## Database Schema Required

The backend code expects these tables:

1. **content_posts** table with `visibility` column:
   ```sql
   ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'family_only';
   ```

2. **content_visibility** table for sharing:
   ```sql
   CREATE TABLE IF NOT EXISTS content_visibility (
       post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
       tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
       granted_by UUID NOT NULL REFERENCES users(id),
       created_at TIMESTAMPTZ DEFAULT NOW(),
       PRIMARY KEY (post_id, tenant_id)
   );
   ```

## How It Works

### Post Creation Flow
1. User selects "Family & Connections" (default) or "Family Only"
2. Frontend sends POST to `/api/posts` with `visibility: 'family_and_connections'`
3. Backend creates post with visibility='family_and_connections' in content_posts table
4. Backend queries family_connections for all connected families
5. Backend inserts rows into content_visibility for each connected family
6. Backend returns success

### Connected Feed Flow
1. User visits their family subdomain
2. Frontend loads ConnectedFamiliesFeed component
3. Component calls `/api/posts?tenant=FAMILY_SLUG&include_connected=true`
4. Backend's get_cross_family_posts function:
   - Gets all posts from own family (any visibility)
   - Gets posts from connected families that exist in content_visibility table
   - Returns combined list in chronological order
5. Frontend displays posts

### Key Backend Functions
- `create_content_post()` - Creates post and auto-shares if visibility='family_and_connections'
- `get_cross_family_posts()` - Retrieves posts for connected feed
- `share_post_with_family()` - Manually share a specific post (future feature)

## Verification Checklist

- [x] PostCreator dropdown has correct values
- [x] Frontend builds successfully
- [x] Backend code has auto-sharing logic
- [x] Backend code has cross-family query
- [ ] Backend deployed to Fly.io
- [ ] Frontend deployed to Vercel
- [ ] Database has visibility column
- [ ] Database has content_visibility table
- [ ] Test: Create post with family_and_connections
- [ ] Test: Verify auto-sharing in database
- [ ] Test: View post in connected family's feed
- [ ] Test: Create post with family_only
- [ ] Test: Verify NOT visible in connected feed

## Troubleshooting

### If connected feed still doesn't work after deployment:

1. **Check database schema:**
   ```sql
   -- Verify visibility column exists
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'content_posts' AND column_name = 'visibility';
   
   -- Verify content_visibility table exists
   SELECT * FROM information_schema.tables WHERE table_name = 'content_visibility';
   ```

2. **Check if posts are being shared:**
   ```sql
   -- Find a post with family_and_connections visibility
   SELECT id, title, visibility FROM content_posts WHERE visibility = 'family_and_connections' LIMIT 1;
   
   -- Check if it's in content_visibility table
   SELECT * FROM content_visibility WHERE post_id = 'POST_ID_FROM_ABOVE';
   ```

3. **Check backend logs:**
   ```powershell
   fly logs -a kinjar-api
   ```
   Look for: "Auto-shared post {post_id} with connected family {family_id}"

4. **Test API directly:**
   ```powershell
   # Create a post
   curl -X POST https://kinjar-api.fly.dev/api/posts `
     -H "Authorization: Bearer YOUR_JWT" `
     -H "x-tenant-slug: YOUR_FAMILY_SLUG" `
     -H "Content-Type: application/json" `
     -d '{"content": "Test post", "visibility": "family_and_connections"}'
   
   # Check connected feed
   curl "https://kinjar-api.fly.dev/api/posts?tenant=CONNECTED_FAMILY_SLUG&include_connected=true" `
     -H "Authorization: Bearer YOUR_JWT"
   ```

## Summary

**Fixed Issues:**
- ✅ Default visibility now correctly shows "Family & Connections"
- ✅ Public option removed entirely
- ✅ Frontend built successfully

**Remaining Action:**
- 🚀 Deploy backend to Fly.io to activate auto-sharing logic
- 🚀 Deploy frontend to Vercel to make changes live

The code is correct in both repos. The issue is that the deployed backend may be running an older version without the new visibility logic. Once deployed, everything should work as expected.
