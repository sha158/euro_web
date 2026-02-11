'use client';
import { useState } from 'react';
import { opportunities } from '../data/mockData';

export default function CreateQuoteModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        opportunity: '',
        supplyStart: '',
        supplyEnd: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.opportunity || !formData.supplyStart || !formData.supplyEnd) {
            alert('Please fill all mandatory fields');
            return;
        }
        // Find the selected opportunity object
        const selectedOpp = opportunities.find(opp => opp.projectName === formData.opportunity);
        if (!selectedOpp) {
            alert('Invalid Opportunity');
            return;
        }
        onSave({ ...formData, opportunityDetails: selectedOpp });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Create First Quote
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Select Opportunity <span style={{ color: 'var(--status-error)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                name="opportunity"
                                value={formData.opportunity}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Search Opportunity...</option>
                                {opportunities.map(opp => (
                                    <option key={opp.id} value={opp.projectName}>
                                        {opp.projectName} ({opp.stage})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Only active opportunities are shown
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Expected Supply Start Date <span style={{ color: 'var(--status-error)' }}>*</span>
                        </label>
                        <input
                            type="date"
                            name="supplyStart"
                            value={formData.supplyStart}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Expected Supply End Date <span style={{ color: 'var(--status-error)' }}>*</span>
                        </label>
                        <input
                            type="date"
                            name="supplyEnd"
                            value={formData.supplyEnd}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    borderRadius: '0 0 16px 16px',
                    background: 'var(--bg-secondary)'
                }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                    >
                        Create Quote
                    </button>
                </div>
            </div>
        </div>
    );
}
