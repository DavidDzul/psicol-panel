<template>
  <v-dialog v-model="model" max-width="500" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="observations"
          label="Observaciones (opcional)"
          rows="4"
          variant="outlined"
          counter="2000"
          maxlength="2000"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          @click="submit"
        >
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ReviewForm } from "@/interfaces/scholarship";

const props = defineProps<{
  modelValue: boolean;
  title: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [form: ReviewForm];
}>();

const model = ref<boolean>(props.modelValue);
const observations = ref<string>("");

watch(() => props.modelValue, (v) => {
  model.value = v;
  if (v) observations.value = "";
});
watch(model, (v) => emit("update:modelValue", v));

const submit = (): void => {
  emit("submit", { observations: observations.value || null });
};
</script>
