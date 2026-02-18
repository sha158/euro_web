import React from 'react';
import GlassPanel from './GlassPanel';
import SplitVertical from './SplitVertical';
import SplitHorizontal from './SplitHorizontal';
import SplitDiagonal from './SplitDiagonal';
import SlidingWindow from './SlidingWindow';

export default function WindowNode({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor }) {
    if (!node) return null;

    const props = { node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor };

    switch (node.type) {
        case 'glass':
            return <GlassPanel {...props} />;
        case 'split-vertical':
            return <SplitVertical {...props} />;
        case 'split-horizontal':
            return <SplitHorizontal {...props} />;
        case 'split-diagonal':
            return <SplitDiagonal {...props} />;
        case 'sliding':
            return <SlidingWindow {...props} />;
        default:
            return null;
    }
}
