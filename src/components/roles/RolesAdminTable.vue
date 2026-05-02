<template>
  <v-data-table
    :headers="headers"
    :items="roles"
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
        <v-menu min-width="300px" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-tooltip location="top">
              <template v-slot:activator="{ props: tooltip }">
                <v-btn
                  color="warning"
                  v-bind="mergeProps(props, tooltip)"
                  variant="text"
                  icon="mdi-filter"
                />
              </template>
              <span>Filtros</span>
            </v-tooltip>
          </template>

          <v-card>
            <v-card-title> <small>Seleccionar filtros</small> </v-card-title>
            <v-divider></v-divider>
            <!-- <v-list style="max-height: 300px; overflow-y: auto">
                      <v-list-item v-for="layer in layers" :key="layer.id" @click="toggleLayer(layer.id)">
                        <template v-slot:prepend>
                          <v-checkbox v-model="selectedLayers" :value="layer.id" hide-details />
                        </template>
                        <v-list-item-title>{{ layer.name }}</v-list-item-title>
                      </v-list-item>
                    </v-list> -->
          </v-card>
        </v-menu>

        <v-spacer></v-spacer>

        <!-- <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
            Agregar
          </v-btn> -->
      </v-toolbar>
    </template>

    <template #[`item.permissions`]="{ item }">
      <ul v-if="item.permissions.length">
        <li v-for="permission in item.permissions" :key="permission.name">
          {{ permission.name }}
        </li>
      </ul>
      <span v-else>Sin permisos adicionales</span>
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
      </div>
    </template>
    <template #no-data> No existen datos registrados </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Role } from "@/interfaces/role";

interface Props {
  roles?: Role[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  loading: false,
});

const search = ref<string>("");

interface DataTableHeader {
  title: string;
  key: string;
}

interface Emits {
  (e: "create"): void;
  (e: "edit", id: number): void;
}

const emit = defineEmits<Emits>();

const headers: DataTableHeader[] = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "name" },
  { title: "Permisos", key: "permissions" },
  { title: "", key: "actions" },
];

const editItem = (item: Role) => emit("edit", item.id);
</script>
