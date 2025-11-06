# Post Permissions Final Fix

## Changes Made

### 1. Frontend Permission Logic Simplified (`FamilyDashboard.tsx`)

**Removed:**
- All excessive console.log statements that were cluttering the logs
- Complex role checking logic for adults editing/deleting other adults' posts
- Redundant permission denial checks

**Simplified Permission Logic:**

#### Edit Permissions:
```typescript
const canEditPost = (() => {
  if (!user || !userRole) return false;
  
  // Children can ONLY edit their own posts
  if (userRole.startsWith('CHILD')) {
    return ownsPost;
  }
  
  // User owns this post
  if (ownsPost) {
    return true;
  }
  
  // Adults/Admins can edit children's posts in their family
  if (userRole === 'ADULT' || userRole === 'ADMIN') {
    // Post made as a child in our family
    if (postedAsMember && postedAsIsChild) {
      return true;
    }
    // Post author is a child in our family (legacy posts without posted_as)
    if (postAuthorMember && postAuthorIsChild) {
      return true;
    }
  }
  
  return false;
})();
```

#### Delete Permissions:
```typescript
const canDeletePost = (() => {
  if (!user || !userRole) return false;
  
  // Children can ONLY delete their own posts
  if (userRole.startsWith('CHILD')) {
    return ownsPost;
  }
  
  // User owns this post
  if (ownsPost) {
    return true;
  }
  
  // Admins can delete any post in their own family
  if (userRole === 'ADMIN' && post.familySlug === effectiveFamilySlug) {
    return true;
  }
  
  // Adults/Admins can delete children's posts in their family
  if (userRole === 'ADULT' || userRole === 'ADMIN') {
    if (postedAsMember && postedAsIsChild) {
      return true;
    }
    if (postAuthorMember && postAuthorIsChild) {
      return true;
    }
  }
  
  return false;
})();
```

### 2. Added Debug Logging

Added single debug log to identify when `posted_as_id` exists but the child member isn't found in `family.members`:

```typescript
if (post.postedAsId && !postedAsMember) {
  console.log(`[DEBUG] Post ${post.id.substring(0,8)} has postedAsId=${post.postedAsId} but not found in members. Family members userIds:`, family.members.map(m => m.userId));
}
```

This will help diagnose if the issue is:
- Backend not returning `posted_as_id` correctly
- Child userId mismatch between posts and family members
- Family members not being loaded properly

## Expected Behavior

### For Children:
- ✅ Can ONLY see edit/delete buttons on posts they made while acting as that specific child
- ✅ Cannot see buttons on posts made by other children
- ✅ Cannot see buttons on posts made by adults
- ✅ Cannot see buttons on posts they made as a different child profile

### For Adults:
- ✅ Can edit/delete their own posts (where they're the author and no `posted_as_id`)
- ✅ Can edit/delete posts made by ANY child in their family
- ✅ Can edit/delete posts made AS any child in their family (when parents posted as children)
- ❌ Cannot edit posts made by other adults
- ❌ Cannot delete posts made by other adults (unless they're the admin)

### For Admins:
- ✅ All adult permissions
- ✅ Can delete ANY post in their own family (including other adults' posts)
- ❌ Cannot delete other adults' posts in connected families

## Backend Verification

The backend correctly:
1. Fetches `posted_as_id` in SELECT queries for posts (verified in `get_tenant_posts` at line 4034)
2. Validates `posted_as_id` matches request header in DELETE/EDIT operations
3. Returns `posted_as_id` to frontend in post data
4. Returns all family members including children in `/families/<slug>` endpoint

## Testing Steps

1. Deploy frontend changes
2. Test as parent:
   - Post as yourself → should see edit/delete buttons ✓
   - Post as child → should see edit/delete buttons ✓
   - Try to edit child's post → should see buttons and backend should allow ✓
   - Try to edit other adult's post → should NOT see buttons ✓
3. Test as child (acting as that child):
   - View your own posts → should see edit/delete buttons ✓
   - View other child's posts → should NOT see buttons ✓
   - View adult posts → should NOT see buttons ✓
4. Check browser console for `[DEBUG]` messages - if they appear, investigate why `postedAsId` doesn't match any `userId` in family.members

## Next Steps If Issues Persist

If the debug log shows that `postedAsId` isn't matching any member:

1. **Check database directly:**
   ```sql
   SELECT id, author_id, posted_as_id, content 
   FROM content_posts 
   WHERE posted_as_id IS NOT NULL 
   LIMIT 10;
   ```

2. **Check child user records:**
   ```sql
   SELECT u.id, u.email, up.display_name, tu.role
   FROM tenant_users tu
   JOIN users u ON tu.user_id = u.id
   LEFT JOIN user_profiles up ON u.id = up.user_id
   WHERE tu.role LIKE 'CHILD%';
   ```

3. **Verify posted_as_id matches actual user IDs:**
   ```sql
   SELECT 
     cp.id as post_id,
     cp.author_id,
     cp.posted_as_id,
     u1.email as author_email,
     u2.email as posted_as_email
   FROM content_posts cp
   LEFT JOIN users u1 ON cp.author_id = u1.id
   LEFT JOIN users u2 ON cp.posted_as_id = u2.id
   WHERE cp.posted_as_id IS NOT NULL
   LIMIT 10;
   ```

If any `posted_as_email` is NULL, it means the `posted_as_id` references a non-existent user, which would explain why the member isn't found.
