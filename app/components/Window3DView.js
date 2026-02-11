'use client';
import { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// 3D Building Blocks
// ==========================================

// Frame Bar — a single bar of the window frame profile
function FrameBar({ position, size, color = '#f0ece4' }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
    );
}

// Glass Panel — transparent blue glass
function GlassPanel({ position, size }) {
    return (
        <mesh position={position} castShadow>
            <boxGeometry args={size} />
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

// Single Window Unit — a complete frame + glass
function WindowUnit({ width, height, position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const frameDepth = 0.06;
    const frameThick = 0.05;
    const halfW = width / 2;
    const halfH = height / 2;

    return (
        <group position={position} rotation={rotation}>
            {/* Top bar */}
            <FrameBar position={[0, halfH, 0]} size={[width + frameThick, frameThick, frameDepth]} />
            {/* Bottom bar */}
            <FrameBar position={[0, -halfH, 0]} size={[width + frameThick, frameThick, frameDepth]} />
            {/* Left bar */}
            <FrameBar position={[-halfW, 0, 0]} size={[frameThick, height, frameDepth]} />
            {/* Right bar */}
            <FrameBar position={[halfW, 0, 0]} size={[frameThick, height, frameDepth]} />
            {/* Glass */}
            <GlassPanel
                position={[0, 0, 0]}
                size={[width - frameThick, height - frameThick, 0.01]}
            />
        </group>
    );
}

// Mullion Bar — vertical or horizontal divider between panels
function MullionBar3D({ position, size, color = '#d8d8d0' }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
        </mesh>
    );
}

// ==========================================
// Recursive 3D Window Builder
// ==========================================

function build3DWindowNode(node, x, y, width, height, elements = [], labelElements = []) {
    const meterScale = 1 / 1000; // mm to meters
    const w = width * meterScale;
    const h = height * meterScale;
    const cx = x * meterScale + w / 2;
    const cy = -(y * meterScale + h / 2); // flip Y for 3D (Y-up)

    if (node.type === 'glass') {
        elements.push(
            <WindowUnit
                key={`wu-${node.id}`}
                width={w}
                height={h}
                position={[cx, cy, 0]}
            />
        );
        // Dimension label
        labelElements.push(
            <Html key={`label-${node.id}`} position={[cx, cy, 0.05]} center>
                <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#475569',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}>
                    {Math.round(width)} × {Math.round(height)}
                </div>
            </Html>
        );
    } else if (node.type === 'split-vertical') {
        const childWidths = node.ratios.map(r => width * r);
        let currentX = x;
        const mullionWidth = 5; // mm

        node.children.forEach((child, i) => {
            build3DWindowNode(child, currentX, y, childWidths[i], height, elements, labelElements);

            // Add vertical mullion bar between children
            if (i < node.children.length - 1) {
                const mullionX = (currentX + childWidths[i]) * meterScale;
                const mullionCY = -(y * meterScale + h / 2);
                elements.push(
                    <MullionBar3D
                        key={`mullion-v-${i}-${currentX}`}
                        position={[mullionX, mullionCY, 0]}
                        size={[mullionWidth * meterScale, h, 0.065]}
                    />
                );
            }
            currentX += childWidths[i];
        });
    } else if (node.type === 'split-horizontal') {
        const childHeights = node.ratios.map(r => height * r);
        let currentY = y;
        const mullionHeight = 5; // mm

        node.children.forEach((child, i) => {
            build3DWindowNode(child, x, currentY, width, childHeights[i], elements, labelElements);

            // Add horizontal mullion bar between children
            if (i < node.children.length - 1) {
                const mullionY = -((currentY + childHeights[i]) * meterScale);
                const mullionCX = x * meterScale + w / 2;
                elements.push(
                    <MullionBar3D
                        key={`mullion-h-${i}-${currentY}`}
                        position={[mullionCX, mullionY, 0]}
                        size={[w, mullionHeight * meterScale, 0.065]}
                    />
                );
            }
            currentY += childHeights[i];
        });
    } else if (node.type === 'coupling-bar') {
        // Coupling bar rendered as a thicker divider
        const barW = width * meterScale;
        const barH = height * meterScale;
        elements.push(
            <MullionBar3D
                key={`coupling-${node.id}`}
                position={[cx, cy, 0]}
                size={[barW, barH, 0.07]}
                color="#c0c0b8"
            />
        );
    }

    return { elements, labelElements };
}

// ==========================================
// Scene & Assembly
// ==========================================

function WindowAssembly({ windowStructure, width, height }) {
    const groupRef = useRef();

    // Subtle breathing animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
        }
    });

    const { elements, labelElements } = useMemo(() => {
        const result = build3DWindowNode(windowStructure, 0, 0, width, height);
        return result;
    }, [windowStructure, width, height]);

    // Center offset (so the model is centered at origin)
    const totalW = width / 1000;
    const totalH = height / 1000;

    return (
        <group ref={groupRef} position={[-totalW / 2, totalH / 2, 0]}>
            {elements}
            {labelElements}
        </group>
    );
}

