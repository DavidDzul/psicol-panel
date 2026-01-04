<template>
  <v-data-table
    :headers="headers"
    :items="filterRoles"
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
    <template #[`item.name`]="{ item }">
      {{ rolesMap.get(item?.name)?.text }}
    </template>
    <template #[`item.num_visualizations`]="{ item }">
      {{
        item?.configuration?.unlimited
          ? "---"
          : item?.configuration?.num_visualizations
      }}
    </template>
    <template #[`item.num_vacancies`]="{ item }">
      {{
        item?.configuration?.unlimited
          ? "---"
          : item?.configuration?.num_vacancies
      }}
    </template>
    <template #[`item.permissions`]="{ item }">
      <v-tooltip location="top" v-if="item.permissions.length">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="tonal"
            size="x-small"
            rounded="lg"
            color="secondary"
          >
            {{ item.permissions.length }} permisos
          </v-btn>
        </template>

        <div class="pa-1">
          <div v-for="p in item.permissions" :key="p.id" class="text-caption">
            • {{ getPermissionName(p.name) }}
          </div>
        </div>
      </v-tooltip>

      <span v-else class="text-caption text-grey-disabled">Ninguno</span>
    </template>
    <template #[`item.unlimited`]="{ item }">
      <v-icon v-if="item?.configuration?.unlimited" color="success"
        >mdi-check</v-icon
      >
      <v-icon v-else color="error">mdi-close</v-icon>
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

<script setup>
import { computed, ref, mergeProps } from "vue";
import dayjs from "dayjs";

import { rolesMap, permissionsMap } from "@/constants";

const props = defineProps({
  roles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const emit = defineEmits(["create", "edit"]);

const headers = computed(() => [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Nombre",
    key: "name",
  },
  {
    title: "Permisos",
    key: "permissions",
  },
  {
    title: "N. de visualizaciones",
    key: "num_visualizations",
  },
  {
    title: "N. de vacantes",
    key: "num_vacancies",
  },
  {
    title: "Ilimitado",
    key: "unlimited",
  },

  {
    title: "",
    key: "actions",
  },
]);

const getPermissionName = (permissionName) => {
  return permissionsMap.get(permissionName)?.text || permissionName;
};

const editItem = (item) => {
  emit("edit", item.id);
};

const filterRoles = computed(() => {
  return props.roles.filter(
    (map) => !["ROOT", "CAMPUS", "YUCATAN"].includes(map.name)
  );
});
</script>
