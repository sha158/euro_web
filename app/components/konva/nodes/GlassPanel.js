import React from 'react';
import { Group, Rect, Circle, Line, Path } from 'react-konva';
import FrameRects from '../shared/FrameRects';
import GlassGrid from '../shared/GlassGrid';
import PanelMarker from '../shared/PanelMarker';
import CornerDots from '../shared/CornerDots';
import CenteredText from '../shared/CenteredText';
import { GLASS_INSET, GLASS_DEFAULT, GLASS_SELECTED, GLASS_DRAG_OVER } from '../shared/constants';

// ── Addon color palette ──
export const ADDON = {
    primary: '#475569',      // slate-600
    secondary: '#64748b',    // slate-500
    light: '#94a3b8',        // slate-400
    veryLight: '#cbd5e1',    // slate-300
    accent: '#3b82f6',       // blue-500
    accentLight: '#93c5fd',  // blue-300
    bg: 'rgba(255,255,255,0.9)',
    glassTint: 'rgba(148, 163, 184, 0.12)',
};

// ─────────────────────────────────────────────
// FAN — motor housing + guard grill + 5 curved blades + airflow ring
// Supports fanSpec: { shape, diameter (mm), position, includeGlass }
// The diameter is in mm — it's mapped proportionally to the panel's pixel area
// using the panelWidthMm to calculate the correct visual scale.
// ─────────────────────────────────────────────
function FanOverlay({ acx, acy, aw, ah, fanSpec, panelWidthMm }) {
    const maxDim = Math.min(aw, ah);

    // Fan sizing: diameter (mm) → proportional to panel, with minimum visible size.
    // The fan is drawn proportional to the panel's mm width so that a 300mm fan
    // on a 1500mm panel takes up 20% of the panel visually.
    // A minimum of 60% of the panel is enforced so the fan is always clearly visible.
    let fanDim = maxDim; // default: fill the panel
    if (fanSpec?.diameter && panelWidthMm > 0) {
        const ratio = fanSpec.diameter / panelWidthMm;
        const diameterPx = ratio * maxDim;
        // Enforce minimum 60% of panel so fan is always clearly visible
        const minDim = maxDim * 0.6;
        fanDim = Math.max(Math.min(diameterPx, maxDim), minDim);
    }

    const isSquare = fanSpec?.shape === 'square';
    const outerR = fanDim * 0.42;
    const bladeR = fanDim * 0.34;
    const hubR = Math.max(fanDim * 0.08, 3);
    const guardR = fanDim * 0.44;

    return (
        <Group listening={false}>
            {/* Square frame (if square shape selected) */}
            {isSquare && (
                <Rect
                    x={acx - guardR - 2} y={acy - guardR - 2}
                    width={(guardR + 2) * 2} height={(guardR + 2) * 2}
                    stroke={ADDON.secondary} strokeWidth={1.5} cornerRadius={2}
                />
            )}

            {/* Outer guard grill — concentric rings */}
            <Circle x={acx} y={acy} radius={guardR}
                stroke={ADDON.veryLight} strokeWidth={1.2} />
            <Circle x={acx} y={acy} radius={guardR * 0.82}
                stroke={ADDON.veryLight} strokeWidth={0.5} dash={[2, 3]} />
            <Circle x={acx} y={acy} radius={guardR * 0.64}
                stroke={ADDON.veryLight} strokeWidth={0.4} dash={[1.5, 3]} />

            {/* Guard grill cross-bars */}
            {[0, 45, 90, 135].map(deg => {
                const rad = deg * Math.PI / 180;
                const x1 = acx + guardR * Math.cos(rad);
                const y1 = acy + guardR * Math.sin(rad);
                const x2 = acx - guardR * Math.cos(rad);
                const y2 = acy - guardR * Math.sin(rad);
                return <Line key={`guard-${deg}`} points={[x1, y1, x2, y2]}
                    stroke={ADDON.veryLight} strokeWidth={0.4} />;
            })}

            {/* Motor housing ring */}
            <Circle x={acx} y={acy} radius={outerR}
                stroke={ADDON.secondary} strokeWidth={1.8} />

            {/* Fan blades — 5 asymmetric curved blades */}
            {[0, 72, 144, 216, 288].map(deg => {
                const rad = deg * Math.PI / 180;
                const tipRad = (deg + 25) * Math.PI / 180;
                const c1Rad = (deg - 20) * Math.PI / 180;
                const c2Rad = (deg + 40) * Math.PI / 180;
                return (
                    <Group key={`blade-${deg}`}>
                        <Path
                            data={`M${acx + hubR * Math.cos(rad)},${acy + hubR * Math.sin(rad)} C${acx + bladeR * 0.55 * Math.cos(c1Rad)},${acy + bladeR * 0.55 * Math.sin(c1Rad)} ${acx + bladeR * 0.85 * Math.cos(rad)},${acy + bladeR * 0.85 * Math.sin(rad)} ${acx + bladeR * Math.cos(tipRad)},${acy + bladeR * Math.sin(tipRad)} C${acx + bladeR * 0.7 * Math.cos(c2Rad)},${acy + bladeR * 0.7 * Math.sin(c2Rad)} ${acx + hubR * 1.8 * Math.cos((deg + 50) * Math.PI / 180)},${acy + hubR * 1.8 * Math.sin((deg + 50) * Math.PI / 180)} ${acx + hubR * Math.cos((deg + 72) * Math.PI / 180)},${acy + hubR * Math.sin((deg + 72) * Math.PI / 180)}`}
                            fill="rgba(100, 116, 139, 0.35)"
                            stroke={ADDON.secondary}
                            strokeWidth={0.8}
                        />
                    </Group>
                );
            })}

            {/* Motor hub — center dot + inner ring */}
            <Circle x={acx} y={acy} radius={hubR + 2}
                fill={ADDON.light} stroke={ADDON.primary} strokeWidth={1} />
            <Circle x={acx} y={acy} radius={hubR * 0.45}
                fill={ADDON.primary} />

            {/* Mounting screws on outer ring (or square corners) */}
            {(isSquare ? [45, 135, 225, 315] : [0, 90, 180, 270]).map(deg => {
                const rad = deg * Math.PI / 180;
                const screwR = isSquare ? guardR * 0.95 : outerR;
                return <Circle key={`screw-${deg}`}
                    x={acx + screwR * Math.cos(rad)}
                    y={acy + screwR * Math.sin(rad)}
                    radius={1.5} fill={ADDON.light} stroke={ADDON.secondary} strokeWidth={0.5} />;
            })}

            {/* Diameter label below fan */}
            {fanSpec?.diameter && (
                <Group>
                    <Rect x={acx - 18} y={acy + guardR + 4} width={36} height={13}
                        cornerRadius={2} fill="rgba(255,255,255,0.9)"
                        stroke={ADDON.veryLight} strokeWidth={0.5} />
                    <CenteredText
                        x={acx} y={acy + guardR + 10.5}
                        text={`\u00D8${fanSpec.diameter}`}
                        fontSize={8} fill={ADDON.secondary} fontStyle="600" />
                </Group>
            )}
        </Group>
    );
}

