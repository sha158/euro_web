'use client';

export default function StatCard({
    title,
    count,
    value,
    trend,
    trendUp,
    icon,
    color = '#3b82f6',
    delay = 0
}) {
    const formatCurrency = (num) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
        return `₹${num}`;
    };

    return (
        <div
            className="fade-in"
            style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                animationDelay: `${delay}ms`,
                cursor: 'pointer'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`;
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Background Gradient Accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: `radial-gradient(circle at top right, ${color}15 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon || (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    )}
                </div>

                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: trendUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: trendUp ? 'var(--status-success)' : 'var(--status-error)',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            style={{ transform: trendUp ? 'rotate(0deg)' : 'rotate(180deg)' }}
                        >
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                        {trend}
                    </div>
                )}
            </div>

            <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {title}
            </h3>

            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px'
            }}>
                <span style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    lineHeight: 1
                }}>
                    {count}
                </span>
                <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: color
                }}>
                    {formatCurrency(value)}
                </span>
            </div>
        </div>
    );
}
