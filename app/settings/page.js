'use client';

import { useState } from 'react';

const settingsSubSections = [
    {
        id: 'raw-material-pricing',
        name: 'Raw Material Pricing',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <text x="18" y="6.5" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" fontWeight="bold">$</text>
            </svg>
        ),
    },
    {
        id: 'glass-pricing',
        name: 'Glass Pricing',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
        ),
    },
    {
        id: 'price-calculation',
        name: 'Price & Calculation',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="12" y2="14" />
                <line x1="8" y1="18" x2="12" y2="18" />
                <line x1="14" y1="14" x2="16" y2="14" />
                <line x1="14" y1="18" x2="16" y2="18" />
            </svg>
        ),
    },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('raw-material-pricing');

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Settings Sidebar */}
            <div style={{
                width: '260px',
                flexShrink: 0,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
            }}>
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-primary)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings</h2>
                </div>

                <nav style={{ padding: '12px 12px', flex: 1 }}>
                    {settingsSubSections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: '12px 14px',
                                    marginBottom: '4px',
                                    borderRadius: '10px',
                                    border: isActive ? '1px solid rgba(56,189,248,0.12)' : '1px solid transparent',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(59,130,246,0.06) 100%)'
                                        : 'transparent',
                                    color: isActive ? '#38bdf8' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    fontWeight: isActive ? 600 : 500,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: isActive
                                        ? '0 0 20px rgba(56,189,248,0.08), inset 0 0 20px rgba(56,189,248,0.03)'
                                        : 'none',
                                }}
                                onMouseOver={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(30, 45, 71, 0.6)';
                                        e.currentTarget.style.color = '#e2e8f0';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }
                                }}
                            >
                                {isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px',
                                        height: '20px',
                                        background: 'linear-gradient(180deg, #38bdf8, #3b82f6)',
                                        borderRadius: '0 3px 3px 0',
                                        boxShadow: '0 0 8px rgba(56,189,248,0.5)',
                                    }} />
                                )}
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    filter: isActive ? 'drop-shadow(0 0 4px rgba(56,189,248,0.4))' : 'none',
                                }}>
                                    {section.icon}
                                </span>
                                <span>{section.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
                {activeSection === 'raw-material-pricing' && <RawMaterialPricingSection />}
                {activeSection === 'glass-pricing' && <GlassPricingSection />}
                {activeSection === 'price-calculation' && <PriceCalculationSection />}
            </div>
        </div>
    );
}

function StarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

const rawMaterialCards = [
    {
        id: 'profile',
        title: 'Profile',
        description: 'Create, update the price levels of Profile raw materials',
        active: false,
    },
    {
        id: 'reinforcement',
        title: 'Reinforcement',
        description: 'Create, update the price levels of Reinforcement raw materials',
        active: false,
    },
    {
        id: 'hardware',
        title: 'Hardware',
        description: 'Create, update the price levels of Hardware raw materials',
        active: false,
    },
    {
        id: 'price-list',
        title: 'Raw material price list',
        description: 'Import raw material prices via excel',
        active: true,
    },
];

