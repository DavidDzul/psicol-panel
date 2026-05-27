<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="deep-orange" size="small">mdi-percent-outline</v-icon>
        Suspensión temporal
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">PORCENTAJE DE SUSPENSIÓN</div>
        <v-radio-group v-model="form.suspension_percentage" class="mt-0 mb-4" hide-details>
          <div class="d-flex flex-wrap ga-3">
            <v-radio v-for="pct in [100, 75, 65, 50, 30, 25]" :key="pct"
              :label="`${pct}%`" :value="pct" color="deep-orange" />
          </div>
        </v-radio-group>

        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
        <v-radio-group v-model="form.resolution_cause" class="mt-0 mb-3" hide-details>
          <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="deep-orange" />
          <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="deep-orange" />
          <v-radio label="Por llevarse a extraordinario" value="LLEVARSE_EXTRAORDINARIO" color="deep-orange" />
          <v-radio label="Otro" value="OTRO" color="deep-orange" />
        </v-radio-group>
        <v-text-field
          v-if="form.resolution_cause === 'OTRO'"
          v-model="form.resolution_notes"
          label="Especificar causa *"
          variant="outlined"
          density="compact"
          class="mb-2"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="deep-orange" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
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
  suspension_percentage: null as number | null,
  resolution_cause: null as string | null,
  resolution_notes: null as string | null,
});

watch(model, (v) => {
  if (!v) { form.suspension_percentage = null; form.resolution_cause = null; form.resolution_notes = null; }
});

const isValid = computed(() =>
  form.suspension_percentage != null &&
  !!form.resolution_cause &&
  (form.resolution_cause !== "OTRO" || !!form.resolution_notes?.trim())
);

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "SUSPENDIDA",
    suspension_percentage: form.suspension_percentage,
    resolution_cause: form.resolution_cause,
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
