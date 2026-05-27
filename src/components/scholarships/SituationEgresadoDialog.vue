<template>
  <v-dialog v-model="model" max-width="380" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="indigo" size="small">mdi-school-outline</v-icon>
        Egresado
      </v-card-title>

      <v-card-text class="pt-0">
        <p class="text-body-2 text-medium-emphasis mb-3">
          El becario egresa este mes. Se conserva el monto calculado como último pago.
        </p>
        <v-textarea
          v-model="form.resolution_notes"
          label="Observaciones (opcional)"
          rows="2"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn color="indigo" variant="elevated" :loading="loading" @click="submit">
          Confirmar egreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { RecordSituationForm } from "@/interfaces/scholarship";

const props = defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ submit: [form: RecordSituationForm] }>();
const model = defineModel<boolean>();

const form = reactive({ resolution_notes: null as string | null });

watch(model, (v) => { if (!v) form.resolution_notes = null; });

const submit = () => {
  emit("submit", {
    resolution_type: "EGRESADO",
    resolution_notes: form.resolution_notes ?? null,
  });
};
</script>
