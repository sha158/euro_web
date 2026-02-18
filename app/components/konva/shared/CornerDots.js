import React from 'react';
import { Circle } from 'react-konva';
import { DOT_RADIUS, DOT_COLOR } from './constants';

export default function CornerDots({ x, y, width, height }) {
    const corners = [
        [x, y],
        [x + width, y],
        [x, y + height],
        [x + width, y + height],
    ];

    return (
        <>
            {corners.map(([cx, cy], i) => (
                <Circle key={i} x={cx} y={cy} radius={DOT_RADIUS}
                    fill={DOT_COLOR} opacity={0.6} listening={false} />
            ))}
        </>
    );
}
