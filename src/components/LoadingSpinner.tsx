'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = '#007bff',
  text 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const spinnerSize = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `2px solid ${color}33`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'kinjar-spin 1s linear infinite'
        }}
      />
      {text && (
        <span style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          {text}
        </span>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes kinjar-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}