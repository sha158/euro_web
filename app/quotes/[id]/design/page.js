'use client';
import { useState, use, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const WindowCanvas = dynamic(
    () => import('../../../components/WindowCanvasKonva'),
    { ssr: false }
);
import MullionModal from '../../../components/MullionModal';
import MultipleMullionModal from '../../../components/MultipleMullionModal';
import MullionPalette, { frameColorOptions } from '../../../components/MullionPalette';
import SelectSystemModal from '../../../components/SelectSystemModal';
import FanSpecificationModal from '../../../components/FanSpecificationModal';
import LouverTypeModal from '../../../components/LouverTypeModal';

// Dynamic import for 3D Viewer (Three.js doesn't support SSR)

const ROOT_PANEL_ID = '1';
const SAVED_DESIGNS_STORAGE_KEY = 'quoteDesignsByProject';
const SAVED_CATALOG_STORAGE_KEY = 'designCatalog';
const DEFAULT_FRAME_OPTION =
    frameColorOptions.find((option) => option.id === 'no-laminate') ?? frameColorOptions[0];
const DEFAULT_CONFIG = {
    width: 1500,
    height: 1500,
    ref: '',
    qty: 1,
    name: '',
    location: '',
    floor: '',
    note: '',
    glass: '5 MM BLACK GLASS',
};
const GLASS_OPTIONS = [
    '5 MM PINHEAD GLASS',
    '5 MM BLACK GLASS',
    '5 MM FROSTED GLASS',
    '5 MM FROSTED TOUGHENED GLASS',
    '5 MM REFLECTIVE GLASS',
    '5 MM REFLECTIVE TOUGHENED GLASS',
    'PVC SHEET',
    '6 MM CLEAR GLASS',
    '6 MM FROSTED GLASS',
    '6 MM REFLECTIVE GLASS',
    '6 MM REFLECTIVE TOUGHENED GLASS',
    '6mm Clear Glass',
    '6mm Frosted Toughened',
    '6 MM CLEAR TOUGHENED GLASS',
    '8 MM CLEAR GLASS',
    '8 MM CLEAR TOUGHENED GLASS',
    '8 MM REFLECTIVE GLASS',
    '8 MM REFLECTIVE TOUGHENED GLASS',
    '8mm Frosted Toughened',
    '10mm clear Toughened',
    '10 MM CLEAR GLASS',
    '10 MM CLEAR TOUGHENED GLASS',
    '10 MM REFLECTIVE GLASS',
    '10 MM REFLECTIVE TOUGHENED GLASS',
    'DOUBLE GLAZED 5+9A+5',
    '11.52mm LAM.',
    '(5+1.52+5)11.52mm LAM.',
    '(5+1.52+5)11.52mm LAM. (SC45)',
    '12 MM CLEAR GLASS',
    '12 MM TOUGHENED GLASS',
    '12 MM REFLECTIVE GLASS',
    '12 MM REFLECTIVE TOUGHENED GLASS',
    '(6+1.52+6)13.52mm LAM.',
    '15(5+5+5) DGU Glass',
    '(8+2.28+8)18.28mm LAM.',
    '(5+10+5)20mm DGU',
    '22mm DGU',
    '23 MM DGU TOUGHENED GLASS',
    '(6+12+6)24mm DGU',
    '24mm DGU Toughened Glass',
    '24.52mm LAM.',
    '(8+12+6)26mm DGU',
    '28mm DGU',
    '28mm DGU Glass',
    '(8+12+8)28mm DGU',
    '(6+12+4+2.28+4)28.28mm LAM. DGU',
    '30mm DGU',
    '(10+12+8)30mm DGU',
    '32mm DGU',
    '(10+14+6+1.52+8)39.52mm LAM. DGU',
];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const createDefaultFrameFinish = () => ({
    inside: { ...DEFAULT_FRAME_OPTION.inside },
    outside: { ...DEFAULT_FRAME_OPTION.outside },
    activeOptionIdBySide: {
        inside: DEFAULT_FRAME_OPTION.id,
        outside: DEFAULT_FRAME_OPTION.id,
    },
});

const toPositiveNumber = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : fallback;
};

const normalizeConfigForSave = (config) => {
    const ref = String(config.ref || '').trim();
    const qty = toPositiveNumber(config.qty, DEFAULT_CONFIG.qty);

    return {
        ...config,
        ref,
        qty,
        name: String(config.name || '').trim(),
        location: String(config.location || '').trim(),
        floor: String(config.floor || '').trim(),
        note: String(config.note || '').trim(),
        glass: String(config.glass || DEFAULT_CONFIG.glass).trim() || DEFAULT_CONFIG.glass,
    };
};

