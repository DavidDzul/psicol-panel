<template>
  <v-data-table
    :headers="headers"
    :items="roles"
    :loading="loading"
    class="elevation-1"
    item-value="id"
    density="compact"
  >
    <template #top>
      <v-toolbar :flat="true">
        <v-toolbar-title class="text-subtitle-1">Roles de administración</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-plus" color="primary" @click="emit('create')">Nuevo rol</v-btn>
      </v-toolbar>
    </template>

    <template #[`item.name`]="{ item }">
      <span class="font-weight-bold">{{ item.name }}</span>
    </template>

    <template #[`item.permissions_count`]="{ item }">
      {{ item.permissions_ids.length }}
    </template>

    <template #[`item.actions`]="{ item }">
      <v-btn
        variant="text"
        color="warning"
        icon="mdi-pencil"
        size="small"
        aria-label="Editar permisos"
        @click="emit('edit', item)"
      />
    </template>

    <template #no-data>No existen roles registrados</template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { StaffRole } from "@/interfaces/staff";

interface Props {
  roles?: StaffRole[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), { roles: () => [], loading: false });

const emit = defineEmits<{
  (e: "create"): void;
  (e: "edit", role: StaffRole): void;
}>();

const headers = [
  { title: "Rol", key: "name" },
  { title: "Usuarios", key: "users_count" },
  { title: "Permisos", key: "permissions_count", sortable: false },
  { title: "Acciones", key: "actions", sortable: false },
];
</script>