// ─────────────────────────────────────────────
// LOUVER — frame channel + slat profiles with depth
// Supports louverSpec: { type: 'fixed' | 'movable' }
// Fixed: horizontal sealed slats (no tilt rod)
// Movable: angled slats with tilt rod and knobs
// ─────────────────────────────────────────────
function LouverOverlay({ ax, ay, aw, ah, louverSpec }) {
    const isMovable = louverSpec?.type === 'movable';
    const slats = 8;
    const frameInset = 3;
    const fx = ax + frameInset;
    const fy = ay + frameInset;
    const fw = aw - frameInset * 2;
    const fh = ah - frameInset * 2;
    const slatH = 3;

    return (
        <Group listening={false}>
            {/* Outer frame channel */}
            <Rect x={fx} y={fy} width={fw} height={fh}
                stroke={ADDON.secondary} strokeWidth={1.2} cornerRadius={1} />

            {/* Side channels (vertical rails) */}
            <Line points={[fx + 3, fy, fx + 3, fy + fh]} stroke={ADDON.veryLight} strokeWidth={0.6} />
            <Line points={[fx + fw - 3, fy, fx + fw - 3, fy + fh]} stroke={ADDON.veryLight} strokeWidth={0.6} />

            {/* Slats */}
            {Array.from({ length: slats }, (_, i) => {
                const sy = fy + (fh / (slats + 1)) * (i + 1);
                const x1 = fx + 5;
                const x2 = fx + fw - 5;

                if (isMovable) {
                    // Movable: angled slats with 3D depth
                    return (
                        <Group key={`slat-${i}`}>
                            <Line points={[x1, sy + slatH, x2, sy + slatH - 1]}
                                stroke={ADDON.veryLight} strokeWidth={1.5} lineCap="round" />
                            <Line points={[x1, sy, x2, sy - 1.5]}
                                stroke={ADDON.primary} strokeWidth={2.2} lineCap="round" />
                            <Line points={[x1, sy - 1, x2, sy - 2.5]}
                                stroke={ADDON.light} strokeWidth={0.4} lineCap="round" />
                        </Group>
                    );
                }
                // Fixed: flat horizontal slats (sealed, no angle)
                return (
                    <Group key={`slat-${i}`}>
                        <Line points={[x1, sy + 1, x2, sy + 1]}
                            stroke={ADDON.veryLight} strokeWidth={1} lineCap="round" />
                        <Line points={[x1, sy, x2, sy]}
                            stroke={ADDON.primary} strokeWidth={2} lineCap="round" />
                        {/* Glass strip between slats (fixed glass louver) */}
                        <Line points={[x1, sy - 1.5, x2, sy - 1.5]}
                            stroke="rgba(147, 197, 253, 0.5)" strokeWidth={0.6} lineCap="round" />
                    </Group>
                );
            })}

            {/* Tilt rod + knobs (movable only) */}
            {isMovable && (
                <Group>
                    <Line points={[fx + fw - 8, fy + 8, fx + fw - 8, fy + fh - 8]}
                        stroke={ADDON.secondary} strokeWidth={1} />
                    {Array.from({ length: slats }, (_, i) => {
                        const sy = fy + (fh / (slats + 1)) * (i + 1);
                        return <Circle key={`knob-${i}`}
                            x={fx + fw - 8} y={sy} radius={1.2}
                            fill={ADDON.secondary} />;
                    })}
                </Group>
            )}

            {/* Fixed seal indicators (fixed only) — small dots on frame edges */}
            {!isMovable && (
                <Group>
                    {[0.2, 0.5, 0.8].map(r => (
                        <Group key={`seal-${r}`}>
                            <Circle x={fx + 1.5} y={fy + fh * r} radius={1}
                                fill={ADDON.light} />
                            <Circle x={fx + fw - 1.5} y={fy + fh * r} radius={1}
                                fill={ADDON.light} />
                        </Group>
                    ))}
                </Group>
            )}
        </Group>
    );
}

