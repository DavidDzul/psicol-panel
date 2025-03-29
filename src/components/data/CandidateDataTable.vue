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

<script setup>
import { computed, ref, mergeProps } from "vue";
import dayjs from "dayjs";

import { campusMap, userTypeMap, jobTypeMap } from "@/constants";

const props = defineProps({
  candidates: { type: Array, default: () => [] },
  areas: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const getAreaName = (areaId) => {
  const area = props.areas.find((area) => area.id === areaId);
  return area ? area.name : "Área no encontrada";
};

const emit = defineEmits(["remove", "edit"]);

const headers = computed(() => [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Usuario",
    key: "user_type",
  },
  {
    title: "Sede",
    key: "campus",
  },
  {
    title: "Tipo de trabajo",
    key: "job_type",
  },
  {
    title: "Área",
    key: "area_id",
  },
  {
    title: "Total",
    key: "count",
  },
  {
    title: "",
    key: "actions",
  },
]);


</script>
