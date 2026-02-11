'use client';
import { useState } from 'react';

export default function TopBar({ title, subtitle }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid transparent',
            borderImage: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), rgba(148,163,184,0.1), transparent) 1',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        }}>
            {/* Left Section - Title */}
            <div>
                <h1 style={{
                    fontSize: '26px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                    letterSpacing: '-0.3px',
                    position: 'relative',
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.2px',
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right Section - Actions */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {/* Search */}
                <div style={{
                    position: 'relative',
                    width: '280px'
                }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 42px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: `1px solid ${searchFocused ? 'rgba(56,189,248,0.3)' : 'var(--border-metallic)'}`,
                            borderRadius: '10px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: searchFocused
                                ? 'inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 3px rgba(56,189,248,0.08), 0 0 16px rgba(56,189,248,0.06)'
                                : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        }}
                        onFocus={(e) => setSearchFocused(true)}
                        onBlur={(e) => setSearchFocused(false)}
                    />
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={searchFocused ? '#38bdf8' : 'var(--text-muted)'}
                        strokeWidth="2"
                        style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: `translateY(-50%) ${searchFocused ? 'scale(1.1)' : 'scale(1)'}`,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                {/* Help Button */}
                <button style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-metallic)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'var(--text-muted)',
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)';
                        e.currentTarget.style.color = '#e2e8f0';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                        e.currentTarget.style.borderColor = 'var(--border-metallic)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(15, 23, 42, 0.5)',
                            border: '1px solid var(--border-metallic)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            color: 'var(--text-muted)',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                            e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)';
                            e.currentTarget.style.color = '#e2e8f0';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                            e.currentTarget.style.borderColor = 'var(--border-metallic)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {/* Pulsing Notification Badge */}
                        <span style={{
                            position: 'absolute',
                            top: '7px',
                            right: '7px',
                            width: '7px',
                            height: '7px',
                            background: '#ef4444',
                            borderRadius: '50%',
                            border: '1.5px solid rgba(15, 23, 42, 0.85)',
                            animation: 'glowPulse 2s infinite',
                        }} />
                    </button>

                    {/* Notifications Dropdown - Glass Effect */}
                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            right: 0,
                            width: '320px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 24px rgba(56,189,248,0.05)',
                            overflow: 'hidden',
                            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}>
                            <div style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid var(--border-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(15, 23, 42, 0.4)',
                            }}>
                                <span style={{
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                }}>Notifications</span>
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#38bdf8',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                }}>Mark all read</button>
                            </div>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{
                                        padding: '14px 16px',
                                        borderBottom: '1px solid var(--border-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(30, 45, 71, 0.5)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            New quote revision submitted
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}>
                                            {i} hour{i > 1 ? 's' : ''} ago
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Button */}
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-metallic)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)';
                        e.currentTarget.style.color = '#e2e8f0';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.5)';
                        e.currentTarget.style.borderColor = 'var(--border-metallic)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Filter
                </button>
            </div>
        </header>
    );
}