// ─────────────────────────────────────────────
// GEORGIAN BAR — profiled bars with width, shadow, and intersection details
// ─────────────────────────────────────────────
function GeorgianOverlay({ ax, ay, aw, ah }) {
    const barW = 3;
    const hBars = [0.25, 0.5, 0.75];
    const vBars = [0.33, 0.66];

    return (
        <Group listening={false}>
            {/* Vertical bars */}
            {vBars.map((f, i) => {
                const bx = ax + aw * f;
                return (
                    <Group key={`vbar-${i}`}>
                        {/* Bar shadow */}
                        <Rect x={bx - barW / 2 + 0.8} y={ay} width={barW} height={ah}
                            fill="rgba(148, 163, 184, 0.2)" />
                        {/* Main bar body */}
                        <Rect x={bx - barW / 2} y={ay} width={barW} height={ah}
                            fill={ADDON.veryLight} stroke={ADDON.secondary} strokeWidth={0.5} />
                        {/* Bar center line (profile detail) */}
                        <Line points={[bx, ay, bx, ay + ah]}
                            stroke={ADDON.light} strokeWidth={0.3} />
                    </Group>
                );
            })}

            {/* Horizontal bars */}
            {hBars.map((f, i) => {
                const by = ay + ah * f;
                return (
                    <Group key={`hbar-${i}`}>
                        {/* Bar shadow */}
                        <Rect x={ax} y={by - barW / 2 + 0.8} width={aw} height={barW}
                            fill="rgba(148, 163, 184, 0.2)" />
                        {/* Main bar body */}
                        <Rect x={ax} y={by - barW / 2} width={aw} height={barW}
                            fill={ADDON.veryLight} stroke={ADDON.secondary} strokeWidth={0.5} />
                        {/* Bar center line */}
                        <Line points={[ax, by, ax + aw, by]}
                            stroke={ADDON.light} strokeWidth={0.3} />
                    </Group>
                );
            })}

            {/* Intersection rosette dots */}
            {vBars.map((vf, vi) =>
                hBars.map((hf, hi) => (
                    <Circle key={`node-${vi}-${hi}`}
                        x={ax + aw * vf} y={ay + ah * hf}
                        radius={2}
                        fill={ADDON.light} stroke={ADDON.secondary} strokeWidth={0.6} />
                ))
            )}
        </Group>
    );
}

