'use client';
import { useState, useEffect, useRef, use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { quotes as defaultQuotesList, quoteDesigns, catalogItems, opportunities as defaultOpportunities } from '../../data/mockData';
import {
    getDesigns, saveDesigns,
    getCatalogItems, addCatalogItem,
    getQuoteRates, saveQuoteRates,
} from '../../lib/firestoreService';
import { useDesigns, useDesignCatalog, useQuoteRates, useOpportunities, useQuotes } from '../../lib/useFirestore';
import LoadingSpinner from '../../components/LoadingSpinner';

const DEFAULT_PROFILE_RATE_ITEMS = [
    { id: 'pr1', rmCode: '40101-03300', itemName: 'CMT SINGLE GLAZING BEAD 34MM I60', unit: 'Meter', priceLevel: 85 },
    { id: 'pr2', rmCode: '41101-11000', itemName: 'FRAME PROFILE I60', unit: 'Meter', priceLevel: 176 },
    { id: 'pr3', rmCode: '40102-03300', itemName: 'CMT DOUBLE GLAZING BEAD 34MM I60', unit: 'Meter', priceLevel: 92 },
    { id: 'pr4', rmCode: '41201-11000', itemName: 'TRANSOM PROFILE I60', unit: 'Meter', priceLevel: 165 },
    { id: 'pr5', rmCode: '41301-11000', itemName: 'MULLION PROFILE I60', unit: 'Meter', priceLevel: 158 },
];

const DEFAULT_REINFORCEMENT_RATE_ITEMS = [
    { id: 'ri1', rmCode: '56016-10001', itemName: 'I-60 FRAME/MULLION BOX REINFORCEMENT', unit: 'Kilogram', priceLevel: 100 },
];

const DEFAULT_HARDWARE_RATE_ITEMS = [
    { id: 'hw1', rmCode: '23605-15951', itemName: 'PROFILE PACKER 1MM', unit: 'Pieces', priceLevel: 0.9 },
    { id: 'hw2', rmCode: '23605-16900', itemName: 'FASTENER CAPS', unit: 'Pieces', priceLevel: 0.7 },
    { id: 'hw3', rmCode: '2460S-41201', itemName: 'SILICON', unit: 'CAN', priceLevel: 320 },
    { id: 'hw4', rmCode: '23605-16053', itemName: 'PROFILE PACKER 3MM', unit: 'Pieces', priceLevel: 1.1 },
    { id: 'hw5', rmCode: '2460S-41301', itemName: 'SILICON', unit: 'CAN', priceLevel: 160 },
    { id: 'hw6', rmCode: '24902-37608', itemName: 'FASTENER SCREWS', unit: 'Pieces', priceLevel: 0 },
    { id: 'hw7', rmCode: '23605-16155', itemName: 'PROFILE PACKER 5MM', unit: 'Pieces', priceLevel: 1.2 },
    { id: 'hw8', rmCode: '24902-12416', itemName: '4 X 16 CSK (REIN) SCREW', unit: 'Pieces', priceLevel: 0.42 },
    { id: 'hw9', rmCode: '23605-16805', itemName: 'GLASS PACKER 5MM', unit: 'Pieces', priceLevel: 1.3 },
    { id: 'hw10', rmCode: '23605-16500', itemName: 'DRAINAGE COVER', unit: 'Pieces', priceLevel: 1 },
    { id: 'hw11', rmCode: 'BACKUP ROD', itemName: 'BACKUP ROD', unit: 'Meter', priceLevel: 0.1 },
];

const DEFAULT_GLASS_RATE_ITEMS = [
    { id: 'gl1', rmCode: '5 MM BLACK GLASS', itemName: '5 MM BLACK GLASS', unit: 'Square Meter', priceLevel: 968.4 },
];

const COMPANY_REPORT = {
    name: 'EURO SYSTEM ALUMINIUM',
    address: 'Thota village, near Mphasis\nmorgansgate jeppu mangalore-575002',
    contactNo: '+91 9535009482',
    email: 'eurosystemaluminium@gmail.com',
    logoUrl: '/logo.png',
};

const DEFAULT_PRICING_RATES = {
    profileCostPerSqmt: 1950,
    profileWastagePct: 8,
    riCostMultiplier: 0.12,
    riWastagePct: 3,
    hardwareCostPerUnit: 950,
    glassCostPerSqmt: 968.4,
    glassWastagePct: 5,
    powderCoatingPerMeter: 0,
    woodFinishingPerMeter: 0,
    anodizingPerMeter: 0,
    fabricationLabourPerSqmt: 350,
    installationLabourPerSqmt: 250,
    profitPct: 15,
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

const sqmtToSqft = (sqmt) => (Number(sqmt) * 10.764).toFixed(2);

function buildQuotationReportHTML({ quote, opportunity, designs, pricingResult, pricingRates, company }) {
    const contactName = opportunity?.contact || quote?.contact || 'Customer';
    const quoteDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const footerBlock = `
        <div class="report-footer">
            Quote No. : ${quote?.id || '—'} / Project : ${quote?.projectName || '—'} / Date : ${quoteDate}<br/>
            ${company?.name || ''}<br/>${company?.address || ''}<br/>Contact No. : ${company?.contactNo || ''}<br/>Email : ${company?.email || ''}
        </div>`;
    const summary = pricingResult?.summary || {};
    const totalAreaSqft = pricingResult?.metrics?.totalAreaSqmt ? (pricingResult.metrics.totalAreaSqmt * 10.764).toFixed(2) : '0';
    const totalWindows = pricingResult?.metrics?.totalQty ?? 0;
    const avgPerSqft = totalAreaSqft > 0 && summary.grandTotal ? (summary.grandTotal / (totalAreaSqft * 1)).toFixed(2) : '0';
    const avgPerSqftExGst = totalAreaSqft > 0 && summary.totalProjectCost ? (summary.totalProjectCost / (totalAreaSqft * 1)).toFixed(2) : '0';

    const designRows = (designs || []).map((d, i) => {
        const areaSqmt = parseAreaSqmt(d.area) || (parseSizeMm(d.size) ? (parseSizeMm(d.size).width * parseSizeMm(d.size).height) / 1000000 : 0);
        const areaSqft = (areaSqmt * 10.764).toFixed(2);
        const qty = toPositiveNumber(d.qty, 1);
        const rate = qty > 0 ? (d.price / qty).toFixed(2) : '0';
        const amount = (Number(d.price) || 0).toFixed(2);
        const ratePerSqft = areaSqft > 0 ? (d.price / (areaSqft * 1)).toFixed(2) : '—';
        const hasImage = d.image && (d.image.startsWith('data:') || d.image.startsWith('http'));
        const designImgCell = hasImage
            ? `<td class="design-cell"><div class="design-img-wrap"><img src="${d.image}" alt="${d.designRef || ''}" class="design-thumb"/><span class="design-dims">${d.size || '—'}</span></div></td>`
            : `<td class="design-cell"><div class="design-img-wrap design-placeholder"><span class="design-dims">${d.size || '—'}</span></div></td>`;
        return `
            <tr>
                <td>${i + 1}.</td>
                ${designImgCell}
                <td class="spec-cell">
                    Code : ${d.designRef || '—'}<br/>
                    Dimension : ${d.size || '—'}<br/>
                    Location : ${d.location || '—'}<br/>
                    Area : ${areaSqft} Sqft.<br/>
                    Weight : ${d.weight || '—'} Kg<br/>
                    Profile Brand : ${d.profileBrand || '—'}<br/>
                    System : ${d.series || '—'}<br/>
                    Type : ${d.name || d.designRef || '—'}<br/>
                    Glazing : ${d.glass || '—'}<br/>
                    Profile Color : ${d.color || '—'}<br/>
                    MeshType : ${d.meshType || 'No'}
                </td>
                <td>${qty}</td>
                <td>${rate}<br/>(${ratePerSqft}/Sqft)</td>
                <td>${amount}</td>
            </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>Quotation Report - ${quote?.projectName || 'Quote'}</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 16px; -webkit-font-smoothing: antialiased; }
        .page-break { page-break-after: always; }
        .report-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #475569; font-family: Arial, Helvetica, sans-serif; }
        .company-block { font-weight: 700; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif; }
        table.spec { width: 100%; border-collapse: collapse; margin: 12px 0; font-family: Arial, Helvetica, sans-serif; }
        table.spec th, table.spec td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: left; vertical-align: top; }
        table.spec th { background: #3b82f6; color: #fff; font-size: 11px; font-weight: 700; }
        table.spec td:nth-child(1) { width: 36px; }
        table.spec .design-cell { width: 140px; min-width: 140px; background: #eff6ff; vertical-align: middle; text-align: center; }
        table.spec .design-img-wrap { padding: 6px; background: #dbeafe; border-radius: 4px; }
        table.spec .design-thumb { max-width: 120px; max-height: 100px; width: auto; height: auto; display: block; margin: 0 auto 6px; object-fit: contain; }
        table.spec .design-dims { font-size: 9px; color: #1e40af; font-weight: 600; display: block; }
        table.spec .design-placeholder { min-height: 80px; display: flex; align-items: center; justify-content: center; }
        table.spec .spec-cell { font-size: 10px; line-height: 1.35; }
        table.spec td:nth-child(4) { width: 48px; text-align: right; }
        table.spec td:nth-child(5) { width: 90px; text-align: right; }
        table.spec td:nth-child(6) { width: 90px; text-align: right; }
        .letter { line-height: 1.5; font-family: Arial, Helvetica, sans-serif; }
        .summary-table { width: 320px; margin-left: auto; border-collapse: collapse; font-family: Arial, Helvetica, sans-serif; }
        .summary-table td { padding: 6px 12px; border-bottom: 1px solid #e2e8f0; }
        .summary-table td:last-child { text-align: right; font-weight: 700; }
        .terms { font-size: 10px; line-height: 1.4; font-family: Arial, Helvetica, sans-serif; }
        @media print { body { padding: 12px; } .report-footer { position: fixed; bottom: 0; left: 0; right: 0; } .design-cell { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="letter">
        <p>Dear ${contactName},</p>
        <p>We are delighted that you are considering our range of Windows and Doors for your premises. It has gained rapid acceptance across all cities of India for the overwhelming advantages of better protection from noise, heat, rain, dust and pollution.</p>
        <p>In drawing this proposal, it has been our endeavor to suggest designs which would enhance your comfort and aesthetics from inside and improve the facade of the building. It has a well established service network to deliver seamless service at your doorstep. Our offer comprises of the following in enclosure for your kind perusal:</p>
        <p>a. Window design, specification and value<br/>b. Terms and Conditions</p>
        <p>We now look forward to be of service to you.</p>
        <p>For ${company?.name || 'EURO SYSTEM ALUMINIUM'},<br/>Authorized Signatory</p>
        <p><strong>To</strong><br/>Mr/Ms ${contactName}</p>
    </div>
    ${footerBlock}
    <div class="page-break"></div>

    <div class="company-block">${company?.name || ''}</div>
    <div>${company?.address || ''}<br/>Contact No. : ${company?.contactNo || ''}<br/>Email : ${company?.email || ''}</div>
    <table class="spec">
        <thead><tr><th>SI NO.</th><th>DESIGN</th><th>SPECIFICATIONS</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
        <tbody>${designRows}</tbody>
    </table>
    <table class="summary-table">
        <tr><td>Total Area</td><td>${totalAreaSqft} Sq.Ft.</td></tr>
        <tr><td>Total Windows</td><td>${totalWindows} Nos</td></tr>
        <tr><td>Avg. price per Sqft</td><td>Rs. ${avgPerSqft}</td></tr>
        <tr><td>Avg. price per Sqft without GST</td><td>Rs. ${avgPerSqftExGst}</td></tr>
        <tr><td>Basic Value</td><td>Rs ${(summary.basicValue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Sub Total</td><td>Rs ${(summary.subTotal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Transportation Cost</td><td>Rs ${(summary.transportationCost ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Loading And Unloading</td><td>Rs ${(summary.loadingAndUnloadingCost ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Total Project Cost</td><td>Rs ${(summary.totalProjectCost ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Gst @${pricingRates?.gstPct ?? 18}%</td><td>Rs ${(summary.gst ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td><strong>Grand Total</strong></td><td><strong>Rs ${(summary.grandTotal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td></tr>
    </table>
    ${footerBlock}
    <div class="page-break"></div>

    <div class="company-block">${company?.name || ''}</div>
    <div>${company?.address || ''}<br/>Contact No. : ${company?.contactNo || ''}<br/>Email : ${company?.email || ''}</div>
    <div class="terms">
        <p><strong>Terms and Conditions:-</strong></p>
        <p>1. 10 Year Warranty for UPVC Profile and TPE Gaskets.</p>
        <p>2. Note :</p>
        <p>a. Quotation will be valid for a period of 30 days.</p>
        <p>b. If there is a taper in the wall which will cause a gap of more than 7mm then the same will have to be filled by the client, we will not fill extra silicone.</p>
        <p>c. Scaffolding should be provided by the client (if windows are to be fixed externally above ground floor).</p>
        <p>d. The validity of offer is 15 days from the date of this letter.</p>
        <p>e. Delivery date will be given on receipt of P.O and Payment. (20 to 30 Days from Receipt of Payment).</p>
        <p>3. Payment Terms :</p>
        <p>a. 75% Payment to be given along with the P.O.</p>
        <p>b. 25% Payment to be given on Material Delivery at site.</p>
        <p>4. Joint Measurement of Window sizes to be taken along with the Site Engineer/Client for all Windows.</p>
        <p>5. No replacement will be given if sizes given are not actual sizes on site post joint measurement.</p>
        <p>6. Transportation charges will be extra if the site is above 15kms from Mangalore.</p>
        <p><strong>Bank Details :</strong><br/>Account Name : NEW IDEAL UPVC<br/>Account Number : 50200054500800<br/>Bank Name : HDFC BANK<br/>IFSC : HDFC0005355<br/>Branch : HDFC BANK</p>
        <p>I hereby accept the estimate as per above mentioned price and specifications. I have read and understood the terms & conditions and agree to them.</p>
        <p>Authorized Signatory &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature of Customer</p>
    </div>
    ${footerBlock}
</body>
</html>`;
}

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
    const riCost = roundCurrency(profileCost * mergedRates.riCostMultiplier);
    const riWastage = roundCurrency((riCost * mergedRates.riWastagePct) / 100);
    const hardwareCost = roundCurrency(metrics.totalQty * mergedRates.hardwareCostPerUnit);
    const glassCost = roundCurrency(metrics.totalAreaSqmt * mergedRates.glassCostPerSqmt);
    const glassWastage = roundCurrency((glassCost * mergedRates.glassWastagePct) / 100);
    const powderCoatingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.powderCoatingPerMeter);
    const woodFinishingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.woodFinishingPerMeter);
    const anodizingCost = roundCurrency(metrics.totalPerimeterM * mergedRates.anodizingPerMeter);

    const totalRawMaterialCost = roundCurrency(
        profileCost +
        profileWastage +
        riCost +
        riWastage +
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
            calculationType: 'CustomFormula',
            rateKey: 'profileCostPerSqmt',
            rate: mergedRates.profileCostPerSqmt,
            value: profileCost,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'profileWastage',
            costHead: 'Profile Wastage',
            calculationType: 'Percentage',
            rateKey: 'profileWastagePct',
            rate: mergedRates.profileWastagePct,
            value: profileWastage,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'riCost',
            costHead: 'RI Cost',
            calculationType: 'CustomFormula',
            rateKey: 'riCostMultiplier',
            rate: mergedRates.riCostMultiplier,
            value: riCost,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'riWastage',
            costHead: 'RI Wastage',
            calculationType: 'Percentage',
            rateKey: 'riWastagePct',
            rate: mergedRates.riWastagePct,
            value: riWastage,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'hardwareCost',
            costHead: 'Hardware Cost',
            calculationType: 'CustomFormula',
            rateKey: 'hardwareCostPerUnit',
            rate: mergedRates.hardwareCostPerUnit,
            value: hardwareCost,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'glassCost',
            costHead: 'Glass Cost',
            calculationType: 'CustomFormula',
            rateKey: 'glassCostPerSqmt',
            rate: mergedRates.glassCostPerSqmt,
            value: glassCost,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'glassWastage',
            costHead: 'Glass Wastage',
            calculationType: 'Percentage',
            rateKey: 'glassWastagePct',
            rate: mergedRates.glassWastagePct,
            value: glassWastage,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'totalRawMaterialCost',
            costHead: 'Total Raw Material Cost',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1,
            value: totalRawMaterialCost,
            highlight: true,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'fabricationLabour',
            costHead: 'Fabrication Labour',
            calculationType: 'AreaSqftFg',
            rateKey: 'fabricationLabourPerSqmt',
            rate: mergedRates.fabricationLabourPerSqmt,
            value: fabricationLabour,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'installationLabour',
            costHead: 'Installation Labour',
            calculationType: 'AreaSqftFg',
            rateKey: 'installationLabourPerSqmt',
            rate: mergedRates.installationLabourPerSqmt,
            value: installationLabour,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'subTotalIncludingLabour',
            costHead: 'Sub Total Including Labour',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1,
            value: subTotalIncludingLabour,
            highlight: true,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'profit',
            costHead: 'Profit',
            calculationType: 'Percentage',
            rateKey: 'profitPct',
            rate: mergedRates.profitPct,
            value: profit,
            visibility: 'Do not show in Quote',
        },
        {
            id: 'basicValue',
            costHead: 'Basic Value',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1,
            value: basicValue,
            highlight: true,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'discount',
            costHead: 'Discount',
            calculationType: 'Percentage',
            rateKey: 'discountPct',
            rate: mergedRates.discountPct,
            value: discount,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'subTotal',
            costHead: 'Sub Total',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1,
            value: subTotal,
            highlight: true,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'transportation',
            costHead: 'Transportation Cost',
            calculationType: 'LumpSumDivideByArea',
            rateKey: 'transportationCost',
            rate: mergedRates.transportationCost,
            value: transportationCost,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'loadingAndUnloading',
            costHead: 'Loading And Unloading',
            calculationType: 'LumpSumDivideByArea',
            rateKey: 'loadingAndUnloadingCost',
            rate: mergedRates.loadingAndUnloadingCost,
            value: loadingAndUnloadingCost,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'totalProjectCost',
            costHead: 'Total Project Cost',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1,
            value: totalProjectCost,
            highlight: true,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'gst',
            costHead: 'GST',
            calculationType: 'Percentage',
            rateKey: 'gstPct',
            rate: mergedRates.gstPct,
            value: gst,
            visibility: 'Show in Quote Summary',
        },
        {
            id: 'grandTotal',
            costHead: 'Grand Total',
            calculationType: 'CustomFormula',
            rateKey: null,
            rate: 1.2,
            value: grandTotal,
            highlight: true,
            visibility: 'Show in Quote Summary',
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

const calculateDesignPrice = (design, rates) => {
    const mergedRates = { ...DEFAULT_PRICING_RATES, ...(rates || {}) };
    const qty = toPositiveNumber(design?.qty, 1);
    const parsedArea = parseAreaSqmt(design?.area);
    const parsedSize = parseSizeMm(design?.size);
    const areaSqmt = parsedArea > 0 ? parsedArea : parsedSize ? (parsedSize.width * parsedSize.height) / 1000000 : 0;
    const perimeterM = parsedSize ? ((parsedSize.width + parsedSize.height) * 2) / 1000 : 0;

    const profileCost = roundCurrency(areaSqmt * mergedRates.profileCostPerSqmt);
    const profileWastage = roundCurrency((profileCost * mergedRates.profileWastagePct) / 100);
    const riCost = roundCurrency(profileCost * (mergedRates.riCostMultiplier || 0));
    const riWastage = roundCurrency((riCost * mergedRates.riWastagePct) / 100);
    const hardwareCost = roundCurrency(1 * mergedRates.hardwareCostPerUnit);
    const glassCost = roundCurrency(areaSqmt * mergedRates.glassCostPerSqmt);
    const glassWastage = roundCurrency((glassCost * mergedRates.glassWastagePct) / 100);
    const powderCoatingCost = roundCurrency(perimeterM * mergedRates.powderCoatingPerMeter);
    const woodFinishingCost = roundCurrency(perimeterM * mergedRates.woodFinishingPerMeter);
    const anodizingCost = roundCurrency(perimeterM * mergedRates.anodizingPerMeter);

    const totalRawMaterialCost = roundCurrency(
        profileCost + profileWastage + riCost + riWastage + hardwareCost +
        glassCost + glassWastage + powderCoatingCost + woodFinishingCost + anodizingCost
    );
    const fabricationLabour = roundCurrency(areaSqmt * mergedRates.fabricationLabourPerSqmt);
    const installationLabour = roundCurrency(areaSqmt * mergedRates.installationLabourPerSqmt);
    const subTotalIncludingLabour = roundCurrency(totalRawMaterialCost + fabricationLabour + installationLabour);
    const profit = roundCurrency((subTotalIncludingLabour * mergedRates.profitPct) / 100);
    const extraCost = roundCurrency((subTotalIncludingLabour * mergedRates.extraCostPct) / 100);
    const basicValue = roundCurrency(subTotalIncludingLabour + profit + extraCost);
    const discount = roundCurrency((basicValue * mergedRates.discountPct) / 100);
    const unitPrice = roundCurrency(basicValue - discount);

    return roundCurrency(unitPrice * qty);
};

function DesignCard({ design, onEdit, onViewDetails, isChecked, onToggleSelect, onDuplicate, onSaveToLibrary, onMultipleCopy, onReplaceImage, onDelete }) {
    const displayRef = design.designRef || design.name;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const menuItems = [
        { label: 'Duplicate', action: () => { onDuplicate?.(design); setMenuOpen(false); } },
        { label: 'Save In Library', action: () => { onSaveToLibrary?.(design); setMenuOpen(false); } },
        { label: 'Manage Variants', action: () => { onEdit?.(design); setMenuOpen(false); } },
        { label: 'Multiple copy', action: () => { onMultipleCopy?.(design); setMenuOpen(false); } },
        { label: 'Replace Image', action: () => { onReplaceImage?.(design); setMenuOpen(false); } },
        { label: 'History', action: () => { onViewDetails?.(design); setMenuOpen(false); } },
        { label: 'Delete', action: () => { onDelete?.(design); setMenuOpen(false); }, danger: true },
    ];

    return (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', outline: isChecked ? '2px solid var(--accent-primary)' : 'none' }}>
            {/* Header with checkbox, design ref, and actions */}
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    checked={!!isChecked}
                    onChange={() => onToggleSelect && onToggleSelect(design.id)}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, textAlign: 'center' }}>{displayRef}</span>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }} ref={menuRef}>
                    <button
                        onClick={() => onEdit && onEdit(design)}
                        title="Open in editor"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </button>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: menuOpen ? 'var(--accent-primary)' : 'none',
                            border: 'none',
                            color: menuOpen ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: '100%',
                            marginRight: '4px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            zIndex: 100,
                            minWidth: '180px',
                            overflow: 'hidden',
                        }}>
                            {menuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 16px',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        color: item.danger ? '#ef4444' : 'var(--text-primary)',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        borderBottom: idx < menuItems.length - 1 ? '1px solid var(--border-primary)' : 'none',
                                        transition: 'background 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
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
                <div style={{ textAlign: 'center' }}>
                    <img src={design.image} alt={design.name} style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
            </div>

            {/* Footer Info */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{displayRef}{design.revision ? ` · Rev ${design.revision}` : ''}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty. : {design.qty}</span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Location :</span> {design.location}</div>
                    <div>{design.series}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><span style={{ fontWeight: '600' }}>Glass :</span> {design.glass}</span>
                        <span style={{
                            padding: '2px 8px',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                        }}>{design.color}</span>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Price:  ₹{Number(design.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <DetailRow label="Revision" value={design.revision ?? '--'} />
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

function PricingCostRow({ index, row, onRateChange, onVisibilityChange }) {
    const isHighlight = row.highlight;
    const rowBg = isHighlight ? 'rgba(37, 99, 235, 0.18)' : 'transparent';
    const isShowInQuote = row.visibility === 'Show in Quote Summary';
    return (
        <tr style={{ background: rowBg }}>
            <td style={{ padding: '10px 6px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)', width: '32px', textAlign: 'center', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </td>
            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', width: '40px', textAlign: 'center', fontSize: '13px' }}>
                {index + 1}
            </td>
            <td style={{ padding: '10px 4px', borderBottom: '1px solid var(--border-primary)', width: '28px', textAlign: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isHighlight ? '#60a5fa' : '#f59e0b'} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: isHighlight ? '#93c5fd' : 'var(--text-primary)', fontWeight: isHighlight ? 600 : 400, minWidth: '200px', fontSize: '13px' }}>
                {row.costHead}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {row.calculationType}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', color: 'var(--text-secondary)', width: '120px' }}>
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
                            fontSize: '13px',
                        }}
                    />
                ) : (
                    <span style={{ fontSize: '13px' }}>{row.rate ?? '--'}</span>
                )}
            </td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-primary)', minWidth: '180px' }}>
                <select
                    value={row.visibility || 'Do not show in Quote'}
                    onChange={(e) => onVisibilityChange(row.id, e.target.value)}
                    style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '6px',
                        color: isShowInQuote ? '#34d399' : 'var(--text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        appearance: 'auto',
                    }}
                >
                    <option value="Do not show in Quote">Do not show in Quote</option>
                    <option value="Show in Quote Summary">Show in Quote Summary</option>
                </select>
            </td>
        </tr>
    );
}

