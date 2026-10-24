import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentRecord } from '../types/student';
import { getDisplayImageUrl } from './driveUtils';

const A4_W_MM = 210;
const A4_H_MM = 297;
const PAGE_W_PX = 794; // A4 width at 96 DPI
const PAGE_H_PX = 1123; // A4 height at 96 DPI

/** Prevents broken layout / injection from student-provided text. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Waits for web fonts so measurements are final before capture. */
async function waitForFonts(): Promise<void> {
  try {
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  } catch {
    /* ignore */
  }
}

/** Splits a tall canvas across as many A4 pages as needed. */
function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement): void {
  const pxPerPage = Math.floor((canvas.width * A4_H_MM) / A4_W_MM);
  let y = 0;
  let first = true;

  while (y < canvas.height) {
    const sliceH = Math.min(pxPerPage, canvas.height - y);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceH;

    const ctx = slice.getContext('2d');
    if (!ctx) break;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    if (!first) pdf.addPage();
    pdf.addImage(
      slice.toDataURL('image/png'),
      'PNG',
      0,
      0,
      A4_W_MM,
      (sliceH * A4_W_MM) / canvas.width
    );

    y += sliceH;
    first = false;
  }
}

export interface PreparedPdfResult {
  filename: string;
  download: () => void;
}

/**
 * Prepares an official PDF Verification Document object for an individual student without auto-triggering download.
 */
