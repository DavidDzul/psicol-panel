// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { ref } from "vue";
import ScholarshipRefrendDetailsView from "@/views/scholarships/ScholarshipRefrendDetailsView.vue";
import type { ScholarshipRefrend } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// The view delegates ALL data loading (route params, 3 stores, async
// fetches) to `useScholarshipDetails()` — mocked at the module boundary so
// these tests exercise only the view's own template logic (the temporary
// increase chip gating in the financial header), covering spec
// "Visibilidad del origen en el detalle de refrendo"
// (scholarship-temporary-increase). Non-Vuetify child components (tabs
// content, dialogs) are stubbed since they pull in their own store/composable
// dependencies unrelated to this suite.
//
// `v-tooltip`'s `text` prop is asserted directly on the component instance
// (not via rendered DOM) because its content teleports to `document.body`
// and is lazy-rendered only while the tooltip is open — reading the prop
// avoids simulating a hover/focus interaction just to check a static string.

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

const vuetify = createVuetify();

let mockRefrend: ScholarshipRefrend | null = null;

vi.mock("@/composables/useScholarshipDetails", () => ({
  useScholarshipDetails: () => ({
    refrend: ref(mockRefrend),
    docList: ref([]),
    semesterRefrends: ref([]),
    attendanceSummary: ref(null),
    scholarshipProfile: ref(null),
    loading: ref(false),
    reviewDialog: ref(false),
    reviewMode: ref("atencion"),
    withholdDialog: ref(false),
    withholdReason: ref(""),
    authorizeDialog: ref(false),
    graduateDialog: ref(false),
    openAtencionReview: vi.fn(),
    openPedagogiaReview: vi.fn(),
    onSubmitReview: vi.fn(),
    openAuthorize: vi.fn(),
    onAuthorize: vi.fn(),
    onMarkPaid: vi.fn(),
    openWithhold: vi.fn(),
    onWithhold: vi.fn(),
    onGraduate: vi.fn(),
  }),
}));

const baseRefrend: ScholarshipRefrend = {
  id: 1,
  user_id: 1,
  period_year: 2026,
  period_month: 9,
  refrend_type: "NORMAL",
  status: "DRAFT",
  workflow_status: "DRAFT",
  resolution_type: null,
  resolution_cause: null,
  resolution_notes: null,
  suspension_percentage: null,
  withholding_mode: null,
  withholding_value: null,
  carryover_months_count: null,
  carryover_months_detail: null,
  carryover_percentage: null,
  snapshot_gross_amount: "2500.00",
  snapshot_monto_apoyo: null,
  snapshot_temporary_increase_amount: null,
  snapshot_temporary_increase_reason: null,
  base_amount: "2500.00",
  snapshot_discount_percentage: null,
  snapshot_discount_reason: null,
  discount_percentage: "0",
  discount_amount: "0",
  final_amount: "2500.00",
  amount_pending_from_previous: "0",
  total_to_pay: "2500.00",
  snapshot_name: "Becario de Prueba",
  snapshot_generation: "Gen 1",
  snapshot_generation_id: 1,
  snapshot_campus: "CDMX",
  snapshot_scholarship_type: "IU",
  atencion_observations: null,
  atencion_labels: null,
  atencion_reviewed_by_id: null,
  atencion_reviewed_at: null,
  pedagogia_observations: null,
  pedagogia_reviewed_by_id: null,
  pedagogia_reviewed_at: null,
  notified_by_id: null,
  notified_at: null,
  notification_method: null,
  locked_at: null,
  locked_by_id: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

const globalStubs = {
  BreadCrumbs: true,
  RefrendCarryoverAlert: true,
  ScholarshipAttendanceSummary: true,
  StudentAcademicSummaryCard: true,
  ScholarshipDocumentsCard: true,
  ScholarshipDiscountsCard: true,
  ScholarshipHistoryTimeline: true,
  ScholarshipAtencionReviewDialog: true,
  ScholarshipReviewDialog: true,
};

const mountView = (refrend: ScholarshipRefrend | null) => {
  mockRefrend = refrend;
  return mount(ScholarshipRefrendDetailsView, {
    global: { plugins: [vuetify], stubs: globalStubs },
  });
};

describe("ScholarshipRefrendDetailsView — chip de aumento temporal", () => {
  it("shows the chip with the frozen amount and exposes the motivo via the tooltip when the snapshot has an increase", () => {
    const wrapper = mountView({
      ...baseRefrend,
      snapshot_temporary_increase_amount: "500.00",
      snapshot_temporary_increase_reason: "Apoyo transporte",
    });

    expect(wrapper.text()).toContain("+$500.00");
    expect(wrapper.text()).toContain("aumento");

    const increaseTooltip = wrapper
      .findAllComponents({ name: "VTooltip" })
      .find((t) => t.props("text") === "Apoyo transporte");
    expect(increaseTooltip).toBeTruthy();
  });

  it("falls back to a generic tooltip message when the snapshot has no motivo", () => {
    const wrapper = mountView({
      ...baseRefrend,
      snapshot_temporary_increase_amount: "500.00",
      snapshot_temporary_increase_reason: null,
    });

    const increaseTooltip = wrapper
      .findAllComponents({ name: "VTooltip" })
      .find((t) => t.props("text") === "Sin motivo registrado");
    expect(increaseTooltip).toBeTruthy();
  });

  it("hides the chip when the refrend has no frozen increase snapshot", () => {
    const wrapper = mountView({ ...baseRefrend });

    expect(wrapper.text()).not.toContain("aumento");
  });

  it("hides the chip when the snapshot amount is zero", () => {
    const wrapper = mountView({
      ...baseRefrend,
      snapshot_temporary_increase_amount: "0.00",
      snapshot_temporary_increase_reason: null,
    });

    expect(wrapper.text()).not.toContain("aumento");
  });

  it("does not break the rest of the financial header (base_amount, final_amount) when the chip is absent", () => {
    const wrapper = mountView({ ...baseRefrend });

    expect(wrapper.text()).toContain("Monto base");
    expect(wrapper.text()).toContain("$2,500.00");
  });
});
