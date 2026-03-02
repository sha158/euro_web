import React from 'react';
import { Group, Line, Rect } from 'react-konva';
import CenteredText from '../shared/CenteredText';
import { DIMENSION_COLOR } from '../shared/constants';

export default function DimensionLines({
    displayWidth, displayHeight, width, height, scale, isOutside,
    editingDimension, onStartEditing,
}) {
    // Gap around the label so the line doesn't pass through it
    const labelGap = 36;
    const widthMid = displayWidth / 2;
    const heightMid = displayHeight / 2;
    const ptr = 6; // arrowhead size

    return (
        <Group>
            {/* Width Dimension Line */}
            <Group y={displayHeight + 40}>
                {/* Left segment */}
                <Line points={[0, 0, widthMid - labelGap, 0]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Right segment */}
                <Line points={[widthMid + labelGap, 0, displayWidth, 0]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Arrowhead left */}
                <Line points={[ptr, -ptr, 0, 0, ptr, ptr]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} fill={DIMENSION_COLOR}
                    closed listening={false} />
                {/* Arrowhead right */}
                <Line points={[displayWidth - ptr, -ptr, displayWidth, 0, displayWidth - ptr, ptr]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} fill={DIMENSION_COLOR}
                    closed listening={false} />
                {/* Tick marks */}
                <Line points={[0, -10, 0, 10]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                <Line points={[displayWidth, -10, displayWidth, 10]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Value background */}
                <Rect
                    x={widthMid - 34} y={-14} width={68} height={28}
                    fill={editingDimension === 'width' ? '#dbeafe' : 'white'}
                    stroke={editingDimension === 'width' ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={editingDimension === 'width' ? 1.5 : 1}
                    cornerRadius={4}
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
                    <CenteredText x={widthMid} y={0} text={width}
                        fontSize={14} fill={DIMENSION_COLOR} fontStyle="500" />
                )}
            </Group>

            {/* Height Dimension Line */}
            <Group x={isOutside ? displayWidth + 40 : -40}>
                {/* Top segment */}
                <Line points={[0, 0, 0, heightMid - labelGap]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Bottom segment */}
                <Line points={[0, heightMid + labelGap, 0, displayHeight]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Arrowhead top */}
                <Line points={[-ptr, ptr, 0, 0, ptr, ptr]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} fill={DIMENSION_COLOR}
                    closed listening={false} />
                {/* Arrowhead bottom */}
                <Line points={[-ptr, displayHeight - ptr, 0, displayHeight, ptr, displayHeight - ptr]}
                    stroke={DIMENSION_COLOR} strokeWidth={1} fill={DIMENSION_COLOR}
                    closed listening={false} />
                {/* Tick marks */}
                <Line points={[-10, 0, 10, 0]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                <Line points={[-10, displayHeight, 10, displayHeight]} stroke={DIMENSION_COLOR} strokeWidth={1} listening={false} />
                {/* Value background - no rotation, horizontal label */}
                <Rect
                    x={-34} y={heightMid - 14} width={68} height={28}
                    fill={editingDimension === 'height' ? '#dbeafe' : 'white'}
                    stroke={editingDimension === 'height' ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={editingDimension === 'height' ? 1.5 : 1}
                    cornerRadius={4}
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
                    <CenteredText x={0} y={heightMid} text={height}
                        fontSize={14} fill={DIMENSION_COLOR} fontStyle="500" />
                )}
            </Group>
        </Group>
    );
}
