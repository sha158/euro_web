'use client';
import { useState } from 'react';

export default function SalesChart({ data }) {
    const [hoveredBar, setHoveredBar] = useState(null);

    const maxSales = Math.max(...data.map(d => d.sales));

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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
            }}>
                <div>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                    }}>
                        Sales Analytics
                    </h3>
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)'
                    }}>
                        Weekly sales performance
                    </p>
                </div>

                <select style={{
                    padding: '8px 14px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: 'none'
                }}>
                    <option>Last 7 weeks</option>
                    <option>Last 30 days</option>
                    <option>This month</option>
                </select>
            </div>

            {/* Chart */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '16px',
                height: '220px',
                padding: '0 8px'
            }}>
                {data.map((item, index) => {
                    const heightPercent = (item.sales / maxSales) * 100;
                    const isHovered = hoveredBar === index;

                    return (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                position: 'relative'
                            }}
                            onMouseEnter={() => setHoveredBar(index)}
                            onMouseLeave={() => setHoveredBar(null)}
                        >
                            {/* Tooltip */}
                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: `calc(${heightPercent}% + 40px)`,
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-secondary)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {formatCurrency(item.sales)}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {item.opportunities} opportunities
                                    </div>
                                </div>
                            )}

                            {/* Bar */}
                            <div
                                style={{
                                    width: '100%',
                                    height: `${heightPercent}%`,
                                    minHeight: '20px',
                                    background: isHovered
                                        ? 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)'
                                        : 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '8px 8px 4px 4px',
                                    transition: 'all 0.3s ease',
                                    transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                                    transformOrigin: 'bottom',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: isHovered ? '0 4px 20px rgba(59, 130, 246, 0.4)' : 'none'
                                }}
                            />

                            {/* Label */}
                            <span style={{
                                fontSize: '12px',
                                color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: isHovered ? '600' : '400',
                                transition: 'all 0.2s ease'
                            }}>
                                {item.week.replace('Week ', 'W')}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-primary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                    }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sales Value</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--status-success)'
                    }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Opportunities</span>
                </div>
            </div>
        </div>
    );
}
