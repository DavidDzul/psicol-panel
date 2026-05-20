<template>
  <v-dialog v-model="model" max-width="500" persistent>
    <v-card>
      <v-card-title class="pa-4">Subir documento</v-card-title>
      <v-card-text>
        <v-select
          v-model="form.document_type"
          :items="documentTypeOptions"
          label="Tipo de documento *"
          variant="outlined"
          density="compact"
          class="mb-3"
        />

        <v-text-field
          v-if="form.document_type === 'OTRO'"
          v-model="form.description"
          label="Descripción del documento *"
          variant="outlined"
          density="compact"
          maxlength="255"
          class="mb-3"
          :rules="[requiredIfOtro]"
        />

        <v-file-input
          v-model="file"
          label="Archivo (PDF, JPG, PNG — máx. 10 MB)"
          accept=".pdf,.jpg,.jpeg,.png"
          variant="outlined"
          density="compact"
          prepend-icon="mdi-paperclip"
          :rules="[fileSizeRule]"
          class="mb-3"
        />

        <v-textarea
          v-model="form.observations"
          label="Observaciones (opcional)"
          variant="outlined"
          density="compact"
          rows="2"
          maxlength="2000"
          auto-grow
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!canSubmit"
          @click="submit"
        >
          Subir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
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
const form  = reactive<{
  document_type: DocumentType | "";
  description: string;
  observations: string;
}>({
  document_type: "",
  description:   "",
  observations:  "",
});

watch(() => props.modelValue, (v) => {
  model.value = v;
  if (v) {
    file.value             = null;
    form.document_type     = "";
    form.description       = "";
    form.observations      = "";
  }
});
watch(model, (v) => emit("update:modelValue", v));

const canSubmit = computed((): boolean => {
  if (!form.document_type || !file.value) return false;
  if (form.document_type === "OTRO" && !form.description.trim()) return false;
  return true;
});

const fileSizeRule = (f: File | null): boolean | string => {
  if (!f) return true;
  return f.size <= 10 * 1024 * 1024 || "El archivo no puede superar 10 MB.";
};

const requiredIfOtro = (v: string): boolean | string =>
  v.trim().length > 0 || "La descripción es requerida para tipo Otro.";

const submit = (): void => {
  if (!canSubmit.value || !file.value) return;
  const fd = new FormData();
  fd.append("file",          file.value);
  fd.append("user_id",       String(props.userId));
  fd.append("document_type", form.document_type);
  fd.append("period_year",   String(props.periodYear));
  fd.append("period_month",  String(props.periodMonth));
  if (form.document_type === "OTRO" && form.description.trim()) {
    fd.append("description", form.description.trim());
  }
  if (form.observations.trim()) {
    fd.append("observations", form.observations.trim());
  }
  emit("upload", fd);
};

const documentTypeOptions = [
  { title: "Constancia de estudios", value: "CONSTANCIA_ESTUDIOS" },
  { title: "Comprobante de pago",    value: "COMPROBANTE_PAGO"    },
  { title: "Justificante médico",    value: "JUSTIFICANTE_MEDICO" },
  { title: "Otro",                   value: "OTRO"                },
];
</script>
