// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VForm } from "vuetify/components";
import ScholarshipTemporaryIncreaseSection from "@/components/scholarships/ScholarshipTemporaryIncreaseSection.vue";
import type { ScholarshipProfile } from "@/interfaces/scholarship";

// Covers spec "Captura de aumento temporal" + "Un solo aumento vigente a la
// vez" (scholarship-temporary-increase) at the unit level for the component
// extracted out of ScholarshipProfileCard.vue (review finding #2 — file was
// 819 lines). Integration-level coverage (full save payload, replace-conflict
// dialog wired to the backend 422 shape) stays in
// ScholarshipProfileCard.test.ts since that logic (extractIncreaseConflictMessage,
// persistProfile) lives in the parent.

const vuetify = createVuetify();

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!("visualViewport" in window)) {
  Object.defineProperty(window, "visualViewport", {
    value: null,
    writable: true,
  });
}

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

// Real v-model wiring needs an actual parent/child relationship (defineModel
// emits `update:x`, it doesn't mutate the caller's prop by itself), so tests
// mount a tiny host component instead of the section directly.
const mountHost = (
  overrides: Partial<{
    profile: ScholarshipProfile | null;
    editing: boolean;
    amount: number | null;
    validFrom: string | null;
    validUntil: string | null;
    reason: string | null;
  }> = {},
) => {
  const host = defineComponent({
    components: { ScholarshipTemporaryIncreaseSection, VForm },
    setup() {
      const profile = ref<ScholarshipProfile | null>(
        overrides.profile ?? baseProfile,
      );
      const editing = ref(overrides.editing ?? false);
      const amount = ref<number | null>(overrides.amount ?? null);
      const validFrom = ref<string | null>(overrides.validFrom ?? null);
      const validUntil = ref<string | null>(overrides.validUntil ?? null);
      const reason = ref<string | null>(overrides.reason ?? null);
      const replaceDialog = ref(false);
      const saving = ref(false);
      const replaceErrorMessage = ref("");
      const formRef = ref();
      return {
        profile,
        editing,
        amount,
        validFrom,
        validUntil,
        reason,
        replaceDialog,
        saving,
        replaceErrorMessage,
        formRef,
      };
    },
    // Wrapped in a real `v-form` — same context this component is always
    // used in from `ScholarshipProfileCard.vue` — since Vuetify's VTextField
    // only auto-validates on value change once it is registered with an
    // ambient VForm; standalone (no VForm) it validates lazily.
    template: `
      <VForm ref="formRef">
        <ScholarshipTemporaryIncreaseSection
          :profile="profile"
          :editing="editing"
          v-model:amount="amount"
          v-model:valid-from="validFrom"
          v-model:valid-until="validUntil"
          v-model:reason="reason"
          v-model:replace-dialog="replaceDialog"
          :replace-error-message="replaceErrorMessage"
          :saving="saving"
          @confirm-replace="() => {}"
        />
      </VForm>
    `,
  });

  return mount(host, { global: { plugins: [vuetify] } });
};

describe("ScholarshipTemporaryIncreaseSection — vista de lectura", () => {
  it("renders monto, vigencia, motivo, and autorizó when the profile has an active increase", () => {
    const wrapper = mountHost({
      profile: {
        ...baseProfile,
        temporary_increase_amount: "500.00",
        temporary_increase_valid_from: "2026-09-01",
        temporary_increase_valid_until: "2026-09-30",
        temporary_increase_reason: "Apoyo transporte",
        temporary_increase_granted_by_id: 7,
        granted_by: { id: 7, first_name: "Ana", last_name: "Pérez" },
      },
      editing: false,
    });

    expect(wrapper.text()).toContain("Aumento temporal de beca");
    expect(wrapper.text()).toContain("+$500.00");
    expect(wrapper.text()).toContain("01/09/2026");
    expect(wrapper.text()).toContain("30/09/2026");
    expect(wrapper.text()).toContain("Apoyo transporte");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Pérez");
  });

  it("does not render the section when there is no active increase", () => {
    const wrapper = mountHost({ profile: { ...baseProfile }, editing: false });
    expect(wrapper.text()).not.toContain("Aumento temporal de beca");
  });

  // LOW finding: unify the zero-amount check to Number(...) > 0 (matches
  // ScholarshipRefrendDetailsView.vue) instead of a truthy-string check —
  // a stored "0.00" must not render as an active increase.
  it("does not render the section when the stored amount is exactly zero", () => {
    const wrapper = mountHost({
      profile: { ...baseProfile, temporary_increase_amount: "0.00" },
      editing: false,
    });
    expect(wrapper.text()).not.toContain("Aumento temporal de beca");
  });
});

describe("ScholarshipTemporaryIncreaseSection — validación (edición)", () => {
  it("rejects an end date that is not after the start date", async () => {
    const wrapper = mountHost({ editing: true });

    const dateInputs = wrapper.findAll('input[type="date"]');
    await dateInputs[0].setValue("2026-09-30"); // Vigente desde
    await dateInputs[1].setValue("2026-09-01"); // Vigente hasta
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Debe ser posterior a la fecha de inicio.");
  });

  // HIGH finding fix: the backend's `required_with` rule on
  // temporary_increase_amount fires when ANY of the other 3 fields is
  // present (UpdateScholarshipProfileRequest::rules()). Before this fix the
  // frontend only validated the opposite direction.
  it("requires the amount when only the valid-from date is filled in", async () => {
    const wrapper = mountHost({ editing: true });

    const dateInputs = wrapper.findAll('input[type="date"]');
    await dateInputs[0].setValue("2026-09-01"); // Vigente desde, amount left empty
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Requerido cuando se especifica vigencia o motivo del aumento.",
    );
  });

  it("requires the amount when only the reason is filled in", async () => {
    const wrapper = mountHost({ editing: true });

    const reasonInput = wrapper
      .findAllComponents({ name: "VTextField" })
      .find((f) => (f.props("label") as string | undefined)?.startsWith("Motivo del aumento"));
    await reasonInput!.find("input").setValue("Apoyo transporte");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Requerido cuando se especifica vigencia o motivo del aumento.",
    );
  });

  it("does not require the amount when none of the other 3 fields are filled in", async () => {
    const wrapper = mountHost({ editing: true });
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain(
      "Requerido cuando se especifica vigencia o motivo del aumento.",
    );
  });

  it("clears all 4 temporary increase fields when Limpiar aumento is clicked", async () => {
    const wrapper = mountHost({
      editing: true,
      amount: 500,
      validFrom: "2026-09-01",
      validUntil: "2026-09-30",
      reason: "Apoyo transporte",
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Limpiar aumento");

    const clearBtn = wrapper
      .findAll("button")
      .find((b) => b.text() === "Limpiar aumento");
    expect(clearBtn).toBeTruthy();
    await clearBtn!.trigger("click");
    await wrapper.vm.$nextTick();

    const amountField = wrapper
      .findAllComponents({ name: "VTextField" })
      .find((f) => (f.props("label") as string | undefined)?.startsWith("Monto del aumento"));
    expect(
      (amountField!.find("input").element as HTMLInputElement).value,
    ).toBe("");
    expect(wrapper.text()).not.toContain("Limpiar aumento");
  });
});
