import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { TOTAL_FRAME, FRAME_COLOR, FRAME_STROKE_WIDTH } from './constants';
import { getFramePalette } from './framePalette';

export default function FrameRects({ x, y, width, height, frameColor = FRAME_COLOR }) {
    const mitreLen = TOTAL_FRAME;
    const mitreStroke = FRAME_STROKE_WIDTH * 0.7;
    const palette = getFramePalette(frameColor);

    return (
        <Group listening={false}>
            {/* Frame body fill */}
            <Rect x={x} y={y} width={width} height={height} fill={palette.frameBase} />
            {/* Line 1 - outer edge */}
            <Rect x={x} y={y} width={width} height={height}
                stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
            {/* Line 2 - middle profile */}
            <Rect x={x + 12} y={y + 12} width={width - 24} height={height - 24}
                stroke={palette.frameInnerStroke} strokeWidth={FRAME_STROKE_WIDTH} />
            {/* Line 3 - inner edge */}
            <Rect x={x + 24} y={y + 24} width={width - 48} height={height - 48}
                stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
            {/* Corner mitre lines */}
            <Line points={[x, y, x + mitreLen, y + mitreLen]}
                stroke={palette.frameStroke} strokeWidth={mitreStroke} />
            <Line points={[x + width, y, x + width - mitreLen, y + mitreLen]}
                stroke={palette.frameStroke} strokeWidth={mitreStroke} />
            <Line points={[x, y + height, x + mitreLen, y + height - mitreLen]}
                stroke={palette.frameStroke} strokeWidth={mitreStroke} />
            <Line points={[x + width, y + height, x + width - mitreLen, y + height - mitreLen]}
                stroke={palette.frameStroke} strokeWidth={mitreStroke} />
        </Group>
    );
}
