import { describe, expect, it } from "vitest";
import {
  SITUATION_MENU_ITEMS,
  visibleSituationMenuItems,
  type SituationMenuItem,
} from "@/composables/useSituationMenuItems";

describe("visibleSituationMenuItems", () => {
  it("excludes SUSPENDIDA from the default catalog", () => {
    const visible = visibleSituationMenuItems();

    expect(visible.some((item) => item.key === "SUSPENDIDA")).toBe(false);
  });

  it("keeps SUSPENDIDA in the underlying catalog untouched", () => {
    expect(
      SITUATION_MENU_ITEMS.some((item) => item.key === "SUSPENDIDA"),
    ).toBe(true);
  });

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

  it("does not drop any other entry", () => {
    const visible = visibleSituationMenuItems();
    const nonHiddenKeys = SITUATION_MENU_ITEMS.filter(
      (item) => !item.hidden,
    ).map((item) => item.key);

    expect(visible.map((item) => item.key)).toEqual(nonHiddenKeys);
  });

  it("filters any hidden entry from an arbitrary list, not just the default one", () => {
    const items: SituationMenuItem[] = [
      { key: "SIN_PAGO", icon: "mdi-cash-off", label: "A", color: "grey" },
      {
        key: "SUSPENDIDA",
        icon: "mdi-percent-outline",
        label: "B",
        color: "deep-orange",
        hidden: true,
      },
    ];

    expect(visibleSituationMenuItems(items)).toEqual([items[0]]);
  });
});
