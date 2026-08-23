// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOMWrapper, flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import ScholarshipProfileCard from "@/components/scholarships/ScholarshipProfileCard.vue";
import type { ScholarshipProfile, ScholarshipProfileForm } from "@/interfaces/scholarship";

// Covers spec "Flag editable via profile form" (toggle on/off + save) and the
// D-constraint that the visible label lives in exactly one place per file —
// this suite is a regression guard for the `advance_payment_eligible`
// v-switch wiring: startEdit() pre-fill, onSave() payload, and the read-view
// chip.

const baseProfile: ScholarshipProfile = {
  id: 1,
  user_id: 1,
  scholarship_type: "IU",
  monthly_amount: "2500",
  monto_apoyo: null,
  temporary_increase_amount: null,
  temporary_increase_valid_from: null,
  temporary_increase_valid_until: null,
  temporary_increase_reason: null,
  temporary_increase_granted_by_id: null,
  advance_payment_eligible: false,
  active_discount_percentage: null,
  discount_reason: null,
  discount_valid_from: null,
  discount_valid_until: null,
  reticula_start_date: null,
  reticula_end_date: null,
  reticula_file_path: null,
  reticula_original_name: null,
  egreso_administrativo: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom doesn't define `visualViewport` at all (not even as `undefined`), and
// Vuetify's VOverlay location strategy references the bare global — without
// this stub, mounting the replace-confirmation v-dialog throws
// "visualViewport is not defined".
if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", { value: null, writable: true });
}

const vuetify = createVuetify();

const fetchProfile = vi.fn();
const saveProfile = vi.fn();
const uploadReticula = vi.fn();

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({
    fetchProfile,
    saveProfile,
    uploadReticula,
  }),
}));

const mountCard = () =>
  mount(ScholarshipProfileCard, {
    props: { userId: 1 },
    global: { plugins: [createPinia(), vuetify] },
  });

// v-dialog content (the replace-confirmation dialog) teleports to
// `document.body`, outside the mounted wrapper's own DOM subtree.
const body = () => new DOMWrapper(document.body);

/**
 * Looks up a `v-text-field` by its (possibly asterisk-suffixed, e.g.
 * "Vigente desde *") label prefix instead of DOM index — the aumento
 * temporal fields share a `type="date"`/`type="number"` shape with several
 * other fields in the same form (discount, retícula), so indexing by type
 * is fragile once more fields are added.
 */
const fieldByLabel = (wrapper: VueWrapper, label: string) =>
  wrapper
    .findAllComponents({ name: "VTextField" })
    .find((f) => (f.props("label") as string | undefined)?.startsWith(label));

// `saveProfile`/`fetchProfile`/`uploadReticula` are shared `vi.fn()` spies
// across every test in this file — without clearing `.mock.calls` between
// tests, `expect(saveProfile).not.toHaveBeenCalled()` would see calls made by
// earlier, unrelated tests. `document.body.innerHTML` is cleared too since
// the replace-confirmation `v-dialog` teleports its content there, outside
// the mounted wrapper's own subtree, and leaks into the next test otherwise.
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("ScholarshipProfileCard — advance_payment_eligible switch", () => {
  it("pre-fills the switch from the existing profile value when editing starts", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: true,
    });
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect((checkbox.element as HTMLInputElement).checked).toBe(true);
  });

  it("sends the toggled value in the saveProfile payload", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: false,
    });
    saveProfile.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: true,
    });
    uploadReticula.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: true,
    });

    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);

    // DOM order of type="date" inputs: [0] "Descuento vigente desde", [1]
    // "Descuento vigente hasta", [2] "Vigente desde" (aumento temporal), [3]
    // "Vigente hasta" (aumento temporal) — none of these 4 are required
    // without their respective amount/percentage set — [4] "Inicio de
    // carrera" (required), [5] "Fin de carrera" (required).
    const dateInputs = wrapper.findAll('input[type="date"]');
    await dateInputs[4].setValue("2026-01-01");
    await dateInputs[5].setValue("2026-06-01");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(saveProfile).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ScholarshipProfileForm>>({
        advance_payment_eligible: true,
      }),
    );
  });

  it("shows the CERT chip in the read view when the flag is true", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: true,
    });
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain("¿Estudia en la universidad CERT?");
  });

  it("hides the CERT chip in the read view when the flag is false", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      advance_payment_eligible: false,
    });
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).not.toContain("¿Estudia en la universidad CERT?");
  });
});