function RawMaterialPricingSection() {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [starredCards, setStarredCards] = useState({});

    const toggleStar = (e, cardId) => {
        e.stopPropagation();
        setStarredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.3px',
            }}>
                Raw material pricing
            </h1>
            <p style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                marginBottom: '28px',
                lineHeight: '1.5',
            }}>
                Create price lists against the raw materials and the overall price structure to be used in a quote.
            </p>

            {/* Card Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '16px',
            }}>
                {rawMaterialCards.map((card) => {
                    const isHovered = hoveredCard === card.id;
                    const isStarred = starredCards[card.id];

                    return (
                        <div
                            key={card.id}
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                position: 'relative',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: card.active
                                    ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(59,130,246,0.08) 100%)'
                                    : isHovered
                                        ? 'linear-gradient(135deg, rgba(30, 45, 71, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'var(--gradient-card)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.25)'
                                    : isHovered
                                        ? '1px solid var(--border-secondary)'
                                        : '1px solid var(--border-primary)',
                                boxShadow: card.active
                                    ? '0 0 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.06)'
                                    : isHovered
                                        ? '0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(56,189,248,0.05)'
                                        : '0 2px 8px rgba(0,0,0,0.2)',
                                transform: isHovered && !card.active ? 'translateY(-2px)' : 'none',
                            }}
                        >
                            {/* Star / Bookmark icon (top-right) */}
                            <button
                                onClick={(e) => toggleStar(e, card.id)}
                                title={isStarred ? 'Remove from favourites' : 'Add to favourites'}
                                style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    color: isStarred ? '#f59e0b' : 'var(--text-muted)',
                                    opacity: isHovered || isStarred ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#f59e0b';
                                    e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = isStarred ? '#f59e0b' : 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill={isStarred ? '#f59e0b' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>

                            {/* Card Icon */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: card.active
                                    ? 'rgba(56,189,248,0.15)'
                                    : 'rgba(30,45,71,0.8)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.2)'
                                    : '1px solid var(--border-metallic)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '14px',
                                color: card.active ? '#38bdf8' : 'var(--text-metallic)',
                            }}>
                                {card.id === 'profile' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="18" rx="1" />
                                        <rect x="14" y="3" width="7" height="10" rx="1" />
                                    </svg>
                                )}
                                {card.id === 'reinforcement' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <rect x="7" y="7" width="10" height="10" rx="1" />
                                    </svg>
                                )}
                                {card.id === 'hardware' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                )}
                                {card.id === 'price-list' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="12" y1="18" x2="12" y2="12" />
                                        <line x1="9" y1="15" x2="15" y2="15" />
                                    </svg>
                                )}
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: card.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                marginBottom: '6px',
                                letterSpacing: '-0.1px',
                            }}>
                                {card.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                fontSize: '13px',
                                color: card.active ? 'rgba(56,189,248,0.7)' : 'var(--text-muted)',
                                lineHeight: '1.5',
                                margin: 0,
                            }}>
                                {card.description}
                            </p>

                            {/* Active glow line at bottom */}
                            {card.active && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '20%',
                                    right: '20%',
                                    height: '2px',
                                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                                    borderRadius: '2px',
                                    opacity: 0.6,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const glassPricingCards = [
    {
        id: 'glass',
        title: 'Glass',
        description: 'Create, update the price levels of Glass raw materials',
        active: false,
    },
    {
        id: 'glass-price-list',
        title: 'Glass price list',
        description: 'Import glass prices via excel',
        active: false,
    },
];

function GlassPricingSection() {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [starredCards, setStarredCards] = useState({});

    const toggleStar = (e, cardId) => {
        e.stopPropagation();
        setStarredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.3px',
            }}>
                Glass pricing
            </h1>
            <p style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                marginBottom: '28px',
                lineHeight: '1.5',
            }}>
                Manage glass and glass pricing.
            </p>

            {/* Card Grid - two cards side by side */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '16px',
            }}>
                {glassPricingCards.map((card) => {
                    const isHovered = hoveredCard === card.id;
                    const isStarred = starredCards[card.id];

                    return (
                        <div
                            key={card.id}
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                position: 'relative',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: card.active
                                    ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(59,130,246,0.08) 100%)'
                                    : isHovered
                                        ? 'linear-gradient(135deg, rgba(30, 45, 71, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'var(--gradient-card)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.25)'
                                    : isHovered
                                        ? '1px solid var(--border-secondary)'
                                        : '1px solid var(--border-primary)',
                                boxShadow: card.active
                                    ? '0 0 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.06)'
                                    : isHovered
                                        ? '0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(56,189,248,0.05)'
                                        : '0 2px 8px rgba(0,0,0,0.2)',
                                transform: isHovered && !card.active ? 'translateY(-2px)' : 'none',
                            }}
                        >
                            {/* Star / Bookmark icon (top-right) */}
                            <button
                                onClick={(e) => toggleStar(e, card.id)}
                                title={isStarred ? 'Remove from favourites' : 'Add to favourites'}
                                style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    color: isStarred ? '#f59e0b' : 'var(--text-muted)',
                                    opacity: isHovered || isStarred ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#f59e0b';
                                    e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = isStarred ? '#f59e0b' : 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill={isStarred ? '#f59e0b' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>

                            {/* Card Icon */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: card.active
                                    ? 'rgba(56,189,248,0.15)'
                                    : 'rgba(30,45,71,0.8)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.2)'
                                    : '1px solid var(--border-metallic)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '14px',
                                color: card.active ? '#38bdf8' : 'var(--text-metallic)',
                            }}>
                                {card.id === 'glass' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="9" y1="3" x2="9" y2="21" />
                                    </svg>
                                )}
                                {card.id === 'glass-price-list' && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="12" y1="18" x2="12" y2="12" />
                                        <line x1="9" y1="15" x2="15" y2="15" />
                                    </svg>
                                )}
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: card.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                marginBottom: '6px',
                                letterSpacing: '-0.1px',
                            }}>
                                {card.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                fontSize: '13px',
                                color: card.active ? 'rgba(56,189,248,0.7)' : 'var(--text-muted)',
                                lineHeight: '1.5',
                                margin: 0,
                            }}>
                                {card.description}
                            </p>

                            {/* Active glow line at bottom */}
                            {card.active && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '20%',
                                    right: '20%',
                                    height: '2px',
                                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                                    borderRadius: '2px',
                                    opacity: 0.6,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const priceCalculationCards = [
    {
        id: 'pricing-formula',
        title: 'Pricing Formula',
        description: 'Define and manage the formula used to calculate the final price of a product',
        active: true,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
        ),
    },
    {
        id: 'wastage-scrap',
        title: 'Wastage & Scrap',
        description: 'Set wastage and scrap percentages applied during material cost calculation',
        active: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
        ),
    },
    {
        id: 'labour-cost',
        title: 'Labour Cost',
        description: 'Configure labour rates and cost factors applied per unit or per hour',
        active: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        id: 'overhead-margin',
        title: 'Overhead & Margin',
        description: 'Set overhead percentages and profit margin applied to the final quote price',
        active: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
    {
        id: 'discount-rules',
        title: 'Discount Rules',
        description: 'Create and manage discount rules applied to quotes and price lists',
        active: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
        ),
    },
    {
        id: 'price-list-export',
        title: 'Price List Export',
        description: 'Export calculated price lists and formula outputs to Excel or PDF',
        active: false,
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
    },
];

