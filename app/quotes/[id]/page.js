'use client';
import { useState, useEffect, use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { quotes, quoteDesigns, catalogItems } from '../../data/mockData';

// --- Components ---
const SAVED_DESIGNS_STORAGE_KEY = 'quoteDesignsByProject';
const SAVED_CATALOG_STORAGE_KEY = 'designCatalog';
const SAVED_PRICING_STORAGE_KEY = 'quotePricingByProject';

const DEFAULT_PRICING_RATES = {
    profileCostPerSqmt: 5200,
    profileWastagePct: 10,
    hardwareCostPerUnit: 950,
    glassCostPerSqmt: 1750,
    glassWastagePct: 5,
    powderCoatingPerMeter: 0,
    woodFinishingPerMeter: 0,
    anodizingPerMeter: 0,
    fabricationLabourPerSqmt: 700,
    installationLabourPerSqmt: 500,
    profitPct: 20,
    extraCostPct: 1,
    discountPct: 0,
    transportationCost: 1000,
    loadingAndUnloadingCost: 1000,
    gstPct: 18,
};

const toPositiveNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toNonNegativeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const formatInr = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const parseCatalogDimensions = (dims) => {
    const [rawWidth, rawHeight] = String(dims ?? '')
        .split('x')
        .map((item) => item.trim());

    return {
        width: toPositiveNumber(rawWidth, 1500),
        height: toPositiveNumber(rawHeight, 1500),
    };
};

const parseAreaSqmt = (areaText) => {
    const match = String(areaText ?? '').match(/[\d.]+/);
    if (!match) return 0;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : 0;
};

const parseSizeMm = (sizeText) => {
    const widthMatch = String(sizeText ?? '').match(/W\s*=\s*([\d.]+)/i);
    const heightMatch = String(sizeText ?? '').match(/H\s*=\s*([\d.]+)/i);
    if (!widthMatch || !heightMatch) return null;

    const width = Number(widthMatch[1]);
    const height = Number(heightMatch[1]);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return null;
    }

    return { width, height };
};

const getDesignMetrics = (designs) => {
    return designs.reduce(
        (acc, design) => {
            const qty = toPositiveNumber(design?.qty, 1);
            const parsedArea = parseAreaSqmt(design?.area);
            const parsedSize = parseSizeMm(design?.size);

            const areaSqmt =
                parsedArea > 0
                    ? parsedArea
                    : parsedSize
                        ? (parsedSize.width * parsedSize.height) / 1000000
                        : 0;

            const perimeterM = parsedSize
                ? ((parsedSize.width + parsedSize.height) * 2) / 1000
                : 0;

            acc.totalDesigns += 1;
            acc.totalQty += qty;
            acc.totalAreaSqmt += areaSqmt * qty;
            acc.totalPerimeterM += perimeterM * qty;
            return acc;
        },
        {
            totalDesigns: 0,
            totalQty: 0,
            totalAreaSqmt: 0,
            totalPerimeterM: 0,
        }
    );
};

