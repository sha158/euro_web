import React from 'react';
import { Group, Line, Rect, Arrow } from 'react-konva';
import CenteredText from '../shared/CenteredText';
import { DIMENSION_COLOR } from '../shared/constants';

export default function DimensionLines({
    displayWidth, displayHeight, width, height, scale, isOutside,
    editingDimension, onStartEditing,
}) {
    return (
        <Group>
            {/* Width Dimension Line */}
            <Group y={displayHeight + 40}>
                <Arrow
                    points={[0, 0, displayWidth, 0]}
                    stroke={DIMENSION_COLOR} strokeWidth={1}
                    pointerLength={6} pointerWidth={6}
                    pointerAtBeginning pointerAtEnding
                    fill={DIMENSION_COLOR}
                    listening={false}
                />
                {/* Tick marks */}
                <Line points={[0, -10, 0, 10]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                <Line points={[displayWidth, -10, displayWidth, 10]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Value background */}
                <Rect
                    x={displayWidth / 2 - 30} y={-12} width={60} height={24}
                    fill={editingDimension === 'width' ? '#dbeafe' : 'white'}
                    stroke={editingDimension === 'width' ? '#3b82f6' : undefined}
                    strokeWidth={editingDimension === 'width' ? 1.5 : 0}
                    cornerRadius={3}
                    listening={!!onStartEditing}
                    onDblClick={(e) => {
                        e.cancelBubble = true;
                        onStartEditing?.('width', width);
                    }}
                    onDblTap={(e) => {
                        e.cancelBubble = true;
                        onStartEditing?.('width', width);
                    }}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        onStartEditing?.('width', width);
                    }}
                    onTap={(e) => {
                        e.cancelBubble = true;
                        onStartEditing?.('width', width);
                    }}
                />
                {editingDimension !== 'width' && (
                    <CenteredText x={displayWidth / 2} y={0} text={width}
                        fontSize={14} fill={DIMENSION_COLOR} fontStyle="500" />
                )}
            </Group>

            {/* Height Dimension Line */}
            <Group x={isOutside ? displayWidth + 40 : -40}>
                <Arrow
                    points={[0, 0, 0, displayHeight]}
                    stroke={DIMENSION_COLOR} strokeWidth={1}
                    pointerLength={6} pointerWidth={6}
                    pointerAtBeginning pointerAtEnding
                    fill={DIMENSION_COLOR}
                    listening={false}
                />
                {/* Tick marks */}
                <Line points={[-10, 0, 10, 0]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                <Line points={[-10, displayHeight, 10, displayHeight]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Value background - rotated */}
                <Group x={0} y={displayHeight / 2} rotation={-90}>
                    <Rect
                        x={-30} y={-12} width={60} height={24}
                        fill={editingDimension === 'height' ? '#dbeafe' : 'white'}
                        stroke={editingDimension === 'height' ? '#3b82f6' : undefined}
                        strokeWidth={editingDimension === 'height' ? 1.5 : 0}
                        cornerRadius={3}
                        listening={!!onStartEditing}
                        onDblClick={(e) => {
                            e.cancelBubble = true;
                            onStartEditing?.('height', height);
                        }}
                        onDblTap={(e) => {
                            e.cancelBubble = true;
                            onStartEditing?.('height', height);
                        }}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            onStartEditing?.('height', height);
                        }}
                        onTap={(e) => {
                            e.cancelBubble = true;
                            onStartEditing?.('height', height);
                        }}
                    />
                    {editingDimension !== 'height' && (
                        <CenteredText x={0} y={0} text={height}
                            fontSize={14} fill={DIMENSION_COLOR} fontStyle="500" />
                    )}
                </Group>
            </Group>
        </Group>
    );
}
