/**
 * Pure client-side PDF and Word (.doc) document exporter.
 * Zero external npm dependencies. Generates 100% standards-compliant
 * PDF 1.4 files and Microsoft Word (.doc) documents.
 */

// Helvetica ASCII character widths (units per 1000)
const HELVETICA_WIDTHS = {
  32: 278, 33: 278, 34: 355, 35: 556, 36: 556, 37: 889, 38: 667, 39: 191,
  40: 333, 41: 333, 42: 389, 43: 584, 44: 278, 45: 333, 46: 278, 47: 278,
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556,
  56: 556, 57: 556, 58: 278, 59: 278, 60: 584, 61: 584, 62: 584, 63: 556,
  64: 1015, 65: 667, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
  72: 722, 73: 278, 74: 500, 75: 667, 76: 556, 77: 833, 78: 722, 79: 778,
  80: 667, 81: 778, 82: 722, 83: 667, 84: 611, 85: 722, 86: 667, 87: 944,
  88: 667, 89: 667, 90: 611, 91: 278, 92: 278, 93: 278, 94: 469, 95: 556,
  96: 333, 97: 556, 98: 556, 99: 500, 100: 556, 101: 556, 102: 278, 103: 556,
  104: 556, 105: 222, 106: 222, 107: 500, 108: 222, 109: 833, 110: 556, 111: 556,
  112: 556, 113: 556, 114: 333, 115: 500, 116: 278, 117: 556, 118: 500, 119: 722,
  120: 500, 121: 500, 122: 500, 123: 334, 124: 260, 125: 334, 126: 584
};

function measureTextWidth(text, fontSize) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const w = HELVETICA_WIDTHS[code] || 550;
    width += (w * fontSize) / 1000;
  }
  return width;
}

function sanitizeForPdf(text) {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, '--')
    .replace(/\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25AA\u25CF]/g, '*')
    .replace(/[^\x20-\x7E\t\n\r]/g, ' ');
}

