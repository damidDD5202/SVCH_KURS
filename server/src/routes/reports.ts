import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { formatPeriodRu, sendStyledPdf } from "../lib/reportPdf.js";

export const reportsRouter = Router();

const PeriodQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  download: z.enum(["0", "1"]).optional(),
});

function parsePeriod(parsed: z.infer<typeof PeriodQuery>, defaultDays: number) {
  const from = parsed.from ? new Date(parsed.from) : new Date(Date.now() - defaultDays * 24 * 60 * 60 * 1000);
  const to = parsed.to ? new Date(parsed.to) : new Date();
  const inline = parsed.download !== "1";
  return { from, to, inline };
}

async function utilizationByResource(from: Date, to: Date) {
  const bookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED", startAt: { gte: from }, endAt: { lte: to } },
    include: { resource: { include: { location: true, type: true } } },
  });

  const byResource = new Map<string, { label: string; hours: number; city: string; type: string }>();
  for (const b of bookings) {
    const ms = b.endAt.getTime() - b.startAt.getTime();
    const hours = Math.max(0, ms / (1000 * 60 * 60));
    const key = b.resourceId;
    const label = b.resource.name;
    const cur = byResource.get(key) ?? {
      label,
      hours: 0,
      city: b.resource.location.city,
      type: b.resource.type.name,
    };
    cur.hours += hours;
    byResource.set(key, cur);
  }

  return {
    rows: Array.from(byResource.values()).sort((a, b) => b.hours - a.hours),
    bookingsCount: bookings.length,
  };
}

reportsRouter.get(
  "/reports/utilization-chart",
  requireAuth,
  requireRole(["MANAGER", "ADMIN"]),
  async (req, res) => {
    const parsed = PeriodQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", issues: parsed.error.issues });
      return;
    }
    const { from, to } = parsePeriod(parsed.data, 7);
    const { rows } = await utilizationByResource(from, to);
    const points = rows.slice(0, 12).map((r) => ({ label: r.label, hours: r.hours }));
    res.json({ from: from.toISOString(), to: to.toISOString(), points });
  },
);

reportsRouter.get(
  "/reports/utilization.pdf",
  requireAuth,
  requireRole(["MANAGER", "ADMIN"]),
  async (req, res) => {
    const parsed = PeriodQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", issues: parsed.error.issues });
      return;
    }

    const { from, to, inline } = parsePeriod(parsed.data, 7);
    const { rows, bookingsCount } = await utilizationByResource(from, to);
    const totalHours = rows.reduce((s, r) => s + r.hours, 0);
    const top = rows.slice(0, 15);

    sendStyledPdf(res, {
      filename: "otchet-zagruzka.pdf",
      inline,
      title: "Отчёт по загрузке ресурсов",
      subtitle: "Аналитика бронирований и занятости рабочих мест",
      periodLabel: formatPeriodRu(from, to),
      kpis: [
        { label: "Подтверждённых броней", value: String(bookingsCount) },
        { label: "Суммарно часов", value: totalHours.toFixed(1) },
        { label: "Уникальных ресурсов", value: String(rows.length) },
      ],
      bars: top.slice(0, 6).map((r) => ({ label: r.label, value: r.hours, unit: " ч" })),
      tableHeaders: ["№", "Ресурс", "Город", "Тип", "Часы"],
      tableRows: top.map((r, i) => ({
        cols: [String(i + 1), r.label, r.city, r.type, r.hours.toFixed(1)],
      })),
      footerNote:
        "Данные по подтверждённым бронированиям за выбранный период. Отчёт сформирован автоматически платформой коворкинга.",
    });
  },
);

reportsRouter.get(
  "/reports/revenue.pdf",
  requireAuth,
  requireRole(["MANAGER", "ADMIN"]),
  async (req, res) => {
    const parsed = PeriodQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query", issues: parsed.error.issues });
      return;
    }

    const { from, to, inline } = parsePeriod(parsed.data, 30);

    const payments = await prisma.payment.findMany({
      where: { status: "PAID", createdAt: { gte: from, lte: to } },
      include: { booking: { include: { resource: { include: { location: true, type: true } } } } },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const byLocation = new Map<string, { name: string; city: string; amount: number; count: number }>();
    for (const p of payments) {
      const loc = p.booking.resource.location;
      const key = loc.id;
      const cur = byLocation.get(key) ?? { name: loc.name, city: loc.city, amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += 1;
      byLocation.set(key, cur);
    }

    const sorted = Array.from(byLocation.values()).sort((a, b) => b.amount - a.amount);
    const avgCheck = payments.length ? Math.round(total / payments.length) : 0;

    sendStyledPdf(res, {
      filename: "otchet-vyruchka.pdf",
      inline,
      title: "Финансовый отчёт",
      subtitle: "Выручка по локациям и платежам за период",
      periodLabel: formatPeriodRu(from, to),
      kpis: [
        { label: "Всего платежей", value: String(payments.length) },
        { label: "Выручка, Br", value: String(total) },
        { label: "Средний чек, Br", value: String(avgCheck) },
      ],
      bars: sorted.slice(0, 6).map((l) => ({
        label: `${l.city} · ${l.name}`,
        value: l.amount,
        unit: " Br",
      })),
      tableHeaders: ["№", "Локация", "Город", "Платежей", "Сумма, Br"],
      tableRows: [
        ...sorted.map((l, i) => ({
          cols: [String(i + 1), l.name, l.city, String(l.count), String(l.amount)],
        })),
        { cols: ["", "Итого", "", String(payments.length), String(total)], bold: true },
      ],
      footerNote: "Учитываются только оплаченные платежи (статус PAID). Суммы указаны в белорусских рублях (Br).",
    });
  },
);
