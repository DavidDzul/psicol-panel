<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    persistent
  >
    <v-card class="pa-0">
      <!-- Header -->
      <v-toolbar flat dark density="comfortable">
        <v-toolbar-title>Generar reporte de asistencias</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4">
        <p class="text-body-2 mb-6">
          Seleccione los datos solicitados para generar el reporte.
        </p>

        <v-row>
          <!-- Sede -->
          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="adminCampus"
              v-model="campus"
              item-title="text"
              item-value="value"
              label="Sede"
            />
          </v-col>

          <!-- Generación -->
          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="filteredGenerations"
              v-model="generation_id"
              item-title="generation_name"
              item-value="id"
              label="Generación"
            />
          </v-col>

          <!-- Año -->
          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="selectYear"
              v-model="year"
              label="Año"
            />
          </v-col>

          <!-- Semestre -->
          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="selectSemester"
              v-model="semester"
              item-title="title"
              item-value="value"
              label="Semestre"
            />
          </v-col>

          <v-col cols="12">
            <v-label class="mb-2 d-block">Formato del reporte:</v-label>
            <v-radio-group v-model="format" inline hide-details>
              <v-radio label="PDF" :value="1" color="red"></v-radio>
              <v-radio label="Excel" :value="2" color="green"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>

        <!-- Botón -->
        <div class="text-center mt-6 mb-2">
          <v-btn
            :color="format == 1 ? 'error' : 'success'"
            :prepend-icon="format == 1 ? 'mdi-file-pdf-box' : 'mdi-file-excel'"
            :disabled="!isValid"
            :loading="loading"
            @click="submit"
          >
            Generar reporte
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { SelectOption } from "@/constants";
import type { Generation } from "@/interfaces/generation";
import type { ReportSemesterForm } from "@/interfaces/class";

interface SemesterOption {
  title: string;
  value: number;
}

interface Props {
  modelValue: boolean;
  adminCampus: SelectOption[];
  generations: Generation[];
  loading: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: ReportSemesterForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  adminCampus: () => [],
  generations: () => [],
  loading: false,
});

const emit = defineEmits<Emits>();

const campus = ref<string | null>(null);
const generation_id = ref<number | null>(null);
const year = ref<number | null>(null);
const semester = ref<number | null>(null);
const format = ref<number>(1);

const filteredGenerations = computed<Generation[]>(() =>
  props.generations.filter((g) => g.campus === campus.value),
);

const selectYear = computed<number[]>(() => {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
});

const selectSemester: SemesterOption[] = [
  { title: "Enero - Junio", value: 1 },
  { title: "Agosto - Diciembre", value: 2 },
];

const isValid = computed<boolean>(
  () =>
    !!(
      campus.value &&
      generation_id.value &&
      year.value &&
      semester.value &&
      format.value
    ),
);

const close = (): void => emit("update:modelValue", false);

const submit = (): void => {
  if (!campus.value || !generation_id.value || !year.value || !semester.value)
    return;
  emit("submit", {
    campus: campus.value,
    generation_id: generation_id.value,
    year: year.value,
    semester: semester.value,
    format: format.value,
  });
};
</script>
