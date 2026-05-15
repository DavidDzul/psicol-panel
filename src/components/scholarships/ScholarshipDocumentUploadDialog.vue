<template>
  <v-dialog v-model="model" max-width="500" persistent>
    <v-card>
      <v-card-title class="pa-4">Subir documento</v-card-title>
      <v-card-text>
        <v-select
          v-model="form.document_type"
          :items="documentTypeOptions"
          label="Tipo de documento"
          variant="outlined"
          density="compact"
          class="mb-3"
        />
        <v-file-input
          v-model="file"
          label="Archivo (PDF, JPG, PNG — máx. 10 MB)"
          accept=".pdf,.jpg,.jpeg,.png"
          variant="outlined"
          density="compact"
          prepend-icon="mdi-paperclip"
          :rules="[fileSizeRule]"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!form.document_type || !file"
          @click="submit"
        >
          Subir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { DocumentType } from "@/interfaces/scholarship";

const props = defineProps<{
  modelValue: boolean;
  userId: number;
  periodYear: number;
  periodMonth: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  upload: [formData: FormData];
}>();

const model = ref<boolean>(props.modelValue);
const file  = ref<File | null>(null);
const form  = reactive<{ document_type: DocumentType | "" }>({ document_type: "" });

watch(() => props.modelValue, (v) => {
  model.value = v;
  if (v) {
    file.value = null;
    form.document_type = "";
  }
});
watch(model, (v) => emit("update:modelValue", v));

const fileSizeRule = (f: File | null): boolean | string => {
  if (!f) return true;
  return f.size <= 10 * 1024 * 1024 || "El archivo no puede superar 10 MB.";
};

const submit = (): void => {
  if (!file.value || !form.document_type) return;
  const fd = new FormData();
  fd.append("file", file.value);
  fd.append("user_id", String(props.userId));
  fd.append("document_type", form.document_type);
  fd.append("period_year", String(props.periodYear));
  fd.append("period_month", String(props.periodMonth));
  emit("upload", fd);
};

const documentTypeOptions = [
  { title: "Calificaciones originales",  value: "CALIFICACIONES_ORIGINALES" },
  { title: "Constancia de estudios",     value: "CONSTANCIA_ESTUDIOS" },
  { title: "Comprobante de pago",        value: "COMPROBANTE_PAGO" },
  { title: "Justificante médico",        value: "JUSTIFICANTE_MEDICO" },
  { title: "Otro",                       value: "OTRO" },
];
</script>
