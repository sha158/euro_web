'use client';
import { useMemo, useState } from 'react';

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

const couplerPatterns = [
    {
        id: 'coupler-vertical',
        name: 'Vertical Coupling',
        type: 'coupler',
        couplingType: 'vertical',
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#475569" strokeWidth="1.4">
                <rect x="7" y="6" width="18" height="44" rx="1" />
                <rect x="31" y="6" width="18" height="44" rx="1" />
                <line x1="25" y1="14" x2="31" y2="14" />
                <line x1="25" y1="28" x2="31" y2="28" />
                <line x1="25" y1="42" x2="31" y2="42" />
            </svg>
        ),
    },
    {
        id: 'coupler-horizontal',
        name: 'Horizontal Coupling',
        type: 'coupler',
        couplingType: 'horizontal',
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#475569" strokeWidth="1.4">
                <rect x="6" y="7" width="44" height="18" rx="1" />
                <rect x="6" y="31" width="44" height="18" rx="1" />
                <line x1="14" y1="25" x2="14" y2="31" />
                <line x1="28" y1="25" x2="28" y2="31" />
                <line x1="42" y1="25" x2="42" y2="31" />
            </svg>
        ),
    },
    {
        id: 'coupler-angular',
        name: 'Angular Coupling',
        type: 'coupler',
        couplingType: 'angular',
        angle: 90,
        icon: (
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#475569" strokeWidth="1.4">
                <polygon points="7,8 25,8 25,48 7,48" />
                <polygon points="25,8 47,13 47,52 25,48" />
                <line x1="25" y1="8" x2="25" y2="48" />
                <line x1="25" y1="8" x2="47" y2="13" />
                <line x1="25" y1="48" x2="47" y2="52" />
            </svg>
        ),
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

const Addon3DShell = ({ children }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        {/* Top depth */}
        <polygon points="10,6 43,6 49,11 16,11" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Right depth */}
        <polygon points="43,6 49,11 49,44 43,39" fill="#cfd7e3" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Front frame */}
        <rect x="10" y="11" width="33" height="33" fill="#f8fafc" stroke="#64748b" strokeWidth="1.1" />
        {/* Inner panel */}
        <rect x="13" y="14" width="27" height="27" fill="white" stroke="#94a3b8" strokeWidth="0.8" />
        {children}
    </svg>
);

// Add-on items for the Design section (3D icon style)
const addonItems = [
    {
        id: 'addon-fan', name: 'Exhaust Fan', type: 'addon', addonType: 'fan',
        icon: (
            <Addon3DShell>
                <circle cx="26.5" cy="27.5" r="9.8" stroke="#64748b" strokeWidth="1.5" fill="#f8fafc" />
                <circle cx="26.5" cy="27.5" r="1.8" fill="#64748b" />
                {[0, 72, 144, 216, 288].map((deg) => (
                    <path
                        key={`fan-blade-${deg}`}
                        d={`M26.5 27.5 L${26.5 + 7.5 * Math.cos((deg * Math.PI) / 180)} ${27.5 + 7.5 * Math.sin((deg * Math.PI) / 180)} L${26.5 + 4.4 * Math.cos(((deg + 28) * Math.PI) / 180)} ${27.5 + 4.4 * Math.sin(((deg + 28) * Math.PI) / 180)} Z`}
                        fill="#cbd5e1"
                        stroke="#64748b"
                        strokeWidth="0.5"
                    />
                ))}
                <circle cx="15.5" cy="17" r="1.2" fill="#94a3b8" />
                <circle cx="37.5" cy="17" r="1.2" fill="#94a3b8" />
                <circle cx="15.5" cy="38" r="1.2" fill="#94a3b8" />
                <circle cx="37.5" cy="38" r="1.2" fill="#94a3b8" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-louver', name: 'Louver', type: 'addon', addonType: 'louver',
        icon: (
            <Addon3DShell>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={`louver-slat-${i}`}>
                        <line x1="15" y1={18 + i * 3.6} x2="38" y2={20 + i * 3.6} stroke="#64748b" strokeWidth="1.4" />
                        <line x1="15" y1={19 + i * 3.6} x2="38" y2={21 + i * 3.6} stroke="#cbd5e1" strokeWidth="0.8" />
                    </g>
                ))}
                <line x1="38.5" y1="17" x2="38.5" y2="38" stroke="#94a3b8" strokeWidth="1" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-georgian', name: 'Georgian Bar', type: 'addon', addonType: 'georgian',
        icon: (
            <Addon3DShell>
                <line x1="22" y1="15" x2="22" y2="40" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="31" y1="15" x2="31" y2="40" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="14" y1="23" x2="39" y2="23" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="14" y1="31" x2="39" y2="31" stroke="#94a3b8" strokeWidth="1.2" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-mesh', name: 'Mosquito Mesh', type: 'addon', addonType: 'mesh',
        icon: (
            <Addon3DShell>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <line key={`mesh-v-${i}`} x1={15 + i * 3.8} y1="15" x2={15 + i * 3.8} y2="40" stroke="#cbd5e1" strokeWidth="0.5" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <line key={`mesh-h-${i}`} x1="14" y1={16 + i * 3.8} x2="39" y2={16 + i * 3.8} stroke="#cbd5e1" strokeWidth="0.5" />
                ))}
                <rect x="36.5" y="24" width="2.2" height="8" rx="1" fill="#64748b" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-fixed', name: 'Fixed Panel', type: 'addon', addonType: 'fixed',
        icon: (
            <Addon3DShell>
                <rect x="16" y="17" width="22" height="22" fill="none" stroke="#94a3b8" strokeWidth="1.4" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-acgrill', name: 'AC Grill', type: 'addon', addonType: 'acgrill',
        icon: (
            <Addon3DShell>
                <rect x="15" y="16" width="19" height="24" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.9" />
                {[0, 1, 2, 3, 4].map((i) => (
                    <line key={`ac-slat-${i}`} x1="17" y1={19 + i * 4.1} x2="31.5" y2={19 + i * 4.1} stroke="#64748b" strokeWidth="1" />
                ))}
                <rect x="34.5" y="16" width="4.8" height="24" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
                <circle cx="37" cy="35" r="1.1" fill="#64748b" />
                <circle cx="37" cy="30" r="1.1" fill="#64748b" />
            </Addon3DShell>
        )
    },
    {
        id: 'addon-grid', name: 'Grid', type: 'addon', addonType: 'grid',
        icon: (
            <Addon3DShell>
                <line x1="14" y1="22" x2="39" y2="22" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="14" y1="30" x2="39" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="22.3" y1="15" x2="22.3" y2="40" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="30.6" y1="15" x2="30.6" y2="40" stroke="#94a3b8" strokeWidth="1.2" />
            </Addon3DShell>
        )
    },
];