function SummaryRow({ label, value, strong = false }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: strong ? 700 : 400, color: 'var(--text-primary)' }}>
            <span style={{ color: strong ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: strong ? 700 : 600 }}>{formatInr(value)}</span>
        </div>
    );
}

export default function QuoteDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);
    const quoteKey = id.toLowerCase();

    // Firestore hooks for real-time data
    const { designs: firestoreDesigns, loading: designsLoading } = useDesigns(quoteKey);
    const { catalog: firestoreCatalog, loading: catalogLoading } = useDesignCatalog();
    const { rates: firestoreRates, loading: ratesLoading } = useQuoteRates(quoteKey);
    const { opportunities: firestoreOpportunities } = useOpportunities();
    const { quotes: firestoreQuotes, loading: quotesLoading } = useQuotes();

    const dataLoading = designsLoading || catalogLoading || ratesLoading || quotesLoading;

    const [activeModule, setActiveModule] = useState('design'); // 'design' or 'pricing'
    const [activeTab, setActiveTab] = useState('project'); // 'project' or 'catalog'
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [selectedDesignIds, setSelectedDesignIds] = useState(new Set());
    const [designSearch, setDesignSearch] = useState('');
    const [designPage, setDesignPage] = useState(1);
    const [designPageSize, setDesignPageSize] = useState(25);
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [catalogDesigns, setCatalogDesigns] = useState([]);
    const [actionStatus, setActionStatus] = useState(null);
    const [pricingStatus, setPricingStatus] = useState(null);
    const [pricingRates, setPricingRates] = useState({ ...DEFAULT_PRICING_RATES });
    const [costRowVisibility, setCostRowVisibility] = useState({});
    const [pricingSubSection, setPricingSubSection] = useState('project-structure');
    const [priceStructureDropdown, setPriceStructureDropdown] = useState('Price Structure NCL');
    const [profileRateItems, setProfileRateItems] = useState([...DEFAULT_PROFILE_RATE_ITEMS]);
    const [profileRateSearch, setProfileRateSearch] = useState('');
    const [profileRateDropdown, setProfileRateDropdown] = useState('Default Profile Rate');
    const [profileRateSelectedIds, setProfileRateSelectedIds] = useState(new Set());
    const [profileRateStatus, setProfileRateStatus] = useState(null);
    const [reinforcementRateItems, setReinforcementRateItems] = useState(() => [...DEFAULT_REINFORCEMENT_RATE_ITEMS]);
    const [reinforcementRateSearch, setReinforcementRateSearch] = useState('');
    const [reinforcementRateDropdown, setReinforcementRateDropdown] = useState('Default RI Rate');
    const [reinforcementRateSelectedIds, setReinforcementRateSelectedIds] = useState(new Set());
    const [reinforcementRateStatus, setReinforcementRateStatus] = useState(null);
    const [hardwareRateItems, setHardwareRateItems] = useState(() => [...DEFAULT_HARDWARE_RATE_ITEMS]);
    const [hardwareRateSearch, setHardwareRateSearch] = useState('');
    const [hardwareRateDropdown, setHardwareRateDropdown] = useState('Default HW Rate');
    const [hardwareRateSelectedIds, setHardwareRateSelectedIds] = useState(new Set());
    const [hardwareRateStatus, setHardwareRateStatus] = useState(null);
    const [glassRateItems, setGlassRateItems] = useState(() => [...DEFAULT_GLASS_RATE_ITEMS]);
    const [glassRateSearch, setGlassRateSearch] = useState('');
    const [glassRateSelectedIds, setGlassRateSelectedIds] = useState(new Set());
    const [glassRateStatus, setGlassRateStatus] = useState(null);
    const [downloadReportModalOpen, setDownloadReportModalOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const PRICING_SIDE_NAV = [
        { id: 'project-structure', label: 'Project Price Structure', icon: 'doc' },
        { id: 'profile-rate', label: 'Profile Rate', icon: 'profile' },
        { id: 'reinforcement-rate', label: 'Reinforcement Rate', icon: 'block' },
        { id: 'hardware-rate', label: 'Hardware Rate', icon: 'hardware' },
        { id: 'glass-rate', label: 'Glass Rate', icon: 'glass' },
        { id: 'mesh-rate', label: 'Mesh Rate', icon: 'mesh' },
        { id: 'design-addon', label: 'Design Add On Cost Heads', icon: 'design' },
    ];

    const loadSavedDesigns = useCallback(() => {
        setActionStatus(null);
        setPricingStatus(null);
        setProfileRateStatus(null);
    }, []);

    // Sync Firestore hook data into local state
    useEffect(() => {
        setSavedDesigns(firestoreDesigns);
    }, [firestoreDesigns]);

    useEffect(() => {
        setCatalogDesigns(firestoreCatalog);
    }, [firestoreCatalog]);

    useEffect(() => {
        if (firestoreRates.pricing) {
            setPricingRates({ ...DEFAULT_PRICING_RATES, ...firestoreRates.pricing });
        }
        if (firestoreRates.profileRates) {
            const savedByItemId = firestoreRates.profileRates;
            setProfileRateItems(
                DEFAULT_PROFILE_RATE_ITEMS.map((def) => ({
                    ...def,
                    priceLevel: typeof savedByItemId[def.id] === 'number' ? savedByItemId[def.id] : def.priceLevel,
                }))
            );
        }
        if (firestoreRates.reinforcementRates) {
            const savedByItemId = firestoreRates.reinforcementRates;
            setReinforcementRateItems(
                DEFAULT_REINFORCEMENT_RATE_ITEMS.map((def) => ({
                    ...def,
                    priceLevel: typeof savedByItemId[def.id] === 'number' ? savedByItemId[def.id] : def.priceLevel,
                }))
            );
        }
        if (firestoreRates.hardwareRates) {
            const savedByItemId = firestoreRates.hardwareRates;
            setHardwareRateItems(
                DEFAULT_HARDWARE_RATE_ITEMS.map((def) => ({
                    ...def,
                    priceLevel: typeof savedByItemId[def.id] === 'number' ? savedByItemId[def.id] : def.priceLevel,
                }))
            );
        }
        if (firestoreRates.glassRates) {
            const savedByItemId = firestoreRates.glassRates;
            setGlassRateItems(
                DEFAULT_GLASS_RATE_ITEMS.map((def) => ({
                    ...def,
                    priceLevel: typeof savedByItemId[def.id] === 'number' ? savedByItemId[def.id] : def.priceLevel,
                }))
            );
        }
    }, [firestoreRates]);

    // --- Selection handlers for bulk actions ---
    const handleToggleSelectDesign = useCallback((designId) => {
        setSelectedDesignIds((prev) => {
            const next = new Set(prev);
            if (next.has(designId)) {
                next.delete(designId);
            } else {
                next.add(designId);
            }
            return next;
        });
    }, []);

    const handleSelectAllDesigns = useCallback(() => {
        setSelectedDesignIds(new Set(savedDesigns.map((d) => d.id)));
    }, [savedDesigns]);

    const handleDeselectAll = useCallback(() => {
        setSelectedDesignIds(new Set());
    }, []);

    const handleDeleteSelectedDesigns = useCallback(async () => {
        if (selectedDesignIds.size === 0) return;
        try {
            const remaining = savedDesigns.filter((d) => !selectedDesignIds.has(d.id));
            await saveDesigns(quoteKey, remaining);
            setSavedDesigns(remaining);
            setSelectedDesignIds(new Set());
            setActionStatus({ type: 'success', message: `${selectedDesignIds.size} design(s) deleted` });
        } catch (error) {
            console.error('Failed to delete designs', error);
            setActionStatus({ type: 'error', message: 'Delete failed' });
        }
    }, [selectedDesignIds, savedDesigns, quoteKey]);

    const handleDuplicateSelectedDesigns = useCallback(async () => {
        if (selectedDesignIds.size === 0) return;
        try {
            const existingDesigns = savedDesigns;
            const duplicates = existingDesigns
                .filter((d) => selectedDesignIds.has(d.id))
                .map((d) => ({
                    ...d,
                    id: `dup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    designRef: (d.designRef || d.name || 'Design') + ' (copy)',
                    name: (d.name || d.designRef || 'Design') + ' (copy)',
                    savedAt: new Date().toISOString(),
                }));
            const nextDesigns = [...duplicates, ...existingDesigns];
            await saveDesigns(quoteKey, nextDesigns);
            setSavedDesigns(nextDesigns);
            setSelectedDesignIds(new Set());
            setActionStatus({ type: 'success', message: `${duplicates.length} design(s) duplicated` });
        } catch (error) {
            console.error('Failed to duplicate designs', error);
            setActionStatus({ type: 'error', message: 'Duplicate failed' });
        }
    }, [selectedDesignIds, savedDesigns, quoteKey]);

    // --- Individual card menu actions ---
    // Duplicate modal state
    const [duplicateModal, setDuplicateModal] = useState(null); // source design
    const [duplicateForm, setDuplicateForm] = useState({ ref: '', name: '', qty: 1 });

    const handleDuplicateDesign = useCallback((design) => {
        setDuplicateForm({
            ref: '',
            name: design.name || design.designRef || '',
            qty: design.qty || 1,
        });
        setDuplicateModal(design);
    }, []);

    const handleDuplicateConfirm = useCallback(async () => {
        if (!duplicateModal) return;
        if (!duplicateForm.ref.trim()) {
            setActionStatus({ type: 'error', message: 'Design ref. is required' });
            return;
        }
        try {
            const existingDesigns = savedDesigns;
            const duplicate = {
                ...duplicateModal,
                id: `dup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                designRef: duplicateForm.ref.trim(),
                name: duplicateForm.name.trim() || duplicateForm.ref.trim(),
                qty: Math.max(1, Number(duplicateForm.qty) || 1),
                location: '',
                floor: '',
                savedAt: new Date().toISOString(),
            };
            if (duplicate.canvas?.config) {
                duplicate.canvas = {
                    ...duplicate.canvas,
                    config: {
                        ...duplicate.canvas.config,
                        ref: duplicate.designRef,
                        name: duplicate.name,
                        qty: duplicate.qty,
                        location: '',
                        floor: '',
                    },
                };
            }
            const nextDesigns = [duplicate, ...existingDesigns];
            await saveDesigns(quoteKey, nextDesigns);
            setSavedDesigns(nextDesigns);
            setActionStatus({ type: 'success', message: `"${duplicate.designRef}" created` });
            setDuplicateModal(null);
        } catch (error) {
            console.error('Duplicate failed', error);
            setActionStatus({ type: 'error', message: 'Duplicate failed' });
        }
    }, [duplicateModal, duplicateForm, savedDesigns, quoteKey]);

    const handleSaveToLibrary = useCallback(async (design) => {
        try {
            const width = design.canvas?.config?.width || 1500;
            const height = design.canvas?.config?.height || 1500;
            const catalogEntry = {
                ...design,
                id: `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                dims: `${Math.round(width)} x ${Math.round(height)}`,
                template: design.canvas ? JSON.parse(JSON.stringify(design.canvas)) : undefined,
                savedAt: new Date().toISOString(),
            };
            await addCatalogItem(catalogEntry);
            setActionStatus({ type: 'success', message: `"${design.designRef || design.name}" saved to library` });
        } catch (error) {
            console.error('Save to library failed', error);
            setActionStatus({ type: 'error', message: 'Save to library failed' });
        }
    }, []);

    const [multipleCopyModal, setMultipleCopyModal] = useState(null); // design object when modal is open
    const [multipleCopyDimensions, setMultipleCopyDimensions] = useState([{ width: 1500, height: 1500, name: '', qty: 1 }]);

    const handleMultipleCopyOpen = useCallback((design) => {
        const baseWidth = Number(design?.canvas?.config?.width) || 1500;
        const baseHeight = Number(design?.canvas?.config?.height) || 1500;
        const baseName = design?.name || design?.designRef || '';
        const baseQty = Number(design?.qty ?? design?.canvas?.config?.qty) || 1;
        setMultipleCopyDimensions([{ width: baseWidth, height: baseHeight, name: baseName, qty: baseQty }]);
        setMultipleCopyModal(design);
    }, []);

    const handleMultipleCopyConfirm = useCallback(async () => {
        if (!multipleCopyModal) return;
        const rows = multipleCopyDimensions.filter(
            (r) => Number(r.width) > 0 && Number(r.height) > 0 && String(r.name ?? '').trim() !== '' && Math.max(1, Number(r.qty) || 1) >= 1
        );
        const invalid = multipleCopyDimensions.some(
            (r) => Number(r.width) <= 0 || Number(r.height) <= 0 || String(r.name ?? '').trim() === ''
        );
        if (rows.length === 0) {
            setActionStatus({
                type: 'error',
                message: invalid ? 'Each row must have width, height, and design name. Design quantity must be at least 1.' : 'Add at least one row.',
            });
            return;
        }
        try {
            const existingDesigns = savedDesigns;
            const copies = rows.map((row, i) => {
                const width = Math.max(1, Number(row.width) || 1500);
                const height = Math.max(1, Number(row.height) || 1500);
                const name = String(row.name ?? '').trim() || `Design (${i + 1})`;
                const qty = Math.max(1, Number(row.qty) || 1);
                const areaSqmt = (width * height) / 1000000;
                const cloned = JSON.parse(JSON.stringify(multipleCopyModal));
                cloned.id = `dup-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
                cloned.designRef = name;
                cloned.name = name;
                cloned.qty = qty;
                cloned.savedAt = new Date().toISOString();
                cloned.size = `W = ${width.toFixed(2)}; H = ${height.toFixed(2)}`;
                cloned.area = `${areaSqmt.toFixed(3)} Sqmt`;
                cloned.image = '/window.svg';
                // Replace canvas.config so dimensions are definitely applied (numeric, new object)
                const baseConfig = cloned.canvas?.config ? { ...cloned.canvas.config } : {};
                cloned.canvas = {
                    ...(cloned.canvas || {}),
                    config: {
                        ...baseConfig,
                        width,
                        height,
                        ref: name,
                        name,
                        qty,
                    },
                };
                return cloned;
            });
            const nextDesigns = [...copies, ...existingDesigns];
            await saveDesigns(quoteKey, nextDesigns);
            setSavedDesigns(nextDesigns);
            setActionStatus({ type: 'success', message: `${copies.length} design(s) created` });
            setMultipleCopyModal(null);
        } catch (error) {
            console.error('Multiple copy failed', error);
            setActionStatus({ type: 'error', message: 'Multiple copy failed' });
        }
    }, [multipleCopyModal, multipleCopyDimensions, savedDesigns, quoteKey]);

    const handleReplaceImage = useCallback((design) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const dataUrl = ev.target.result;
                    const nextDesigns = savedDesigns.map((d) =>
                        d.id === design.id ? { ...d, image: dataUrl, savedAt: new Date().toISOString() } : d
                    );
                    await saveDesigns(quoteKey, nextDesigns);
                    setSavedDesigns(nextDesigns);
                    setActionStatus({ type: 'success', message: `Image replaced for "${design.designRef || design.name}"` });
                } catch (error) {
                    console.error('Replace image failed', error);
                    setActionStatus({ type: 'error', message: 'Replace image failed' });
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }, [savedDesigns, quoteKey]);

    const handleDeleteDesign = useCallback(async (design) => {
        if (!window.confirm(`Delete "${design.designRef || design.name}"? This cannot be undone.`)) return;
        try {
            const nextDesigns = savedDesigns.filter((d) => d.id !== design.id);
            await saveDesigns(quoteKey, nextDesigns);
            setSavedDesigns(nextDesigns);
            setSelectedDesignIds((prev) => { const next = new Set(prev); next.delete(design.id); return next; });
            setActionStatus({ type: 'success', message: `"${design.designRef || design.name}" deleted` });
        } catch (error) {
            console.error('Delete failed', error);
            setActionStatus({ type: 'error', message: 'Delete failed' });
        }
    }, [savedDesigns, quoteKey]);

    // Find quote data from Firestore (fallback to default mock)
    const quotesSource = firestoreQuotes.length > 0 ? firestoreQuotes : defaultQuotesList;
    const quote = quotesSource.find(q => q.projectName.toLowerCase() === quoteKey) || quotesSource[0]; // fallback
    const staticCatalogItems = catalogItems.map((item) => ({ ...item, source: 'static' }));
    const allCatalogItems = [...catalogDesigns, ...staticCatalogItems];

    const designSearchLower = designSearch.trim().toLowerCase();
    const filterBySearch = (list, getText) => {
        if (!designSearchLower) return list;
        return list.filter((item) => {
            const text = getText(item);
            return text.toLowerCase().includes(designSearchLower);
        });
    };
    const pricingResult = useMemo(
        () => {
            const result = calculatePricing(savedDesigns, pricingRates);
            result.costRows = result.costRows.map((row) => ({
                ...row,
                visibility: costRowVisibility[row.id] || row.visibility,
            }));
            return result;
        },
        [savedDesigns, pricingRates, costRowVisibility]
    );
    const quotedValue = pricingResult.summary.grandTotal > 0 ? pricingResult.summary.grandTotal : quote.value;

    const pricedDesigns = useMemo(
        () => savedDesigns.map((d) => ({ ...d, price: calculateDesignPrice(d, pricingRates) })),
        [savedDesigns, pricingRates]
    );

    const filteredProjectDesigns = useMemo(
        () => filterBySearch(pricedDesigns, (d) => [d.designRef, d.name, d.series, d.glass, d.location].filter(Boolean).join(' ')),
        [pricedDesigns, designSearchLower]
    );
    const filteredCatalogItems = useMemo(
        () => filterBySearch(allCatalogItems, (d) => [d.name, d.series, d.dims, d.designRef].filter(Boolean).join(' ')),
        [allCatalogItems, designSearchLower]
    );

    const totalProjectRecords = filteredProjectDesigns.length;
    const totalCatalogRecords = filteredCatalogItems.length;
    const totalRecords = activeTab === 'project' ? totalProjectRecords : totalCatalogRecords;
    const totalPages = Math.max(1, Math.ceil(totalRecords / designPageSize));
    const currentPage = Math.min(designPage, totalPages);
    const paginatedProjectDesigns = useMemo(
        () => filteredProjectDesigns.slice((currentPage - 1) * designPageSize, currentPage * designPageSize),
        [filteredProjectDesigns, currentPage, designPageSize]
    );
    const paginatedCatalogItems = useMemo(
        () => filteredCatalogItems.slice((currentPage - 1) * designPageSize, currentPage * designPageSize),
        [filteredCatalogItems, currentPage, designPageSize]
    );

    const opportunityForQuote = useMemo(() => {
        const arr = firestoreOpportunities.length > 0 ? firestoreOpportunities : defaultOpportunities;
        return arr.find((o) => o.id === quote.opportunityId || (o.projectName && o.projectName.toLowerCase() === quoteKey)) || null;
    }, [firestoreOpportunities, quote.opportunityId, quoteKey]);

    const openDesignEditorWithParams = useCallback((paramsObject) => {
        const queryParams = new URLSearchParams(paramsObject);
        router.push(`/quotes/${id}/design?${queryParams.toString()}`);
    }, [id, router]);

    const handleEditProjectDesign = useCallback((design) => {
        if (!design?.id) {
            router.push(`/quotes/${id}/design`);
            return;
        }
        const params = { designId: String(design.id) };
        let w = design.canvas?.config?.width;
        let h = design.canvas?.config?.height;
        if (!(Number(w) > 0 && Number(h) > 0) && design.size) {
            const fromSize = parseSizeMm(design.size);
            if (fromSize) {
                w = fromSize.width;
                h = fromSize.height;
            }
        }
        if (Number(w) > 0 && Number(h) > 0) {
            params.presetW = String(Number(w));
            params.presetH = String(Number(h));
        }
        openDesignEditorWithParams(params);
    }, [id, openDesignEditorWithParams, router]);

    const handleUseCatalogItem = useCallback(async (item) => {
        try {
            const existingDesigns = savedDesigns;
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
            await saveDesigns(quoteKey, nextSavedDesigns);
            setSavedDesigns(nextSavedDesigns);
            setActiveTab('project');
            setActionStatus({ type: 'success', message: `${nextDesign.name} added to project` });
        } catch (error) {
            console.error('Failed to add catalog item to project', error);
            setActionStatus({ type: 'error', message: 'Failed to add catalog design' });
        }
    }, [savedDesigns, quoteKey]);

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

    const handleVisibilityChange = useCallback((rowId, value) => {
        setCostRowVisibility((prev) => ({ ...prev, [rowId]: value }));
    }, []);

    const handleUpdatePricing = useCallback(async () => {
        try {
            await saveQuoteRates(quoteKey, 'pricing', pricingRates);
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

    const handleProfileRatePriceChange = useCallback((itemId, value) => {
        const num = toNonNegativeNumber(value, 0);
        setProfileRateItems((prev) => prev.map((row) => (row.id === itemId ? { ...row, priceLevel: num } : row)));
        setProfileRateStatus(null);
    }, []);

    const handleProfileRateSave = useCallback(async () => {
        try {
            const byItemId = profileRateItems.reduce((acc, row) => {
                acc[row.id] = row.priceLevel;
                return acc;
            }, {});
            await saveQuoteRates(quoteKey, 'profileRates', byItemId);
            setProfileRateStatus({ type: 'success', message: 'Profile rates saved' });
        } catch (error) {
            console.error('Failed to save profile rates', error);
            setProfileRateStatus({ type: 'error', message: 'Save failed' });
        }
    }, [profileRateItems, quoteKey]);

    const handleProfileRateReset = useCallback(async () => {
        setProfileRateItems([...DEFAULT_PROFILE_RATE_ITEMS]);
        try {
            await saveQuoteRates(quoteKey, 'profileRates', {});
        } catch (e) { /* no-op */ }
        setProfileRateStatus({ type: 'success', message: 'Reset to default' });
    }, [quoteKey]);

    const handleProfileRateToggleSelect = useCallback((id) => {
        setProfileRateSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleProfileRateSelectAll = useCallback((ids) => {
        setProfileRateSelectedIds(new Set(ids));
    }, []);

    const handleReinforcementRatePriceChange = useCallback((itemId, value) => {
        const num = toNonNegativeNumber(value, 0);
        setReinforcementRateItems((prev) => prev.map((row) => (row.id === itemId ? { ...row, priceLevel: num } : row)));
        setReinforcementRateStatus(null);
    }, []);

    const handleReinforcementRateSave = useCallback(async () => {
        try {
            const byItemId = reinforcementRateItems.reduce((acc, row) => {
                acc[row.id] = row.priceLevel;
                return acc;
            }, {});
            await saveQuoteRates(quoteKey, 'reinforcementRates', byItemId);
            setReinforcementRateStatus({ type: 'success', message: 'Reinforcement rates saved' });
        } catch (error) {
            console.error('Failed to save reinforcement rates', error);
            setReinforcementRateStatus({ type: 'error', message: 'Save failed' });
        }
    }, [reinforcementRateItems, quoteKey]);

    const handleReinforcementRateReset = useCallback(async () => {
        setReinforcementRateItems([...DEFAULT_REINFORCEMENT_RATE_ITEMS]);
        try {
            await saveQuoteRates(quoteKey, 'reinforcementRates', {});
        } catch (e) { /* no-op */ }
        setReinforcementRateStatus({ type: 'success', message: 'Reset to default' });
    }, [quoteKey]);

    const handleReinforcementRateToggleSelect = useCallback((id) => {
        setReinforcementRateSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleReinforcementRateSelectAll = useCallback((ids) => {
        setReinforcementRateSelectedIds(new Set(ids));
    }, []);

    const handleHardwareRatePriceChange = useCallback((itemId, value) => {
        const num = toNonNegativeNumber(value, 0);
        setHardwareRateItems((prev) => prev.map((row) => (row.id === itemId ? { ...row, priceLevel: num } : row)));
        setHardwareRateStatus(null);
    }, []);

    const handleHardwareRateSave = useCallback(async () => {
        try {
            const byItemId = hardwareRateItems.reduce((acc, row) => {
                acc[row.id] = row.priceLevel;
                return acc;
            }, {});
            await saveQuoteRates(quoteKey, 'hardwareRates', byItemId);
            setHardwareRateStatus({ type: 'success', message: 'Hardware rates saved' });
        } catch (error) {
            console.error('Failed to save hardware rates', error);
            setHardwareRateStatus({ type: 'error', message: 'Save failed' });
        }
    }, [hardwareRateItems, quoteKey]);

    const handleHardwareRateReset = useCallback(async () => {
        setHardwareRateItems([...DEFAULT_HARDWARE_RATE_ITEMS]);
        try {
            await saveQuoteRates(quoteKey, 'hardwareRates', {});
        } catch (e) { /* no-op */ }
        setHardwareRateStatus({ type: 'success', message: 'Reset to default' });
    }, [quoteKey]);

    const handleHardwareRateToggleSelect = useCallback((id) => {
        setHardwareRateSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleHardwareRateSelectAll = useCallback((ids) => {
        setHardwareRateSelectedIds(new Set(ids));
    }, []);

    const handleGlassRatePriceChange = useCallback((itemId, value) => {
        const num = toNonNegativeNumber(value, 0);
        setGlassRateItems((prev) => prev.map((row) => (row.id === itemId ? { ...row, priceLevel: num } : row)));
        setGlassRateStatus(null);
    }, []);

    const handleGlassRateSave = useCallback(async () => {
        try {
            const byItemId = glassRateItems.reduce((acc, row) => {
                acc[row.id] = row.priceLevel;
                return acc;
            }, {});
            await saveQuoteRates(quoteKey, 'glassRates', byItemId);
            setGlassRateStatus({ type: 'success', message: 'Glass rates saved' });
        } catch (error) {
            console.error('Failed to save glass rates', error);
            setGlassRateStatus({ type: 'error', message: 'Save failed' });
        }
    }, [glassRateItems, quoteKey]);

    const handleGlassRateReset = useCallback(async () => {
        setGlassRateItems([...DEFAULT_GLASS_RATE_ITEMS]);
        try {
            await saveQuoteRates(quoteKey, 'glassRates', {});
        } catch (e) { /* no-op */ }
        setGlassRateStatus({ type: 'success', message: 'Reset to default' });
    }, [quoteKey]);

    const handleGlassRateToggleSelect = useCallback((id) => {
        setGlassRateSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleGlassRateSelectAll = useCallback((ids) => {
        setGlassRateSelectedIds(new Set(ids));
    }, []);

    const handleProceedDownloadReport = useCallback(async () => {
        const quoteDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const filename = `${quote?.projectName || 'quotation'}-${quote?.id || 'report'}-Quotation Report ${quoteDate}.pdf`;

        try {
            const { buildQuotationJSON } = await import('../../lib/pdf/buildQuotationJSON');
            const { downloadQuotationPDF } = await import('../../lib/pdf/generateQuotationPDF');
            const data = buildQuotationJSON({
                quote,
                opportunity: opportunityForQuote,
                designs: pricedDesigns,
                pricingResult,
                pricingRates,
                company: COMPANY_REPORT,
                softwareName: 'EvA WinOptimize Software',
            });
            await downloadQuotationPDF(data, filename);
            setDownloadReportModalOpen(false);
        } catch (err) {
            console.error('PDF download failed, falling back to HTML print', err);
            const html = buildQuotationReportHTML({
                quote,
                opportunity: opportunityForQuote,
                designs: pricedDesigns,
                pricingResult,
                pricingRates,
                company: COMPANY_REPORT,
            });
            const w = window.open('', '_blank');
            if (!w) return;
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 400);
            setDownloadReportModalOpen(false);
        }
    }, [quote, opportunityForQuote, pricedDesigns, pricingResult, pricingRates]);

    if (dataLoading) {
        return <LoadingSpinner message="Loading quote data..." />;
    }

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
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{formatInr(quotedValue)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty : {pricingResult.metrics.totalQty || quote.quantity} <span style={{ marginLeft: '4px', cursor: 'pointer' }}>ℹ️</span></div>
                    </div>

                    <button
                        type="button"
                        className="btn-primary"
                        style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
                        onClick={() => setDownloadReportModalOpen(true)}
                    >
                        Quick quote
                    </button>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', alignItems: 'center' }}>
                        <div ref={profileMenuRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileMenuOpen((prev) => !prev)}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            >
                                N
                            </button>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => setProfileMenuOpen((prev) => !prev)}><polyline points="6 9 12 15 18 9"/></svg>
                            {profileMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '44px',
                                    right: 0,
                                    width: '220px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-primary)',
                                    borderRadius: '10px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>New Ideal Upvc</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>info@niupvc.com</div>
                                    </div>
                                    <button
                                        onClick={() => setProfileMenuOpen(false)}
                                        style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => { setProfileMenuOpen(false); router.push('/'); }}
                                        style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderTop: '1px solid var(--border-primary)', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
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
                                    onClick={() => { setActiveTab('project'); setDesignPage(1); }}
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
                                    onClick={() => { setActiveTab('catalog'); setDesignPage(1); }}
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
                                        value={designSearch}
                                        onChange={(e) => { setDesignSearch(e.target.value); setDesignPage(1); }}
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
                )}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-primary)' }}>
                {activeModule === 'design' ? (
                    activeTab === 'project' ? (
                        <div>
                            {/* Bulk Action Bar */}
                            {selectedDesignIds.size > 0 && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 16px',
                                    marginBottom: '16px',
                                    background: 'var(--accent-primary)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '13px' }}>
                                            {selectedDesignIds.size} selected
                                        </span>
                                        <button
                                            onClick={handleSelectAllDesigns}
                                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            Select all ({savedDesigns.length})
                                        </button>
                                        <button
                                            onClick={handleDeselectAll}
                                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            Deselect all
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={handleDuplicateSelectedDesigns}
                                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Delete ${selectedDesignIds.size} selected design(s)? This cannot be undone.`)) {
                                                    handleDeleteSelectedDesigns();
                                                }
                                            }}
                                            style={{ background: '#dc2626', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {paginatedProjectDesigns.map(design => (
                                <DesignCard
                                    key={design.id}
                                    design={design}
                                    onEdit={handleEditProjectDesign}
                                    onViewDetails={setSelectedDesign}
                                    isChecked={selectedDesignIds.has(design.id)}
                                    onToggleSelect={handleToggleSelectDesign}
                                    onDuplicate={handleDuplicateDesign}
                                    onSaveToLibrary={handleSaveToLibrary}
                                    onMultipleCopy={handleMultipleCopyOpen}
                                    onReplaceImage={handleReplaceImage}
                                    onDelete={handleDeleteDesign}
                                />
                            ))}
                            {paginatedProjectDesigns.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                    {savedDesigns.length === 0
                                        ? 'No user-saved designs yet. Create a design or add from catalog.'
                                        : 'No designs match your search.'}
                                </div>
                            )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                            {paginatedCatalogItems.map(item => (
                                <CatalogCard key={item.id} item={item} onUse={handleUseCatalogItem} onEdit={handleEditCatalogItem} />
                            ))}
                            {paginatedCatalogItems.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                    {allCatalogItems.length === 0 ? 'No catalog items.' : 'No catalog items match your search.'}
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', minHeight: '400px' }}>
                        {/* Pricing left sidebar (reference) */}
                        <nav
                            style={{
                                width: '240px',
                                flexShrink: 0,
                                background: '#1e293b',
                                borderRight: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {PRICING_SIDE_NAV.map((item, idx) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setPricingSubSection(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        width: '100%',
                                        padding: '14px 16px',
                                        border: 'none',
                                        borderBottom: idx < PRICING_SIDE_NAV.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                        background: pricingSubSection === item.id ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                                        color: pricingSubSection === item.id ? '#fff' : 'rgba(255,255,255,0.75)',
                                        fontSize: '13px',
                                        fontWeight: pricingSubSection === item.id ? '600' : '400',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s, color 0.15s',
                                    }}
                                >
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: pricingSubSection === item.id ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                                    }}>
                                        {item.icon === 'doc' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>}
                                        {item.icon === 'profile' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16"/><path d="M4 4h16v4H4z"/><path d="M4 12h10"/></svg>}
                                        {item.icon === 'block' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>}
                                        {item.icon === 'hardware' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>}
                                        {item.icon === 'glass' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/></svg>}
                                        {item.icon === 'mesh' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h6v6H3zM15 6h6v6h-6zM3 12h6v6H3zM15 12h6v6h-6z"/></svg>}
                                        {item.icon === 'design' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                        {/* Main pricing content + Price Summary */}
                        <div style={{ flex: 1, display: 'flex', gap: '24px', alignItems: 'stretch', flexWrap: 'nowrap', minWidth: 0, paddingLeft: '24px' }}>
                            {pricingSubSection === 'project-structure' ? (
                                <>
                                    <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-primary)', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Project price structure</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', flexWrap: 'wrap' }}>
                                            <select
                                                value={priceStructureDropdown}
                                                onChange={(e) => setPriceStructureDropdown(e.target.value)}
                                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', minWidth: '180px' }}
                                            >
                                                <option value="Price Structure NCL">Price Structure NCL</option>
                                                <option value="Price Structure Vitco">Price Structure Vitco</option>
                                            </select>
                                            <div style={{ flex: 1 }} />
                                            <button type="button" onClick={handleUpdatePricing} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 3v9h-9"/></svg>
                                                Update pricing
                                            </button>
                                        </div>
                                        {pricingStatus && (
                                            <div style={{ padding: '8px 20px', fontSize: '13px', color: pricingStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                                                {pricingStatus.message}
                                            </div>
                                        )}
                                        <div style={{ flex: 1, overflow: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                        <th style={{ width: '32px', padding: '10px 6px' }} />
                                                        <th style={{ width: '40px', padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>#</th>
                                                        <th style={{ width: '28px', padding: '10px 4px' }} />
                                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Cost Heads</th>
                                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Calculation Type</th>
                                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Rate</th>
                                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '180px' }}>Visibility</th>
                                                        <th style={{ width: '40px', padding: '10px 8px', textAlign: 'center' }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M12 3v18M3 12l3 3 3-3M18 12l3-3-3-3"/></svg>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pricingResult.costRows.map((row, index) => (
                                                        <PricingCostRow
                                                            key={row.id}
                                                            index={index}
                                                            row={row}
                                                            onRateChange={handlePricingRateChange}
                                                            onVisibilityChange={handleVisibilityChange}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            flex: '0 0 320px',
                                            width: '320px',
                                            position: 'sticky',
                                            top: '24px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-primary)',
                                            padding: '28px 24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '18px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                            alignSelf: 'flex-start',
                                        }}
                                    >
                                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '0.02em' }}>Price Summary</div>
                                        <SummaryRow label="Basic Value" value={pricingResult.summary.basicValue} />
                                        <SummaryRow label="Discount" value={pricingResult.summary.discount} />
                                        <div style={{ height: '1px', background: 'var(--border-primary)' }} />
                                        <SummaryRow label="Sub Total" value={pricingResult.summary.subTotal} />
                                        <SummaryRow label="Transportation Cost" value={pricingResult.summary.transportationCost} />
                                        <SummaryRow label="Loading And Unloading" value={pricingResult.summary.loadingAndUnloadingCost} />
                                        <div style={{ height: '1px', background: 'var(--border-primary)' }} />
                                        <SummaryRow label="Total Project Cost" value={pricingResult.summary.totalProjectCost} />
                                        <SummaryRow label="GST" value={pricingResult.summary.gst} />
                                        <div style={{ height: '1px', background: 'var(--border-primary)' }} />
                                        <SummaryRow label="Grand Total" value={pricingResult.summary.grandTotal} strong />
                                    </div>
                                </>
                            ) : pricingSubSection === 'profile-rate' ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Profile rate</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', flexWrap: 'wrap' }}>
                                        <select
                                            value={profileRateDropdown}
                                            onChange={(e) => setProfileRateDropdown(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', minWidth: '180px' }}
                                        >
                                            <option value="Default Profile Rate">Default Profile Rate</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={profileRateSearch}
                                            onChange={(e) => setProfileRateSearch(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', width: '200px' }}
                                        />
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 3v9h-9"/></svg>
                                            Update pricing
                                        </button>
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            Filter
                                        </button>
                                    </div>
                                    {profileRateStatus && (
                                        <div style={{ padding: '8px 20px', fontSize: '13px', color: profileRateStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                                            {profileRateStatus.message}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'auto', minHeight: '200px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                    <th style={{ width: '44px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={profileRateItems.length > 0 && profileRateSelectedIds.size === profileRateItems.filter((r) => !profileRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(profileRateSearch.toLowerCase()))).length}
                                                            onChange={(e) => {
                                                                const filtered = profileRateItems.filter((r) => !profileRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(profileRateSearch.toLowerCase())));
                                                                if (e.target.checked) handleProfileRateSelectAll(filtered.map((r) => r.id));
                                                                else setProfileRateSelectedIds(new Set());
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>RM Code</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Item Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Unit</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Price Level</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profileRateItems
                                                    .filter((r) => !profileRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(profileRateSearch.toLowerCase())))
                                                    .map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={profileRateSelectedIds.has(row.id)}
                                                                    onChange={() => handleProfileRateToggleSelect(row.id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.rmCode}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.itemName}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.unit}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ marginRight: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>₹</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={1}
                                                                    value={row.priceLevel}
                                                                    onChange={(e) => handleProfileRatePriceChange(row.id, e.target.value)}
                                                                    style={{ width: '100%', maxWidth: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', display: 'inline-block' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-primary)' }}>
                                        <button type="button" onClick={handleProfileRateReset} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
                                            Reset
                                        </button>
                                        <button type="button" onClick={handleProfileRateSave} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : pricingSubSection === 'reinforcement-rate' ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Reinforcement rate</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', flexWrap: 'wrap' }}>
                                        <select
                                            value={reinforcementRateDropdown}
                                            onChange={(e) => setReinforcementRateDropdown(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', minWidth: '180px' }}
                                        >
                                            <option value="Default RI Rate">Default RI Rate</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={reinforcementRateSearch}
                                            onChange={(e) => setReinforcementRateSearch(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', width: '200px' }}
                                        />
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 3v9h-9"/></svg>
                                            Update pricing
                                        </button>
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            Filter
                                        </button>
                                    </div>
                                    {reinforcementRateStatus && (
                                        <div style={{ padding: '8px 20px', fontSize: '13px', color: reinforcementRateStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                                            {reinforcementRateStatus.message}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'auto', minHeight: '200px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                    <th style={{ width: '44px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={reinforcementRateItems.length > 0 && reinforcementRateSelectedIds.size === reinforcementRateItems.filter((r) => !reinforcementRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(reinforcementRateSearch.toLowerCase()))).length}
                                                            onChange={(e) => {
                                                                const filtered = reinforcementRateItems.filter((r) => !reinforcementRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(reinforcementRateSearch.toLowerCase())));
                                                                if (e.target.checked) handleReinforcementRateSelectAll(filtered.map((r) => r.id));
                                                                else setReinforcementRateSelectedIds(new Set());
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>RM Code</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Item Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Unit</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Price Level</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reinforcementRateItems
                                                    .filter((r) => !reinforcementRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(reinforcementRateSearch.toLowerCase())))
                                                    .map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={reinforcementRateSelectedIds.has(row.id)}
                                                                    onChange={() => handleReinforcementRateToggleSelect(row.id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.rmCode}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.itemName}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.unit}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ marginRight: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>₹</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={1}
                                                                    value={row.priceLevel}
                                                                    onChange={(e) => handleReinforcementRatePriceChange(row.id, e.target.value)}
                                                                    style={{ width: '100%', maxWidth: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', display: 'inline-block' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-primary)' }}>
                                        <button type="button" onClick={handleReinforcementRateReset} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
                                            Reset
                                        </button>
                                        <button type="button" onClick={handleReinforcementRateSave} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : pricingSubSection === 'hardware-rate' ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Hardware rate</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', flexWrap: 'wrap' }}>
                                        <select
                                            value={hardwareRateDropdown}
                                            onChange={(e) => setHardwareRateDropdown(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', minWidth: '180px' }}
                                        >
                                            <option value="Default HW Rate">Default HW Rate</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={hardwareRateSearch}
                                            onChange={(e) => setHardwareRateSearch(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', width: '200px' }}
                                        />
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 3v9h-9"/></svg>
                                            Update pricing
                                        </button>
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            Filter
                                        </button>
                                    </div>
                                    {hardwareRateStatus && (
                                        <div style={{ padding: '8px 20px', fontSize: '13px', color: hardwareRateStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                                            {hardwareRateStatus.message}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'auto', minHeight: '200px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                    <th style={{ width: '44px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={hardwareRateItems.length > 0 && hardwareRateSelectedIds.size === hardwareRateItems.filter((r) => !hardwareRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(hardwareRateSearch.toLowerCase()))).length}
                                                            onChange={(e) => {
                                                                const filtered = hardwareRateItems.filter((r) => !hardwareRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(hardwareRateSearch.toLowerCase())));
                                                                if (e.target.checked) handleHardwareRateSelectAll(filtered.map((r) => r.id));
                                                                else setHardwareRateSelectedIds(new Set());
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>RM Code</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Item Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Unit</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Price Level</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {hardwareRateItems
                                                    .filter((r) => !hardwareRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(hardwareRateSearch.toLowerCase())))
                                                    .map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hardwareRateSelectedIds.has(row.id)}
                                                                    onChange={() => handleHardwareRateToggleSelect(row.id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.rmCode}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.itemName}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.unit}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ marginRight: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>₹</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.01}
                                                                    value={row.priceLevel}
                                                                    onChange={(e) => handleHardwareRatePriceChange(row.id, e.target.value)}
                                                                    style={{ width: '100%', maxWidth: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', display: 'inline-block' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-primary)' }}>
                                        <button type="button" onClick={handleHardwareRateReset} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
                                            Reset
                                        </button>
                                        <button type="button" onClick={handleHardwareRateSave} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : pricingSubSection === 'glass-rate' ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Glass rate</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1 }} />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={glassRateSearch}
                                            onChange={(e) => setGlassRateSearch(e.target.value)}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', width: '200px' }}
                                        />
                                        <button type="button" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            Filter
                                        </button>
                                    </div>
                                    {glassRateStatus && (
                                        <div style={{ padding: '8px 20px', fontSize: '13px', color: glassRateStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
                                            {glassRateStatus.message}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, overflow: 'auto', minHeight: '200px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                                                    <th style={{ width: '44px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={glassRateItems.length > 0 && glassRateSelectedIds.size === glassRateItems.filter((r) => !glassRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(glassRateSearch.toLowerCase()))).length}
                                                            onChange={(e) => {
                                                                const filtered = glassRateItems.filter((r) => !glassRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(glassRateSearch.toLowerCase())));
                                                                if (e.target.checked) handleGlassRateSelectAll(filtered.map((r) => r.id));
                                                                else setGlassRateSelectedIds(new Set());
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>RM Code</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Item Name</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Unit</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Price Level</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {glassRateItems
                                                    .filter((r) => !glassRateSearch || [r.rmCode, r.itemName].some((s) => String(s).toLowerCase().includes(glassRateSearch.toLowerCase())))
                                                    .map((row) => (
                                                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={glassRateSelectedIds.has(row.id)}
                                                                    onChange={() => handleGlassRateToggleSelect(row.id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.rmCode}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.itemName}</td>
                                                            <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>{row.unit}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ marginRight: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>₹</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.1}
                                                                    value={row.priceLevel}
                                                                    onChange={(e) => handleGlassRatePriceChange(row.id, e.target.value)}
                                                                    style={{ width: '100%', maxWidth: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', display: 'inline-block' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-primary)' }}>
                                        <button type="button" onClick={handleGlassRateReset} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
                                            Reset
                                        </button>
                                        <button type="button" onClick={handleGlassRateSave} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    {PRICING_SIDE_NAV.find((i) => i.id === pricingSubSection)?.label} — Coming soon
                                </div>
                            )}
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
                        ? `Total records ${totalRecords}`
                        : `Cost heads ${pricingResult.costRows.length}`}
                </div>
                {activeModule === 'design' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <select
                                value={designPageSize}
                                onChange={(e) => { setDesignPageSize(Number(e.target.value)); setDesignPage(1); }}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '12px' }}
                            >
                                {[10, 25, 50].map((n) => (
                                    <option key={n} value={n}>{n} records per page</option>
                                ))}
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => setDesignPage((p) => Math.max(1, p - 1))}
                                style={{ padding: '4px 10px', border: '1px solid var(--border-primary)', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.5 : 1 }}
                            >
                                ‹
                            </button>
                            <span style={{ minWidth: '48px', textAlign: 'center', color: 'var(--text-primary)' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => setDesignPage((p) => Math.min(totalPages, p + 1))}
                                style={{ padding: '4px 10px', border: '1px solid var(--border-primary)', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.5 : 1 }}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
                {activeModule !== 'design' && <div />}
            </div>

            {selectedDesign && (
                <DetailsDrawer design={selectedDesign} onClose={() => setSelectedDesign(null)} />
            )}

            {/* Duplicate Modal */}
            {duplicateModal && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
                        onClick={() => setDuplicateModal(null)}
                    />
                    <div
                        style={{
                            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                            background: 'var(--bg-secondary)', borderRadius: '12px', padding: '28px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1001, width: '420px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Duplicate</h3>
                            <button onClick={() => setDuplicateModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Design ref. <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={duplicateForm.ref}
                                    onChange={(e) => setDuplicateForm((f) => ({ ...f, ref: e.target.value }))}
                                    placeholder="Enter design reference"
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                                        border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Design name</label>
                                <input
                                    type="text"
                                    value={duplicateForm.name}
                                    onChange={(e) => setDuplicateForm((f) => ({ ...f, name: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                                        border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Design Quantity <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={duplicateForm.qty}
                                    onChange={(e) => setDuplicateForm((f) => ({ ...f, qty: Math.max(1, Number(e.target.value) || 1) }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleDuplicateConfirm(); }}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                                        border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button
                                onClick={() => setDuplicateModal(null)}
                                style={{
                                    padding: '8px 20px', fontSize: '13px', background: 'transparent',
                                    border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleDuplicateConfirm}
                                style={{ padding: '8px 24px', fontSize: '13px' }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Multiple Copy Modal */}
            {multipleCopyModal && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
                        onClick={() => setMultipleCopyModal(null)}
                    />
                    <div
                        style={{
                            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                            background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1001, minWidth: '560px', maxWidth: '90vw', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Multiple Copy</h3>
                            <button onClick={() => setMultipleCopyModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Create copies of &quot;{multipleCopyModal.designRef || multipleCopyModal.name}&quot; with different dimensions. One design per row.
                        </p>
                        <div style={{ flex: '1 1 auto', overflow: 'auto', marginBottom: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 80px auto', gap: '10px 12px', alignItems: 'center', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Width (mm)</span>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Height (mm)</span>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Design name <span style={{ color: '#ef4444' }}>*</span></span>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Qty <span style={{ color: '#ef4444' }}>*</span></span>
                                <span style={{ width: '36px' }} />
                                {multipleCopyDimensions.map((row, idx) => (
                                    <div key={idx} style={{ display: 'contents' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Width"
                                            value={row.width === 0 ? '' : row.width}
                                            onChange={(e) => {
                                                const v = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                                setMultipleCopyDimensions((prev) => prev.map((r, i) => i === idx ? { ...r, width: v } : r));
                                            }}
                                            style={{
                                                padding: '8px 10px', borderRadius: '8px',
                                                border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)', fontSize: '14px',
                                            }}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Height"
                                            value={row.height === 0 ? '' : row.height}
                                            onChange={(e) => {
                                                const v = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                                setMultipleCopyDimensions((prev) => prev.map((r, i) => i === idx ? { ...r, height: v } : r));
                                            }}
                                            style={{
                                                padding: '8px 10px', borderRadius: '8px',
                                                border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)', fontSize: '14px',
                                            }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Design name"
                                            value={row.name ?? ''}
                                            onChange={(e) => setMultipleCopyDimensions((prev) => prev.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))}
                                            style={{
                                                padding: '8px 10px', borderRadius: '8px',
                                                border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)', fontSize: '14px',
                                            }}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            value={row.qty === 0 ? '' : row.qty}
                                            onChange={(e) => {
                                                const v = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                                setMultipleCopyDimensions((prev) => prev.map((r, i) => i === idx ? { ...r, qty: v } : r));
                                            }}
                                            style={{
                                                padding: '8px 10px', borderRadius: '8px',
                                                border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)', fontSize: '14px',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMultipleCopyDimensions((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)}
                                            style={{
                                                width: '36px', height: '36px', padding: 0, border: 'none', background: 'var(--bg-tertiary)',
                                                color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', fontSize: '18px', lineHeight: 1,
                                            }}
                                            title="Remove row"
                                            disabled={multipleCopyDimensions.length <= 1}
                                        >
                                            −
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const baseName = multipleCopyModal?.designRef || multipleCopyModal?.name || 'Design';
                                    setMultipleCopyDimensions((prev) => [
                                        ...prev,
                                        { width: 1500, height: 1500, name: `${baseName} (${prev.length + 1})`, qty: 1 },
                                    ]);
                                }}
                                style={{
                                    marginTop: '12px', padding: '8px 14px', fontSize: '13px',
                                    background: 'var(--bg-tertiary)', border: '1px dashed var(--border-primary)',
                                    color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', width: '100%',
                                }}
                            >
                                + Add row
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setMultipleCopyModal(null)}
                                style={{ padding: '8px 20px', fontSize: '13px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleMultipleCopyConfirm}
                                style={{ padding: '8px 20px', fontSize: '13px' }}
                            >
                                Create {multipleCopyDimensions.filter((r) => Number(r.width) > 0 && Number(r.height) > 0 && String(r.name ?? '').trim() !== '' && Math.max(1, Number(r.qty) || 1) >= 1).length} design(s)
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Download report modal (Quick quote) */}
            {downloadReportModalOpen && (() => {
                const zeroPriceItems = [];
                profileRateItems.forEach((item) => {
                    if (item.priceLevel === 0) zeroPriceItems.push({ category: 'Profile', rmCode: item.rmCode, itemName: item.itemName, priceLevel: item.priceLevel });
                });
                reinforcementRateItems.forEach((item) => {
                    if (item.priceLevel === 0) zeroPriceItems.push({ category: 'Reinforcement', rmCode: item.rmCode, itemName: item.itemName, priceLevel: item.priceLevel });
                });
                hardwareRateItems.forEach((item) => {
                    if (item.priceLevel === 0) zeroPriceItems.push({ category: 'Hardware', rmCode: item.rmCode, itemName: item.itemName, priceLevel: item.priceLevel });
                });
                glassRateItems.forEach((item) => {
                    if (item.priceLevel === 0) zeroPriceItems.push({ category: 'Glass', rmCode: item.rmCode, itemName: item.itemName, priceLevel: item.priceLevel });
                });
                const grouped = zeroPriceItems.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                }, {});
                const hasZeroPrices = zeroPriceItems.length > 0;

                return (
                    <>
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 1000,
                            }}
                            onClick={() => setDownloadReportModalOpen(false)}
                        />
                        <div
                            style={{
                                position: 'fixed',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: '#1e293b',
                                borderRadius: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                minWidth: '520px',
                                maxWidth: '90vw',
                                maxHeight: '80vh',
                                zIndex: 1001,
                                color: '#f1f5f9',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Download report</h2>
                                <button
                                    type="button"
                                    onClick={() => setDownloadReportModalOpen(false)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}
                                >
                                    ×
                                </button>
                            </div>
                            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: hasZeroPrices ? '20px' : '0' }}>
                                    <span style={{ color: '#f59e0b', flexShrink: 0, fontSize: '24px' }} aria-hidden>⚠</span>
                                    <div>
                                        <p style={{ margin: '0 0 6px', fontWeight: '600', fontSize: '16px' }}>Are you sure?</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                            {hasZeroPrices
                                                ? 'You are about to leave this prices without adding. You will not see below prices in your reports.'
                                                : 'A print-ready PDF will be downloaded. If PDF generation is unavailable, the report will open in a new window for printing.'}
                                        </p>
                                    </div>
                                </div>
                                {hasZeroPrices && Object.entries(grouped).map(([category, items]) => (
                                    <div key={category} style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>{category}</div>
                                        {items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '10px 16px',
                                                    background: 'transparent',
                                                    border: '1px solid #f59e0b',
                                                    borderRadius: '8px',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '40px', fontSize: '13px' }}>
                                                    <span style={{ color: '#e2e8f0', minWidth: '120px' }}>{item.rmCode}</span>
                                                    <span style={{ color: '#cbd5e1' }}>{item.itemName}</span>
                                                </div>
                                                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{formatInr(item.priceLevel)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderTop: '1px solid #334155', flexShrink: 0 }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setDownloadReportModalOpen(false)}
                                    style={{ color: '#e2e8f0', borderColor: '#475569' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ background: '#2563eb', borderColor: '#2563eb' }}
                                    onClick={handleProceedDownloadReport}
                                >
                                    Proceed & download
                                </button>
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
