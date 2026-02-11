'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { quotes } from '../data/mockData';
import TopBar from '../components/TopBar';
import Table from '../components/Table';
import CreateQuoteModal from '../components/CreateQuoteModal';

export default function QuotesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Tabs Configuration
    const tabs = [
        { id: 'active', label: 'Active Quotes' },
        { id: 'won', label: 'Won Quotes' },
        { id: 'lost', label: 'Lost Quotes' },
        { id: 'all', label: 'All Quotes' }
    ];

    // Filter Logic
    const filteredData = quotes.filter(quote => {
        // Tab Filter
        if (activeTab === 'active' && quote.status !== 'active') return false;
        if (activeTab === 'won' && quote.status !== 'won') return false;
        if (activeTab === 'lost' && quote.status !== 'lost') return false;

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                quote.projectName.toLowerCase().includes(term) ||
                quote.id.toLowerCase().includes(term) ||
                quote.contact.toLowerCase().includes(term) ||
                quote.revisionTitle.toLowerCase().includes(term)
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
            header: 'Revision',
            accessor: 'revisionTitle',
            render: (row) => (
                <div>
                    <div style={{ color: 'var(--text-primary)' }}>{row.revisionTitle}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rev: {row.revisionNo}</div>
                </div>
            )
        },
        { header: 'Contact', accessor: 'contact' },
        {
            header: 'Area',
            accessor: 'area',
            render: (row) => (
                <span style={{ color: 'var(--text-primary)' }}>
                    {row.area.toFixed(2)} Sqmt
                </span>
            )
        },
        {
            header: 'Value',
            accessor: 'value',
            render: (row) => (
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    ₹{(row.value / 100000).toFixed(2)} L
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                let color = '#3b82f6';
                if (row.status === 'won') color = '#10b981';
                if (row.status === 'lost') color = '#ef4444';

                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: `${color}22`,
                        color: color,
                        textTransform: 'capitalize'
                    }}>
                        {row.status}
                    </span>
                );
            }
        }
    ];

    const handleCreate = (data) => {
        console.log('Creating quote for opportunity:', data);
        setIsModalOpen(false);
        alert('Quote created successfully!');
    };

    return (
        <>
            <TopBar title="Quotes" subtitle="Manage project proposals" />

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
                                placeholder="Search quotes..."
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
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            Create Quote
                        </button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    onRowClick={(row) => router.push(`/quotes/${row.projectName.toLowerCase()}`)}
                    actions={(row) => (
                        <div style={{ position: 'relative' }}>
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
                        </div>
                    )}
                />

                {/* Modal */}
                {isModalOpen && (
                    <CreateQuoteModal
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleCreate}
                    />
                )}
            </div>
        </>
    );
}
