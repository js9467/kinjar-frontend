'use client';

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from './auth';
import { useOptionalChildContext } from './child-context';

// Theme definitions
export const ADULT_THEMES = [
  { id: 'blue', name: 'Ocean Blue', color: '#3B82F6', description: 'Professional and calm' },
  { id: 'green', name: 'Forest Green', color: '#10B981', description: 'Natural and balanced' },
  { id: 'purple', name: 'Royal Purple', color: '#8B5CF6', description: 'Creative and elegant' },
  { id: 'gray', name: 'Classic Gray', color: '#6B7280', description: 'Timeless and neutral' },
];

export const CHILD_THEMES = [
  { id: 'sunshine', name: '☀️ Sunshine', color: '#F59E0B', description: 'Bright and cheerful' },
  { id: 'rainbow', name: '🌈 Rainbow', color: '#EC4899', description: 'Colorful and fun' },
  { id: 'ocean', name: '🌊 Ocean Adventure', color: '#06B6D4', description: 'Cool and adventurous' },
  { id: 'forest', name: '🌲 Forest Explorer', color: '#059669', description: 'Nature and discovery' },
  { id: 'space', name: '🚀 Space Explorer', color: '#7C3AED', description: 'Cosmic and exciting' },
  { id: 'candy', name: '🍭 Candy Land', color: '#F472B6', description: 'Sweet and playful' },
];

export interface Theme {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ThemeContextType {
  currentTheme: Theme;
  allThemes: Theme[];
  isChildTheme: boolean;
  setTheme: (themeId: string) => void;
  getThemeById: (themeId: string) => Theme | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Optional theme hook that returns default values when not in a ThemeProvider
export function useOptionalTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default theme context when not available
    return {
      currentTheme: ADULT_THEMES[0],
      allThemes: ADULT_THEMES,
      isChildTheme: false,
      setTheme: () => {},
    };
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();
  const childContext = useOptionalChildContext();
  const selectedChild = childContext?.selectedChild;
  const [currentTheme, setCurrentTheme] = useState<Theme>(ADULT_THEMES[0]);

  // Get the appropriate theme based on current context
  const getCurrentThemeId = useCallback(() => {
    if (selectedChild) {
      // Child mode - get child's theme
      const themeKey = `childTheme_${selectedChild.id}`;
      return localStorage.getItem(themeKey) || 'sunshine';
    } else if (user) {
      // Adult mode - get user's theme
      const themeKey = `userTheme_${user.id}`;
      return localStorage.getItem(themeKey) || 'blue';
    }
    return 'blue';
  }, [selectedChild, user]);

  // Update theme when context changes
  useEffect(() => {
    const themeId = getCurrentThemeId();
    const isChild = !!selectedChild;
    const themes = isChild ? CHILD_THEMES : ADULT_THEMES;
    const theme = themes.find(t => t.id === themeId) || themes[0];
    setCurrentTheme(theme);
  }, [selectedChild, user, getCurrentThemeId]);

  const setTheme = useCallback((themeId: string) => {
    if (selectedChild) {
      // Save child's theme
      localStorage.setItem(`childTheme_${selectedChild.id}`, themeId);
      const theme = CHILD_THEMES.find(t => t.id === themeId);
      if (theme) setCurrentTheme(theme);
    } else if (user) {
      // Save user's theme
      localStorage.setItem(`userTheme_${user.id}`, themeId);
      const theme = ADULT_THEMES.find(t => t.id === themeId);
      if (theme) setCurrentTheme(theme);
    }
  }, [selectedChild, user]);

  const getThemeById = useCallback((themeId: string): Theme | undefined => {
    const allThemes = [...ADULT_THEMES, ...CHILD_THEMES];
    return allThemes.find(t => t.id === themeId);
  }, []);

  const isChildTheme = !!selectedChild;
  const allThemes = isChildTheme ? CHILD_THEMES : ADULT_THEMES;

  const value: ThemeContextType = {
    currentTheme,
    allThemes,
    isChildTheme,
    setTheme,
    getThemeById,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        style={{ '--theme-color': currentTheme.color } as React.CSSProperties}
        className="theme-provider"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// CSS custom property for dynamic theming
export const getThemeStyles = (theme: Theme) => ({
  '--theme-primary': theme.color,
  '--theme-primary-light': theme.color + '20', // 20% opacity
  '--theme-primary-dark': theme.color + 'CC', // 80% opacity
});