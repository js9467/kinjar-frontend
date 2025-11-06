# Profile Page Static Generation Fix

## Problem
The profile page was failing during Next.js static generation with the error:
```
Error: useChildContext must be used within a ChildProvider
```

This happened because the profile page was trying to use `useChildContext` and `useTheme` hooks that require providers (`ChildProvider` and `ThemeProvider`) which are only available within the family dashboard context.

## Root Cause
- Profile page is a standalone page that can be accessed outside of family context
- During static generation, Next.js tries to pre-render pages without the React context providers
- The required context providers were only available within `FamilyDashboard` component

## Solution

### 1. Updated Child Context (`lib/child-context.tsx`)
- Changed `useChildContext()` to `useOptionalChildContext()` in `ThemeProvider`
- `useOptionalChildContext()` returns `null` instead of throwing an error when context is unavailable

### 2. Updated Theme Context (`lib/theme-context.tsx`) 
- Changed `useChildContext()` to `useOptionalChildContext()` in `ThemeProvider`
- Added new `useOptionalTheme()` hook that returns default theme values when not in a provider:
  ```tsx
  export function useOptionalTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      return {
        currentTheme: ADULT_THEMES[0],
        allThemes: ADULT_THEMES,
        isChildTheme: false,
        setTheme: () => {},
      };
    }
    return context;
  }
  ```

### 3. Updated Profile Page (`app/profile/page.tsx`)
- Changed `useChildContext()` to `useOptionalChildContext()`
- Changed `useTheme()` to `useOptionalTheme()`
- Added null-safe handling for child context
- Added Theme type import for TypeScript

## Result
- Profile page now works both standalone and within family context
- Static generation passes without errors
- Child and theme functionality still works when providers are available
- Graceful fallbacks when providers are not available

## Files Modified
- `src/lib/child-context.tsx` - Updated ThemeProvider to use optional child context
- `src/lib/theme-context.tsx` - Added useOptionalTheme hook and updated imports
- `src/app/profile/page.tsx` - Updated to use optional context hooks

## Testing
- ✅ Static generation should now pass
- ✅ Profile page works when accessed directly
- ✅ Profile page works within family dashboard context
- ✅ Child profile editing still works when in family context
- ✅ Theme selection still works with appropriate fallbacks