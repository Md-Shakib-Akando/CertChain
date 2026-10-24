import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface CertificateData {
  certId: string;
  type: 'Degree Certificate' | 'Provisional Certificate' | 'Academic Transcript' | string;
  studentName: string;
  studentId: string;
  program: string;
  session: string;
  cgpa: string;
  issueDate: string;
  institution?: string;
  verifyBaseUrl?: string;
}

export interface GeneratedCertificateResult {
  pdfBytes: Uint8Array;
  pdfBase64: string;
  sha256Hash: string; // 64 hex characters
  bytes32Hash: string; // 0x-prefixed 64 hex characters for smart contract
}

/**
 * Generate cryptographic, tamper-proof academic certificate PDF using pdf-lib
 * Adheres to PUB CertChain PRD Section 5.4 & Section 11.3
 */
export async function generateCertificatePdf(data: CertificateData): Promise<GeneratedCertificateResult> {
  const doc = await PDFDocument.create();

  // Enforce 100% deterministic PDF byte generation across any machine or timestamp
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));
  doc.setProducer('PUB CertChain Engine');
  doc.setCreator('PUB CertChain Security Infrastructure');

  // A4 Landscape: 841.89 x 595.28 points
  const width = 841.89;
  const height = 595.28;
  const page = doc.addPage([width, height]);

  // Embed Fonts
  const fontSerif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontSerifRegular = await doc.embedFont(StandardFonts.TimesRoman);
  const fontSans = await doc.embedFont(StandardFonts.Helvetica);
  const fontSansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  // PRD Color Palette
  const navy900 = rgb(11 / 255, 31 / 255, 58 / 255); // #0B1F3A
  const navy700 = rgb(18 / 255, 50 / 255, 92 / 255); // #12325C
  const gold = rgb(201 / 255, 162 / 255, 39 / 255); // #C9A227
  const slate600 = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
  const slate800 = rgb(30 / 255, 41 / 255, 59 / 255); // #1E293B

  // 1. Double Borders (Outer Navy, Inner Gold)
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: navy900,
    borderWidth: 4,
  });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: gold,
    borderWidth: 1.5,
  });

  // Corner decorative flourishes
  const cornerFlourish = (cx: number, cy: number) => {
    page.drawSquare({
      x: cx - 4,
      y: cy - 4,
      size: 8,
      color: gold,
    });
  };
  cornerFlourish(26, 26);
  cornerFlourish(width - 26, 26);
  cornerFlourish(26, height - 26);
  cornerFlourish(width - 26, height - 26);

  // 2. Subtle Watermark Text in Background
  page.drawText('PUNDRA UNIVERSITY OF SCIENCE & TECHNOLOGY - OFFICIAL BLOCKCHAIN SECURED CREDENTIAL', {
    x: 95,
    y: 285,
    size: 11,
    font: fontSansBold,
    color: rgb(240 / 255, 244 / 255, 248 / 255),
    rotate: { type: 'degrees', angle: 25 },
  });

  // 3. Header: University Name & Emblem
  const uniName = 'PUNDRA UNIVERSITY OF SCIENCE & TECHNOLOGY';
  const uniNameWidth = fontSerif.widthOfTextAtSize(uniName, 22);
  page.drawText(uniName, {
    x: (width - uniNameWidth) / 2,
    y: height - 68,
    size: 22,
    font: fontSerif,
    color: navy900,
  });

  const subHeader = 'Bogura, Bangladesh | Established under the Private University Act, 2010';
  const subHeaderWidth = fontSans.widthOfTextAtSize(subHeader, 10);
  page.drawText(subHeader, {
    x: (width - subHeaderWidth) / 2,
    y: height - 84,
    size: 10,
    font: fontSans,
    color: slate600,
  });

  // Decorative Golden Line
  page.drawLine({
    start: { x: 180, y: height - 96 },
    end: { x: width - 180, y: height - 96 },
    thickness: 1.5,
    color: gold,
  });

  // 4. Certificate Title
  const certTypeUpper = data.type.toUpperCase();
  const certTypeWidth = fontSerif.widthOfTextAtSize(certTypeUpper, 24);
  page.drawText(certTypeUpper, {
    x: (width - certTypeWidth) / 2,
    y: height - 132,
    size: 24,
    font: fontSerif,
    color: navy700,
  });

  // 5. Body Text
  const preamble = 'This is to certify that';
  const preambleWidth = fontSerifRegular.widthOfTextAtSize(preamble, 14);
  page.drawText(preamble, {
    x: (width - preambleWidth) / 2,
    y: height - 164,
    size: 14,
    font: fontSerifRegular,
    color: slate600,
  });

  // Student Name (Prominent)
  const studentNameText = data.studentName;
  const nameWidth = fontSerif.widthOfTextAtSize(studentNameText, 26);
  page.drawText(studentNameText, {
    x: (width - nameWidth) / 2,
    y: height - 202,
    size: 26,
    font: fontSerif,
    color: navy900,
  });

  // Student ID
  const idText = `Student ID: ${data.studentId}`;
  const idWidth = fontSansBold.widthOfTextAtSize(idText, 12);
  page.drawText(idText, {
    x: (width - idWidth) / 2,
    y: height - 222,
    size: 12,
    font: fontSansBold,
    color: gold,
  });

  // Degree Details Body
  const conferredText =
    data.type === 'Academic Transcript'
      ? 'has successfully completed all prescribed courses and requirements for the degree of'
      : 'having fulfilled all the academic conditions has been conferred the degree of';
  const conferredWidth = fontSerifRegular.widthOfTextAtSize(conferredText, 13);
  page.drawText(conferredText, {
    x: (width - conferredWidth) / 2,
    y: height - 254,
    size: 13,
    font: fontSerifRegular,
    color: slate800,
  });

  // Program / Department
  const programText = data.program;
  const programWidth = fontSerif.widthOfTextAtSize(programText, 18);
  page.drawText(programText, {
    x: (width - programWidth) / 2,
    y: height - 282,
    size: 18,
    font: fontSerif,
    color: navy700,
  });

  // Academic Result / Session
  const resultText = `Academic Session: ${data.session}   |   Cumulative GPA: ${data.cgpa} / 4.00`;
  const resultWidth = fontSansBold.widthOfTextAtSize(resultText, 13);
  page.drawText(resultText, {
    x: (width - resultWidth) / 2,
    y: height - 310,
    size: 13,
    font: fontSansBold,
    color: slate800,
  });

  const footerText = 'Given under the seal of the University and the authority of the Syndicate.';
  const footerWidth = fontSerifRegular.widthOfTextAtSize(footerText, 11);
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: height - 336,
    size: 11,
    font: fontSerifRegular,
    color: slate600,
  });

  // 6. Signatures Section
  const drawSignatory = (x: number, title: string, subtitle: string) => {
    page.drawLine({
      start: { x: x - 60, y: 115 },
      end: { x: x + 60, y: 115 },
      thickness: 1,
      color: slate600,
    });
    const titleW = fontSansBold.widthOfTextAtSize(title, 10);
    page.drawText(title, {
      x: x - titleW / 2,
      y: 100,
      size: 10,
      font: fontSansBold,
      color: navy900,
    });
    const subW = fontSans.widthOfTextAtSize(subtitle, 8);
    page.drawText(subtitle, {
      x: x - subW / 2,
      y: 88,
      size: 8,
      font: fontSans,
      color: slate600,
    });
  };

  drawSignatory(150, 'Prepared & Verified', 'Registrar Office');
  drawSignatory(width / 2, 'Controller of Examinations', 'PUB CertChain Authority');
  drawSignatory(width - 150, 'Vice-Chancellor', 'Pundra University');

  // 7. QR Code (Bottom Right, 28mm ~ 80 points)
  const baseUrl = data.verifyBaseUrl || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/?id=${encodeURIComponent(data.certId)}#verify`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 200,
    color: {
      dark: '#0B1F3AFF',
      light: '#FFFFFFFF',
    },
  });

  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await doc.embedPng(qrImageBytes);

  const qrSize = 72;
  const qrX = width - 110;
  const qrY = 38;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText('Scan to Verify', {
    x: qrX + 6,
    y: qrY - 9,
    size: 7,
    font: fontSansBold,
    color: navy900,
  });

  // 8. Bottom Left Metadata & Monospace Security Details
  page.drawText(`Certificate ID: ${data.certId}`, {
    x: 40,
    y: 56,
    size: 8,
    font: fontMono,
    color: navy900,
  });

  page.drawText(`Issue Date: ${data.issueDate}  |  Blockchain Anchored: Ethereum Sepolia / Hardhat`, {
    x: 40,
    y: 44,
    size: 7,
    font: fontSans,
    color: slate600,
  });

  page.drawText(`Direct Verification URL: ${verifyUrl}`, {
    x: 40,
    y: 33,
    size: 6.5,
    font: fontMono,
    color: slate600,
  });

  // Serialize to deterministic bytes
  const pdfBytes = await doc.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  // SHA-256 Hash of the exact bytes
  const sha256Hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  const bytes32Hash = `0x${sha256Hash}`;

  return {
    pdfBytes,
    pdfBase64,
    sha256Hash,
    bytes32Hash,
  };
}
