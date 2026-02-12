'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for 3D View (Three.js doesn't support SSR)
const Window3DView = dynamic(
    () => import('./Window3DView'),
    { ssr: false }
);

const CornerJoint3DInline = dynamic(
    () => import('./CornerJoint3DViewer').then(mod => ({ default: mod.CornerJoint3DInline })),
    { ssr: false }
);

// --- Helper functions for diagonal mullion geometry ---

// Determine which frame edge a normalized point (0-1) is on
function getEdgeFromNormalized(point) {
    const eps = 0.01;
    if (Math.abs(point.y) < eps) return 'top';
    if (Math.abs(point.y - 1) < eps) return 'bottom';
    if (Math.abs(point.x) < eps) return 'left';
    if (Math.abs(point.x - 1) < eps) return 'right';
    return 'none';
}

// Compute polygon 1 (left/bottom side of diagonal) as SVG points string
// The polygon includes the mullion line + glass area corners on one side
function computeDiagonalPolygon1(gx, gy, gw, gh, sp, ep) {
    // Convert normalized to absolute
    const sx = gx + sp.x * gw;
    const sy = gy + sp.y * gh;
    const ex = gx + ep.x * gw;
    const ey = gy + ep.y * gh;

    // Glass corners
    const TL = { x: gx, y: gy };
    const TR = { x: gx + gw, y: gy };
    const BR = { x: gx + gw, y: gy + gh };
    const BL = { x: gx, y: gy + gh };

    const spEdge = getEdgeFromNormalized(sp);
    const epEdge = getEdgeFromNormalized(ep);

    // Build polygon 1: start from start point, go along one side of the frame
    // to end point, close through the mullion line
    // Polygon 1 = "left" side (counterclockwise from start, collecting corners on left side)
    const vertices = [{ x: sx, y: sy }];

    // Traverse corners clockwise from start to end, collecting corners on one side
    const corners = [TL, TR, BR, BL];
    const edges = ['top', 'right', 'bottom', 'left'];
    const edgeCornerMap = { 'top': 0, 'right': 1, 'bottom': 2, 'left': 3 };

    // Find which corners to include between start and end going clockwise
    let startEdgeIdx = edges.indexOf(spEdge);
    let endEdgeIdx = edges.indexOf(epEdge);

    if (startEdgeIdx === -1 || endEdgeIdx === -1) {
        // Fallback for points not on edges
        return `${sx},${sy} ${ex},${ey} ${BL.x},${BL.y}`;
    }

    // Go clockwise from start edge to end edge for polygon 1
    let idx = (startEdgeIdx + 1) % 4;
    while (idx !== (endEdgeIdx + 1) % 4) {
        vertices.push(corners[idx]);
        idx = (idx + 1) % 4;
    }

    vertices.push({ x: ex, y: ey });

    return vertices.map(v => `${v.x},${v.y}`).join(' ');
}

// Compute polygon 2 (right/top side of diagonal)
function computeDiagonalPolygon2(gx, gy, gw, gh, sp, ep) {
    const sx = gx + sp.x * gw;
    const sy = gy + sp.y * gh;
    const ex = gx + ep.x * gw;
    const ey = gy + ep.y * gh;

    const TL = { x: gx, y: gy };
    const TR = { x: gx + gw, y: gy };
    const BR = { x: gx + gw, y: gy + gh };
    const BL = { x: gx, y: gy + gh };

    const spEdge = getEdgeFromNormalized(sp);
    const epEdge = getEdgeFromNormalized(ep);

    const corners = [TL, TR, BR, BL];
    const edges = ['top', 'right', 'bottom', 'left'];

    let startEdgeIdx = edges.indexOf(spEdge);
    let endEdgeIdx = edges.indexOf(epEdge);

    if (startEdgeIdx === -1 || endEdgeIdx === -1) {
        return `${sx},${sy} ${ex},${ey} ${TR.x},${TR.y}`;
    }

    // Go counterclockwise (i.e. reverse clockwise) from end edge to start edge for polygon 2
    const vertices = [{ x: ex, y: ey }];
    let idx = (endEdgeIdx + 1) % 4;
    while (idx !== (startEdgeIdx + 1) % 4) {
        vertices.push(corners[idx]);
        idx = (idx + 1) % 4;
    }
    vertices.push({ x: sx, y: sy });

    return vertices.map(v => `${v.x},${v.y}`).join(' ');
}

// Parse SVG polygon points string into array of {x, y}
function parsePolygonPoints(pointsStr) {
    return pointsStr.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x, y };
    });
}

