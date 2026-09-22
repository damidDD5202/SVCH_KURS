import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import type { Response } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BRAND = {
  primary: "#4f46e5",
  dark: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  accent: "#10b981",
  headerText: "#ffffff",
};

type TableRow = { cols: string[]; bold?: boolean };

export type ReportPdfOptions = {
  filename: string;
  title: string;
  subtitle: string;
  periodLabel: string;
  kpis: Array<{ label: string; value: string }>;
  tableHeaders: string[];
  tableRows: TableRow[];
  footerNote?: string;
  bars?: Array<{ label: string; value: number; unit?: string }>;
  inline?: boolean;
};

function resolveFontFiles(): { regular: string; bold: string } {
  const assetsDir = path.join(__dirname, "../../assets/fonts");
  const candidates: Array<{ regular: string; bold: string }> = [
    {
      regular: path.join(assetsDir, "DejaVuSans.ttf"),
      bold: path.join(assetsDir, "DejaVuSans-Bold.ttf"),
    },
    {
      regular: "C:/Windows/Fonts/arial.ttf",
      bold: "C:/Windows/Fonts/arialbd.ttf",
    },
    {
      regular: "C:/Windows/Fonts/segoeui.ttf",
      bold: "C:/Windows/Fonts/segoeuib.ttf",
    },
  ];
  for (const c of candidates) {
    if (fs.existsSync(c.regular)) return c;
  }
  throw new Error(
    "Не найден шрифт для PDF. Положите DejaVuSans.ttf в server/assets/fonts/ или запускайте на Windows.",
  );
}

function formatDate(d: Date) {
  return d.toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });
}

function registerFonts(doc: InstanceType<typeof PDFDocument>) {
  const fonts = resolveFontFiles();
  doc.registerFont("ReportRegular", fonts.regular);
  doc.registerFont("ReportBold", fs.existsSync(fonts.bold) ? fonts.bold : fonts.regular);
}

function drawBars(
  doc: InstanceType<typeof PDFDocument>,
  margin: number,
  contentW: number,
  y: number,
  bars: Array<{ label: string; value: number; unit?: string }>,
) {
  if (bars.length === 0) return y;

  doc.font("ReportBold").fontSize(12).fillColor(BRAND.dark).text("Диаграмма", margin, y);
  y += 22;

  const max = Math.max(...bars.map((b) => b.value), 1);
  const barMaxW = contentW - 180;

  for (const bar of bars.slice(0, 8)) {
    const w = Math.max(4, (bar.value / max) * barMaxW);
    doc.font("ReportRegular").fontSize(9).fillColor(BRAND.muted).text(bar.label, margin, y + 4, {
      width: 140,
      ellipsis: true,
    });
    doc.roundedRect(margin + 150, y, barMaxW, 14, 3).fill("#f1f5f9");
    doc.roundedRect(margin + 150, y, w, 14, 3).fill(BRAND.primary);
    doc
      .font("ReportBold")
      .fontSize(9)
      .fillColor(BRAND.dark)
      .text(`${bar.value.toFixed(1)}${bar.unit ?? ""}`, margin + 150 + barMaxW + 8, y + 3);
    y += 22;
  }
  return y + 8;
}

export function sendStyledPdf(res: Response, opts: ReportPdfOptions) {
  const disposition = opts.inline !== false ? "inline" : "attachment";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${opts.filename}"`);

  const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
  doc.pipe(res);
  registerFonts(doc);

  const pageW = doc.page.width;
  const margin = 48;
  const contentW = pageW - margin * 2;

  doc.rect(0, 0, pageW, 100).fill(BRAND.primary);
  doc.font("ReportBold").fillColor(BRAND.headerText).fontSize(20).text(opts.title, margin, 30, { width: contentW });
  doc.font("ReportRegular").fontSize(11).fillColor(BRAND.headerText).text(opts.subtitle, margin, 58, { width: contentW });
  doc
    .fontSize(9)
    .text("Платформа коворкинга · отчёт для менеджмента", margin, 78, { width: contentW });

  let y = 118;
  doc.font("ReportRegular").fillColor(BRAND.muted).fontSize(10).text(`Период: ${opts.periodLabel}`, margin, y);
  y += 16;
  doc.fontSize(9).text(`Сформирован: ${formatDate(new Date())}`, margin, y);
  y += 28;

  const kpiCount = Math.min(opts.kpis.length, 3);
  const kpiW = (contentW - (kpiCount - 1) * 10) / kpiCount;
  opts.kpis.slice(0, 3).forEach((kpi, i) => {
    const x = margin + i * (kpiW + 10);
    doc.roundedRect(x, y, kpiW, 56, 8).fillColor("#ffffff").fill();
    doc.roundedRect(x, y, kpiW, 56, 8).lineWidth(1).strokeColor(BRAND.line).stroke();
    doc.font("ReportRegular").fillColor(BRAND.muted).fontSize(9).text(kpi.label, x + 12, y + 12, { width: kpiW - 24 });
    doc.font("ReportBold").fillColor(BRAND.dark).fontSize(15).text(kpi.value, x + 12, y + 30, { width: kpiW - 24 });
  });
  y += 72;

  if (opts.bars && opts.bars.length > 0) {
    y = drawBars(doc, margin, contentW, y, opts.bars);
    y += 12;
  }

  const colCount = opts.tableHeaders.length;
  const colW = contentW / colCount;
  doc.roundedRect(margin, y, contentW, 30, 4).fill(BRAND.dark);
  opts.tableHeaders.forEach((h, i) => {
    doc.font("ReportBold").fillColor(BRAND.headerText).fontSize(10).text(h, margin + i * colW + 10, y + 10, {
      width: colW - 16,
    });
  });
  y += 34;

  opts.tableRows.forEach((row, idx) => {
    const rowH = 28;
    if (y > doc.page.height - 90) {
      doc.addPage();
      y = margin;
    }
    if (idx % 2 === 0) {
      doc.rect(margin, y - 2, contentW, rowH).fill("#f8fafc");
    }
    const font = row.bold ? "ReportBold" : "ReportRegular";
    doc.font(font).fillColor(row.bold ? BRAND.dark : BRAND.muted).fontSize(row.bold ? 11 : 10);
    row.cols.forEach((cell, i) => {
      doc.text(cell, margin + i * colW + 10, y + 7, { width: colW - 16, ellipsis: true });
    });
    y += rowH;
  });

  y += 14;
  if (opts.footerNote) {
    doc.font("ReportRegular").fillColor(BRAND.muted).fontSize(9).text(opts.footerNote, margin, y, { width: contentW });
  }

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .font("ReportRegular")
      .fillColor(BRAND.muted)
      .fontSize(8)
      .text(`Платформа коворкинга · стр. ${i + 1} из ${range.count}`, margin, doc.page.height - 36, {
        width: contentW,
        align: "center",
      });
  }

  doc.end();
}

export function formatPeriodRu(from: Date, to: Date) {
  const f = from.toLocaleDateString("ru-RU");
  const t = to.toLocaleDateString("ru-RU");
  return `${f} — ${t}`;
}
