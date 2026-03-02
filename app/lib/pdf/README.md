# Quotation PDF Layout Engine

Print-ready, multi-page A4 commercial quotation PDF generated from **structured JSON**. Layout matches an ERP-style quotation: header/footer on every page, letter, commercial table with design thumbnails, summary block, terms and bank details, signature areas.

## Usage

```js
import { buildQuotationJSON } from '@/app/lib/pdf/buildQuotationJSON';
import { generateQuotationPDF, downloadQuotationPDF } from '@/app/lib/pdf/generateQuotationPDF';

const data = buildQuotationJSON({
  quote,
  opportunity,
  designs: savedDesigns,
  pricingResult,
  pricingRates,
  company: COMPANY_REPORT,
  softwareName: 'euro_web',
});

const blob = await generateQuotationPDF(data);
// or trigger download:
await downloadQuotationPDF(data, 'euro-NEW-QT-00000994-Quotation Report 21 Feb 2026.pdf');
```

## JSON input shape

Fully data-driven. See `quotationSchema.js` for defaults.

- **company**: name, address, contactNo, email, logoUrl (optional)
- **quote**: id, projectName, date
- **client**: name, address
- **letter**: introParagraphs (array of strings), signatoryText
- **designs**: array of rows, each with `slNo`, `designImageDataUrl` (data URL or null), `specifications` (code, dimension, location, area, weight, profileBrand, system, type, glazing, profileColor, meshType, outerFrameDetails), `qty`, `rate`, `amount`
- **summary**: totalAreaSqft, totalWindows, avgPricePerSqft, avgPricePerSqftExGst, basicValue, subTotal, transportationCost, loadingAndUnloading, totalProjectCost, gstPct, gst, grandTotal, quoteTotal (optional)
- **terms**: sections (title + items), bankDetails (key-value), signatureLabels (client, company)
- **softwareName**: for footer “Powered by …”

## Layout

- **Page 1**: Introductory letter, client block, authorized signatory.
- **Page 2 (and more if needed)**: Table columns — SI NO. | DESIGN | SPECIFICATIONS | QTY | RATE | AMOUNT. Design column shows thumbnail (blue tint) and dimensions. Specifications support multi-line key-value. Summary block (right-aligned) on the last table page.
- **Last page**: Terms & Conditions, payment/measurement/transport clauses, bank details table, client and company signature areas.
- **All pages**: Header (logo left, company + quote/project/date right), footer (page X of N, Powered by &lt;softwareName&gt;).

A4, print-safe margins, auto page-break when table rows exceed ~8 per page.
