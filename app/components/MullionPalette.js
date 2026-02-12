'use client';
import { useState, useEffect } from 'react';

// Complete Mullion/Divider pattern definitions matching EVAERP
const mullionPatterns = [
    // Row 1: Basic Joints
    {
        id: 'i-joint',
        name: 'I Joint',
        type: 'vertical',
        divisions: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="24" y1="8" x2="24" y2="40" />
            </svg>
        )
    },
    {
        id: 'h-joint',
        name: 'H Joint',
        type: 'horizontal',
        divisions: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="24" x2="40" y2="24" />
            </svg>
        )
    },
    {
        id: 'multiple-i-joint',
        name: 'Multiple I Joint',
        type: 'vertical-multiple',
        requiresConfig: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="16" y1="8" x2="16" y2="40" />
                <line x1="24" y1="8" x2="24" y2="40" />
                <line x1="32" y1="8" x2="32" y2="40" />
            </svg>
        )
    },
    {
        id: 'multiple-h-joint',
        name: 'Multiple H Joint',
        type: 'horizontal-multiple',
        requiresConfig: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="16" x2="40" y2="16" />
                <line x1="8" y1="24" x2="40" y2="24" />
                <line x1="8" y1="32" x2="40" y2="32" />
            </svg>
        )
    },
    // Row 2: Coupling and Corner
    {
        id: 'coupling',
        name: 'Coupling Mullion',
        type: 'coupling',
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="14" height="32" rx="1" />
                <rect x="26" y="8" width="14" height="32" rx="1" />
                <line x1="22" y1="14" x2="26" y2="14" />
                <line x1="22" y1="24" x2="26" y2="24" />
                <line x1="22" y1="34" x2="26" y2="34" />
            </svg>
        )
    },
    {
        id: 'corner-90',
        name: 'Corner 90°',
        type: 'corner',
        angle: 90,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <path d="M8 8 L8 40 L24 40 L24 24 L40 24 L40 8 Z" fill="none" />
                <line x1="24" y1="8" x2="24" y2="24" />
                <line x1="8" y1="24" x2="24" y2="24" />
            </svg>
        )
    },
    {
        id: 'bay-135',
        name: 'Bay 135°',
        type: 'bay',
        angle: 135,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <path d="M8 12 L16 8 L32 8 L40 12 L40 40 L8 40 Z" fill="none" />
                <line x1="16" y1="8" x2="16" y2="40" />
                <line x1="32" y1="8" x2="32" y2="40" />
            </svg>
        )
    },
    {
        id: 'grid-georgian',
        name: 'Grid / Georgian',
        type: 'grid',
        rows: 2,
        cols: 2,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="24" y1="8" x2="24" y2="40" />
                <line x1="8" y1="24" x2="40" y2="24" />
                <line x1="8" y1="16" x2="40" y2="16" strokeDasharray="2 2" />
                <line x1="8" y1="32" x2="40" y2="32" strokeDasharray="2 2" />
                <line x1="16" y1="8" x2="16" y2="40" strokeDasharray="2 2" />
                <line x1="32" y1="8" x2="32" y2="40" strokeDasharray="2 2" />
            </svg>
        )
    },
    {
        id: 'triple-i-joint',
        name: 'Triple I Joint',
        type: 'vertical',
        divisions: 4,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="14" y1="8" x2="14" y2="40" />
                <line x1="22" y1="8" x2="22" y2="40" />
                <line x1="30" y1="8" x2="30" y2="40" />
                <line x1="38" y1="8" x2="38" y2="40" />
            </svg>
        )
    },
    {
        id: 'custom-mullion',
        name: 'Custom Mullion',
        type: 'custom-mullion',
        isClickOnly: true,
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#475569" strokeWidth="1.5">
                <rect x="8" y="8" width="32" height="32" rx="1" />
                <line x1="8" y1="40" x2="40" y2="8" strokeWidth="2" />
                <circle cx="8" cy="40" r="2" fill="#475569" />
                <circle cx="40" cy="8" r="2" fill="#475569" />
            </svg>
        )
    },

];

