<template>
  <v-data-table
    :headers="headers"
    :items="positions"
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

        <v-btn prepend-icon="mdi-plus" color="primary">
          AGREGAR
          <v-menu activator="parent">
            <v-list>
              <v-list-item @click="$emit('laboral')">
                <v-list-item-title>
                  <v-icon>mdi-account</v-icon> Vacante
                  laboral</v-list-item-title
                >
              </v-list-item>
              <v-list-item @click="$emit('junior')">
                <v-list-item-title>
                  <v-icon>mdi-account-minus</v-icon> Vacante
                  Jr</v-list-item-title
                >
              </v-list-item>
              <v-list-item @click="$emit('practice')">
                <v-list-item-title>
                  <v-icon>mdi-account-outline</v-icon> Prácticas
                  profesionales</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </v-toolbar>
    </template>
    <!-- <template #[`item.name`]="{ item }">
      {{ rolesMap.get(item.name).text }}
    </template> -->
    <template #[`item.category`]="{ item }">
      {{ vacantTypeMap.get(item.category).text }}
    </template>
    <template #[`item.status`]="{ item }">
      <v-icon v-if="item.status" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>
    <template #[`item.created_at`]="{ item }">
      {{ dayjs(item.created_at).format("DD/MM/YYYY HH:mm:ss") }}
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
        <v-tooltip v-if="item.status" text="Desactivar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="error"
              density="comfortable"
              icon="mdi-cancel"
              class="mr-2"
              size="small"
              @click="disabledItem(item)"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip v-else text="Activar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="success"
              density="comfortable"
              icon="mdi-check"
              class="mr-2"
              size="small"
              @click="enableItem(item)"
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

import { vacantTypeMap } from "@/constants";

const props = defineProps({
  positions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const emit = defineEmits([
  "show",
  "disabled",
  "laboral",
  "junior",
  "practice",
  "enable",
]);

const headers = computed(() => [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Nombre",
    key: "vacant_name",
  },
  {
    title: "Tipo",
    key: "category",
  },
  {
    title: "Activo",
    key: "status",
  },
  {
    title: "Empresa",
    key: "business.bs_name",
  },
  {
    title: "Creación",
    key: "created_at",
  },
  {
    title: "",
    key: "actions",
  },
]);

const formattedHistory = (time) => {
  const date = dayjs(time);
  return dayjs().to(date);
};

const showItem = (item) => {
  emit("show", item.id);
};

const disabledItem = (item) => {
  emit("disabled", item.id);
};

const enableItem = (item) => {
  emit("enable", item.id);
};
</script>