// ─────────────────────────────────────────────
// MOSQUITO MESH — frame + fine crosshatch + corner brackets + pull tab
// ─────────────────────────────────────────────
function MeshOverlay({ ax, ay, aw, ah }) {
    const meshStep = 5;
    const frameInset = 2;
    const fx = ax + frameInset;
    const fy = ay + frameInset;
    const fw = aw - frameInset * 2;
    const fh = ah - frameInset * 2;
    const bracketL = 8;

    return (
        <Group listening={false}>
            {/* Subtle mesh background tint */}
            <Rect x={fx} y={fy} width={fw} height={fh}
                fill="rgba(148, 163, 184, 0.06)" />

            {/* Fine mesh grid — vertical */}
            {Array.from({ length: Math.ceil(fw / meshStep) + 1 }, (_, i) => {
                const lx = fx + i * meshStep;
                if (lx > fx + fw) return null;
                return <Line key={`mv${i}`}
                    points={[lx, fy, lx, fy + fh]}
                    stroke="rgba(148, 163, 184, 0.35)" strokeWidth={0.3} />;
            })}

            {/* Fine mesh grid — horizontal */}
            {Array.from({ length: Math.ceil(fh / meshStep) + 1 }, (_, i) => {
                const ly = fy + i * meshStep;
                if (ly > fy + fh) return null;
                return <Line key={`mh${i}`}
                    points={[fx, ly, fx + fw, ly]}
                    stroke="rgba(148, 163, 184, 0.35)" strokeWidth={0.3} />;
            })}

            {/* Mesh frame border */}
            <Rect x={fx} y={fy} width={fw} height={fh}
                stroke={ADDON.secondary} strokeWidth={1} cornerRadius={0.5} />

            {/* Corner brackets (L-shapes) */}
            {/* Top-left */}
            <Line points={[fx, fy + bracketL, fx, fy, fx + bracketL, fy]}
                stroke={ADDON.primary} strokeWidth={1.5} lineCap="square" />
            {/* Top-right */}
            <Line points={[fx + fw - bracketL, fy, fx + fw, fy, fx + fw, fy + bracketL]}
                stroke={ADDON.primary} strokeWidth={1.5} lineCap="square" />
            {/* Bottom-left */}
            <Line points={[fx, fy + fh - bracketL, fx, fy + fh, fx + bracketL, fy + fh]}
                stroke={ADDON.primary} strokeWidth={1.5} lineCap="square" />
            {/* Bottom-right */}
            <Line points={[fx + fw - bracketL, fy + fh, fx + fw, fy + fh, fx + fw, fy + fh - bracketL]}
                stroke={ADDON.primary} strokeWidth={1.5} lineCap="square" />

            {/* Pull tab / handle */}
            <Rect x={fx + fw - 10} y={fy + fh / 2 - 10} width={6} height={20}
                cornerRadius={2} fill={ADDON.light}
                stroke={ADDON.secondary} strokeWidth={0.8} />
            {/* Handle grip lines */}
            <Line points={[fx + fw - 8, fy + fh / 2 - 4, fx + fw - 6, fy + fh / 2 - 4]}
                stroke={ADDON.primary} strokeWidth={0.5} />
            <Line points={[fx + fw - 8, fy + fh / 2, fx + fw - 6, fy + fh / 2]}
                stroke={ADDON.primary} strokeWidth={0.5} />
            <Line points={[fx + fw - 8, fy + fh / 2 + 4, fx + fw - 6, fy + fh / 2 + 4]}
                stroke={ADDON.primary} strokeWidth={0.5} />
        </Group>
    );
}