// Covers spec "Captura de aumento temporal" + "Un solo aumento vigente a la
// vez" (scholarship-temporary-increase). Confirms the behavior actually
// implemented in the component (read view, `increaseEndAfterStart` /
// `requiredIfIncrease` rules, `clearIncrease()`, and the 422 replace-conflict
// dialog) — written after the fact against the real code, not against an
// assumed spec, per the TDD-standard-mode instruction for this batch.

describe("ScholarshipProfileCard — Aumento temporal de beca (read view)", () => {
  it("renders monto, vigencia, motivo, and autorizó when the profile has an active increase", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      temporary_increase_amount: "500.00",
      temporary_increase_valid_from: "2026-09-01",
      temporary_increase_valid_until: "2026-09-30",
      temporary_increase_reason: "Apoyo transporte",
      temporary_increase_granted_by_id: 7,
      granted_by: { id: 7, first_name: "Ana", last_name: "Pérez" },
    });
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).toContain("Aumento temporal de beca");
    expect(wrapper.text()).toContain("+$500.00");
    expect(wrapper.text()).toContain("01/09/2026");
    expect(wrapper.text()).toContain("30/09/2026");
    expect(wrapper.text()).toContain("Apoyo transporte");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Pérez");
  });

  it("does not render the section when there is no active increase", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    const wrapper = mountCard();
    await flushPromises();

    expect(wrapper.text()).not.toContain("Aumento temporal de beca");
  });
});

describe("ScholarshipProfileCard — Aumento temporal de beca (edición)", () => {
  it("rejects an end date that is not after the start date", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    await fieldByLabel(wrapper, "Monto del aumento")!.find("input").setValue(500);
    await fieldByLabel(wrapper, "Vigente desde")!.find("input").setValue("2026-09-30");
    await fieldByLabel(wrapper, "Vigente hasta")!.find("input").setValue("2026-09-01");
    await fieldByLabel(wrapper, "Motivo del aumento")!.find("input").setValue("Apoyo transporte");
    await fieldByLabel(wrapper, "Inicio de carrera")!.find("input").setValue("2026-01-01");
    await fieldByLabel(wrapper, "Fin de carrera")!.find("input").setValue("2026-06-01");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.text()).toContain("Debe ser posterior a la fecha de inicio.");
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it("clears all 4 temporary increase fields when Limpiar aumento is clicked", async () => {
    fetchProfile.mockResolvedValueOnce({
      ...baseProfile,
      temporary_increase_amount: "500.00",
      temporary_increase_valid_from: "2026-09-01",
      temporary_increase_valid_until: "2026-09-30",
      temporary_increase_reason: "Apoyo transporte",
    });
    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Limpiar aumento");

    const clearBtn = wrapper
      .findAll("button")
      .find((b) => b.text() === "Limpiar aumento");
    expect(clearBtn).toBeTruthy();
    await clearBtn!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      (fieldByLabel(wrapper, "Monto del aumento")!.find("input").element as HTMLInputElement).value,
    ).toBe("");
    expect(
      (fieldByLabel(wrapper, "Vigente desde")!.find("input").element as HTMLInputElement).value,
    ).toBe("");
    expect(
      (fieldByLabel(wrapper, "Vigente hasta")!.find("input").element as HTMLInputElement).value,
    ).toBe("");
    expect(
      (fieldByLabel(wrapper, "Motivo del aumento")!.find("input").element as HTMLInputElement).value,
    ).toBe("");
    expect(wrapper.text()).not.toContain("Limpiar aumento");
  });

  it("sends the temporary increase fields in the saveProfile payload", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    saveProfile.mockResolvedValueOnce({ ...baseProfile });
    uploadReticula.mockResolvedValueOnce({ ...baseProfile });

    const wrapper = mountCard();
    await flushPromises();

    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    await fieldByLabel(wrapper, "Monto del aumento")!.find("input").setValue(500);
    await fieldByLabel(wrapper, "Vigente desde")!.find("input").setValue("2026-09-01");
    await fieldByLabel(wrapper, "Vigente hasta")!.find("input").setValue("2026-09-30");
    await fieldByLabel(wrapper, "Motivo del aumento")!.find("input").setValue("Apoyo transporte");
    await fieldByLabel(wrapper, "Inicio de carrera")!.find("input").setValue("2026-01-01");
    await fieldByLabel(wrapper, "Fin de carrera")!.find("input").setValue("2026-06-01");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(saveProfile).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ScholarshipProfileForm>>({
        temporary_increase_amount: 500,
        temporary_increase_valid_from: "2026-09-01",
        temporary_increase_valid_until: "2026-09-30",
        temporary_increase_reason: "Apoyo transporte",
      }),
    );
  });
});

