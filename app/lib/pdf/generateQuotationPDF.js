'use client';

import { pdf } from '@react-pdf/renderer';
import QuotationDocument from '../../components/pdf/QuotationDocument';

/**
 * Convert a relative image URL (e.g. /logo.png) to a base64 data URI.
 * Returns the original URL if it's already absolute or data URI.
 */
async function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generate a print-ready quotation PDF from structured JSON.
 * Returns a Blob (for download or upload).
 *
 * @param {Object} data - Quotation JSON (see quotationSchema.js)
 * @returns {Promise<Blob>}
 */
export async function generateQuotationPDF(data) {
  // Resolve relative logo URL to base64 for react-pdf compatibility
  const resolvedData = { ...data };
  if (resolvedData.company?.logoUrl) {
    const resolvedLogo = await resolveImageUrl(resolvedData.company.logoUrl);
    resolvedData.company = { ...resolvedData.company, logoUrl: resolvedLogo };
  }

  const blob = await pdf(<QuotationDocument data={resolvedData} />).toBlob();
  return blob;
}

/**
 * Trigger download of the quotation PDF with a suggested filename.
 *
 * @param {Object} data - Quotation JSON
 * @param {string} [filename] - e.g. 'euro-NEW-QT-00000994-Quotation Report 21 Feb 2026.pdf'
 */
export async function downloadQuotationPDF(data, filename) {
  const blob = await generateQuotationPDF(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `quotation-${data?.quote?.projectName || 'report'}-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
