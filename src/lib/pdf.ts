/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures an HTML element and exports it as a multi-page, crisp vector A4 PDF.
 */
export const exportElementToPDF = async (
  elementId: string, 
  filename: string = 'clinical-assessment.pdf',
  onProgress?: (active: boolean) => void
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export error: Target element #${elementId} not found.`);
    return;
  }

  try {
    if (onProgress) onProgress(true);

    // Save previous styles if needed
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    
    // Temporarily expand the element so html2canvas extracts all of its hidden contents
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      scale: 2.2, // 2.2x scale provides crisp, high-definition readable text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Restore original styles
    element.style.maxHeight = originalMaxHeight;
    element.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // standard A4 width
    const pageHeight = 297; // standard A4 height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Multi-page splitting logic
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    if (onProgress) onProgress(false);
  }
};
