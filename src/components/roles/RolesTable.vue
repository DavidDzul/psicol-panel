<template>
  <v-data-table
    :headers="headers"
    :items="filterRoles"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
    density="compact"
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
      <span class="font-weight-bold">{{
        rolesMap.get(item?.name)?.text || item.name
      }}</span>
    </template>

    <template #[`item.num_visualizations`]="{ item }">
      <v-chip
        v-if="item.configuration?.unlimited_visualizations"
        size="x-small"
        color="success"
        >Ilimitado</v-chip
      >
      <span v-else>{{ item.configuration?.num_visualizations ?? 0 }}</span>
    </template>

    <template #[`item.vacancies_summary`]="{ item }">
      <div class="d-flex flex-column py-2" style="gap: 4px">
        <div class="text-caption">
          <strong>Laborales: </strong>
          <span
            v-if="item.configuration?.unlimited_jobs"
            class="text-success text-uppercase"
            >Ilimitado</span
          >
          <span v-else>{{ item.configuration?.num_job_vacancies }}</span>
        </div>
        <div class="text-caption">
          <strong>Profs: </strong>
          <span
            v-if="item.configuration?.unlimited_professionals"
            class="text-success text-uppercase"
            >Ilimitado</span
          >
          <span v-else>{{
            item.configuration?.num_professional_vacancies
          }}</span>
        </div>
        <div class="text-caption">
          <strong>Jr: </strong>
          <span
            v-if="item.configuration?.unlimited_jr"
            class="text-success text-uppercase"
            >Ilimitado</span
          >
          <span v-else>{{ item.configuration?.num_jr_vacancies }}</span>
        </div>
      </div>
    </template>

    <template #[`item.permissions`]="{ item }">
      <v-tooltip location="top" v-if="item.permissions?.length">
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
      <span v-else class="text-caption text-grey">Ninguno</span>
    </template>

    <template #[`item.actions`]="{ item }">
      <v-btn
        variant="text"
        color="warning"
        icon="mdi-pencil"
        size="small"
        @click="editItem(item)"
      />
    </template>

    <template #no-data> No existen datos registrados </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref, mergeProps } from "vue";
import { rolesMap, permissionsMap } from "@/constants";
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

interface Emits {
  (e: "create"): void;
  (e: "edit", id: number): void;
}

const emit = defineEmits<Emits>();

const headers = [
  { title: "ID", key: "id" },
  { title: "Nombre del Rol", key: "name" },
  { title: "Permisos", key: "permissions" },
  { title: "Capacidad de Vacantes", key: "vacancies_summary" },
  { title: "Visualizaciones", key: "num_visualizations" },
  { title: "Acciones", key: "actions" },
];

const getPermissionName = (permissionName: string): string =>
  permissionsMap.get(permissionName)?.text ?? permissionName;

const editItem = (item: Role) => emit("edit", item.id);

const filterRoles = computed(() =>
  props.roles.filter((r) => !["ROOT", "CAMPUS", "YUCATAN"].includes(r.name)),
);
</script>