// Sidebar menu items
const sidebarItems = [
    {
        id: 'mullion',
        name: 'Mullion',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="9" y1="4" x2="9" y2="20" />
                <line x1="15" y1="4" x2="15" y2="20" />
            </svg>
        ),
    },
    {
        id: 'design',
        name: 'Design',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="4" width="16" height="16" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
        ),
    },
    {
        id: 'coupler',
        name: 'Coupler',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 20V6h6v6h10" />
                <line x1="10" y1="12" x2="10" y2="20" />
            </svg>
        ),
    },
    {
        id: 'opening',
        name: 'Opening',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 18V8l16-4v10l-16 4Z" />
            </svg>
        ),
    },
    {
        id: 'colors',
        name: 'Colour',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.5-1.1 2.5-2.5 0-.8-.3-1.5-.8-2 .6-.5 1.4-.8 2.3-.8H17a4 4 0 0 0 0-8h-1.5A3.5 3.5 0 0 1 12 3Z" />
                <circle cx="8" cy="9" r="1" />
                <circle cx="10.5" cy="6.5" r="1" />
                <circle cx="14" cy="6.5" r="1" />
                <circle cx="16" cy="10" r="1" />
            </svg>
        ),
    },
    {
        id: 'image-upload',
        name: 'Image Upload',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="14" height="12" rx="2" />
                <circle cx="7.5" cy="8.5" r="1.3" />
                <path d="M4.5 14l3.5-3 2.6 2.2 2.4-2 3 2.8" />
                <path d="M19 13v7m0 0-2.5-2.5M19 20l2.5-2.5" />
            </svg>
        ),
    },
];