// Sliding design patterns for the Panel section
// Helper to build a sliding icon SVG
const SlidingIcon = ({ panels }) => {
    const w = 64, h = 48, pad = 2, inner = 2;
    const totalW = w - pad * 2;
    const panelW = totalW / panels.length;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="#475569" strokeWidth="1">
            <rect x={pad} y="4" width={totalW} height="40" rx="1" />
            {panels.map((p, i) => {
                const px = pad + inner + i * panelW;
                const pw = panelW - inner * 2 + (i === 0 ? inner : 0) + (i === panels.length - 1 ? inner : 0);
                const ox = i === 0 ? pad + inner : px;
                const cx = ox + pw / 2;
                return (
                    <g key={i}>
                        <rect x={ox} y={4 + inner} width={pw} height={40 - inner * 2} rx="0.5" />
                        {p === 'right' && (<>
                            <line x1={cx - 7} y1="24" x2={cx + 5} y2="24" strokeWidth="1.5" />
                            <polyline points={`${cx + 2},21 ${cx + 6},24 ${cx + 2},27`} strokeWidth="1.5" fill="none" />
                        </>)}
                        {p === 'left' && (<>
                            <line x1={cx - 5} y1="24" x2={cx + 7} y2="24" strokeWidth="1.5" />
                            <polyline points={`${cx - 2},21 ${cx - 6},24 ${cx - 2},27`} strokeWidth="1.5" fill="none" />
                        </>)}
                        {p === 'fixed' && (<>
                            <line x1={cx} y1="20" x2={cx} y2="28" strokeWidth="1.5" />
                            <line x1={cx - 4} y1="24" x2={cx + 4} y2="24" strokeWidth="1.5" />
                        </>)}
                        {p === 'both' && (<>
                            <line x1={cx - 7} y1="24" x2={cx + 7} y2="24" strokeWidth="1.5" />
                            <polyline points={`${cx - 4},21 ${cx - 8},24 ${cx - 4},27`} strokeWidth="1.5" fill="none" />
                            <polyline points={`${cx + 4},21 ${cx + 8},24 ${cx + 4},27`} strokeWidth="1.5" fill="none" />
                        </>)}
                    </g>
                );
            })}
            {/* Handle indicators between panels */}
            {panels.length >= 2 && panels.slice(0, -1).map((_, i) => {
                const jx = pad + (i + 1) * panelW;
                return (
                    <g key={`h${i}`}>
                        <rect x={jx - 1.5} y="20" width="1.2" height="8" fill="#475569" stroke="none" rx="0.5" />
                        <rect x={jx + 0.3} y="20" width="1.2" height="8" fill="#475569" stroke="none" rx="0.5" />
                    </g>
                );
            })}
        </svg>
    );
};

// Helper: equal ratios for n panels that sum to 1.0
const eqRatios = (n) => {
    const base = Math.round(1000 / n) / 1000;
    const arr = Array(n).fill(base);
    arr[n - 1] = +(1 - base * (n - 1)).toFixed(4);
    return arr;
};

// Helper: build panels array from direction string codes
const mkPanels = (dirs) => dirs.map((d, i) => ({ sashId: `S${i + 1}`, direction: d }));

const slidingCategories = [
    { id: '2t-xxp', label: '2 Track X-X-X Panel' },
    { id: '3t-3p', label: '3 Track 3 Panel' },
    { id: '2t-4p-meeting', label: '2 Track 4 Panel Meeting' },
    { id: '4t-8p-meeting', label: '4 Track 8 Panel Meeting' },
    { id: '5t-5p', label: '5 Track 5 Panel' },
    { id: '5t-10p-meeting', label: '5 Track 10 Panel Meeting' },
    { id: '6t-6p', label: '6 Track 6 Panel' },
    { id: '6t-12p-meeting', label: '6 Track 12 Panel Meeting' },
    { id: '7t-7p', label: '7 Track 7 Panel' },
    { id: '8t-8p', label: '8 Track 8 Panel' },
];

