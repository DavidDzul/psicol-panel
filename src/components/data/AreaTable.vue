<template>
  <v-data-table
    :headers="headers"
    :items="areas"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
  >
    <template #top>
      <v-toolbar :flat="true">
        <v-text-field
          class="ml-5 mr-3"
          v-model="search"
          hide-details
          prepend-icon="mdi-magnify"
          density="compact"
          single-line
          label="Buscar"
          :clearable="true"
        ></v-text-field>

        <!-- <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
          Agregar
        </v-btn> -->
      </v-toolbar>
    </template>

    <template #[`item.actions`]="{ item }">
      <div style="width: 100%; text-align: right">
        <v-tooltip text="Editar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="warning"
              density="comfortable"
              icon="mdi-pencil"
              class="mr-2"
              size="small"
              @click="editItem(item)"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Eliminar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="error"
              density="comfortable"
              icon="mdi-delete"
              class="mr-2"
              size="small"
              @click="deleteItem(item)"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>
    <template #no-data> No existen datos registrados </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Area } from "@/interfaces/data";

interface Props {
  areas?: Area[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  areas: () => [],
  loading: false,
});

const search = ref("");

interface Emits {
  (e: "delete", id: number): void;
  (e: "edit", id: number): void;
}

const emit = defineEmits<Emits>();

interface DataTableHeader {
  title: string;
  key: string;
}

const headers: DataTableHeader[] = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "name" },
  { title: "", key: "actions" },
];

const editItem = (item: Area) => emit("edit", item.id);
const deleteItem = (item: Area) => emit("delete", item.id);
</script>
