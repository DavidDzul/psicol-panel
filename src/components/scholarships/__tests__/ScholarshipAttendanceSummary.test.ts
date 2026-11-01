// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import type { AttendanceSummary } from "@/interfaces/scholarship";

const summary: AttendanceSummary = {
  total: 2,
  present: 1,
  late: 0,
  late_justified: 0,
  late_consumed: 0,
  late_unconsumed: 0,
  absent_unjustified: 1,
  absent_justified: 0,
  semester_start: "2026-08-01",
  semester_end: "2026-10-29",
  records: [
    {
      id: 1,
      class_date: "2026-10-20",
      class_name: "Clase A",
      status: "PRESENT",
      check_in: "08:05:00",
      check_out: "09:00",
      observations: null,
      late_penalty_consumed: false,
    },
    {
      id: 2,
      class_date: "2026-10-21",
      class_name: "Clase B",
      status: "ABSENT",
      check_in: null,
      check_out: null,
      observations: null,
      late_penalty_consumed: false,
    },
  ],
};

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    fetchAttendanceSummary: vi.fn().mockResolvedValue(summary),
  }),
}));

const vuetify = createVuetify();

describe("ScholarshipAttendanceSummary times", () => {
  it("renders entry and exit as HH:mm and a dash when null", async () => {
    const wrapper = mount(ScholarshipAttendanceSummary, {
      props: { userId: 9, year: 2026, month: 11 },
      global: { plugins: [vuetify] },
    });
    await flushPromises();

    const headers = wrapper.findAll("thead th").map((th) => th.text());
    expect(headers).toContain("Entrada");
    expect(headers).toContain("Salida");

    const rows = wrapper.findAll("tbody tr");
    const cells = (i: number) => rows[i].findAll("td").map((td) => td.text());
    expect(cells(0)).toContain("08:05");
    expect(cells(0)).toContain("09:00");
    // Absence: entry and exit both render a dash.
    expect(cells(1).filter((t) => t === "—").length).toBeGreaterThanOrEqual(2);
    expect(cells(1)).not.toContain("08:05");
  });
});
