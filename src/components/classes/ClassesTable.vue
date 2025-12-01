<template>
  <v-data-table
    :headers="headers"
    :items="classes"
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

        <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
          Agregar
        </v-btn>
      </v-toolbar>
    </template>
    <template #[`item.generation_active`]="{ item }">
      <v-icon v-if="item.generation_active" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>
    <template #[`item.campus`]="{ item }">
      {{ campusMap.get(item.campus).text }}
    </template>
    <template #[`item.date`]="{ item }">
      {{ dayjs(item.date).format("DD-MM-YYYY") }}
    </template>
    <template #[`item.actions`]="{ item }">
      <div style="width: 100%; text-align: right">
        <v-tooltip text="Visualizar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="warning"
              density="comfortable"
              icon="mdi-eye"
              class="mr-2"
              size="small"
              @click="showItem(item)"
            >
            </v-btn>
          </template>
        </v-tooltip>
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

<script setup>
import { computed, ref, mergeProps } from "vue";
import dayjs from "dayjs";

import { campusMap } from "@/constants";

const props = defineProps({
  classes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const emit = defineEmits(["create", "edit", "delete", "show"]);

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
    title: "Fecha",
    key: "date",
  },
  {
    title: "H. Inicio",
    key: "start_time",
  },
  {
    title: "H. Fin",
    key: "end_time",
  },
  // {
  //   title: "Sede",
  //   key: "campus",
  // },
  // {
  //   title: "Generación",
  //   key: "generation_name",
  // },
  {
    title: "",
    key: "actions",
  },
]);

const editItem = (item) => {
  emit("edit", item.id);
};

const deleteItem = (item) => {
  emit("delete", item.id);
};

const showItem = (item) => {
  emit("show", item.id);
};
</script>
