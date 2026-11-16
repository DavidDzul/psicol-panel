<template>
  <v-dialog
    :model-value="target !== null"
    max-width="480px"
    persistent
    @keydown.stop.esc="emit('close')"
  >
    <v-card v-if="target">
      <v-toolbar dark>
        <v-toolbar-title>Cambiar rol</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <p class="mb-2">{{ target.first_name }} {{ target.last_name }} ({{ target.email }})</p>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Al cambiar el rol se cerrarán las sesiones activas de este usuario.
        </v-alert>
        <v-select
          v-model="roleId"
          :items="roles"
          item-title="name"
          item-value="id"
          label="Rol"
          :error-messages="touched && roleId === null ? 'Campo requerido' : undefined"
        />
        <v-alert v-if="serverError" type="error" variant="tonal" density="compact">
          {{ serverError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('close')">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { StaffAdministrator, StaffRole } from "@/interfaces/staff";

interface Props {
  target: StaffAdministrator | null;
  roles?: StaffRole[];
  loading?: boolean;
  serverError?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  loading: false,
  serverError: null,
});

const emit = defineEmits<{
  (e: "submit", roleId: number): void;
  (e: "close"): void;
}>();

const roleId = ref<number | null>(null);
const touched = ref(false);

// Preselect the current role; an obsolete one (YUCATAN) is not assignable, so it starts empty.
watch(
  () => props.target,
  (target) => {
    touched.value = false;
    const current = target?.role?.id ?? null;
    roleId.value = props.roles.some((role) => role.id === current) ? current : null;
  },
  { immediate: true },
);

const submit = (): void => {
  touched.value = true;
  if (roleId.value === null) return;
  emit("submit", roleId.value);
};
</script>
