<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

    <!-- Vista de retícula existente -->
    <template v-if="!editing">
      <div v-if="hasReticula" class="d-flex align-center flex-wrap ga-4 mb-3">
        <div>
          <div class="text-caption text-medium-emphasis">Inicio de carrera</div>
          <div class="text-body-2 font-weight-medium">{{ profile!.reticula_start_date }}</div>
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">Fin de carrera</div>
          <div class="text-body-2 font-weight-medium">{{ profile!.reticula_end_date }}</div>
        </div>
        <div v-if="profile!.reticula_original_name">
          <div class="text-caption text-medium-emphasis">Documento</div>
          <div class="text-body-2 d-flex align-center ga-1">
            <v-icon size="small" color="primary">mdi-file-pdf-box</v-icon>
            {{ profile!.reticula_original_name }}
          </div>
        </div>
        <v-spacer />
        <v-btn size="small" variant="tonal" @click="startEdit">Editar retícula</v-btn>
      </div>

      <v-alert
        v-else-if="!loading"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        No se ha registrado la retícula. Es necesaria para validar el periodo de pago.
        <template #append>
          <v-btn size="small" variant="text" @click="startEdit">Registrar</v-btn>
        </template>
      </v-alert>
    </template>

    <!-- Formulario de edición -->
    <v-form v-if="editing" ref="formRef" @submit.prevent="onSave">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.reticula_start_date"
            label="Inicio de carrera *"
            type="date"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.reticula_end_date"
            label="Fin de carrera *"
            type="date"
            variant="outlined"
            density="compact"
            :rules="[required, afterStart]"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-file-input
            v-model="form.file"
            label="Documento de retícula"
            accept=".pdf,.jpg,.jpeg,.png"
            variant="outlined"
            density="compact"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            :rules="[fileSizeRule]"
            clearable
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2 mt-1">
        <v-btn type="submit" color="primary" variant="tonal" size="small" :loading="saving">
          Guardar
        </v-btn>
        <v-btn size="small" variant="text" @click="cancelEdit">Cancelar</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { ScholarshipProfile } from "@/interfaces/scholarship";

const props = defineProps<{
  userId: number;
  profile: ScholarshipProfile | null;
}>();

const emit = defineEmits<{
  (e: "updated", profile: ScholarshipProfile): void;
}>();

const store   = useScholarshipStore();
const loading = ref(false);
const saving  = ref(false);
const editing = ref(false);
const formRef = ref();

const form = reactive<{
  reticula_start_date: string;
  reticula_end_date: string;
  file: File | null;
}>({
  reticula_start_date: "",
  reticula_end_date: "",
  file: null,
});

const hasReticula = computed(() =>
  !!(props.profile?.reticula_start_date && props.profile?.reticula_end_date)
);

const startEdit = (): void => {
  form.reticula_start_date = props.profile?.reticula_start_date ?? "";
  form.reticula_end_date   = props.profile?.reticula_end_date ?? "";
  form.file = null;
  editing.value = true;
};

const cancelEdit = (): void => {
  editing.value = false;
};

const onSave = async (): Promise<void> => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  saving.value = true;
  const fd = new FormData();
  fd.append("reticula_start_date", form.reticula_start_date);
  fd.append("reticula_end_date", form.reticula_end_date);
  if (form.file) fd.append("file", form.file);

  const result = await store.uploadReticula(props.userId, fd);
  if (result) {
    emit("updated", result);
    editing.value = false;
  }
  saving.value = false;
};

const required = (v: unknown): boolean | string =>
  (v !== null && v !== undefined && v !== "") || "Campo requerido.";

const afterStart = (v: string): boolean | string => {
  if (!v || !form.reticula_start_date) return true;
  return v > form.reticula_start_date || "Debe ser posterior al inicio.";
};

const fileSizeRule = (v: File | null): boolean | string => {
  if (!v) return true;
  return v.size <= 20 * 1024 * 1024 || "El archivo no debe superar 20 MB.";
};
</script>
