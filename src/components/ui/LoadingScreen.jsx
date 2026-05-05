import React from 'react';
import { FileText } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafaf9',
      fontFamily: "'Inter', system-ui, sans-serif",
      gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48,
        background: '#1a2e4a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <FileText style={{ width: 22, height: 22, color: '#fff' }} />
      </div>
      <div style={{
        fontFamily: "'Source Serif Pro', Georgia, serif",
        fontSize: '1.1rem',
        color: '#888',
        fontStyle: 'italic',
      }}>{message}</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