function PriceCalculationSection() {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [starredCards, setStarredCards] = useState({});

    const toggleStar = (e, cardId) => {
        e.stopPropagation();
        setStarredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                letterSpacing: '-0.3px',
            }}>
                Price & Calculation
            </h1>
            <p style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                marginBottom: '28px',
                lineHeight: '1.5',
            }}>
                Configure pricing formulas, wastage percentages, labour costs, and overall calculation structure used in a quote.
            </p>

            {/* Card Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '16px',
            }}>
                {priceCalculationCards.map((card) => {
                    const isHovered = hoveredCard === card.id;
                    const isStarred = starredCards[card.id];

                    return (
                        <div
                            key={card.id}
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                position: 'relative',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: card.active
                                    ? 'linear-gradient(135deg, rgba(56,189,248,0.12) 0%, rgba(59,130,246,0.08) 100%)'
                                    : isHovered
                                        ? 'linear-gradient(135deg, rgba(30, 45, 71, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                                        : 'var(--gradient-card)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.25)'
                                    : isHovered
                                        ? '1px solid var(--border-secondary)'
                                        : '1px solid var(--border-primary)',
                                boxShadow: card.active
                                    ? '0 0 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.06)'
                                    : isHovered
                                        ? '0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(56,189,248,0.05)'
                                        : '0 2px 8px rgba(0,0,0,0.2)',
                                transform: isHovered && !card.active ? 'translateY(-2px)' : 'none',
                            }}
                        >
                            {/* Star icon (top-right) */}
                            <button
                                onClick={(e) => toggleStar(e, card.id)}
                                title={isStarred ? 'Remove from favourites' : 'Add to favourites'}
                                style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    color: isStarred ? '#f59e0b' : 'var(--text-muted)',
                                    opacity: isHovered || isStarred ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#f59e0b';
                                    e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = isStarred ? '#f59e0b' : 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill={isStarred ? '#f59e0b' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>

                            {/* Card Icon */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: card.active
                                    ? 'rgba(56,189,248,0.15)'
                                    : 'rgba(30,45,71,0.8)',
                                border: card.active
                                    ? '1px solid rgba(56,189,248,0.2)'
                                    : '1px solid var(--border-metallic)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '14px',
                                color: card.active ? '#38bdf8' : 'var(--text-metallic)',
                            }}>
                                {card.icon}
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: card.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                marginBottom: '6px',
                                letterSpacing: '-0.1px',
                            }}>
                                {card.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                fontSize: '13px',
                                color: card.active ? 'rgba(56,189,248,0.7)' : 'var(--text-muted)',
                                lineHeight: '1.5',
                                margin: 0,
                            }}>
                                {card.description}
                            </p>

                            {/* Active glow line at bottom */}
                            {card.active && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '20%',
                                    right: '20%',
                                    height: '2px',
                                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                                    borderRadius: '2px',
                                    opacity: 0.6,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