const slidingPatterns = [
    // ===== 2 Track X-X-X Panel =====
    { id: 'sliding-2t-2p-rl', name: '2P \u2192\u2190', category: '2t-xxp', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['right','left']), ratios: eqRatios(2), icon: <SlidingIcon panels={['right','left']} /> },
    { id: 'sliding-2t-3p-rfl', name: '3P \u2192+\u2190', category: '2t-xxp', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['right','fixed','left']), ratios: eqRatios(3), icon: <SlidingIcon panels={['right','fixed','left']} /> },
    { id: 'sliding-2t-3p-rbl', name: '3P \u2192\u2194\u2190', category: '2t-xxp', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['right','both','left']), ratios: eqRatios(3), icon: <SlidingIcon panels={['right','both','left']} /> },
    { id: 'sliding-2t-4p-brlb', name: '4P \u2194\u2192\u2190\u2194', category: '2t-xxp', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['both','right','left','both']), ratios: eqRatios(4), icon: <SlidingIcon panels={['both','right','left','both']} /> },

    // ===== 3 Track 3 Panel =====
    { id: 'sliding-3t-3p-rbl', name: '3P \u2192\u2194\u2190', category: '3t-3p', type: 'sliding', requiresConfig: true, tracks: 3,
        panels: mkPanels(['right','both','left']), ratios: [0.35,0.30,0.35], icon: <SlidingIcon panels={['right','both','left']} /> },
    { id: 'sliding-3t-3p-rfl', name: '3P \u2192+\u2190', category: '3t-3p', type: 'sliding', requiresConfig: true, tracks: 3,
        panels: mkPanels(['right','fixed','left']), ratios: [0.35,0.30,0.35], icon: <SlidingIcon panels={['right','fixed','left']} /> },
    { id: 'sliding-3t-3p-rrr', name: '3P \u2192\u2192\u2192', category: '3t-3p', type: 'sliding', requiresConfig: true, tracks: 3,
        panels: mkPanels(['right','right','right']), ratios: eqRatios(3), icon: <SlidingIcon panels={['right','right','right']} /> },
    { id: 'sliding-3t-3p-lll', name: '3P \u2190\u2190\u2190', category: '3t-3p', type: 'sliding', requiresConfig: true, tracks: 3,
        panels: mkPanels(['left','left','left']), ratios: eqRatios(3), icon: <SlidingIcon panels={['left','left','left']} /> },

    // ===== 2 Track 4 Panel Meeting =====
    { id: 'sliding-2t-4p-meet-rlrl', name: '4P \u2192\u2190\u2192\u2190', category: '2t-4p-meeting', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['right','left','right','left']), ratios: eqRatios(4), icon: <SlidingIcon panels={['right','left','right','left']} /> },
    { id: 'sliding-2t-4p-meet-rbbl', name: '4P \u2192\u2194\u2194\u2190', category: '2t-4p-meeting', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['right','both','both','left']), ratios: eqRatios(4), icon: <SlidingIcon panels={['right','both','both','left']} /> },
    { id: 'sliding-2t-4p-meet-blrb', name: '4P \u2194\u2190\u2192\u2194', category: '2t-4p-meeting', type: 'sliding', requiresConfig: true, tracks: 2,
        panels: mkPanels(['both','left','right','both']), ratios: eqRatios(4), icon: <SlidingIcon panels={['both','left','right','both']} /> },

    // ===== 4 Track 8 Panel Meeting =====
    { id: 'sliding-4t-8p-meet-a', name: '8P \u2192\u2190\u2192\u2190\u2192\u2190\u2192\u2190', category: '4t-8p-meeting', type: 'sliding', requiresConfig: true, tracks: 4,
        panels: mkPanels(['right','left','right','left','right','left','right','left']), ratios: eqRatios(8), icon: <SlidingIcon panels={['right','left','right','left','right','left','right','left']} /> },
    { id: 'sliding-4t-8p-meet-b', name: '8P \u2192\u2194\u2190\u2192\u2194\u2190\u2192\u2190', category: '4t-8p-meeting', type: 'sliding', requiresConfig: true, tracks: 4,
        panels: mkPanels(['right','both','left','right','both','left','right','left']), ratios: eqRatios(8), icon: <SlidingIcon panels={['right','both','left','right','both','left','right','left']} /> },

    // ===== 5 Track 5 Panel =====
    { id: 'sliding-5t-5p-a', name: '5P \u2192\u2192+\u2190\u2190', category: '5t-5p', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['right','right','fixed','left','left']), ratios: eqRatios(5), icon: <SlidingIcon panels={['right','right','fixed','left','left']} /> },
    { id: 'sliding-5t-5p-b', name: '5P \u2192\u2194\u2194\u2194\u2190', category: '5t-5p', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['right','both','both','both','left']), ratios: eqRatios(5), icon: <SlidingIcon panels={['right','both','both','both','left']} /> },
    { id: 'sliding-5t-5p-c', name: '5P \u2192\u2192\u2192\u2192\u2192', category: '5t-5p', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['right','right','right','right','right']), ratios: eqRatios(5), icon: <SlidingIcon panels={['right','right','right','right','right']} /> },
    { id: 'sliding-5t-5p-d', name: '5P \u2190\u2190\u2190\u2190\u2190', category: '5t-5p', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['left','left','left','left','left']), ratios: eqRatios(5), icon: <SlidingIcon panels={['left','left','left','left','left']} /> },

    // ===== 5 Track 10 Panel Meeting =====
    { id: 'sliding-5t-10p-meet-a', name: '10P \u2192\u2190 \u00d75', category: '5t-10p-meeting', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['right','left','right','left','right','left','right','left','right','left']), ratios: eqRatios(10), icon: <SlidingIcon panels={['right','left','right','left','right','left','right','left','right','left']} /> },
    { id: 'sliding-5t-10p-meet-b', name: '10P \u2194\u2192\u2190 mix', category: '5t-10p-meeting', type: 'sliding', requiresConfig: true, tracks: 5,
        panels: mkPanels(['right','both','left','right','both','left','right','both','left','left']), ratios: eqRatios(10), icon: <SlidingIcon panels={['right','both','left','right','both','left','right','both','left','left']} /> },

    // ===== 6 Track 6 Panel =====
    { id: 'sliding-6t-6p-a', name: '6P \u2192\u2192\u2192\u2190\u2190\u2190', category: '6t-6p', type: 'sliding', requiresConfig: true, tracks: 6,
        panels: mkPanels(['right','right','right','left','left','left']), ratios: eqRatios(6), icon: <SlidingIcon panels={['right','right','right','left','left','left']} /> },
    { id: 'sliding-6t-6p-b', name: '6P \u2192\u2194\u2194\u2194\u2194\u2190', category: '6t-6p', type: 'sliding', requiresConfig: true, tracks: 6,
        panels: mkPanels(['right','both','both','both','both','left']), ratios: eqRatios(6), icon: <SlidingIcon panels={['right','both','both','both','both','left']} /> },
    { id: 'sliding-6t-6p-c', name: '6P \u2192\u2192+\u2190\u2190+', category: '6t-6p', type: 'sliding', requiresConfig: true, tracks: 6,
        panels: mkPanels(['right','right','fixed','left','left','fixed']), ratios: eqRatios(6), icon: <SlidingIcon panels={['right','right','fixed','left','left','fixed']} /> },

    // ===== 6 Track 12 Panel Meeting =====
    { id: 'sliding-6t-12p-meet-a', name: '12P \u2192\u2190 \u00d76', category: '6t-12p-meeting', type: 'sliding', requiresConfig: true, tracks: 6,
        panels: mkPanels(['right','left','right','left','right','left','right','left','right','left','right','left']), ratios: eqRatios(12), icon: <SlidingIcon panels={['right','left','right','left','right','left','right','left','right','left','right','left']} /> },
    { id: 'sliding-6t-12p-meet-b', name: '12P \u2194\u2192\u2190 mix', category: '6t-12p-meeting', type: 'sliding', requiresConfig: true, tracks: 6,
        panels: mkPanels(['right','both','left','right','both','left','right','both','left','right','both','left']), ratios: eqRatios(12), icon: <SlidingIcon panels={['right','both','left','right','both','left','right','both','left','right','both','left']} /> },

    // ===== 7 Track 7 Panel =====
    { id: 'sliding-7t-7p-a', name: '7P \u2192\u2192\u2192+\u2190\u2190\u2190', category: '7t-7p', type: 'sliding', requiresConfig: true, tracks: 7,
        panels: mkPanels(['right','right','right','fixed','left','left','left']), ratios: eqRatios(7), icon: <SlidingIcon panels={['right','right','right','fixed','left','left','left']} /> },
    { id: 'sliding-7t-7p-b', name: '7P \u2192\u2194\u2194\u2194\u2194\u2194\u2190', category: '7t-7p', type: 'sliding', requiresConfig: true, tracks: 7,
        panels: mkPanels(['right','both','both','both','both','both','left']), ratios: eqRatios(7), icon: <SlidingIcon panels={['right','both','both','both','both','both','left']} /> },
    { id: 'sliding-7t-7p-c', name: '7P \u2192\u2192\u2192\u2192\u2192\u2192\u2192', category: '7t-7p', type: 'sliding', requiresConfig: true, tracks: 7,
        panels: mkPanels(['right','right','right','right','right','right','right']), ratios: eqRatios(7), icon: <SlidingIcon panels={['right','right','right','right','right','right','right']} /> },

    // ===== 8 Track 8 Panel =====
    { id: 'sliding-8t-8p-a', name: '8P \u2192\u2192\u2192\u2192\u2190\u2190\u2190\u2190', category: '8t-8p', type: 'sliding', requiresConfig: true, tracks: 8,
        panels: mkPanels(['right','right','right','right','left','left','left','left']), ratios: eqRatios(8), icon: <SlidingIcon panels={['right','right','right','right','left','left','left','left']} /> },
    { id: 'sliding-8t-8p-b', name: '8P \u2192\u2194\u2194\u2194\u2194\u2194\u2194\u2190', category: '8t-8p', type: 'sliding', requiresConfig: true, tracks: 8,
        panels: mkPanels(['right','both','both','both','both','both','both','left']), ratios: eqRatios(8), icon: <SlidingIcon panels={['right','both','both','both','both','both','both','left']} /> },
    { id: 'sliding-8t-8p-c', name: '8P \u2192\u2192\u2192+\u2190\u2190\u2190+', category: '8t-8p', type: 'sliding', requiresConfig: true, tracks: 8,
        panels: mkPanels(['right','right','right','fixed','left','left','left','fixed']), ratios: eqRatios(8), icon: <SlidingIcon panels={['right','right','right','fixed','left','left','left','fixed']} /> },
];

