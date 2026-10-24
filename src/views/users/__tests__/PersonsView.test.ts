// @vitest-environment jsdom
//
// PersonsView forwards the page adapter's defaultUserType to UsersTable.

import { describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";

vi.mock("@/composables/usePersonsPage", () => ({
  usePersonsPage: () => ({
    links: ref([]),
    persons: ref([]),
    editPerson: ref(undefined),
    createDialog: ref(false),
    updateDialog: ref(false),
    filteredCampus: ref([]),
    loadingCreate: ref(false),
    loadingUpdate: ref(false),
    loadingTable: ref(false),
    generations: ref([]),
    canRead: ref(true),
    canCreate: ref(true),
    canEdit: ref(true),
    openCreateDialog: vi.fn(),
    openUpdateDialog: vi.fn(),
    openDetail: vi.fn(),
    onSave: vi.fn(),
    onUpdate: vi.fn(),
    defaultUserType: "BEC_ACTIVE",
    createDefaultUserType: "BEC_ACTIVE",
    createTitle: "Nuevo Usuario",
    updateTitle: "Actualizar becario/a",
  }),
}));

import PersonsView from "@/views/users/PersonsView.vue";
import UsersTable from "@/components/users/UsersTable.vue";

describe("PersonsView", () => {
  it("passes the adapter defaultUserType down to UsersTable", () => {
    const w = shallowMount(PersonsView, {
      props: { mode: "becarios" },
      global: {
        stubs: {
          VRow: { template: "<div><slot /></div>" },
          VCol: { template: "<div><slot /></div>" },
        },
      },
    });
    const table = w.findComponent(UsersTable);

    expect(table.exists()).toBe(true);
    expect(table.props("defaultUserType")).toBe("BEC_ACTIVE");
  });
});
