'use client';
import { useState, useEffect } from 'react';

// Complete Mullion/Divider pattern definitions matching EVAERP
const mullionPatterns = [
    // Row 1: Basic Joints
    {
        id: 'i-joint',
        name: 'I Joint',
        type: 'vertical',
        divisions: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="24" y1="8" x2="24" y2="40" />
            </svg>
        )
    },
    {
        id: 'h-joint',
        name: 'H Joint',
        type: 'horizontal',
        divisions: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="24" x2="40" y2="24" />
            </svg>
        )
    },
    {
        id: 'multiple-i-joint',
        name: 'Multiple I Joint',
        type: 'vertical-multiple',
        requiresConfig: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="16" y1="8" x2="16" y2="40" />
                <line x1="24" y1="8" x2="24" y2="40" />
                <line x1="32" y1="8" x2="32" y2="40" />
            </svg>
        )
    },
    {
        id: 'multiple-h-joint',
        name: 'Multiple H Joint',
        type: 'horizontal-multiple',
        requiresConfig: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="16" x2="40" y2="16" />
                <line x1="8" y1="24" x2="40" y2="24" />
                <line x1="8" y1="32" x2="40" y2="32" />
            </svg>
        )
    },
    // Row 2: Coupling and Corner
    {
        id: 'coupling',
        name: 'Coupling Mullion',
        type: 'coupling',
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="14" height="32" rx="1" />
                <rect x="26" y="8" width="14" height="32" rx="1" />
                <line x1="22" y1="14" x2="26" y2="14" />
                <line x1="22" y1="24" x2="26" y2="24" />
                <line x1="22" y1="34" x2="26" y2="34" />
            </svg>
        )
    },
    {
        id: 'corner-90',
        name: 'Corner 90°',
        type: 'corner',
        angle: 90,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <path d="M8 8 L8 40 L24 40 L24 24 L40 24 L40 8 Z" fill="none" />
                <line x1="24" y1="8" x2="24" y2="24" />
                <line x1="8" y1="24" x2="24" y2="24" />
            </svg>
        )
    },
    {
        id: 'bay-135',
        name: 'Bay 135°',
        type: 'bay',
        angle: 135,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <path d="M8 12 L16 8 L32 8 L40 12 L40 40 L8 40 Z" fill="none" />
                <line x1="16" y1="8" x2="16" y2="40" />
                <line x1="32" y1="8" x2="32" y2="40" />
            </svg>
        )
    },
    {
        id: 'grid-georgian',
        name: 'Grid / Georgian',
        type: 'grid',
        rows: 2,
        cols: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="24" y1="8" x2="24" y2="40" />
                <line x1="8" y1="24" x2="40" y2="24" />
                <line x1="8" y1="16" x2="40" y2="16" strokeDasharray="2 2" />
                <line x1="8" y1="32" x2="40" y2="32" strokeDasharray="2 2" />
                <line x1="16" y1="8" x2="16" y2="40" strokeDasharray="2 2" />
                <line x1="32" y1="8" x2="32" y2="40" strokeDasharray="2 2" />
            </svg>
        )
    },
    {
        id: 'triple-i-joint',
        name: 'Triple I Joint',
        type: 'vertical',
        divisions: 4,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="14" y1="8" x2="14" y2="40" />
                <line x1="22" y1="8" x2="22" y2="40" />
                <line x1="30" y1="8" x2="30" y2="40" />
                <line x1="38" y1="8" x2="38" y2="40" />
            </svg>
        )
    },
    {
        id: 'custom-mullion',
        name: 'Custom Mullion',
        type: 'custom-mullion',
        isClickOnly: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="40" x2="40" y2="8" strokeWidth="2" />
                <circle cx="8" cy="40" r="2" fill="#475569" />
                <circle cx="40" cy="8" r="2" fill="#475569" />
            </svg>
        )
    },

];

// Sidebar menu items
const sidebarItems = [
    { id: 'divider', name: 'Divider', icon: '║', isActive: true },
    { id: 'panel', name: 'Panel', icon: '▱', isActive: false },
    { id: 'frame', name: 'Frame', icon: '⌐', isActive: false },
    { id: 'glass', name: 'Glass', icon: '◇', isActive: false },
    { id: 'colors', name: 'Colors', icon: '◐', isActive: false },
    { id: 'image', name: 'Image', icon: '🖼', isActive: false },
];

