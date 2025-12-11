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

        <v-row dense>
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
        </v-row>

        <!-- Botón -->
        <div class="text-center mt-6 mb-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-file-chart"
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

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
  adminCampus: Array,
  generations: Array,
  loading: Boolean,
});

const emit = defineEmits(["update:modelValue", "submit"]);

const campus = ref(null);
const generation_id = ref(null);
const year = ref(null);
const semester = ref(null);

const filteredGenerations = computed(() =>
  props.generations.filter((g) => g.campus === campus.value)
);

const selectYear = computed(() => {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
});

const selectSemester = [
  { title: "Enero - Junio", value: 1 },
  { title: "Agosto - Diciembre", value: 2 },
];

const isValid = computed(() => {
  return campus.value && generation_id.value && year.value && semester.value;
});

const close = () => emit("update:modelValue", false);

const submit = () => {
  emit("submit", {
    campus: campus.value,
    generation_id: generation_id.value,
    year: year.value,
    semester: semester.value,
  });
};
</script>