const buildDesignRecord = ({
    config,
    windowStructure,
    frameFinishBySide,
    fallbackNameIndex = 1,
}) => {
    const normalizedInput = normalizeConfigForSave(config);
    const width = toPositiveNumber(normalizedInput.width, DEFAULT_CONFIG.width);
    const height = toPositiveNumber(normalizedInput.height, DEFAULT_CONFIG.height);
    const qty = toPositiveNumber(normalizedInput.qty, DEFAULT_CONFIG.qty);
    const areaSqmt = (width * height) / 1000000;
    const displayName = (normalizedInput.name || normalizedInput.ref || `Design ${fallbackNameIndex}`).trim();
    const now = new Date().toISOString();
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const normalizedConfig = {
        ...DEFAULT_CONFIG,
        ...normalizedInput,
        width,
        height,
        qty,
        ref: normalizedInput.ref,
        name: displayName,
    };

    return {
        id: `custom-${uniqueSuffix}`,
        designRef: normalizedConfig.ref || displayName,
        name: displayName,
        qty,
        image: '/window.svg',
        location: normalizedConfig.location || '--',
        series: 'Custom Configurator',
        glass: normalizedConfig.glass || '--',
        color: 'CUSTOM',
        price: 0,
        floor: normalizedConfig.floor || '--',
        note: normalizedConfig.note || '--',
        size: `W = ${width.toFixed(2)}; H = ${height.toFixed(2)}`,
        area: `${areaSqmt.toFixed(3)} Sqmt`,
        rate: '--',
        weight: '--',
        hardware: '--',
        materialType: '--',
        savedAt: now,
        canvas: {
            config: normalizedConfig,
            windowStructure: deepClone(windowStructure),
            frameFinishBySide: deepClone(frameFinishBySide),
        },
    };
};

const extractNumericId = (value) => {
    const match = String(value ?? '').match(/\d+/);
    if (!match) return null;
    const num = Number(match[0]);
    return Number.isFinite(num) ? num : null;
};

const getMaxNodeId = (node) => {
    if (!node || typeof node !== 'object') return 0;

    let maxId = 0;
    const parsed = extractNumericId(node.id);
    if (parsed !== null) {
        maxId = parsed;
    }

    if (Array.isArray(node.children)) {
        node.children.forEach((child) => {
            const childMax = getMaxNodeId(child);
            if (childMax > maxId) maxId = childMax;
        });
    }

    return maxId;
};


