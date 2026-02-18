import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import WindowNode from './WindowNode';
import CenteredText from '../shared/CenteredText';
import { FRAME_COLOR } from '../shared/constants';
import { getFramePalette } from '../shared/framePalette';

export default function SplitVertical({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor = FRAME_COLOR }) {
    const childWidths = node.ratios.map(r => width * r);
    const isCoupler = node.mullionType === 'coupler-vertical' || node.mullionType === 'coupler-angular' || node.mullionType === 'coupling';
    const couplerLabel = node.mullionType === 'coupler-angular' ? 'LC' : 'C';
    const palette = getFramePalette(frameColor);
    const couplerBadgeFill = node.mullionType === 'coupler-angular'
        ? palette.couplerFill
        : '#ffffff';

    return (
        <Group>
            {/* Render children */}
            {node.children.map((child, i) => {
                const childX = x + childWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
                const isAngularRightPanel = node.mullionType === 'coupler-angular' && i === 1 && node.children.length === 2;
                return (
                    isAngularRightPanel ? (
                        <Group
                            key={i}
                            x={childX * scale + 2}
                            y={y * scale}
                            scaleX={0.92}
                            skewY={-0.22}
                        >
                            <WindowNode
                                node={child}
                                x={0}
                                y={0}
                                width={childWidths[i]}
                                height={height}
                                scale={scale}
                                selectedPanelId={selectedPanelId}
                                dragOverPanelId={dragOverPanelId}
                                path={[...path, i]}
                                isOutside={isOutside}
                                frameColor={frameColor}
                            />
                        </Group>
                    ) : (
                        <WindowNode
                            key={i}
                            node={child}
                            x={childX}
                            y={y}
                            width={childWidths[i]}
                            height={height}
                            scale={scale}
                            selectedPanelId={selectedPanelId}
                            dragOverPanelId={dragOverPanelId}
                            path={[...path, i]}
                            isOutside={isOutside}
                            frameColor={frameColor}
                        />
                    )
                );
            })}

            {/* Coupler profile (special) or regular mullion bars */}
            {isCoupler && node.children.length === 2 ? (
                (() => {
                    const mx = (x + childWidths[0]) * scale;
                    const topY = y * scale;
                    const profileHalfW = 7;
                    const profileOffsets = [-6, -2, 2, 6];
                    const centerY = topY + (height * scale) / 2;

                    return (
                        <Group key={`coupler-v-${path.join('-')}`}>
                            <Rect
                                x={mx - profileHalfW}
                                y={topY}
                                width={profileHalfW * 2}
                                height={height * scale}
                                fill={palette.couplerFill}
                                stroke={palette.frameStroke}
                                strokeWidth={0.6}
                                listening={false}
                            />
                            {profileOffsets.map((offset, idx) => (
                                <Line
                                    key={`coupler-wire-v-${idx}-${path.join('-')}`}
                                    points={[mx + offset, topY, mx + offset, topY + height * scale]}
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.9}
                                    listening={false}
                                />
                            ))}
                            <Circle
                                x={mx}
                                y={centerY}
                                radius={14}
                                fill={couplerBadgeFill}
                                stroke={palette.frameStroke}
                                strokeWidth={1.2}
                                listening={false}
                            />
                            <CenteredText
                                x={mx}
                                y={centerY + 0.5}
                                text={couplerLabel}
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
                        const mullionX = x + childWidths.slice(0, i + 1).reduce((sum, w) => sum + w, 0);
                        const mx = mullionX * scale;
                        const topY = y * scale;
                        const mullH = height * scale;
                        const profileHalfW = 6; // 12px total — structural mullion width
                        const steelHalfW = 2.5; // Steel reinforcement inner width

                        return (
                            <Group key={`mullion-v-${i}`}>
                                {/* Mullion body — connects head to sill */}
                                <Rect
                                    x={mx - profileHalfW} y={topY}
                                    width={profileHalfW * 2} height={mullH}
                                    fill={palette.mullionFill}
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.8}
                                    listening={false}
                                />
                                {/* Outer profile lines (PVC/aluminium chamber walls) */}
                                <Line points={[mx - profileHalfW + 2, topY, mx - profileHalfW + 2, topY + mullH]}
                                    stroke={palette.frameInnerStroke} strokeWidth={0.6} listening={false} />
                                <Line points={[mx + profileHalfW - 2, topY, mx + profileHalfW - 2, topY + mullH]}
                                    stroke={palette.frameInnerStroke} strokeWidth={0.6} listening={false} />
                                {/* Steel reinforcement inside mullion (dashed for cross-section indication) */}
                                <Rect
                                    x={mx - steelHalfW} y={topY + 2}
                                    width={steelHalfW * 2} height={mullH - 4}
                                    fill="transparent"
                                    stroke="#94a3b8"
                                    strokeWidth={0.8}
                                    dash={[4, 3]}
                                    listening={false}
                                />
                                {/* Steel reinforcement center line */}
                                <Line points={[mx, topY + 4, mx, topY + mullH - 4]}
                                    stroke="#94a3b8" strokeWidth={0.5}
                                    dash={[6, 4]}
                                    listening={false}
                                />
                                {/* Mullion label badge */}
                                <Rect
                                    x={mx - 12} y={topY + 14}
                                    width={24} height={14}
                                    cornerRadius={3}
                                    fill="white"
                                    stroke={palette.frameStroke}
                                    strokeWidth={0.6}
                                    listening={false}
                                />
                                <CenteredText
                                    x={mx} y={topY + 21}
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
