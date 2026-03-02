/**
 * Compute Bill of Materials from window structure (for cut list / report).
 * All dimensions in mm.
 */
export function computeBOM(node, totalWidth, totalHeight, path = []) {
    const glassPanels = [];
    let perimeterMm = 0;
    let hardwareCount = 0;

    function walk(n, x, y, w, h, p) {
        const currentPath = p || [];
        if (!n) return;
        if (n.type === 'glass') {
            glassPanels.push({ id: n.id, width: Math.round(w), height: Math.round(h), path: currentPath });
            perimeterMm += 2 * (w + h);
            hardwareCount += 1;
            return;
        }
        if (n.type === 'split-vertical' && n.ratios && n.children) {
            const childWidths = n.ratios.map((r) => w * r);
            let cx = x;
            n.children.forEach((child, i) => {
                walk(child, cx, y, childWidths[i], h, [...currentPath, i]);
                cx += childWidths[i];
            });
            return;
        }
        if (n.type === 'split-horizontal' && n.ratios && n.children) {
            const childHeights = n.ratios.map((r) => h * r);
            let cy = y;
            n.children.forEach((child, i) => {
                walk(child, x, cy, w, childHeights[i], [...currentPath, i]);
                cy += childHeights[i];
            });
            return;
        }
        if (n.type === 'split-diagonal' && n.children && n.children.length === 2) {
            glassPanels.push({ id: n.children[0].id, width: Math.round(w), height: Math.round(h), path: [...currentPath, 0], shape: 'triangle' });
            glassPanels.push({ id: n.children[1].id, width: Math.round(w), height: Math.round(h), path: [...currentPath, 1], shape: 'triangle' });
            perimeterMm += 2 * (w + h) * 2;
            hardwareCount += 2;
            return;
        }
        if (n.type === 'sliding' && n.children) {
            const outerFrame = 24;
            const sashFrame = 16;
            const innerW = w - outerFrame * 2;
            const innerH = h - outerFrame * 2;
            const ratios = n.ratios || n.children.map(() => 1 / n.children.length);
            const childWidths = ratios.map((r) => innerW * r);
            n.children.forEach((child, i) => {
                const sashW = childWidths[i] || innerW / n.children.length;
                glassPanels.push({ id: child.id, width: Math.round(sashW - sashFrame * 2), height: Math.round(innerH - sashFrame * 2), path: [...currentPath, i] });
                hardwareCount += 1;
            });
            perimeterMm += 2 * (w + h);
            return;
        }
    }

    walk(node, 0, 0, totalWidth, totalHeight, []);
    const perimeterM = perimeterMm / 1000;
    const areaSqmt = glassPanels.reduce((acc, p) => acc + (p.width * p.height) / 1e6, 0);
    return {
        glassPanels,
        perimeterMm,
        perimeterM,
        areaSqmt,
        hardwareCount,
    };
}
