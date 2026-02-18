import React from 'react';
import { Group, Line, Rect, Arrow } from 'react-konva';
import CenteredText from '../shared/CenteredText';
import { DIMENSION_COLOR } from '../shared/constants';

export default function PanelDimensions({ windowStructure, displayWidth, displayHeight, width, height, scale, isOutside }) {
    if (windowStructure.type !== 'split-vertical' && windowStructure.type !== 'split-horizontal') return null;

    if (windowStructure.type === 'split-vertical') {
        return (
            <Group y={displayHeight + 70}>
                {windowStructure.ratios.map((ratio, i) => {
                    const panelWidth = width * ratio;
                    const ratios = isOutside ? [...windowStructure.ratios].reverse() : windowStructure.ratios;
                    const xOffset = ratios.slice(0, i).reduce((sum, r) => sum + width * r, 0) * scale;
                    return (
                        <Group key={`dim-v-${i}`}>
                            <Arrow
                                points={[xOffset, 0, xOffset + panelWidth * scale, 0]}
                                stroke={DIMENSION_COLOR} strokeWidth={1}
                                pointerLength={6} pointerWidth={6}
                                pointerAtBeginning pointerAtEnding
                                fill={DIMENSION_COLOR}
                                listening={false}
                            />
                            <Rect x={xOffset + (panelWidth * scale / 2) - 20} y={-10}
                                width={40} height={20} fill="white" listening={false} />
                            <CenteredText
                                x={xOffset + (panelWidth * scale / 2)} y={0}
                                text={Math.round(panelWidth)}
                                fontSize={12} fill={DIMENSION_COLOR} fontStyle="500"
                            />
                        </Group>
                    );
                })}
            </Group>
        );
    }

    return (
        <Group x={isOutside ? displayWidth + 70 : -70}>
            {windowStructure.ratios.map((ratio, i) => {
                const panelHeight = height * ratio;
                const yOffset = windowStructure.ratios
                    .slice(0, i)
                    .reduce((sum, r) => sum + height * r, 0) * scale;
                const centerY = yOffset + (panelHeight * scale / 2);
                return (
                    <Group key={`dim-h-${i}`}>
                        <Arrow
                            points={[0, yOffset, 0, yOffset + panelHeight * scale]}
                            stroke={DIMENSION_COLOR}
                            strokeWidth={1}
                            pointerLength={6}
                            pointerWidth={6}
                            pointerAtBeginning
                            pointerAtEnding
                            fill={DIMENSION_COLOR}
                            listening={false}
                        />
                        <Group x={0} y={centerY} rotation={-90}>
                            <Rect x={-20} y={-10} width={40} height={20} fill="white" listening={false} />
                            <CenteredText
                                x={0}
                                y={0}
                                text={Math.round(panelHeight)}
                                fontSize={12}
                                fill={DIMENSION_COLOR}
                                fontStyle="500"
                            />
                        </Group>
                    </Group>
                );
            })}
        </Group>
    );
}
