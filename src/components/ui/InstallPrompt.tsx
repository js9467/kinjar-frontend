'use client';

import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Show prompt if on iOS Safari and not in standalone mode
    if (iOS && !standalone) {
      // Check if user has dismissed this before
      const dismissed = localStorage.getItem('install-prompt-dismissed');
      if (!dismissed) {
        // Show after 3 seconds delay
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't save dismissal so it shows again next time
  };

  if (!isIOS || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install Kinjar App</h3>
            <p className="text-sm text-blue-100 mb-3">
              Add Kinjar to your home screen for a better app experience!
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>Tap</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 10h-4V6c0-1.1-.9-2-2-2s-2 .9-2 2v4H4c-1.1 0-2 .9-2 2s.9 2 2 2h4v4c0 1.1.9 2 2 2s2-.9 2-2v-4h4c1.1 0 2-.9 2-2s-.9-2-2-2z"/>
              </svg>
              <span>then "Add to Home Screen"</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleRemindLater}
              className="text-sm px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm px-3 py-1 text-blue-100 hover:text-white transition-colors"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
