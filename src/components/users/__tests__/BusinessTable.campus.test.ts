// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VSelect, VDataTable } from "vuetify/components";

if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", { value: null, writable: true });
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import BusinessTable from "@/components/users/BusinessTable.vue";
import { campusArray } from "@/constants";
import type { Business } from "@/interfaces/business";

const rows = [
  { id: 1, campus: "MERIDA" },
  { id: 2, campus: "VALLADOLID" },
  { id: 3, campus: "MERIDA" },
] as unknown as Business[];

let wrapper: ReturnType<typeof mount> | null = null;

const mountTable = async (props: Record<string, unknown>) => {
  wrapper = mount(BusinessTable, {
    props: {
      business: rows,
      loading: false,
      read: true,
      create: false,
      edit: false,
      userCampus: campusArray,
      ...props,
    },
    global: { plugins: [createVuetify()] },
    attachTo: document.body,
  });
  await flushPromises();
  return wrapper;
};

const visibleIds = () =>
  (wrapper!.findComponent(VDataTable).props("items") as Business[]).map((b) => b.id);
const select = () => wrapper!.findComponent(VSelect);

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
});

describe("BusinessTable - campus selector", () => {
  it("global: starts on the default campus and is editable", async () => {
    await mountTable({ defaultCampus: "MERIDA", campusLocked: false });
    expect(select().props("disabled")).toBeFalsy();
    expect(select().props("modelValue")).toBe("MERIDA");
    expect(visibleIds()).toEqual([1, 3]);
  });

  it("global: selecting another campus and clearing it", async () => {
    await mountTable({ defaultCampus: "MERIDA", campusLocked: false });
    await select().vm.$emit("update:modelValue", "VALLADOLID");
    expect(visibleIds()).toEqual([2]);
    await select().vm.$emit("update:modelValue", null);
    expect(visibleIds()).toEqual([1, 2, 3]);
  });

  it("locked: select is disabled, shows own campus and applies no client filter", async () => {
    await mountTable({
      defaultCampus: "MERIDA",
      campusLocked: true,
      userCampus: [{ value: "MERIDA", text: "Mérida" }],
    });
    expect(select().props("disabled")).toBe(true);
    expect(select().props("modelValue")).toBe("MERIDA");
    expect(visibleIds()).toEqual([1, 2, 3]);
  });

  it("initialises the filter once when the default campus arrives late", async () => {
    await mountTable({ defaultCampus: undefined, campusLocked: false });
    expect(visibleIds()).toEqual([1, 2, 3]);
    await wrapper!.setProps({ defaultCampus: "MERIDA" });
    expect(visibleIds()).toEqual([1, 3]);
    await select().vm.$emit("update:modelValue", null);
    await wrapper!.setProps({ defaultCampus: "VALLADOLID" });
    expect(visibleIds()).toEqual([1, 2, 3]);
  });
});
