import { describe, expect, it } from "vitest";
import {
  SITUATION_MENU_ITEMS,
  visibleSituationMenuItems,
  type SituationMenuItem,
} from "@/composables/useSituationMenuItems";

describe("visibleSituationMenuItems", () => {
  it("excludes SIN_PAGO from the default catalog (promoted to a RefrendSituationBar quick action instead)", () => {
    const visible = visibleSituationMenuItems();

    expect(visible.some((item) => item.key === "SIN_PAGO")).toBe(false);
  });

  it("keeps SIN_PAGO in the underlying catalog untouched", () => {
    expect(SITUATION_MENU_ITEMS.some((item) => item.key === "SIN_PAGO")).toBe(
      true,
    );
  });

  it("includes DESCUENTO_DEFINITIVO as a visible entry (not hidden)", () => {
    const visible = visibleSituationMenuItems();
    const item = visible.find((entry) => entry.key === "DESCUENTO_DEFINITIVO");

    expect(item).toBeTruthy();
    expect(item?.label).toBe("Descuento definitivo");
    expect(item?.icon).toBe("mdi-cash-minus");
    expect(item?.color).toBe("purple-darken-2");
  });

  it("includes PAGO_ADELANTADO as a visible entry (not hidden) — new situation, no separate entry point", () => {
    const visible = visibleSituationMenuItems();
    const item = visible.find((entry) => entry.key === "PAGO_ADELANTADO");

    expect(item).toBeTruthy();
    expect(item?.label).toBe("Pago adelantado");
  });

  it("does not drop any other entry", () => {
    const visible = visibleSituationMenuItems();
    const nonHiddenKeys = SITUATION_MENU_ITEMS.filter(
      (item) => !item.hidden,
    ).map((item) => item.key);

    expect(visible.map((item) => item.key)).toEqual(nonHiddenKeys);
  });

  it("drops RETENIDA but keeps the rest when the row is advance paid", () => {
    const keys = visibleSituationMenuItems(undefined, { advancePaid: true }).map(
      (item) => item.key,
    );

    expect(keys).not.toContain("RETENIDA");
    expect(keys).toContain("PAGO_MESES");
    expect(keys).toContain("DESCUENTO_DEFINITIVO");
  });

  it("offers RETENIDA for non-advance rows", () => {
    expect(
      visibleSituationMenuItems(undefined, { advancePaid: false }).map(
        (item) => item.key,
      ),
    ).toContain("RETENIDA");
    expect(visibleSituationMenuItems().map((item) => item.key)).toContain(
      "RETENIDA",
    );
  });

  it("filters any hidden entry from an arbitrary list, not just the default one", () => {
    const items: SituationMenuItem[] = [
      { key: "SIN_PAGO", icon: "mdi-cash-off", label: "A", color: "grey" },
      {
        key: "BAJA_DEFINITIVA",
        icon: "mdi-account-off-outline",
        label: "B",
        color: "red-darken-2",
        hidden: true,
      },
    ];

    expect(visibleSituationMenuItems(items)).toEqual([items[0]]);
  });
});