// ─────────────────────────────────────────────
// FIXED PANEL — corner mounting clips + seal gasket + cross indicator
// ─────────────────────────────────────────────
function FixedOverlay({ ax, ay, aw, ah }) {
    const inset = 5;
    const fx = ax + inset;
    const fy = ay + inset;
    const fw = aw - inset * 2;
    const fh = ah - inset * 2;
    const clipL = 10;
    const clipW = 3;

    return (
        <Group listening={false}>
            {/* Inner seal gasket line */}
            <Rect x={fx} y={fy} width={fw} height={fh}
                stroke={ADDON.light} strokeWidth={1}
                dash={[4, 2]} cornerRadius={1} />

            {/* Subtle cross-lines showing fixed (non-operable) */}
            <Line points={[fx + 4, fy + 4, fx + fw - 4, fy + fh - 4]}
                stroke="rgba(148, 163, 184, 0.25)" strokeWidth={0.8} />
            <Line points={[fx + fw - 4, fy + 4, fx + 4, fy + fh - 4]}
                stroke="rgba(148, 163, 184, 0.25)" strokeWidth={0.8} />

            {/* Corner mounting clips — top-left */}
            <Rect x={fx - 1} y={fy - 1} width={clipL} height={clipW}
                fill={ADDON.secondary} cornerRadius={0.5} />
            <Rect x={fx - 1} y={fy - 1} width={clipW} height={clipL}
                fill={ADDON.secondary} cornerRadius={0.5} />

            {/* Corner mounting clips — top-right */}
            <Rect x={fx + fw - clipL + 1} y={fy - 1} width={clipL} height={clipW}
                fill={ADDON.secondary} cornerRadius={0.5} />
            <Rect x={fx + fw - clipW + 1} y={fy - 1} width={clipW} height={clipL}
                fill={ADDON.secondary} cornerRadius={0.5} />

            {/* Corner mounting clips — bottom-left */}
            <Rect x={fx - 1} y={fy + fh - clipW + 1} width={clipL} height={clipW}
                fill={ADDON.secondary} cornerRadius={0.5} />
            <Rect x={fx - 1} y={fy + fh - clipL + 1} width={clipW} height={clipL}
                fill={ADDON.secondary} cornerRadius={0.5} />

            {/* Corner mounting clips — bottom-right */}
            <Rect x={fx + fw - clipL + 1} y={fy + fh - clipW + 1} width={clipL} height={clipW}
                fill={ADDON.secondary} cornerRadius={0.5} />
            <Rect x={fx + fw - clipW + 1} y={fy + fh - clipL + 1} width={clipW} height={clipL}
                fill={ADDON.secondary} cornerRadius={0.5} />

            {/* Screw indicators on clips */}
            {[
                [fx + 3, fy + 3],
                [fx + fw - 3, fy + 3],
                [fx + 3, fy + fh - 3],
                [fx + fw - 3, fy + fh - 3],
            ].map(([sx, sy], i) => (
                <Group key={`fix-screw-${i}`}>
                    <Circle x={sx} y={sy} radius={1.8}
                        fill={ADDON.light} stroke={ADDON.primary} strokeWidth={0.5} />
                    <Line points={[sx - 1, sy, sx + 1, sy]}
                        stroke={ADDON.primary} strokeWidth={0.4} />
                </Group>
            ))}
        </Group>
    );
}