export async function prepareStudentPdfObject(
  student: StudentRecord,
  onProgress?: (percent: number) => void
): Promise<PreparedPdfResult> {
  onProgress?.(15);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${PAGE_W_PX}px`;
  container.style.height = `${PAGE_H_PX}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = "'Inter', Arial, sans-serif";
  container.style.boxSizing = 'border-box';
  container.style.color = '#0f172a';

  const passportImgSrc = student.passportPhotoUrl
    ? getDisplayImageUrl(student.passportPhotoUrl, true)
    : '';
  const blazerImgSrc = student.blazerPhotoUrl
    ? getDisplayImageUrl(student.blazerPhotoUrl, true)
    : '';

  // Formatted Year & Class: SY MCA - A
  const formattedClass = `${student.currentYear} ${student.department} - ${student.division}`;

  onProgress?.(30);

  // Shared style fragments
  const labelStyle =
    'font-size: 10px; line-height: 14px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px;';
  const cellBase =
    'height: 64px; padding: 0 18px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;';
  const monoNoLig =
    "font-family: 'Courier New', monospace; font-variant-ligatures: none; font-feature-settings: 'liga' 0, 'calt' 0;";

  const photoCard = (
    title: string,
    tag: string,
    tagBg: string,
    tagColor: string,
    imgSrc: string,
    emptyText: string,
    formatText: string
  ) => `
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; box-sizing: border-box; height: 100%;">
      <!-- Card header -->
      <div style="height: 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 14px; box-sizing: content-box;">
        <div style="display: flex; align-items: center; gap: 8px; height: 24px;">
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; line-height: 22px;">${title}</div>
        </div>
        <div style="${monoNoLig} height: 20px; padding: 0 8px; border-radius: 4px; background: ${tagBg}; color: ${tagColor}; font-size: 9px; font-weight: 700; line-height: 20px; text-align: center;">${tag}</div>
      </div>

      <!-- Photo frame -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0;">
        <div style="width: 230px; height: 100%; max-height: 400px; border: 2px dashed #cbd5e1; border-radius: 8px; background: #f8fafc; padding: 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; overflow: hidden;">
          ${
            imgSrc
              ? `<img src="${imgSrc}" crossorigin="anonymous" style="display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; margin: auto;" />`
              : `<div style="display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px; font-style: italic;">${emptyText}</div>`
          }
        </div>
      </div>

      <!-- Card footer -->
      <div style="margin-top: 12px; text-align: center; font-size: 11px; line-height: 16px; color: #64748b; font-weight: 500;">
        <span style="color: #94a3b8;">Format:</span> ${formatText}
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="width: ${PAGE_W_PX}px; height: ${PAGE_H_PX}px; padding: 24px; box-sizing: border-box; background: #ffffff;">
      <div style="width: 100%; height: 100%; background: #ffffff; color: #1e293b; font-family: 'Inter', Arial, sans-serif; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column;">

        <!-- Top Decorative Academic Ribbon -->
        <div style="height: 8px; width: 100%; flex-shrink: 0; background: linear-gradient(90deg, #060B14 0%, #1e3a8a 50%, #f59e0b 100%);"></div>

        <!-- Main content -->
        <div style="flex: 1; min-height: 0; padding: 30px 36px 24px 36px; display: flex; flex-direction: column; gap: 24px; box-sizing: border-box;">

          <!-- Dossier Header -->
          <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; flex-shrink: 0;">
            <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 26px; line-height: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; color: #0f1d36;">
              Placement Celebration Record
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 18px; color: #64748b; font-weight: 500;">
              Official Student Credential &amp; Photo Dossier
            </p>
          </div>

          <!-- Candidate Identification Record -->
          <div style="border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff; flex-shrink: 0;">

            <!-- Card header bar -->
            <div style="height: 40px; background: linear-gradient(90deg, #0A1324 0%, #060B14 100%); padding: 0 18px; display: flex; justify-content: space-between; align-items: center; color: #ffffff; box-sizing: border-box;">
              <div style="font-size: 11px; line-height: 40px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                Candidate Identification Record
              </div>
            </div>

            <!-- One grid => rows line up across both columns -->
            <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: 64px 64px 64px; background: #ffffff;">

              <!-- Row 1 -->
              <div style="${cellBase} border-right: 1px solid #e2e8f0; border-bottom: 1px solid #f1f5f9;">
                <div style="${labelStyle}">Full Name</div>
                <div style="font-size: 15px; line-height: 22px; font-weight: 800; color: #0f172a; margin-top: 2px;">${esc(student.fullName)}</div>
              </div>
              <div style="${cellBase} border-bottom: 1px solid #f1f5f9;">
                <div style="${labelStyle}">PRN (Permanent Registration No.)</div>
                <div style="${monoNoLig} font-size: 15px; line-height: 22px; font-weight: 800; color: #2563eb; margin-top: 2px; letter-spacing: 0.5px;">${esc(student.prn)}</div>
              </div>

              <!-- Row 2 -->
              <div style="${cellBase} border-right: 1px solid #e2e8f0; border-bottom: 1px solid #f1f5f9;">
                <div style="${labelStyle}">Year &amp; Class</div>
                ${esc(formattedClass)}
              </div>
              <div style="${cellBase} border-bottom: 1px solid #f1f5f9;">
                <div style="${labelStyle}">Email Address</div>
                <div style="font-size: 13px; line-height: 22px; font-weight: 600; color: #1e293b; margin-top: 2px; word-break: break-all;">${esc(student.email)}</div>
              </div>

              <!-- Row 3 -->
              <div style="${cellBase} border-right: 1px solid #e2e8f0;">
                <div style="${labelStyle}">Submission Date</div>
                <div style="${monoNoLig} font-size: 13px; line-height: 22px; color: #334155; margin-top: 2px; font-weight: 700;">${esc(student.timestamp)}</div>
              </div>
              <div style="${cellBase} background: #f8fafc;">
                <div style="${labelStyle}">Placement Board Authorization</div>
                <div style="${monoNoLig} font-size: 11px; line-height: 22px; color: #475569; margin-top: 2px; font-weight: 700;">Official Dossier Certified &amp; Recorded</div>
              </div>
            </div>
          </div>

          <!-- Submitted Photographs Section -->
          <div style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
            <div style="height: 22px; display: flex; align-items: center; margin-bottom: 14px; flex-shrink: 0;">
              <div style="font-size: 14px; line-height: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
                Submitted Photographs
              </div>
            </div>

            <div style="flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px;">
              ${photoCard('Passport Size Photo', 'Standard', '#f1f5f9', '#475569', passportImgSrc, 'No Passport Photo', 'Official Passport Standard')}
              ${photoCard('Creative Photo', 'Uniform', '#eff6ff', '#1d4ed8', blazerImgSrc, 'No Creative Photo', 'Plain Background &amp; Uniform')}
            </div>
          </div>

          <!-- Dossier Footer -->
          <div style="flex-shrink: 0; border-top: 1px solid #e2e8f0; padding-top: 12px; height: 32px; box-sizing: content-box; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <div style="display: flex; align-items: center; gap: 6px; height: 20px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="4 12 10 18 20 6"></polyline></svg>
              <span style="line-height: 20px;">Verification Status:</span>
              <span style="line-height: 20px; color: #15803d; font-weight: 700;">VERIFIED RECORD</span>
            </div>
            <div style="line-height: 20px;">Generated: ${esc(new Date().toLocaleDateString())}</div>
          </div>
        </div>

        <!-- Bottom Authority Strip -->
        <div style="flex-shrink: 0; height: 36px; background: #0A1324; color: #94a3b8; padding: 0 36px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1e293b; box-sizing: border-box;">
          <span style="line-height: 36px;">Placement Cell &amp; Corporate Relations Council • Official Electronic Record</span>
          <span style="${monoNoLig} line-height: 36px; font-size: 10px;">Strictly Confidential</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    onProgress?.(45);
    await waitForFonts();
    onProgress?.(65);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: PAGE_W_PX,
      height: PAGE_H_PX,
      windowWidth: PAGE_W_PX,
      windowHeight: PAGE_H_PX,
      scrollX: 0,
      scrollY: 0,
    });

    onProgress?.(90);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, A4_W_MM, A4_H_MM);
    const filename = `Student_Profile_${student.prn}_${student.fullName.replace(/\s+/g, '_')}.pdf`;
    onProgress?.(100);

    return {
      filename,
      download: () => pdf.save(filename),
    };
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Generates an official PDF Verification Document for an individual student (auto-saves).
 */
export async function generateStudentPdf(
  student: StudentRecord,
  onProgress?: (percent: number) => void
): Promise<void> {
  const prepared = await prepareStudentPdfObject(student, onProgress);
  prepared.download();
}

/**
 * Generates a batch PDF catalog for multiple filtered students.
 */
export async function generateBatchCatalogPdf(
  students: StudentRecord[],
  filterTitle = 'All Students',
  onProgress?: (percent: number) => void
): Promise<void> {
  onProgress?.(15);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${PAGE_W_PX}px`;
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = "'Inter', Arial, sans-serif";

  const cell =
    'padding: 0 8px; height: 36px; text-align: center; vertical-align: middle; line-height: 16px;';

  const photoStatus = (ok: boolean, okLabel: string) =>
    ok
      ? `<span style="color:#16a34a; font-weight:700;">&#10003; ${okLabel}</span>`
      : `<span style="color:#dc2626; font-weight:600;">&#10007; Missing</span>`;

  const studentRowsHtml = students
    .map(
      (s, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
      <td style="${cell} color: #64748b;">${idx + 1}</td>
      <td style="${cell} font-weight: 700; color: #1e293b;">${esc(s.prn)}</td>
      <td style="${cell} font-weight: 600; color: #0f172a;">${esc(s.fullName)}</td>
      <td style="${cell} font-weight: 700; color: #2563eb; white-space: nowrap;">${esc(s.currentYear)} ${esc(s.department)} - ${esc(s.division)}</td>
      <td style="${cell} font-size: 10px; white-space: nowrap;">
        ${photoStatus(!!s.passportPhotoUrl, 'Passport')}
        <span style="color:#cbd5e1; padding: 0 6px;">|</span>
        ${photoStatus(!!s.blazerPhotoUrl, 'Creative')}
      </td>
    </tr>
  `
    )
    .join('');

  const headCell =
    'padding: 0 8px; height: 34px; text-align: center; vertical-align: middle; line-height: 16px;';

  onProgress?.(35);

  container.innerHTML = `
    <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; background: #ffffff; box-sizing: border-box;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; line-height: 26px; font-weight: 800; color: #1e3a8a;">STUDENT DOCUMENT CATALOG &amp; VERIFICATION SUMMARY</h2>
        <div style="font-size: 12px; line-height: 18px; color: #64748b; margin-top: 4px;">Filter Context: <strong>${esc(filterTitle)}</strong> | Total Records: <strong>${students.length}</strong></div>
      </div>

      <table style="width: 100%; border-collapse: collapse; table-layout: auto;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase;">
            <th style="${headCell}">#</th>
            <th style="${headCell}">PRN</th>
            <th style="${headCell}">Student Name</th>
            <th style="${headCell}">Year, Class &amp; Division</th>
            <th style="${headCell}">Submitted Photos</th>
          </tr>
        </thead>
        <tbody>
          ${studentRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);

  try {
    onProgress?.(55);
    await waitForFonts();
    onProgress?.(70);

    const canvas = await html2canvas(container, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    onProgress?.(85);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    addCanvasToPdf(pdf, canvas);
    onProgress?.(98);
    pdf.save(`Student_Catalog_${filterTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
    onProgress?.(100);
  } catch (err) {
    console.error('Failed to generate batch catalog PDF:', err);
  } finally {
    document.body.removeChild(container);
  }
}