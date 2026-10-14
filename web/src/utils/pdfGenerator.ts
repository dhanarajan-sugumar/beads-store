import jsPDF from 'jspdf';
import type { CartItem } from './cartStorage';

/**
 * Safely fetches an image and converts it to a base64 data URL.
 * Never throws — returns null on timeout, network error, or CORS rejection.
 */
export async function fetchImageAsDataUrl(url: string, timeoutMs = 4000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(timer);

    if (!response.ok) return null;

    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface GeneratedPdfResult {
  blob: Blob;
  fileName: string;
}

/**
 * Generates an A4 PDF order summary for WhatsApp sharing.
 */
export async function generateOrderPdf(
  shopName: string,
  items: CartItem[],
  grandTotal: number,
  customRefCode?: string
): Promise<GeneratedPdfResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Pre-fetch all images in parallel
  const itemImages = await Promise.all(
    items.map(async (item) => {
      if (!item.image_url) return null;
      return await fetchImageAsDataUrl(item.image_url);
    })
  );

  // 1. Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(161, 49, 72); // primary-700
  doc.text(shopName, margin, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Handcrafted Beads Jewellery — Order Catalogue', margin, currentY + 12);

  // Date and Order Reference
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(`Date: ${dateStr}`, pageWidth - margin, currentY + 6, { align: 'right' });
  const refCode = customRefCode || `MH-${Date.now().toString().slice(-6)}`;
  doc.text(`Ref: ${refCode}`, pageWidth - margin, currentY + 11, { align: 'right' });

  currentY += 18;

  // Header divider rule
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // 2. Table Column Positions
  const colImgX = margin;
  const colImgW = 16;
  const colNameX = margin + colImgW + 4;
  const colPriceX = 135;
  const colQtyX = 160;
  const colTotalX = pageWidth - margin;

  // Table Header Row
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, currentY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Item', colImgX + 2, currentY + 5);
  doc.text('Price (INR)', colPriceX, currentY + 5, { align: 'right' });
  doc.text('Qty', colQtyX, currentY + 5, { align: 'center' });
  doc.text('Total (INR)', colTotalX - 2, currentY + 5, { align: 'right' });

  currentY += 10;

  // 3. Table Rows
  items.forEach((item, index) => {
    // Pagination check: if near bottom, create new page
    if (currentY + 22 > pageHeight - margin - 35) {
      doc.addPage();
      currentY = margin;

      // Repeat table header on new page
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, currentY, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('Item', colImgX + 2, currentY + 5);
      doc.text('Price (INR)', colPriceX, currentY + 5, { align: 'right' });
      doc.text('Qty', colQtyX, currentY + 5, { align: 'center' });
      doc.text('Total (INR)', colTotalX - 2, currentY + 5, { align: 'right' });
      currentY += 10;
    }

    const rowStartY = currentY;
    const imageDataUrl = itemImages[index];

    // Image thumbnail or placeholder
    if (imageDataUrl) {
      try {
        doc.addImage(imageDataUrl, 'JPEG', colImgX, rowStartY, 14, 14);
      } catch {
        // Fallback placeholder box
        doc.setFillColor(240, 240, 240);
        doc.rect(colImgX, rowStartY, 14, 14, 'F');
      }
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(colImgX, rowStartY, 14, 14, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text('No img', colImgX + 2, rowStartY + 8);
    }

    // Product Title (with word wrap and SKU if present)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const displayName = item.sku ? `[${item.sku}] ${item.name}` : item.name;
    const maxNameWidth = colPriceX - colNameX - 4;
    const splitTitle = doc.splitTextToSize(displayName, maxNameWidth);
    doc.text(splitTitle, colNameX, rowStartY + 5);

    // Unit Price
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Rs. ${item.price_inr.toLocaleString('en-IN')}`, colPriceX, rowStartY + 5, {
      align: 'right',
    });

    // Quantity
    doc.text(`${item.quantity}`, colQtyX, rowStartY + 5, { align: 'center' });

    // Line Total
    const lineTotal = item.price_inr * item.quantity;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Rs. ${lineTotal.toLocaleString('en-IN')}`, colTotalX - 2, rowStartY + 5, {
      align: 'right',
    });

    const rowHeight = Math.max(18, splitTitle.length * 4.5 + 8);
    currentY = rowStartY + rowHeight;

    // Row separator line
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
  });

  currentY += 4;

  // 4. Totals and Summary Box
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;

  doc.setFillColor(253, 244, 245); // primary-50
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, 22, 2, 2, 'F');
  doc.setDrawColor(240, 181, 191); // primary-300
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(115, 41, 56);
  doc.text('Total Items:', summaryBoxX + 6, currentY + 7);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  doc.text(`${totalItemCount}`, summaryBoxX + summaryBoxWidth - 6, currentY + 7, {
    align: 'right',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(161, 49, 72);
  doc.text('Grand Total:', summaryBoxX + 6, currentY + 16);
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, summaryBoxX + summaryBoxWidth - 6, currentY + 16, {
    align: 'right',
  });

  currentY += 32;

  // 5. Order Instructions & Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Please share this PDF directly with Madhis Handcrafts on WhatsApp to confirm piece availability and payment.',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `Thank you for supporting handcrafted family art! • ${shopName}`,
    pageWidth / 2,
    currentY + 5,
    { align: 'center' }
  );

  const fileName = `Order-${shopName.replace(/\s+/g, '-')}-${refCode}.pdf`;
  const blob = doc.output('blob');

  return { blob, fileName };
}
