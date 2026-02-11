'use client';
import { useState } from 'react';

export default function StageChart({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Calculate total value safely
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

    const formatCurrency = (num) => {
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
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
                height: '100%'
            }}
        >
            <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '24px'
            }}>
                Pipeline by Stage
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {data.map((item, index) => {
                    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                    const isHovered = hoveredIndex === index;

                    return (
                        <div
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: isHovered ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '3px',
                                        background: colors[index % colors.length]
                                    }} />
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: isHovered ? '600' : '400',
                                        color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        {item.name}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'var(--text-muted)',
                                        background: 'var(--bg-tertiary)',
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                    }}>
                                        {item.count}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors[index % colors.length]
                                }}>
                                    {formatCurrency(item.value)}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                height: '8px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: `linear-gradient(90deg, ${colors[index % colors.length]} 0%, ${colors[index % colors.length]}99 100%)`,
                                    borderRadius: '4px',
                                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isHovered ? `0 0 12px ${colors[index % colors.length]}66` : 'none'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total */}
            <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-muted)'
                }}>
                    Total Pipeline Value
                </span>
                <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                }}>
                    {formatCurrency(totalValue)}
                </span>
            </div>
        </div>
    );
}
