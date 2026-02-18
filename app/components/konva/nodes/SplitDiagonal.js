import React from 'react';
import { Group, Rect, Line, Circle, Path } from 'react-konva';
import FrameRects from '../shared/FrameRects';
import GlassGrid from '../shared/GlassGrid';
import PanelMarker from '../shared/PanelMarker';
import CornerDots from '../shared/CornerDots';
import CenteredText from '../shared/CenteredText';
import { GLASS_INSET, FRAME_COLOR, FRAME_STROKE_WIDTH } from '../shared/constants';
import { getFramePalette } from '../shared/framePalette';
import {
    getEdgeFromNormalized,
    computeDiagonalPolygon1,
    computeDiagonalPolygon2,
    parsePolygonPoints,
    polygonToFlatArray,
    computeCentroid,
} from '../shared/geometry';

export default function SplitDiagonal({ node, x, y, width, height, scale, selectedPanelId, dragOverPanelId, path, isOutside, frameColor = FRAME_COLOR }) {
    const displayX = x * scale;
    const displayY = y * scale;
    const displayWidth = width * scale;
    const displayHeight = height * scale;

    const glassInset = GLASS_INSET;
    const gx = displayX + glassInset;
    const gy = displayY + glassInset;
    const gw = displayWidth - glassInset * 2;
    const gh = displayHeight - glassInset * 2;

    const sp = node.startPoint;
    const ep = node.endPoint;
    const lineX1 = gx + sp.x * gw;
    const lineY1 = gy + sp.y * gh;
    const lineX2 = gx + ep.x * gw;
    const lineY2 = gy + ep.y * gh;

    // Mullion geometry
    const dxM = lineX2 - lineX1;
    const dyM = lineY2 - lineY1;
    const len = Math.sqrt(dxM * dxM + dyM * dyM);
    const dirX = dxM / len;
    const dirY = dyM / len;
    const perpXM = -dyM / len;
    const perpYM = dxM / len;

    const extendDepth = 12;
    const getExtendDist = (edge) => {
        if (edge === 'left' || edge === 'right') return Math.abs(extendDepth / dirX);
        if (edge === 'top' || edge === 'bottom') return Math.abs(extendDepth / dirY);
        return extendDepth;
    };

    const spEdge = getEdgeFromNormalized(sp);
    const epEdge = getEdgeFromNormalized(ep);
    const extendDist1 = getExtendDist(spEdge);
    const extendDist2 = getExtendDist(epEdge);

    const extendedX1 = lineX1 - dirX * extendDist1;
    const extendedY1 = lineY1 - dirY * extendDist1;
    const extendedX2 = lineX2 + dirX * extendDist2;
    const extendedY2 = lineY2 + dirY * extendDist2;

    // Polygons
    const poly1 = computeDiagonalPolygon1(gx, gy, gw, gh, sp, ep);
    const poly2 = computeDiagonalPolygon2(gx, gy, gw, gh, sp, ep);
    const poly1Points = polygonToFlatArray(poly1);
    const poly2Points = polygonToFlatArray(poly2);
    const poly1Vertices = parsePolygonPoints(poly1);
    const poly2Vertices = parsePolygonPoints(poly2);

    const child1 = node.children[0];
    const child2 = node.children[1];
    const isSelected1 = selectedPanelId === child1.id;
    const isDragOver1 = dragOverPanelId === child1.id;
    const isSelected2 = selectedPanelId === child2.id;
    const isDragOver2 = dragOverPanelId === child2.id;

    const getGlassFill = (isDO, isSel) => isDO ? 'rgba(134,239,172,0.8)' : isSel ? 'rgba(160,212,244,0.85)' : 'rgba(212,238,250,0.65)';
    const getGlassStroke = (isDO, isSel) => isDO ? '#22c55e' : isSel ? '#3b82f6' : '#b0d8f0';
    const getGlassStrokeWidth = (isDO, isSel) => (isDO || isSel) ? 3 : 1;
    const palette = getFramePalette(frameColor);

    // Mullion bar polygon (white fill)
    const mullionHalfW = 6;
    const barPoints = [
        extendedX1 + perpXM * (-mullionHalfW), extendedY1 + perpYM * (-mullionHalfW),
        extendedX2 + perpXM * (-mullionHalfW), extendedY2 + perpYM * (-mullionHalfW),
        extendedX2 + perpXM * mullionHalfW, extendedY2 + perpYM * mullionHalfW,
        extendedX1 + perpXM * mullionHalfW, extendedY1 + perpYM * mullionHalfW,
    ];

    // Profile lines
    const mullionOffsets = [-6, -2, 2, 6];

    // 3D connection caps
    const getCapDirection = (edge, isStart) => {
        const mx = isStart ? -dirX : dirX;
        const my = isStart ? -dirY : dirY;
        if (edge === 'left' || edge === 'right') return { x: 0, y: my >= 0 ? 1 : -1 };
        return { x: mx >= 0 ? 1 : -1, y: 0 };
    };
    const capLength = 14;

    const line1Off = mullionOffsets[0];
    const line4Off = mullionOffsets[3];
    const line1StartPt = { x: extendedX1 + perpXM * line1Off, y: extendedY1 + perpYM * line1Off };
    const line4StartPt = { x: extendedX1 + perpXM * line4Off, y: extendedY1 + perpYM * line4Off };
    const line1EndPt = { x: extendedX2 + perpXM * line1Off, y: extendedY2 + perpYM * line1Off };
    const line4EndPt = { x: extendedX2 + perpXM * line4Off, y: extendedY2 + perpYM * line4Off };

    // Mullion label position
    const midXD = (lineX1 + lineX2) / 2;
    const midYD = (lineY1 + lineY2) / 2;

    // Angle annotations
    const arcRadius = 18;
    const computeEdgeAngle = (edge, x1, y1, x2, y2) => {
        const adx = x2 - x1;
        const ady = y2 - y1;
        if (edge === 'top') return Math.round(Math.abs(Math.atan2(ady, adx)) * 180 / Math.PI);
        if (edge === 'bottom') return Math.round(Math.abs(Math.atan2(-ady, -adx)) * 180 / Math.PI);
        if (edge === 'left') return Math.round(Math.abs(Math.atan2(adx, ady)) * 180 / Math.PI);
        if (edge === 'right') return Math.round(Math.abs(Math.atan2(-adx, -ady)) * 180 / Math.PI);
        return 0;
    };

    const renderAngleArc = (cx, cy, startAngleDeg, sweepDeg, label, key) => {
        const startR = (startAngleDeg * Math.PI) / 180;
        const endR = ((startAngleDeg + sweepDeg) * Math.PI) / 180;
        const x1A = cx + arcRadius * Math.cos(startR);
        const y1A = cy + arcRadius * Math.sin(startR);
        const x2A = cx + arcRadius * Math.cos(endR);
        const y2A = cy + arcRadius * Math.sin(endR);
        const largeArcF = Math.abs(sweepDeg) > 180 ? 1 : 0;
        const sweepF = sweepDeg > 0 ? 1 : 0;
        const midR = ((startAngleDeg + sweepDeg / 2) * Math.PI) / 180;
        const labelXA = cx + (arcRadius + 10) * Math.cos(midR);
        const labelYA = cy + (arcRadius + 10) * Math.sin(midR);

        return (
            <Group key={key}>
                <Path
                    data={`M ${x1A} ${y1A} A ${arcRadius} ${arcRadius} 0 ${largeArcF} ${sweepF} ${x2A} ${y2A}`}
                    stroke="#1e293b" strokeWidth={0.8} listening={false} />
                <CenteredText x={labelXA} y={labelYA + 3} text={`${label}\u00B0`}
                    fontSize={9} fill="#1e293b" fontStyle="500" isOutside={isOutside} />
            </Group>
        );
    };

    // Centroids for panel markers
    const centroid1 = computeCentroid(poly1Vertices);
    const centroid2 = computeCentroid(poly2Vertices);

    return (
        <Group>
            {/* Frame */}
            <FrameRects
                x={displayX}
                y={displayY}
                width={displayWidth}
                height={displayHeight}
                frameColor={frameColor}
            />

            {/* Glass pane 1 - with clip */}
            <Line points={poly1Points} closed fill={getGlassFill(isDragOver1, isSelected1)}
                stroke={getGlassStroke(isDragOver1, isSelected1)}
                strokeWidth={getGlassStrokeWidth(isDragOver1, isSelected1)} listening={false} />
            {/* Grid for pane 1 (clipped to polygon) */}
            <Group clipFunc={(ctx) => {
                ctx.beginPath();
                poly1Vertices.forEach((v, i) => { i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y); });
                ctx.closePath();
            }}>
                <GlassGrid x={gx} y={gy} width={gw} height={gh} />
            </Group>

            {/* Glass pane 2 */}
            <Line points={poly2Points} closed fill={getGlassFill(isDragOver2, isSelected2)}
                stroke={getGlassStroke(isDragOver2, isSelected2)}
                strokeWidth={getGlassStrokeWidth(isDragOver2, isSelected2)} listening={false} />
            {/* Grid for pane 2 (clipped to polygon) */}
            <Group clipFunc={(ctx) => {
                ctx.beginPath();
                poly2Vertices.forEach((v, i) => { i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y); });
                ctx.closePath();
            }}>
                <GlassGrid x={gx} y={gy} width={gw} height={gh} />
            </Group>

            {/* Mullion bar white fill */}
            <Line points={barPoints} closed fill="white" listening={false} />

            {/* 4 profile lines */}
            {mullionOffsets.map((offset, i) => {
                const ox = perpXM * offset;
                const oy = perpYM * offset;
                return (
                    <Line key={`mw-${i}`}
                        points={[extendedX1 + ox, extendedY1 + oy, extendedX2 + ox, extendedY2 + oy]}
                        stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} listening={false} />
                );
            })}

            {/* 3D Connection caps at start */}
            {spEdge !== 'none' && (() => {
                const capDirS = getCapDirection(spEdge, true);
                return (
                    <Group listening={false}>
                        <Line points={[line1StartPt.x, line1StartPt.y, line1StartPt.x + capDirS.x * capLength, line1StartPt.y + capDirS.y * capLength]}
                            stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
                        <Line points={[line4StartPt.x, line4StartPt.y, line4StartPt.x + capDirS.x * capLength, line4StartPt.y + capDirS.y * capLength]}
                            stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
                    </Group>
                );
            })()}

            {/* 3D Connection caps at end */}
            {epEdge !== 'none' && (() => {
                const capDirE = getCapDirection(epEdge, false);
                return (
                    <Group listening={false}>
                        <Line points={[line1EndPt.x, line1EndPt.y, line1EndPt.x + capDirE.x * capLength, line1EndPt.y + capDirE.y * capLength]}
                            stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
                        <Line points={[line4EndPt.x, line4EndPt.y, line4EndPt.x + capDirE.x * capLength, line4EndPt.y + capDirE.y * capLength]}
                            stroke={palette.frameStroke} strokeWidth={FRAME_STROKE_WIDTH} />
                    </Group>
                );
            })()}

            {/* Mullion label T1 */}
            <Group listening={false}>
                <Rect x={midXD - 10} y={midYD - 8} width={20} height={16}
                    cornerRadius={2} fill="white" stroke="#94a3b8" strokeWidth={0.5} />
                <CenteredText x={midXD} y={midYD} text="T1"
                    fontSize={9} fill="#475569" fontStyle="600" isOutside={isOutside} />
            </Group>

            {/* Angle annotations at start */}
            {spEdge !== 'none' && (() => {
                const angle1 = computeEdgeAngle(spEdge, lineX1, lineY1, lineX2, lineY2);
                const comp1 = 90 - angle1;
                const isHoriz = (spEdge === 'top' || spEdge === 'bottom');
                const baseAngle = spEdge === 'top' ? 0 : spEdge === 'bottom' ? 180 : spEdge === 'left' ? 90 : -90;
                const lineDir = Math.atan2(lineY2 - lineY1, lineX2 - lineX1) * 180 / Math.PI;
                return (
                    <Group>
                        {renderAngleArc(lineX1, lineY1, baseAngle, lineDir - baseAngle, angle1, 'angle-s1')}
                        {comp1 > 0 && comp1 < 90 &&
                            renderAngleArc(lineX1, lineY1, lineDir,
                                (isHoriz ? 90 : 0) - lineDir + (spEdge === 'bottom' || spEdge === 'right' ? 180 : 0),
                                comp1, 'angle-s2')}
                    </Group>
                );
            })()}

            {/* Angle annotations at end */}
            {epEdge !== 'none' && (() => {
                const angle2 = computeEdgeAngle(epEdge, lineX2, lineY2, lineX1, lineY1);
                const baseAngle2 = epEdge === 'top' ? 0 : epEdge === 'bottom' ? 180 : epEdge === 'left' ? 90 : -90;
                const lineDir2 = Math.atan2(lineY1 - lineY2, lineX1 - lineX2) * 180 / Math.PI;
                return renderAngleArc(lineX2, lineY2, baseAngle2, lineDir2 - baseAngle2, angle2, 'angle-e1');
            })()}

            {/* Panel markers */}
            <PanelMarker x={centroid1.x} y={centroid1.y} id={child1.id} isOutside={isOutside} />
            <PanelMarker x={centroid2.x} y={centroid2.y} id={child2.id} isOutside={isOutside} />

            {/* Corner dots */}
            <CornerDots x={displayX} y={displayY} width={displayWidth} height={displayHeight} />
        </Group>
    );
}
