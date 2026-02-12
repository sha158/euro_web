'use client';
import { useState, use, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import WindowCanvas from '../../../components/WindowCanvas';
import MullionModal from '../../../components/MullionModal';
import MultipleMullionModal from '../../../components/MultipleMullionModal';
import MullionPalette from '../../../components/MullionPalette';

// Dynamic import for 3D Viewer (Three.js doesn't support SSR)


export default function DesignConfiguratorPage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    // State for sidebar visibility and edit mode
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMullionModalOpen, setIsMullionModalOpen] = useState(false);
    const [isMultipleMullionModalOpen, setIsMultipleMullionModalOpen] = useState(false);
    const [selectedPanelId, setSelectedPanelId] = useState(null);
    const [selectedPanelPath, setSelectedPanelPath] = useState([]);
    const [pendingPattern, setPendingPattern] = useState(null);
    const [pendingPanelId, setPendingPanelId] = useState(null);
    const [pendingPanelPath, setPendingPanelPath] = useState([]);
    const [isDraggingPattern, setIsDraggingPattern] = useState(false);
    const [isCustomMullionMode, setIsCustomMullionMode] = useState(false);


    // Use ref for panel ID counter to persist across renders
    const panelIdCounter = useRef(1);

    // State for window structure (recursive tree)
    const [windowStructure, setWindowStructure] = useState({
        type: 'glass',
        id: '1'
    });

    // Undo/Redo history
    const historyRef = useRef({
        past: [],    // stack of previous windowStructure states
        future: [],  // stack of "redo" states
    });
    const [historyVersion, setHistoryVersion] = useState(0); // trigger re-render for canUndo/canRedo

    // Push a new structure change (records current state in history)
    const pushStructure = useCallback((newStructure) => {
        setWindowStructure((prev) => {
            historyRef.current.past.push(JSON.parse(JSON.stringify(prev)));
            historyRef.current.future = []; // clear redo stack on new action
            // Keep history bounded to 50 entries
            if (historyRef.current.past.length > 50) {
                historyRef.current.past.shift();
            }
            setHistoryVersion(v => v + 1);
            return typeof newStructure === 'function' ? newStructure(prev) : newStructure;
        });
    }, []);

    const handleUndo = useCallback(() => {
        const { past, future } = historyRef.current;
        if (past.length === 0) return;
        const previousState = past.pop();
        setWindowStructure((current) => {
            future.push(JSON.parse(JSON.stringify(current)));
            setHistoryVersion(v => v + 1);
            return previousState;
        });
    }, []);

    const handleRedo = useCallback(() => {
        const { past, future } = historyRef.current;
        if (future.length === 0) return;
        const nextState = future.pop();
        setWindowStructure((current) => {
            past.push(JSON.parse(JSON.stringify(current)));
            setHistoryVersion(v => v + 1);
            return nextState;
        });
    }, []);

    const canUndo = historyRef.current.past.length > 0;
    const canRedo = historyRef.current.future.length > 0;

    // Clear design to default state
    const handleClear = useCallback(() => {
        // Reset window structure to single glass panel
        setWindowStructure({
            type: 'glass',
            id: '1'
        });

        // Reset dimensions to default (1500 x 1500)
        setConfig(prev => ({
            ...prev,
            width: 1500,
            height: 1500
        }));

        // Clear history
        historyRef.current.past = [];
        historyRef.current.future = [];
        setHistoryVersion(v => v + 1);

        // Reset panel ID counter
        panelIdCounter.current = 1;

        // Clear selections
        setSelectedPanelId(null);
        setSelectedPanelPath([]);
    }, []);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if (
                ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
            ) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const handleApply = () => {
        setIsSidebarOpen(false);
    };

    // Helper function to find and update a specific panel in the tree
    const updatePanelInTree = (node, targetPath, newNode) => {
        // If targetPath is empty or we're at the target, replace the node
        if (targetPath.length === 0) {
            return newNode;
        }

        // If this is a glass node, check if it matches the target
        if (node.type === 'glass') {
            // The last element in targetPath is the panel ID
            if (targetPath.length === 1 && node.id === targetPath[0]) {
                return newNode;
            }
            return node;
        }

        // For split nodes, recursively update children
        if (node.type === 'split-vertical' || node.type === 'split-horizontal') {
            // First element of path should be a child index
            const childIndex = targetPath[0];

            // If the path starts with a number (child index)
            if (typeof childIndex === 'number' && childIndex < node.children.length) {
                const newChildren = node.children.map((child, i) => {
                    if (i === childIndex) {
                        // Continue down this path
                        return updatePanelInTree(child, targetPath.slice(1), newNode);
                    }
                    return child;
                });

                return {
                    ...node,
                    children: newChildren
                };
            }

            // If path starts with a panel ID, search all children
            const newChildren = node.children.map((child) => {
                return updatePanelInTree(child, targetPath, newNode);
            });

            return {
                ...node,
                children: newChildren
            };
        }

        return node;
    };

    const handleMullionSelect = (pattern) => {
        // Check if pattern requires configuration
        if (pattern.requiresConfig) {
            setPendingPattern(pattern);
            // Store the current selection to preserve it through modal transitions
            setPendingPanelId(selectedPanelId);
            setPendingPanelPath([...selectedPanelPath]);
            console.log('Storing pending panel:', { selectedPanelId, selectedPanelPath });
            setIsMullionModalOpen(false);
            setIsMultipleMullionModalOpen(true);
            return;
        }

        // Apply the selected pattern to the whole window or selected panel
        if (!selectedPanelId) {
            // Apply to whole window
            applyPatternToWholeWindow(pattern);
        } else {
            // Apply to selected panel
            applyPatternToPanel(pattern, selectedPanelId, selectedPanelPath);
        }

        setIsMullionModalOpen(false);
    };

    const applyPatternToWholeWindow = (pattern) => {
        if (pattern.type === 'vertical') {
            const ratios = Array(pattern.divisions).fill(1 / pattern.divisions);
            pushStructure({
                type: 'split-vertical',
                ratios: ratios,
                children: Array(pattern.divisions).fill(null).map((_, i) => ({
                    type: 'glass',
                    id: String(i + 1)
                }))
            });
        } else if (pattern.type === 'horizontal') {
            const ratios = Array(pattern.divisions).fill(1 / pattern.divisions);
            pushStructure({
                type: 'split-horizontal',
                ratios: ratios,
                children: Array(pattern.divisions).fill(null).map((_, i) => ({
                    type: 'glass',
                    id: String(i + 1)
                }))
            });
        } else if (pattern.type === 'l-joint') {
            pushStructure({
                type: 'split-vertical',
                ratios: [0.5, 0.5],
                children: [
                    { type: 'glass', id: '1' },
                    {
                        type: 'split-horizontal',
                        ratios: [0.5, 0.5],
                        children: [
                            { type: 'glass', id: '2' },
                            { type: 'glass', id: '3' }
                        ]
                    }
                ]
            });
        }
    };

    const applyPatternToPanel = (pattern, panelId, panelPath) => {
        console.log('Applying pattern to panel:', { pattern, panelId, panelPath });
        const newPanelNode = createPanelNode(pattern);
        const updatedStructure = updatePanelInTree(windowStructure, panelPath, newPanelNode);
        console.log('Updated structure:', updatedStructure);
        pushStructure(updatedStructure);
        setSelectedPanelId(null);
        setSelectedPanelPath([]);
    };

    const createPanelNode = (pattern, config = null) => {
        if (pattern.type === 'vertical' || pattern.type === 'vertical-multiple') {
            const divisions = config ? config.count + 1 : pattern.divisions;
            const ratios = Array(divisions).fill(1 / divisions);
            return {
                type: 'split-vertical',
                ratios: ratios,
                children: Array(divisions).fill(null).map((_, i) => ({
                    type: 'glass',
                    id: String(panelIdCounter.current++)
                }))
            };
        } else if (pattern.type === 'horizontal' || pattern.type === 'horizontal-multiple') {
            const divisions = config ? config.count + 1 : pattern.divisions;
            const ratios = Array(divisions).fill(1 / divisions);
            return {
                type: 'split-horizontal',
                ratios: ratios,
                children: Array(divisions).fill(null).map((_, i) => ({
                    type: 'glass',
                    id: String(panelIdCounter.current++)
                }))
            };
        } else if (pattern.type === 'grid') {
            // Grid pattern: split vertical first, then horizontal for each column
            const rows = pattern.rows || 2;
            const cols = pattern.cols || 2;
            const colRatios = Array(cols).fill(1 / cols);
            const rowRatios = Array(rows).fill(1 / rows);

            return {
                type: 'split-vertical',
                ratios: colRatios,
                children: Array(cols).fill(null).map((_, colIndex) => ({
                    type: 'split-horizontal',
                    ratios: rowRatios,
                    children: Array(rows).fill(null).map((_, rowIndex) => ({
                        type: 'glass',
                        id: String(panelIdCounter.current++)
                    }))
                }))
            };
        } else if (pattern.type === 'coupling') {
            // Coupling: Two separate panels side by side with a coupling connection
            return {
                type: 'split-vertical',
                ratios: [0.48, 0.04, 0.48], // Small gap for coupling
                mullionType: 'coupling',
                children: [
                    { type: 'glass', id: String(panelIdCounter.current++) },
                    { type: 'coupling-bar', id: 'coupling-' + panelIdCounter.current++ },
                    { type: 'glass', id: String(panelIdCounter.current++) }
                ]
            };
        } else if (pattern.type === 'corner') {
            // Corner: L-shaped configuration
            return {
                type: 'split-vertical',
                ratios: [0.5, 0.5],
                mullionType: 'corner',
                angle: pattern.angle || 90,
                children: [
                    { type: 'glass', id: String(panelIdCounter.current++) },
                    {
                        type: 'split-horizontal',
                        ratios: [0.5, 0.5],
                        children: [
                            { type: 'glass', id: String(panelIdCounter.current++) },
                            { type: 'glass', id: String(panelIdCounter.current++) }
                        ]
                    }
                ]
            };
        } else if (pattern.type === 'bay') {
            // Bay: Three-panel configuration with angled sides
            return {
                type: 'split-vertical',
                ratios: [0.25, 0.5, 0.25],
                mullionType: 'bay',
                angle: pattern.angle || 135,
                children: [
                    { type: 'glass', id: String(panelIdCounter.current++), isAngled: true },
                    { type: 'glass', id: String(panelIdCounter.current++) },
                    { type: 'glass', id: String(panelIdCounter.current++), isAngled: true }
                ]
            };
        }

        return { type: 'glass', id: String(panelIdCounter.current++) };
    };

    const handleMultipleMullionConfirm = (config) => {
        if (!pendingPattern) return;

        console.log('Multiple mullion confirm:', { config, pendingPanelId, pendingPanelPath });

        if (!pendingPanelId) {
            // Apply to whole window
            const newNode = createPanelNode(pendingPattern, config);
            pushStructure(newNode);
        } else {
            // Apply to selected panel using the pending panel info
            const newPanelNode = createPanelNode(pendingPattern, config);
            const updatedStructure = updatePanelInTree(windowStructure, pendingPanelPath, newPanelNode);
            console.log('Updated structure after multiple mullion:', updatedStructure);
            pushStructure(updatedStructure);
            setSelectedPanelId(null);
            setSelectedPanelPath([]);
        }

        // Clear pending state
        setPendingPattern(null);
        setPendingPanelId(null);
        setPendingPanelPath([]);
    };

    const handlePanelClick = (panelId, panelPath) => {
        console.log('Panel clicked:', { panelId, panelPath });
        setSelectedPanelId(panelId);
        setSelectedPanelPath(panelPath);
    };

    // Handle pattern drop from drag-and-drop
    const handlePatternDrop = (pattern, panelId, panelPath) => {
        console.log('Pattern dropped:', { pattern, panelId, panelPath });

        // Set the panel as selected for visual feedback
        setSelectedPanelId(panelId);
        setSelectedPanelPath(panelPath);

        // Check if pattern requires configuration
        if (pattern.requiresConfig) {
            setPendingPattern(pattern);
            setPendingPanelId(panelId);
            setPendingPanelPath([...panelPath]);
            setIsMultipleMullionModalOpen(true);
            return;
        }



        // Apply pattern directly to the panel
        applyPatternToPanel(pattern, panelId, panelPath);
    };


    // Custom mullion drawing handlers
    const handleCustomMullionToggle = () => {
        setIsCustomMullionMode(prev => !prev);
        // Clear selection when entering custom mullion mode
        if (!isCustomMullionMode) {
            setSelectedPanelId(null);
            setSelectedPanelPath([]);
        }
    };

    const handleCustomMullionDraw = (startPoint, endPoint, panelId, panelPath) => {
        // Calculate angle from the line
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const angleRad = Math.atan2(Math.abs(dy), Math.abs(dx));
        const angleDeg = Math.round((angleRad * 180) / Math.PI);

        const id1 = String(panelIdCounter.current++);
        const id2 = String(panelIdCounter.current++);

        const newNode = {
            type: 'split-diagonal',
            startPoint: startPoint, // { x: 0-1, y: 0-1 } normalized
            endPoint: endPoint,
            angle: angleDeg,
            children: [
                { type: 'glass', id: id1, shape: 'polygon' },
                { type: 'glass', id: id2, shape: 'polygon' }
            ]
        };

        if (panelPath && panelPath.length > 0) {
            const updatedStructure = updatePanelInTree(windowStructure, panelPath, newNode);
            pushStructure(updatedStructure);
        } else {
            pushStructure(newNode);
        }

        setSelectedPanelId(null);
        setSelectedPanelPath([]);
        setIsCustomMullionMode(false);
    };

    // Drag state handlers
    const handlePatternDragStart = (pattern) => {
        setIsDraggingPattern(true);
    };

    const handlePatternDragEnd = () => {
        setIsDraggingPattern(false);
    };

    // State for the window configuration
    const [config, setConfig] = useState({
        width: 1500,
        height: 1500,
        ref: 'Design ref.',
        qty: 1,
        name: '',
        location: '',
        floor: '',
        note: '',
        glass: '5 MM BLACK GLASS'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f8fafc', // Light background for CAD
            color: '#334155', // Dark text
            fontFamily: 'Inter, sans-serif'
        }}>

            {/* Top Header */}
            <div style={{
                height: '60px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Logo / Back */}
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        E
                    </div>

                    {!isSidebarOpen ? (
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Window Designer</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                {config.ref} <span style={{ color: '#94a3b8', margin: '0 8px' }}>:</span> Qty: {config.qty}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Location: {config.location || '-'}
                            </div>
                        </div>
                    )}

                    <button style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>

                    <div style={{ display: 'flex', background: '#3b82f6', borderRadius: '6px', overflow: 'hidden' }}>
                        <button style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}>
                            Inside
                        </button>
                        <button style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Save
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>

                    <button style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <button onClick={() => router.back()} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Left Sidebar - Properties */}
                {isSidebarOpen && (
                    <div style={{
                        width: '320px',
                        backgroundColor: '#fff',
                        borderRight: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10
                    }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Edit</h2>
                        </div>

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                        Design ref. <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ref"
                                        value={config.ref}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                        Quantity <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="qty"
                                        value={config.qty}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Design name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={config.name}
                                    onChange={handleChange}
                                    placeholder="Enter design name"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={config.location}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Floor number</label>
                                    <input
                                        type="text"
                                        name="floor"
                                        value={config.floor}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Note</label>
                                <textarea
                                    name="note"
                                    value={config.note}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Selected glass</label>
                                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{config.glass}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Note: This is not applied to louver glass.</div>
                                </div>
                            </div>

                            {/* Dimensions Input for Testing */}
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Width (mm)</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={config.width}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Height (mm)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={config.height}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => router.back()}
                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                Cancel
                            </button>
                            <button onClick={handleApply} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Canvas Area */}
                <div style={{ flex: 1, position: 'relative' }}>

                    {/* Mullion Palette - Drag and Drop Toolbar */}
                    <MullionPalette
                        isVisible={!isSidebarOpen}
                        onPatternDragStart={handlePatternDragStart}
                        onPatternDragEnd={handlePatternDragEnd}
                        onCustomMullionToggle={handleCustomMullionToggle}
                        isCustomMullionActive={isCustomMullionMode}
                    />

                    {/* Floating Top Left Info Card */}
                    {!isSidebarOpen && (
                        <div style={{
                            position: 'absolute',
                            left: '20px',
                            top: '20px',
                            backgroundColor: 'white',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ width: '3px', height: '32px', background: '#3b82f6', borderRadius: '2px' }}></div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                    {config.ref} <span style={{ color: '#94a3b8' }}>:</span> {config.name || 'w11'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    Qty: {config.qty} <span style={{ margin: '0 4px' }}>•</span> Location: {config.location || '-'}
                                </div>
                            </div>
                            <button onClick={() => setIsSidebarOpen(true)} style={{ marginLeft: '12px', border: 'none', background: '#f1f5f9', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                        </div>
                    )}

                    <WindowCanvas
                        width={parseInt(config.width)}
                        height={parseInt(config.height)}
                        windowStructure={windowStructure}
                        onPanelClick={handlePanelClick}
                        selectedPanelId={selectedPanelId}
                        onPatternDrop={handlePatternDrop}
                        isDraggingPattern={isDraggingPattern}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onDimensionChange={(dimension, value) => {
                            setConfig(prev => ({ ...prev, [dimension]: value }));
                        }}
                        isCustomMullionMode={isCustomMullionMode}
                        onCustomMullionDraw={handleCustomMullionDraw}
                        onCustomMullionCancel={() => setIsCustomMullionMode(false)}
                        onClear={handleClear}
                    />
                </div>
            </div>

            {/* Mullion Selection Modal */}
            <MullionModal
                isOpen={isMullionModalOpen}
                onClose={() => setIsMullionModalOpen(false)}
                onSelect={handleMullionSelect}
            />

            {/* Multiple Mullion Configuration Modal */}
            <MultipleMullionModal
                isOpen={isMultipleMullionModalOpen}
                onClose={() => {
                    setIsMultipleMullionModalOpen(false);
                    setPendingPattern(null);
                }}
                onConfirm={handleMultipleMullionConfirm}
                direction={pendingPattern?.type?.includes('vertical') ? 'vertical' : 'horizontal'}
            />


        </div>
    );
}
