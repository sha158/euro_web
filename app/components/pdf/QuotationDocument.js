'use client';

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// A4 dimensions (pt)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 36;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 32;
const BODY_TOP = MARGIN + HEADER_HEIGHT + 8;

const styles = StyleSheet.create({
  page: {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // --- Header ---
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: MARGIN,
    paddingTop: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 130,
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
    maxWidth: 280,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    marginBottom: 2,
  },
  companyDetails: {
    fontSize: 9,
    color: '#000',
    lineHeight: 1.4,
    textAlign: 'right',
  },
  // --- Quote meta line ---
  quoteMetaLine: {
    paddingHorizontal: MARGIN,
    paddingTop: 6,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  quoteMetaText: {
    fontSize: 9,
    color: '#000',
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MARGIN,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  footerLogo: {
    width: 32,
    height: 16,
    objectFit: 'contain',
  },
  footerPage: {
    fontSize: 9,
    color: '#000',
  },
  footerPowered: {
    fontSize: 8,
    color: '#000',
    fontFamily: 'Helvetica-Bold',
  },
  // --- Body ---
  body: {
    paddingHorizontal: MARGIN,
    paddingTop: BODY_TOP,
    paddingBottom: FOOTER_HEIGHT + MARGIN,
  },
  // --- Cover Letter ---
  letterTo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    marginBottom: 2,
  },
  letterClientName: {
    fontSize: 10,
    color: '#000',
    marginBottom: 1,
  },
  letterPara: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#000',
    marginBottom: 10,
  },
  letterListItem: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#000',
    marginBottom: 2,
    paddingLeft: 30,
  },
  signatoryBlock: {
    marginTop: 20,
  },
  signatoryText: {
    fontSize: 10,
    color: '#000',
    marginBottom: 4,
  },
  signatoryLabel: {
    fontSize: 10,
    color: '#000',
    marginTop: 40,
  },
  // --- Design Table ---
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
    minHeight: 22,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minHeight: 24,
    alignItems: 'stretch',
  },
  tableHeaderCell: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    textAlign: 'center',
  },
  tableCellSl: {
    width: 26,
    paddingVertical: 4,
    paddingLeft: 4,
    fontSize: 9,
    color: '#000',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  tableCellDesign: {
    width: 155,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  tableCellSpec: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    lineHeight: 1.4,
    color: '#000',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  tableCellQty: {
    width: 32,
    padding: 4,
    fontSize: 9,
    textAlign: 'center',
    color: '#000',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  tableCellRate: {
    width: 58,
    padding: 4,
    fontSize: 8,
    textAlign: 'right',
    color: '#000',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  tableCellAmount: {
    width: 58,
    padding: 4,
    fontSize: 8,
    textAlign: 'right',
    color: '#000',
  },
  designImage: {
    maxWidth: 140,
    maxHeight: 120,
    objectFit: 'contain',
    marginBottom: 2,
  },
  designDims: {
    fontSize: 7,
    color: '#000',
  },
  specLine: {
    marginBottom: 0.5,
  },
  // --- Summary ---
  summaryArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  summaryLeftBlock: {
    width: '48%',
  },
  summaryLeftText: {
    fontSize: 9,
    color: '#000',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  summaryTable: {
    width: '48%',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    minHeight: 18,
    alignItems: 'center',
  },
  summaryLabel: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 9,
    color: '#000',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  summaryLabelBold: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 9,
    color: '#000',
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  summaryColon: {
    width: 20,
    paddingVertical: 3,
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#000',
  },
  summaryValue: {
    width: 80,
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 9,
    color: '#000',
    textAlign: 'right',
  },
  // --- Terms ---
  termsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    marginBottom: 6,
    textDecoration: 'underline',
  },
  termsItem: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
    marginBottom: 2,
  },
  termsItemBold: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  termsSubItem: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
    marginBottom: 2,
    paddingLeft: 14,
  },
  bankTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    marginTop: 6,
    marginBottom: 4,
    paddingLeft: 14,
  },
  bankRow: {
    flexDirection: 'row',
    paddingLeft: 28,
    marginBottom: 2,
  },
  bankLabel: {
    width: 100,
    fontSize: 9,
    color: '#000',
  },
  bankColon: {
    width: 14,
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
  },
  bankValue: {
    flex: 1,
    fontSize: 9,
    color: '#000',
  },
  acceptanceText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
    marginTop: 14,
    marginBottom: 30,
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureLeft: {
    width: '45%',
    fontSize: 9,
    color: '#000',
  },
  signatureRight: {
    width: '45%',
    fontSize: 9,
    color: '#000',
    textAlign: 'right',
  },
});

