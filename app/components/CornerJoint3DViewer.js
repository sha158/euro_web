'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Window Frame Profile (extruded L-shape cross section)
function FrameProfile({ width, height, depth = 0.07, color = '#f5f5f0' }) {
    const meshRef = useRef();

    // Create a window frame as a box with a hole (using 4 bars)
    const frameThickness = 0.06;

    return (
        <group>
            {/* Top bar */}
            <mesh position={[width / 2, height, depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[width + frameThickness, frameThickness, depth]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Bottom bar */}
            <mesh position={[width / 2, 0, depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[width + frameThickness, frameThickness, depth]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Left bar */}
            <mesh position={[0, height / 2, depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[frameThickness, height, depth]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Right bar */}
            <mesh position={[width, height / 2, depth / 2]} castShadow receiveShadow>
                <boxGeometry args={[frameThickness, height, depth]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
            </mesh>
        </group>
    );
}

// Glass Panel
function GlassPanel({ width, height, depth = 0.012, position = [0, 0, 0] }) {
    return (
        <mesh position={position} castShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshPhysicalMaterial
                color="#b3d9ff"
                transparent
                opacity={0.35}
                roughness={0.05}
                metalness={0.0}
                transmission={0.6}
                thickness={0.5}
                envMapIntensity={1}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />
        </mesh>
    );
}

// Mullion Bar (the connector piece between frames)
function MullionBar({ height, depth = 0.07, position = [0, 0, 0] }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={[0.06, height, depth]} />
            <meshStandardMaterial color="#e8e8e0" roughness={0.3} metalness={0.15} />
        </mesh>
    );
}

// Corner Connector (the L-shaped junction piece)
function CornerConnector({ height, size = 0.08 }) {
    return (
        <group>
            {/* Vertical corner post */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[size, height + 0.06, size]} />
                <meshStandardMaterial color="#d4d4cc" roughness={0.25} metalness={0.2} />
            </mesh>
        </group>
    );
}

// Single Window Unit with frame + glass
function WindowUnit({ width, height, frameColor = '#f5f5f0', position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const frameDepth = 0.07;
    const frameThickness = 0.06;

    return (
        <group position={position} rotation={rotation}>
            {/* Frame */}
            <FrameProfile width={width} height={height} depth={frameDepth} color={frameColor} />

            {/* Glass */}
            <GlassPanel
                width={width - frameThickness}
                height={height - frameThickness}
                position={[width / 2, height / 2, frameDepth / 2]}
            />
        </group>
    );
}

// Editable dimension label component (used in 3D scene)
function EditableDimensionLabel({ position, value, dimensionKey, editingDimension, editValue, onStartEdit, onEditChange, onEditKeyDown, onEditBlur }) {
    const inputRef = useRef(null);
    const isEditing = editingDimension === dimensionKey;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '600',
        color: '#475569',
        background: isEditing ? '#dbeafe' : 'rgba(255,255,255,0.9)',
        padding: '2px 8px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        border: isEditing ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        minWidth: '50px',
        textAlign: 'center',
    };

    return (
        <Html position={position} center>
            {isEditing ? (
                <div style={labelStyle}>
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={editValue}
                        onChange={(e) => onEditChange(e.target.value)}
                        onKeyDown={onEditKeyDown}
                        onBlur={onEditBlur}
                        style={{
                            width: '45px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#1e293b',
                            outline: 'none',
                            textAlign: 'center',
                            padding: '0',
                            margin: '0',
                            fontFamily: 'inherit',
                        }}
                    />
                    <span style={{ color: '#64748b', marginLeft: '1px' }}>mm</span>
                </div>
            ) : (
                <div
                    style={labelStyle}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(dimensionKey, Math.round(value * 1000));
                    }}
                >
                    {Math.round(value * 1000)} mm
                </div>
            )}
        </Html>
    );
}

// Complete L-Joint Corner Assembly
function LJointAssembly({ width1 = 1.4, width2 = 1.4, height = 1.1, frameColor = '#f5f5f0', editingDimension, editValue, onStartEdit, onEditChange, onEditKeyDown, onEditBlur }) {
    const groupRef = useRef();

    // Subtle floating animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* First window - facing forward (along Z axis) */}
            <WindowUnit
                width={width1}
                height={height}
                frameColor={frameColor}
                position={[-width1, 0, 0]}
            />

            {/* Corner connector post */}
            <CornerConnector height={height} />

            {/* Second window - facing right (rotated 90° along Y axis) */}
            <WindowUnit
                width={width2}
                height={height}
                frameColor={frameColor}
                position={[0, 0, 0]}
                rotation={[0, -Math.PI / 2, 0]}
            />

            {/* Wall indication - subtle wireframe to show corner */}
            <mesh position={[-width1 / 2 - 0.05, height / 2, -0.04]} receiveShadow>
                <planeGeometry args={[width1 + 0.1, height + 0.12]} />
                <meshStandardMaterial
                    color="#f0ece4"
                    roughness={0.9}
                    metalness={0}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0.04, height / 2, -width2 / 2 - 0.05]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[width2 + 0.1, height + 0.12]} />
                <meshStandardMaterial
                    color="#f0ece4"
                    roughness={0.9}
                    metalness={0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Floor line (sill) */}
            <mesh position={[-width1 / 2, -0.04, -width2 / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[width1 + 0.3, width2 + 0.3]} />
                <meshStandardMaterial
                    color="#e8e4dc"
                    roughness={0.95}
                    metalness={0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Editable Dimension labels */}
            <EditableDimensionLabel
                position={[-width1 / 2, -0.15, 0.15]}
                value={width1}
                dimensionKey="width1"
                editingDimension={editingDimension}
                editValue={editValue}
                onStartEdit={onStartEdit}
                onEditChange={onEditChange}
                onEditKeyDown={onEditKeyDown}
                onEditBlur={onEditBlur}
            />
            <EditableDimensionLabel
                position={[0.15, -0.15, -width2 / 2]}
                value={width2}
                dimensionKey="width2"
                editingDimension={editingDimension}
                editValue={editValue}
                onStartEdit={onStartEdit}
                onEditChange={onEditChange}
                onEditKeyDown={onEditKeyDown}
                onEditBlur={onEditBlur}
            />
            <EditableDimensionLabel
                position={[0.25, height / 2, 0.05]}
                value={height}
                dimensionKey="height"
                editingDimension={editingDimension}
                editValue={editValue}
                onStartEdit={onStartEdit}
                onEditChange={onEditChange}
                onEditKeyDown={onEditKeyDown}
                onEditBlur={onEditBlur}
            />
        </group>
    );
}

