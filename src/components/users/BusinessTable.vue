<template>
  <v-data-table
    :headers="headers"
    :items="business"
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

        <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
          Agregar
        </v-btn>
      </v-toolbar>
    </template>
    <template #[`item.active`]="{ item }">
      <v-icon v-if="item.active" color="success">mdi-check</v-icon>
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
  business: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const emit = defineEmits(["create", "edit", "show"]);

const headers = computed(() => [
  {
    title: "Nombre(s)",
    key: "first_name",
  },
  {
    title: "Apellido(s)",
    key: "last_name",
  },
  {
    title: "Correo electrónico",
    key: "email",
  },
  {
    title: "Empresa",
    key: "business_data.bs_name",
  },
  {
    title: "Activo",
    key: "active",
  },
  {
    title: "",
    key: "actions",
  },
]);

const editItem = (item) => {
  emit("edit", item.id);
};

const showItem = (item) => {
  emit("show", item.id);
};
</script>
