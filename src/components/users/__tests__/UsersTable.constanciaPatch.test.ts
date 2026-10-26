// @vitest-environment jsdom
//
// Integration: the "Constancia pendiente" chip must disappear from the list
// row right after the constancia upload, without refetching the list.

import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import axios from "@/axiosConfig";
import UsersTable from "@/components/users/UsersTable.vue";
import { usePersonsStore } from "@/stores/api/personsStore";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { User } from "@/interfaces/user";

vi.mock("@/axiosConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

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

let wrapper: ReturnType<typeof mount> | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

const user: User = {
  id: 7,
  enrollment: "ENR7",
  first_name: "Ana",
  last_name: "Perez",
  email: "a@example.com",
  email_verified_at: null,
  phone: "5512345678",
  workstation: null,
  user_type: "BEC_ACTIVE",
  campus: "CDMX",
  generation_id: 1,
  active: true,
  created_at: null,
  updated_at: "2026-01-01",
  curriculum_uploaded: false,
};

const chipCount = (w: ReturnType<typeof mount>) =>
  w.findAll(".v-chip").filter((c) => c.text() === "Constancia pendiente").length;

describe("UsersTable + stores: constancia upload", () => {
  it("removes the Constancia pendiente chip after uploadReticula succeeds", async () => {
    setActivePinia(createPinia());
    const persons = usePersonsStore();
    const scholarship = useScholarshipStore();
    persons.allPersons = new Map([[user.id, user]]);

    const Host = defineComponent({
      setup: () => () => h(UsersTable, { users: persons.becarios, defaultUserType: "BEC_ACTIVE" }),
    });
    wrapper = mount(Host, {
      global: { plugins: [createVuetify()] },
      attachTo: document.body,
    });
    await flushPromises();
    expect(chipCount(wrapper)).toBe(1);

    vi.mocked(axios.post).mockResolvedValue({ data: { data: { id: 1, user_id: 7 } } });
    await scholarship.uploadReticula(7, new FormData());
    await nextTick();
    await flushPromises();

    expect(chipCount(wrapper)).toBe(0);
  });
});
