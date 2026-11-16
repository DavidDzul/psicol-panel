<template>
  <div class="d-flex ga-1">
    <v-btn size="small" variant="text" prepend-icon="mdi-account-switch" @click="emit('assign')">
      Cambiar rol
    </v-btn>
    <v-btn size="small" variant="text" prepend-icon="mdi-lock-reset" @click="emit('reset')">
      Restablecer contraseña
    </v-btn>
    <v-btn
      size="small"
      variant="text"
      :color="administrator.active ? 'error' : 'success'"
      :prepend-icon="administrator.active ? 'mdi-account-off' : 'mdi-account-check'"
      @click="emit('toggle')"
    >
      {{ administrator.active ? "Desactivar" : "Activar" }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { StaffAdministrator } from "@/interfaces/staff";

defineProps<{ administrator: StaffAdministrator }>();
const emit = defineEmits<{ (e: "assign"): void; (e: "reset"): void; (e: "toggle"): void }>();
</script>
