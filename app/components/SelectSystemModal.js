'use client';
import { useState, useEffect } from 'react';
import { slidingBrands, slidingSystems } from '../data/slidingSystemsData';

export default function SelectSystemModal({ isOpen, onClose, onConfirm }) {
    const [selectedBrand, setSelectedBrand] = useState(slidingBrands[0]);
    const [selectedSystem, setSelectedSystem] = useState(slidingSystems[slidingBrands[0]][0]);

    // When brand changes, auto-select the first system of that brand
    useEffect(() => {
        const systems = slidingSystems[selectedBrand];
        if (systems && systems.length > 0) {
            setSelectedSystem(systems[0]);
        }
    }, [selectedBrand]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            brand: selectedBrand,
            system: selectedSystem,
        });
        onClose();
    };

    const currentSystems = slidingSystems[selectedBrand] || [];

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
                    Select System
                </h2>

                {/* Brand Dropdown */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        fontSize: '14px',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500'
                    }}>
                        Brand
                    </label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '16px',
                            color: '#1e293b',
                            fontWeight: '600',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            appearance: 'auto',
                        }}
                    >
                        {slidingBrands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>

                {/* System Dropdown */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{
                        fontSize: '14px',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500'
                    }}>
                        Select system
                    </label>
                    <select
                        value={selectedSystem}
                        onChange={(e) => setSelectedSystem(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '16px',
                            color: '#1e293b',
                            fontWeight: '600',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            appearance: 'auto',
                        }}
                    >
                        {currentSystems.map((system) => (
                            <option key={system} value={system}>{system}</option>
                        ))}
                    </select>
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