const calculatePricing = (designs, rates) => {
    const mergedRates = { ...DEFAULT_PRICING_RATES, ...(rates || {}) };
    const metrics = getDesignMetrics(designs);

    const profileCost = roundCurrency(metrics.totalAreaSqmt * mergedRates.profileCostPerSqmt);
    const profileWastage = roundCurrency((profileCost * mergedRates.profileWastagePct) / 100);
    const hardwareCost = roundCurrency(metrics.totalQty * mergedRates.hardwareCostPerUnit);
    const glassCost = roundCurrency(metrics.totalAreaSqmt * mergedRates.glassCostPerSqmt);
    const glassWastage = roundCurrency((glassCost * mergedRates.glassWastagePct) / 100);
    const powderCoatingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.powderCoatingPerMeter);
    const woodFinishingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.woodFinishingPerMeter);
    const anodizingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.anodizingPerMeter);

    const totalRawMaterialCost = roundCurrency(
        profileCost +
        profileWastage +
        hardwareCost +
        glassCost +
        glassWastage +
        powderCoatingCost +
        woodFinishingCost +
        anodizingCost
    );
    const fabricationLabour = roundCurrency(metrics.totalAreaSqmt * mergedRates.fabricationLabourPerSqmt);
    const installationLabour = roundCurrency(metrics.totalAreaSqmt * mergedRates.installationLabourPerSqmt);
    const subTotalIncludingLabour = roundCurrency(totalRawMaterialCost + fabricationLabour + installationLabour);
    const profit = roundCurrency((subTotalIncludingLabour * mergedRates.profitPct) / 100);
    const extraCost = roundCurrency((subTotalIncludingLabour * mergedRates.extraCostPct) / 100);
    const basicValue = roundCurrency(subTotalIncludingLabour + profit + extraCost);
    const discount = roundCurrency((basicValue * mergedRates.discountPct) / 100);
    const subTotal = roundCurrency(basicValue - discount);
    const transportationCost = roundCurrency(mergedRates.transportationCost);
    const loadingAndUnloadingCost = roundCurrency(mergedRates.loadingAndUnloadingCost);
    const totalProjectCost = roundCurrency(subTotal + transportationCost + loadingAndUnloadingCost);
    const gst = roundCurrency((totalProjectCost * mergedRates.gstPct) / 100);
    const grandTotal = roundCurrency(totalProjectCost + gst);

    const costRows = [
        {
            id: 'profileCost',
            costHead: 'Profile Cost',
            calculationType: 'AreaSqmt',
            rateKey: 'profileCostPerSqmt',
            rate: mergedRates.profileCostPerSqmt,
            value: profileCost,
        },
        {
            id: 'profileWastage',
            costHead: 'Profile Wastage',
            calculationType: 'Percentage(Profile Cost)',
            rateKey: 'profileWastagePct',
            rate: mergedRates.profileWastagePct,
            value: profileWastage,
        },
        {
            id: 'hardwareCost',
            costHead: 'Hardware Cost',
            calculationType: 'Qty',
            rateKey: 'hardwareCostPerUnit',
            rate: mergedRates.hardwareCostPerUnit,
            value: hardwareCost,
        },
        {
            id: 'glassCost',
            costHead: 'Glass Cost',
            calculationType: 'AreaSqmt',
            rateKey: 'glassCostPerSqmt',
            rate: mergedRates.glassCostPerSqmt,
            value: glassCost,
        },
        {
            id: 'glassWastage',
            costHead: 'Glass Wastage',
            calculationType: 'Percentage(Glass Cost)',
            rateKey: 'glassWastagePct',
            rate: mergedRates.glassWastagePct,
            value: glassWastage,
        },
        {
            id: 'powderCoatingCost',
            costHead: 'Powder Coating Cost',
            calculationType: 'PerimeterM',
            rateKey: 'powderCoatingPerMeter',
            rate: mergedRates.powderCoatingPerMeter,
            value: powderCoatingCost,
        },
        {
            id: 'woodFinishingCost',
            costHead: 'Wood Finishing Cost',
            calculationType: 'PerimeterM',
            rateKey: 'woodFinishingPerMeter',
            rate: mergedRates.woodFinishingPerMeter,
            value: woodFinishingCost,
        },
        {
            id: 'anodizingCost',
            costHead: 'Anodizing Cost',
            calculationType: 'PerimeterM',
            rateKey: 'anodizingPerMeter',
            rate: mergedRates.anodizingPerMeter,
            value: anodizingCost,
        },
        {
            id: 'totalRawMaterialCost',
            costHead: 'Total Raw Material Cost',
            calculationType: 'Formula',
            rateKey: null,
            rate: null,
            value: totalRawMaterialCost,
        },
        {
            id: 'fabricationLabour',
            costHead: 'Fabrication Labour',
            calculationType: 'AreaSqmt',
            rateKey: 'fabricationLabourPerSqmt',
            rate: mergedRates.fabricationLabourPerSqmt,
            value: fabricationLabour,
        },
        {
            id: 'installationLabour',
            costHead: 'Installation Labour',
            calculationType: 'AreaSqmt',
            rateKey: 'installationLabourPerSqmt',
            rate: mergedRates.installationLabourPerSqmt,
            value: installationLabour,
        },
        {
            id: 'subTotalIncludingLabour',
            costHead: 'Sub Total Including Labour',
            calculationType: 'Formula',
            rateKey: null,
            rate: null,
            value: subTotalIncludingLabour,
        },
        {
            id: 'profit',
            costHead: 'Profit',
            calculationType: 'Percentage(Sub Total Including Labour)',
            rateKey: 'profitPct',
            rate: mergedRates.profitPct,
            value: profit,
        },
        {
            id: 'extraCost',
            costHead: 'Extra Cost',
            calculationType: 'Percentage(Sub Total Including Labour)',
            rateKey: 'extraCostPct',
            rate: mergedRates.extraCostPct,
            value: extraCost,
        },
        {
            id: 'discount',
            costHead: 'Discount',
            calculationType: 'Percentage(Basic Value)',
            rateKey: 'discountPct',
            rate: mergedRates.discountPct,
            value: discount,
        },
        {
            id: 'transportation',
            costHead: 'Transportation Cost',
            calculationType: 'Fixed',
            rateKey: 'transportationCost',
            rate: mergedRates.transportationCost,
            value: transportationCost,
        },
        {
            id: 'loadingAndUnloading',
            costHead: 'Loading And Unloading',
            calculationType: 'Fixed',
            rateKey: 'loadingAndUnloadingCost',
            rate: mergedRates.loadingAndUnloadingCost,
            value: loadingAndUnloadingCost,
        },
        {
            id: 'gst',
            costHead: 'GST',
            calculationType: 'Percentage(Total Project Cost)',
            rateKey: 'gstPct',
            rate: mergedRates.gstPct,
            value: gst,
        },
    ];

    const summary = {
        basicValue,
        discount,
        subTotal,
        transportationCost,
        loadingAndUnloadingCost,
        totalProjectCost,
        gst,
        grandTotal,
    };

    return { metrics, costRows, summary };
};