const frameColorOptions = [
    {
        id: 'no-laminate',
        inside: { name: 'NO LAMINATE', color: '#d9dde3' },
        outside: { name: 'NO LAMINATE', color: '#d9dde3' },
    },
    {
        id: 'renolit-walnut',
        inside: { name: 'RENOLIT WALNUT', color: '#6f4e37' },
        outside: { name: 'RENOLIT WALNUT', color: '#6f4e37' },
    },
    {
        id: 'renolit-smooth-black',
        inside: { name: 'RENOLIT SMOOTH BLACK', color: '#101516' },
        outside: { name: 'RENOLIT SMOOTH BLACK', color: '#101516' },
    },
    {
        id: 'renolit-rustic-oak',
        inside: { name: 'RENOLIT RUSTIC OAK', color: '#b8955a' },
        outside: { name: 'RENOLIT RUSTIC OAK', color: '#b8955a' },
    },
    {
        id: 'mahogany-red',
        inside: { name: 'MAHOGANY RED', color: '#7f0b0b' },
        outside: { name: 'MAHOGANY RED', color: '#7f0b0b' },
    },
    {
        id: 'anthracite-grey',
        inside: { name: 'ANTHRACITE GREY', color: '#6f6a67' },
        outside: { name: 'ANTHRACITE GREY', color: '#6f6a67' },
    },
    {
        id: 'inside-white-outside-black',
        inside: { name: 'CRISP WHITE', color: '#f4f6f8' },
        outside: { name: 'SMOOTH BLACK', color: '#101516' },
    },
    {
        id: 'inside-oak-outside-grey',
        inside: { name: 'RUSTIC OAK', color: '#b8955a' },
        outside: { name: 'ANTHRACITE GREY', color: '#6f6a67' },
    },
];

