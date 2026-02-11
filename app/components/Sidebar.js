'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
    {
        name: 'Dashboard',
        path: '/',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        )
    },
    {
        name: 'Opportunities',
        path: '/opportunities',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        )
    },
    {
        name: 'Quotes',
        path: '/quotes',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
            </svg>
        )
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: isExpanded ? '240px' : '72px',
                background: 'linear-gradient(180deg, #0f1729 0%, #070b14 100%)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 0',
                transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 100,
                overflow: 'hidden',
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Logo Section */}
            <div style={{
                padding: '12px 16px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
            }}>
                {/* Aluminum Logo Box */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(145deg, #94a3b8 0%, #64748b 50%, #94a3b8 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '18px',
                    color: '#0f172a',
                    flexShrink: 0,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.4)',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '-1px',
                }}>
                    E
                </div>
                {/* Metallic Brand Text */}
                <span style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '3px',
                    whiteSpace: 'nowrap',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.3s ease 0.1s',
                    background: 'linear-gradient(135deg, #94a3b8 0%, #e2e8f0 50%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    EURO
                </span>
            </div>

            {/* Machined Groove Divider */}
            <div style={{
                height: '1px',
                margin: '0 16px 24px',
                background: 'linear-gradient(90deg, transparent, #374151, #4b5563, #374151, transparent)',
            }} />

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0 12px' }}>
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.path ||
                        (item.path !== '/' && pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '12px 16px',
                                marginBottom: '4px',
                                borderRadius: '10px',
                                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                                background: isActive
                                    ? 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(59,130,246,0.06) 100%)'
                                    : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isActive
                                    ? '0 0 20px rgba(56,189,248,0.08), inset 0 0 20px rgba(56,189,248,0.03)'
                                    : 'none',
                                border: isActive
                                    ? '1px solid rgba(56,189,248,0.12)'
                                    : '1px solid transparent',
                            }}
                            onMouseOver={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                                    e.currentTarget.style.color = '#e2e8f0';
                                    e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            {/* Active Accent Bar */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '20px',
                                    background: 'linear-gradient(180deg, #38bdf8, #3b82f6)',
                                    borderRadius: '0 3px 3px 0',
                                    boxShadow: '0 0 8px rgba(56,189,248,0.5)',
                                }} />
                            )}
                            {/* Icon with Glow */}
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0,
                                filter: isActive ? 'drop-shadow(0 0 4px rgba(56,189,248,0.4))' : 'none',
                                transition: 'filter 0.3s ease',
                            }}>
                                {item.icon}
                            </span>
                            {/* Nav Label */}
                            <span style={{
                                fontSize: '14px',
                                fontWeight: isActive ? '600' : '500',
                                whiteSpace: 'nowrap',
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s',
                                letterSpacing: '0.3px',
                            }}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Machined Groove Divider */}
            <div style={{
                height: '1px',
                margin: '0 16px 0',
                background: 'linear-gradient(90deg, transparent, #374151, #4b5563, #374151, transparent)',
            }} />

            {/* User Profile */}
            <div style={{
                padding: '16px 12px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    {/* Avatar with Metallic Ring */}
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        padding: '2px',
                        background: 'linear-gradient(135deg, #64748b, #94a3b8, #64748b)',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1729 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#94a3b8',
                            letterSpacing: '0.5px',
                        }}>
                            AD
                        </div>
                    </div>
                    <div style={{
                        overflow: 'hidden',
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                        transition: 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s',
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#e2e8f0',
                            whiteSpace: 'nowrap',
                        }}>
                            Admin User
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            admin@euroerp.com
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
