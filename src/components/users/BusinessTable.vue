<template>
  <v-data-table
    :headers="headers"
    :items="filteredTable"
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
            <v-card-text>
              <v-row>
                <v-col cols="12" lg="12">
                  <v-select
                    clearable
                    :items="userCampus"
                    v-model="campus"
                    item-title="text"
                    item-value="value"
                    label="Sede"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-menu>

        <v-spacer></v-spacer>

        <v-btn
          v-if="create"
          prepend-icon="mdi-plus"
          color="primary"
          @click="$emit('create')"
        >
          Agregar
        </v-btn>
      </v-toolbar>
    </template>
    <template #[`item.role`]="{ item }">
      {{ roleMap.get(item?.role?.name)?.text }}
    </template>
    <template #[`item.active`]="{ item }">
      <v-icon v-if="item.active" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>

    <template #[`item.actions`]="{ item }">
      <div style="width: 100%; text-align: right">
        <!-- <v-tooltip text="Editar" location="bottom">
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
        </v-tooltip> -->
        <v-tooltip v-if="read" text="Visualizar" location="bottom">
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

import { roleMap } from "@/constants";

const props = defineProps({
  business: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
  read: { type: Boolean, default: () => false },
  create: { type: Boolean, default: () => false },
  edit: { type: Boolean, default: () => false },
  userCampus: { type: Array, default: () => [] },
});

const search = ref("");
const campus = ref(null);

const emit = defineEmits(["create", "edit", "show"]);

const headers = computed(() => [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Nombre(s)",
    key: "first_name",
  },
  {
    title: "Apellido(s)",
    key: "last_name",
  },
  // {
  //   title: "Correo electrónico",
  //   key: "email",
  // },
  {
    title: "Empresa",
    key: "business_data.bs_name",
  },
  {
    title: "Rol",
    key: "role",
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

const filteredTable = computed(() => {
  return props.business.filter((map) => {
    const campusMatch = campus.value ? map.campus === campus.value : true;
    return campusMatch;
  });
});

const editItem = (item) => {
  emit("edit", item.id);
};

const showItem = (item) => {
  emit("show", item.id);
};
</script>
