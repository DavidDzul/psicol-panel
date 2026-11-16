<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480px"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.stop.esc="close"
  >
    <v-card>
      <v-toolbar dark>
        <v-toolbar-title>Nuevo rol</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon aria-label="Cerrar" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text>
        <v-text-field
          :model-value="name"
          label="Nombre del rol"
          :hint="NAME_HINT"
          persistent-hint
          :error-messages="nameError"
          @update:model-value="onInput"
        ></v-text-field>
        <v-alert v-if="serverError" type="error" variant="tonal" class="mt-4" density="compact">
          {{ serverError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">Crear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface Props {
  modelValue: boolean;
  loading?: boolean;
  serverError?: string | null;
}

const props = withDefaults(defineProps<Props>(), { loading: false, serverError: null });

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", name: string): void;
}>();

const NAME_PATTERN = /^[A-Z][A-Z0-9_]{2,49}$/;
const NAME_HINT =
  "Solo mayúsculas, números y guion bajo; empieza con letra y tiene de 3 a 50 caracteres.";

const name = ref("");
const touched = ref(false);

const nameError = computed(() =>
  touched.value && !NAME_PATTERN.test(name.value) ? NAME_HINT : "",
);

const onInput = (value: string | null): void => {
  name.value = (value ?? "").toUpperCase();
};

const submit = (): void => {
  touched.value = true;
  if (!NAME_PATTERN.test(name.value)) return;
  emit("submit", name.value);
};

const close = (): void => emit("update:modelValue", false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = "";
      touched.value = false;
    }
  },
);
</script>