function Header({ company }) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        {company?.logoUrl && (
          <Image src={company.logoUrl} style={styles.logo} />
        )}
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.companyName}>{company?.name || ''}</Text>
        <Text style={styles.companyDetails}>{company?.address || ''}</Text>
        <Text style={styles.companyDetails}>Contact No. : {company?.contactNo || ''}</Text>
        <Text style={styles.companyDetails}>Email : {company?.email || ''}</Text>
      </View>
    </View>
  );
}

function QuoteMeta({ quote }) {
  return (
    <View style={styles.quoteMetaLine} fixed>
      <Text style={styles.quoteMetaText}>
        Quote No. : {quote?.id || ''} / Project : {quote?.projectName || ''} / Date :{quote?.date || ''}
      </Text>
    </View>
  );
}

function Footer({ pageNumber, totalPages, company, softwareName }) {
  return (
    <View style={styles.footer} fixed>
      <View style={{ width: 40 }}>
        {company?.logoUrl && (
          <Image src={company.logoUrl} style={styles.footerLogo} />
        )}
      </View>
      <Text style={styles.footerPage}>{pageNumber} of {totalPages}</Text>
      <Text style={styles.footerPowered}>powered by {softwareName || 'EvA WinOptimize Software'}</Text>
    </View>
  );
}

function SpecLines({ specifications }) {
  if (!specifications) return null;
  const lines = [];

  // Standard fields in order
  const standardFields = [
    ['Code', specifications.code],
    ['Dimension', specifications.dimension],
    ['Location', specifications.location],
    ['Area', specifications.area],
    ['Weight', specifications.weight],
    ['Profile Brand', specifications.profileBrand],
    ['System', specifications.system],
    ['Type', specifications.type],
    ['Glazing', specifications.glazing],
    ['Profile Color', specifications.profileColor],
    ['MeshType', specifications.meshType],
  ];

  // Optional extra fields
  if (specifications.handleColor) {
    standardFields.push(['Handle color', specifications.handleColor]);
  }

  standardFields.forEach(([k, v]) => {
    if (v != null && String(v).trim() !== '' && String(v).trim() !== '--') {
      lines.push(`${k} : ${String(v)}`);
    }
  });

  // Additional profile/hardware details (array of strings)
  if (specifications.additionalDetails && Array.isArray(specifications.additionalDetails)) {
    specifications.additionalDetails.forEach((detail) => {
      if (detail && String(detail).trim()) {
        lines.push(String(detail));
      }
    });
  }

  // Legacy single field
  if (specifications.outerFrameDetails && !specifications.additionalDetails?.length) {
    String(specifications.outerFrameDetails).split('\n').forEach((line) => {
      if (line.trim()) lines.push(line.trim());
    });
  }

  return (
    <View>
      {lines.map((line, i) => (
        <Text key={i} style={styles.specLine}>{line}</Text>
      ))}
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderCell, { width: 26, borderRightWidth: 0.5, borderRightColor: '#000' }]}>Sl{'\n'}NO.</Text>
      <Text style={[styles.tableHeaderCell, { width: 155, borderRightWidth: 0.5, borderRightColor: '#000' }]}>DESIGN</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1, borderRightWidth: 0.5, borderRightColor: '#000' }]}>SPECIFICATIONS</Text>
      <Text style={[styles.tableHeaderCell, { width: 32, borderRightWidth: 0.5, borderRightColor: '#000' }]}>QTY</Text>
      <Text style={[styles.tableHeaderCell, { width: 58, borderRightWidth: 0.5, borderRightColor: '#000' }]}>RATE</Text>
      <Text style={[styles.tableHeaderCell, { width: 58 }]}>AMOUNT</Text>
    </View>
  );
}

