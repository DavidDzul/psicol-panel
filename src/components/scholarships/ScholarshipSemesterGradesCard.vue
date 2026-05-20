<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-3"
    />

    <!-- Grades list -->
    <div v-if="grades.length" class="mb-3">
      <v-table density="compact">
        <thead>
          <tr>
            <th>Semestre</th>
            <th>Calificación</th>
            <th>Tipo</th>
            <th>Documento</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in grades" :key="g.id">
            <td>{{ g.semester_label }}</td>
            <td>
              <v-chip
                v-if="g.grade !== null"
                :color="gradeColor(Number(g.grade))"
                size="small"
                label
              >
                {{ g.grade }}
              </v-chip>
              <span v-else class="text-medium-emphasis text-caption">—</span>
            </td>
            <td>
              <v-chip
                :color="g.is_original ? 'success' : 'warning'"
                size="small"
                label
                variant="tonal"
              >
                {{ g.is_original ? "Original" : "Provisional" }}
              </v-chip>
            </td>
            <td>
              <span
                v-if="g.original_name"
                class="text-caption d-flex align-center ga-1"
              >
                <v-icon size="small" color="primary">mdi-file</v-icon>
                {{ g.original_name }}
              </span>
              <span v-else class="text-caption text-medium-emphasis"
                >Sin documento</span
              >
            </td>
            <td class="text-right">
              <v-btn
                v-if="g.file_path"
                icon
                size="small"
                variant="text"
                color="primary"
                :href="fileUrl(g.file_path)"
                target="_blank"
              >
                <v-icon size="small">mdi-eye</v-icon>
              </v-btn>
              <template v-if="!props.readonly">
                <v-btn icon size="small" variant="text" @click="openEdit(g)">
                  <v-icon size="small">mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="onDelete(g.id)"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div v-else-if="!loading" class="text-caption text-medium-emphasis mb-3">
      Sin calificaciones registradas.
    </div>

    <v-form
      v-if="formOpen && !props.readonly"
      ref="formRef"
      @submit.prevent="onSave"
      class="mt-2"
    >
      <v-row class="pa-3">
        <v-col cols="6" md="4">
          <v-text-field
            v-model.number="form.semester_year"
            label="Año *"
            type="number"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="6" md="4">
          <v-select
            v-model="form.semester_period"
            :items="periodOptions"
            label="Periodo *"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="6" md="4">
          <v-text-field
            v-model.number="form.grade"
            label="Calificación"
            type="number"
            min="0"
            max="100"
            step="0.01"
            variant="outlined"
            density="compact"
            :rules="[gradeRule]"
          />
        </v-col>
        <v-col cols="12" sm="8">
          <v-file-input
            v-model="form.file"
            label="Seleccionar documento"
            accept=".pdf,.jpg,.jpeg,.png"
            variant="outlined"
            density="compact"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            :rules="[fileSizeRule]"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-checkbox
            v-model="form.is_original"
            label="Calificación original"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2">
        <v-btn
          type="submit"
          color="primary"
          variant="tonal"
          size="small"
          :loading="saving"
        >
          Guardar
        </v-btn>
        <v-btn size="small" variant="text" @click="cancelForm">Cancelar</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useScholarshipGradesStore } from "@/stores/api/scholarshipGradesStore";
import { API_URL } from "@/constants";
import type { ScholarshipSemesterGrade } from "@/interfaces/scholarship";

const props = defineProps<{
  userId: number;
  readonly?: boolean;
}>();

const store = useScholarshipGradesStore();
const loading = ref(false);
const saving = ref(false);
const formOpen = ref(false);
const formRef = ref();

const grades = computed<ScholarshipSemesterGrade[]>(() =>
  store.getGrades(props.userId),
);

onMounted(async () => {
  loading.value = true;
  await store.fetchGrades(props.userId);
  loading.value = false;
});

const form = reactive<{
  semester_year: number;
  semester_period: 1 | 2;
  grade: number | null;
  is_original: boolean;
  file: File | null;
}>({
  semester_year: new Date().getFullYear(),
  semester_period: 1,
  grade: null,
  is_original: false,
  file: null,
});

const periodOptions = [
  { title: "Ene–Jul", value: 1 },
  { title: "Ago–Dic", value: 2 },
];

const openAdd = (): void => {
  form.semester_year = new Date().getFullYear();
  form.semester_period = 1;
  form.grade = null;
  form.is_original = false;
  form.file = null;
  formOpen.value = true;
};

const openEdit = (g: ScholarshipSemesterGrade): void => {
  form.semester_year = g.semester_year;
  form.semester_period = g.semester_period;
  form.grade = g.grade !== null ? Number(g.grade) : null;
  form.is_original = g.is_original;
  form.file = null;
  formOpen.value = true;
};

const cancelForm = (): void => {
  formOpen.value = false;
};

const onSave = async (): Promise<void> => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  saving.value = true;
  const fd = new FormData();
  fd.append("semester_year", String(form.semester_year));
  fd.append("semester_period", String(form.semester_period));
  if (form.grade !== null) fd.append("grade", String(form.grade));
  fd.append("is_original", form.is_original ? "1" : "0");
  if (form.file) fd.append("file", form.file);

  await store.saveGrade(props.userId, fd);
  formOpen.value = false;
  saving.value = false;
};

const onDelete = async (id: number): Promise<void> => {
  await store.deleteGrade(props.userId, id);
};

const gradeColor = (grade: number): string => {
  if (grade >= 90) return "success";
  if (grade >= 70) return "blue";
  if (grade >= 60) return "warning";
  return "error";
};

const required = (v: unknown): boolean | string =>
  (v !== null && v !== undefined && v !== "") || "Campo requerido.";

const gradeRule = (v: number | null): boolean | string => {
  if (v === null || v === undefined || v === 0) return true; // optional
  return (v >= 0 && v <= 100) || "Entre 0 y 100.";
};

const fileSizeRule = (v: File | null): boolean | string => {
  if (!v) return true;
  return v.size <= 10 * 1024 * 1024 || "Máximo 10 MB.";
};

const fileUrl = (path: string): string => API_URL + "storage/" + path;

defineExpose({ openAdd });
</script>
