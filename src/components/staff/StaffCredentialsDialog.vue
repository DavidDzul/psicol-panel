<template>
  <v-dialog
    :model-value="credentials !== null"
    max-width="480px"
    persistent
    @keydown.stop.esc="emit('close')"
  >
    <v-card v-if="credentials">
      <v-toolbar dark>
        <v-toolbar-title>Credenciales de acceso</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          Esta contraseña no se volverá a mostrar. Cópiala y compártela de forma segura antes de
          cerrar.
        </v-alert>
        <p><strong>Correo:</strong> {{ credentials.email }}</p>
        <p><strong>Contraseña:</strong> <code>{{ credentials.password }}</code></p>
        <p v-if="copied" class="text-success mt-2">Copiado al portapapeles.</p>
        <p v-if="copyFailed" class="text-error mt-2">
          No se pudo copiar. Selecciona el texto y cópialo manualmente.
        </p>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" prepend-icon="mdi-content-copy" @click="copy">Copiar</v-btn>
        <v-btn color="primary" @click="emit('close')">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { OneTimeCredentials } from "@/composables/useStaffAdministratorsPage";

interface Props {
  credentials: OneTimeCredentials | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "close"): void }>();

const copied = ref(false);
const copyFailed = ref(false);

const copy = async (): Promise<void> => {
  if (!props.credentials) return;
  copied.value = false;
  copyFailed.value = false;
  try {
    await navigator.clipboard.writeText(
      `Correo: ${props.credentials.email}\nContraseña: ${props.credentials.password}`,
    );
    copied.value = true;
  } catch {
    copyFailed.value = true;
  }
};

watch(
  () => props.credentials,
  () => {
    copied.value = false;
    copyFailed.value = false;
  },
);
</script>