// Scene setup with lighting
function Scene({ width1, width2, height, frameColor, editingDimension, editValue, onStartEdit, onEditChange, onEditKeyDown, onEditBlur }) {
    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={45} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={20}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={5}
                shadow-camera-bottom={-5}
            />
            <directionalLight position={[-3, 4, -3]} intensity={0.4} />
            <pointLight position={[0, 3, 0]} intensity={0.3} />

            {/* Environment for reflections */}
            <Environment preset="city" />

            {/* The L-Joint Assembly */}
            <LJointAssembly
                width1={width1}
                width2={width2}
                height={height}
                frameColor={frameColor}
                editingDimension={editingDimension}
                editValue={editValue}
                onStartEdit={onStartEdit}
                onEditChange={onEditChange}
                onEditKeyDown={onEditKeyDown}
                onEditBlur={onEditBlur}
            />

            {/* Contact shadows on the ground */}
            <ContactShadows
                position={[0, -0.05, 0]}
                opacity={0.3}
                scale={5}
                blur={2.5}
                far={4}
            />

            {/* Grid floor */}
            <gridHelper args={[6, 30, '#d4d4d8', '#e4e4e7']} position={[0, -0.06, 0]} />

            {/* Orbit Controls - allows free rotation */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={1}
                maxDistance={8}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={0.2}
                autoRotate={false}
                target={[0, 0.5, 0]}
                dampingFactor={0.05}
                enableDamping={true}
            />
        </>
    );
}

// Loading fallback
function LoadingFallback() {
    return (
        <Html center>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: '13px', color: '#64748b' }}>Loading 3D View...</div>
            </div>
        </Html>
    );
}

