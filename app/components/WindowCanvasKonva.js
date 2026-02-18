'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Group, Rect, Line, Circle, Text, Image as KonvaImage } from 'react-konva';
import dynamic from 'next/dynamic';
import WindowNode from './konva/nodes/WindowNode';
import DimensionLines from './konva/overlays/DimensionLines';
import CustomMullionPreview from './konva/overlays/CustomMullionPreview';
import FloorAperture from './konva/overlays/FloorAperture';
import PanelDimensions from './konva/overlays/PanelDimensions';
import CenteredText from './konva/shared/CenteredText';
import {
    collectPanelBounds,
    getPanelAtPoint,
    getNearestPanel,
    snapToFrame,
} from './konva/shared/geometry';

// Dynamic import for 3D View (Three.js doesn't support SSR)
const Window3DView = dynamic(
    () => import('./Window3DView'),
    { ssr: false }
);

const CornerJoint3DInline = dynamic(
    () => import('./CornerJoint3DViewer').then(mod => ({ default: mod.CornerJoint3DInline })),
    { ssr: false }
);

const OPENING_WORKSPACE_WIDTH = 9000;
const OPENING_WORKSPACE_HEIGHT = 9000;
const OPENING_SCALE = 0.12;
const OPENING_PADDING = 120;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function WindowCanvasKonva({
    width,
    height,
    windowStructure,
    onPanelClick,
    selectedPanelId,
    onPatternDrop,
    isDraggingPattern,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onDimensionChange,
    isCustomMullionMode = false,
    onCustomMullionDraw,
    onCustomMullionCancel,
    isOpeningMode = false,
    onOpeningModeCancel,
    onOpeningSave,
    onClear,
    viewMode: externalViewMode,
    onViewModeChange,
    frameFinishBySide,
    backgroundImageSrc,
    openingPolygon,
}) {
    const [dragOverPanelId, setDragOverPanelId] = useState(null);
    const [is3DMode, setIs3DMode] = useState(false);
    const [localViewMode, setLocalViewMode] = useState('inside');
    const viewMode = externalViewMode ?? localViewMode;
    const setViewMode = (nextMode) => {
        onViewModeChange?.(nextMode);
        if (externalViewMode === undefined || externalViewMode === null) {
            setLocalViewMode(nextMode);
        }
    };
    const isOutside = viewMode === 'outside';
    const activeFrameColor = isOutside
        ? frameFinishBySide?.outside?.color
        : frameFinishBySide?.inside?.color;
    const isCornerType = windowStructure?.mullionType === 'corner';
    const [editingDimension, setEditingDimension] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editPos, setEditPos] = useState({ x: 0, y: 0 });
    const editInputRef = useRef(null);
    const containerRef = useRef(null);
    const stageRef = useRef(null);

    // Stage sizing
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            setStageSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Background image loading
    const [bgImage, setBgImage] = useState(null);
    useEffect(() => {
        if (!backgroundImageSrc) { setBgImage(null); return; }
        const img = new window.Image();
        img.onload = () => setBgImage(img);
        img.src = backgroundImageSrc;
    }, [backgroundImageSrc]);

    // Custom mullion state
    const [cmStartPoint, setCmStartPoint] = useState(null);
    const [cmPreviewPoint, setCmPreviewPoint] = useState(null);
    const [cmMouseCoords, setCmMouseCoords] = useState(null);
    const [cmTargetPanel, setCmTargetPanel] = useState(null);
    const [openingPoints, setOpeningPoints] = useState([]);
    const [openingClosed, setOpeningClosed] = useState(false);
    const [openingInputMode, setOpeningInputMode] = useState(false);
    const [openingLengthInput, setOpeningLengthInput] = useState('');
    const [openingAngleInput, setOpeningAngleInput] = useState('');
    const openingLengthRef = useRef(null);
    const [openingCursor, setOpeningCursor] = useState({
        x: OPENING_WORKSPACE_WIDTH / 2,
        y: OPENING_WORKSPACE_HEIGHT / 2,
    });

    // Escape key handler
    useEffect(() => {
        if (!isCustomMullionMode) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (cmStartPoint) {
                    setCmStartPoint(null);
                    setCmPreviewPoint(null);
                    setCmTargetPanel(null);
                } else {
                    onCustomMullionCancel?.();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCustomMullionMode, cmStartPoint, onCustomMullionCancel]);

    const scale = 0.2;
    const windowDisplayWidth = width * scale;
    const windowDisplayHeight = height * scale;
    const displayWidth = isOpeningMode ? OPENING_WORKSPACE_WIDTH * OPENING_SCALE : windowDisplayWidth;
    const displayHeight = isOpeningMode ? OPENING_WORKSPACE_HEIGHT * OPENING_SCALE : windowDisplayHeight;
    const padding = isOpeningMode ? OPENING_PADDING : 100;

    // Compute fit scale for the stage
    const totalContentW = displayWidth + padding * 2;
    const totalContentH = displayHeight + padding * 2;
    const fitScaleX = stageSize.width / totalContentW;
    const fitScaleY = stageSize.height / totalContentH;
    const fitScale = Math.min(fitScaleX, fitScaleY, 1);

    // Center the content
    const stageOffsetX = -(stageSize.width / fitScale - totalContentW) / 2;
    const stageOffsetY = -(stageSize.height / fitScale - totalContentH) / 2;

    // Panel bounds for hit testing
    const panelBounds = useMemo(() => {
        if (isOpeningMode) return [];
        return collectPanelBounds(windowStructure, 0, 0, width, height, scale);
    }, [isOpeningMode, scale, width, height, windowStructure]);
    const hasFrameLabels = useMemo(() => {
        const hasLabels = (node) => {
            if (!node || typeof node !== 'object') return false;
            if (node.type === 'glass' && node.frameLabel) return true;
            if (Array.isArray(node.children)) return node.children.some(hasLabels);
            return false;
        };
        return hasLabels(windowStructure);
    }, [windowStructure]);

    // Convert screen coords to canvas coords
    const screenToCanvas = useCallback((clientX, clientY) => {
        const stage = stageRef.current;
        if (!stage) return { x: 0, y: 0 };
        const transform = stage.getAbsoluteTransform().copy().invert();
        const rect = stage.container().getBoundingClientRect();
        const pos = { x: clientX - rect.left, y: clientY - rect.top };
        return transform.point(pos);
    }, []);

    const toOpeningPoint = useCallback((clientX, clientY) => {
        const { x, y } = screenToCanvas(clientX, clientY);
        const canvasX = x - padding;
        const canvasY = y - padding;
        return {
            x: clamp(canvasX / OPENING_SCALE, 0, OPENING_WORKSPACE_WIDTH),
            y: clamp(canvasY / OPENING_SCALE, 0, OPENING_WORKSPACE_HEIGHT),
        };
    }, [screenToCanvas, padding]);

    const toOpeningDisplay = useCallback((point) => ({
        x: point.x * OPENING_SCALE,
        y: point.y * OPENING_SCALE,
    }), []);

    const openingCursorDisplay = toOpeningDisplay(openingCursor);
    const openingDisplayPoints = useMemo(
        () => openingPoints.map((point) => toOpeningDisplay(point)),
        [openingPoints, toOpeningDisplay]
    );
    const openingLinePoints = useMemo(
        () => openingDisplayPoints.flatMap((point) => [point.x, point.y]),
        [openingDisplayPoints]
    );

    const getSegmentLength = useCallback((a, b) => {
        return Math.hypot(b.x - a.x, b.y - a.y);
    }, []);

    const getSegmentAngle = useCallback((a, b) => {
        const raw = (Math.atan2(-(b.y - a.y), b.x - a.x) * 180) / Math.PI;
        return (raw + 360) % 360;
    }, []);

    const getVertexAngle = useCallback((prev, current, next) => {
        const a1 = Math.atan2(prev.y - current.y, prev.x - current.x);
        const a2 = Math.atan2(next.y - current.y, next.x - current.x);
        let diff = ((a2 - a1) * 180) / Math.PI;
        diff = (diff + 360) % 360;
        const interior = diff > 180 ? 360 - diff : diff;
        return {
            interior: Math.round(interior),
            external: Math.round(360 - interior),
        };
    }, []);

    const SNAP_THRESHOLD = 150; // workspace units to snap-close polygon

    const handleOpeningClick = useCallback((clientX, clientY) => {
        if (!isOpeningMode || is3DMode || openingClosed || openingInputMode) return;
        const point = toOpeningPoint(clientX, clientY);
        // Snap to first point to close polygon (need at least 3 points)
        if (openingPoints.length >= 3) {
            const first = openingPoints[0];
            const dist = Math.hypot(point.x - first.x, point.y - first.y);
            if (dist < SNAP_THRESHOLD) {
                setOpeningClosed(true);
                return;
            }
        }
        setOpeningPoints((prev) => [...prev, point]);
        setOpeningCursor(point);
    }, [isOpeningMode, is3DMode, toOpeningPoint, openingPoints, openingClosed]);

    const handleOpeningUndo = useCallback(() => {
        if (openingClosed) {
            setOpeningClosed(false);
            return;
        }
        setOpeningPoints((prev) => prev.slice(0, -1));
    }, [openingClosed]);

    const handleOpeningAddByInput = useCallback(() => {
        const len = parseFloat(openingLengthInput);
        const ang = parseFloat(openingAngleInput);
        if (isNaN(len) || len <= 0 || isNaN(ang)) return;
        const lastPoint = openingPoints.length > 0
            ? openingPoints[openingPoints.length - 1]
            : { x: OPENING_WORKSPACE_WIDTH / 2, y: OPENING_WORKSPACE_HEIGHT / 2 };
        const rad = (ang * Math.PI) / 180;
        const newPoint = {
            x: lastPoint.x + len * Math.cos(rad),
            y: lastPoint.y - len * Math.sin(rad), // Y is inverted in screen coords
        };
        setOpeningPoints((prev) => [...prev, newPoint]);
        setOpeningCursor(newPoint);
        setOpeningLengthInput('');
        setOpeningAngleInput('');
        setTimeout(() => openingLengthRef.current?.focus(), 50);
    }, [openingLengthInput, openingAngleInput, openingPoints]);

    const handleOpeningSave = useCallback(() => {
        if (openingPoints.length < 3) return;
        onOpeningSave?.(openingPoints);
    }, [openingPoints, onOpeningSave]);

    const handleOpeningMouseMove = useCallback((clientX, clientY) => {
        if (!isOpeningMode || is3DMode) return;
        const point = toOpeningPoint(clientX, clientY);
        setOpeningCursor(point);
    }, [isOpeningMode, is3DMode, toOpeningPoint]);

    // Event handlers
    const handleCustomMullionClick = useCallback((clientX, clientY) => {
        if (!isCustomMullionMode || is3DMode) return;
        const { x, y } = screenToCanvas(clientX, clientY);
        // screenToCanvas already accounts for stage offset, just subtract padding
        const cx = x - padding;
        const cy = y - padding;

        if (!cmStartPoint) {
            const panel = getNearestPanel(panelBounds, cx, cy);
            if (!panel) return;
            const snapped = snapToFrame(cx, cy, panel);
            setCmStartPoint(snapped);
            setCmTargetPanel(panel);
        } else {
            const snapped = snapToFrame(cx, cy, cmTargetPanel);
            const dist = Math.sqrt((snapped.x - cmStartPoint.x) ** 2 + (snapped.y - cmStartPoint.y) ** 2);
            if (dist < 5) return;

            const panel = cmTargetPanel;
            const normStart = {
                x: (cmStartPoint.x - panel.x) / panel.width,
                y: (cmStartPoint.y - panel.y) / panel.height
            };
            const normEnd = {
                x: (snapped.x - panel.x) / panel.width,
                y: (snapped.y - panel.y) / panel.height
            };
            onCustomMullionDraw?.(normStart, normEnd, panel.id, panel.path);
            setCmStartPoint(null);
            setCmPreviewPoint(null);
            setCmTargetPanel(null);
        }
    }, [isCustomMullionMode, is3DMode, screenToCanvas, cmStartPoint, cmTargetPanel, panelBounds, onCustomMullionDraw, padding]);

    const handleDragOver = (e) => {
        if (isOpeningMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const cx = x - padding;
        const cy = y - padding;
        const panel = getPanelAtPoint(panelBounds, cx, cy);
        setDragOverPanelId(panel ? panel.id : null);
    };

    const handleDragLeave = (e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
            setDragOverPanelId(null);
        }
    };

    const handleDrop = (e) => {
        if (isOpeningMode) return;
        e.preventDefault();
        setDragOverPanelId(null);
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const cx = x - padding;
        const cy = y - padding;
        const panel = getPanelAtPoint(panelBounds, cx, cy);
        if (panel && onPatternDrop) {
            try {
                const patternData = JSON.parse(e.dataTransfer.getData('application/json'));
                onPatternDrop(patternData, panel.id, panel.path);
            } catch (err) {
                console.error('Error parsing drop data:', err);
            }
        }
    };

    const handleClick = (e) => {
        if (isOpeningMode) {
            handleOpeningClick(e.clientX, e.clientY);
            return;
        }
        if (isCustomMullionMode) {
            handleCustomMullionClick(e.clientX, e.clientY);
            return;
        }
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const cx = x - padding;
        const cy = y - padding;
        const panel = getPanelAtPoint(panelBounds, cx, cy);
        if (panel && onPanelClick) {
            onPanelClick(panel.id, panel.path);
        }
    };

    const handleTouchEnd = (e) => {
        const touch = e.changedTouches[0];
        if (!touch) return;

        if (isOpeningMode) {
            handleOpeningClick(touch.clientX, touch.clientY);
            return;
        }

        if (!isCustomMullionMode) return;
        handleCustomMullionClick(touch.clientX, touch.clientY);
    };

    const handleCanvasMouseMove = (e) => {
        if (isOpeningMode) {
            handleOpeningMouseMove(e.clientX, e.clientY);
            return;
        }
        if (!isCustomMullionMode || is3DMode) return;
        const { x, y } = screenToCanvas(e.clientX, e.clientY);
        const cx = x - padding;
        const cy = y - padding;
        setCmMouseCoords({ x: cx, y: cy });
        if (cmStartPoint && cmTargetPanel) {
            const snapped = snapToFrame(cx, cy, cmTargetPanel);
            setCmPreviewPoint(snapped);
        }
    };

    // Dimension editing
    const startEditing = (dimension, currentValue) => {
        setEditingDimension(dimension);
        setEditValue(String(currentValue));
        // Calculate screen position for the HTML input overlay
        const stage = stageRef.current;
        if (stage) {
            const transform = stage.getAbsoluteTransform();
            let canvasPoint;
            if (dimension === 'width') {
                canvasPoint = { x: padding + displayWidth / 2, y: padding + displayHeight + 40 };
            } else {
                const hx = isOutside ? padding + displayWidth + 40 : padding - 40;
                canvasPoint = { x: hx, y: padding + displayHeight / 2 };
            }
            const screenPoint = transform.point(canvasPoint);
            setEditPos({ x: screenPoint.x, y: screenPoint.y });
        }
    };

    const confirmEdit = () => {
        if (editingDimension && onDimensionChange) {
            const trimmed = editValue.trim().toLowerCase();
            let val;
            // Support feet input: e.g. "3f", "3ft", "3feet", "5.5f"
            const feetMatch = trimmed.match(/^([0-9]*\.?[0-9]+)\s*f(?:t|eet|oot)?$/);
            if (feetMatch) {
                val = Math.round(parseFloat(feetMatch[1]) * 304.8);
            } else {
                val = parseInt(trimmed, 10);
            }
            if (!isNaN(val) && val > 0) {
                onDimensionChange(editingDimension, val);
            }
        }
        setEditingDimension(null);
        setEditValue('');
    };

    const cancelEdit = () => {
        setEditingDimension(null);
        setEditValue('');
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmEdit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    };

    useEffect(() => {
        if (editingDimension && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingDimension]);

    return (
        <div
            ref={containerRef}
            className="canvas-container"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: (isCustomMullionMode || isOpeningMode) ? 'crosshair' : undefined,
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onTouchEnd={(isCustomMullionMode || isOpeningMode) ? handleTouchEnd : undefined}
            onMouseMove={(isCustomMullionMode || isOpeningMode) ? handleCanvasMouseMove : undefined}
        >
            {/* Custom Mullion Mode Banner */}
            {isCustomMullionMode && !is3DMode && (
                <div style={{
                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white',
                    padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', zIndex: 50,
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <span style={{ fontSize: '14px' }}>+</span>
                    {!cmStartPoint ? 'Custom Mullion: Click start point on frame' : 'Custom Mullion: Click end point on frame'}
                    <button
                        onClick={(e) => { e.stopPropagation(); onCustomMullionCancel?.(); }}
                        style={{
                            marginLeft: '8px', background: 'rgba(255,255,255,0.2)', border: 'none',
                            color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                            cursor: 'pointer', fontSize: '11px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >x</button>
                </div>
            )}

            {/* Opening Mode Banner */}
            {isOpeningMode && !is3DMode && (
                <div style={{
                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: 'white',
                    padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)', zIndex: 50,
                    display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '14px' }}>+</span>
                    {openingClosed
                        ? `Shape closed (${openingPoints.length} points)`
                        : `Opening Mode: Click points to draw (${openingPoints.length} pts)`}
                    {openingPoints.length > 0 && !openingClosed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpeningUndo(); }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: 'none',
                                color: 'white', borderRadius: '20px', padding: '2px 10px',
                                cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                            }}
                        >Undo</button>
                    )}
                    {openingPoints.length >= 3 && !openingClosed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setOpeningClosed(true); }}
                            style={{
                                background: '#22c55e', border: 'none',
                                color: 'white', borderRadius: '20px', padding: '2px 10px',
                                cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                            }}
                        >Close Shape</button>
                    )}
                    {openingClosed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpeningSave(); }}
                            style={{
                                background: '#3b82f6', border: 'none',
                                color: 'white', borderRadius: '20px', padding: '3px 14px',
                                cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                            }}
                        >Apply Opening</button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpeningPoints([]); setOpeningClosed(false); }}
                        style={{
                            background: 'rgba(255,255,255,0.2)', border: 'none',
                            color: 'white', borderRadius: '20px', padding: '2px 10px',
                            cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                        }}
                    >Reset</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpeningModeCancel?.(); }}
                        style={{
                            background: 'rgba(255,255,255,0.2)', border: 'none',
                            color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                            cursor: 'pointer', fontSize: '11px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >x</button>
                </div>
            )}

            {/* Coordinate display */}
            {isCustomMullionMode && cmMouseCoords && !is3DMode && (
                <div style={{
                    position: 'absolute', left: '50%', top: '50px', transform: 'translateX(-50%)',
                    background: 'white', padding: '4px 12px', borderRadius: '6px',
                    fontSize: '13px', fontWeight: '600', color: '#1e293b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 50, fontFamily: 'monospace',
                }}>
                    {Math.round(cmMouseCoords.x / scale)},{Math.round(cmMouseCoords.y / scale)}
                </div>
            )}

            {/* Opening coordinate display + L/A input */}
            {isOpeningMode && !is3DMode && (
                <div style={{
                    position: 'absolute', left: '50%', top: '50px', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: '12px', zIndex: 50,
                }}>
                    {/* Coordinate readout */}
                    <div style={{
                        background: 'white', padding: '4px 12px', borderRadius: '6px',
                        fontSize: '32px', fontWeight: '500', color: '#1e293b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: 'monospace',
                        letterSpacing: '-0.03em',
                    }}>
                        {Math.round(openingCursor.x)},{Math.round(openingCursor.y)}
                    </div>
                    {/* Length / Angle direct input */}
                    {!openingClosed && (
                        <div style={{
                            background: 'white', padding: '6px 10px', borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>L:</span>
                            <input
                                ref={openingLengthRef}
                                type="number"
                                value={openingLengthInput}
                                onChange={(e) => setOpeningLengthInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleOpeningAddByInput(); }}
                                placeholder="mm"
                                style={{
                                    width: '70px', padding: '4px 6px', border: '1px solid #e2e8f0',
                                    borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace',
                                    outline: 'none',
                                }}
                            />
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>A:</span>
                            <input
                                type="number"
                                value={openingAngleInput}
                                onChange={(e) => setOpeningAngleInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleOpeningAddByInput(); }}
                                placeholder="deg"
                                style={{
                                    width: '60px', padding: '4px 6px', border: '1px solid #e2e8f0',
                                    borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace',
                                    outline: 'none',
                                }}
                            />
                            <button
                                onClick={handleOpeningAddByInput}
                                style={{
                                    background: '#0f766e', color: 'white', border: 'none',
                                    borderRadius: '4px', padding: '4px 10px', fontSize: '12px',
                                    fontWeight: '600', cursor: 'pointer',
                                }}
                            >Add</button>
                            <button
                                onClick={() => setOpeningInputMode(!openingInputMode)}
                                style={{
                                    background: openingInputMode ? '#3b82f6' : '#e2e8f0',
                                    color: openingInputMode ? 'white' : '#64748b',
                                    border: 'none', borderRadius: '4px', padding: '4px 8px',
                                    fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                                }}
                                title="Toggle input-only mode (disable click drawing)"
                            >Input</button>
                        </div>
                    )}
                </div>
            )}

            {/* Drag overlay indicator */}
            {isDraggingPattern && !is3DMode && !isOpeningMode && (
                <div style={{
                    position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white',
                    padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', zIndex: 50,
                    animation: 'pulse 2s ease-in-out infinite',
                }}>
                    Drop on a panel to apply pattern
                </div>
            )}

            {/* ===== Konva 2D Canvas ===== */}
            {!is3DMode && !isCornerType && !isOpeningMode && (
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    scaleX={fitScale}
                    scaleY={fitScale}
                    offsetX={stageOffsetX}
                    offsetY={stageOffsetY}
                    style={{ cursor: 'pointer' }}
                    listening={true}
                >
                    <Layer>
                        <Group x={padding} y={padding}>
                            {/* Clipping group for custom opening polygon */}
                            <Group
                                clipFunc={openingPolygon && openingPolygon.length >= 3 ? (ctx) => {
                                    ctx.beginPath();
                                    openingPolygon.forEach((p, i) => {
                                        const px = p.x * displayWidth;
                                        const py = p.y * displayHeight;
                                        if (i === 0) ctx.moveTo(px, py);
                                        else ctx.lineTo(px, py);
                                    });
                                    ctx.closePath();
                                } : undefined}
                            >
                            {/* Window structure - flip for Outside view */}
                            <Group
                                x={isOutside ? displayWidth : 0}
                                scaleX={isOutside ? -1 : 1}
                            >
                                <WindowNode
                                    node={windowStructure}
                                    x={0} y={0}
                                    width={width} height={height}
                                    scale={scale}
                                selectedPanelId={selectedPanelId}
                                dragOverPanelId={dragOverPanelId}
                                path={[]}
                                isOutside={isOutside}
                                frameColor={activeFrameColor}
                            />
                            </Group>
                            </Group>

                            {/* Opening polygon outline (frame border) */}
                            {openingPolygon && openingPolygon.length >= 3 && (
                                <Line
                                    points={openingPolygon.flatMap(p => [p.x * displayWidth, p.y * displayHeight])}
                                    closed
                                    stroke={activeFrameColor || '#4a5568'}
                                    strokeWidth={3}
                                    listening={false}
                                />
                            )}

                            {/* Custom mullion preview */}
                            {isCustomMullionMode && (
                                <CustomMullionPreview
                                    cmStartPoint={cmStartPoint}
                                    cmPreviewPoint={cmPreviewPoint}
                                />
                            )}

                            {/* Default F1 Label (hidden when per-panel frame labels are available) */}
                            {!hasFrameLabels && (
                                <Group
                                    x={isOutside ? 30 : displayWidth - 30}
                                    y={displayHeight - 30}
                                >
                                    <Rect x={-10} y={-15} width={25} height={20}
                                        fill="white" stroke="#94a3b8" listening={false} />
                                    <CenteredText x={2} y={-5} text="F1" fontSize={12} fill="#64748b" fontStyle="normal" />
                                </Group>
                            )}

                            {/* Uploaded image — replaces the design view */}
                            {bgImage && (
                                <KonvaImage
                                    image={bgImage}
                                    x={0} y={0}
                                    width={displayWidth}
                                    height={displayHeight}
                                    listening={false}
                                />
                            )}

                            {/* Dimension lines */}
                            <DimensionLines
                                displayWidth={displayWidth}
                                displayHeight={displayHeight}
                                width={width}
                                height={height}
                                scale={scale}
                                isOutside={isOutside}
                                editingDimension={editingDimension}
                                onStartEditing={startEditing}
                            />

                            {/* Floor aperture */}
                            <FloorAperture
                                displayWidth={displayWidth}
                                displayHeight={displayHeight}
                                isOutside={isOutside}
                            />

                            {/* Individual panel dimensions */}
                            <PanelDimensions
                                windowStructure={windowStructure}
                                displayWidth={displayWidth}
                                displayHeight={displayHeight}
                                width={width}
                                height={height}
                                scale={scale}
                                isOutside={isOutside}
                            />
                        </Group>
                    </Layer>
                </Stage>
            )}

            {/* ===== Opening Custom Design Canvas ===== */}
            {!is3DMode && isOpeningMode && (
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    scaleX={fitScale}
                    scaleY={fitScale}
                    offsetX={stageOffsetX}
                    offsetY={stageOffsetY}
                    style={{ cursor: 'crosshair' }}
                    listening={false}
                >
                    <Layer>
                        <Group x={padding} y={padding}>
                            <Rect
                                x={0}
                                y={0}
                                width={displayWidth}
                                height={displayHeight}
                                fill="rgba(248, 250, 252, 0.4)"
                                stroke="#cbd5e1"
                                strokeWidth={1}
                                dash={[8, 6]}
                                listening={false}
                            />

                            {openingLinePoints.length >= 4 && (
                                <Line
                                    points={openingClosed
                                        ? [...openingLinePoints, openingLinePoints[0], openingLinePoints[1]]
                                        : openingLinePoints}
                                    stroke="#22a06b"
                                    strokeWidth={2.2}
                                    lineCap="round"
                                    lineJoin="round"
                                    closed={openingClosed}
                                    fill={openingClosed ? 'rgba(34, 197, 94, 0.08)' : undefined}
                                    listening={false}
                                />
                            )}

                            {openingPoints.slice(1).map((point, i) => {
                                const start = openingPoints[i];
                                const end = point;
                                const startDisplay = openingDisplayPoints[i];
                                const endDisplay = openingDisplayPoints[i + 1];
                                const midX = (startDisplay.x + endDisplay.x) / 2;
                                const midY = (startDisplay.y + endDisplay.y) / 2;
                                const segmentLength = getSegmentLength(start, end);
                                const segmentAngle = getSegmentAngle(start, end);
                                return (
                                    <Group key={`opening-segment-${i}`} listening={false}>
                                        <Rect
                                            x={midX - 48}
                                            y={midY - 10}
                                            width={96}
                                            height={18}
                                            fill="rgba(255,255,255,0.95)"
                                            stroke="#94a3b8"
                                            strokeWidth={0.8}
                                            cornerRadius={4}
                                        />
                                        <Text
                                            x={midX - 44}
                                            y={midY - 5}
                                            width={88}
                                            align="center"
                                            text={`L: ${Math.round(segmentLength)}  A: ${segmentAngle.toFixed(2)}`}
                                            fontSize={9}
                                            fontFamily="monospace"
                                            fill="#0f172a"
                                            fontStyle="bold"
                                            listening={false}
                                        />
                                    </Group>
                                );
                            })}

                            {openingPoints.length > 0 && !openingClosed && (
                                <>
                                    {/* Dashed preview line from last point to cursor */}
                                    <Line
                                        points={[
                                            openingDisplayPoints[openingDisplayPoints.length - 1].x,
                                            openingDisplayPoints[openingDisplayPoints.length - 1].y,
                                            openingCursorDisplay.x,
                                            openingCursorDisplay.y,
                                        ]}
                                        stroke="#64748b"
                                        strokeWidth={1.4}
                                        dash={[6, 4]}
                                        lineCap="round"
                                        listening={false}
                                    />
                                    {/* Dashed preview line from cursor to first point (close preview) */}
                                    {openingPoints.length >= 3 && (
                                        <Line
                                            points={[
                                                openingCursorDisplay.x, openingCursorDisplay.y,
                                                openingDisplayPoints[0].x, openingDisplayPoints[0].y,
                                            ]}
                                            stroke="#94a3b8"
                                            strokeWidth={1}
                                            dash={[4, 4]}
                                            listening={false}
                                        />
                                    )}

                                    {/* Red horizontal reference line at cursor */}
                                    <Line
                                        points={[
                                            openingCursorDisplay.x - 45,
                                            openingCursorDisplay.y,
                                            openingCursorDisplay.x + 45,
                                            openingCursorDisplay.y,
                                        ]}
                                        stroke="#ef4444"
                                        strokeWidth={1.2}
                                        listening={false}
                                    />

                                    <Group listening={false}>
                                        {(() => {
                                            const start = openingPoints[openingPoints.length - 1];
                                            const end = openingCursor;
                                            const dist = getSegmentLength(start, end);
                                            const angle = getSegmentAngle(start, end);
                                            const midX = (openingDisplayPoints[openingDisplayPoints.length - 1].x + openingCursorDisplay.x) / 2;
                                            const midY = (openingDisplayPoints[openingDisplayPoints.length - 1].y + openingCursorDisplay.y) / 2;
                                            return (
                                                <>
                                                    <Rect
                                                        x={midX - 50}
                                                        y={midY - 11}
                                                        width={100}
                                                        height={20}
                                                        fill="rgba(255,255,255,0.95)"
                                                        stroke="#94a3b8"
                                                        cornerRadius={5}
                                                    />
                                                    <Text
                                                        x={midX - 46}
                                                        y={midY - 6}
                                                        width={92}
                                                        align="center"
                                                        text={`L: ${Math.round(dist)}  A: ${angle.toFixed(2)}`}
                                                        fontSize={10}
                                                        fontFamily="monospace"
                                                        fontStyle="bold"
                                                        fill="#0f172a"
                                                    />
                                                </>
                                            );
                                        })()}
                                    </Group>
                                </>
                            )}

                            {openingDisplayPoints.map((displayPoint, index) => {
                                const currentPoint = openingPoints[index];
                                const previousPoint = openingPoints[index - 1];
                                const nextPoint = openingPoints[index + 1];
                                const heading = previousPoint ? getSegmentAngle(previousPoint, currentPoint) : null;
                                const vertex = previousPoint && nextPoint
                                    ? getVertexAngle(previousPoint, currentPoint, nextPoint)
                                    : null;

                                return (
                                    <Group key={`opening-point-${index}`} listening={false}>
                                        <Circle
                                            x={displayPoint.x}
                                            y={displayPoint.y}
                                            radius={8}
                                            fill="white"
                                            stroke="#475569"
                                            strokeWidth={2}
                                        />
                                        <Circle
                                            x={displayPoint.x}
                                            y={displayPoint.y}
                                            radius={2}
                                            fill="#334155"
                                        />
                                        {heading !== null && (
                                            <Text
                                                x={displayPoint.x + 10}
                                                y={displayPoint.y - 14}
                                                text={`${Math.round(heading)}°`}
                                                fontSize={10}
                                                fill="#334155"
                                            />
                                        )}
                                        {vertex && (
                                            <Text
                                                x={displayPoint.x + 10}
                                                y={displayPoint.y + 2}
                                                text={`${vertex.interior}° / ${vertex.external}°`}
                                                fontSize={9}
                                                fill="#64748b"
                                            />
                                        )}
                                    </Group>
                                );
                            })}

                            {!openingClosed && (
                                <Group x={openingCursorDisplay.x} y={openingCursorDisplay.y} listening={false}>
                                    <Circle radius={10} stroke="#16a34a" strokeWidth={1.4} dash={[4, 3]} />
                                    <Line points={[-8, 0, 8, 0]} stroke="#16a34a" strokeWidth={1.4} />
                                    <Line points={[0, -8, 0, 8]} stroke="#16a34a" strokeWidth={1.4} />
                                </Group>
                            )}
                        </Group>
                    </Layer>
                </Stage>
            )}

            {/* Dimension editing HTML overlay */}
            {editingDimension && !isOpeningMode && (
                <input
                    ref={editInputRef}
                    type="text"
                    inputMode="text"
                    value={editValue}
                    placeholder="mm or e.g. 3f"
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={confirmEdit}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        left: `${editPos.x - 30}px`,
                        top: `${editPos.y - 12}px`,
                        width: '60px',
                        height: '24px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        border: '1.5px solid #3b82f6',
                        borderRadius: '3px',
                        background: '#dbeafe',
                        color: '#1e293b',
                        outline: 'none',
                        zIndex: 100,
                        padding: '0',
                        margin: '0',
                        boxSizing: 'border-box',
                    }}
                />
            )}

            {/* 3D View */}
            {is3DMode && !isCornerType && !isOpeningMode && (
                <Window3DView windowStructure={windowStructure} width={width} height={height} />
            )}

            {/* Corner Joint 3D */}
            {isCornerType && !isOpeningMode && (
                <CornerJoint3DInline
                    width={width / 2} height={height}
                    width2={width / 2} onDimensionChange={onDimensionChange}
                />
            )}

            {/* Inside/Outside View Toggle */}
            {!is3DMode && (
                <div style={{
                    position: 'absolute', bottom: '45px', left: '20px',
                    background: '#e2e8f0', padding: '3px', borderRadius: '20px',
                    display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 30,
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewMode('inside'); }}
                        style={{
                            padding: '6px 18px', borderRadius: '16px', border: 'none',
                            background: viewMode === 'inside' ? '#64748b' : 'transparent',
                            color: viewMode === 'inside' ? '#fff' : '#94a3b8',
                            fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >Inside</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewMode('outside'); }}
                        style={{
                            padding: '6px 18px', borderRadius: '16px', border: 'none',
                            background: viewMode === 'outside' ? '#64748b' : 'transparent',
                            color: viewMode === 'outside' ? '#fff' : '#94a3b8',
                            fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >Outside</button>
                </div>
            )}

            {/* Bottom Center Toolbar */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '8px', background: 'white', padding: '8px',
                borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 30,
            }}>
                {/* Undo */}
                <button
                    onClick={(e) => { e.stopPropagation(); onUndo?.(); }}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                    style={{
                        width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px',
                        background: 'white', cursor: canUndo ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: canUndo ? 1 : 0.5, transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canUndo ? '#475569' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v6h6"></path>
                        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                    </svg>
                </button>
                {/* Redo */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRedo?.(); }}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                    style={{
                        width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px',
                        background: 'white', cursor: canRedo ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: canRedo ? 1 : 0.5, transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canRedo ? '#475569' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 7v6h-6"></path>
                        <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
                    </svg>
                </button>
                {/* 3D Toggle */}
                <button
                    onClick={() => {
                        if (!isOpeningMode) setIs3DMode(!is3DMode);
                    }}
                    title={isOpeningMode ? '3D disabled in Opening mode' : (is3DMode ? 'Switch to 2D View' : 'Switch to 3D View')}
                    style={{
                        width: '32px', height: '32px',
                        border: is3DMode ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '4px', background: is3DMode ? '#eff6ff' : 'white',
                        cursor: isOpeningMode ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: is3DMode ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none',
                        opacity: isOpeningMode ? 0.5 : 1,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={is3DMode ? '#3b82f6' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                </button>
                {/* Clear */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOpeningMode) {
                            setOpeningPoints([]);
                            setOpeningClosed(false);
                            return;
                        }
                        onClear?.();
                    }}
                    title={isOpeningMode ? 'Clear Opening Points' : 'Clear Design (Reset to Default)'}
                    style={{
                        width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px',
                        background: 'white', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
