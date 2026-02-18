import React from 'react';
import { Group, Line, Rect, Path } from 'react-konva';
import CenteredText from '../shared/CenteredText';

export default function FloorAperture({ displayWidth, displayHeight, isOutside }) {
    return (
        <Group y={displayHeight + 90}>
            {isOutside ? (
                <Group>
                    <Path data="M0,0 L10,10 L-10,10 Z" fill="#94a3b8" x={-20} scaleY={-1} y={10} listening={false} />
                    <Line points={[0, 10, displayWidth, 10]} stroke="#94a3b8" strokeWidth={4} dash={[4, 4]} listening={false} />
                    <Rect x={-230} y={-5} width={200} height={25} fill="white" stroke="#94a3b8" listening={false} />
                    <CenteredText x={-130} y={7} text="Floor Aperture Distance = 900"
                        fontSize={12} fill="#64748b" fontStyle="normal" />
                </Group>
            ) : (
                <Group>
                    <Path data="M0,0 L10,10 L-10,10 Z" fill="#94a3b8" x={displayWidth + 20} scaleY={-1} y={10} listening={false} />
                    <Line points={[0, 10, displayWidth, 10]} stroke="#94a3b8" strokeWidth={4} dash={[4, 4]} listening={false} />
                    <Rect x={displayWidth + 30} y={-5} width={200} height={25} fill="white" stroke="#94a3b8" listening={false} />
                    <CenteredText x={displayWidth + 130} y={7} text="Floor Aperture Distance = 900"
                        fontSize={12} fill="#64748b" fontStyle="normal" />
                </Group>
            )}
        </Group>
    );
}