function DesignCard({ design, onEdit, onViewDetails }) {
    const displayRef = design.designRef || design.name;
    return (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header with checkboxes and actions */}
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                </div>
            </div>

            {/* Image Area */}
            <div style={{
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                margin: '0 16px',
                borderRadius: '8px',
                position: 'relative'
            }}>
                {/* Placeholder for the window design image */}
                <div style={{ textAlign: 'center' }}>
                    <img src={design.image} alt={design.name} style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
            </div>

            {/* Footer Info */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{displayRef}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty. : {design.qty}</span>
                </div>
                {design.name && design.name !== displayRef && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {design.name}
                    </div>
                )}

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Location :</span> {design.location}</div>
                    <div>{design.series}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Glass : {design.glass}</span>
                        <span style={{
                            padding: '2px 6px',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            fontSize: '10px'
                        }}>{design.color}</span>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Price: ₹{design.price.toLocaleString()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px' }} onClick={() => onViewDetails && onViewDetails(design)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            View details
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px' }} onClick={() => onEdit && onEdit(design)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit Design
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CatalogCard({ item, onUse, onEdit }) {
    const [dimWidth, dimHeight] = String(item.dims || '-- x --')
        .split('x')
        .map((part) => part.trim());

    return (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Drawing Area */}
            <div style={{
                height: '220px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative'
            }}>
                <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </button>
                {/* Mock dimensions */}
                <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#64748b' }}>
                    {dimHeight}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#64748b' }}>
                    {dimWidth}
                </div>
                <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '80%', opacity: 0.8 }} />
            </div>

            {/* Info Area */}
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {item.name}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '32px' }}>
                    {item.series}
                </p>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => onUse && onUse(item)}>
                        Select design
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => onEdit && onEdit(item)}>
                        Edit in canvas
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: '#9ca3af' }}>{label}:</div>
            <div style={{ color: 'white', fontWeight: '500' }}>{value}</div>
        </div>
    );
}

