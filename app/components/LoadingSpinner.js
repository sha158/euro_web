'use client';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      color: 'var(--text-muted)',
      fontSize: '14px',
      gap: '12px',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid var(--border-primary)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
