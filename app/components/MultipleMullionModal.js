'use client';
import { useState } from 'react';

export default function MultipleMullionModal({ isOpen, onClose, onConfirm, direction = 'vertical' }) {
    const [numberOfMullions, setNumberOfMullions] = useState(2);
    const [equalizationType, setEqualizationType] = useState('mullion');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            count: numberOfMullions,
            equalization: equalizationType,
            direction
        });
        onClose();
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
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        border: 'none',
                        background: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#94a3b8'
                    }}
                >
                    ×
                </button>

                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
                    Select Multiple Mullion Specifications
                </h2>

                {/* Number of Mullions */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        fontSize: '14px',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500'
                    }}>
                        Select no of mullions
                    </label>
                    <input
                        type="number"
                        min="2"
                        max="10"
                        value={numberOfMullions}
                        onChange={(e) => setNumberOfMullions(parseInt(e.target.value) || 2)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '16px',
                            color: '#1e293b',
                            fontWeight: '600'
                        }}
                    />
                </div>

                {/* Type of Equalization */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{
                        fontSize: '14px',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500'
                    }}>
                        Type of Equalization
                    </label>
                    <div style={{
                        border: '2px solid #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <div
                            onClick={() => setEqualizationType('mullion')}
                            style={{
                                padding: '14px 16px',
                                backgroundColor: equalizationType === 'mullion' ? '#3b82f6' : 'white',
                                color: equalizationType === 'mullion' ? 'white' : '#1e293b',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderBottom: '1px solid #cbd5e1'
                            }}
                        >
                            {equalizationType === 'mullion' && <span>✓</span>}
                            Mullion Equalization
                        </div>
                        <div
                            onClick={() => setEqualizationType('glass')}
                            style={{
                                padding: '14px 16px',
                                backgroundColor: equalizationType === 'glass' ? '#3b82f6' : '#64748b',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {equalizationType === 'glass' && <span>✓</span>}
                            Glass Equalization
                        </div>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '600'
                    }}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}
