// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, defineStore } from "pinia";
import { ref } from "vue";

const canViewAll = ref(false);

vi.mock("@/stores/views/businessPage", () => ({
  useBusinessPageStore: defineStore("businessPage", () => ({
    links: ref([]),
    business: ref([]),
    createDialog: ref(false),
    loadingCreate: ref(false),
    loadingTable: ref(false),
    ownCampus: ref("MERIDA"),
    canViewAllCampuses: canViewAll,
    businessCampusOptions: ref([{ value: "MERIDA", text: "Mérida" }]),
    readBusiness: ref(true),
    createBusinessPermission: ref(true),
    editBusiness: ref(true),
    openCreateDialog: vi.fn(),
    onSaveBusiness: vi.fn(),
    openBusinessDetail: vi.fn(),
  })),
}));

import BusinessView from "@/views/users/BusinessView.vue";

let wrapper: ReturnType<typeof mount> | null = null;

const mountView = () => {
  wrapper = mount(BusinessView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        BreadCrumbs: true,
        BusinessTable: true,
        BusinessCreateDialog: true,
        ConfirmationDialog: true,
        "v-row": { template: "<div><slot /></div>" },
        "v-col": { template: "<div><slot /></div>" },
      },
    },
  });
  return wrapper;
};

afterEach(() => wrapper?.unmount());

describe("BusinessView - campus selector wiring", () => {
  it("locks the table selector to the own campus when the user is not global", () => {
    canViewAll.value = false;
    const table = mountView().findComponent({ name: "BusinessTable" });
    expect(table.props("campusLocked")).toBe(true);
    expect(table.props("defaultCampus")).toBe("MERIDA");
  });

  it("unlocks the table selector when the user can view all campuses", () => {
    canViewAll.value = true;
    const table = mountView().findComponent({ name: "BusinessTable" });
    expect(table.props("campusLocked")).toBe(false);
  });

  it("offers the create dialog only the allowed campuses", () => {
    canViewAll.value = false;
    const dialog = mountView().findComponent({ name: "BusinessCreateDialog" });
    expect(dialog.props("userCampus")).toEqual([{ value: "MERIDA", text: "Mérida" }]);
  });
});
