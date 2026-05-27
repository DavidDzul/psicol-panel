<template>
  <v-dialog v-model="model" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="red-darken-2" size="small">mdi-account-off-outline</v-icon>
        Baja definitiva
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
        <v-radio-group v-model="form.resolution_cause" class="mt-0 mb-3" hide-details>
          <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="red-darken-2" />
          <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="red-darken-2" />
          <v-radio label="Dejó la escuela por problemas personales" value="DEJO_ESCUELA_PERSONALES" color="red-darken-2" />
          <v-radio label="Dejó la escuela por falta de orientación vocacional" value="DEJO_ESCUELA_VOCACIONAL" color="red-darken-2" />
          <v-radio label="Desapareció sin avisar" value="DESAPARECIO" color="red-darken-2" />
          <v-radio label="Faltas al reglamento" value="FALTAS_REGLAMENTO" color="red-darken-2" />
          <v-radio label="Otro" value="OTRO" color="red-darken-2" />
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
        <v-btn color="red-darken-2" variant="elevated" :loading="loading" :disabled="!isValid" @click="submit">
          Confirmar baja
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

const form = reactive({ resolution_cause: null as string | null, resolution_notes: null as string | null });

watch(model, (v) => { if (!v) { form.resolution_cause = null; form.resolution_notes = null; } });

const isValid = computed(() =>
  !!form.resolution_cause &&
  (form.resolution_cause !== "OTRO" || !!form.resolution_notes?.trim())
);

const submit = () => {
  if (!isValid.value) return;
  emit("submit", {
    resolution_type: "BAJA_DEFINITIVA",
    resolution_cause: form.resolution_cause,
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
