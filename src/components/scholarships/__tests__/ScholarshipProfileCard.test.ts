// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
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
