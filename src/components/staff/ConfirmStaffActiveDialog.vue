<template>
  <v-dialog
    :model-value="target !== null"
    max-width="460px"
    persistent
    @keydown.stop.esc="emit('cancel')"
  >
    <v-card v-if="target">
      <v-toolbar dark>
        <v-toolbar-title>{{ target.active ? "Desactivar" : "Activar" }} administrador</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <p v-if="target.active">
          {{ target.first_name }} {{ target.last_name }} no podrá iniciar sesión y se cerrarán sus
          sesiones activas.
        </p>
        <p v-else>
          {{ target.first_name }} {{ target.last_name }} podrá iniciar sesión de nuevo. Sus
          sesiones anteriores no se restauran.
        </p>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn :color="target.active ? 'error' : 'primary'" :loading="loading" @click="emit('confirm')">
          {{ target.active ? "Desactivar" : "Activar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { StaffAdministrator } from "@/interfaces/staff";

interface Props {
  target: StaffAdministrator | null;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), { loading: false });

const emit = defineEmits<{ (e: "confirm"): void; (e: "cancel"): void }>();
</script>
