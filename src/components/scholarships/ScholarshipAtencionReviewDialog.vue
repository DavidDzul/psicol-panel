<template>
  <v-dialog v-model="model" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="blue" size="small">mdi-account-check</v-icon>
        Revisión — Atención de Becarios
      </v-card-title>

      <v-card-text class="pt-0">
        <!-- Resumen de asistencias -->
        <div v-if="attendanceSummary" class="mb-4">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">
            SITUACIÓN ADMINISTRATIVA (según reglamento)
          </div>

          <!-- Faltas injustificadas -->
          <v-alert
            v-if="attendanceSummary.absent_unjustified > 0"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            <strong>{{ attendanceSummary.absent_unjustified }} falta(s) injustificada(s)</strong>
            — Aplica suspensión del pago mensual por cada falta (reglamento art. 5).
          </v-alert>

          <!-- Retardos acumulados -->
          <v-alert
            v-if="attendanceSummary.late_unconsumed >= 2"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            <strong>{{ attendanceSummary.late_unconsumed }} retardo(s) no consumido(s)</strong>
            — Cada par de retardos equivale a 1 falta injustificada (reglamento art. 5).
            <span v-if="effectiveAbsencesFromLate > 0">
              → {{ effectiveAbsencesFromLate }} falta(s) adicional(es) por retardos.
            </span>
          </v-alert>
          <v-alert
            v-else-if="attendanceSummary.late_unconsumed === 1"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            1 retardo pendiente — se necesita 1 más para generar descuento (reglamento art. 5).
          </v-alert>

          <!-- Sin infracciones -->
          <v-alert
            v-if="attendanceSummary.absent_unjustified === 0 && attendanceSummary.late_unconsumed < 2"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            Sin infracciones administrativas de asistencia en el periodo.
          </v-alert>
        </div>

        <!-- Descuento académico aplicado -->
        <div
          v-if="refrend && Number(refrend.discount_percentage) > 0"
          class="mb-4"
        >
          <v-alert type="warning" variant="tonal" density="compact">
            Descuento académico ya aplicado: <strong>{{ refrend.discount_percentage }}%</strong>
            ({{ fmt(refrend.discount_amount) }}) — según calificaciones/reglamento art. 1.
          </v-alert>
        </div>

        <!-- Etiquetas de revisión -->
        <div class="mb-4">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">
            ETIQUETAS DE REVISIÓN
            <span class="font-weight-regular">(selecciona los motivos que apliquen)</span>
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="label in ATENCION_LABELS"
              :key="label"
              :color="selectedLabels.includes(label) ? 'blue' : 'default'"
              :variant="selectedLabels.includes(label) ? 'tonal' : 'outlined'"
              size="small"
              clickable
              @click="toggleLabel(label)"
            >
              <v-icon v-if="selectedLabels.includes(label)" start size="x-small">mdi-check</v-icon>
              {{ label }}
            </v-chip>
          </div>
        </div>

        <!-- Observaciones -->
        <v-textarea
          v-model="observations"
          label="Observaciones (opcional)"
          rows="3"
          variant="outlined"
          counter="2000"
          maxlength="2000"
          placeholder="Describe el contexto de la revisión, acuerdos con el becario, excepciones aplicadas..."
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="blue"
          variant="elevated"
          :loading="loading"
          @click="submit"
        >
          Marcar revisado
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AttendanceSummary, ReviewForm, ScholarshipRefrend } from "@/interfaces/scholarship";

const ATENCION_LABELS: string[] = [
  "Falta injustificada",
  "Retardos acumulados",
  "Entregó justificante médico",
  "Promedio < 85",
  "Materias reprobadas",
  "Documentos no entregados",
  "Comprobante de pago no enviado",
  "Actividad de recaudación incompleta",
  "Sin infracciones",
];

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  attendanceSummary?: AttendanceSummary | null;
  refrend?: ScholarshipRefrend | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [form: ReviewForm];
}>();

const model = ref<boolean>(props.modelValue);
const observations = ref<string>("");
const selectedLabels = ref<string[]>([]);

watch(
  () => props.modelValue,
  (v) => {
    model.value = v;
    if (v) {
      observations.value = "";
      selectedLabels.value = props.refrend?.atencion_labels ?? [];
    }
  },
);
watch(model, (v) => emit("update:modelValue", v));

const effectiveAbsencesFromLate = computed<number>(() => {
  if (!props.attendanceSummary) return 0;
  return Math.floor(props.attendanceSummary.late_unconsumed / 2);
});

const toggleLabel = (label: string): void => {
  const idx = selectedLabels.value.indexOf(label);
  if (idx === -1) {
    selectedLabels.value = [...selectedLabels.value, label];
  } else {
    selectedLabels.value = selectedLabels.value.filter((l) => l !== label);
  }
};

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

const submit = (): void => {
  emit("submit", {
    observations: observations.value || null,
    labels: selectedLabels.value.length > 0 ? selectedLabels.value : null,
  });
};
</script>
