// @ts-ignore
import html2pdf from 'html2pdf.js';

/**
 * Sanitizes any color string by converting oklch/lab colors to standard hex/rgb
 * using the browser's 2D canvas context parser.
 */
function sanitizeOklchColors(doc: Document) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    const convertColorStr = (str: string): string => {
      if (!str || typeof str !== 'string' || !str.includes('oklch')) return str;
      return str.replace(/oklch\([^)]+\)/gi, (match) => {
        if (!ctx) return '#1e293b';
        try {
          ctx.fillStyle = '#000000';
          ctx.fillStyle = match;
          return ctx.fillStyle || '#1e293b';
        } catch {
          return '#1e293b';
        }
      });
    };

    // 1. Sanitize all <style> elements
    doc.querySelectorAll('style').forEach((styleTag) => {
      if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
        styleTag.textContent = convertColorStr(styleTag.textContent);
      }
    });

    // 2. Sanitize inline styles on all elements
    doc.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        for (let i = 0; i < htmlEl.style.length; i++) {
          const propName = htmlEl.style[i];
          const val = htmlEl.style.getPropertyValue(propName);
          if (val && val.includes('oklch')) {
            htmlEl.style.setProperty(propName, convertColorStr(val));
          }
        }
      }
    });
  } catch (err) {
    console.warn('oklch color sanitization skipped:', err);
  }
}

/**
 * Generates and downloads an official high-resolution PDF.
 * If htmlContent is provided, renders via an isolated iframe with pure standard CSS (zero oklch).
 * Otherwise renders from the DOM element with automated onclone color sanitization.
 */
export async function exportToPdf(
  elementId: string,
  filename: string,
  htmlContent?: string
): Promise<boolean> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const baseOpt = {
    margin: [4, 4, 4, 4] as [number, number, number, number],
    filename: safeFilename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        sanitizeOklchColors(clonedDoc);
      }
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const
    }
  };

  // Method 1: If standalone HTML is provided, render in an isolated clean iframe (100% immune to Tailwind oklch)
  if (htmlContent) {
    let iframe: HTMLIFrameElement | null = null;
    try {
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-10000px';
      iframe.style.top = '0';
      iframe.style.width = '1000px';
      iframe.style.height = '1400px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Allow layout and webfonts to settle
        await new Promise((res) => setTimeout(res, 150));

        const target = (doc.querySelector('.container') as HTMLElement) || doc.body;
        await html2pdf().set(baseOpt).from(target).save();
        document.body.removeChild(iframe);
        return true;
      }
    } catch (err) {
      console.warn('Isolated iframe PDF export encountered an issue, falling back to DOM capture:', err);
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }

  // Method 2: Fallback to DOM element with oklch sanitizer
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    await html2pdf().set(baseOpt).from(element).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF from DOM element:', error);
    return false;
  }
}

/**
 * Generates an actual PDF Blob & File from the printable DOM element.
 * Perfect for sharing with PDF readers, WhatsApp documents, and system share sheets.
 */
export async function generatePdfBlob(
  elementId: string,
  filename: string,
  htmlContent?: string
): Promise<{ blob: Blob; file: File; url: string } | null> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const baseOpt = {
    margin: [4, 4, 4, 4] as [number, number, number, number],
    filename: safeFilename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        sanitizeOklchColors(clonedDoc);
      }
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const
    }
  };

  // If standalone HTML is provided, render in an isolated clean iframe
  if (htmlContent) {
    let iframe: HTMLIFrameElement | null = null;
    try {
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-10000px';
      iframe.style.top = '0';
      iframe.style.width = '1000px';
      iframe.style.height = '1400px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        await new Promise((res) => setTimeout(res, 180));

        const target = (doc.querySelector('.container') as HTMLElement) || doc.body;
        const worker = html2pdf().set(baseOpt).from(target);
        let blob: Blob;
        try {
          blob = await worker.output('blob');
        } catch {
          blob = await worker.outputPdf('blob');
        }

        document.body.removeChild(iframe);

        if (!blob) throw new Error('PDF output returned empty blob');
        const file = new File([blob], safeFilename, { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        return { blob, file, url };
      }
    } catch (err) {
      console.warn('Isolated iframe Blob export fallback:', err);
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }

  // Fallback to DOM element
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  try {
    const worker = html2pdf().set(baseOpt).from(element);
    let blob: Blob;
    try {
      blob = await worker.output('blob');
    } catch {
      blob = await worker.outputPdf('blob');
    }

    if (!blob) {
      throw new Error('PDF blob generation returned empty');
    }

    const file = new File([blob], safeFilename, { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return { blob, file, url };
  } catch (error) {
    console.error('Error in generatePdfBlob:', error);
    return null;
  }
}