function DesignTableRow({ row }) {
  const hasImage = row.designImageDataUrl && (row.designImageDataUrl.startsWith('data:') || row.designImageDataUrl.startsWith('http'));
  return (
    <View style={styles.tableRow} wrap={false}>
      <Text style={styles.tableCellSl}>{row.slNo}.</Text>
      <View style={styles.tableCellDesign}>
        {hasImage ? (
          <>
            <Image src={row.designImageDataUrl} style={styles.designImage} />
            <Text style={styles.designDims}>{row.specifications?.dimension || ''}</Text>
          </>
        ) : (
          <Text style={styles.designDims}>{row.specifications?.dimension || ''}</Text>
        )}
      </View>
      <View style={styles.tableCellSpec}>
        <SpecLines specifications={row.specifications} />
      </View>
      <Text style={styles.tableCellQty}>{row.qty}</Text>
      <View style={styles.tableCellRate}>
        <Text style={{ fontSize: 8, textAlign: 'right' }}>{row.rate}</Text>
        {row.ratePerSqft && (
          <Text style={{ fontSize: 7, textAlign: 'right', color: '#000' }}>({row.ratePerSqft}/Sqft)</Text>
        )}
      </View>
      <Text style={styles.tableCellAmount}>{row.amount}</Text>
    </View>
  );
}

