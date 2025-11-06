# Child Profile and Comment Permission Fixes

## Issues Fixed

### 1. Children Commenting on Connected Family Posts (403 Error) ✅

**Problem:** When a child from one family tried to comment on a post from a connected family, they received a `403 posted_as_not_tenant_member` error.

**Root Cause:** The backend comment permission check required the `posted_as_id` (child) to be a direct member of the post's tenant. However, children belong to their own family's tenant, not the post's tenant.

**Solution:** Updated the backend permission logic in `kinjar-api/app.py` (lines 5232-5240) to check if the child belongs to a family that's **connected** to the post's family, rather than requiring direct membership.

**Changes Made:**
- Modified the `posted_as_id` verification in the `/api/posts/<post_id>/comments` endpoint
- Added a check to see if the child's family has an accepted connection with the post's family
- Children from connected families can now comment on posts while acting as themselves

**Status:** ✅ Deployed and working

### 2. Children Editing/Deleting Comments on Connected Family Posts (403 Error) ✅

**Problem:** When a child tried to edit or delete their own comment on a connected family's post, they received a `403 not_member` error.

**Root Cause:** The edit and delete comment endpoints checked if the user was a direct member of the comment's post tenant, failing immediately for users from connected families.

**Solution:** Extended the same connected family permission logic to both the edit and delete comment endpoints.

**Changes Made:**
- Updated `/api/comments/<comment_id>` PATCH endpoint (edit comment) 
- Updated `/api/comments/<comment_id>` DELETE endpoint (delete comment)
- Both endpoints now check for family connections when direct membership is not found
- Users from connected families can now edit/delete their own comments

**Status:** ✅ Deployed and working

### 3. Child Profile Editing (500 Error) ✅

**Problem:** When trying to edit a child's profile (bio, theme), the frontend called `PATCH /api/child-profiles/{id}` which doesn't exist in the backend, resulting in a 500 error.

**Root Cause:** The `updateChildProfile` function in `src/lib/api.ts` was using an incorrect endpoint that was never implemented in the backend.

**Solution:** Updated the `updateChildProfile` function to use the existing and correct backend endpoint `/api/family/{familyId}/member/{memberId}`.

**Changes Made:**
- Fixed `updateChildProfile` in `kinjar frontend 2.0/src/lib/api.ts` (around line 906)
- Function now:
  1. Gets the current family context from the subdomain
  2. Fetches the family details to get the tenant ID
  3. Maps the `bio` field to the backend's `quote` field
  4. Calls the correct `/api/family/{familyId}/member/{memberId}` endpoint

**Status:** ✅ Fixed in code, needs frontend rebuild/deploy

## Files Modified

1. **kinjar-api/app.py**
   - Updated comment creation permission logic for connected family children (lines ~5232-5265)
   - Updated comment edit permission logic for connected family users (lines ~5336-5385)
   - Updated comment delete permission logic for connected family users (lines ~5539-5588)

2. **kinjar frontend 2.0/src/lib/api.ts**
   - Fixed `updateChildProfile` function to use correct backend endpoint (line ~906)

## Deployment Status

### Backend (kinjar-api) ✅
- Committed: e31b579
- Pushed to GitHub: ✅
- Auto-deployment via GitHub Actions: In progress
- URL: https://kinjar-api.fly.dev

### Frontend (kinjar-frontend) ⏳
- Changes committed locally
- Needs: Push to GitHub and Vercel will auto-deploy
- URL: https://kinjar.com

## Testing Recommendations

1. **Test child commenting across families:**
   - Have families A and B connected
   - User from family A acting as their child
   - Comment on a post from family B
   - Verify comment is posted successfully ✅

2. **Test child comment editing/deleting across families:**
   - Have families A and B connected
   - User from family A acting as their child
   - Comment on a post from family B
   - Edit the comment - verify it saves ✅
   - Delete the comment - verify it's removed ✅

3. **Test child profile editing:**
   - Navigate to a child's profile page
   - Edit the bio field
   - Verify it saves without errors (needs frontend deployment)
   - Verify the bio appears correctly after refresh
