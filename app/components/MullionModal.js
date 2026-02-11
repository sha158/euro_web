'use client';
import { useState } from 'react';

const mullionPatterns = [
    { id: 'v-split-2', name: 'Vertical Mullion', type: 'vertical', divisions: 2, icon: 'M10,10 L10,90 M50,10 L50,90' },
    { id: 'h-split-2', name: 'Horizontal Mullion', type: 'horizontal', divisions: 2, icon: 'M10,50 L90,50' },
    { id: 'v-split-3', name: 'Vertical 3-Panel', type: 'vertical', divisions: 3, icon: 'M10,10 L10,90 M35,10 L35,90 M65,10 L65,90' },
    { id: 'h-split-3', name: 'Horizontal 3-Panel', type: 'horizontal', divisions: 3, icon: 'M10,30 L90,30 M10,60 L90,60' },
    { id: 'v-multiple', name: 'Vertical Multiple Mullion', type: 'vertical-multiple', requiresConfig: true, icon: 'M10,10 L10,90 M30,10 L30,90 M50,10 L50,90 M70,10 L70,90' },
    { id: 'h-multiple', name: 'Horizontal Multiple Mullion', type: 'horizontal-multiple', requiresConfig: true, icon: 'M10,25 L90,25 M10,50 L90,50 M10,75 L90,75' },
    { id: 'sliding-2', name: 'Sliding Door', type: 'sliding', divisions: 2, icon: 'M10,10 L10,90 L50,90 L50,10 M50,10 L90,10 L90,90 L50,90' },
    { id: 'casement-2', name: 'Casement Window', type: 'casement', divisions: 2, icon: 'M10,10 L50,10 L50,90 L10,90 Z M50,10 L90,10 L90,90 L50,90 Z' },
    { id: 'awning', name: 'Awning Window', type: 'awning', divisions: 2, icon: 'M10,10 L90,10 L90,50 L10,50 Z M10,50 L90,50 L90,90 L10,90 Z' },
    { id: 'fixed-grid', name: 'Fixed Grid', type: 'grid', divisions: 4, icon: 'M10,50 L90,50 M50,10 L50,90' },
    { id: 'v-split-4', name: 'Vertical 4-Panel', type: 'vertical', divisions: 4, icon: 'M10,10 L10,90 M30,10 L30,90 M60,10 L60,90 M85,10 L85,90' },
    { id: 'l-joint', name: 'L Joint', type: 'l-joint', divisions: 2, icon: 'M10,10 L10,90 L90,90 L90,50 L50,50 L50,10 Z' }
];

export default function MullionModal({ isOpen, onClose, onSelect }) {
    const [selectedPattern, setSelectedPattern] = useState(null);

    if (!isOpen) return null;

    const handleSelect = (pattern) => {
        setSelectedPattern(pattern);
    };

    const handleConfirm = () => {
        if (selectedPattern) {
            onSelect(selectedPattern);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Divider</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    {mullionPatterns.map((pattern) => (
                        <div
                            key={pattern.id}
                            onClick={() => handleSelect(pattern)}
                            style={{
                                border: selectedPattern?.id === pattern.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '16px',
                                cursor: 'pointer',
                                backgroundColor: selectedPattern?.id === pattern.id ? '#eff6ff' : 'white',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="80" height="80" viewBox="0 0 100 100" style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                <rect x="5" y="5" width="90" height="90" fill="none" stroke="#94a3b8" strokeWidth="2" />
                                <path d={pattern.icon} fill="none" stroke="#334155" strokeWidth="2" />
                            </svg>
                            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.2' }}>
                                {pattern.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPattern}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            background: selectedPattern ? '#3b82f6' : '#cbd5e1',
                            color: 'white',
                            cursor: selectedPattern ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
