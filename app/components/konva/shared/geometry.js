// Pure geometry functions for window rendering and hit testing

import { GLASS_INSET } from './constants';

// Determine which frame edge a normalized point (0-1) is on
export function getEdgeFromNormalized(point) {
    const eps = 0.01;
    if (Math.abs(point.y) < eps) return 'top';
    if (Math.abs(point.y - 1) < eps) return 'bottom';
    if (Math.abs(point.x) < eps) return 'left';
    if (Math.abs(point.x - 1) < eps) return 'right';
    return 'none';
}

// Compute polygon 1 (left/bottom side of diagonal) as SVG points string
export function computeDiagonalPolygon1(gx, gy, gw, gh, sp, ep) {
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

    const vertices = [{ x: sx, y: sy }];
    const corners = [TL, TR, BR, BL];
    const edges = ['top', 'right', 'bottom', 'left'];

    let startEdgeIdx = edges.indexOf(spEdge);
    let endEdgeIdx = edges.indexOf(epEdge);

    if (startEdgeIdx === -1 || endEdgeIdx === -1) {
        return `${sx},${sy} ${ex},${ey} ${BL.x},${BL.y}`;
    }

    let idx = (startEdgeIdx + 1) % 4;
    while (idx !== (endEdgeIdx + 1) % 4) {
        vertices.push(corners[idx]);
        idx = (idx + 1) % 4;
    }
    vertices.push({ x: ex, y: ey });

    return vertices.map(v => `${v.x},${v.y}`).join(' ');
}

// Compute polygon 2 (right/top side of diagonal)
export function computeDiagonalPolygon2(gx, gy, gw, gh, sp, ep) {
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
export function parsePolygonPoints(pointsStr) {
    return pointsStr.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x, y };
    });
}

// Convert polygon points string to flat array for Konva
export function polygonToFlatArray(pointsStr) {
    return pointsStr.split(' ').flatMap(p => p.split(',').map(Number));
}

// Point-in-polygon test using ray casting algorithm
export function pointInPolygon(px, py, vertices) {
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
export function computeCentroid(vertices) {
    if (vertices.length === 0) return { x: 0, y: 0 };
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    return { x: cx, y: cy };
}

// Collect all panel bounds from window structure (for hit testing)
export function collectPanelBounds(node, x, y, width, height, scale, path = []) {
    const bounds = [];
    const glassInset = GLASS_INSET;

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
            shape: node.shape
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

// Find panel at given coordinates
export function getPanelAtPoint(panelBounds, svgX, svgY) {
    for (const panel of panelBounds) {
        if (svgX >= panel.x && svgX <= panel.x + panel.width &&
            svgY >= panel.y && svgY <= panel.y + panel.height) {

            if (panel.shape === 'polygon' && panel.vertices) {
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
                return panel;
            }
        }
    }
    return null;
}

// Find nearest panel by distance to center
export function getNearestPanel(panelBounds, svgX, svgY) {
    const exact = getPanelAtPoint(panelBounds, svgX, svgY);
    if (exact) return exact;

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
}

// Snap point to nearest frame edge of a panel
export function snapToFrame(svgX, svgY, panel) {
    if (!panel) return { x: svgX, y: svgY, edge: null };
    const px = panel.x;
    const py = panel.y;
    const pw = panel.width;
    const ph = panel.height;

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
}