function DetailsDrawer({ design, onClose }) {
    if (!design) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }}
            />
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '400px',
                background: '#1f2937',
                boxShadow: '-4px 0 16px rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                color: 'white',
                borderLeft: '1px solid #374151',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '24px', background: '#374151', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px', zIndex: 10 }}>
                        ✕
                    </button>
                    <div style={{ background: 'white', borderRadius: '4px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                        <img src={design.image} alt={design.name} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                    </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <DetailRow label="Design Ref" value={design.designRef || '--'} />
                    <DetailRow label="Design Name" value={design.name} />
                    <DetailRow label="Qty" value={design.qty} />
                    <DetailRow label="Location" value={design.location} />
                    <DetailRow label="Floor" value={design.floor || '--'} />
                    <DetailRow label="Note" value={design.note || '--'} />
                    <DetailRow label="System" value={design.series} />
                    <DetailRow label="Glass" value={design.glass} />
                    <DetailRow label="Color" value={<span style={{ padding: '2px 8px', background: '#374151', borderRadius: '4px', border: '1px solid #4b5563', fontSize: '11px', textTransform: 'uppercase' }}>{design.color}</span>} />
                    <DetailRow label="Price" value={`₹${design.price.toLocaleString()}`} />
                    <DetailRow label="Size" value={design.size || '--'} />
                    <DetailRow label="Area" value={design.area || '--'} />
                    <DetailRow label="Rate/Sqmt" value={design.rate || '--'} />
                    <DetailRow label="Total Weight" value={design.weight || '--'} />
                    <DetailRow label="Hardware" value={design.hardware || '--'} />
                    <DetailRow label="Material Type" value={design.materialType || '--'} />
                </div>
            </div>
        </>
    );
}

function PricingCostRow({ index, row, onRateChange }) {
    return (
        <tr>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', width: '56px' }}>
                {index + 1}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)', minWidth: '220px' }}>
                {row.costHead}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
                {row.calculationType}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', width: '140px' }}>
                {row.rateKey ? (
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.rate}
                        onChange={(e) => onRateChange(row.rateKey, e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                        }}
                    />
                ) : (
                    <span>--</span>
                )}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontWeight: 600, width: '160px' }}>
                {formatInr(row.value)}
            </td>
        </tr>
    );
}

function SummaryRow({ label, value, strong = false }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '15px', fontWeight: strong ? 700 : 500, color: strong ? '#dcfce7' : '#ecfeff' }}>
            <span>{label}</span>
            <span>{formatInr(value)}</span>
        </div>
    );
}

