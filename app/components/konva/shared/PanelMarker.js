import React from 'react';
import { Group, Circle, Line } from 'react-konva';
import CenteredText from './CenteredText';
import { MARKER_RADIUS, MARKER_FONT_SIZE } from './constants';

export default function PanelMarker({ x, y, id, isDragOver = false, isOutside = false }) {
    return (
        <Group x={x} y={y} listening={false}>
            <Circle
                x={0} y={0}
                radius={MARKER_RADIUS}
                fill="#fff"
                stroke={isDragOver ? '#22c55e' : '#94a3b8'}
                strokeWidth={isDragOver ? 2 : 1}
            />
            <CenteredText
                x={0} y={0}
                text={id}
                fontSize={MARKER_FONT_SIZE}
                fill={isDragOver ? '#22c55e' : '#64748b'}
                fontStyle="600"
                isOutside={isOutside}
            />
            {/* Small crosshair */}
            <Line points={[-8, 14, 8, 14]} stroke="#94a3b8" strokeWidth={0.5} />
            <Line points={[0, 15, 0, 26]} stroke="#94a3b8" strokeWidth={0.5} />
        </Group>
    );
}