export default function DesignConfiguratorPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { id } = use(params);
    const quoteKey = id.toLowerCase();

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
    const [isSelectSystemModalOpen, setIsSelectSystemModalOpen] = useState(false);
    const [isFanSpecModalOpen, setIsFanSpecModalOpen] = useState(false);
    const [isLouverTypeModalOpen, setIsLouverTypeModalOpen] = useState(false);
    const [isOpeningMode, setIsOpeningMode] = useState(false);
    const [backgroundImageSrc, setBackgroundImageSrc] = useState(null);
    const [isOpeningConfirmOpen, setIsOpeningConfirmOpen] = useState(false);
    const [openingModeSession, setOpeningModeSession] = useState(0);
    const [saveStatus, setSaveStatus] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isGlassDropdownOpen, setIsGlassDropdownOpen] = useState(false);
    const [glassSearch, setGlassSearch] = useState('');
    const [activeDesignId, setActiveDesignId] = useState(null);
    const [viewMode, setViewMode] = useState('inside');
    const [frameFinishBySide, setFrameFinishBySide] = useState(() => createDefaultFrameFinish());

    // Use ref for panel ID counter to persist across renders
    const panelIdCounter = useRef(2);
    const hydratedQueryRef = useRef('');
    const glassDropdownRef = useRef(null);

    // State for window structure (recursive tree)
    const [windowStructure, setWindowStructure] = useState({
        type: 'glass',
        id: ROOT_PANEL_ID
    });

    // State for the window configuration
    const [config, setConfig] = useState({ ...DEFAULT_CONFIG });

    const getNextPanelId = useCallback(() => {
        const id = String(panelIdCounter.current);
        panelIdCounter.current += 1;
        return id;
    }, []);

    const syncPanelIdCounter = useCallback((structure) => {
        const nextId = getMaxNodeId(structure) + 1;
        panelIdCounter.current = Math.max(nextId, 2);
    }, []);

    // Undo/Redo history
    const historyRef = useRef({
        past: [],    // stack of previous windowStructure states
        future: [],  // stack of "redo" states
    });
    const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });

    const refreshHistoryFlags = useCallback(() => {
        setHistoryFlags({
            canUndo: historyRef.current.past.length > 0,
            canRedo: historyRef.current.future.length > 0,
        });
    }, []);

    // Push a new structure change (records current state in history)
    const pushStructure = useCallback((newStructure) => {
        setSaveStatus(null);
        setWindowStructure((prev) => {
            historyRef.current.past.push(deepClone(prev));
            historyRef.current.future = []; // clear redo stack on new action
            // Keep history bounded to 50 entries
            if (historyRef.current.past.length > 50) {
                historyRef.current.past.shift();
            }
            refreshHistoryFlags();
            const next = typeof newStructure === 'function' ? newStructure(prev) : newStructure;
            syncPanelIdCounter(next);
            return next;
        });
    }, [refreshHistoryFlags, syncPanelIdCounter]);

    const handleUndo = useCallback(() => {
        const { past, future } = historyRef.current;
        if (past.length === 0) return;
        const previousState = past.pop();
        setWindowStructure((current) => {
            future.push(deepClone(current));
            refreshHistoryFlags();
            syncPanelIdCounter(previousState);
            return previousState;
        });
    }, [refreshHistoryFlags, syncPanelIdCounter]);

    const handleRedo = useCallback(() => {
        const { past, future } = historyRef.current;
        if (future.length === 0) return;
        const nextState = future.pop();
        setWindowStructure((current) => {
            past.push(deepClone(current));
            refreshHistoryFlags();
            syncPanelIdCounter(nextState);
            return nextState;
        });
    }, [refreshHistoryFlags, syncPanelIdCounter]);

    const canUndo = historyFlags.canUndo;
    const canRedo = historyFlags.canRedo;
    const filteredGlassOptions = GLASS_OPTIONS.filter((option) =>
        option.toLowerCase().includes(glassSearch.toLowerCase())
    );

    const validateRequiredFields = useCallback((nextConfig) => {
        const normalized = normalizeConfigForSave(nextConfig);
        const errors = {};
        const rawQty = Number(nextConfig?.qty);

        if (!normalized.ref) {
            errors.ref = 'Design ref is required';
        }

        if (!Number.isFinite(rawQty) || rawQty <= 0) {
            errors.qty = 'Quantity must be greater than 0';
        }

        setFormErrors(errors);
        return { isValid: Object.keys(errors).length === 0, normalized };
    }, []);

    const applyCanvasState = useCallback((canvasState) => {
        if (!canvasState || typeof canvasState !== 'object') return false;

        const nextConfig = {
            ...DEFAULT_CONFIG,
            ...(canvasState.config || {}),
        };
        nextConfig.width = toPositiveNumber(nextConfig.width, DEFAULT_CONFIG.width);
        nextConfig.height = toPositiveNumber(nextConfig.height, DEFAULT_CONFIG.height);
        nextConfig.qty = toPositiveNumber(nextConfig.qty, DEFAULT_CONFIG.qty);

        const nextWindowStructure = canvasState.windowStructure
            ? deepClone(canvasState.windowStructure)
            : { type: 'glass', id: ROOT_PANEL_ID };
        const nextFrameFinish = canvasState.frameFinishBySide
            ? deepClone(canvasState.frameFinishBySide)
            : createDefaultFrameFinish();

        setConfig(nextConfig);
        setWindowStructure(nextWindowStructure);
        setFrameFinishBySide(nextFrameFinish);
        setViewMode('inside');

        historyRef.current.past = [];
        historyRef.current.future = [];
        refreshHistoryFlags();
        syncPanelIdCounter(nextWindowStructure);

        setSelectedPanelId(null);
        setSelectedPanelPath([]);
        setSaveStatus(null);
        return true;
    }, [refreshHistoryFlags, syncPanelIdCounter]);

    const handleFrameFinishConfirm = useCallback((option, targetViewMode) => {
        if (!option) return;
        const side = targetViewMode === 'outside' ? 'outside' : 'inside';
        setSaveStatus(null);
        setFrameFinishBySide((prev) => ({
            ...prev,
            [side]: { ...option[side] },
            activeOptionIdBySide: {
                ...(prev.activeOptionIdBySide || {}),
                [side]: option.id,
            },
        }));
    }, []);

    // Clear design to default state
    const handleClear = useCallback(() => {
        // Reset window structure to single glass panel
        const resetStructure = {
            type: 'glass',
            id: ROOT_PANEL_ID
        };
        setWindowStructure(resetStructure);

        // Reset dimensions to default (1500 x 1500)
        setConfig(prev => ({
            ...prev,
            width: 1500,
            height: 1500
        }));

        // Clear history
        historyRef.current.past = [];
        historyRef.current.future = [];
        refreshHistoryFlags();

        // Reset panel ID counter
        syncPanelIdCounter(resetStructure);

        // Clear selections
        setSelectedPanelId(null);
        setSelectedPanelPath([]);

        // Reset frame finish and view mode
        setViewMode('inside');
        setFrameFinishBySide(createDefaultFrameFinish());
        setFormErrors({});
        setIsGlassDropdownOpen(false);
        setGlassSearch('');
    }, [refreshHistoryFlags, syncPanelIdCounter]);

    const enterOpeningMode = useCallback(() => {
        setIsOpeningMode(true);
        setIsCustomMullionMode(false);
        setIsSidebarOpen(false);
        setOpeningModeSession(prev => prev + 1);
    }, []);

    const handleOpeningModeToggle = useCallback(() => {
        if (isOpeningMode) {
            setIsOpeningMode(false);
            return;
        }
        setIsOpeningConfirmOpen(true);
    }, [isOpeningMode]);

    const handleOpeningConfirm = useCallback(() => {
        handleClear();
        enterOpeningMode();
        setIsOpeningConfirmOpen(false);
    }, [enterOpeningMode, handleClear]);

    const handleOpeningCancel = useCallback(() => {
        setIsOpeningConfirmOpen(false);
    }, []);

    const handleOpeningSave = useCallback((points) => {
        if (!points || points.length < 3) return;
        // Calculate bounding box
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const bboxW = Math.round(maxX - minX);
        const bboxH = Math.round(maxY - minY);
        // Normalize points to 0-1 fractions of bounding box
        const normalizedPoints = points.map(p => ({
            x: (p.x - minX) / (maxX - minX),
            y: (p.y - minY) / (maxY - minY),
        }));
        setConfig(prev => ({
            ...prev,
            width: bboxW,
            height: bboxH,
            openingPoints: normalizedPoints,
        }));
        setIsOpeningMode(false);
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

    useEffect(() => {
        if (!isGlassDropdownOpen) return;

        const handlePointerDown = (event) => {
            if (!glassDropdownRef.current) return;
            if (!glassDropdownRef.current.contains(event.target)) {
                setIsGlassDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isGlassDropdownOpen]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const querySignature = searchParams.toString();
        if (!querySignature) return;
        if (hydratedQueryRef.current === querySignature) return;
        hydratedQueryRef.current = querySignature;

        const templateId = searchParams.get('templateId');
        const designId = searchParams.get('designId');
        const presetWidth = toPositiveNumber(searchParams.get('presetW'), 0);
        const presetHeight = toPositiveNumber(searchParams.get('presetH'), 0);
        const presetName = searchParams.get('presetName');

        let queuedCanvasState = null;
        let queuedPreset = null;
        let statusMessage = '';

        if (templateId) {
            try {
                const rawCatalog = localStorage.getItem(SAVED_CATALOG_STORAGE_KEY);
                const catalogEntries = rawCatalog ? JSON.parse(rawCatalog) : [];
                const selectedTemplate = Array.isArray(catalogEntries)
                    ? catalogEntries.find((item) => item.id === templateId)
                    : null;

                if (selectedTemplate?.template) {
                    queuedCanvasState = selectedTemplate.template;
                    statusMessage = 'Catalog template loaded';
                }
            } catch (error) {
                console.error('Failed to load catalog template', error);
            }
        }

        if (!queuedCanvasState && designId) {
            try {
                const savedRaw = localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
                const savedMap = savedRaw ? JSON.parse(savedRaw) : {};
                const existingDesigns = Array.isArray(savedMap?.[quoteKey]) ? savedMap[quoteKey] : [];
                const selectedDesign = existingDesigns.find((item) => item.id === designId);

                if (selectedDesign?.canvas) {
                    queuedCanvasState = selectedDesign.canvas;
                    statusMessage = 'Saved design loaded';
                }
            } catch (error) {
                console.error('Failed to load saved design', error);
            }
        }

        if (!queuedCanvasState && presetWidth > 0 && presetHeight > 0) {
            queuedPreset = {
                width: presetWidth,
                height: presetHeight,
                name: presetName?.trim() || '',
            };
            statusMessage = 'Catalog preset applied';
        }

        if (!queuedCanvasState && !queuedPreset) return;

        const frameId = window.requestAnimationFrame(() => {
            if (queuedCanvasState) {
                applyCanvasState(queuedCanvasState);
                setActiveDesignId(designId || null);
            } else if (queuedPreset) {
                setConfig((prev) => ({
                    ...prev,
                    width: queuedPreset.width,
                    height: queuedPreset.height,
                    name: queuedPreset.name || prev.name,
                    ref: queuedPreset.name || prev.ref,
                }));
                setActiveDesignId(null);
            }

            setFormErrors({});
            setIsGlassDropdownOpen(false);
            if (statusMessage) {
                setSaveStatus({ type: 'success', message: statusMessage });
            }
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [applyCanvasState, quoteKey, searchParams]);

    const handleApply = () => {
        const { isValid, normalized } = validateRequiredFields(config);
        if (!isValid) {
            setSaveStatus({ type: 'error', message: 'Please complete required fields' });
            return;
        }

        setConfig((prev) => ({ ...prev, ...normalized }));
        setIsSidebarOpen(false);
        setSaveStatus(null);
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

        // Any node with children can be traversed (split, sliding, diagonal, etc.)
        if (Array.isArray(node.children)) {
            const childIndex = targetPath[0];

            if (typeof childIndex === 'number' && childIndex >= 0 && childIndex < node.children.length) {
                return {
                    ...node,
                    children: node.children.map((child, i) =>
                        i === childIndex ? updatePanelInTree(child, targetPath.slice(1), newNode) : child
                    )
                };
            }

            return {
                ...node,
                children: node.children.map((child) => updatePanelInTree(child, targetPath, newNode))
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
            applyPatternToPanel(pattern, selectedPanelPath);
        }

        setIsMullionModalOpen(false);
    };

    const applyPatternToWholeWindow = (pattern) => {
        pushStructure(createPanelNode(pattern));
    };

    const applyPatternToPanel = (pattern, panelPath, panelId = null) => {
        console.log('Applying pattern to panel:', { pattern, panelPath, panelId });
        const newPanelNode = createPanelNode(pattern, null, panelId);
        const updatedStructure = updatePanelInTree(windowStructure, panelPath, newPanelNode);
        console.log('Updated structure:', updatedStructure);
        pushStructure(updatedStructure);
        setSelectedPanelId(null);
        setSelectedPanelPath([]);
    };

    const createPanelNode = (pattern, config = null, sourcePanelId = null) => {
        if (pattern.type === 'vertical' || pattern.type === 'vertical-multiple') {
            const divisions = config ? config.count + 1 : pattern.divisions;
            const ratios = Array(divisions).fill(1 / divisions);
            return {
                type: 'split-vertical',
                ratios: ratios,
                children: Array(divisions).fill(null).map(() => ({
                    type: 'glass',
                    id: getNextPanelId()
                }))
            };
        } else if (pattern.type === 'horizontal' || pattern.type === 'horizontal-multiple') {
            const divisions = config ? config.count + 1 : pattern.divisions;
            const ratios = Array(divisions).fill(1 / divisions);
            return {
                type: 'split-horizontal',
                ratios: ratios,
                children: Array(divisions).fill(null).map(() => ({
                    type: 'glass',
                    id: getNextPanelId()
                }))
            };
        } else if (pattern.type === 'l-joint') {
            return {
                type: 'split-vertical',
                ratios: [0.5, 0.5],
                children: [
                    { type: 'glass', id: getNextPanelId() },
                    {
                        type: 'split-horizontal',
                        ratios: [0.5, 0.5],
                        children: [
                            { type: 'glass', id: getNextPanelId() },
                            { type: 'glass', id: getNextPanelId() }
                        ]
                    }
                ]
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
                children: Array(cols).fill(null).map(() => ({
                    type: 'split-horizontal',
                    ratios: rowRatios,
                    children: Array(rows).fill(null).map(() => ({
                        type: 'glass',
                        id: getNextPanelId()
                    }))
                }))
            };
        } else if (pattern.type === 'coupling') {
            return {
                type: 'split-vertical',
                ratios: [0.5, 0.5],
                mullionType: 'coupler-vertical',
                children: [
                    { type: 'glass', id: sourcePanelId || getNextPanelId(), frameLabel: 'F1' },
                    { type: 'glass', id: getNextPanelId(), frameLabel: 'F2' }
                ]
            };
        } else if (pattern.type === 'coupler') {
            if (pattern.couplingType === 'horizontal') {
                return {
                    type: 'split-horizontal',
                    ratios: [0.5, 0.5],
                    mullionType: 'coupler-horizontal',
                    children: [
                        { type: 'glass', id: getNextPanelId(), frameLabel: 'F2' },
                        { type: 'glass', id: sourcePanelId || getNextPanelId(), frameLabel: 'F1' }
                    ]
                };
            }

            if (pattern.couplingType === 'angular') {
                return {
                    type: 'split-vertical',
                    ratios: [0.5, 0.5],
                    mullionType: 'coupler-angular',
                    couplingAngle: pattern.angle || 90,
                    children: [
                        { type: 'glass', id: sourcePanelId || getNextPanelId(), frameLabel: 'F1' },
                        { type: 'glass', id: getNextPanelId(), frameLabel: 'F2' }
                    ]
                };
            }

            return {
                type: 'split-vertical',
                ratios: [0.5, 0.5],
                mullionType: 'coupler-vertical',
                children: [
                    { type: 'glass', id: sourcePanelId || getNextPanelId(), frameLabel: 'F1' },
                    { type: 'glass', id: getNextPanelId(), frameLabel: 'F2' }
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
                    { type: 'glass', id: getNextPanelId() },
                    {
                        type: 'split-horizontal',
                        ratios: [0.5, 0.5],
                        children: [
                            { type: 'glass', id: getNextPanelId() },
                            { type: 'glass', id: getNextPanelId() }
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
                    { type: 'glass', id: getNextPanelId(), isAngled: true },
                    { type: 'glass', id: getNextPanelId() },
                    { type: 'glass', id: getNextPanelId(), isAngled: true }
                ]
            };
        }

        return { type: 'glass', id: getNextPanelId() };
    };

    const createSlidingNode = (pattern, systemConfig) => {
        return {
            type: 'sliding',
            tracks: pattern.tracks,
            brand: systemConfig.brand,
            system: systemConfig.system,
            ratios: pattern.ratios,
            children: pattern.panels.map((panel) => ({
                type: 'glass',
                id: getNextPanelId(),
                sashDirection: panel.direction,
                sashLabel: panel.sashId,
            })),
        };
    };

    const handleSelectSystemConfirm = (systemConfig) => {
        if (!pendingPattern) return;

        const newNode = createSlidingNode(pendingPattern, systemConfig);

        if (!pendingPanelId) {
            pushStructure(newNode);
        } else {
            const updatedStructure = updatePanelInTree(windowStructure, pendingPanelPath, newNode);
            pushStructure(updatedStructure);
            setSelectedPanelId(null);
            setSelectedPanelPath([]);
        }

        setPendingPattern(null);
        setPendingPanelId(null);
        setPendingPanelPath([]);
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

    // Apply an add-on overlay to a glass panel (sets addon property without changing structure)
    const applyAddonToPanel = (addonType, panelPath, addonSpec) => {
        const setAddon = (node, path) => {
            if (node.type === 'glass') {
                if (path.length <= 1 && (path.length === 0 || node.id === path[0])) {
                    // Toggle: if same addon already applied, remove it
                    if (node.addon === addonType && !addonSpec) {
                        return { ...node, addon: undefined, fanSpec: undefined };
                    }
                    const updated = { ...node, addon: addonType };
                    if (addonType === 'fan' && addonSpec) {
                        updated.fanSpec = addonSpec;
                    } else {
                        delete updated.fanSpec;
                    }
                    if (addonType === 'louver' && addonSpec) {
                        updated.louverSpec = addonSpec;
                    } else {
                        delete updated.louverSpec;
                    }
                    return updated;
                }
                return node;
            }
            if (node.children) {
                const childIndex = path[0];
                if (typeof childIndex === 'number') {
                    return {
                        ...node,
                        children: node.children.map((child, i) =>
                            i === childIndex ? setAddon(child, path.slice(1)) : child
                        )
                    };
                }
                // Path might start with panel ID directly
                return {
                    ...node,
                    children: node.children.map((child) => setAddon(child, path))
                };
            }
            return node;
        };
        const updated = setAddon(windowStructure, panelPath);
        pushStructure(updated);
    };

    // Handle pattern drop from drag-and-drop
    const handlePatternDrop = (pattern, panelId, panelPath) => {
        console.log('Pattern dropped:', { pattern, panelId, panelPath });

        // Set the panel as selected for visual feedback
        setSelectedPanelId(panelId);
        setSelectedPanelPath(panelPath);

        // Add-on patterns: overlay on existing glass panel
        if (pattern.type === 'addon') {
            // Fan addon requires specification modal
            if (pattern.addonType === 'fan') {
                setPendingPattern(pattern);
                setPendingPanelId(panelId);
                setPendingPanelPath([...panelPath]);
                setIsFanSpecModalOpen(true);
                return;
            }
            // Louver addon requires type selection modal
            if (pattern.addonType === 'louver') {
                setPendingPattern(pattern);
                setPendingPanelId(panelId);
                setPendingPanelPath([...panelPath]);
                setIsLouverTypeModalOpen(true);
                return;
            }
            applyAddonToPanel(pattern.addonType, panelPath);
            return;
        }

        // Sliding patterns route to the Select System modal
        if (pattern.type === 'sliding') {
            setPendingPattern(pattern);
            setPendingPanelId(panelId);
            setPendingPanelPath([...panelPath]);
            setIsSelectSystemModalOpen(true);
            return;
        }

        // Check if pattern requires configuration
        if (pattern.requiresConfig) {
            setPendingPattern(pattern);
            setPendingPanelId(panelId);
            setPendingPanelPath([...panelPath]);
            setIsMultipleMullionModalOpen(true);
            return;
        }

        // Apply pattern directly to the panel
        applyPatternToPanel(pattern, panelPath);
    };


    // Custom mullion drawing handlers
    const handleCustomMullionToggle = () => {
        setIsOpeningMode(false);
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

        const id1 = getNextPanelId();
        const id2 = getNextPanelId();

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

    // Fan specification confirm handler
    const handleFanSpecConfirm = (fanSpec) => {
        if (pendingPanelPath) {
            applyAddonToPanel('fan', pendingPanelPath, fanSpec);
        }
        setIsFanSpecModalOpen(false);
        setPendingPattern(null);
        setPendingPanelId(null);
        setPendingPanelPath([]);
    };

    // Louver type confirm handler
    const handleLouverTypeConfirm = (louverSpec) => {
        if (pendingPanelPath) {
            applyAddonToPanel('louver', pendingPanelPath, louverSpec);
        }
        setIsLouverTypeModalOpen(false);
        setPendingPattern(null);
        setPendingPanelId(null);
        setPendingPanelPath([]);
    };

    // Drag state handlers
    const handlePatternDragStart = (pattern) => {
        setIsDraggingPattern(true);
    };

    const handlePatternDragEnd = () => {
        setIsDraggingPattern(false);
    };

    // Parse a dimension value — supports "3f", "3ft", "3feet" for feet, plain numbers as mm
    const parseDimensionValue = (input) => {
        const trimmed = String(input).trim().toLowerCase();
        const feetMatch = trimmed.match(/^([0-9]*\.?[0-9]+)\s*f(?:t|eet|oot)?$/);
        if (feetMatch) {
            return Math.round(parseFloat(feetMatch[1]) * 304.8);
        }
        const num = parseFloat(trimmed);
        return isNaN(num) ? null : Math.round(num);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaveStatus(null);
        if (name === 'ref' || name === 'qty') {
            setFormErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        // For width/height, parse feet notation on blur (let user type freely)
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleDimensionBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'width' || name === 'height') {
            const parsed = parseDimensionValue(value);
            if (parsed && parsed > 0) {
                setConfig(prev => ({ ...prev, [name]: parsed }));
            }
        }
    };

    const handleGlassSelect = (glass) => {
        setSaveStatus(null);
        setConfig((prev) => ({ ...prev, glass }));
        setIsGlassDropdownOpen(false);
        setGlassSearch('');
    };

    const handleSaveDesign = useCallback(() => {
        try {
            const { isValid, normalized } = validateRequiredFields(config);
            if (!isValid) {
                setIsSidebarOpen(true);
                setSaveStatus({ type: 'error', message: 'Please complete required fields' });
                return;
            }

            const savedRaw = localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
            const savedMap = savedRaw ? JSON.parse(savedRaw) : {};
            const existingDesigns = Array.isArray(savedMap[quoteKey]) ? savedMap[quoteKey] : [];
            const designRecord = buildDesignRecord({
                config: normalized,
                windowStructure,
                frameFinishBySide,
                fallbackNameIndex: existingDesigns.length + 1,
            });

            const normalizedRecord = activeDesignId
                ? { ...designRecord, id: activeDesignId }
                : designRecord;
            const replaced = activeDesignId
                ? existingDesigns.some((item) => item.id === activeDesignId)
                : false;
            const nextDesigns = activeDesignId
                ? replaced
                    ? existingDesigns.map((item) =>
                        item.id === activeDesignId ? normalizedRecord : item
                    )
                    : [normalizedRecord, ...existingDesigns]
                : [normalizedRecord, ...existingDesigns];

            localStorage.setItem(
                SAVED_DESIGNS_STORAGE_KEY,
                JSON.stringify({
                    ...savedMap,
                    [quoteKey]: nextDesigns
                })
            );

            setConfig((prev) => ({ ...prev, ...normalized }));
            setActiveDesignId(normalizedRecord.id);
            setSaveStatus({ type: 'success', message: activeDesignId ? 'Updated' : 'Saved' });
        } catch (error) {
            console.error('Failed to save design', error);
            setSaveStatus({ type: 'error', message: 'Save failed' });
        }
    }, [activeDesignId, config, frameFinishBySide, quoteKey, validateRequiredFields, windowStructure]);

    const handleSaveToCatalog = useCallback(() => {
        try {
            const { isValid, normalized } = validateRequiredFields(config);
            if (!isValid) {
                setIsSidebarOpen(true);
                setSaveStatus({ type: 'error', message: 'Please complete required fields' });
                return;
            }

            const savedRaw = localStorage.getItem(SAVED_CATALOG_STORAGE_KEY);
            const existingCatalog = savedRaw ? JSON.parse(savedRaw) : [];
            const catalogList = Array.isArray(existingCatalog) ? existingCatalog : [];

            const designRecord = buildDesignRecord({
                config: normalized,
                windowStructure,
                frameFinishBySide,
                fallbackNameIndex: catalogList.length + 1,
            });
            const width = toPositiveNumber(designRecord.canvas?.config?.width, DEFAULT_CONFIG.width);
            const height = toPositiveNumber(designRecord.canvas?.config?.height, DEFAULT_CONFIG.height);
            const catalogRecord = {
                ...designRecord,
                id: `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                dims: `${Math.round(width)} x ${Math.round(height)}`,
                template: deepClone(designRecord.canvas),
            };

            localStorage.setItem(
                SAVED_CATALOG_STORAGE_KEY,
                JSON.stringify([catalogRecord, ...catalogList])
            );

            setConfig((prev) => ({ ...prev, ...normalized }));
            setSaveStatus({ type: 'success', message: 'Saved to catalog' });
        } catch (error) {
            console.error('Failed to save design to catalog', error);
            setSaveStatus({ type: 'error', message: 'Catalog save failed' });
        }
    }, [config, frameFinishBySide, validateRequiredFields, windowStructure]);

    const canvasWidth = Math.max(1, Number(config.width) || 1500);
    const canvasHeight = Math.max(1, Number(config.height) || 1500);

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
                                {config.ref || '--'} <span style={{ color: '#94a3b8', margin: '0 8px' }}>:</span> Qty: {config.qty}
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
                            {viewMode === 'outside' ? 'Outside' : 'Inside'}
                        </button>
                        <button
                            onClick={handleSaveDesign}
                            style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}
                        >
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
                        <button
                            onClick={handleSaveToCatalog}
                            style={{ padding: '8px 16px', background: '#0f766e', color: 'white', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}
                        >
                            Save Catalog
                        </button>
                    </div>

                    {saveStatus && (
                        <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: saveStatus.type === 'success' ? '#16a34a' : '#dc2626'
                        }}>
                            {saveStatus.message}
                        </div>
                    )}

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
                                        placeholder="Enter design ref"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: `1px solid ${formErrors.ref ? '#dc2626' : '#e2e8f0'}`,
                                            fontSize: '13px',
                                            color: '#1e293b'
                                        }}
                                    />
                                    {formErrors.ref && (
                                        <div style={{ marginTop: '4px', fontSize: '11px', color: '#dc2626' }}>{formErrors.ref}</div>
                                    )}
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
                                        min={1}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: `1px solid ${formErrors.qty ? '#dc2626' : '#e2e8f0'}`,
                                            fontSize: '13px',
                                            color: '#1e293b'
                                        }}
                                    />
                                    {formErrors.qty && (
                                        <div style={{ marginTop: '4px', fontSize: '11px', color: '#dc2626' }}>{formErrors.qty}</div>
                                    )}
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

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', position: 'relative' }} ref={glassDropdownRef}>
                                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Selected glass</label>
                                <button
                                    type="button"
                                    onClick={() => setIsGlassDropdownOpen((prev) => !prev)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                    }}
                                >
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{config.glass}</div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>

                                {isGlassDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        left: 0,
                                        right: 0,
                                        background: '#1f2937',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        boxShadow: '0 16px 32px rgba(15, 23, 42, 0.35)',
                                        padding: '10px',
                                        zIndex: 80,
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={glassSearch}
                                            onChange={(event) => setGlassSearch(event.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid #475569',
                                                background: '#111827',
                                                color: '#e2e8f0',
                                                fontSize: '12px',
                                                marginBottom: '10px',
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {filteredGlassOptions.length > 0 ? (
                                                filteredGlassOptions.map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleGlassSelect(option)}
                                                        style={{
                                                            padding: '8px 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid transparent',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            background: option === config.glass ? '#334155' : 'transparent',
                                                            color: '#cbd5e1',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                ))
                                            ) : (
                                                <div style={{ padding: '10px', color: '#94a3b8', fontSize: '12px' }}>
                                                    No glass options found.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dimensions Input for Testing */}
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Width (mm or e.g. 3f)</label>
                                    <input
                                        type="text"
                                        name="width"
                                        value={config.width}
                                        onChange={handleChange}
                                        onBlur={handleDimensionBlur}
                                        placeholder="e.g. 1500 or 5f"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Height (mm or e.g. 3f)</label>
                                    <input
                                        type="text"
                                        name="height"
                                        value={config.height}
                                        onChange={handleChange}
                                        onBlur={handleDimensionBlur}
                                        placeholder="e.g. 1500 or 5f"
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
                        onOpeningModeToggle={handleOpeningModeToggle}
                        isOpeningModeActive={isOpeningMode}
                        currentViewMode={viewMode}
                        frameFinishBySide={frameFinishBySide}
                        onFrameFinishConfirm={handleFrameFinishConfirm}
                        onImageUpload={setBackgroundImageSrc}
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
                                    {(config.ref || 'Design')} <span style={{ color: '#94a3b8' }}>:</span> {config.name || config.ref || 'Untitled'}
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
                        key={`canvas-${isOpeningMode ? `opening-${openingModeSession}` : `standard-${isCustomMullionMode ? 'cm' : 'base'}`}`}
                        width={canvasWidth}
                        height={canvasHeight}
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
                            setSaveStatus(null);
                            setConfig(prev => ({ ...prev, [dimension]: value }));
                        }}
                        isCustomMullionMode={isCustomMullionMode}
                        onCustomMullionDraw={handleCustomMullionDraw}
                        onCustomMullionCancel={() => setIsCustomMullionMode(false)}
                        isOpeningMode={isOpeningMode}
                        onOpeningModeCancel={() => setIsOpeningMode(false)}
                        onOpeningSave={handleOpeningSave}
                        onClear={handleClear}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        frameFinishBySide={frameFinishBySide}
                        backgroundImageSrc={backgroundImageSrc}
                        openingPolygon={config.openingPoints}
                    />
                </div>
            </div>

            {isOpeningConfirmOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1200,
                }}>
                    <div style={{
                        width: '420px',
                        maxWidth: '90vw',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.2)',
                        padding: '22px',
                    }}>
                        <div style={{ fontSize: '30px', marginBottom: '8px' }}>⚠️</div>
                        <h3 style={{ margin: 0, fontSize: '26px', lineHeight: 1.25, color: '#0f172a', marginBottom: '14px' }}>
                            Your existing design will be cleared. Do you want to proceed?
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={handleOpeningCancel}
                                style={{
                                    border: '1px solid #cbd5e1',
                                    background: 'white',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    color: '#334155',
                                    cursor: 'pointer',
                                }}
                            >
                                No
                            </button>
                            <button
                                onClick={handleOpeningConfirm}
                                style={{
                                    border: 'none',
                                    background: '#2563eb',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Select System Modal (for sliding designs) */}
            <SelectSystemModal
                isOpen={isSelectSystemModalOpen}
                onClose={() => {
                    setIsSelectSystemModalOpen(false);
                    setPendingPattern(null);
                }}
                onConfirm={handleSelectSystemConfirm}
            />

            {/* Fan Specification Modal */}
            <FanSpecificationModal
                isOpen={isFanSpecModalOpen}
                onClose={() => {
                    setIsFanSpecModalOpen(false);
                    setPendingPattern(null);
                }}
                onConfirm={handleFanSpecConfirm}
            />

            {/* Louver Type Modal */}
            <LouverTypeModal
                isOpen={isLouverTypeModalOpen}
                onClose={() => {
                    setIsLouverTypeModalOpen(false);
                    setPendingPattern(null);
                }}
                onConfirm={handleLouverTypeConfirm}
            />

        </div>
    );
}
