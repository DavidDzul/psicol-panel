<template>
  <v-dialog
    :model-value="target !== null"
    max-width="480px"
    persistent
    @keydown.stop.esc="emit('close')"
  >
    <v-card v-if="target">
      <v-toolbar dark>
        <v-toolbar-title>Restablecer contraseña</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <p class="mb-2">{{ target.first_name }} {{ target.last_name }} ({{ target.email }})</p>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Se cerrarán las sesiones activas de este usuario.
        </v-alert>
        <v-text-field
          v-model="password"
          type="password"
          label="Nueva contraseña"
          autocomplete="new-password"
          :error-messages="shown.password"
        />
        <v-text-field
          v-model="confirmation"
          type="password"
          label="Confirmar contraseña"
          autocomplete="new-password"
          :error-messages="shown.confirmation"
        />
        <v-alert v-if="serverError" type="error" variant="tonal" density="compact">
          {{ serverError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('close')">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">Restablecer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ResetStaffPasswordPayload, StaffAdministrator } from "@/interfaces/staff";

interface Props {
  target: StaffAdministrator | null;
  loading?: boolean;
  serverError?: string | null;
}

const props = withDefaults(defineProps<Props>(), { loading: false, serverError: null });

const emit = defineEmits<{
  (e: "submit", payload: ResetStaffPasswordPayload): void;
  (e: "close"): void;
}>();

const password = ref("");
const confirmation = ref("");
const touched = ref(false);

// Free-form passwords (decision-pr4b): required + confirmation match, no minimum length.
const errors = computed(() => ({
  password: password.value ? undefined : "Campo requerido",
  confirmation: !confirmation.value
    ? "Campo requerido"
    : confirmation.value !== password.value
      ? "Las contraseñas no coinciden."
      : undefined,
}));
const shown = computed<{ password?: string; confirmation?: string }>(() =>
  touched.value ? errors.value : {},
);

// Fresh fields every time the dialog opens: a typed password must never linger.
watch(
  () => props.target,
  () => {
    password.value = "";
    confirmation.value = "";
    touched.value = false;
  },
);

const submit = (): void => {
  touched.value = true;
  if (errors.value.password || errors.value.confirmation) return;
  emit("submit", { password: password.value, password_confirmation: confirmation.value });
};
</script>
