/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Global React hooks
declare const useState: typeof import('react').useState;
declare const useEffect: typeof import('react').useEffect;
declare const useCallback: typeof import('react').useCallback;
declare const useMemo: typeof import('react').useMemo;