export default function QuoteDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);
    const quoteKey = id.toLowerCase();

    // Prevent hydration mismatch for localStorage-dependent values
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const readSavedDesigns = useCallback(() => {
        if (typeof window === 'undefined') return [];

        try {
            const rawSavedDesigns = localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
            if (!rawSavedDesigns) {
                return [];
            }

            const parsed = JSON.parse(rawSavedDesigns);
            return Array.isArray(parsed?.[quoteKey]) ? parsed[quoteKey] : [];
        } catch (error) {
            console.error('Failed to load saved designs', error);
            return [];
        }
    }, [quoteKey]);

    const readSavedPricing = useCallback(() => {
        if (typeof window === 'undefined') return { ...DEFAULT_PRICING_RATES };

        try {
            const rawPricing = localStorage.getItem(SAVED_PRICING_STORAGE_KEY);
            const parsedMap = rawPricing ? JSON.parse(rawPricing) : {};
            const forQuote = parsedMap?.[quoteKey];
            return {
                ...DEFAULT_PRICING_RATES,
                ...(typeof forQuote === 'object' && forQuote ? forQuote : {}),
            };
        } catch (error) {
            console.error('Failed to load pricing rates', error);
            return { ...DEFAULT_PRICING_RATES };
        }
    }, [quoteKey]);

    const [activeModule, setActiveModule] = useState('design'); // 'design' or 'pricing'
    const [activeTab, setActiveTab] = useState('project'); // 'project' or 'catalog'
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [savedDesigns, setSavedDesigns] = useState(() => readSavedDesigns());
    const [catalogDesigns, setCatalogDesigns] = useState(() => {
        if (typeof window === 'undefined') return [];

        try {
            const rawCatalog = localStorage.getItem(SAVED_CATALOG_STORAGE_KEY);
            const parsed = rawCatalog ? JSON.parse(rawCatalog) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to load catalog designs', error);
            return [];
        }
    });
    const [actionStatus, setActionStatus] = useState(null);
    const [pricingStatus, setPricingStatus] = useState(null);
    const [pricingRates, setPricingRates] = useState(() => readSavedPricing());

    const readCatalogDesigns = useCallback(() => {
        if (typeof window === 'undefined') return [];

        try {
            const rawCatalog = localStorage.getItem(SAVED_CATALOG_STORAGE_KEY);
            const parsed = rawCatalog ? JSON.parse(rawCatalog) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Failed to load catalog designs', error);
            return [];
        }
    }, []);

    const loadSavedDesigns = useCallback(() => {
        setSavedDesigns(readSavedDesigns());
        setCatalogDesigns(readCatalogDesigns());
        setPricingRates(readSavedPricing());
        setActionStatus(null);
        setPricingStatus(null);
    }, [readCatalogDesigns, readSavedDesigns, readSavedPricing]);

    // Find quote data
    const quote = quotes.find(q => q.projectName.toLowerCase() === quoteKey) || quotes[0]; // fallback
    const mockDesignsForQuote = useMemo(() => quoteDesigns[quoteKey] || [], [quoteKey]);
    const designs = useMemo(
        () => [...savedDesigns, ...mockDesignsForQuote],
        [savedDesigns, mockDesignsForQuote]
    );
    const staticCatalogItems = catalogItems.map((item) => ({ ...item, source: 'static' }));
    const allCatalogItems = [...catalogDesigns, ...staticCatalogItems];
    const pricingResult = useMemo(
        () => calculatePricing(designs, pricingRates),
        [designs, pricingRates]
    );
    const quotedValue = pricingResult.summary.grandTotal > 0 ? pricingResult.summary.grandTotal : quote.value;

    const openDesignEditorWithParams = useCallback((paramsObject) => {
        const queryParams = new URLSearchParams(paramsObject);
        router.push(`/quotes/${id}/design?${queryParams.toString()}`);
    }, [id, router]);

    const handleEditProjectDesign = useCallback((design) => {
        if (design?.canvas?.config && design?.id) {
            openDesignEditorWithParams({ designId: String(design.id) });
            return;
        }

        router.push(`/quotes/${id}/design`);
    }, [id, openDesignEditorWithParams, router]);

    const handleUseCatalogItem = useCallback((item) => {
        try {
            const savedRaw = localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
            const savedMap = savedRaw ? JSON.parse(savedRaw) : {};
            const existingDesigns = Array.isArray(savedMap?.[quoteKey]) ? savedMap[quoteKey] : [];
            const { width, height } = item?.template?.config
                ? {
                    width: toPositiveNumber(item.template.config.width, 1500),
                    height: toPositiveNumber(item.template.config.height, 1500),
                }
                : parseCatalogDimensions(item?.dims);
            const areaSqmt = (width * height) / 1000000;
            const nextDesign = {
                id: `catalog-use-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                designRef: item?.designRef || item?.name || `D-${existingDesigns.length + 1}`,
                name: item?.name || `Design ${existingDesigns.length + 1}`,
                qty: 1,
                image: item?.image || '/window.svg',
                location: '--',
                series: item?.series || 'Catalog',
                glass: item?.glass || '--',
                color: item?.color || 'CATALOG',
                price: Number(item?.price) || 0,
                floor: '--',
                note: item?.note || '--',
                size: `W = ${width.toFixed(2)}; H = ${height.toFixed(2)}`,
                area: `${areaSqmt.toFixed(3)} Sqmt`,
                rate: '--',
                weight: '--',
                hardware: '--',
                materialType: '--',
                savedAt: new Date().toISOString(),
                canvas: item?.template ? JSON.parse(JSON.stringify(item.template)) : undefined,
            };

            const nextSavedDesigns = [nextDesign, ...existingDesigns];
            localStorage.setItem(
                SAVED_DESIGNS_STORAGE_KEY,
                JSON.stringify({
                    ...savedMap,
                    [quoteKey]: nextSavedDesigns,
                })
            );
            setSavedDesigns(nextSavedDesigns);
            setActiveTab('project');
            setActionStatus({ type: 'success', message: `${nextDesign.name} added to project` });
        } catch (error) {
            console.error('Failed to add catalog item to project', error);
            setActionStatus({ type: 'error', message: 'Failed to add catalog design' });
        }
    }, [quoteKey]);

    const handleEditCatalogItem = useCallback((item) => {
        if (item?.template && item?.id) {
            openDesignEditorWithParams({ templateId: String(item.id) });
            return;
        }

        const { width, height } = parseCatalogDimensions(item?.dims);
        openDesignEditorWithParams({
            presetW: String(width),
            presetH: String(height),
            presetName: String(item?.name || 'Catalog design'),
        });
    }, [openDesignEditorWithParams]);

    const handlePricingRateChange = useCallback((rateKey, value) => {
        setPricingRates((prev) => ({
            ...prev,
            [rateKey]: toNonNegativeNumber(value, 0),
        }));
        setPricingStatus(null);
    }, []);

    const handleUpdatePricing = useCallback(() => {
        try {
            const rawPricing = localStorage.getItem(SAVED_PRICING_STORAGE_KEY);
            const parsedMap = rawPricing ? JSON.parse(rawPricing) : {};
            const nextMap = {
                ...(typeof parsedMap === 'object' && parsedMap ? parsedMap : {}),
                [quoteKey]: pricingRates,
            };

            localStorage.setItem(SAVED_PRICING_STORAGE_KEY, JSON.stringify(nextMap));
            setPricingStatus({ type: 'success', message: 'Pricing updated' });
        } catch (error) {
            console.error('Failed to update pricing', error);
            setPricingStatus({ type: 'error', message: 'Pricing update failed' });
        }
    }, [pricingRates, quoteKey]);

    const handleResetPricing = useCallback(() => {
        setPricingRates({ ...DEFAULT_PRICING_RATES });
        setPricingStatus({ type: 'success', message: 'Pricing reset to default' });
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Top Header - Contextual */}
            <div style={{
                height: '64px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back
                    </button>

                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.2' }}>{quote.projectName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{quote.id}</div>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border-primary)', margin: '0 12px' }}></div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Documents</button>
                        <button
                            onClick={() => setActiveModule('design')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                color: activeModule === 'design' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                background: activeModule === 'design' ? 'var(--bg-tertiary)' : 'transparent',
                                border: activeModule === 'design' ? '1px solid var(--border-primary)' : 'none',
                                cursor: 'pointer',
                                fontWeight: activeModule === 'design' ? '500' : '400',
                            }}
                        >
                            Design
                        </button>
                        <button
                            onClick={() => setActiveModule('pricing')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                color: activeModule === 'pricing' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                background: activeModule === 'pricing' ? 'var(--bg-tertiary)' : 'transparent',
                                border: activeModule === 'pricing' ? '1px solid var(--border-primary)' : 'none',
                                cursor: 'pointer',
                                fontWeight: activeModule === 'pricing' ? '500' : '400',
                            }}
                        >
                            Pricing
                        </button>
                        <button style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Report</button>
                    </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{mounted ? formatInr(quotedValue) : '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty : {mounted ? (pricingResult.metrics.totalQty || quote.quantity) : '—'} <span style={{ marginLeft: '4px', cursor: 'pointer' }}>ℹ️</span></div>
                    </div>

                    <button className="btn-primary" style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}>
                        Quick quote
                    </button>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>❓</button>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>🔔</button>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>N</div>
                    </div>
                </div>
            </div>

            {/* Sub Header & Filters */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeModule === 'design' ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setActiveTab('project')}
                                    style={{
                                        padding: '8px 20px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: activeTab === 'project' ? '#fff' : 'var(--text-muted)',
                                        background: activeTab === 'project' ? '#1e293b' : 'transparent',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                    Project
                                </button>
                                <button
                                    onClick={() => setActiveTab('catalog')}
                                    style={{
                                        padding: '8px 20px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: activeTab === 'catalog' ? '#fff' : 'var(--text-muted)',
                                        background: activeTab === 'catalog' ? '#1e293b' : 'transparent',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                    Catalog
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => router.push(`/quotes/${id}/design`)}>
                                Create design <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </button>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        style={{
                                            padding: '8px 12px 8px 36px',
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)',
                                            fontSize: '13px',
                                            width: '240px'
                                        }}
                                    />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>

                                <button className="btn-secondary" onClick={loadSavedDesigns}>↻ Refresh designs</button>
                                <button className="btn-secondary" style={{ border: 'none' }}>Design orders</button>
                                <button className="btn-secondary" style={{ border: 'none' }}>Filter</button>
                                <button className="btn-secondary">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                </button>
                            </div>
                        </div>
                        {actionStatus && (
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: actionStatus.type === 'success' ? '#16a34a' : '#dc2626',
                            }}>
                                {actionStatus.message}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Project price structure</div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Designs: {pricingResult.metrics.totalDesigns}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {pricingResult.metrics.totalQty}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Area: {pricingResult.metrics.totalAreaSqmt.toFixed(3)} Sqmt</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-secondary" onClick={loadSavedDesigns}>↻ Refresh</button>
                                <button className="btn-secondary" onClick={handleResetPricing}>Reset</button>
                                <button className="btn-primary" onClick={handleUpdatePricing}>Update pricing</button>
                            </div>
                        </div>
                        {pricingStatus && (
                            <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: pricingStatus.type === 'success' ? '#16a34a' : '#dc2626',
                            }}>
                                {pricingStatus.message}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-primary)' }}>
                {activeModule === 'design' ? (
                    activeTab === 'project' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {designs.map(design => (
                                <DesignCard key={design.id} design={design} onEdit={handleEditProjectDesign} onViewDetails={setSelectedDesign} />
                            ))}
                            {designs.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                    No designs added yet. START by creating a design or selecting from catalog.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                            {allCatalogItems.map(item => (
                                <CatalogCard key={item.id} item={item} onUse={handleUseCatalogItem} onEdit={handleEditCatalogItem} />
                            ))}
                        </div>
                    )
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                        <div style={{ border: '1px solid var(--border-primary)', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Sl. No</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Cost Heads</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Calculation Type</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Rate</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-secondary)' }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricingResult.costRows.map((row, index) => (
                                        <PricingCostRow
                                            key={row.id}
                                            index={index}
                                            row={row}
                                            onRateChange={handlePricingRateChange}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ background: 'linear-gradient(180deg, #14532d 0%, #166534 100%)', borderRadius: '10px', border: '1px solid #22c55e', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ fontSize: '36px', color: '#dcfce7', marginBottom: '4px' }}>₹</div>
                            <div style={{ fontSize: '34px', fontWeight: 700, color: '#f0fdf4', lineHeight: 1.1 }}>Price Summary</div>
                            <SummaryRow label="Basic Value" value={pricingResult.summary.basicValue} />
                            <SummaryRow label="Discount" value={pricingResult.summary.discount} />
                            <SummaryRow label="Sub Total" value={pricingResult.summary.subTotal} />
                            <SummaryRow label="Transportation Cost" value={pricingResult.summary.transportationCost} />
                            <SummaryRow label="Loading And Unloading" value={pricingResult.summary.loadingAndUnloadingCost} />
                            <SummaryRow label="Total Project Cost" value={pricingResult.summary.totalProjectCost} />
                            <SummaryRow label={`GST (${pricingRates.gstPct}%)`} value={pricingResult.summary.gst} />
                            <div style={{ height: '1px', background: 'rgba(220,252,231,0.25)' }} />
                            <SummaryRow label="Grand Total" value={pricingResult.summary.grandTotal} strong />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Details */}
            <div style={{
                padding: '12px 24px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)'
            }}>
                <div>
                    {activeModule === 'design'
                        ? `Total records ${activeTab === 'project' ? designs.length : allCatalogItems.length}`
                        : `Cost heads ${pricingResult.costRows.length}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>25 records per page ▾</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled style={{ opacity: 0.5 }}>‹</button>
                        <button className="btn-primary" style={{ padding: '2px 8px', height: 'auto' }}>1</button>
                        <button disabled style={{ opacity: 0.5 }}>›</button>
                    </div>
                </div>
            </div>

            {selectedDesign && (
                <DetailsDrawer design={selectedDesign} onClose={() => setSelectedDesign(null)} />
            )}
        </div>
    );
}