export default function MullionPalette({ onPatternDragStart, onPatternDragEnd, isVisible = true, onCustomMullionToggle, isCustomMullionActive = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [activeSection, setActiveSection] = useState('divider');
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand divider section when custom mullion mode is activated externally
    useEffect(() => {
        if (isCustomMullionActive) {
            setActiveSection('divider');
            setIsExpanded(true);
        }
    }, [isCustomMullionActive]);

    const handleDragStart = (e, pattern) => {
        setIsDragging(true);
        e.dataTransfer.setData('application/json', JSON.stringify(pattern));
        e.dataTransfer.effectAllowed = 'copy';

        // Create drag image
        const dragPreview = document.createElement('div');
        dragPreview.style.cssText = `
            width: 60px;
            height: 60px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            position: absolute;
            top: -1000px;
        `;
        dragPreview.innerHTML = `<span style="font-size: 10px; color: #3b82f6; font-weight: 600;">${pattern.name}</span>`;
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 30, 30);

        setTimeout(() => document.body.removeChild(dragPreview), 0);

        if (onPatternDragStart) onPatternDragStart(pattern);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (onPatternDragEnd) onPatternDragEnd();
    };

    const handleSidebarClick = (itemId) => {
        if (activeSection === itemId) {
            setIsExpanded(!isExpanded);
        } else {
            setActiveSection(itemId);
            setIsExpanded(true);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '0',
            zIndex: 100,
        }}>
            {/* Sidebar Icons */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'white',
                padding: '8px 6px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
                {sidebarItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSidebarClick(item.id)}
                        title={item.name}
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            backgroundColor: activeSection === item.id && isExpanded ? '#2563eb' : 'transparent',
                            color: activeSection === item.id && isExpanded ? 'white' : '#64748b',
                            fontSize: '20px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (activeSection !== item.id || !isExpanded) {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeSection !== item.id || !isExpanded) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* Expanded Panel - Divider Section */}
            {isExpanded && activeSection === 'divider' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '280px',
                }}>
                    {/* Header */}
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f1f5f9',
                    }}>
                        Divider
                    </div>

                    {/* Pattern Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px',
                    }}>
                        {mullionPatterns.map((pattern) => {
                            const isCustom = pattern.isClickOnly;
                            const isActive = isCustom && isCustomMullionActive;
                            return (
                                <div
                                    key={pattern.id}
                                    draggable={!isCustom}
                                    onDragStart={isCustom ? undefined : (e) => handleDragStart(e, pattern)}
                                    onDragEnd={isCustom ? undefined : handleDragEnd}
                                    onClick={isCustom ? () => onCustomMullionToggle?.() : undefined}
                                    title={pattern.name}
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isCustom ? 'pointer' : 'grab',
                                        border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        backgroundColor: isActive ? '#2563eb' : (isDragging && !isCustom ? '#f8fafc' : 'white'),
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.backgroundColor = '#eff6ff';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    {isActive ? (
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#ffffff" strokeWidth="1.5">
                                            <rect x="8" y="8" width="32" height="32" rx="1" />
                                            <line x1="8" y1="40" x2="40" y2="8" strokeWidth="2" />
                                            <circle cx="8" cy="40" r="2" fill="#ffffff" />
                                            <circle cx="40" cy="8" r="2" fill="#ffffff" />
                                        </svg>
                                    ) : pattern.icon}
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-22px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '9px',
                                            color: '#2563eb',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            Custom Mullion
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Drag hint */}
                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '12px 4px 4px',
                        marginTop: '12px',
                        borderTop: '1px solid #f1f5f9',
                    }}>
                        ✨ Drag & drop onto a panel to apply
                    </div>
                </div>
            )}

            {/* Placeholder for other sections */}
            {isExpanded && activeSection !== 'divider' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '200px',
                }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px',
                    }}>
                        {sidebarItems.find(i => i.id === activeSection)?.name}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '20px',
                    }}>
                        Coming soon...
                    </div>
                </div>
            )}
        </div>
    );
}

// Export patterns for use in other components
export { mullionPatterns };
