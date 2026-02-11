'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { quotes, quoteDesigns, catalogItems } from '../../data/mockData';

// --- Components ---

function DesignCard({ design, onEdit, onViewDetails }) {
    return (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header with checkboxes and actions */}
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                </div>
            </div>

            {/* Image Area */}
            <div style={{
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                margin: '0 16px',
                borderRadius: '8px',
                position: 'relative'
            }}>
                {/* Placeholder for the window design image */}
                <div style={{ textAlign: 'center' }}>
                    <img src={design.image} alt={design.name} style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
            </div>

            {/* Footer Info */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{design.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty. : {design.qty}</span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Location :</span> {design.location}</div>
                    <div>{design.series}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Glass : {design.glass}</span>
                        <span style={{
                            padding: '2px 6px',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            fontSize: '10px'
                        }}>{design.color}</span>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Price: ₹{design.price.toLocaleString()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px' }} onClick={() => onViewDetails && onViewDetails(design)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            View details
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px' }} onClick={onEdit}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit Design
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CatalogCard({ item }) {
    return (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Drawing Area */}
            <div style={{
                height: '220px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative'
            }}>
                <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
                {/* Mock dimensions */}
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#64748b' }}>
                    {item.dims.split('x')[1]}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#64748b' }}>
                    {item.dims.split('x')[0]}
                </div>
                <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '80%', opacity: 0.8 }} />
            </div>

            {/* Info Area */}
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {item.name}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '32px' }}>
                    {item.series}
                </p>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}>
                    Select design
                </button>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: '#9ca3af' }}>{label}:</div>
            <div style={{ color: 'white', fontWeight: '500' }}>{value}</div>
        </div>
    );
}

function DetailsDrawer({ design, onClose }) {
    if (!design) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }}
            />
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '400px',
                background: '#1f2937',
                boxShadow: '-4px 0 16px rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                color: 'white',
                borderLeft: '1px solid #374151',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '24px', background: '#374151', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px', zIndex: 10 }}>
                        ✕
                    </button>
                    <div style={{ background: 'white', borderRadius: '4px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                        <img src={design.image} alt={design.name} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                    </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <DetailRow label="Design Name" value={design.name} />
                    <DetailRow label="Qty" value={design.qty} />
                    <DetailRow label="Location" value={design.location} />
                    <DetailRow label="Floor" value={design.floor || '--'} />
                    <DetailRow label="System" value={design.series} />
                    <DetailRow label="Glass" value={design.glass} />
                    <DetailRow label="Color" value={<span style={{ padding: '2px 8px', background: '#374151', borderRadius: '4px', border: '1px solid #4b5563', fontSize: '11px', textTransform: 'uppercase' }}>{design.color}</span>} />
                    <DetailRow label="Price" value={`₹${design.price.toLocaleString()}`} />
                    <DetailRow label="Size" value={design.size || '--'} />
                    <DetailRow label="Area" value={design.area || '--'} />
                    <DetailRow label="Rate/Sqmt" value={design.rate || '--'} />
                    <DetailRow label="Total Weight" value={design.weight || '--'} />
                    <DetailRow label="Hardware" value={design.hardware || '--'} />
                    <DetailRow label="Material Type" value={design.materialType || '--'} />
                </div>
            </div>
        </>
    );
}

export default function QuoteDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState('project'); // 'project' or 'catalog'
    const [selectedDesign, setSelectedDesign] = useState(null);

    // Find quote data
    const quoteKey = id.toLowerCase();
    const quote = quotes.find(q => q.projectName.toLowerCase() === quoteKey) || quotes[0]; // fallback
    const designs = quoteDesigns[quoteKey] || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Top Header - Contextual */}
            <div style={{
                height: '64px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back
                    </button>

                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.2' }}>{quote.projectName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{quote.id}</div>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border-primary)', margin: '0 12px' }}></div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Documents</button>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--accent-primary)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', fontWeight: '500' }}>Design</button>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Pricing</button>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Report</button>
                    </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{quote.value.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty : {quote.quantity} <span style={{ marginLeft: '4px', cursor: 'pointer' }}>ℹ️</span></div>
                    </div>

                    <button className="btn-primary" style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}>
                        Quick quote
                    </button>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>❓</button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>🔔</button>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>N</div>
                    </div>
                </div>
            </div>

            {/* Sub Header & Filters */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setActiveTab('project')}
                            style={{
                                padding: '8px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: activeTab === 'project' ? '#fff' : 'var(--text-muted)',
                                background: activeTab === 'project' ? '#1e293b' : 'transparent',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                            Project
                        </button>
                        <button
                            onClick={() => setActiveTab('catalog')}
                            style={{
                                padding: '8px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: activeTab === 'catalog' ? '#fff' : 'var(--text-muted)',
                                background: activeTab === 'catalog' ? '#1e293b' : 'transparent',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                            Catalog
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => router.push(`/quotes/${id}/design`)}>
                        Create design <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search"
                                style={{
                                    padding: '8px 12px 8px 36px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '13px',
                                    width: '240px'
                                }}
                            />
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        <button className="btn-secondary">↻ Refresh designs</button>
                        <button className="btn-secondary" style={{ border: 'none' }}>Design orders</button>
                        <button className="btn-secondary" style={{ border: 'none' }}>Filter</button>
                        <button className="btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-primary)' }}>
                {activeTab === 'project' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {designs.map(design => (
                            <DesignCard key={design.id} design={design} onEdit={() => router.push(`/quotes/${id}/design`)} onViewDetails={setSelectedDesign} />
                        ))}
                        {designs.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                No designs added yet. START by creating a design or selecting from catalog.
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                        {catalogItems.map(item => (
                            <CatalogCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Details */}
            <div style={{
                padding: '12px 24px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)'
            }}>
                <div>Total records {activeTab === 'project' ? designs.length : catalogItems.length}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>25 records per page ▾</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled style={{ opacity: 0.5 }}>‹</button>
                        <button className="btn-primary" style={{ padding: '2px 8px', height: 'auto' }}>1</button>
                        <button disabled style={{ opacity: 0.5 }}>›</button>
                    </div>
                </div>
            </div>

            {selectedDesign && (
                <DetailsDrawer design={selectedDesign} onClose={() => setSelectedDesign(null)} />
            )}
        </div>
    );
}
