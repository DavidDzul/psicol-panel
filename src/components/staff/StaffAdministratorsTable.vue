<template>
  <v-data-table
    :headers="headers"
    :items="administrators"
    :loading="loading"
    class="elevation-1"
    item-value="id"
    density="compact"
  >
    <template #top>
      <v-toolbar :flat="true">
        <v-toolbar-title class="text-subtitle-1">Administradores</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-plus" color="primary" @click="emit('create')">
          Nuevo administrador
        </v-btn>
      </v-toolbar>
    </template>

    <template #[`item.name`]="{ item }">
      <span class="font-weight-bold">{{ item.first_name }} {{ item.last_name }}</span>
    </template>

    <template #[`item.campus`]="{ item }">
      {{ campusMap.get(item.campus)?.text ?? item.campus }}
    </template>

    <template #[`item.role`]="{ item }">
      <template v-if="item.role">
        <v-chip size="small" label>{{ item.role.name }}</v-chip>
        <v-chip v-if="item.role.is_obsolete" size="small" color="warning" class="ml-1">
          obsoleto
        </v-chip>
      </template>
      <template v-else>
        <v-chip size="small" variant="outlined">Sin rol</v-chip>
        <span class="text-caption ml-1">Puede tener accesos desde Accesos.</span>
      </template>
    </template>

    <template #[`item.active`]="{ item }">
      <v-chip size="small" :color="item.active ? 'success' : 'error'">
        {{ item.active ? "Activo" : "Inactivo" }}
      </v-chip>
    </template>

    <template #[`item.actions`]="{ item }">
      <span v-if="!item.is_editable" class="text-caption text-medium-emphasis">Solo lectura</span>
      <slot v-else name="actions" :administrator="item"></slot>
    </template>

    <template #no-data>No existen administradores registrados</template>
  </v-data-table>
</template>

<script setup lang="ts">
import { campusMap } from "@/constants";
import type { StaffAdministrator } from "@/interfaces/staff";

interface Props {
  administrators?: StaffAdministrator[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), { administrators: () => [], loading: false });

const emit = defineEmits<{ (e: "create"): void }>();

const headers = [
  { title: "Nombre", key: "name", sortable: false },
  { title: "Correo", key: "email" },
  { title: "Sede", key: "campus" },
  { title: "Rol", key: "role", sortable: false },
  { title: "Estado", key: "active" },
  { title: "Acciones", key: "actions", sortable: false },
];
</script>
