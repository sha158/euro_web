'use client';
import { useState } from 'react';

const FAN_SHAPES = ['Circular', 'Square'];
const FAN_POSITIONS = ['Center'];

export default function FanSpecificationModal({ isOpen, onClose, onConfirm }) {
    const [fanShape, setFanShape] = useState('Circular');
    const [fanDiameter, setFanDiameter] = useState('');
    const [fanPosition, setFanPosition] = useState('Center');
    const [includeGlass, setIncludeGlass] = useState(true);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            shape: fanShape.toLowerCase(),
            diameter: fanDiameter ? parseInt(fanDiameter) : null,
            position: fanPosition.toLowerCase(),
            includeGlass,
        });
        // Reset for next open
        setFanDiameter('');
        setFanShape('Circular');
        setFanPosition('Center');
        setIncludeGlass(true);
    };

    const handleClose = () => {
        setFanDiameter('');
        setFanShape('Circular');
        setFanPosition('Center');
        setIncludeGlass(true);
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
                    Fan Specification
                </h2>

                {/* Fan Shape */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Fan Shape</label>
                    <div style={selectWrapperStyle}>
                        <select
                            value={fanShape}
                            onChange={e => setFanShape(e.target.value)}
                            style={selectStyle}
                        >
                            {FAN_SHAPES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <svg style={chevronStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Fan Diameter */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Fan Diameter</label>
                    <input
                        type="number"
                        value={fanDiameter}
                        onChange={e => setFanDiameter(e.target.value)}
                        placeholder="Enter diameter in mm"
                        min={50}
                        style={inputStyle}
                    />
                </div>

                {/* Fan Position */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Fan Position</label>
                    <div style={selectWrapperStyle}>
                        <select
                            value={fanPosition}
                            onChange={e => setFanPosition(e.target.value)}
                            style={selectStyle}
                        >
                            {FAN_POSITIONS.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <svg style={chevronStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Include Glass */}
                <div style={{ marginBottom: '32px' }}>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            color: '#3b82f6',
                            fontWeight: '500',
                        }}
                        onClick={() => setIncludeGlass(prev => !prev)}
                    >
                        <span style={{
                            width: '20px', height: '20px',
                            borderRadius: '4px',
                            border: includeGlass ? 'none' : '2px solid #cbd5e1',
                            backgroundColor: includeGlass ? '#3b82f6' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                        }}>
                            {includeGlass && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </span>
                        Include Glass
                    </label>
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

const inputStyle = {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: '1.5px solid #e2e8f0',
    fontSize: '16px',
    color: '#1e293b',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'Inter, sans-serif',
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