// ─────────────────────────────────────────────
// AC GRILL — outer frame + angled directional slats + control lever + screw details
// ─────────────────────────────────────────────
function AcGrillOverlay({ ax, ay, aw, ah }) {
    const grillSlats = 7;
    const frameInset = 3;
    const fx = ax + frameInset;
    const fy = ay + frameInset;
    const fw = aw - frameInset * 2;
    const fh = ah - frameInset * 2;
    const slatInset = 5;
    const slatAngle = 2.5;

    return (
        <Group listening={false}>
            {/* Outer frame */}
            <Rect x={fx} y={fy} width={fw} height={fh}
                stroke={ADDON.secondary} strokeWidth={1.5} cornerRadius={1.5} />
            {/* Inner frame line (double-wall profile) */}
            <Rect x={fx + 2} y={fy + 2} width={fw - 4} height={fh - 4}
                stroke={ADDON.veryLight} strokeWidth={0.5} cornerRadius={1} />

            {/* Angled directional slats with 3D depth */}
            {Array.from({ length: grillSlats }, (_, i) => {
                const sy = fy + (fh / (grillSlats + 1)) * (i + 1);
                const x1 = fx + slatInset;
                const x2 = fx + fw - slatInset - 12;
                return (
                    <Group key={`gslat-${i}`}>
                        {/* Slat shadow */}
                        <Line points={[x1, sy + slatAngle + 1.5, x2, sy + 1.5]}
                            stroke={ADDON.veryLight} strokeWidth={2} lineCap="round" />
                        {/* Main slat (angled for airflow direction) */}
                        <Line points={[x1, sy + slatAngle, x2, sy]}
                            stroke={ADDON.primary} strokeWidth={2.5} lineCap="round" />
                        {/* Top highlight */}
                        <Line points={[x1 + 2, sy + slatAngle - 1, x2 - 2, sy - 1]}
                            stroke={ADDON.light} strokeWidth={0.3} />
                    </Group>
                );
            })}

            {/* Right-side control panel strip */}
            <Rect x={fx + fw - slatInset - 10} y={fy + 4} width={10} height={fh - 8}
                fill="rgba(203, 213, 225, 0.3)" stroke={ADDON.veryLight} strokeWidth={0.6} cornerRadius={1} />

            {/* Screw/rivet details on right strip */}
            {[0.15, 0.5, 0.85].map((f, i) => (
                <Group key={`rivet-${i}`}>
                    <Circle x={fx + fw - slatInset - 5} y={fy + fh * f}
                        radius={2.2} fill={ADDON.veryLight}
                        stroke={ADDON.secondary} strokeWidth={0.6} />
                    <Line points={[
                        fx + fw - slatInset - 6, fy + fh * f,
                        fx + fw - slatInset - 4, fy + fh * f
                    ]} stroke={ADDON.secondary} strokeWidth={0.4} />
                    <Line points={[
                        fx + fw - slatInset - 5, fy + fh * f - 1,
                        fx + fw - slatInset - 5, fy + fh * f + 1
                    ]} stroke={ADDON.secondary} strokeWidth={0.4} />
                </Group>
            ))}

            {/* Air direction indicator arrow (bottom-center) */}
            <Path data={`M${fx + fw / 2 - 6},${fy + fh - 6} L${fx + fw / 2},${fy + fh - 2} L${fx + fw / 2 + 6},${fy + fh - 6}`}
                stroke={ADDON.light} strokeWidth={0.8} />
        </Group>
    );
}

// ─────────────────────────────────────────────
// GRID — profiled bars with width, intersection rosettes, subtle 3D
// ─────────────────────────────────────────────
function GridOverlay({ ax, ay, aw, ah }) {
    const barW = 3;
    const vPos = [0.33, 0.66];
    const hPos = [0.33, 0.66];

    return (
        <Group listening={false}>
            {/* Vertical bars */}
            {vPos.map((f, i) => {
                const bx = ax + aw * f;
                return (
                    <Group key={`gvbar-${i}`}>
                        {/* Shadow */}
                        <Rect x={bx - barW / 2 + 0.6} y={ay} width={barW} height={ah}
                            fill="rgba(148, 163, 184, 0.15)" />
                        {/* Bar body */}
                        <Rect x={bx - barW / 2} y={ay} width={barW} height={ah}
                            fill={ADDON.veryLight} stroke={ADDON.secondary} strokeWidth={0.5} />
                        {/* Profile center detail */}
                        <Line points={[bx, ay, bx, ay + ah]}
                            stroke="rgba(255,255,255,0.6)" strokeWidth={0.5} />
                    </Group>
                );
            })}

            {/* Horizontal bars */}
            {hPos.map((f, i) => {
                const by = ay + ah * f;
                return (
                    <Group key={`ghbar-${i}`}>
                        {/* Shadow */}
                        <Rect x={ax} y={by - barW / 2 + 0.6} width={aw} height={barW}
                            fill="rgba(148, 163, 184, 0.15)" />
                        {/* Bar body */}
                        <Rect x={ax} y={by - barW / 2} width={aw} height={barW}
                            fill={ADDON.veryLight} stroke={ADDON.secondary} strokeWidth={0.5} />
                        {/* Profile center detail */}
                        <Line points={[ax, by, ax + aw, by]}
                            stroke="rgba(255,255,255,0.6)" strokeWidth={0.5} />
                    </Group>
                );
            })}

            {/* Intersection nodes — raised circular rosettes */}
            {vPos.map((vf, vi) =>
                hPos.map((hf, hi) => (
                    <Group key={`gnode-${vi}-${hi}`}>
                        <Circle x={ax + aw * vf} y={ay + ah * hf}
                            radius={2.5}
                            fill={ADDON.veryLight} stroke={ADDON.secondary} strokeWidth={0.6} />
                        <Circle x={ax + aw * vf} y={ay + ah * hf}
                            radius={0.8} fill={ADDON.secondary} />
                    </Group>
                ))
            )}
        </Group>
    );
}

