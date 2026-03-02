'use client';

import { designRow, formatINR } from './quotationSchema';

function parseAreaSqmt(areaText) {
  const match = String(areaText ?? '').match(/[\d.]+/);
  if (!match) return 0;
  return Number(match[0]) || 0;
}

function parseSizeMm(sizeText) {
  const w = String(sizeText ?? '').match(/W\s*=\s*([\d.]+)/i);
  const h = String(sizeText ?? '').match(/H\s*=\s*([\d.]+)/i);
  if (!w || !h) return null;
  const width = Number(w[1]);
  const height = Number(h[1]);
  return Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null;
}

/**
 * Build quotation JSON for the PDF from quote page data.
 *
 * @param {Object} params
 * @param {Object} params.quote - { id, projectName, contact, ... }
 * @param {Object} [params.opportunity] - { contact, address, pin, ... }
 * @param {Array} params.designs - savedDesigns array
 * @param {Object} params.pricingResult - { summary, metrics }
 * @param {Object} params.pricingRates - { gstPct, ... }
 * @param {Object} params.company - { name, address, contactNo, email, logoUrl? }
 * @param {string} [params.softwareName]
 */
export function buildQuotationJSON({
  quote,
  opportunity,
  designs,
  pricingResult,
  pricingRates,
  company,
  softwareName = 'EvA WinOptimize Software',
}) {
  const summary = pricingResult?.summary || {};
  const metrics = pricingResult?.metrics || {};
  const totalAreaSqmt = metrics.totalAreaSqmt ?? 0;
  const totalAreaSqft = (totalAreaSqmt * 10.764).toFixed(2);
  const totalWindows = metrics.totalQty ?? 0;
  const grandTotal = summary.grandTotal ?? 0;
  const totalProjectCost = summary.totalProjectCost ?? 0;
  const avgPricePerSqft = totalAreaSqft > 0 ? (grandTotal / parseFloat(totalAreaSqft)).toFixed(2) : '0';
  const avgPricePerSqftExGst = totalAreaSqft > 0 ? (totalProjectCost / parseFloat(totalAreaSqft)).toFixed(2) : '0';

  const quoteDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

  const pdfDesigns = (designs || []).map((d, i) => {
    const areaSqmt = parseAreaSqmt(d.area) || (parseSizeMm(d.size) ? (parseSizeMm(d.size).width * parseSizeMm(d.size).height) / 1e6 : 0);
    const areaSqft = (areaSqmt * 10.764).toFixed(2);
    const qty = Math.max(1, Number(d.qty) || 1);
    const price = Number(d.price) || 0;
    const unitRate = (price / qty).toFixed(2);
    const ratePerSqft = areaSqft > 0 ? (Number(unitRate) / parseFloat(areaSqft)).toFixed(2) : null;

    // Build additional details array from saved design data
    const additionalDetails = [];
    if (d.handleColor && d.handleColor !== '--') {
      additionalDetails.push(`Handle color :  ${d.handleColor}`);
    }
    // Parse outerFrameDetails if it contains multiple lines
    if (d.outerFrameDetails) {
      String(d.outerFrameDetails).split('\n').forEach((line) => {
        if (line.trim()) additionalDetails.push(line.trim());
      });
    }
    // Additional hardware/profile details stored in the design
    if (d.additionalSpecs && Array.isArray(d.additionalSpecs)) {
      d.additionalSpecs.forEach((spec) => {
        if (spec && String(spec).trim()) additionalDetails.push(String(spec).trim());
      });
    }

    return designRow({
      slNo: i + 1,
      designImageDataUrl: d.image && (d.image.startsWith('data:') || d.image.startsWith('http')) ? d.image : null,
      specifications: {
        code: d.designRef || '—',
        dimension: d.size ? `W = ${parseSizeMm(d.size)?.width?.toFixed(2) || '0'}; H = ${parseSizeMm(d.size)?.height?.toFixed(2) || '0'}` : '—',
        location: d.location || '',
        area: `${areaSqft} Sqft.`,
        weight: d.weight && d.weight !== '--' ? `${d.weight} Kg` : '0 Kg',
        profileBrand: d.profileBrand || '',
        system: d.series || '',
        type: d.name || d.designRef || '—',
        glazing: d.glass || 'None',
        profileColor: d.color || '',
        meshType: d.meshType || 'No',
        handleColor: d.handleColor && d.handleColor !== '--' ? d.handleColor : null,
        additionalDetails,
        outerFrameDetails: '',
      },
      qty: String(qty),
      rate: formatINR(unitRate),
      ratePerSqft: ratePerSqft ? formatINR(ratePerSqft) : null,
      amount: formatINR(price),
    });
  });

  return {
    company: {
      name: company?.name ?? '',
      address: company?.address ?? '',
      contactNo: company?.contactNo ?? '',
      email: company?.email ?? '',
      logoUrl: company?.logoUrl ?? null,
    },
    quote: {
      id: quote?.id ?? '',
      projectName: quote?.projectName ?? '',
      date: quoteDate,
    },
    client: {
      name: opportunity?.contact || quote?.contact || 'Customer',
      address: opportunity?.address || quote?.address || '',
      pin: opportunity?.pin || quote?.pin || '',
    },
    letter: {
      introParagraphs: [
        'We are delighted that you are considering our range of Windows and Doors for your premises.',
        'It has gained rapid acceptance across all cities of India for the overwhelming advantages of better protection from noise, heat, rain, dust and pollution.',
        'In drawing this proposal, it has been our endeavor to suggest designs which would enhance your comfort and aesthetics from inside and improve the facade of the building.',
        'It has a well established service network to deliver seamless service at your doorstep. Our offer comprises of the following in enclosure for your kind perusal:',
      ],
      listItems: [
        'a. Window design, specification and value',
        'b. Terms and Conditions',
      ],
      closingText: 'We now look forward to be of service to you.',
      signatoryText: 'Authorized Signatory',
    },
    designs: pdfDesigns,
    summary: {
      totalAreaSqft,
      totalWindows,
      avgPricePerSqft,
      avgPricePerSqftExGst,
      basicValue: summary.basicValue ?? 0,
      subTotal: summary.subTotal ?? 0,
      transportationCost: summary.transportationCost ?? 0,
      loadingAndUnloading: summary.loadingAndUnloadingCost ?? 0,
      totalProjectCost: summary.totalProjectCost ?? 0,
      gstPct: pricingRates?.gstPct ?? 18,
      gst: summary.gst ?? 0,
      grandTotal: summary.grandTotal ?? 0,
      quoteTotal: summary.quoteTotal ?? null,
    },
    terms: {
      sections: [
        {
          title: '1. 10 Year Warrenty for Upvc Profile and TPE Gasckets.',
          items: [],
        },
        {
          title: '2. Note :',
          items: [
            'a. Quotation will be valid for a period of 30 days.',
            'b. If there is a taper in the wall which will cause a gap of more than 7mm then the same will have to befilled by the client, we will not fill extra Cylicon.',
            'c. Scaffolding should be provided by the client (if windows are to be fixed externally above ground floor)',
            'd. The validity of offer is 15 days from the date of this letter.',
            'e. Delivery date will be given on receipt of P.O and Payment. (20 to 30 Days from Receipt of Payment)',
          ],
        },
        {
          title: '3. Payment Terms :',
          items: [
            'a. 75 % Payment to be given along with the P.O',
            'b. 25 % Payment to be given on Material Delivery at site.',
          ],
        },
        {
          title: null,
          items: [
            '4. Joint Measurement of Window sizes to be taken along with the Site, Engineer/Client for all Windows.',
            '5. No replacement will be given if sizes given are not actual sizes on site post joint measurement.',
            '6. Transportation charges will be extra if the site is above 15kms from Mangalore.',
          ],
        },
      ],
      bankDetails: {
        'Account Name': 'NEW IDEAL UPVC',
        'Accont Number': '50200054500800',
        'Bank Name': 'HDFC BANK',
        'IFSC': 'HDFC0005355',
        'Branch': 'HDFC BANK',
      },
      acceptanceText: 'I hereby accept the estimate as per above mentioned price and specifications. I have read and understood the terms & conditions and agree to them.',
      signatureLabels: {
        client: 'Signature of Customer',
        company: 'Authorized Signatory',
      },
    },
    softwareName,
  };
}
