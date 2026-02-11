'use client';
import { useState, useEffect } from 'react';
import { opportunities } from '../data/mockData';
import TopBar from '../components/TopBar';
import Table from '../components/Table';
import CreateOpportunityModal from '../components/CreateOpportunityModal';

export default function OpportunitiesPage() {
    // Initialize with mock data, will be updated by useEffect if localStorage exists
    const [opportunitiesData, setOpportunitiesData] = useState(opportunities);
    const [activeTab, setActiveTab] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('opportunities');
        if (saved) {
            try {
                setOpportunitiesData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse opportunities from local storage');
            }
        }
    }, []);

    // Save to LocalStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('opportunities', JSON.stringify(opportunitiesData));
    }, [opportunitiesData]);

    // Tabs Configuration
    const tabs = [
        { id: 'active', label: 'Active Opportunities' },
        { id: 'won', label: 'Won Opportunities' },
        { id: 'lost', label: 'Lost Opportunities' },
        { id: 'all', label: 'All Opportunities' }
    ];

    // Filter Logic
    const filteredData = opportunitiesData.filter(opp => {
        // Tab Filter
        if (activeTab === 'active' && opp.status !== 'active') return false;
        if (activeTab === 'won' && opp.status !== 'won') return false;
        if (activeTab === 'lost' && opp.status !== 'lost') return false;

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                opp.projectName.toLowerCase().includes(term) ||
                opp.contact.toLowerCase().includes(term) ||
                opp.account.toLowerCase().includes(term) ||
                opp.location.toLowerCase().includes(term)
            );
        }

        return true;
    });

    // Columns Configuration
    const columns = [
        {
            header: 'Project Name',
            accessor: 'projectName',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{row.projectName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.id}</div>
                </div>
            )
        },
        {
            header: 'Contact',
            accessor: 'contact',
            render: (row) => (
                <div>
                    <div style={{ color: 'var(--text-primary)' }}>{row.contact}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.contactNumber}</div>
                </div>
            )
        },
        { header: 'Location', accessor: 'location' },
        { header: 'Account', accessor: 'account' },
        { header: 'Managed By', accessor: 'managedBy' },
        {
            header: 'Value',
            accessor: 'estimatedValue',
            render: (row) => (
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    ₹{(typeof row.estimatedValue === 'number' ? row.estimatedValue / 100000 : 0).toFixed(2)} L
                </span>
            )
        },
        {
            header: 'Stage',
            accessor: 'stage',
            render: (row) => {
                let color = 'var(--status-info)';
                if (row.stage === 'Closed Won') color = 'var(--status-success)';
                if (row.stage === 'Closed Lost') color = 'var(--status-error)';
                if (row.stage === 'Negotiation') color = 'var(--status-warning)';

                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: `${color}22`,
                        color: color
                    }}>
                        {row.stage}
                    </span>
                );
            }
        }
    ];

    const handleRowClick = (row) => {
        alert(`Clicked on opportunity: ${row.projectName}`);
    };

    const handleCreate = (data) => {
        const newOpportunity = {
            id: `OPP-${Math.floor(Math.random() * 10000)}`, // Simple ID generation
            projectName: data.projectName,
            contact: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            contactNumber: data.phone || 'N/A',
            location: data.city || 'Unknown',
            account: data.projectName, // Defaulting account to project name if not distinct
            managedBy: 'Admin', // Default value since field was removed
            stage: 'Lead', // Default stage
            status: 'active', // Default status to appear in Active/All
            estimatedValue: Number(data.estimatedValue) || 0,
            ...data
        };

        setOpportunitiesData(prev => [newOpportunity, ...prev]);
        setIsModalOpen(false);
        // Alert removed for smoother experience
    };

    return (
        <>
            <TopBar title="Opportunities" subtitle="Manage your sales pipeline" />

            <div style={{ padding: '32px' }}>
                {/* Actions Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    {/* Tabs */}
                    <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                style={{ paddingBottom: '8px' }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 16px 10px 40px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    width: '240px'
                                }}
                            />
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--text-muted)"
                                strokeWidth="2"
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>

                        <button
                            className="btn-primary"
                            onClick={() => setIsModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Create Opportunity
                        </button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    onRowClick={handleRowClick}
                    actions={(row) => (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Show actions menu
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '4px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                    )}
                />

                {/* Modal */}
                {isModalOpen && (
                    <CreateOpportunityModal
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleCreate}
                    />
                )}
            </div>
        </>
    );
}
