# Post-as-Child Fix - November 4, 2025

## Issue Identified
When posting "as" a child (like Parker), the system was failing because:

1. **Root Cause**: Frontend was sending the child's member ID (`ce3bdf89-23a5-438e-a568-2e8ab9121b76`) as the `author_id`
2. **Problem**: Child members don't exist as users in the `users` table - they only exist as family members
3. **Result**: Backend couldn't find the author in `tenant_users` table, causing post creation to fail
4. **Cascade Effect**: When posts failed to create properly, subsequent comments also failed with 404 errors

## Solution Applied

### Frontend Changes (PostCreator.tsx)
- **Before**: Used `selectedMember?.userId || selectedMember?.id || selectedMemberId` as author ID
- **After**: Always use `user.id` (logged-in user's ID) as the author ID
- **Added**: `postedAsMember` info to track who the post is displayed as

### Frontend Changes (api.ts)
- **Updated**: `createPost` interface to include optional `postedAsMember` field
- **Enhanced**: Post creation to use logged-in user's ID while preserving display info
- **Result**: Posts created with valid user ID, but display shows selected family member

## Technical Details

### What happens now when posting as Parker:
1. **UI**: User selects "Parker" from dropdown
2. **API Call**: Uses Jay's user ID (`ae3ade1f-f499-446a-9c37-e74583c90315`) as author_id
3. **Database**: Post created successfully with valid user reference
4. **Display**: Post shows "Parker" as the author name
5. **Comments**: Work correctly since post exists with valid user ID

### Security & Permissions
- ✅ Adults can only post as children under 14 (age-based filtering preserved)
- ✅ Role-based filtering for CHILD_0_5, CHILD_5_10, CHILD_10_14 preserved  
- ✅ Adults cannot select other adults (filtering preserved)
- ✅ All posts still require valid family membership

## Testing Results Expected

After this fix:
- ✅ Posting as children should work without errors
- ✅ Comments on child-authored posts should work
- ✅ Posts should persist and display correctly
- ✅ Existing functionality for adult posts unchanged

## Future Enhancements

For full "post as" functionality, consider backend changes:
- Add `posted_as_member_id` field to `content_posts` table
- Store child member info separately from author_id
- Enhanced display logic based on posted_as vs actual author

## Files Modified
- `src/components/family/PostCreator.tsx` - Fixed author ID logic
- `src/lib/api.ts` - Updated interface and post creation logic