describe("ScholarshipProfileCard — replace-confirmation dialog (422 aumento vigente)", () => {
  const conflictMessage =
    "Ya existe un aumento vigente hasta 2026-09-30. Confirmá el reemplazo para sobrescribirlo.";

  // Shape mirrors a real axios error: `isAxiosError()` (used by the
  // component's `extractIncreaseConflictMessage()`) checks for
  // `isAxiosError === true`, not `instanceof AxiosError`.
  const buildConflictError = () => ({
    isAxiosError: true,
    response: {
      status: 422,
      data: { errors: { temporary_increase_amount: [conflictMessage] } },
    },
  });

  const fillIncreaseAndSubmit = async (wrapper: VueWrapper): Promise<void> => {
    await wrapper.find("button").trigger("click"); // "Editar perfil"
    await wrapper.vm.$nextTick();

    await fieldByLabel(wrapper, "Monto del aumento")!.find("input").setValue(500);
    await fieldByLabel(wrapper, "Vigente desde")!.find("input").setValue("2026-09-01");
    await fieldByLabel(wrapper, "Vigente hasta")!.find("input").setValue("2026-09-30");
    await fieldByLabel(wrapper, "Motivo del aumento")!.find("input").setValue("Apoyo transporte");
    await fieldByLabel(wrapper, "Inicio de carrera")!.find("input").setValue("2026-01-01");
    await fieldByLabel(wrapper, "Fin de carrera")!.find("input").setValue("2026-06-01");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
  };

  it("opens the replace-confirmation dialog when the backend rejects with an active-increase conflict", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    saveProfile.mockRejectedValueOnce(buildConflictError());

    const wrapper = mountCard();
    await flushPromises();

    await fillIncreaseAndSubmit(wrapper);

    expect(body().text()).toContain("Ya existe un aumento vigente");
    expect(body().text()).toContain(conflictMessage);
  });

  it("does not show the dialog for a generic (non-conflict) save error", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    saveProfile.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500, data: {} },
    });

    const wrapper = mountCard();
    await flushPromises();

    await fillIncreaseAndSubmit(wrapper);

    expect(body().text()).not.toContain("Ya existe un aumento vigente");
  });

  it("resends the payload with replace_temporary_increase: true when the user confirms", async () => {
    fetchProfile.mockResolvedValueOnce({ ...baseProfile });
    saveProfile.mockRejectedValueOnce(buildConflictError());
    saveProfile.mockResolvedValueOnce({ ...baseProfile });
    uploadReticula.mockResolvedValueOnce({ ...baseProfile });

    const wrapper = mountCard();
    await flushPromises();

    await fillIncreaseAndSubmit(wrapper);

    const confirmBtn = body()
      .findAll("button")
      .find((b) => b.text() === "Confirmar reemplazo");
    expect(confirmBtn).toBeTruthy();
    await confirmBtn!.trigger("click");
    await flushPromises();

    expect(saveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining<Partial<ScholarshipProfileForm>>({
        replace_temporary_increase: true,
        temporary_increase_amount: 500,
        temporary_increase_valid_from: "2026-09-01",
        temporary_increase_valid_until: "2026-09-30",
      }),
    );
  });
});
