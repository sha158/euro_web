'use client';
import { useState } from 'react';

const LOUVER_TYPES = ['Fixed Glass Louvers', 'Movable Glass Louvers'];

export default function LouverTypeModal({ isOpen, onClose, onConfirm }) {
    const [louverType, setLouverType] = useState('Fixed Glass Louvers');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            type: louverType === 'Fixed Glass Louvers' ? 'fixed' : 'movable',
        });
        setLouverType('Fixed Glass Louvers');
    };

    const handleClose = () => {
        setLouverType('Fixed Glass Louvers');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '420px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                position: 'relative',
            }}>
                {/* Close button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '16px', right: '16px',
                        border: 'none', background: 'none',
                        fontSize: '24px', cursor: 'pointer',
                        color: '#94a3b8', lineHeight: 1,
                    }}
                >
                    &times;
                </button>

                {/* Title */}
                <h2 style={{
                    fontSize: '20px', fontWeight: '600',
                    color: '#1e293b', marginBottom: '28px',
                }}>
                    Select Louver Type
                </h2>

                {/* Louver Type Dropdown */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={labelStyle}>Select louver type</label>
                    <div style={selectWrapperStyle}>
                        <select
                            value={louverType}
                            onChange={e => setLouverType(e.target.value)}
                            style={selectStyle}
                        >
                            {LOUVER_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <svg style={chevronStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Confirm button */}
                <button
                    onClick={handleConfirm}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}

// ── Shared styles ──

const labelStyle = {
    fontSize: '14px',
    color: '#94a3b8',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
};

const selectWrapperStyle = {
    position: 'relative',
};

const selectStyle = {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: '1.5px solid #e2e8f0',
    fontSize: '16px',
    color: '#1e293b',
    outline: 'none',
    background: 'transparent',
    appearance: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
};

const chevronStyle = {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
};
