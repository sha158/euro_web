import React from 'react';
import { Group, Rect, Line, Circle, Path } from 'react-konva';
import FrameRects from '../shared/FrameRects';
import GlassGrid from '../shared/GlassGrid';
import PanelMarker from '../shared/PanelMarker';
import CornerDots from '../shared/CornerDots';
import CenteredText from '../shared/CenteredText';
import { AddonOverlay, ADDON, ADDON_COLORS, ADDON_ICONS } from './GlassPanel';
import {
    FRAME_COLOR, FRAME_STROKE_WIDTH, SASH_FRAME_COLOR,
    OUTER_FRAME_TOTAL, SASH_FRAME_TOTAL, SASH_GAP,
} from '../shared/constants';
import { getFramePalette } from '../shared/framePalette';

function SashFrame({ sashX, sashY, sashW, sashH, sashStrokeColor = SASH_FRAME_COLOR }) {
    const sm = 10;
    const sw = FRAME_STROKE_WIDTH;
    return (
        <Group listening={false}>
            {/* 3 concentric rects */}
            <Rect x={sashX} y={sashY} width={sashW} height={sashH}
                stroke={sashStrokeColor} strokeWidth={sw * 1.2} />
            <Rect x={sashX + 5} y={sashY + 5} width={sashW - 10} height={sashH - 10}
                stroke={sashStrokeColor} strokeWidth={sw} />
            <Rect x={sashX + 10} y={sashY + 10} width={sashW - 20} height={sashH - 20}
                stroke={sashStrokeColor} strokeWidth={sw} />
            {/* Corner mitres */}
            <Line points={[sashX, sashY, sashX + sm, sashY + sm]}
                stroke={sashStrokeColor} strokeWidth={sw * 0.6} />
            <Line points={[sashX + sashW, sashY, sashX + sashW - sm, sashY + sm]}
                stroke={sashStrokeColor} strokeWidth={sw * 0.6} />
            <Line points={[sashX, sashY + sashH, sashX + sm, sashY + sashH - sm]}
                stroke={sashStrokeColor} strokeWidth={sw * 0.6} />
            <Line points={[sashX + sashW, sashY + sashH, sashX + sashW - sm, sashY + sashH - sm]}
                stroke={sashStrokeColor} strokeWidth={sw * 0.6} />
        </Group>
    );
}

function DirectionArrow({ cx, cy, direction }) {
    const color = '#475569';
    const sw = 2.5;

    if (direction === 'right') {
        return (
            <Group listening={false}>
                <Line points={[cx - 18, cy, cx + 14, cy]} stroke={color} strokeWidth={sw} />
                <Line points={[cx + 14, cy - 5, cx + 22, cy, cx + 14, cy + 5]} closed fill={color} />
            </Group>
        );
    }
    if (direction === 'left') {
        return (
            <Group listening={false}>
                <Line points={[cx - 14, cy, cx + 18, cy]} stroke={color} strokeWidth={sw} />
                <Line points={[cx - 14, cy - 5, cx - 22, cy, cx - 14, cy + 5]} closed fill={color} />
            </Group>
        );
    }
    if (direction === 'fixed') {
        return (
            <Group listening={false}>
                <Line points={[cx - 8, cy, cx + 8, cy]} stroke={color} strokeWidth={sw} />
                <Line points={[cx, cy - 8, cx, cy + 8]} stroke={color} strokeWidth={sw} />
            </Group>
        );
    }
    if (direction === 'both') {
        return (
            <Group listening={false}>
                <Line points={[cx - 14, cy, cx + 14, cy]} stroke={color} strokeWidth={sw} />
                <Line points={[cx + 14, cy - 5, cx + 22, cy, cx + 14, cy + 5]} closed fill={color} />
                <Line points={[cx - 14, cy - 5, cx - 22, cy, cx - 14, cy + 5]} closed fill={color} />
            </Group>
        );
    }
    return null;
}

