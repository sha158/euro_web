import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import WindowNode from './WindowNode';
import CenteredText from '../shared/CenteredText';
import { FRAME_COLOR } from '../shared/constants';
import { getFramePalette } from '../shared/framePalette';

export default function SplitHorizontal({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor = FRAME_COLOR }) {
    const childHeights = node.ratios.map(r => height * r);
    const isCoupler = node.mullionType === 'coupler-horizontal';
    const palette = getFramePalette(frameColor);

    return (
        <Group>
            {/* Render children */}
            {node.children.map((child, i) => {
                const childY = y + childHeights.slice(0, i).reduce((sum, h) => sum + h, 0);
                return (
                    <WindowNode key={i} node={child} x={x} y={childY}
                        width={width} height={childHeights[i]} scale={scale}
                        selectedPanelId={selectedPanelId} dragOverPanelId={dragOverPanelId}
                        path={[...path, i]} isOutside={isOutside} frameColor={frameColor} />
                );
            })}

            {/* Coupler profile (special) or regular mullion bars */}
            {isCoupler && node.children.length === 2 ? (
                (() => {
                    const my = (y + childHeights[0]) * scale;
                    const leftX = x * scale;
                    const profileHalfH = 7;
                    const profileOffsets = [-6, -2, 2, 6];
                    const centerX = leftX + (width * scale) / 2;

                    return (
                        <Group key={`coupler-h-${path.join('-')}`}>
                            <Rect
                                x={leftX}
                                y={my - profileHalfH}
                                width={width * scale}
                                height={profileHalfH * 2}
                                fill={palette.couplerFill}
                                stroke={palette.frameStroke}
                                strokeWidth={0.6}
                                listening={false}
                            />
                            {profileOffsets.map((offset, idx) => (
                                <Line
                                    key={`coupler-wire-h-${idx}-${path.join('-')}`}
                                    points={[leftX, my + offset, leftX + width * scale, my + offset]}
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.9}
                                    listening={false}
                                />
                            ))}
                            <Circle
                                x={centerX}
                                y={my}
                                radius={14}
                                fill={palette.couplerFill}
                                stroke={palette.frameStroke}
                                strokeWidth={1.2}
                                listening={false}
                            />
                            <CenteredText
                                x={centerX}
                                y={my + 0.5}
                                text="C"
                                fontSize={11}
                                fill={palette.mullionLabel}
                                fontStyle="600"
                                isOutside={isOutside}
                            />
                        </Group>
                    );
                })()
            ) : (
                (() => {
                    return node.children.slice(1).map((_, i) => {
                        const mullionY = y + childHeights.slice(0, i + 1).reduce((sum, h) => sum + h, 0);
                        const my = mullionY * scale;
                        const leftX = x * scale;
                        const mullW = width * scale;
                        const profileHalfH = 6; // 12px total — structural mullion height
                        const steelHalfH = 2.5; // Steel reinforcement inner height

                        return (
                            <Group key={`mullion-h-${i}`}>
                                {/* Mullion body — connects left jamb to right jamb */}
                                <Rect
                                    x={leftX} y={my - profileHalfH}
                                    width={mullW} height={profileHalfH * 2}
                                    fill={palette.mullionFill}
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.8}
                                    listening={false}
                                />
                                {/* Outer profile lines (PVC/aluminium chamber walls) */}
                                <Line points={[leftX, my - profileHalfH + 2, leftX + mullW, my - profileHalfH + 2]}
                                    stroke={palette.frameInnerStroke} strokeWidth={0.6} listening={false} />
                                <Line points={[leftX, my + profileHalfH - 2, leftX + mullW, my + profileHalfH - 2]}
                                    stroke={palette.frameInnerStroke} strokeWidth={0.6} listening={false} />
                                {/* Steel reinforcement inside mullion (dashed for cross-section indication) */}
                                <Rect
                                    x={leftX + 2} y={my - steelHalfH}
                                    width={mullW - 4} height={steelHalfH * 2}
                                    fill="transparent"
                                    stroke="#94a3b8"
                                    strokeWidth={0.8}
                                    dash={[4, 3]}
                                    listening={false}
                                />
                                {/* Steel reinforcement center line */}
                                <Line points={[leftX + 4, my, leftX + mullW - 4, my]}
                                    stroke="#94a3b8" strokeWidth={0.5}
                                    dash={[6, 4]}
                                    listening={false}
                                />
                                {/* Mullion label badge */}
                                <Rect
                                    x={leftX + 14} y={my - 7}
                                    width={24} height={14}
                                    cornerRadius={3}
                                    fill="white"
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.6}
                                    listening={false}
                                />
                                <CenteredText
                                    x={leftX + 26} y={my}
                                    text={`M${i + 1}`} fontSize={9}
                                    fill={palette.mullionLabel} fontStyle="700"
                                    isOutside={isOutside}
                                />
                            </Group>
                        );
                    });
                })()
            )}
        </Group>
    );
}