// ─────────────────────────────────────────────
// Addon router
// ─────────────────────────────────────────────
export function AddonOverlay({ addon, ax, ay, aw, ah, isOutside, fanSpec, louverSpec, panelWidthMm }) {
    const acx = ax + aw / 2;
    const acy = ay + ah / 2;

    switch (addon) {
        case 'fan':      return <FanOverlay acx={acx} acy={acy} aw={aw} ah={ah} fanSpec={fanSpec} panelWidthMm={panelWidthMm} />;
        case 'louver':   return <LouverOverlay ax={ax} ay={ay} aw={aw} ah={ah} louverSpec={louverSpec} />;
        case 'georgian': return <GeorgianOverlay ax={ax} ay={ay} aw={aw} ah={ah} />;
        case 'mesh':     return <MeshOverlay ax={ax} ay={ay} aw={aw} ah={ah} />;
        case 'fixed':    return <FixedOverlay ax={ax} ay={ay} aw={aw} ah={ah} />;
        case 'acgrill':  return <AcGrillOverlay ax={ax} ay={ay} aw={aw} ah={ah} />;
        case 'grid':     return <GridOverlay ax={ax} ay={ay} aw={aw} ah={ah} />;
        default:         return null;
    }
}

// ─────────────────────────────────────────────
// Addon label icons (small SVG path icons next to label text)
// ─────────────────────────────────────────────
export const ADDON_ICONS = {
    fan: 'M6,3 A3,3 0 1,1 6,9 A3,3 0 1,1 6,3',
    louver: 'M1,2 L11,1 M1,5 L11,4 M1,8 L11,7 M1,11 L11,10',
    georgian: 'M4,0 L4,12 M8,0 L8,12 M0,4 L12,4 M0,8 L12,8',
    mesh: 'M0,0 L12,0 L12,12 L0,12 Z M3,0 L3,12 M6,0 L6,12 M9,0 L9,12 M0,3 L12,3 M0,6 L12,6 M0,9 L12,9',
    fixed: 'M0,0 L12,12 M12,0 L0,12',
    acgrill: 'M1,3 L11,3 M1,6 L11,6 M1,9 L11,9',
    grid: 'M4,0 L4,12 M8,0 L8,12 M0,4 L12,4 M0,8 L12,8',
};

export const ADDON_COLORS = {
    fan: '#3b82f6',
    louver: '#8b5cf6',
    georgian: '#d97706',
    mesh: '#059669',
    fixed: '#64748b',
    acgrill: '#dc2626',
    grid: '#0891b2',
};

