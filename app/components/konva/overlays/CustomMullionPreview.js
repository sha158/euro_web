import React from 'react';
import { Group, Circle, Line, Rect } from 'react-konva';
import CenteredText from '../shared/CenteredText';

export default function CustomMullionPreview({ cmStartPoint, cmPreviewPoint }) {
    if (!cmStartPoint) return null;

    return (
        <Group>
            {/* Start point marker */}
            <Circle x={cmStartPoint.x} y={cmStartPoint.y} radius={5}
                fill="#2563eb" stroke="white" strokeWidth={2} listening={false} />

            {cmPreviewPoint && (
                <Group>
                    {/* Preview line */}
                    <Line
                        points={[cmStartPoint.x, cmStartPoint.y, cmPreviewPoint.x, cmPreviewPoint.y]}
                        stroke="#2563eb" strokeWidth={3}
                        dash={[6, 3]} opacity={0.8}
                        listening={false}
                    />
                    {/* End point marker */}
                    <Circle x={cmPreviewPoint.x} y={cmPreviewPoint.y} radius={4}
                        fill="white" stroke="#2563eb" strokeWidth={2} listening={false} />

                    {/* Angle preview */}
                    {(() => {
                        const dx = cmPreviewPoint.x - cmStartPoint.x;
                        const dy = cmPreviewPoint.y - cmStartPoint.y;
                        const angleRad = Math.atan2(Math.abs(dy), Math.abs(dx));
                        const angleDeg = Math.round((angleRad * 180) / Math.PI);
                        const midX = (cmStartPoint.x + cmPreviewPoint.x) / 2;
                        const midY = (cmStartPoint.y + cmPreviewPoint.y) / 2;
                        return (
                            <Group listening={false}>
                                <Rect x={midX - 18} y={midY - 22} width={36} height={16}
                                    cornerRadius={3} fill="white" stroke="#2563eb" strokeWidth={1} />
                                <CenteredText x={midX} y={midY - 14} text={`${angleDeg}\u00B0`}
                                    fontSize={10} fill="#2563eb" fontStyle="600" />
                            </Group>
                        );
                    })()}
                </Group>
            )}
        </Group>
    );
}