// Point-in-polygon test using ray casting algorithm
function pointInPolygon(px, py, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Compute centroid of a polygon
function computeCentroid(vertices) {
    if (vertices.length === 0) return { x: 0, y: 0 };
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    return { x: cx, y: cy };
}

// Recursive function to render window structure as SVG
function renderWindowNode(node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path = [], isOutside = false) {
    const elements = [];
    // Frame profile dimensions (realistic multi-layer)
    const outerFrameW = 6;   // Outer frame border width
    const midFrameW = 12;    // Mid frame (the main profile body)
    const innerFrameW = 6;   // Inner frame border
    const totalFrame = outerFrameW + midFrameW + innerFrameW; // 24px total
    const glassInset = totalFrame;

    if (node.type === 'glass') {
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;
        const isSelected = selectedPanelId === node.id;
        const isDragOver = dragOverPanelId === node.id;

        const uniqueId = node.id + '-' + path.join('-');

        // Wireframe style constants
        const frameColor = "#4a5568";
        const frameStrokeWidth = 1.5;

        elements.push(
            <defs key={`defs-${uniqueId}`}>
                <pattern id={`glassGrid-${uniqueId}`} width="15" height="15" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="15" stroke="#c8e6f8" strokeWidth="0.4" />
                    <line x1="0" y1="0" x2="15" y2="0" stroke="#c8e6f8" strokeWidth="0.4" />
                </pattern>
            </defs>
        );

        // --- White fill for frame body (solid white frame area) ---
        elements.push(
            <rect key={`frame-fill-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="white" stroke="none" />
        );

        // --- Wireframe Frame: 3 concentric rectangles (no fill, stroke only) ---
        // Line 1 - outer edge
        elements.push(
            <rect key={`frame-wire1-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        // Line 2 - middle profile
        elements.push(
            <rect key={`frame-wire2-${uniqueId}`}
                x={displayX + 12} y={displayY + 12}
                width={displayWidth - 24} height={displayHeight - 24}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        // Line 3 - inner edge (glass boundary)
        elements.push(
            <rect key={`frame-wire3-${uniqueId}`}
                x={displayX + 24} y={displayY + 24}
                width={displayWidth - 48} height={displayHeight - 48}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );

        // --- Corner mitre lines (connecting outer to inner at each corner) ---
        const mitreLen = totalFrame;
        elements.push(<line key={`mitre-tl-${uniqueId}`} x1={displayX} y1={displayY} x2={displayX + mitreLen} y2={displayY + mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-tr-${uniqueId}`} x1={displayX + displayWidth} y1={displayY} x2={displayX + displayWidth - mitreLen} y2={displayY + mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-bl-${uniqueId}`} x1={displayX} y1={displayY + displayHeight} x2={displayX + mitreLen} y2={displayY + displayHeight - mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-br-${uniqueId}`} x1={displayX + displayWidth} y1={displayY + displayHeight} x2={displayX + displayWidth - mitreLen} y2={displayY + displayHeight - mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);

        // --- Glass Pane ---
        let fillColor = "#d4eefa";
        let strokeColor = "#b0d8f0";
        let fillOpacity = "0.65";
        let strokeWidth = "1";

        if (isDragOver) {
            fillColor = "#86efac";
            strokeColor = "#22c55e";
            fillOpacity = "0.8";
            strokeWidth = "3";
        } else if (isSelected) {
            fillColor = "#a0d4f4";
            strokeColor = "#3b82f6";
            fillOpacity = "0.85";
            strokeWidth = "3";
        }

        // Glass background
        elements.push(
            <rect
                key={`glass-bg-${uniqueId}`}
                x={displayX + glassInset}
                y={displayY + glassInset}
                width={displayWidth - glassInset * 2}
                height={displayHeight - glassInset * 2}
                rx={1}
                ry={1}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fillOpacity={fillOpacity}
                style={{ pointerEvents: 'none' }}
                data-panel-id={node.id}
            />
        );

        // Glass grid overlay
        elements.push(
            <rect
                key={`glass-grid-${uniqueId}`}
                x={displayX + glassInset}
                y={displayY + glassInset}
                width={displayWidth - glassInset * 2}
                height={displayHeight - glassInset * 2}
                rx={1}
                ry={1}
                fill={`url(#glassGrid-${uniqueId})`}
                fillOpacity="0.5"
                stroke="none"
                style={{ pointerEvents: 'none' }}
            />
        );

        // --- Corner reference dots (small red marks at extreme corners) ---
        const dotR = 1.5;
        const dotColor = "#ef4444";
        [[displayX, displayY], [displayX + displayWidth, displayY], [displayX, displayY + displayHeight], [displayX + displayWidth, displayY + displayHeight]].forEach(([cx, cy], i) => {
            elements.push(<circle key={`corner-dot-${uniqueId}-${i}`} cx={cx} cy={cy} r={dotR} fill={dotColor} opacity="0.6" />);
        });

        // --- Center marker (panel number) ---
        const markerCX = displayX + displayWidth / 2;
        const markerCY = displayY + displayHeight / 2;
        elements.push(
            <g key={`marker-${uniqueId}`} transform={`translate(${markerCX}, ${markerCY})`}>
                <circle cx="0" cy="0" r="14" fill="#fff" stroke={isDragOver ? "#22c55e" : "#94a3b8"} strokeWidth={isDragOver ? "2" : "1"} />
                <g transform={isOutside ? `scale(-1, 1)` : undefined}>
                    <text x="0" y="4.5" textAnchor="middle" fontSize="11" fill={isDragOver ? "#22c55e" : "#64748b"} fontWeight="600" fontFamily="Inter, sans-serif">{node.id}</text>
                </g>
                {/* Small crosshair */}
                <line x1="-8" y1="14" x2="8" y2="14" stroke="#94a3b8" strokeWidth="0.5" />
                <line x1="0" y1="15" x2="0" y2="26" stroke="#94a3b8" strokeWidth="0.5" />
            </g>
        );

        // Store panel bounds for hit testing
        elements.panelBounds = {
            id: node.id,
            path: [...path, node.id],
            x: displayX + glassInset,
            y: displayY + glassInset,
            width: displayWidth - glassInset * 2,
            height: displayHeight - glassInset * 2
        };

    } else if (node.type === 'split-vertical') {
        const childWidths = node.ratios.map(r => width * r);
        let currentX = x;
        const allBounds = [];

        node.children.forEach((child, i) => {
            const childPath = [...path, i];
            const childElements = renderWindowNode(child, currentX, y, childWidths[i], height, scale, selectedPanelId, dragOverPanelId, childPath, isOutside);
            elements.push(...childElements);
            if (childElements.panelBounds) {
                if (Array.isArray(childElements.panelBounds)) {
                    allBounds.push(...childElements.panelBounds);
                } else {
                    allBounds.push(childElements.panelBounds);
                }
            }
            currentX += childWidths[i];
        });

        // Draw mullions between children
        currentX = x + childWidths[0];
        for (let i = 1; i < node.children.length; i++) {
            const mullionX = currentX * scale;
            elements.push(
                <g key={`mullion-v-${i}-${path.join('-')}`}>
                    <rect
                        x={mullionX - 2}
                        y={y * scale}
                        width="4"
                        height={height * scale}
                        fill="#64748b"
                    />
                    <g transform={isOutside ? `translate(${mullionX}, 0) scale(-1, 1) translate(${-mullionX}, 0)` : undefined}>
                        <text
                            x={mullionX}
                            y={y * scale + 20}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#fff"
                            fontWeight="600"
                        >
                            M{i}
                        </text>
                    </g>
                </g>
            );
            currentX += childWidths[i];
        }

        elements.panelBounds = allBounds;

    } else if (node.type === 'split-diagonal') {
        // Custom diagonal mullion rendering
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;

        const glassInset = 24; // Must match totalFrame
        const gx = displayX + glassInset;
        const gy = displayY + glassInset;
        const gw = displayWidth - glassInset * 2;
        const gh = displayHeight - glassInset * 2;

        // Compute actual SVG line endpoints from normalized coords
        const sp = node.startPoint;
        const ep = node.endPoint;
        const lineX1 = gx + sp.x * gw;
        const lineY1 = gy + sp.y * gh;
        const lineX2 = gx + ep.x * gw;
        const lineY2 = gy + ep.y * gh;

        const uniqueId = (node.children[0]?.id || 'diag') + '-' + path.join('-');

        // --- Calculate mullion geometry first (needed for clipping) ---
        const dxM = lineX2 - lineX1;
        const dyM = lineY2 - lineY1;

        // Extend the mullion to the middle frame line (between line 2 and line 3)
        // The glass edge is at offset 24 (line 3), we extend to offset 12 (line 2) = 12px depth
        const extendDepth = 12;
        const len = Math.sqrt(dxM * dxM + dyM * dyM);
        const dirX = dxM / len;
        const dirY = dyM / len;

        // Compute extension along mullion direction for each endpoint based on frame edge
        const getExtendDist = (edge) => {
            if (edge === 'left' || edge === 'right') {
                return Math.abs(extendDepth / dirX); // horizontal depth
            } else if (edge === 'top' || edge === 'bottom') {
                return Math.abs(extendDepth / dirY); // vertical depth
            }
            return extendDepth;
        };

        const spEdgeTemp = getEdgeFromNormalized(sp);
        const epEdgeTemp = getEdgeFromNormalized(ep);
        const extendDist1 = getExtendDist(spEdgeTemp);
        const extendDist2 = getExtendDist(epEdgeTemp);

        const extendedX1 = lineX1 - dirX * extendDist1;
        const extendedY1 = lineY1 - dirY * extendDist1;
        const extendedX2 = lineX2 + dirX * extendDist2;
        const extendedY2 = lineY2 + dirY * extendDist2;
        // Determine which edges the mullion intersects (used throughout)
        const spEdge = getEdgeFromNormalized(sp);
        const epEdge = getEdgeFromNormalized(ep);

        // Wireframe style constants
        const frameColor = "#4a5568";
        const frameStrokeWidth = 1.5;

        elements.push(
            <defs key={`defs-diag-${uniqueId}`}>
                <pattern id={`glassGrid-diag-${uniqueId}`} width="15" height="15" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="15" stroke="#c8e6f8" strokeWidth="0.4" />
                    <line x1="0" y1="0" x2="15" y2="0" stroke="#c8e6f8" strokeWidth="0.4" />
                </pattern>
            </defs>
        );

        // --- White fill for frame body ---
        elements.push(
            <rect key={`frame-fill-diag-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="white" stroke="none" />
        );

        // --- Wireframe Frame: 3 concentric rectangles (no fill, stroke only) ---
        // Line 1 - outer edge
        elements.push(
            <rect key={`frame-wire1-diag-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        // Line 2 - middle profile
        elements.push(
            <rect key={`frame-wire2-diag-${uniqueId}`}
                x={displayX + 12} y={displayY + 12}
                width={displayWidth - 24} height={displayHeight - 24}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        // Line 3 - inner edge (glass boundary)
        elements.push(
            <rect key={`frame-wire3-diag-${uniqueId}`}
                x={displayX + 24} y={displayY + 24}
                width={displayWidth - 48} height={displayHeight - 48}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );

        // Corner mitre lines (connecting outer to inner at each corner)
        const mitreLenD = glassInset;
        elements.push(<line key={`mitre-tl-diag-${uniqueId}`} x1={displayX} y1={displayY} x2={displayX + mitreLenD} y2={displayY + mitreLenD} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-tr-diag-${uniqueId}`} x1={displayX + displayWidth} y1={displayY} x2={displayX + displayWidth - mitreLenD} y2={displayY + mitreLenD} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-bl-diag-${uniqueId}`} x1={displayX} y1={displayY + displayHeight} x2={displayX + mitreLenD} y2={displayY + displayHeight - mitreLenD} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-br-diag-${uniqueId}`} x1={displayX + displayWidth} y1={displayY + displayHeight} x2={displayX + displayWidth - mitreLenD} y2={displayY + displayHeight - mitreLenD} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);

        // Compute polygon vertices for two panes
        const poly1 = computeDiagonalPolygon1(gx, gy, gw, gh, sp, ep);
        const poly2 = computeDiagonalPolygon2(gx, gy, gw, gh, sp, ep);

        // --- Glass pane 1 ---
        const child1 = node.children[0];
        const isSelected1 = selectedPanelId === child1.id;
        const isDragOver1 = dragOverPanelId === child1.id;
        elements.push(
            <polygon
                key={`glass1-diag-${uniqueId}`}
                points={poly1}
                fill={isDragOver1 ? "#86efac" : isSelected1 ? "#a0d4f4" : "#d4eefa"}
                stroke={isDragOver1 ? "#22c55e" : isSelected1 ? "#3b82f6" : "#b0d8f0"}
                strokeWidth={isDragOver1 || isSelected1 ? "3" : "1"}
                fillOpacity={isDragOver1 ? "0.8" : isSelected1 ? "0.85" : "0.65"}
                style={{ pointerEvents: 'none' }}
            />
        );
        elements.push(
            <polygon
                key={`glassgrid1-diag-${uniqueId}`}
                points={poly1}
                fill={`url(#glassGrid-diag-${uniqueId})`}
                fillOpacity="0.5"
                stroke="none"
                style={{ pointerEvents: 'none' }}
            />
        );

        // --- Glass pane 2 ---
        const child2 = node.children[1];
        const isSelected2 = selectedPanelId === child2.id;
        const isDragOver2 = dragOverPanelId === child2.id;
        elements.push(
            <polygon
                key={`glass2-diag-${uniqueId}`}
                points={poly2}
                fill={isDragOver2 ? "#86efac" : isSelected2 ? "#a0d4f4" : "#d4eefa"}
                stroke={isDragOver2 ? "#22c55e" : isSelected2 ? "#3b82f6" : "#b0d8f0"}
                strokeWidth={isDragOver2 || isSelected2 ? "3" : "1"}
                fillOpacity={isDragOver2 ? "0.8" : isSelected2 ? "0.85" : "0.65"}
                style={{ pointerEvents: 'none' }}
            />
        );
        elements.push(
            <polygon
                key={`glassgrid2-diag-${uniqueId}`}
                points={poly2}
                fill={`url(#glassGrid-diag-${uniqueId})`}
                fillOpacity="0.5"
                stroke="none"
                style={{ pointerEvents: 'none' }}
            />
        );

        // --- Diagonal Mullion: 3D profile connecting between frame lines 2 and 3 ---
        const perpXM = -dyM / len; // perpendicular unit vector X
        const perpYM = dxM / len;  // perpendicular unit vector Y

        // White-filled polygon (solid bar body, width matches frame gap)
        const mullionHalfW = 6; // half width = 6px (total 12px, fits between frame lines 2 & 3)
        const barP1x = extendedX1 + perpXM * (-mullionHalfW);
        const barP1y = extendedY1 + perpYM * (-mullionHalfW);
        const barP2x = extendedX2 + perpXM * (-mullionHalfW);
        const barP2y = extendedY2 + perpYM * (-mullionHalfW);
        const barP3x = extendedX2 + perpXM * mullionHalfW;
        const barP3y = extendedY2 + perpYM * mullionHalfW;
        const barP4x = extendedX1 + perpXM * mullionHalfW;
        const barP4y = extendedY1 + perpYM * mullionHalfW;

        elements.push(
            <polygon key={`mullion-fill-${uniqueId}`}
                points={`${barP1x},${barP1y} ${barP2x},${barP2y} ${barP3x},${barP3y} ${barP4x},${barP4y}`}
                fill="white" stroke="none" />
        );

        // 4 profile lines equally spaced within 12px width (4px gap between each)
        // Line 1 aligns with frame line 2, Line 4 aligns with frame line 3
        const mullionOffsets = [-6, -2, 2, 6];
        mullionOffsets.forEach((offset, i) => {
            const ox = perpXM * offset;
            const oy = perpYM * offset;
            elements.push(
                <line key={`mullion-wire-${i}-${uniqueId}`}
                    x1={extendedX1 + ox} y1={extendedY1 + oy}
                    x2={extendedX2 + ox} y2={extendedY2 + oy}
                    stroke={frameColor} strokeWidth={frameStrokeWidth} />
            );
        });

        // --- 3D Connection Lines: Line 1 and Line 4 extensions at endpoints ---
        // At each endpoint where the diagonal meets the frame, the outermost (line 1)
        // and innermost (line 4) mullion lines extend along the frame edge direction,
        // creating a 3D profile joint effect (like in the reference image).
        const line1Off = mullionOffsets[0]; // -6 (outermost)
        const line4Off = mullionOffsets[3]; // +6 (innermost)

        // Endpoints of line 1 and line 4 at the start and end of the mullion
        const line1StartPt = {
            x: extendedX1 + perpXM * line1Off,
            y: extendedY1 + perpYM * line1Off
        };
        const line4StartPt = {
            x: extendedX1 + perpXM * line4Off,
            y: extendedY1 + perpYM * line4Off
        };
        const line1EndPt = {
            x: extendedX2 + perpXM * line1Off,
            y: extendedY2 + perpYM * line1Off
        };
        const line4EndPt = {
            x: extendedX2 + perpXM * line4Off,
            y: extendedY2 + perpYM * line4Off
        };

        // Cap direction: extends along the frame edge, away from the diagonal's entry
        // At start: opposite to mullion direction projected onto frame edge
        // At end: same as mullion direction projected onto frame edge
        const getCapDirection = (edge, isStart) => {
            const mx = isStart ? -dirX : dirX;
            const my = isStart ? -dirY : dirY;
            if (edge === 'left' || edge === 'right') {
                return { x: 0, y: my >= 0 ? 1 : -1 };
            } else {
                return { x: mx >= 0 ? 1 : -1, y: 0 };
            }
        };

        const capLength = 14; // Length of the extension along frame edge

        // Start endpoint: line 1 and line 4 extend along the frame edge
        if (spEdge !== 'none') {
            const capDirS = getCapDirection(spEdge, true);
            // Line 1 (outer) extension along frame edge
            elements.push(
                <line key={`conn-l1-start-${uniqueId}`}
                    x1={line1StartPt.x} y1={line1StartPt.y}
                    x2={line1StartPt.x + capDirS.x * capLength}
                    y2={line1StartPt.y + capDirS.y * capLength}
                    stroke={frameColor} strokeWidth={frameStrokeWidth} />
            );
            // Line 4 (inner) extension along frame edge
            elements.push(
                <line key={`conn-l4-start-${uniqueId}`}
                    x1={line4StartPt.x} y1={line4StartPt.y}
                    x2={line4StartPt.x + capDirS.x * capLength}
                    y2={line4StartPt.y + capDirS.y * capLength}
                    stroke={frameColor} strokeWidth={frameStrokeWidth} />
            );
        }

        // End endpoint: line 1 and line 4 extend along the frame edge
        if (epEdge !== 'none') {
            const capDirE = getCapDirection(epEdge, false);
            // Line 1 (outer) extension along frame edge
            elements.push(
                <line key={`conn-l1-end-${uniqueId}`}
                    x1={line1EndPt.x} y1={line1EndPt.y}
                    x2={line1EndPt.x + capDirE.x * capLength}
                    y2={line1EndPt.y + capDirE.y * capLength}
                    stroke={frameColor} strokeWidth={frameStrokeWidth} />
            );
            // Line 4 (inner) extension along frame edge
            elements.push(
                <line key={`conn-l4-end-${uniqueId}`}
                    x1={line4EndPt.x} y1={line4EndPt.y}
                    x2={line4EndPt.x + capDirE.x * capLength}
                    y2={line4EndPt.y + capDirE.y * capLength}
                    stroke={frameColor} strokeWidth={frameStrokeWidth} />
            );
        }

        // --- Mullion Label (T1) ---
        const midXD = (lineX1 + lineX2) / 2;
        const midYD = (lineY1 + lineY2) / 2;
        elements.push(
            <g key={`mullion-label-diag-${uniqueId}`}>
                <rect x={midXD - 10} y={midYD - 8} width="20" height="16" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.5" />
                <g transform={isOutside ? `translate(${midXD}, 0) scale(-1, 1) translate(${-midXD}, 0)` : undefined}>
                    <text x={midXD} y={midYD + 4} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600" fontFamily="Inter, sans-serif">T1</text>
                </g>
            </g>
        );

        // --- Angle Annotations ---
        const angleRadD = Math.atan2(Math.abs(dyM), Math.abs(dxM));
        const angleDegD = Math.round((angleRadD * 180) / Math.PI);
        const complementDegD = 90 - angleDegD;

        // Render angle arc helper
        const arcRadius = 18;
        const renderAngleArc = (cx, cy, startAngleDeg, sweepDeg, label, key) => {
            const startR = (startAngleDeg * Math.PI) / 180;
            const endR = ((startAngleDeg + sweepDeg) * Math.PI) / 180;
            const x1A = cx + arcRadius * Math.cos(startR);
            const y1A = cy + arcRadius * Math.sin(startR);
            const x2A = cx + arcRadius * Math.cos(endR);
            const y2A = cy + arcRadius * Math.sin(endR);
            const largeArcF = Math.abs(sweepDeg) > 180 ? 1 : 0;
            const sweepF = sweepDeg > 0 ? 1 : 0;
            const midR = ((startAngleDeg + sweepDeg / 2) * Math.PI) / 180;
            const labelXA = cx + (arcRadius + 10) * Math.cos(midR);
            const labelYA = cy + (arcRadius + 10) * Math.sin(midR);

            return (
                <g key={key}>
                    <path
                        d={`M ${x1A} ${y1A} A ${arcRadius} ${arcRadius} 0 ${largeArcF} ${sweepF} ${x2A} ${y2A}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="0.8"
                    />
                    <g transform={isOutside ? `translate(${labelXA}, 0) scale(-1, 1) translate(${-labelXA}, 0)` : undefined}>
                        <text x={labelXA} y={labelYA + 3} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="500">{label}°</text>
                    </g>
                </g>
            );
        };

        // Compute frame-edge angles at both endpoints
        // (spEdge and epEdge already calculated above)

        // Compute angles relative to each frame edge
        const computeEdgeAngle = (edge, x1, y1, x2, y2) => {
            const adx = x2 - x1;
            const ady = y2 - y1;
            if (edge === 'top') {
                // Angle from horizontal (top edge goes right: 0°)
                return Math.round(Math.abs(Math.atan2(ady, adx)) * 180 / Math.PI);
            } else if (edge === 'bottom') {
                return Math.round(Math.abs(Math.atan2(-ady, -adx)) * 180 / Math.PI);
            } else if (edge === 'left') {
                // Angle from vertical (left edge goes down: 90°)
                return Math.round(Math.abs(Math.atan2(adx, ady)) * 180 / Math.PI);
            } else if (edge === 'right') {
                return Math.round(Math.abs(Math.atan2(-adx, -ady)) * 180 / Math.PI);
            }
            return 0;
        };

        // Angle at start point
        if (spEdge !== 'none') {
            const angle1 = computeEdgeAngle(spEdge, lineX1, lineY1, lineX2, lineY2);
            const comp1 = 90 - angle1;
            // Draw both the angle and complement at start
            const isHoriz = (spEdge === 'top' || spEdge === 'bottom');
            const baseAngle = spEdge === 'top' ? 0 : spEdge === 'bottom' ? 180 : spEdge === 'left' ? 90 : -90;
            const lineDir = Math.atan2(lineY2 - lineY1, lineX2 - lineX1) * 180 / Math.PI;

            elements.push(renderAngleArc(lineX1, lineY1, baseAngle, lineDir - baseAngle, angle1, `angle-s1-${uniqueId}`));
            if (comp1 > 0 && comp1 < 90) {
                elements.push(renderAngleArc(lineX1, lineY1, lineDir, (isHoriz ? 90 : 0) - lineDir + (spEdge === 'bottom' || spEdge === 'right' ? 180 : 0), comp1, `angle-s2-${uniqueId}`));
            }
        }

        // Angle at end point
        if (epEdge !== 'none') {
            const angle2 = computeEdgeAngle(epEdge, lineX2, lineY2, lineX1, lineY1);
            const comp2 = 90 - angle2;
            const baseAngle2 = epEdge === 'top' ? 0 : epEdge === 'bottom' ? 180 : epEdge === 'left' ? 90 : -90;
            const lineDir2 = Math.atan2(lineY1 - lineY2, lineX1 - lineX2) * 180 / Math.PI;

            elements.push(renderAngleArc(lineX2, lineY2, baseAngle2, lineDir2 - baseAngle2, angle2, `angle-e1-${uniqueId}`));
        }

        // --- Panel center markers ---
        const poly1Vertices = parsePolygonPoints(poly1);
        const centroid1 = computeCentroid(poly1Vertices);
        elements.push(
            <g key={`marker-diag-1-${uniqueId}`} transform={`translate(${centroid1.x}, ${centroid1.y})`}>
                <circle cx="0" cy="0" r="14" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                <g transform={isOutside ? `scale(-1, 1)` : undefined}>
                    <text x="0" y="4.5" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600" fontFamily="Inter, sans-serif">{child1.id}</text>
                </g>
                <line x1="-8" y1="14" x2="8" y2="14" stroke="#94a3b8" strokeWidth="0.5" />
                <line x1="0" y1="15" x2="0" y2="26" stroke="#94a3b8" strokeWidth="0.5" />
            </g>
        );

        const poly2Vertices = parsePolygonPoints(poly2);
        const centroid2 = computeCentroid(poly2Vertices);
        elements.push(
            <g key={`marker-diag-2-${uniqueId}`} transform={`translate(${centroid2.x}, ${centroid2.y})`}>
                <circle cx="0" cy="0" r="14" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                <g transform={isOutside ? `scale(-1, 1)` : undefined}>
                    <text x="0" y="4.5" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600" fontFamily="Inter, sans-serif">{child2.id}</text>
                </g>
                <line x1="-8" y1="14" x2="8" y2="14" stroke="#94a3b8" strokeWidth="0.5" />
                <line x1="0" y1="15" x2="0" y2="26" stroke="#94a3b8" strokeWidth="0.5" />
            </g>
        );

        // Corner reference dots
        const dotRD = 1.5;
        [[displayX, displayY], [displayX + displayWidth, displayY], [displayX, displayY + displayHeight], [displayX + displayWidth, displayY + displayHeight]].forEach(([cx, cy], i) => {
            elements.push(<circle key={`corner-dot-diag-${uniqueId}-${i}`} cx={cx} cy={cy} r={dotRD} fill="#ef4444" opacity="0.6" />);
        });

        // Store panel bounds for hit testing
        elements.panelBounds = [
            {
                id: child1.id,
                path: [...path, 0, child1.id],
                x: gx, y: gy, width: gw, height: gh,
                shape: 'polygon',
                vertices: poly1Vertices
            },
            {
                id: child2.id,
                path: [...path, 1, child2.id],
                x: gx, y: gy, width: gw, height: gh,
                shape: 'polygon',
                vertices: poly2Vertices
            }
        ];

    } else if (node.type === 'sliding') {
        // --- Sliding Window Rendering ---
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;

        const frameColor = "#4a5568";
        const frameStrokeWidth = 1.5;
        const sashFrameColor = "#5a6577";
        const outerFrameTotal = 24; // matches totalFrame
        const sashFrameTotal = 16; // sash profile depth

        const uniqueId = 'sliding-' + path.join('-');

        // --- Defs for glass grid ---
        elements.push(
            <defs key={`defs-sliding-${uniqueId}`}>
                <pattern id={`glassGrid-sliding-${uniqueId}`} width="15" height="15" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="15" stroke="#c8e6f8" strokeWidth="0.4" />
                    <line x1="0" y1="0" x2="15" y2="0" stroke="#c8e6f8" strokeWidth="0.4" />
                </pattern>
                <linearGradient id={`sashGrad-${uniqueId}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#b0b8c4" />
                    <stop offset="50%" stopColor="#d4dae2" />
                    <stop offset="100%" stopColor="#a0a8b4" />
                </linearGradient>
            </defs>
        );

        // --- White fill for outer frame body ---
        elements.push(
            <rect key={`frame-fill-sliding-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="white" stroke="none" />
        );

        // --- Outer Frame: 3 concentric rectangles ---
        elements.push(
            <rect key={`frame-wire1-sliding-${uniqueId}`}
                x={displayX} y={displayY}
                width={displayWidth} height={displayHeight}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        elements.push(
            <rect key={`frame-wire2-sliding-${uniqueId}`}
                x={displayX + 12} y={displayY + 12}
                width={displayWidth - 24} height={displayHeight - 24}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );
        elements.push(
            <rect key={`frame-wire3-sliding-${uniqueId}`}
                x={displayX + 24} y={displayY + 24}
                width={displayWidth - 48} height={displayHeight - 48}
                fill="none" stroke={frameColor} strokeWidth={frameStrokeWidth} />
        );

        // --- Corner mitre lines ---
        const mitreLen = outerFrameTotal;
        elements.push(<line key={`mitre-tl-sliding-${uniqueId}`} x1={displayX} y1={displayY} x2={displayX + mitreLen} y2={displayY + mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-tr-sliding-${uniqueId}`} x1={displayX + displayWidth} y1={displayY} x2={displayX + displayWidth - mitreLen} y2={displayY + mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-bl-sliding-${uniqueId}`} x1={displayX} y1={displayY + displayHeight} x2={displayX + mitreLen} y2={displayY + displayHeight - mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);
        elements.push(<line key={`mitre-br-sliding-${uniqueId}`} x1={displayX + displayWidth} y1={displayY + displayHeight} x2={displayX + displayWidth - mitreLen} y2={displayY + displayHeight - mitreLen} stroke={frameColor} strokeWidth={frameStrokeWidth * 0.7} />);

        // --- Corner reference dots ---
        [[displayX, displayY], [displayX + displayWidth, displayY], [displayX, displayY + displayHeight], [displayX + displayWidth, displayY + displayHeight]].forEach(([cx, cy], i) => {
            elements.push(<circle key={`corner-dot-sliding-${uniqueId}-${i}`} cx={cx} cy={cy} r={1.5} fill="#ef4444" opacity="0.6" />);
        });

        // --- Per-Sash (Panel) Rendering ---
        const glassAreaX = displayX + outerFrameTotal;
        const glassAreaY = displayY + outerFrameTotal;
        const glassAreaW = displayWidth - outerFrameTotal * 2;
        const glassAreaH = displayHeight - outerFrameTotal * 2;
        const sashGap = 2; // gap between sashes for the interlock

        const childWidths = node.ratios.map(r => glassAreaW * r);
        let currentSashX = glassAreaX;
        const allBounds = [];

        node.children.forEach((child, i) => {
            const sashW = childWidths[i] - sashGap;
            const sashX = currentSashX + (i > 0 ? sashGap / 2 : 0);
            const sashY = glassAreaY;
            const sashH = glassAreaH;
            const isSelected = selectedPanelId === child.id;
            const isDragOver = dragOverPanelId === child.id;

            const sashUniqueId = `${uniqueId}-sash-${i}`;

            // --- Sash frame fill (3D gradient between lines) ---
            elements.push(
                <rect key={`sash-fill-${sashUniqueId}`}
                    x={sashX} y={sashY}
                    width={sashW} height={sashH}
                    fill={`url(#sashGrad-${uniqueId})`} stroke="none" />
            );

            // --- Sash frame: 3 concentric rectangles ---
            elements.push(
                <rect key={`sash-wire1-${sashUniqueId}`}
                    x={sashX} y={sashY}
                    width={sashW} height={sashH}
                    fill="none" stroke={sashFrameColor} strokeWidth={frameStrokeWidth * 1.2} />
            );
            elements.push(
                <rect key={`sash-wire2-${sashUniqueId}`}
                    x={sashX + 5} y={sashY + 5}
                    width={sashW - 10} height={sashH - 10}
                    fill="none" stroke={sashFrameColor} strokeWidth={frameStrokeWidth} />
            );
            elements.push(
                <rect key={`sash-wire3-${sashUniqueId}`}
                    x={sashX + 10} y={sashY + 10}
                    width={sashW - 20} height={sashH - 20}
                    fill="none" stroke={sashFrameColor} strokeWidth={frameStrokeWidth} />
            );

            // --- Sash corner mitres ---
            const sm = 10;
            elements.push(<line key={`sash-mitre-tl-${sashUniqueId}`} x1={sashX} y1={sashY} x2={sashX + sm} y2={sashY + sm} stroke={sashFrameColor} strokeWidth={frameStrokeWidth * 0.6} />);
            elements.push(<line key={`sash-mitre-tr-${sashUniqueId}`} x1={sashX + sashW} y1={sashY} x2={sashX + sashW - sm} y2={sashY + sm} stroke={sashFrameColor} strokeWidth={frameStrokeWidth * 0.6} />);
            elements.push(<line key={`sash-mitre-bl-${sashUniqueId}`} x1={sashX} y1={sashY + sashH} x2={sashX + sm} y2={sashY + sashH - sm} stroke={sashFrameColor} strokeWidth={frameStrokeWidth * 0.6} />);
            elements.push(<line key={`sash-mitre-br-${sashUniqueId}`} x1={sashX + sashW} y1={sashY + sashH} x2={sashX + sashW - sm} y2={sashY + sashH - sm} stroke={sashFrameColor} strokeWidth={frameStrokeWidth * 0.6} />);

            // --- Glass pane inside sash ---
            const glassX = sashX + sashFrameTotal;
            const glassY = sashY + sashFrameTotal;
            const glassW = sashW - sashFrameTotal * 2;
            const glassH = sashH - sashFrameTotal * 2;

            let fillColor = "#d4eefa";
            let strokeColor = "#b0d8f0";
            let fillOpacity = "0.65";
            let strokeWidth = "1";

            if (isDragOver) {
                fillColor = "#86efac"; strokeColor = "#22c55e"; fillOpacity = "0.8"; strokeWidth = "3";
            } else if (isSelected) {
                fillColor = "#a0d4f4"; strokeColor = "#3b82f6"; fillOpacity = "0.85"; strokeWidth = "3";
            }

            elements.push(
                <rect key={`glass-bg-${sashUniqueId}`}
                    x={glassX} y={glassY}
                    width={glassW} height={glassH}
                    rx={1} ry={1}
                    fill={fillColor} stroke={strokeColor}
                    strokeWidth={strokeWidth} fillOpacity={fillOpacity}
                    style={{ pointerEvents: 'none' }}
                    data-panel-id={child.id} />
            );
            elements.push(
                <rect key={`glass-grid-${sashUniqueId}`}
                    x={glassX} y={glassY}
                    width={glassW} height={glassH}
                    rx={1} ry={1}
                    fill={`url(#glassGrid-sliding-${uniqueId})`} fillOpacity="0.5"
                    stroke="none" style={{ pointerEvents: 'none' }} />
            );

            // --- Direction Arrow ---
            const arrowCX = sashX + sashW / 2;
            const arrowCY = sashY + sashH / 2 + 10;
            if (child.sashDirection === 'right') {
                elements.push(
                    <g key={`arrow-${sashUniqueId}`}>
                        <line x1={arrowCX - 18} y1={arrowCY} x2={arrowCX + 14} y2={arrowCY} stroke="#475569" strokeWidth="2.5" />
                        <polygon points={`${arrowCX + 14},${arrowCY - 5} ${arrowCX + 22},${arrowCY} ${arrowCX + 14},${arrowCY + 5}`} fill="#475569" />
                    </g>
                );
            } else if (child.sashDirection === 'left') {
                elements.push(
                    <g key={`arrow-${sashUniqueId}`}>
                        <line x1={arrowCX - 14} y1={arrowCY} x2={arrowCX + 18} y2={arrowCY} stroke="#475569" strokeWidth="2.5" />
                        <polygon points={`${arrowCX - 14},${arrowCY - 5} ${arrowCX - 22},${arrowCY} ${arrowCX - 14},${arrowCY + 5}`} fill="#475569" />
                    </g>
                );
            } else if (child.sashDirection === 'fixed') {
                // Plus sign for fixed panel
                elements.push(
                    <g key={`arrow-${sashUniqueId}`}>
                        <line x1={arrowCX - 8} y1={arrowCY} x2={arrowCX + 8} y2={arrowCY} stroke="#475569" strokeWidth="2.5" />
                        <line x1={arrowCX} y1={arrowCY - 8} x2={arrowCX} y2={arrowCY + 8} stroke="#475569" strokeWidth="2.5" />
                    </g>
                );
            } else if (child.sashDirection === 'both') {
                // Bidirectional arrow
                elements.push(
                    <g key={`arrow-${sashUniqueId}`}>
                        <line x1={arrowCX - 14} y1={arrowCY} x2={arrowCX + 14} y2={arrowCY} stroke="#475569" strokeWidth="2.5" />
                        <polygon points={`${arrowCX + 14},${arrowCY - 5} ${arrowCX + 22},${arrowCY} ${arrowCX + 14},${arrowCY + 5}`} fill="#475569" />
                        <polygon points={`${arrowCX - 14},${arrowCY - 5} ${arrowCX - 22},${arrowCY} ${arrowCX - 14},${arrowCY + 5}`} fill="#475569" />
                    </g>
                );
            }

            // --- Sash Label (S1, S2...) at top ---
            const sashLabelX = sashX + sashW / 2;
            const sashLabelY = sashY + 20;
            elements.push(
                <g key={`sash-label-${sashUniqueId}`}>
                    <rect x={sashLabelX - 12} y={sashLabelY - 10} width="24" height="16" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.5" />
                    <g transform={isOutside ? `translate(${sashLabelX}, 0) scale(-1, 1) translate(${-sashLabelX}, 0)` : undefined}>
                        <text x={sashLabelX} y={sashLabelY + 2} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="600" fontFamily="Inter, sans-serif">
                            {child.sashLabel || `S${i + 1}`}
                        </text>
                    </g>
                </g>
            );

            // --- Handle/Lock indicator ---
            const handleSide = child.sashDirection === 'right' ? 'right' : 'left';
            const handleX = handleSide === 'right' ? sashX + sashW - 4 : sashX + 2;
            const handleY = sashY + sashH / 2 - 8;
            elements.push(
                <rect key={`handle-${sashUniqueId}`}
                    x={handleX} y={handleY}
                    width="3" height="16" rx="1"
                    fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />
            );

            // --- GHH Label ---
            const ghhLabelX = sashX + sashW / 2;
            const ghhLabelY = sashY + sashH - 30;
            elements.push(
                <g key={`ghh-${sashUniqueId}`}>
                    <rect x={ghhLabelX - 28} y={ghhLabelY - 8} width="56" height="16" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.5" />
                    <g transform={isOutside ? `translate(${ghhLabelX}, 0) scale(-1, 1) translate(${-ghhLabelX}, 0)` : undefined}>
                        <text x={ghhLabelX} y={ghhLabelY + 4} textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="500" fontFamily="Inter, sans-serif">
                            GHH = 720
                        </text>
                    </g>
                </g>
            );

            // --- Panel Center Marker (number) ---
            const markerCX = sashX + sashW / 2;
            const markerCY = sashY + sashH / 2 - 15;
            elements.push(
                <g key={`marker-sliding-${sashUniqueId}`} transform={`translate(${markerCX}, ${markerCY})`}>
                    <circle cx="0" cy="0" r="14" fill="#fff" stroke={isDragOver ? "#22c55e" : "#94a3b8"} strokeWidth={isDragOver ? "2" : "1"} />
                    <g transform={isOutside ? `scale(-1, 1)` : undefined}>
                        <text x="0" y="4.5" textAnchor="middle" fontSize="11" fill={isDragOver ? "#22c55e" : "#64748b"} fontWeight="600" fontFamily="Inter, sans-serif">{child.id}</text>
                    </g>
                    <line x1="-8" y1="14" x2="8" y2="14" stroke="#94a3b8" strokeWidth="0.5" />
                    <line x1="0" y1="15" x2="0" y2="26" stroke="#94a3b8" strokeWidth="0.5" />
                </g>
            );

            // Store panel bounds
            allBounds.push({
                id: child.id,
                path: [...path, i, child.id],
                x: glassX,
                y: glassY,
                width: glassW,
                height: glassH,
            });

            currentSashX += childWidths[i];
        });

        // --- F1 Label ---
        const f1X = displayX + displayWidth - 30;
        const f1Y = displayY + displayHeight - 30;
        elements.push(
            <g key={`f1-label-sliding-${uniqueId}`} transform={isOutside
                ? `translate(${displayX + 30}, ${f1Y})`
                : `translate(${f1X}, ${f1Y})`
            }>
                <rect x="-10" y="-15" width="25" height="20" fill="white" stroke="#94a3b8" />
                <text x="2" y="-1" textAnchor="middle" fontSize="12" fill="#64748b">F1</text>
            </g>
        );

        // --- TN Label ---
        const tnX = displayX + displayWidth + 8;
        const tnY = displayY + displayHeight - 10;
        elements.push(
            <g key={`tn-label-sliding-${uniqueId}`}>
                <rect x={tnX - 10} y={tnY - 10} width="24" height="18" rx="2" fill="white" stroke="#94a3b8" strokeWidth="0.5" />
                <g transform={isOutside ? `translate(${tnX + 2}, 0) scale(-1, 1) translate(${-(tnX + 2)}, 0)` : undefined}>
                    <text x={tnX + 2} y={tnY + 3} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600" fontFamily="Inter, sans-serif">TN</text>
                </g>
            </g>
        );

        // --- Per-panel width dimensions below the window ---
        const dimY = displayY + displayHeight + 18;
        const dimLineY = displayY + displayHeight + 6;
        let dimCurrentX = glassAreaX;
        node.children.forEach((_, i) => {
            const sashW = childWidths[i];
            const panelMm = Math.round(sashW / scale);
            const centerX = dimCurrentX + sashW / 2;
            // Tick marks
            elements.push(<line key={`dim-tick-l-${uniqueId}-${i}`} x1={dimCurrentX} y1={dimLineY} x2={dimCurrentX} y2={dimLineY + 6} stroke="#94a3b8" strokeWidth="0.7" />);
            elements.push(<line key={`dim-tick-r-${uniqueId}-${i}`} x1={dimCurrentX + sashW} y1={dimLineY} x2={dimCurrentX + sashW} y2={dimLineY + 6} stroke="#94a3b8" strokeWidth="0.7" />);
            // Connecting line
            elements.push(<line key={`dim-line-${uniqueId}-${i}`} x1={dimCurrentX} y1={dimLineY + 3} x2={dimCurrentX + sashW} y2={dimLineY + 3} stroke="#94a3b8" strokeWidth="0.5" />);
            // Value label
            elements.push(
                <g key={`dim-val-${uniqueId}-${i}`} transform={isOutside ? `translate(${centerX}, 0) scale(-1, 1) translate(${-centerX}, 0)` : undefined}>
                    <text x={centerX} y={dimY + 2} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600" fontFamily="Inter, sans-serif">{panelMm}</text>
                </g>
            );
            dimCurrentX += sashW;
        });

        // --- Total width dimension ---
        const totalDimY = dimY + 18;
        const totalMm = Math.round(displayWidth / scale);
        const totalCenterX = displayX + displayWidth / 2;
        // End arrows
        elements.push(<line key={`dim-total-line-${uniqueId}`} x1={displayX} y1={totalDimY - 4} x2={displayX + displayWidth} y2={totalDimY - 4} stroke="#94a3b8" strokeWidth="0.5" />);
        elements.push(<polygon key={`dim-total-arrowR-${uniqueId}`} points={`${displayX + displayWidth},${totalDimY - 4} ${displayX + displayWidth - 5},${totalDimY - 7} ${displayX + displayWidth - 5},${totalDimY - 1}`} fill="#94a3b8" />);
        elements.push(<polygon key={`dim-total-arrowL-${uniqueId}`} points={`${displayX},${totalDimY - 4} ${displayX + 5},${totalDimY - 7} ${displayX + 5},${totalDimY - 1}`} fill="#94a3b8" />);
        elements.push(
            <g key={`dim-total-val-${uniqueId}`} transform={isOutside ? `translate(${totalCenterX}, 0) scale(-1, 1) translate(${-totalCenterX}, 0)` : undefined}>
                <text x={totalCenterX} y={totalDimY + 10} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="600" fontFamily="Inter, sans-serif">{totalMm}</text>
            </g>
        );

        elements.panelBounds = allBounds;

    } else if (node.type === 'split-horizontal') {
        const childHeights = node.ratios.map(r => height * r);
        let currentY = y;
        const allBounds = [];

        node.children.forEach((child, i) => {
            const childPath = [...path, i];
            const childElements = renderWindowNode(child, x, currentY, width, childHeights[i], scale, selectedPanelId, dragOverPanelId, childPath, isOutside);
            elements.push(...childElements);
            if (childElements.panelBounds) {
                if (Array.isArray(childElements.panelBounds)) {
                    allBounds.push(...childElements.panelBounds);
                } else {
                    allBounds.push(childElements.panelBounds);
                }
            }
            currentY += childHeights[i];
        });

        // Draw mullions between children
        currentY = y + childHeights[0];
        for (let i = 1; i < node.children.length; i++) {
            const mullionY = currentY * scale;
            elements.push(
                <g key={`mullion-h-${i}-${path.join('-')}`}>
                    <rect
                        x={x * scale}
                        y={mullionY - 2}
                        width={width * scale}
                        height="4"
                        fill="#64748b"
                    />
                    <g transform={isOutside ? `translate(${x * scale + 20}, 0) scale(-1, 1) translate(${-(x * scale + 20)}, 0)` : undefined}>
                        <text
                            x={x * scale + 20}
                            y={mullionY + 3}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#fff"
                            fontWeight="600"
                        >
                            M{i}
                        </text>
                    </g>
                </g>
            );
            currentY += childHeights[i];
        }

        elements.panelBounds = allBounds;
    }

    return elements;
}

// Collect all panel bounds from window structure
function collectPanelBounds(node, x, y, width, height, scale, path = []) {
    const bounds = [];
    const glassInset = 24; // Must match totalFrame in renderWindowNode

    if (node.type === 'glass') {
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;

        bounds.push({
            id: node.id,
            path: [...path, node.id],
            x: displayX + glassInset,
            y: displayY + glassInset,
            width: displayWidth - glassInset * 2,
            height: displayHeight - glassInset * 2,
            shape: node.shape // Store shape for hit testing
        });
    } else if (node.type === 'split-vertical') {
        const childWidths = node.ratios.map(r => width * r);
        let currentX = x;
        node.children.forEach((child, i) => {
            const childPath = [...path, i];
            bounds.push(...collectPanelBounds(child, currentX, y, childWidths[i], height, scale, childPath));
            currentX += childWidths[i];
        });
    } else if (node.type === 'split-diagonal') {
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;
        const gx = displayX + glassInset;
        const gy = displayY + glassInset;
        const gw = displayWidth - glassInset * 2;
        const gh = displayHeight - glassInset * 2;

        const poly1Str = computeDiagonalPolygon1(gx, gy, gw, gh, node.startPoint, node.endPoint);
        const poly2Str = computeDiagonalPolygon2(gx, gy, gw, gh, node.startPoint, node.endPoint);
        const poly1Verts = parsePolygonPoints(poly1Str);
        const poly2Verts = parsePolygonPoints(poly2Str);

        bounds.push({
            id: node.children[0].id,
            path: [...path, 0, node.children[0].id],
            x: gx, y: gy, width: gw, height: gh,
            shape: 'polygon',
            vertices: poly1Verts
        });
        bounds.push({
            id: node.children[1].id,
            path: [...path, 1, node.children[1].id],
            x: gx, y: gy, width: gw, height: gh,
            shape: 'polygon',
            vertices: poly2Verts
        });
    } else if (node.type === 'split-horizontal') {
        const childHeights = node.ratios.map(r => height * r);
        let currentY = y;
        node.children.forEach((child, i) => {
            const childPath = [...path, i];
            bounds.push(...collectPanelBounds(child, x, currentY, width, childHeights[i], scale, childPath));
            currentY += childHeights[i];
        });
    } else if (node.type === 'sliding') {
        const outerFrame = 24;
        const sashFrame = 16;
        const totalInset = outerFrame + sashFrame;
        const displayX = x * scale;
        const displayY = y * scale;
        const displayWidth = width * scale;
        const displayHeight = height * scale;
        const innerX = displayX + outerFrame;
        const innerWidth = displayWidth - outerFrame * 2;

        const childWidths = node.ratios.map(r => innerWidth * r);
        let currentSashX = innerX;
        node.children.forEach((child, i) => {
            const childPath = [...path, i];
            const sashW = childWidths[i];
            bounds.push({
                id: child.id,
                path: [...childPath, child.id],
                x: currentSashX + sashFrame,
                y: displayY + totalInset,
                width: sashW - sashFrame * 2,
                height: displayHeight - totalInset * 2,
                shape: child.shape
            });
            currentSashX += sashW;
        });
    }

    return bounds;
}

export default function WindowCanvas({
    width,
    height,
    windowStructure,
    onPanelClick,
    selectedPanelId,
    onPatternDrop,
    isDraggingPattern,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onDimensionChange,
    isCustomMullionMode = false,
    onCustomMullionDraw,
    onCustomMullionCancel,
    onClear,
}) {
    const [dragOverPanelId, setDragOverPanelId] = useState(null);
    const [is3DMode, setIs3DMode] = useState(false);
    const [viewMode, setViewMode] = useState('inside'); // 'inside' or 'outside'
    const isOutside = viewMode === 'outside';
    const isCornerType = windowStructure?.mullionType === 'corner';
    const [editingDimension, setEditingDimension] = useState(null); // null, 'width', or 'height'
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef(null);
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    // Custom mullion drawing state
    const [cmStartPoint, setCmStartPoint] = useState(null); // SVG coords of first click
    const [cmPreviewPoint, setCmPreviewPoint] = useState(null); // SVG coords of mouse during preview
    const [cmMouseCoords, setCmMouseCoords] = useState(null); // SVG coords for coordinate display
    const [cmTargetPanel, setCmTargetPanel] = useState(null); // panel being drawn on

    // Reset custom mullion state when mode is deactivated
    useEffect(() => {
        if (!isCustomMullionMode) {
            setCmStartPoint(null);
            setCmPreviewPoint(null);
            setCmMouseCoords(null);
            setCmTargetPanel(null);
        }
    }, [isCustomMullionMode]);

    // Escape key to cancel custom mullion
    useEffect(() => {
        if (!isCustomMullionMode) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (cmStartPoint) {
                    // Cancel current drawing, stay in mode
                    setCmStartPoint(null);
                    setCmPreviewPoint(null);
                    setCmTargetPanel(null);
                } else {
                    // Exit custom mullion mode entirely
                    onCustomMullionCancel?.();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCustomMullionMode, cmStartPoint, onCustomMullionCancel]);



    const scale = 0.2;
    const displayWidth = width * scale;
    const displayHeight = height * scale;
    const padding = 100;

    const dimensionColor = "#94a3b8";

    // Get panel bounds for hit testing
    const panelBounds = collectPanelBounds(windowStructure, 0, 0, width, height, scale);

    // Convert screen coordinates to SVG coordinates
    const screenToSvg = (screenX, screenY) => {
        if (!svgRef.current) return { x: 0, y: 0 };

        // Use SVG's built-in coordinate transformation for accurate conversion
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = screenX;
        pt.y = screenY;

        // Transform the point from screen space to SVG space
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };

        const transformedPt = pt.matrixTransform(ctm.inverse());

        return { x: transformedPt.x, y: transformedPt.y };
    };

    // Find panel at given SVG coordinates
    const getPanelAtPoint = (svgX, svgY) => {
        // Check all panels. Since triangular/polygon panels overlap in bounding box,
        // we check shapes precisely. Prioritize polygon shape matches.

        for (const panel of panelBounds) {
            // Check bounding box first
            if (svgX >= panel.x && svgX <= panel.x + panel.width &&
                svgY >= panel.y && svgY <= panel.y + panel.height) {

                if (panel.shape === 'polygon' && panel.vertices) {
                    // Point-in-polygon test (ray casting algorithm)
                    if (pointInPolygon(svgX, svgY, panel.vertices)) {
                        return panel;
                    }
                } else if (panel.shape === 'triangle-bl') {
                    const relX = svgX - panel.x;
                    const relY = svgY - panel.y;
                    if (relY * panel.width >= relX * panel.height) {
                        return panel;
                    }
                } else if (panel.shape === 'triangle-tr') {
                    const relX = svgX - panel.x;
                    const relY = svgY - panel.y;
                    if (relY * panel.width <= relX * panel.height) {
                        return panel;
                    }
                } else {
                    // Rectangular panel
                    return panel;
                }
            }
        }
        return null;
    };






    // --- Snap point to nearest frame edge of a panel ---
    const snapToFrame = (svgX, svgY, panel) => {
        if (!panel) return { x: svgX, y: svgY, edge: null };
        const px = panel.x;
        const py = panel.y;
        const pw = panel.width;
        const ph = panel.height;

        // Distances to each edge
        const distTop = Math.abs(svgY - py);
        const distBottom = Math.abs(svgY - (py + ph));
        const distLeft = Math.abs(svgX - px);
        const distRight = Math.abs(svgX - (px + pw));

        const minDist = Math.min(distTop, distBottom, distLeft, distRight);

        if (minDist === distTop) {
            return { x: Math.max(px, Math.min(px + pw, svgX)), y: py, edge: 'top' };
        } else if (minDist === distBottom) {
            return { x: Math.max(px, Math.min(px + pw, svgX)), y: py + ph, edge: 'bottom' };
        } else if (minDist === distLeft) {
            return { x: px, y: Math.max(py, Math.min(py + ph, svgY)), edge: 'left' };
        } else {
            return { x: px + pw, y: Math.max(py, Math.min(py + ph, svgY)), edge: 'right' };
        }
    };

    // --- Custom mullion mouse move handler ---
    const handleCustomMullionMouseMove = (e) => {
        if (!isCustomMullionMode || is3DMode) return;
        const { x, y } = screenToSvg(e.clientX, e.clientY);
        setCmMouseCoords({ x, y });

        if (cmStartPoint && cmTargetPanel) {
            // Snap preview point to frame edge
            const snapped = snapToFrame(x, y, cmTargetPanel);
            setCmPreviewPoint(snapped);
        }
    };

    // --- Find nearest panel (for custom mullion - works even when clicking on frame area) ---
    const getNearestPanel = (svgX, svgY) => {
        // First try exact hit
        const exact = getPanelAtPoint(svgX, svgY);
        if (exact) return exact;

        // If no exact hit, find the nearest panel by distance to panel center
        // This allows clicking on the frame area (outside glass bounds)
        let nearest = null;
        let minDist = Infinity;
        for (const panel of panelBounds) {
            const cx = panel.x + panel.width / 2;
            const cy = panel.y + panel.height / 2;
            const dist = Math.sqrt((svgX - cx) ** 2 + (svgY - cy) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = panel;
            }
        }
        return nearest;
    };

    // --- Custom mullion click handler (single click) ---
    const handleCustomMullionClick = (clientX, clientY) => {
        if (!isCustomMullionMode || is3DMode) return;

        const { x, y } = screenToSvg(clientX, clientY);

        if (!cmStartPoint) {
            // First click - set start point
            const panel = getNearestPanel(x, y);
            if (!panel) return;

            const snapped = snapToFrame(x, y, panel);
            setCmStartPoint(snapped);
            setCmTargetPanel(panel);
        } else {
            // Second click - finalize the line
            const snapped = snapToFrame(x, y, cmTargetPanel);

            const dist = Math.sqrt((snapped.x - cmStartPoint.x) ** 2 + (snapped.y - cmStartPoint.y) ** 2);
            if (dist < 5) return;

            const panel = cmTargetPanel;
            const normStart = {
                x: (cmStartPoint.x - panel.x) / panel.width,
                y: (cmStartPoint.y - panel.y) / panel.height
            };
            const normEnd = {
                x: (snapped.x - panel.x) / panel.width,
                y: (snapped.y - panel.y) / panel.height
            };

            onCustomMullionDraw?.(normStart, normEnd, panel.id, panel.path);

            setCmStartPoint(null);
            setCmPreviewPoint(null);
            setCmTargetPanel(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        const { x, y } = screenToSvg(e.clientX, e.clientY);
        const panel = getPanelAtPoint(x, y);

        if (panel) {
            setDragOverPanelId(panel.id);
        } else {
            setDragOverPanelId(null);
        }
    };

    const handleDragLeave = (e) => {
        // Only clear if leaving the container entirely
        if (!containerRef.current?.contains(e.relatedTarget)) {
            setDragOverPanelId(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOverPanelId(null);

        const { x, y } = screenToSvg(e.clientX, e.clientY);
        const panel = getPanelAtPoint(x, y);

        if (panel && onPatternDrop) {
            try {
                const patternData = JSON.parse(e.dataTransfer.getData('application/json'));
                onPatternDrop(patternData, panel.id, panel.path);
            } catch (err) {
                console.error('Error parsing drop data:', err);
            }
        }
    };

    const handleClick = (e) => {
        if (isCustomMullionMode) {
            handleCustomMullionClick(e.clientX, e.clientY);
            return;
        }
        const { x, y } = screenToSvg(e.clientX, e.clientY);
        const panel = getPanelAtPoint(x, y);

        if (panel && onPanelClick) {
            onPanelClick(panel.id, panel.path);
        }
    };

    // Touch support for custom mullion
    const handleTouchEnd = (e) => {
        if (!isCustomMullionMode) return;
        const touch = e.changedTouches[0];
        if (touch) {
            handleCustomMullionClick(touch.clientX, touch.clientY);
        }
    };

    // --- Inline dimension editing ---
    const startEditing = (dimension, currentValue, e) => {
        e.stopPropagation();
        setEditingDimension(dimension);
        setEditValue(String(currentValue));
        // Focus will happen via useEffect
    };

    const confirmEdit = () => {
        if (editingDimension && onDimensionChange) {
            const val = parseInt(editValue, 10);
            if (!isNaN(val) && val > 0) {
                onDimensionChange(editingDimension, val);
            }
        }
        setEditingDimension(null);
        setEditValue('');
    };

    const cancelEdit = () => {
        setEditingDimension(null);
        setEditValue('');
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    };

    // Auto-focus and select-all when editing starts
    useEffect(() => {
        if (editingDimension && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingDimension]);


    return (
        <div
            ref={containerRef}
            className="canvas-container"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: isCustomMullionMode ? 'crosshair' : undefined
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onTouchEnd={isCustomMullionMode ? handleTouchEnd : undefined}
            onMouseMove={isCustomMullionMode ? handleCustomMullionMouseMove : undefined}
        >
            {/* Custom Mullion Mode Banner */}
            {isCustomMullionMode && !is3DMode && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{ fontSize: '14px' }}>+</span>
                    {!cmStartPoint ? 'Custom Mullion: Click start point on frame' : 'Custom Mullion: Click end point on frame'}
                    <button
                        onClick={(e) => { e.stopPropagation(); onCustomMullionCancel?.(); }}
                        style={{
                            marginLeft: '8px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        x
                    </button>
                </div>
            )}

            {/* Custom Mullion Coordinate Display */}
            {isCustomMullionMode && cmMouseCoords && !is3DMode && (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50px',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    fontFamily: 'monospace',
                }}>
                    {Math.round(cmMouseCoords.x / scale)},{Math.round(cmMouseCoords.y / scale)}
                </div>
            )}

            {/* Drag overlay indicator */}
            {isDraggingPattern && !is3DMode && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    zIndex: 50,
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    ✨ Drop on a panel to apply pattern
                </div>
            )}

            {/* ===== 2D SVG View ===== */}
            {!is3DMode && !isCornerType && (
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`-${padding} -${padding} ${displayWidth + padding * 2} ${displayHeight + padding * 2}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', cursor: 'pointer' }}
                >
                    <defs>
                        <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M9,0 L0,3 L9,6 z" fill={dimensionColor} />
                        </marker>
                        <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L10,3 L0,6 z" fill={dimensionColor} />
                        </marker>
                    </defs>





                    <g>
                        {/* Render window structure - flip horizontally for Outside view */}
                        <g transform={isOutside ? `translate(${displayWidth}, 0) scale(-1, 1)` : undefined}>
                            {renderWindowNode(windowStructure, 0, 0, width, height, scale, selectedPanelId, dragOverPanelId, [], isOutside)}
                        </g>

                        {/* Transparent overlay for custom mullion mode to ensure all clicks are captured */}
                        {isCustomMullionMode && (
                            <rect
                                x={-padding}
                                y={-padding}
                                width={displayWidth + padding * 2}
                                height={displayHeight + padding * 2}
                                fill="transparent"
                                style={{ cursor: 'crosshair', pointerEvents: 'all' }}
                            />
                        )}

                        {/* Custom Mullion Drawing Preview */}
                        {isCustomMullionMode && cmStartPoint && (
                            <g>
                                {/* Start point marker */}
                                <circle cx={cmStartPoint.x} cy={cmStartPoint.y} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />

                                {/* Preview line */}
                                {cmPreviewPoint && (
                                    <>
                                        <line
                                            x1={cmStartPoint.x}
                                            y1={cmStartPoint.y}
                                            x2={cmPreviewPoint.x}
                                            y2={cmPreviewPoint.y}
                                            stroke="#2563eb"
                                            strokeWidth="3"
                                            strokeDasharray="6 3"
                                            opacity="0.8"
                                        />
                                        {/* End point marker */}
                                        <circle cx={cmPreviewPoint.x} cy={cmPreviewPoint.y} r="4" fill="white" stroke="#2563eb" strokeWidth="2" />

                                        {/* Angle preview */}
                                        {(() => {
                                            const dx = cmPreviewPoint.x - cmStartPoint.x;
                                            const dy = cmPreviewPoint.y - cmStartPoint.y;
                                            const angleRad = Math.atan2(Math.abs(dy), Math.abs(dx));
                                            const angleDeg = Math.round((angleRad * 180) / Math.PI);
                                            const complementDeg = 90 - angleDeg;
                                            const midX = (cmStartPoint.x + cmPreviewPoint.x) / 2;
                                            const midY = (cmStartPoint.y + cmPreviewPoint.y) / 2;
                                            return (
                                                <g>
                                                    <rect x={midX - 18} y={midY - 22} width="36" height="16" rx="3" fill="white" stroke="#2563eb" strokeWidth="1" />
                                                    <text x={midX} y={midY - 11} textAnchor="middle" fontSize="10" fill="#2563eb" fontWeight="600">{angleDeg}°</text>
                                                </g>
                                            );
                                        })()}
                                    </>
                                )}
                            </g>
                        )}

                        {/* Label F1 - bottom-right for Inside, bottom-left for Outside */}
                        <g transform={isOutside
                            ? `translate(30, ${displayHeight - 30})`
                            : `translate(${displayWidth - 30}, ${displayHeight - 30})`
                        }>
                            <rect x="-10" y="-15" width="25" height="20" fill="white" stroke="#94a3b8" />
                            <text x="2" y="-1" textAnchor="middle" fontSize="12" fill="#64748b">F1</text>
                        </g>

                        {/* Width Dimension Line - stays at bottom center */}
                        <g transform={`translate(0, ${displayHeight + 40})`}
                            style={{ cursor: 'pointer' }}
                            onDoubleClick={(e) => startEditing('width', width, e)}
                        >
                            <line x1="0" y1="0" x2={displayWidth} y2="0" stroke={dimensionColor} strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
                            <line x1="0" y1="-10" x2="0" y2="10" stroke={dimensionColor} strokeWidth="1" />
                            <line x1={displayWidth} y1="-10" x2={displayWidth} y2="10" stroke={dimensionColor} strokeWidth="1" />
                            <rect
                                x={displayWidth / 2 - 30}
                                y="-12"
                                width="60"
                                height="24"
                                fill={editingDimension === 'width' ? '#dbeafe' : 'white'}
                                stroke={editingDimension === 'width' ? '#3b82f6' : 'none'}
                                strokeWidth={editingDimension === 'width' ? '1.5' : '0'}
                                rx="3"
                            />
                            {editingDimension === 'width' ? (
                                <foreignObject x={displayWidth / 2 - 30} y="-12" width="60" height="24">
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={handleEditKeyDown}
                                        onBlur={confirmEdit}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            textAlign: 'center',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            fontFamily: 'Inter, sans-serif',
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#1e293b',
                                            outline: 'none',
                                            padding: '0',
                                            margin: '0',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </foreignObject>
                            ) : (
                                <text x={displayWidth / 2} y="5" textAnchor="middle" fontSize="14" fill={dimensionColor} fontWeight="500">{width}</text>
                            )}
                        </g>

                        {/* Height Dimension Line - left for Inside, right for Outside */}
                        <g transform={isOutside
                            ? `translate(${displayWidth + 40}, 0)`
                            : `translate(-40, 0)`
                        }
                            style={{ cursor: 'pointer' }}
                            onDoubleClick={(e) => startEditing('height', height, e)}
                        >
                            <line x1="0" y1="0" x2="0" y2={displayHeight} stroke={dimensionColor} strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
                            <line x1="-10" y1="0" x2="10" y2="0" stroke={dimensionColor} strokeWidth="1" />
                            <line x1="-10" y1={displayHeight} x2="10" y2={displayHeight} stroke={dimensionColor} strokeWidth="1" />
                            <g transform={`translate(0, ${displayHeight / 2})`}>
                                <g transform="rotate(-90)">
                                    <rect
                                        x="-30"
                                        y="-12"
                                        width="60"
                                        height="24"
                                        fill={editingDimension === 'height' ? '#dbeafe' : 'white'}
                                        stroke={editingDimension === 'height' ? '#3b82f6' : 'none'}
                                        strokeWidth={editingDimension === 'height' ? '1.5' : '0'}
                                        rx="3"
                                    />
                                    {editingDimension === 'height' ? (
                                        <foreignObject x="-30" y="-12" width="60" height="24">
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                inputMode="numeric"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={handleEditKeyDown}
                                                onBlur={confirmEdit}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    textAlign: 'center',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    fontFamily: 'Inter, sans-serif',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: '#1e293b',
                                                    outline: 'none',
                                                    padding: '0',
                                                    margin: '0',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        </foreignObject>
                                    ) : (
                                        <text x="0" y="5" textAnchor="middle" fontSize="14" fill={dimensionColor} fontWeight="500">{height}</text>
                                    )}
                                </g>
                            </g>
                        </g>

                        {/* Floor Aperture Indicator - right side for Inside, left side for Outside */}
                        <g transform={`translate(0, ${displayHeight + 90})`}>
                            {isOutside ? (
                                <>
                                    <path d="M0,0 L10,10 L-10,10 Z" fill="#94a3b8" transform="translate(-20, 0) rotate(180)" />
                                    <line x1="0" y1="10" x2={displayWidth} y2="10" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
                                    <rect x={-230} y="-5" width="200" height="25" fill="white" stroke="#94a3b8" />
                                    <text x={-130} y="12" textAnchor="middle" fontSize="12" fill="#64748b">Floor Aperture Distance = 900</text>
                                </>
                            ) : (
                                <>
                                    <path d="M0,0 L10,10 L-10,10 Z" fill="#94a3b8" transform={`translate(${displayWidth + 20}, 0) rotate(180)`} />
                                    <line x1="0" y1="10" x2={displayWidth} y2="10" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
                                    <rect x={displayWidth + 30} y="-5" width="200" height="25" fill="white" stroke="#94a3b8" />
                                    <text x={displayWidth + 130} y="12" textAnchor="middle" fontSize="12" fill="#64748b">Floor Aperture Distance = 900</text>
                                </>
                            )}
                        </g>

                        {/* Individual panel dimensions for split windows */}
                        {windowStructure.type === 'split-vertical' && (
                            <g transform={`translate(0, ${displayHeight + 70})`}>
                                {windowStructure.ratios.map((ratio, i) => {
                                    const panelWidth = width * ratio;
                                    const ratios = isOutside ? [...windowStructure.ratios].reverse() : windowStructure.ratios;
                                    const idx = isOutside ? (windowStructure.ratios.length - 1 - i) : i;
                                    const xOffset = ratios.slice(0, i).reduce((sum, r) => sum + width * r, 0) * scale;
                                    return (
                                        <g key={`dim-${i}`}>
                                            <line x1={xOffset} y1="0" x2={xOffset + panelWidth * scale} y2="0" stroke={dimensionColor} strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
                                            <rect x={xOffset + (panelWidth * scale / 2) - 20} y="-10" width="40" height="20" fill="white" />
                                            <text x={xOffset + (panelWidth * scale / 2)} y="5" textAnchor="middle" fontSize="12" fill={dimensionColor} fontWeight="500">{Math.round(panelWidth)}</text>
                                        </g>
                                    );
                                })}
                            </g>
                        )}
                    </g>
                </svg>
            )}


            {/* ===== 3D View (replaces SVG inline) ===== */}
            {is3DMode && !isCornerType && (
                <Window3DView
                    windowStructure={windowStructure}
                    width={width}
                    height={height}
                />
            )}

            {/* ===== Corner Joint 3D View (inline in canvas) ===== */}
            {isCornerType && (
                <CornerJoint3DInline
                    width={width / 2}
                    height={height}
                    width2={width / 2}
                    onDimensionChange={onDimensionChange}
                />
            )}

            {/* Inside/Outside View Toggle */}
            {!is3DMode && (
                <div style={{
                    position: 'absolute',
                    bottom: '45px',
                    left: '20px',
                    background: '#e2e8f0',
                    padding: '3px',
                    borderRadius: '20px',
                    display: 'flex',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 30,
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewMode('inside'); }}
                        style={{
                            padding: '6px 18px',
                            borderRadius: '16px',
                            border: 'none',
                            background: viewMode === 'inside' ? '#64748b' : 'transparent',
                            color: viewMode === 'inside' ? '#fff' : '#94a3b8',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >Inside</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewMode('outside'); }}
                        style={{
                            padding: '6px 18px',
                            borderRadius: '16px',
                            border: 'none',
                            background: viewMode === 'outside' ? '#64748b' : 'transparent',
                            color: viewMode === 'outside' ? '#fff' : '#94a3b8',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >Outside</button>
                </div>
            )}

            {/* Bottom Center Toolbar */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                background: 'white',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 30,
            }}>
                {/* Undo Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onUndo?.(); }}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                    style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: canUndo ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: canUndo ? 1 : 0.5,
                        transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canUndo ? '#475569' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v6h6"></path>
                        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                    </svg>
                </button>
                {/* Redo Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRedo?.(); }}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                    style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: canRedo ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: canRedo ? 1 : 0.5,
                        transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canRedo ? '#475569' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 7v6h-6"></path>
                        <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
                    </svg>
                </button>

                {/* 3D Toggle Button */}
                <button
                    onClick={() => setIs3DMode(!is3DMode)}
                    title={is3DMode ? 'Switch to 2D View' : 'Switch to 3D View'}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: is3DMode ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '4px',
                        background: is3DMode ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: is3DMode ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none',
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={is3DMode ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </button>

                {/* Clear Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClear?.(); }}
                    title="Clear Design (Reset to Default)"
                    style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