// Main Export: The 3D Viewer Modal
export default function CornerJoint3DViewer({
    isOpen,
    onClose,
    width = 1500,     // in mm
    height = 1100,    // in mm
    width2 = 1500,    // second panel width in mm
    frameColor = '#f5f5f0',
    onApply = null,
}) {
    const [viewMode, setViewMode] = useState('3d'); // '3d' or 'front' or 'top'

    if (!isOpen) return null;

    // Convert mm to meters for 3D scene scale
    const w1 = width / 1000;
    const w2 = width2 / 1000;
    const h = height / 1000;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
        }}>
            {/* Modal Container */}
            <div style={{
                width: '85vw',
                maxWidth: '1100px',
                height: '75vh',
                maxHeight: '700px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    background: 'linear-gradient(to right, #f8fafc, #fff)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                        }}>
                            🔲
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                                L Joint — Corner 90° View
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Drag to rotate • Scroll to zoom • Right-click to pan
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* View Presets */}
                        <div style={{
                            display: 'flex',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '3px',
                            gap: '2px',
                        }}>
                            {[
                                { id: '3d', label: '3D', icon: '🧊' },
                                { id: 'front', label: 'Front', icon: '⬜' },
                                { id: 'top', label: 'Top', icon: '⬇' },
                            ].map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setViewMode(v.id)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: viewMode === v.id ? 'white' : 'transparent',
                                        color: viewMode === v.id ? '#1e293b' : '#64748b',
                                        fontSize: '12px',
                                        fontWeight: viewMode === v.id ? '600' : '400',
                                        cursor: 'pointer',
                                        boxShadow: viewMode === v.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <span>{v.icon}</span> {v.label}
                                </button>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#64748b',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.borderColor = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 3D Canvas */}
                <div style={{ flex: 1, position: 'relative', background: '#fafafa' }}>
                    <Canvas
                        shadows
                        dpr={[1, 2]}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)' }}
                    >
                        <Suspense fallback={<LoadingFallback />}>
                            <Scene
                                width1={w1}
                                width2={w2}
                                height={h}
                                frameColor={frameColor}
                            />
                        </Suspense>
                    </Canvas>

                    {/* Rotation hint overlay (appears briefly) */}
                    <RotationHint />
                </div>

                {/* Footer with dimensions info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    borderTop: '1px solid #f1f5f9',
                    background: '#fafafa',
                }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }} />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Panel 1: {width} × {height} mm</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Panel 2: {width2} × {height} mm</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} />
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Corner Angle: 90°</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#64748b',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: '500',
                            }}
                        >
                            Close
                        </button>
                        {onApply && (
                            <button
                                onClick={onApply}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                Apply Corner Joint
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Keyframe style for spinner */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// Small overlay that shows rotation hint and fades out
function RotationHint() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 41, 59, 0.85)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeOut 3s ease-in-out',
            pointerEvents: 'none',
        }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            Click and drag to rotate the 3D view
            <style>{`
                @keyframes fadeOut {
                    0% { opacity: 1; }
                    70% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// Inline 3D Corner View (no modal, renders directly in canvas)
export function CornerJoint3DInline({
    width = 1500,
    height = 1100,
    width2 = 1500,
    frameColor = '#f5f5f0',
    onDimensionChange,
}) {
    const w1 = width / 1000;
    const w2 = width2 / 1000;
    const h = height / 1000;

    const [editingDimension, setEditingDimension] = useState(null); // null, 'width1', 'width2', 'height'
    const [editValue, setEditValue] = useState('');

    const handleStartEdit = (dimensionKey, currentValue) => {
        setEditingDimension(dimensionKey);
        setEditValue(String(currentValue));
    };

    const handleConfirm = () => {
        const numVal = parseInt(editValue);
        if (!isNaN(numVal) && numVal > 0 && onDimensionChange) {
            if (editingDimension === 'width1' || editingDimension === 'width2') {
                // Each panel is half the total width, so total = panel * 2
                onDimensionChange('width', numVal * 2);
            } else if (editingDimension === 'height') {
                onDimensionChange('height', numVal);
            }
        }
        setEditingDimension(null);
        setEditValue('');
    };

    const handleCancel = () => {
        setEditingDimension(null);
        setEditValue('');
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)', borderRadius: '12px' }}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <Scene
                        width1={w1}
                        width2={w2}
                        height={h}
                        frameColor={frameColor}
                        editingDimension={editingDimension}
                        editValue={editValue}
                        onStartEdit={handleStartEdit}
                        onEditChange={setEditValue}
                        onEditKeyDown={handleEditKeyDown}
                        onEditBlur={handleConfirm}
                    />
                </Suspense>
            </Canvas>
            <RotationHint />
            {/* Info badge */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255,255,255,0.9)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#475569',
                border: '1px solid #e2e8f0',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                🔲 L Joint — Corner 90°
            </div>
            {/* Dimension info */}
            <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                display: 'flex',
                gap: '12px',
            }}>
                {[
                    { color: '#3b82f6', label: `Panel 1: ${width} × ${height} mm` },
                    { color: '#10b981', label: `Panel 2: ${width2} × ${height} mm` },
                    { color: '#f59e0b', label: 'Corner: 90°' },
                ].map((item, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.9)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '2px' }} />
                        {item.label}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
