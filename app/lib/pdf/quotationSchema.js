/**
 * JSON schema and defaults for the Commercial Quotation PDF.
 * All layout is data-driven from this structure.
 */

export const DEFAULT_QUOTATION_JSON = {
  company: {
    name: '',
    address: '',
    contactNo: '',
    email: '',
    logoUrl: null,
  },
  quote: {
    id: '',
    projectName: '',
    date: '',
  },
  client: {
    name: '',
    address: '',
    pin: '',
  },
  letter: {
    introParagraphs: [],
    listItems: [],
    closingText: 'We now look forward to be of service to you.',
    signatoryText: 'Authorized Signatory',
  },
  designs: [],
  summary: {
    totalAreaSqft: '0',
    totalWindows: 0,
    avgPricePerSqft: '0',
    avgPricePerSqftExGst: '0',
    basicValue: 0,
    subTotal: 0,
    transportationCost: 0,
    loadingAndUnloading: 0,
    totalProjectCost: 0,
    gstPct: 18,
    gst: 0,
    grandTotal: 0,
    quoteTotal: null,
  },
  terms: {
    sections: [],
    bankDetails: {},
    acceptanceText: '',
    signatureLabels: {
      client: 'Signature of Customer',
      company: 'Authorized Signatory',
    },
  },
  softwareName: 'EvA WinOptimize Software',
};

/**
 * Design row shape for the commercial table.
 * specifications can be key-value pairs (multi-line).
 */
export function designRow({
  slNo,
  designImageDataUrl = null,
  specifications = {},
  qty = 1,
  rate = '0',
  ratePerSqft = null,
  amount = '0',
}) {
  return {
    slNo,
    designImageDataUrl: designImageDataUrl || null,
    specifications: {
      code: '',
      dimension: '',
      location: '',
      area: '',
      weight: '',
      profileBrand: '',
      system: '',
      type: '',
      glazing: '',
      profileColor: '',
      meshType: 'No',
      handleColor: null,
      additionalDetails: [],
      outerFrameDetails: '',
      ...specifications,
    },
    qty,
    rate,
    ratePerSqft,
    amount,
  };
}

/**
 * Format number as INR for display in PDF.
 */
export function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
