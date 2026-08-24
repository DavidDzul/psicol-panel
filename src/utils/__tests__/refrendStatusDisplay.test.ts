import { describe, expect, it } from "vitest";

import type { RefrendStatus } from "@/interfaces/scholarship";
import {
  refrendStatusColor,
  refrendStatusLabel,
} from "@/utils/refrendStatusDisplay";

const EXPECTED: Record<RefrendStatus, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "grey" },
  ATENCION_REVIEW: { label: "Rev. Atención", color: "blue" },
  PEDAGOGIA_REVIEW: { label: "Rev. Pedagogía", color: "purple" },
  AUTHORIZED: { label: "Autorizado", color: "green" },
  PAID: { label: "Pagado", color: "teal" },
  WITHHELD: { label: "Retenido", color: "orange" },
  CANCELLED: { label: "Cancelado", color: "red" },
};

describe("refrendStatusDisplay", () => {
  it.each(Object.keys(EXPECTED) as RefrendStatus[])(
    "returns the correct label and color for %s",
    (status) => {
      expect(refrendStatusLabel(status)).toBe(EXPECTED[status].label);
      expect(refrendStatusColor(status)).toBe(EXPECTED[status].color);
    },
  );
});