// ─────────────────────────────────────────────
// Main GlassPanel component
// ─────────────────────────────────────────────
export default function GlassPanel({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor }) {
    const displayX = x * scale;
    const displayY = y * scale;
    const displayWidth = width * scale;
    const displayHeight = height * scale;
    const isSelected = selectedPanelId === node.id;
    const isDragOver = dragOverPanelId === node.id;

    const glassInset = GLASS_INSET;
    const gx = displayX + glassInset;
    const gy = displayY + glassInset;
    const gw = displayWidth - glassInset * 2;
    const gh = displayHeight - glassInset * 2;

    const glassStyle = isDragOver ? GLASS_DRAG_OVER : isSelected ? GLASS_SELECTED : GLASS_DEFAULT;

    // Addon area
    const ax = gx + 4;
    const ay = gy + 4;
    const aw = gw - 8;
    const ah = gh - 8;

    // Addon label config
    const addonLabels = { fan: 'FAN', louver: 'LOUVER', georgian: 'GEORGIAN', mesh: 'MESH', fixed: 'FIXED', acgrill: 'AC GRILL', grid: 'GRID' };
    const addonLabel = node.addon ? (addonLabels[node.addon] || node.addon.toUpperCase()) : null;
    const labelW = Math.min(aw, 72);
    const labelH = 18;
    const badgeColor = node.addon ? (ADDON_COLORS[node.addon] || ADDON.secondary) : ADDON.secondary;

    return (
        <Group>
            {/* Frame */}
            <FrameRects x={displayX} y={displayY} width={displayWidth} height={displayHeight} frameColor={frameColor} />

            {/* Glass pane */}
            <Rect x={gx} y={gy} width={gw} height={gh}
                cornerRadius={1}
                fill={glassStyle.fill} stroke={glassStyle.stroke}
                strokeWidth={glassStyle.strokeWidth}
                listening={false} />

            {/* Glass grid overlay */}
            <GlassGrid x={gx} y={gy} width={gw} height={gh} />

            {/* Addon overlay */}
            {node.addon && (
                <AddonOverlay addon={node.addon} ax={ax} ay={ay} aw={aw} ah={ah}
                    isOutside={isOutside} fanSpec={node.fanSpec} louverSpec={node.louverSpec} panelWidthMm={width} />
            )}

            {/* Addon label badge — refined with color accent + icon */}
            {node.addon && addonLabel && (
                <Group listening={false}>
                    {/* Badge background with rounded corners */}
                    <Rect x={ax} y={ay + ah - labelH - 2} width={labelW} height={labelH}
                        cornerRadius={3}
                        fill="rgba(255,255,255,0.92)"
                        stroke={badgeColor} strokeWidth={0.8}
                        shadowColor="rgba(0,0,0,0.1)" shadowBlur={2} shadowOffsetY={1} />
                    {/* Color accent bar on left */}
                    <Rect x={ax} y={ay + ah - labelH - 2} width={3} height={labelH}
                        cornerRadius={[3, 0, 0, 3]}
                        fill={badgeColor} />
                    {/* Small icon */}
                    {ADDON_ICONS[node.addon] && (
                        <Path data={ADDON_ICONS[node.addon]}
                            x={ax + 7} y={ay + ah - labelH + 1}
                            stroke={badgeColor} strokeWidth={0.8}
                            scaleX={isOutside ? -0.9 : 0.9} scaleY={0.9}
                            listening={false}
                        />
                    )}
                    {/* Label text */}
                    <CenteredText
                        x={ax + labelW / 2 + 6} y={ay + ah - labelH / 2 - 2}
                        text={addonLabel} fontSize={8.5} fill={ADDON.primary}
                        fontStyle="700" isOutside={isOutside} />
                </Group>
            )}

            {/* Frame label (F1/F2/...) */}
            {node.frameLabel && (
                <Group listening={false}>
                    <Rect
                        x={gx + gw - 40}
                        y={gy + gh - 30}
                        width={30}
                        height={22}
                        fill="white"
                        stroke="#94a3b8"
                        strokeWidth={1}
                    />
                    <CenteredText
                        x={gx + gw - 25}
                        y={gy + gh - 19}
                        text={node.frameLabel}
                        fontSize={10}
                        fill="#475569"
                        fontStyle="600"
                        isOutside={isOutside}
                    />
                </Group>
            )}

            {/* Corner reference dots */}
            <CornerDots x={displayX} y={displayY} width={displayWidth} height={displayHeight} />

            {/* Panel center marker */}
            <PanelMarker
                x={displayX + displayWidth / 2}
                y={node.addon
                    ? displayY + GLASS_INSET + 24
                    : displayY + displayHeight / 2}
                id={node.id}
                isDragOver={isDragOver}
                isOutside={isOutside}
            />
        </Group>
    );
}
