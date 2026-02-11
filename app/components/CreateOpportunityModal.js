'use client';
import { useState } from 'react';
import { opportunitySources, opportunityStageOptions, teamMembers } from '../data/mockData';

export default function CreateOpportunityModal({ onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        projectName: '',
        salutation: 'Mr.',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        note: '',
        source: '',
        billTo: '',
        marketingPartner: '',
        estimatedValue: '',
        category: '',
        expectedClosure: '',
        supplyStart: '',
        supplyEnd: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (step === 1 && (!formData.projectName || !formData.firstName)) {
            alert('Please fill mandatory fields: Project Name and First Name');
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        if (step === 2 && !formData.source) {
            alert('Please fill mandatory fields: Source');
            return;
        }
        onSave(formData);
    };

    const steps = [
        { number: 1, label: 'Basic Info' },
        { number: 2, label: 'Official Info' }
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Create Opportunity
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

                {/* Stepper */}
                <div style={{
                    padding: '24px 24px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px'
                }}>
                    {steps.map((s, idx) => (
                        <div
                            key={s.number}
                            onClick={() => idx < step && setStep(s.number)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: idx < step ? 'pointer' : 'default',
                                opacity: step === s.number ? 1 : 0.5
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: step >= s.number ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: step >= s.number ? 'white' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                border: `1px solid ${step >= s.number ? 'var(--accent-primary)' : 'var(--border-primary)'}`
                            }}>
                                {s.number}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>

                    {step === 1 ? (
                        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Project Name <span style={{ color: 'var(--status-error)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Salutation
                                </label>
                                <select
                                    name="salutation"
                                    value={formData.salutation}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option>Mr.</option>
                                    <option>Ms.</option>
                                    <option>Mrs.</option>
                                    <option>Dr.</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    First Name <span style={{ color: 'var(--status-error)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Doe"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Phone
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select style={{ width: '80px' }} className="input-field">
                                        <option>+91</option>
                                        <option>+1</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '16px 0 8px' }}>
                                    Site Address
                                </h3>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Address Line
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Flat/House No, Street, Landmark"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="input-field"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Note
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows="3"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>


                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Source <span style={{ color: 'var(--status-error)' }}>*</span>
                                </label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select Source</option>
                                    {opportunitySources.map(src => (
                                        <option key={src} value={src}>{src}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Estimated Value
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>₹</span>
                                    <input
                                        type="number"
                                        name="estimatedValue"
                                        value={formData.estimatedValue}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ paddingLeft: '30px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Bill To
                                </label>
                                <input
                                    type="text"
                                    name="billTo"
                                    value={formData.billTo}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Marketing Partner
                                </label>
                                <input
                                    type="text"
                                    name="marketingPartner"
                                    value={formData.marketingPartner}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Expected Closure Date
                                </label>
                                <input
                                    type="date"
                                    name="expectedClosure"
                                    value={formData.expectedClosure}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Supply Start Date
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
                                    Supply End Date
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
                    )}
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
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={step === 1 ? handleNext : handleSubmit}
                        className="btn-primary"
                    >
                        {step === 1 ? 'Next Step' : 'Create Opportunity'}
                    </button>
                </div>
            </div>
        </div>
    );
}
