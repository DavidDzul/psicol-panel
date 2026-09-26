<template>
  <v-dialog v-model="model" max-width="460" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="amber-darken-2" size="small">mdi-alert-outline</v-icon>
        Motivo del pago adicional
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-body-2 text-medium-emphasis mb-3">
          Este mes ya fue pagado por adelantado. Indicá el motivo por el que se le
          está pagando un monto adicional ahora, a pesar de eso.
        </div>
        <v-textarea
          v-model="reason"
          name="advance-divergence-reason"
          label="Motivo *"
          variant="outlined"
          density="compact"
          rows="3"
          maxlength="200"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="onCancel">Cancelar</v-btn>
        <v-btn
          color="amber-darken-2"
          variant="elevated"
          :loading="loading"
          :disabled="!isValid"
          @click="submit"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// Shared, single-purpose dialog (sdd/pago-adelantado — divergence-reason
// capture, design D4, closed 2026-09-25). Triggered reactively when
// recordPaymentSituation() reports status "divergence_required" (the
// backend's ADVANCE_DIVERGENCE_REQUIRED code) — not embedded proactively
// into all 8 situation dialogs, so a single component covers every
// resolution_type instead of duplicating a conditional field 8 times. The
// original situation dialog stays open underneath while this one is shown;
// on submit, the caller resubmits the SAME form with this reason appended.
import { computed, ref, watch } from "vue";

const props = defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ submit: [reason: string]; cancel: [] }>();
const model = defineModel<boolean>();

const reason = ref<string | null>(null);

watch(model, (open) => {
  if (!open) reason.value = null;
});

const isValid = computed(() => !!reason.value?.trim());

const submit = (): void => {
  if (!isValid.value) return;
  emit("submit", reason.value!.trim());
};

const onCancel = (): void => {
  emit("cancel");
  model.value = false;
};
</script>
