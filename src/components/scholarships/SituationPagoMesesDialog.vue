<template>
  <v-dialog v-model="model" max-width="420" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="teal" size="small">mdi-cash-refund</v-icon>
        Pago de meses retenidos
      </v-card-title>

      <v-card-text class="pt-0">
        <v-text-field
          v-model.number="form.carryover_months_count"
          label="Número de meses *"
          type="number"
          variant="outlined"
          density="compact"
          min="1"
          max="12"
          class="mb-3"
          hide-details
        />
        <v-textarea
          v-model="form.carryover_months_detail"
          label="Meses a pagar — especificar *"
          rows="2"
          variant="outlined"
          density="compact"
          placeholder="Ej: enero, febrero 2026"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="teal" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { RecordSituationForm } from "@/interfaces/scholarship";

const props = defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const form = reactive({
  carryover_months_count: null as number | null,
  carryover_months_detail: null as string | null,
});

watch(model, (v) => {
  if (!v) { form.carryover_months_count = null; form.carryover_months_detail = null; }
});

const isValid = computed(() =>
  (form.carryover_months_count ?? 0) >= 1 &&
  !!form.carryover_months_detail?.trim()
);

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "BECA_MES",
    carryover_months_count: form.carryover_months_count,
    carryover_months_detail: form.carryover_months_detail,
  });
};
</script>
