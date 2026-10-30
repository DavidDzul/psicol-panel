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

// sdd/retenciones-pendientes S6 (R7.1): the cut no longer blocks on pending
// withholdings, it cancels them. Informational only — never gates confirm.
export interface CycleCutWithholdingWarning {
  text: string;
  rows: { id: number; label: string; amount: string; isCurrent: boolean }[];
  total: string;
}

const WITHHOLDING_WARNING_TEXT =
  "Al confirmar se cancelarán las retenciones pendientes de este becario. Esta acción no se puede deshacer.";

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const buildCycleCutWithholdingWarning = (
  preview: CycleCutPreview | null,
): CycleCutWithholdingWarning | null => {
  const toCancel = preview?.withholdings_to_cancel;
  if (!toCancel || toCancel.rows.length === 0) return null;

  const rows = [...toCancel.rows]
    .sort((a, b) => compare({ year: a.period_year, month: a.period_month }, { year: b.period_year, month: b.period_month }))
    .map((r) => ({
      id: r.id,
      label: `${capitalize(monthName(r.period_month))} ${r.period_year}`,
      amount: fmt(r.remaining_amount),
      isCurrent: r.is_current_refrend,
    }));

  return { text: WITHHOLDING_WARNING_TEXT, rows, total: fmt(toCancel.total_remaining) };
};
