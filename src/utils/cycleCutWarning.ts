import type { CycleCutPreview } from "@/interfaces/scholarship";
import { fmt, MONTHS_ES } from "@/composables/useRefrendTableDisplay";

// sdd/revertir-pago-adelantado S10 (R21): Spanish (Mexican "tú") warning shown
// in the Baja/Egresado dialogs when the cut will cancel advance months.

type Period = { year: number; month: number };

const monthName = (month: number): string => (MONTHS_ES[month - 1] ?? String(month)).toLowerCase();

const joinList = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

const compare = (a: Period, b: Period): number => a.year - b.year || a.month - b.month;

export const buildCycleCutAdvanceWarning = (preview: CycleCutPreview | null): string | null => {
  const months = preview?.advance?.months ?? [];
  if (!preview || months.length === 0) return null;

  const periods: Period[] = months
    .map((m) => ({ year: m.period_year, month: m.period_month }))
    .sort(compare);
  const origins = [...preview.advance.origins].sort((a, b) =>
    compare(
      { year: a.origin_period_year, month: a.origin_period_month },
      { year: b.origin_period_year, month: b.origin_period_month },
    ),
  );

  const years = new Set([
    ...periods.map((p) => p.year),
    ...origins.map((o) => o.origin_period_year),
  ]);
  const withYear = years.size > 1;
  const label = (p: Period): string => (withYear ? `${monthName(p.month)} de ${p.year}` : monthName(p.month));

  const names = periods.map(label);
  const head =
    periods.length === 1
      ? `Al confirmar se cancelará el mes adelantado ${names[0]}.`
      : `Al confirmar se cancelarán los meses adelantados ${joinList(names)}.`;

  const tails = origins.map((o) => {
    const originLabel = label({ year: o.origin_period_year, month: o.origin_period_month });
    return o.origin_paid
      ? `Como el pago de ${originLabel} ya se realizó, quedará registrado un sobrepago de ${fmt(o.overpaid_amount)} que administración deberá recuperar.`
      : `Como el pago de ${originLabel} aún no se realiza, se descontarán ${fmt(o.advance_payment_reduction)} del pago adelantado de ese mes.`;
  });

  return [head, ...tails].join(" ");
};
