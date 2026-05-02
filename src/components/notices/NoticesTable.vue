<template>
  <v-data-table
    :headers="headers"
    :items="notices"
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
    <template #[`item.global`]="{ item }">
      <v-icon v-if="item.global" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>
    <template #[`item.active`]="{ item }">
      <v-icon v-if="item.active" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>
    <template #[`item.campus`]="{ item }">
      {{ campusMap.get(item.campus).text }}
    </template>
    <template #[`item.actions`]="{ item }">
      <div style="width: 100%; text-align: right">
        <!-- <v-tooltip text="Visualizar" location="bottom">
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
        </v-tooltip> -->
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
import { computed, ref } from "vue";
import type { Notice } from "@/interfaces/notice";
import { campusMap } from "@/constants";

interface Props {
  notices: Notice[];
  loading: boolean;
}

interface Emits {
  (e: "create"): void;
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  notices: () => [],
  loading: false,
});

const search = ref<string>("");

const emit = defineEmits<Emits>();

const headers = computed(() => [
  { title: "ID", key: "id" },
  { title: "Mensaje", key: "message" },
  { title: "Global", key: "global" },
  { title: "Activo", key: "active" },
  { title: "Sede", key: "campus" },
  { title: "", key: "actions" },
]);

const editItem = (item: Notice): void => {
  emit("edit", item.id);
};

const deleteItem = (item: Notice): void => {
  emit("delete", item.id);
};
</script>