export default function MullionPalette({
    onPatternDragStart,
    onPatternDragEnd,
    isVisible = true,
    onCustomMullionToggle,
    isCustomMullionActive = false,
    onOpeningModeToggle,
    isOpeningModeActive = false,
    currentViewMode = 'inside',
    frameFinishBySide,
    onFrameFinishConfirm,
    onImageUpload,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [activeSection, setActiveSection] = useState('mullion');
    const [isExpanded, setIsExpanded] = useState(false);
    const [colorSearch, setColorSearch] = useState('');
    const [selectedColorDraftId, setSelectedColorDraftId] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);

    const filteredColorOptions = useMemo(() => {
        const query = colorSearch.trim().toLowerCase();
        if (!query) return frameColorOptions;
        return frameColorOptions.filter((option) =>
            option.inside.name.toLowerCase().includes(query) ||
            option.outside.name.toLowerCase().includes(query)
        );
    }, [colorSearch]);

    const fallbackColorOption = frameColorOptions.find((option) => option.id === 'no-laminate') ?? frameColorOptions[0];
    const activeColorIdForCurrentSide = frameFinishBySide?.activeOptionIdBySide?.[currentViewMode];
    const selectedColorId = selectedColorDraftId
        ?? activeColorIdForCurrentSide
        ?? fallbackColorOption.id;

    const selectedColorOption = useMemo(
        () => frameColorOptions.find((option) => option.id === selectedColorId) ?? frameColorOptions[0],
        [selectedColorId]
    );

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
        if (itemId === 'opening') {
            setActiveSection('opening');
            setIsExpanded(false);
            onOpeningModeToggle?.();
            return;
        }

        if (activeSection === itemId) {
            setIsExpanded(!isExpanded);
        } else {
            setActiveSection(itemId);
            setIsExpanded(true);
        }

        if (itemId === 'colors') {
            setSelectedColorDraftId(null);
        }
    };

    const handleColorConfirm = () => {
        if (!selectedColorOption) return;
        onFrameFinishConfirm?.(selectedColorOption, currentViewMode);
        setSelectedColorDraftId(null);
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const src = String(reader.result || '');
            setUploadedImage({ name: file.name, src });
            onImageUpload?.(src);
        };
        reader.readAsDataURL(file);
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
                    <div key={item.id} style={{ position: 'relative' }}>
                        <div
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
                                backgroundColor:
                                    item.id === 'opening'
                                        ? (isOpeningModeActive ? '#2563eb' : 'transparent')
                                        : (activeSection === item.id && isExpanded ? '#2563eb' : 'transparent'),
                                color:
                                    item.id === 'opening'
                                        ? (isOpeningModeActive ? 'white' : '#64748b')
                                        : (activeSection === item.id && isExpanded ? 'white' : '#64748b'),
                                fontSize: '20px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (
                                    (item.id === 'opening' && !isOpeningModeActive) ||
                                    (item.id !== 'opening' && (activeSection !== item.id || !isExpanded))
                                ) {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (
                                    (item.id === 'opening' && !isOpeningModeActive) ||
                                    (item.id !== 'opening' && (activeSection !== item.id || !isExpanded))
                                ) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {item.icon}
                        </div>
                        {item.id === 'opening' && isOpeningModeActive && (
                            <div style={{
                                position: 'absolute',
                                left: '50px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                                whiteSpace: 'nowrap',
                            }}>
                                Opening
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mullion Section */}
            {isExpanded && activeSection === 'mullion' && (
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
                        Mullion
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

            {/* Coupler Section */}
            {isExpanded && activeSection === 'coupler' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '280px',
                }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '8px',
                    }}>
                        Coupler
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '14px',
                    }}>
                        Components: Vertical, Horizontal, Angular
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                    }}>
                        {couplerPatterns.map((pattern) => (
                            <div
                                key={pattern.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, pattern)}
                                onDragEnd={handleDragEnd}
                                title={pattern.name}
                                style={{
                                    padding: '8px 6px',
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
                                <span style={{
                                    fontSize: '10px',
                                    color: '#475569',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    lineHeight: 1.1,
                                }}>
                                    {pattern.couplingType[0].toUpperCase() + pattern.couplingType.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        padding: '12px 4px 4px',
                        marginTop: '12px',
                        borderTop: '1px solid #f1f5f9',
                    }}>
                        Drag & drop onto a panel to apply coupler
                    </div>
                </div>
            )}

            {/* Design Section */}
            {isExpanded && activeSection === 'design' && (
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
                        Design
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

                    {/* Add-ons Section */}
                    <div style={{ marginBottom: '16px', marginTop: '8px' }}>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '12px',
                            paddingTop: '12px',
                            borderTop: '1px solid #e2e8f0',
                        }}>
                            Add-ons
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px',
                        }}>
                            {addonItems.map((addon) => (
                                <div
                                    key={addon.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, addon)}
                                    onDragEnd={handleDragEnd}
                                    title={addon.name}
                                    style={{
                                        padding: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'grab',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        transition: 'all 0.2s ease',
                                        gap: '4px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {addon.icon}
                                </div>
                            ))}
                        </div>
                    </div>

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

            {/* Colors Section */}
            {isExpanded && activeSection === 'colors' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    minWidth: '340px',
                    maxWidth: '340px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a',
                    }}>
                        Select Color
                    </div>

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <input
                            value={colorSearch}
                            onChange={(e) => setColorSearch(e.target.value)}
                            placeholder="Search..."
                            style={{
                                width: '100%',
                                border: '1px solid #dbe3ee',
                                borderRadius: '6px',
                                height: '38px',
                                padding: '0 12px',
                                fontSize: '15px',
                                color: '#1e293b',
                                outline: 'none',
                            }}
                        />
                        <div style={{
                            marginTop: '8px',
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '500',
                        }}>
                            Applying to: <span style={{ color: '#1e293b', textTransform: 'capitalize' }}>{currentViewMode}</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '12px 10px',
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '10px',
                        alignContent: 'start',
                        flex: 1,
                    }}>
                        {filteredColorOptions.map((option) => {
                            const isSelected = selectedColorId === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSelectedColorDraftId(option.id)}
                                    style={{
                                        border: isSelected ? '2px solid #3b82f6' : '1px solid #dbe3ee',
                                        borderRadius: '8px',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        padding: '8px',
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '128px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        background: `linear-gradient(135deg, ${option.inside.color} 0 49%, #ffffff 49% 51%, ${option.outside.color} 51% 100%)`,
                                    }} />
                                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                                        In - {option.inside.name}
                                    </div>
                                    <div style={{ marginTop: '2px', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                                        Out - {option.outside.name}
                                    </div>
                                </button>
                            );
                        })}
                        {filteredColorOptions.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: '13px',
                                padding: '18px 0',
                            }}>
                                No colors match your search.
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                            type="button"
                            onClick={handleColorConfirm}
                            style={{
                                width: '100%',
                                height: '44px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#1d6cc0',
                                color: 'white',
                                fontSize: '17px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Image Upload Section */}
            {isExpanded && activeSection === 'image-upload' && (
                <div style={{
                    marginLeft: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    padding: '16px',
                    minWidth: '280px',
                    maxWidth: '320px',
                }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px',
                    }}>
                        Image Upload
                    </div>

                    <label style={{
                        display: 'block',
                        border: '1px dashed #94a3b8',
                        borderRadius: '10px',
                        padding: '18px',
                        textAlign: 'center',
                        color: '#475569',
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: '#f8fafc',
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px' }}>Select image</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG, WEBP</div>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </label>

                    {uploadedImage?.src && (
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                                {uploadedImage.name}
                            </div>
                            <div style={{
                                width: '100%',
                                height: '180px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                backgroundImage: `url(${uploadedImage.src})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundSize: 'contain',
                            }} />
                        </div>
                    )}
                    <div style={{
                        marginTop: '10px',
                        fontSize: '11px',
                        color: '#94a3b8',
                        textAlign: 'center',
                    }}>
                        Upload panel is ready.
                    </div>
                </div>
            )}
        </div>
    );
}

// Export patterns for use in other components
export { mullionPatterns, slidingPatterns, frameColorOptions };
