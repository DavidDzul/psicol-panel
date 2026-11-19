// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";

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

import JobApplicationsTable from "@/components/jobApplications/JobApplicationsTable.vue";
import type { JobApplication } from "@/interfaces/jobApplication";

const base = {
  user_id: 1,
  rejected_other: null,
  created_at: "2026-01-01T10:00:00",
  vacant: { vacant_name: "Dev" },
  user: { first_name: "A", last_name: "B" },
};

const mountTable = async (applications: JobApplication[]) => {
  const wrapper = mount(JobApplicationsTable, {
    props: { applications, loading: false, read: true, edit: false },
    global: { plugins: [createVuetify()] },
  });
  await flushPromises();
  return wrapper;
};

describe("JobApplicationsTable", () => {
  it("shows the rejected reason column when an application is rejected", async () => {
    const wrapper = await mountTable([
      { ...base, id: 1, status: "REJECTED", rejected_reason: "OTHER", rejected_other: "Sin cupo" },
    ] as JobApplication[]);
    expect(wrapper.text()).toContain("Motivo de Rechazo");
    expect(wrapper.text()).toContain("Sin cupo");
    wrapper.unmount();
  });

  it("falls back to the raw reason for unknown keys and does not throw on null", async () => {
    const wrapper = await mountTable([
      { ...base, id: 1, status: "REJECTED", rejected_reason: "MYSTERY" },
      { ...base, id: 2, status: "REJECTED", rejected_reason: null },
    ] as JobApplication[]);
    expect(wrapper.text()).toContain("MYSTERY");
    wrapper.unmount();
  });

  it("omits the rejected reason column when nothing is rejected", async () => {
    const wrapper = await mountTable([
      { ...base, id: 1, status: "PENDING", rejected_reason: null },
    ] as JobApplication[]);
    expect(wrapper.text()).not.toContain("Motivo de Rechazo");
    wrapper.unmount();
  });
});
