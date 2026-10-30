import { isAxiosError } from "axios";
import { fmt } from "@/composables/useRefrendTableDisplay";
import type { DeactivationEffects, User } from "@/interfaces/user";

// sdd/retenciones-pendientes S7 (R7.3): deactivating a becario cancels its
// pending withholdings and advance payments. Helpers shared by the update
// dialog (confirmation), the persons store (toast) and 409 handling.

export const DEACTIVATION_CONFIRMATION = {
  title: "Desactivar usuario",
  body:
    "Al desactivar a este usuario se cancelarán sus retenciones pendientes y sus pagos adelantados. " +
    "Esta acción no se puede deshacer.",
};

const CYCLE_CUT_BLOCKED_FALLBACK =
  "No se pudo desactivar al usuario porque tiene pagos posteriores pagados o bloqueados.";

export const requiresDeactivationConfirmation = (
  current: Pick<User, "active" | "user_type" | "has_scholarship_profile">,
  form: { active: boolean },
): boolean => {
  const isBecario = current.user_type === "BEC_ACTIVE" || !!current.has_scholarship_profile;
  return isBecario && current.active && !form.active;
};

export const buildDeactivationSummary = (effects: DeactivationEffects | null | undefined): string | null => {
  if (!effects) return null;
  const { withholdings_cancelled: w, advance_months_cancelled: a, overpaid_amount } = effects;
  if (w <= 0 && a <= 0) return null;

  const parts: string[] = [];
  if (w > 0) parts.push(`${w} ${w === 1 ? "retención pendiente" : "retenciones pendientes"}`);
  if (a > 0) parts.push(`${a} ${a === 1 ? "mes" : "meses"} de pago adelantado`);

  // The verb agrees with the first item listed.
  const verb = (w > 0 ? w : a) === 1 ? "canceló" : "cancelaron";
  let text = `Se ${verb} ${parts.join(" y ")}.`;
  if (Number(overpaid_amount) > 0) text += ` Sobrepago a recuperar: ${fmt(overpaid_amount)}.`;
  return text;
};

export const getCycleCutBlockedMessage = (error: unknown): string | null => {
  if (!isAxiosError(error) || error.response?.status !== 409) return null;
  const data = error.response.data as { code?: string; msg?: string } | undefined;
  if (data?.code !== "CYCLE_CUT_BLOCKED") return null;
  return data.msg || CYCLE_CUT_BLOCKED_FALLBACK;
};
