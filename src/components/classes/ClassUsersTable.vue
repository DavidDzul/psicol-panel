<template>
  <v-row class="align-center pb-3">
    <v-col cols="12" md="6" v-if="classData">
      <h3 class="font-weight-bold mb-1">{{ classData.name }}</h3>

      <p class="text-body-2 text-grey-darken-1 mb-2">
        📅 {{ dayjs(classData.date).format("DD-MM-YYYY") }}
      </p>

      <h3 class="text-subtitle-1 text-primary font-weight-medium">
        Asistencias generadas
      </h3>
    </v-col>

    <v-col cols="12" md="6" class="d-flex justify-end align-center gap-2">
      <!-- <v-btn class="mx-3" color="grey" @click="reportItem">
        Generar reporte
      </v-btn> -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn class="mx-3" color="grey" v-bind="props">
            Generar reporte
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="reportItem">
            <v-list-item-title>Reporte PDF</v-list-item-title>
          </v-list-item>
          <v-list-item @click="reportSheet">
            <v-list-item-title>Reporte sheet</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-btn color="warning" @click="assignItem"> Asignar usuarios </v-btn> -->
    </v-col>
  </v-row>

  <!-- Tabla -->
  <v-data-table
    :headers="headers"
    :items="itemsWithUserName"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
  >
    <template #top>
      <v-toolbar flat>
        <v-text-field
          class="ml-5 mr-3"
          v-model="search"
          hide-details
          prepend-icon="mdi-magnify"
          density="compact"
          single-line
          label="Buscar"
          clearable
        />
      </v-toolbar>
    </template>

    <template #item.status="{ item }">
      <v-chip
        :color="attendanceStatusMap[item.status]?.color || 'grey'"
        text-color="white"
        size="small"
        label
      >
        {{ attendanceStatusMap[item.status]?.label || item.status }}
      </v-chip>
    </template>
    <template #item.check_in="{ item }">
      {{ item.check_in }}
    </template>

    <template #item.check_out="{ item }">
      {{ item.check_out }}
    </template>

    <template #item.observations="{ item }">
      <v-tooltip activator="parent" location="top">
        {{ item.observations }}
      </v-tooltip>

      <span class="truncate-text">
        {{ item.observations || "—" }}
      </span>
    </template>
    <!-- Acciones -->
    <template #item.actions="{ item }">
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

    <template #no-data> No existen asistencias registradas </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue";
import { attendanceStatusMap } from "@/constants";
import dayjs from "dayjs";

const props = defineProps({
  classData: { type: Object, default: () => {} },
  attendances: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["assign", "edit", "delete", "report", "sheet"]);

const search = ref("");

const headers = computed(() => [
  { title: "ID", key: "id" },
  // { title: "Matrícula", key: "user.enrollment" },
  { title: "Nombre", key: "userName" },
  // { title: "Correo", key: "user.email" },
  { title: "Estatus", key: "status" },
  { title: "Check-in", key: "check_in" },
  { title: "Check-out", key: "check_out" },
  { title: "Observaciones", key: "observations" },
  { title: "Acciones", key: "actions", sortable: false },
]);

const itemsWithUserName = computed(() =>
  props.attendances.map((a) => ({
    ...a,
    userName: `${a.user.first_name} ${a.user.last_name}`,
  }))
);

const editItem = (item) => emit("edit", item.id);
const deleteItem = (item) => emit("delete", item.id);
const reportItem = (item) => emit("report");
const reportSheet = (item) => emit("sheet");
const assignItem = () => {
  emit("assign");
};
</script>

<style scoped>
.truncate-text {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