// Sidebar menu items
const sidebarItems = [
    { id: 'divider', name: 'Divider', icon: '║', isActive: true },
    { id: 'panel', name: 'Panel', icon: '▱', isActive: false },
    { id: 'frame', name: 'Frame', icon: '⌐', isActive: false },
    { id: 'glass', name: 'Glass', icon: '◇', isActive: false },
    { id: 'colors', name: 'Colors', icon: '◐', isActive: false },
    { id: 'image', name: 'Image', icon: '🖼', isActive: false },
];

export default function MullionPalette({ onPatternDragStart, onPatternDragEnd, isVisible = true, onCustomMullionToggle, isCustomMullionActive = false }) {
    const [isDragging, setIsDragging] = useState(false);
    const [activeSection, setActiveSection] = useState('divider');
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand divider section when custom mullion mode is activated externally
    useEffect(() => {
        if (isCustomMullionActive) {
            setActiveSection('divider');
            setIsExpanded(true);
        }
    }, [isCustomMullionActive]);

    const handleDragStart = (e, pattern) => {
        setIsDragging(true);
        e.dataTransfer.setData('application/json', JSON.stringify(pattern));
        e.dataTransfer.effectAllowed = 'copy';

        // Create drag image
        const dragPreview = document.createElement('div');
        dragPreview.style.cssText = `
            width: 60px;
            height: 60px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            position: absolute;
            top: -1000px;
        `;
        dragPreview.innerHTML = `<span style="font-size: 10px; color: #3b82f6; font-weight: 600;">${pattern.name}</span>`;
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 30, 30);

        setTimeout(() => document.body.removeChild(dragPreview), 0);

        if (onPatternDragStart) onPatternDragStart(pattern);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (onPatternDragEnd) onPatternDragEnd();
    };

    const handleSidebarClick = (itemId) => {
        if (activeSection === itemId) {
            setIsExpanded(!isExpanded);
        } else {
            setActiveSection(itemId);
            setIsExpanded(true);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '0',
            zIndex: 100,
        }}>
            {/* Sidebar Icons */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'white',
                padding: '8px 6px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
                {sidebarItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSidebarClick(item.id)}
                        title={item.name}
                        style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            backgroundColor: activeSection === item.id && isExpanded ? '#2563eb' : 'transparent',
                            color: activeSection === item.id && isExpanded ? 'white' : '#64748b',
                            fontSize: '20px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (activeSection !== item.id || !isExpanded) {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeSection !== item.id || !isExpanded) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* Expanded Panel - Divider Section */}
            {isExpanded && activeSection === 'divider' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '280px',
                }}>
                    {/* Header */}
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f1f5f9',
                    }}>
                        Divider
                    </div>

                    {/* Pattern Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px',
                    }}>
                        {mullionPatterns.map((pattern) => {
                            const isCustom = pattern.isClickOnly;
                            const isActive = isCustom && isCustomMullionActive;
                            return (
                                <div
                                    key={pattern.id}
                                    draggable={!isCustom}
                                    onDragStart={isCustom ? undefined : (e) => handleDragStart(e, pattern)}
                                    onDragEnd={isCustom ? undefined : handleDragEnd}
                                    onClick={isCustom ? () => onCustomMullionToggle?.() : undefined}
                                    title={pattern.name}
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isCustom ? 'pointer' : 'grab',
                                        border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        backgroundColor: isActive ? '#2563eb' : (isDragging && !isCustom ? '#f8fafc' : 'white'),
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.backgroundColor = '#eff6ff';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    {isActive ? (
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#ffffff" strokeWidth="1.5">
                                            <rect x="8" y="8" width="32" height="32" rx="1" />
                                            <line x1="8" y1="40" x2="40" y2="8" strokeWidth="2" />
                                            <circle cx="8" cy="40" r="2" fill="#ffffff" />
                                            <circle cx="40" cy="8" r="2" fill="#ffffff" />
                                        </svg>
                                    ) : pattern.icon}
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-22px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '9px',
                                            color: '#2563eb',
                                            fontWeight: '700',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            Custom Mullion
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Drag hint */}
                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '12px 4px 4px',
                        marginTop: '12px',
                        borderTop: '1px solid #f1f5f9',
                    }}>
                        ✨ Drag & drop onto a panel to apply
                    </div>
                </div>
            )}

            {/* Panel Section - Sliding Designs */}
            {isExpanded && activeSection === 'panel' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '280px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                }}>
                    {/* Header */}
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '16px',
                    }}>
                        Sliding Designs
                    </div>

                    {/* Render each category with badge + grid */}
                    {slidingCategories.map((cat) => {
                        const catPatterns = slidingPatterns.filter(p => p.category === cat.id);
                        if (catPatterns.length === 0) return null;
                        return (
                            <div key={cat.id} style={{ marginBottom: '20px' }}>
                                {/* Category Badge */}
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                    }}>
                                        {cat.label}
                                    </span>
                                </div>

                                {/* Pattern Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px',
                                }}>
                                    {catPatterns.map((pattern) => (
                                        <div
                                            key={pattern.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, pattern)}
                                            onDragEnd={handleDragEnd}
                                            title={pattern.name}
                                            style={{
                                                padding: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'grab',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                backgroundColor: 'white',
                                                transition: 'all 0.2s ease',
                                                gap: '6px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#3b82f6';
                                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                                e.currentTarget.style.transform = 'scale(1.03)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {pattern.icon}
                                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>{pattern.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Drag hint */}
                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '8px 4px 4px',
                        borderTop: '1px solid #f1f5f9',
                    }}>
                        Drag & drop onto canvas to apply
                    </div>
                </div>
            )}

            {/* Placeholder for other sections */}
            {isExpanded && activeSection !== 'divider' && activeSection !== 'panel' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '200px',
                }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px',
                    }}>
                        {sidebarItems.find(i => i.id === activeSection)?.name}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '20px',
                    }}>
                        Coming soon...
                    </div>
                </div>
            )}
        </div>
    );
}

// Export patterns for use in other components
export { mullionPatterns, slidingPatterns };
