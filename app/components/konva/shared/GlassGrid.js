import React from 'react';
import { Line } from 'react-konva';
import { GRID_STEP, GRID_COLOR, GRID_STROKE_WIDTH } from './constants';

export default function GlassGrid({ x, y, width, height, opacity = 0.5 }) {
    const lines = [];

    // Vertical lines
    for (let i = 0; i <= Math.ceil(width / GRID_STEP); i++) {
        const lx = x + i * GRID_STEP;
        if (lx <= x + width) {
            lines.push(
                <Line key={`gv-${i}`} points={[lx, y, lx, y + height]}
                    stroke={GRID_COLOR} strokeWidth={GRID_STROKE_WIDTH}
                    opacity={opacity} listening={false} />
            );
        }
    }
    // Horizontal lines
    for (let i = 0; i <= Math.ceil(height / GRID_STEP); i++) {
        const ly = y + i * GRID_STEP;
        if (ly <= y + height) {
            lines.push(
                <Line key={`gh-${i}`} points={[x, ly, x + width, ly]}
                    stroke={GRID_COLOR} strokeWidth={GRID_STROKE_WIDTH}
                    opacity={opacity} listening={false} />
            );
        }
    }

    return <>{lines}</>;
}