function SummaryBlock({ summary }) {
  const fmtINR = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const rows = [
    { label: 'Basic Value', value: fmtINR(summary?.basicValue), bold: false },
    { label: 'Sub Total', value: fmtINR(summary?.subTotal), bold: true },
    { label: 'Transportation Cost', value: fmtINR(summary?.transportationCost), bold: false },
    { label: 'Loading And  Unloading', value: fmtINR(summary?.loadingAndUnloading), bold: false },
    { label: 'Total Project Cost', value: fmtINR(summary?.totalProjectCost), bold: true },
    { label: `Gst @${summary?.gstPct ?? 18}%`, value: fmtINR(summary?.gst), bold: false },
    { label: 'Grand Total', value: fmtINR(summary?.grandTotal), bold: true },
  ];

  if (summary?.quoteTotal != null) {
    rows.push({ label: 'Quote Total', value: fmtINR(summary.quoteTotal), bold: true });
  }

  return (
    <View style={styles.summaryArea}>
      {/* Left side - totals text */}
      <View style={styles.summaryLeftBlock}>
        <Text style={styles.summaryLeftText}>Total Area : {summary?.totalAreaSqft ?? '0'} Sq.Ft.</Text>
        <Text style={styles.summaryLeftText}>Total Windows : {summary?.totalWindows ?? 0} Nos</Text>
        <Text style={styles.summaryLeftText}>Avg. price per Sqft : Rs. {summary?.avgPricePerSqft ?? '0'}</Text>
        <Text style={styles.summaryLeftText}>Avg. price per Sqft without GST : Rs. {summary?.avgPricePerSqftExGst ?? '0'}</Text>
      </View>

      {/* Right side - pricing table */}
      <View style={styles.summaryTable}>
        {rows.map((row, i) => (
          <View key={i} style={[styles.summaryRow, i === rows.length - 1 ? { borderBottomWidth: 0 } : {}]}>
            <Text style={row.bold ? styles.summaryLabelBold : styles.summaryLabel}>{row.label}</Text>
            <Text style={styles.summaryColon}>: Rs</Text>
            <Text style={styles.summaryValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function QuotationDocument({ data }) {
  const {
    company = {},
    quote = {},
    client = {},
    letter = {},
    designs = [],
    summary = {},
    terms = {},
    softwareName = 'EvA WinOptimize Software',
  } = data;

  // Paginate designs - roughly 2 per page for designs with images
  const ROWS_PER_PAGE = 3;
  const designChunks = [];
  for (let i = 0; i < designs.length; i += ROWS_PER_PAGE) {
    designChunks.push(designs.slice(i, i + ROWS_PER_PAGE));
  }
  if (designChunks.length === 0) designChunks.push([]);

  const tablePages = designChunks.length;
  const totalPages = 1 + tablePages + 1; // cover + table pages + terms
  let pageNum = 0;

  // Intro paragraphs - use provided or default
  const introParagraphs = (letter?.introParagraphs && letter.introParagraphs.length > 0)
    ? letter.introParagraphs
    : [
      `We are delighted that you are considering our range of Windows and Doors for your premises.`,
      `It has gained rapid acceptance across all cities of India for the overwhelming advantages of better protection from noise, heat, rain, dust and pollution.`,
      `In drawing this proposal, it has been our endeavor to suggest designs which would enhance your comfort and aesthetics from inside and improve the facade of the building.`,
      `It has a well established service network to deliver seamless service at your doorstep. Our offer comprises of the following in enclosure for your kind perusal:`,
    ];

  const listItems = letter?.listItems || [
    'a. Window design, specification and value',
    'b. Terms and Conditions',
  ];

  const closingText = letter?.closingText || 'We now look forward to be of service to you.';

  return (
    <Document>
      {/* ========== PAGE 1: Cover Letter ========== */}
      <Page size="A4" style={styles.page}>
        <Header company={company} />
        <View style={{ position: 'absolute', top: HEADER_HEIGHT + 4, left: 0, right: 0 }}>
          <QuoteMeta quote={quote} />
        </View>
        <Footer pageNumber={++pageNum} totalPages={totalPages} company={company} softwareName={softwareName} />

        <View style={[styles.body, { paddingTop: HEADER_HEIGHT + 36 }]}>
          {/* To section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.letterTo}>To</Text>
            <Text style={styles.letterClientName}>Mr {client?.name || 'Customer'}</Text>
            {client?.address ? (
              <Text style={styles.letterClientName}>{client.address}</Text>
            ) : null}
            <Text style={styles.letterClientName}>Pin - {client?.pin || ''}</Text>
          </View>

          {/* Letter body */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles.letterPara}>Dear {client?.name || 'Customer'},</Text>

            {introParagraphs.map((p, i) => (
              <Text key={i} style={styles.letterPara}>{p}</Text>
            ))}

            {/* List items */}
            {listItems.map((item, i) => (
              <Text key={`list-${i}`} style={styles.letterListItem}>{item}</Text>
            ))}

            <Text style={[styles.letterPara, { marginTop: 6 }]}>{closingText}</Text>
          </View>

          {/* Signatory */}
          <View style={styles.signatoryBlock}>
            <Text style={styles.signatoryText}>For {company?.name || ''},</Text>
            <Text style={styles.signatoryLabel}>{letter?.signatoryText || 'Authorized Signatory'}</Text>
          </View>
        </View>
      </Page>

      {/* ========== PAGES: Design Table ========== */}
      {designChunks.map((chunk, chunkIndex) => (
        <Page key={`table-${chunkIndex}`} size="A4" style={styles.page}>
          <Header company={company} />
          <View style={{ position: 'absolute', top: HEADER_HEIGHT + 4, left: 0, right: 0 }}>
            <QuoteMeta quote={quote} />
          </View>
          <Footer pageNumber={++pageNum} totalPages={totalPages} company={company} softwareName={softwareName} />

          <View style={[styles.body, { paddingTop: HEADER_HEIGHT + 36 }]}>
            <View style={styles.table}>
              <TableHeader />
              {chunk.map((row, i) => (
                <DesignTableRow key={i} row={row} />
              ))}
            </View>

            {/* Summary on last table page */}
            {chunkIndex === designChunks.length - 1 && (
              <SummaryBlock summary={summary} />
            )}
          </View>
        </Page>
      ))}

      {/* ========== LAST PAGE: Terms & Conditions ========== */}
      <Page size="A4" style={styles.page}>
        <Header company={company} />
        <View style={{ position: 'absolute', top: HEADER_HEIGHT + 4, left: 0, right: 0 }}>
          <QuoteMeta quote={quote} />
        </View>
        <Footer pageNumber={++pageNum} totalPages={totalPages} company={company} softwareName={softwareName} />

        <View style={[styles.body, { paddingTop: HEADER_HEIGHT + 36 }]}>
          <Text style={styles.termsTitle}>Terms and Conditions:-</Text>

          {(terms?.sections || []).map((sec, secIdx) => (
            <View key={secIdx} style={{ marginBottom: 6 }}>
              {sec.title ? (
                <Text style={styles.termsItemBold}>{sec.title}</Text>
              ) : null}
              {(sec.items || []).map((item, j) => (
                <Text
                  key={j}
                  style={item.startsWith('   ') || item.startsWith('a.') || item.startsWith('b.') || item.startsWith('c.') || item.startsWith('d.') || item.startsWith('e.')
                    ? styles.termsSubItem
                    : styles.termsItem}
                >
                  {item}
                </Text>
              ))}
            </View>
          ))}

          {/* Default terms if none provided */}
          {(!terms?.sections || terms.sections.length === 0) && (
            <View>
              <Text style={styles.termsItemBold}>1. 10 Year Warrenty for Upvc Profile and TPE Gasckets.</Text>
              <Text style={styles.termsItemBold}>2. Note :</Text>
              <Text style={styles.termsSubItem}>a. Quotation will be valid for a period of 30 days.</Text>
              <Text style={styles.termsSubItem}>b. If there is a taper in the wall which will cause a gap of more than 7mm then the same will have to be filled by the client, we will not fill extra Cylicon.</Text>
              <Text style={styles.termsSubItem}>c. Scaffolding should be provided by the client (if windows are to be fixed externally above ground floor)</Text>
              <Text style={styles.termsSubItem}>d. The validity of offer is 15 days from the date of this letter.</Text>
              <Text style={styles.termsSubItem}>e. Delivery date will be given on receipt of P.O and Payment. (20 to 30 Days from Receipt of Payment)</Text>
              <Text style={styles.termsItemBold}>3. Payment Terms :</Text>
              <Text style={styles.termsSubItem}>a. 75 % Payment to be given along with the P.O</Text>
              <Text style={styles.termsSubItem}>b. 25 % Payment to be given on Material Delivery at site.</Text>
              <Text style={styles.termsItem}>4. Joint Measurement of Window sizes to be taken along with the Site, Engineer/Client for all Windows.</Text>
              <Text style={styles.termsItem}>5. No replacement will be given if sizes given are not actual sizes on site post joint measurement.</Text>
              <Text style={styles.termsItem}>6. Transportation charges will be extra if the site is above 15kms from Mangalore.</Text>
            </View>
          )}

          {/* Bank Details */}
          {terms?.bankDetails && Object.keys(terms.bankDetails).length > 0 && (
            <View>
              <Text style={styles.bankTitle}>Bank Details :</Text>
              {Object.entries(terms.bankDetails).map(([k, v], i) => (
                <View key={i} style={styles.bankRow}>
                  <Text style={styles.bankLabel}>{k}</Text>
                  <Text style={styles.bankColon}>:</Text>
                  <Text style={styles.bankValue}>{String(v)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Acceptance text */}
          <Text style={styles.acceptanceText}>
            {terms?.acceptanceText || 'I hereby accept the estimate as per above mentioned price and specifications. I have read and understood the terms & conditions and agree to them.'}
          </Text>

          {/* Signatures */}
          <View style={styles.signatureArea}>
            <Text style={styles.signatureLeft}>
              {terms?.signatureLabels?.company || 'Authorized Signatory'}
            </Text>
            <Text style={styles.signatureRight}>
              {terms?.signatureLabels?.client || 'Signature of Customer'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