function escapePdfString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text, maxWidth, fontSize) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (measureTextWidth(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      if (measureTextWidth(word, fontSize) > maxWidth) {
        let chunk = '';
        for (let j = 0; j < word.length; j++) {
          if (measureTextWidth(chunk + word[j], fontSize) > maxWidth) {
            lines.push(chunk);
            chunk = word[j];
          } else {
            chunk += word[j];
          }
        }
        currentLine = chunk;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.length > 0 ? lines : [''];
}

function isKnownSectionHeader(text) {
  const upper = text.toUpperCase().trim();
  const known = [
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE',
    'EMPLOYMENT HISTORY',
    'EDUCATION',
    'SKILLS',
    'TECHNICAL SKILLS',
    'CORE COMPETENCIES',
    'PROJECTS',
    'SELECTED PROJECTS',
    'CERTIFICATIONS',
    'PUBLICATIONS',
    'SUMMARY',
    'PROFESSIONAL SUMMARY',
    'OBJECTIVE',
    'CONTACT',
    'LANGUAGES',
  ];
  return known.includes(upper) || (text.length <= 40 && text === upper && /^[A-Z\s&,/]+$/.test(text));
}

/**
 * Generates a standard PDF 1.4 binary Blob.
 */
export function generatePdfBlob(title, content) {
  const sanitizedTitle = sanitizeForPdf(title || 'Document');
  const sanitizedContent = sanitizeForPdf(content || '');
  const lines = sanitizedContent.split(/\r?\n/);

  const pageWidth = 612; // US Letter
  const pageHeight = 792;
  const marginX = 54; // 0.75 in
  const usableWidth = pageWidth - marginX * 2; // 504 pt
  const topMargin = 54;
  const bottomMargin = 54;
  const startY = pageHeight - topMargin; // 738

  // Layout items:
  // Each item has { type, text, fontSize, fontRef, color, spaceAfter, isBullet, bulletIndent }
  const layoutItems = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      layoutItems.push({ type: 'space', height: 8 });
      continue;
    }

    // Document Title or H1: starts with "# "
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.slice(2).trim();
      const wrapped = wrapText(headingText, usableWidth, 16);
      wrapped.forEach((wLine, idx) => {
        layoutItems.push({
          type: 'text',
          text: wLine,
          fontSize: 16,
          fontRef: '/F2', // Bold
          rgb: '0.08 0.12 0.20',
          lineHeight: 20,
          spaceAfter: idx === wrapped.length - 1 ? 8 : 2,
          hasDivider: idx === wrapped.length - 1,
        });
      });
      continue;
    }

    // Section Header: starts with "## " or is an all-caps section keyword
    if (trimmed.startsWith('## ') || isKnownSectionHeader(trimmed)) {
      const sectionText = trimmed.replace(/^##\s*/, '').trim();
      const wrapped = wrapText(sectionText, usableWidth, 12);
      wrapped.forEach((wLine, idx) => {
        layoutItems.push({
          type: 'text',
          text: wLine,
          fontSize: 12,
          fontRef: '/F2', // Bold
          rgb: '0.02 0.40 0.65',
          lineHeight: 16,
          spaceAfter: idx === wrapped.length - 1 ? 5 : 2,
          hasDivider: idx === wrapped.length - 1,
          dividerColor: '0.75 0.85 0.95',
        });
      });
      continue;
    }

    // Subheading: starts with "### "
    if (trimmed.startsWith('### ')) {
      const subText = trimmed.slice(4).trim();
      const wrapped = wrapText(subText, usableWidth, 10.5);
      wrapped.forEach((wLine, idx) => {
        layoutItems.push({
          type: 'text',
          text: wLine,
          fontSize: 10.5,
          fontRef: '/F2',
          rgb: '0.12 0.16 0.24',
          lineHeight: 14,
          spaceAfter: idx === wrapped.length - 1 ? 4 : 2,
        });
      });
      continue;
    }

    // Bullet Point: starts with "* ", "- ", "• "
    if (/^[\*\-•]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[\*\-•]\s+/, '').trim();
      const bulletIndent = 14;
      const bulletContentWidth = usableWidth - bulletIndent;
      const wrapped = wrapText(bulletText, bulletContentWidth, 10);
      wrapped.forEach((wLine, idx) => {
        layoutItems.push({
          type: 'text',
          text: wLine,
          fontSize: 10,
          fontRef: '/F1', // Regular
          rgb: '0.15 0.18 0.25',
          lineHeight: 13.5,
          isBullet: idx === 0,
          isHangingBullet: idx > 0,
          bulletIndent: bulletIndent,
          spaceAfter: idx === wrapped.length - 1 ? 3 : 1.5,
        });
      });
      continue;
    }

    // Standard Paragraph
    const cleanParagraph = trimmed.replace(/\*\*(.*?)\*\*/g, '$1'); // strip bold markers for text stream
    const wrapped = wrapText(cleanParagraph, usableWidth, 10);
    wrapped.forEach((wLine, idx) => {
      layoutItems.push({
        type: 'text',
        text: wLine,
        fontSize: 10,
        fontRef: '/F1',
        rgb: '0.15 0.18 0.25',
        lineHeight: 13.5,
        spaceAfter: idx === wrapped.length - 1 ? 5 : 1.5,
      });
    });
  }

  // Paginate items into pages
  const pages = [];
  let currentPageItems = [];
  let currentY = startY;

  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    const neededHeight = item.type === 'space' ? item.height : (item.lineHeight + (item.spaceAfter || 0) + (item.hasDivider ? 4 : 0));

    if (currentY - neededHeight < bottomMargin) {
      pages.push(currentPageItems);
      currentPageItems = [];
      currentY = startY - 20; // slight top breathing room on pages 2+
    }

    if (item.type === 'space') {
      currentY -= item.height;
    } else {
      currentPageItems.push({ ...item, y: currentY });
      currentY -= (item.lineHeight + (item.spaceAfter || 0));
      if (item.hasDivider) {
        currentPageItems.push({
          type: 'divider',
          y: currentY + (item.spaceAfter || 0) - 2,
          color: item.dividerColor || '0.80 0.82 0.88',
        });
        currentY -= 4;
      }
    }
  }

  if (currentPageItems.length > 0 || pages.length === 0) {
    pages.push(currentPageItems);
  }

  const totalPages = pages.length;

  // Build PDF streams per page
  const pageStreams = pages.map((pageItems, pageIdx) => {
    const pageNum = pageIdx + 1;
    let stream = '';

    // Running header on page 2+
    if (pageNum > 1) {
      stream += `BT /F3 8 Tf 0.45 0.48 0.55 rg ${marginX} 758 Td (${escapePdfString(sanitizedTitle)}) Tj ET\n`;
      stream += `0.5 w 0.85 0.88 0.92 RG ${marginX} 752 m ${pageWidth - marginX} 752 l S\n`;
    }

    // Page items
    for (let j = 0; j < pageItems.length; j++) {
      const it = pageItems[j];
      if (it.type === 'divider') {
        stream += `0.75 w ${it.color} RG ${marginX} ${it.y.toFixed(1)} m ${pageWidth - marginX} ${it.y.toFixed(1)} l S\n`;
      } else if (it.type === 'text') {
        const posX = it.isBullet ? marginX + it.bulletIndent : (it.isHangingBullet ? marginX + it.bulletIndent : marginX);

        if (it.isBullet) {
          // Draw bullet dot
          stream += `BT /F2 10 Tf 0.15 0.45 0.75 rg ${marginX} ${it.y.toFixed(1)} Td (*) Tj ET\n`;
        }

        stream += `BT ${it.fontRef} ${it.fontSize} Tf ${it.rgb} rg ${posX.toFixed(1)} ${it.y.toFixed(1)} Td (${escapePdfString(it.text)}) Tj ET\n`;
      }
    }

    // Running footer with page number
    stream += `0.5 w 0.85 0.88 0.92 RG ${marginX} 44 m ${pageWidth - marginX} 44 l S\n`;
    const pageStr = `Page ${pageNum} of ${totalPages}`;
    const pageStrWidth = measureTextWidth(pageStr, 8);
    const pageStrX = (pageWidth - pageStrWidth) / 2;
    stream += `BT /F1 8 Tf 0.50 0.52 0.58 rg ${pageStrX.toFixed(1)} 30 Td (${pageStr}) Tj ET\n`;

    return stream;
  });

  // Construct PDF 1.4 structure
  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font /F1 (Helvetica)
  // 4: Font /F2 (Helvetica-Bold)
  // 5: Font /F3 (Helvetica-Oblique)
  // For each page i (1..N):
  //   pageObjNum = 5 + (i - 1) * 2 + 1
  //   contentObjNum = 5 + (i - 1) * 2 + 2

  const fontObj1 = 3;
  const fontObj2 = 4;
  const fontObj3 = 5;
  const pageObjNums = [];
  for (let i = 1; i <= totalPages; i++) {
    pageObjNums.push(5 + (i - 1) * 2 + 1);
  }
  const totalObjects = 5 + totalPages * 2;

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = new Array(totalObjects + 1).fill(0);

  // Obj 1: Catalog
  offsets[1] = pdf.length;
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';

  // Obj 2: Pages
  offsets[2] = pdf.length;
  pdf += `2 0 obj\n<< /Type /Pages /Kids [ ${pageObjNums.map((n) => `${n} 0 R`).join(' ')} ] /Count ${totalPages} >>\nendobj\n`;

  // Obj 3: Font /F1 (Helvetica Regular)
  offsets[3] = pdf.length;
  pdf += '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';

  // Obj 4: Font /F2 (Helvetica Bold)
  offsets[4] = pdf.length;
  pdf += '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';

  // Obj 5: Font /F3 (Helvetica Oblique)
  offsets[5] = pdf.length;
  pdf += '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n';

  // Page & Content Objects
  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const pObjNum = 5 + i * 2 + 1;
    const cObjNum = 5 + i * 2 + 2;
    const streamContent = pageStreams[i];

    // Page object
    offsets[pObjNum] = pdf.length;
    pdf += `${pObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${cObjNum} 0 R /Resources << /Font << /F1 ${fontObj1} 0 R /F2 ${fontObj2} 0 R /F3 ${fontObj3} 0 R >> >> >>\nendobj\n`;

    // Content stream object
    offsets[cObjNum] = pdf.length;
    pdf += `${cObjNum} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  }

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${totalObjects + 1}\n`;
  pdf += '0000000000 65535 f \r\n';
  for (let i = 1; i <= totalObjects; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offStr} 00000 n \r\n`;
  }

  // Trailer
  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInlineHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
}

/**
 * Generates a Microsoft Word (.doc) formatted Blob.
 */
export function generateDocBlob(title, content) {
  const docTitle = escapeHtml(title || 'Document');
  const lines = (content || '').split(/\r?\n/);
  let htmlBody = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        htmlBody += '</ul>\n';
        inList = false;
      }
      continue;
    }

    // Title or H1
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlBody += '</ul>\n'; inList = false; }
      const text = formatInlineHtml(escapeHtml(trimmed.slice(2).trim()));
      htmlBody += `<h1>${text}</h1>\n`;
      continue;
    }

    // Section Header H2
    if (trimmed.startsWith('## ') || isKnownSectionHeader(trimmed)) {
      if (inList) { htmlBody += '</ul>\n'; inList = false; }
      const text = formatInlineHtml(escapeHtml(trimmed.replace(/^##\s*/, '').trim()));
      htmlBody += `<h2>${text}</h2>\n`;
      continue;
    }

    // Subheading H3
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlBody += '</ul>\n'; inList = false; }
      const text = formatInlineHtml(escapeHtml(trimmed.slice(4).trim()));
      htmlBody += `<h3>${text}</h3>\n`;
      continue;
    }

    // Bullet points
    if (/^[\*\-•]\s+/.test(trimmed)) {
      if (!inList) {
        htmlBody += '<ul>\n';
        inList = true;
      }
      const bulletText = formatInlineHtml(escapeHtml(trimmed.replace(/^[\*\-•]\s+/, '').trim()));
      htmlBody += `  <li>${bulletText}</li>\n`;
      continue;
    }

    // Regular paragraph
    if (inList) {
      htmlBody += '</ul>\n';
      inList = false;
    }
    const paraText = formatInlineHtml(escapeHtml(trimmed));
    htmlBody += `<p>${paraText}</p>\n`;
  }

  if (inList) {
    htmlBody += '</ul>\n';
  }

  const wordDocumentHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${docTitle}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
  size: 8.5in 11.0in;
  margin: 0.75in 0.75in 0.75in 0.75in;
  mso-header-margin: 0.5in;
  mso-footer-margin: 0.5in;
  mso-paper-source: 0;
}
div.Section1 {
  page: Section1;
}
body {
  font-family: 'Calibri', 'Arial', 'Segoe UI', sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  color: #1e293b;
  margin: 0;
}
h1 {
  font-size: 18pt;
  font-weight: bold;
  color: #0f172a;
  margin-top: 0;
  margin-bottom: 8pt;
  border-bottom: 2pt solid #0284c7;
  padding-bottom: 4pt;
}
h2 {
  font-size: 13pt;
  font-weight: bold;
  color: #0369a1;
  border-bottom: 1pt solid #cbd5e1;
  padding-bottom: 2pt;
  margin-top: 14pt;
  margin-bottom: 6pt;
  text-transform: uppercase;
  letter-spacing: 0.5pt;
}
h3 {
  font-size: 11.5pt;
  font-weight: bold;
  color: #1e293b;
  margin-top: 8pt;
  margin-bottom: 3pt;
}
p {
  margin-top: 0;
  margin-bottom: 6pt;
}
ul {
  margin-top: 2pt;
  margin-bottom: 6pt;
  padding-left: 20pt;
}
li {
  margin-bottom: 3pt;
}
</style>
</head>
<body>
<div class="Section1">
  ${htmlBody}
</div>
</body>
</html>
`;

  return new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/msword;charset=utf-8',
  });
}

/**
 * Triggers direct browser download of a PDF document.
 */
export function downloadAsPdf(filename, title, content) {
  try {
    const blob = generatePdfBlob(title, content);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFilename = (filename || 'Document')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    link.download = `${cleanFilename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF download:', err);
    return false;
  }
}

/**
 * Triggers direct browser download of a Word (.doc) document.
 */
export function downloadAsDoc(filename, title, content) {
  try {
    const blob = generateDocBlob(title, content);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFilename = (filename || 'Document')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    link.download = `${cleanFilename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (err) {
    console.error('Failed to generate Word document download:', err);
    return false;
  }
}
