'use client';

export default function ActivityFeed({ activities }) {
    return (
        <div
            className="fade-in"
            style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                padding: '24px',
                height: '100%'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                }}>
                    Recent Activity
                </h3>
                <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}>
                    View all
                </button>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '14px',
                            padding: '14px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            animation: `fadeIn 0.4s ease ${index * 100}ms both`
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: activity.type === 'won'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : activity.type === 'quote'
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            flexShrink: 0
                        }}>
                            {activity.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                marginBottom: '4px',
                                lineHeight: 1.4
                            }}>
                                {activity.message}
                            </p>
                            <span style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)'
                            }}>
                                {activity.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