function Scene({ windowStructure, width, height }) {
    // Calculate camera distance based on window size
    const maxDim = Math.max(width, height) / 1000;
    const camDist = maxDim * 1.8;

    return (
        <>
            <PerspectiveCamera makeDefault position={[camDist * 0.8, camDist * 0.5, camDist]} fov={40} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[5, 8, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <directionalLight position={[-3, 4, -3]} intensity={0.4} />
            <pointLight position={[0, 3, 0]} intensity={0.3} />

            <Environment preset="city" />

            <WindowAssembly
                windowStructure={windowStructure}
                width={width}
                height={height}
            />

            <ContactShadows
                position={[0, -(height / 2000) - 0.05, 0]}
                opacity={0.3}
                scale={5}
                blur={2.5}
                far={4}
            />

            <gridHelper
                args={[6, 30, '#d4d4d8', '#e4e4e7']}
                position={[0, -(height / 2000) - 0.06, 0]}
            />

            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={0.5}
                maxDistance={8}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={0.2}
                autoRotate={false}
                target={[0, 0, 0]}
                dampingFactor={0.05}
                enableDamping={true}
            />
        </>
    );
}

// ==========================================
// Loading Spinner
// ==========================================

function LoadingOverlay() {
    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            zIndex: 10,
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin3d 1s linear infinite',
            }} />
            <div style={{
                marginTop: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
            }}>
                Loading 3D View...
            </div>
            <div style={{
                marginTop: '6px',
                fontSize: '11px',
                color: '#94a3b8',
            }}>
                Preparing your window model
            </div>
            <style>{`
                @keyframes spin3d {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ==========================================
// Rotation Hint
// ==========================================

function RotationHint3D() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '80px',
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
            animation: 'fadeHint 4s ease-in-out forwards',
            pointerEvents: 'none',
            zIndex: 20,
        }}>
            <span style={{ fontSize: '16px' }}>🖱️</span>
            Drag to rotate • Scroll to zoom • Right-click to pan
            <style>{`
                @keyframes fadeHint {
                    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    75% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// ==========================================
// Dimension Info Bar
// ==========================================

function DimensionInfoBar({ width, height, windowStructure }) {
    // Count panels
    const countPanels = (node) => {
        if (node.type === 'glass') return 1;
        if (node.children) return node.children.reduce((sum, c) => sum + countPanels(c), 0);
        return 0;
    };
    const panelCount = countPanels(windowStructure);

    // Determine structure type
    const getStructureType = (node) => {
        if (node.type === 'glass') return 'Single Panel';
        if (node.mullionType === 'corner') return 'Corner 90°';
        if (node.mullionType === 'bay') return 'Bay 135°';
        if (node.mullionType === 'coupling') return 'Coupling';
        if (node.type === 'split-vertical') return `Vertical Split (${node.children?.length || 0})`;
        if (node.type === 'split-horizontal') return `Horizontal Split (${node.children?.length || 0})`;
        return 'Custom';
    };

    return (
        <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            padding: '8px 20px',
            borderRadius: '10px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            zIndex: 20,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    {width} × {height} mm
                </span>
            </div>
            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    {panelCount} Panel{panelCount > 1 ? 's' : ''}
                </span>
            </div>
            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    {getStructureType(windowStructure)}
                </span>
            </div>
        </div>
    );
}

// ==========================================
// Main Export
// ==========================================

export default function Window3DView({ windowStructure, width, height }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Simulate a brief loading delay for smooth transition
        const timer = setTimeout(() => setIsLoaded(true), 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)',
        }}>
            {!isLoaded && <LoadingOverlay />}

            <div style={{
                width: '100%',
                height: '100%',
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease',
            }}>
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: true }}
                    style={{ background: 'transparent' }}
                    onCreated={() => {
                        // Canvas is ready
                    }}
                >
                    <Suspense fallback={
                        <Html center>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>Initializing...</div>
                        </Html>
                    }>
                        <Scene
                            windowStructure={windowStructure}
                            width={width}
                            height={height}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Info bar at top */}
            {isLoaded && (
                <DimensionInfoBar
                    width={width}
                    height={height}
                    windowStructure={windowStructure}
                />
            )}

            {/* Rotation hint */}
            {isLoaded && <RotationHint3D />}
        </div>
    );
}
