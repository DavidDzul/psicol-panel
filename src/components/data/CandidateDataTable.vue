<template>
  <v-data-table
    :headers="headers"
    :items="candidates"
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

        <!-- <v-spacer></v-spacer>

        <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
          Agregar
        </v-btn> -->
      </v-toolbar>
    </template>
    <template #['item.area_id']="{ item }">
        {{ getAreaName(item.area_id) }}
    </template>
    <template #[`item.user_type`]="{ item }">
      {{ userTypeMap.get(item.user_type).text }}
    </template>
    <template #[`item.campus`]="{ item }">
      {{ campusMap.get(item.campus).text }}
    </template>
    <template #['item.job_type']="{ item }">
        {{ jobTypeMap.get(item.job_type).text }}
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
              @click="$emit('edit', item.id)"
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
              @click="$emit('remove', item.id)"

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
import type { CandidateData, Area } from "@/interfaces/data";
import { campusMap, userTypeMap, jobTypeMap } from "@/constants";

interface Props {
  candidates?: CandidateData[];
  areas?: Area[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  candidates: () => [],
  areas: () => [],
  loading: false,
});

const search = ref<string>("");

interface DataTableHeader {
  title: string;
  key: string;
}

const headers: DataTableHeader[] = [
  { title: "ID", key: "id" },
  { title: "Usuario", key: "user_type" },
  { title: "Sede", key: "campus" },
  { title: "Tipo de trabajo", key: "job_type" },
  { title: "Área", key: "area_id" },
  { title: "Total", key: "count" },
  { title: "", key: "actions" },
];

const getAreaName = (areaId: number): string => {
  const area = props.areas.find((a) => a.id === areaId);
  return area ? area.name : "Área no encontrada";
};
</script>