export default function SlidingWindow({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor = FRAME_COLOR }) {
    const displayX = x * scale;
    const displayY = y * scale;
    const displayWidth = width * scale;
    const displayHeight = height * scale;

    const outerFrameTotal = OUTER_FRAME_TOTAL;
    const sashFrameTotal = SASH_FRAME_TOTAL;
    const sashGap = SASH_GAP;
    const palette = getFramePalette(frameColor);

    const glassAreaX = displayX + outerFrameTotal;
    const glassAreaY = displayY + outerFrameTotal;
    const glassAreaW = displayWidth - outerFrameTotal * 2;
    const glassAreaH = displayHeight - outerFrameTotal * 2;

    const childWidths = node.ratios.map(r => glassAreaW * r);

    return (
        <Group>
            {/* Outer frame */}
            <FrameRects
                x={displayX}
                y={displayY}
                width={displayWidth}
                height={displayHeight}
                frameColor={frameColor}
            />
            {/* Corner dots */}
            <CornerDots x={displayX} y={displayY} width={displayWidth} height={displayHeight} />

            {/* Per-sash rendering */}
            {node.children.map((child, i) => {
                const sashW = childWidths[i] - sashGap;
                const sashOffset = childWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
                const sashX = glassAreaX + sashOffset + (i > 0 ? sashGap / 2 : 0);
                const sashY = glassAreaY;
                const sashH = glassAreaH;
                const isSelected = selectedPanelId === child.id;
                const isDragOver = dragOverPanelId === child.id;

                const glassX = sashX + sashFrameTotal;
                const glassY = sashY + sashFrameTotal;
                const glassW = sashW - sashFrameTotal * 2;
                const glassH = sashH - sashFrameTotal * 2;

                let fillColor = 'rgba(212, 238, 250, 0.65)';
                let strokeColor = '#b0d8f0';
                let strokeWidth = 1;
                if (isDragOver) { fillColor = 'rgba(134, 239, 172, 0.8)'; strokeColor = '#22c55e'; strokeWidth = 3; }
                else if (isSelected) { fillColor = 'rgba(160, 212, 244, 0.85)'; strokeColor = '#3b82f6'; strokeWidth = 3; }

                const arrowCX = sashX + sashW / 2;
                const arrowCY = sashY + sashH / 2 + 10;

                const sashLabelX = sashX + sashW / 2;
                const sashLabelY = sashY + 20;

                const handleSide = child.sashDirection === 'right' ? 'right' : 'left';
                const handleX = handleSide === 'right' ? sashX + sashW - 4 : sashX + 2;
                const handleY = sashY + sashH / 2 - 8;

                const ghhLabelX = sashX + sashW / 2;
                const ghhLabelY = sashY + sashH - 30;

                const markerCX = sashX + sashW / 2;
                const markerCY = child.addon
                    ? sashY + sashFrameTotal + 24
                    : sashY + sashH / 2 - 15;

                return (
                    <Group key={`sash-${i}`}>
                        {/* Sash frame fill (gradient) */}
                        <Rect x={sashX} y={sashY} width={sashW} height={sashH}
                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                            fillLinearGradientEndPoint={{ x: sashW, y: 0 }}
                            fillLinearGradientColorStops={[0, palette.sashStart, 0.5, palette.sashMid, 1, palette.sashEnd]}
                            listening={false} />

                        {/* Sash frame wireframe */}
                        <SashFrame sashX={sashX} sashY={sashY} sashW={sashW} sashH={sashH} sashStrokeColor={palette.sashStroke} />

                        {/* Glass pane */}
                        <Rect x={glassX} y={glassY} width={glassW} height={glassH}
                            cornerRadius={1} fill={fillColor} stroke={strokeColor}
                            strokeWidth={strokeWidth} listening={false} />
                        <GlassGrid x={glassX} y={glassY} width={glassW} height={glassH} />

                        {/* Addon overlay on sash glass */}
                        {child.addon && (() => {
                            const addonX = glassX + 4;
                            const addonY = glassY + 4;
                            const addonW = glassW - 8;
                            const addonH = glassH - 8;
                            // Compute the panel's mm width for fan scaling
                            const panelMmW = Math.round(sashW / scale);
                            const addonLabels = { fan: 'FAN', louver: 'LOUVER', georgian: 'GEORGIAN', mesh: 'MESH', fixed: 'FIXED', acgrill: 'AC GRILL', grid: 'GRID' };
                            const addonLabel = addonLabels[child.addon] || child.addon.toUpperCase();
                            const labelW = Math.min(addonW, 72);
                            const labelH = 18;
                            const badgeColor = ADDON_COLORS[child.addon] || ADDON.secondary;
                            return (
                                <Group>
                                    <AddonOverlay addon={child.addon} ax={addonX} ay={addonY} aw={addonW} ah={addonH}
                                        isOutside={isOutside} fanSpec={child.fanSpec} louverSpec={child.louverSpec} panelWidthMm={panelMmW} />
                                    {/* Addon label badge */}
                                    <Group listening={false}>
                                        <Rect x={addonX} y={addonY + addonH - labelH - 2} width={labelW} height={labelH}
                                            cornerRadius={3} fill="rgba(255,255,255,0.92)"
                                            stroke={badgeColor} strokeWidth={0.8}
                                            shadowColor="rgba(0,0,0,0.1)" shadowBlur={2} shadowOffsetY={1} />
                                        <Rect x={addonX} y={addonY + addonH - labelH - 2} width={3} height={labelH}
                                            cornerRadius={[3, 0, 0, 3]} fill={badgeColor} />
                                        {ADDON_ICONS[child.addon] && (
                                            <Path data={ADDON_ICONS[child.addon]}
                                                x={addonX + 7} y={addonY + addonH - labelH + 1}
                                                stroke={badgeColor} strokeWidth={0.8}
                                                scaleX={isOutside ? -0.9 : 0.9} scaleY={0.9}
                                                listening={false} />
                                        )}
                                        <CenteredText
                                            x={addonX + labelW / 2 + 6} y={addonY + addonH - labelH / 2 - 2}
                                            text={addonLabel} fontSize={8.5} fill={ADDON.primary}
                                            fontStyle="700" isOutside={isOutside} />
                                    </Group>
                                </Group>
                            );
                        })()}

                        {/* Direction arrow */}
                        <DirectionArrow cx={arrowCX} cy={arrowCY} direction={child.sashDirection} />

                        {/* Sash label */}
                        <Group listening={false}>
                            <Rect x={sashLabelX - 12} y={sashLabelY - 10} width={24} height={16}
                                cornerRadius={2} fill="white" stroke="#94a3b8" strokeWidth={0.5} />
                            <CenteredText x={sashLabelX} y={sashLabelY - 2}
                                text={child.sashLabel || `S${i + 1}`}
                                fontSize={9} fill="#475569" fontStyle="600" isOutside={isOutside} />
                        </Group>

                        {/* Handle */}
                        <Rect x={handleX} y={handleY} width={3} height={16}
                            cornerRadius={1} fill="#94a3b8" stroke="#64748b" strokeWidth={0.5}
                            listening={false} />

                        {/* GHH label */}
                        <Group listening={false}>
                            <Rect x={ghhLabelX - 28} y={ghhLabelY - 8} width={56} height={16}
                                cornerRadius={2} fill="white" stroke="#94a3b8" strokeWidth={0.5} />
                            <CenteredText x={ghhLabelX} y={ghhLabelY}
                                text="GHH = 720" fontSize={8} fill="#64748b"
                                fontStyle="500" isOutside={isOutside} />
                        </Group>

                        {/* Panel marker */}
                        <PanelMarker x={markerCX} y={markerCY} id={child.id}
                            isDragOver={isDragOver} isOutside={isOutside} />
                    </Group>
                );
            })}

            {/* F1 label */}
            {(() => {
                const f1X = isOutside ? displayX + 30 : displayX + displayWidth - 30;
                const f1Y = displayY + displayHeight - 30;
                return (
                    <Group x={f1X} y={f1Y} listening={false}>
                        <Rect x={-10} y={-15} width={25} height={20} fill="white" stroke="#94a3b8" />
                        <CenteredText x={2} y={-5} text="F1" fontSize={12} fill="#64748b" fontStyle="normal" />
                    </Group>
                );
            })()}

            {/* TN label */}
            {(() => {
                const tnX = displayX + displayWidth + 8;
                const tnY = displayY + displayHeight - 10;
                return (
                    <Group listening={false}>
                        <Rect x={tnX - 10} y={tnY - 10} width={24} height={18}
                            cornerRadius={2} fill="white" stroke="#94a3b8" strokeWidth={0.5} />
                        <CenteredText x={tnX + 2} y={tnY - 1} text="TN"
                            fontSize={9} fill="#64748b" fontStyle="600" isOutside={isOutside} />
                    </Group>
                );
            })()}

            {/* Per-panel width dimensions */}
            {(() => {
                const dimY = displayY + displayHeight + 18;
                const dimLineY = displayY + displayHeight + 6;
                return node.children.map((_, i) => {
                    const sashW = childWidths[i];
                    const dimCurrentX = glassAreaX + childWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
                    const panelMm = Math.round(sashW / scale);
                    const centerX = dimCurrentX + sashW / 2;
                    const ret = (
                        <Group key={`dim-${i}`} listening={false}>
                            <Line points={[dimCurrentX, dimLineY, dimCurrentX, dimLineY + 6]} stroke="#94a3b8" strokeWidth={0.7} />
                            <Line points={[dimCurrentX + sashW, dimLineY, dimCurrentX + sashW, dimLineY + 6]} stroke="#94a3b8" strokeWidth={0.7} />
                            <Line points={[dimCurrentX, dimLineY + 3, dimCurrentX + sashW, dimLineY + 3]} stroke="#94a3b8" strokeWidth={0.5} />
                            <CenteredText x={centerX} y={dimY + 2} text={panelMm}
                                fontSize={10} fill="#475569" fontStyle="600" isOutside={isOutside} />
                        </Group>
                    );
                    return ret;
                });
            })()}

            {/* Total width dimension */}
            {(() => {
                const totalDimY = displayY + displayHeight + 36;
                const totalMm = Math.round(displayWidth / scale);
                const totalCenterX = displayX + displayWidth / 2;
                return (
                    <Group listening={false}>
                        <Line points={[displayX, totalDimY - 4, displayX + displayWidth, totalDimY - 4]} stroke="#94a3b8" strokeWidth={0.5} />
                        {/* Right arrow */}
                        <Line points={[displayX + displayWidth, totalDimY - 4, displayX + displayWidth - 5, totalDimY - 7, displayX + displayWidth - 5, totalDimY - 1]}
                            closed fill="#94a3b8" />
                        {/* Left arrow */}
                        <Line points={[displayX, totalDimY - 4, displayX + 5, totalDimY - 7, displayX + 5, totalDimY - 1]}
                            closed fill="#94a3b8" />
                        <CenteredText x={totalCenterX} y={totalDimY + 10} text={totalMm}
                            fontSize={11} fill="#475569" fontStyle="600" isOutside={isOutside} />
                    </Group>
                );
            })()}
        </Group>
    );
}
