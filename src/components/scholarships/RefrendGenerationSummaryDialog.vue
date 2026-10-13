<template>
  <v-dialog v-model="model" max-width="680">
    <v-card>
      <v-card-title class="text-h6 pa-4">Resumen de generación</v-card-title>

      <v-card-text class="pt-0">
        <v-alert v-if="summaries.length === 0" type="info" variant="tonal" density="compact">
          No hay generaciones para esta sede.
        </v-alert>

        <!-- No v-expansion-panels: everything is always visible — staff must
             see the failures list right away, not after an extra click, and
             a sede typically has only a handful of generaciones. -->
        <div v-else>
          <v-card
            v-for="summary in summaries"
            :key="summary.generationId"
            variant="outlined"
            class="mb-3 pa-3"
          >
            <div class="d-flex align-center ga-2 flex-wrap mb-2">
              <span class="font-weight-medium">{{ summary.generationName }}</span>
              <v-chip
                v-if="summary.requestError"
                color="error"
                size="small"
                variant="tonal"
              >
                Error de solicitud
              </v-chip>
              <template v-else-if="summary.result">
                <v-chip color="success" size="small" variant="tonal">
                  {{ summary.result.created }} creados
                </v-chip>
                <v-chip color="default" size="small" variant="tonal">
                  {{ summary.result.skipped }} omitidos
                </v-chip>
                <v-chip
                  v-if="summary.result.skipped_out_of_reticula > 0"
                  color="warning"
                  size="small"
                  variant="tonal"
                >
                  {{ summary.result.skipped_out_of_reticula }} fuera de retícula
                </v-chip>
                <v-chip
                  v-if="summary.result.errors > 0"
                  color="error"
                  size="small"
                  variant="tonal"
                >
                  {{ summary.result.errors }} errores
                </v-chip>
              </template>
            </div>

            <p v-if="summary.requestError" class="text-error mb-0">
              {{ summary.requestError }}
            </p>

            <template v-else-if="summary.result">
              <p class="mb-2 text-body-2">
                Creados: {{ summary.result.created }} ·
                Omitidos (ya existían): {{ summary.result.skipped }} ·
                Fuera de retícula: {{ summary.result.skipped_out_of_reticula }} ·
                Errores: {{ summary.result.errors }}
              </p>

              <v-list v-if="summary.result.failures.length > 0" density="compact">
                <v-list-item
                  v-for="failure in summary.result.failures"
                  :key="failure.user_id"
                >
                  <v-list-item-title>{{ failure.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ failure.reason }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </template>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { GenerationRunSummary } from "@/interfaces/scholarship";

const props = defineProps<{
  modelValue: boolean;
  summaries: GenerationRunSummary[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const model = ref<boolean>(props.modelValue);

watch(
  () => props.modelValue,
  (v) => {
    model.value = v;
  },
);
watch(model, (v) => emit("update:modelValue", v));
</script>
