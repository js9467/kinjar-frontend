# Test Fixes Summary

## Issues Fixed

### 1. Comments Error (404)
**Problem**: Comments were failing with 404 error because API client was calling `/posts/<id>/comments` instead of `/api/posts/<id>/comments`

**Solution**: Updated the `addComment` method in `api.ts` to use the correct endpoint `/api/posts/${postId}/comments`

**Files Changed**: 
- `src/lib/api.ts` - Updated addComment method endpoint
- `src/lib/api.ts` - Enhanced addComment to handle backend response format and provide fallback author information

### 2. Posts on behalf of children don't persist  
**Problem**: Frontend was sending member IDs for children who don't have user accounts, but backend expects user IDs that exist in the users table

**Solution**: Modified PostCreator to:
1. Only include family members who have user accounts (`userId` exists) in the member selection dropdown
2. Send the `userId` instead of member `id` as the `authorId` when creating posts
3. Added validation to ensure only members with user accounts can be selected

**Files Changed**:
- `src/components/family/PostCreator.tsx` - Updated normalizeEligibleMembers to filter out members without userId
- `src/components/family/PostCreator.tsx` - Updated createPost call to use userId instead of member id
- `src/components/family/PostCreator.tsx` - Enhanced validation and logging

## Testing

To test these fixes:

1. **Comment Test**: 
   - Navigate to a family page with posts
   - Try adding a comment to any post
   - Comment should be added successfully without 404 error

2. **Post As Test**:
   - Navigate to family page
   - Try creating a post using the "Post as:" dropdown
   - Only members with user accounts should appear in dropdown
   - Posts should persist successfully
   - Posts should appear in the feed immediately

## Notes

- Children without user accounts will no longer appear in the "Post as" dropdown
- This is the correct behavior since only actual user accounts can create posts
- If family admins want to post on behalf of children, they should post as themselves and mention the child in the content