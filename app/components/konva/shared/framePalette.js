import { FRAME_COLOR, SASH_FRAME_COLOR } from './constants';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeHex = (hex) => {
    if (typeof hex !== 'string') return null;
    const value = hex.trim();
    if (!value.startsWith('#')) return null;
    if (value.length === 4) {
        const [r, g, b] = value.slice(1).split('');
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    if (value.length === 7) return value.toLowerCase();
    return null;
};

const hexToRgb = (hex) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;
    return {
        r: parseInt(normalized.slice(1, 3), 16),
        g: parseInt(normalized.slice(3, 5), 16),
        b: parseInt(normalized.slice(5, 7), 16),
    };
};

const rgbToHex = ({ r, g, b }) => {
    const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHex = (fromHex, toHex, weight) => {
    const from = hexToRgb(fromHex);
    const to = hexToRgb(toHex);
    if (!from || !to) return fromHex;
    const w = clamp(weight, 0, 1);
    return rgbToHex({
        r: from.r + (to.r - from.r) * w,
        g: from.g + (to.g - from.g) * w,
        b: from.b + (to.b - from.b) * w,
    });
};

const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
        const v = channel / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getFramePalette = (frameColor = FRAME_COLOR) => {
    const normalizedBase = normalizeHex(frameColor) || FRAME_COLOR;
    const baseLuminance = getLuminance(normalizedBase);
    const darkText = '#1f2937';
    const lightText = '#f8fafc';
    const labelText = baseLuminance > 0.4 ? darkText : lightText;

    return {
        frameBase: normalizedBase,
        frameStroke: mixHex(normalizedBase, '#0f172a', 0.28),
        frameInnerStroke: mixHex(normalizedBase, '#ffffff', 0.22),
        mullionFill: mixHex(normalizedBase, '#0f172a', 0.18),
        mullionLabel: labelText,
        couplerFill: mixHex(normalizedBase, '#ffffff', 0.5),
        sashStart: mixHex(normalizedBase, '#0f172a', 0.2),
        sashMid: mixHex(normalizedBase, '#ffffff', 0.18),
        sashEnd: mixHex(normalizedBase, '#0f172a', 0.1),
        sashStroke: mixHex(normalizedBase, SASH_FRAME_COLOR, 0.18),
    };
};

