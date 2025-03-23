<template>
  <v-data-table
    :headers="headers"
    :items="applications"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
  >
    <template #top>
      <v-toolbar :flat="true">
        <p style="font-size: 18px; margin: 15px">Listado de postulaciones</p>
        <v-text-field
          class="mx-10"
          v-model="search"
          hide-details
          prepend-icon="mdi-magnify"
          density="compact"
          single-line
          label="Buscar"
          :clearable="true"
        ></v-text-field>
      </v-toolbar>
    </template>
    <template #[`item.vacant_id`]="{ item }">
      {{ item.vacant.vacant_name }}
    </template>
    <template #[`item.user_id`]="{ item }">
      {{ item.user.first_name }}
      {{ item.user.last_name }}
    </template>
    <template #[`item.view_cv`]="{ item }">
      <div style="width: 100%; text-align: center">
        <v-tooltip text="Visualizar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="warning"
              density="comfortable"
              icon="mdi-account-eye"
              class="mr-2"
              @click="openCV(item)"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <!-- <v-btn
        v-if="item.status !== 'REJECTED'"
        v-bind="props"
        color="warning"
        density="comfortable"
        class="mr-2"
        @click="openCV(item)"
        :disabled="loading"
        :loading="loading"
      >
        <v-icon size="small" class="mr-2">mdi-eye</v-icon>
        Abrir
      </v-btn> -->
    </template>
    <template #[`item.status`]="{ item }">
      <p
        :style="{
          color:
            item.status === 'ACCEPTED'
              ? 'green'
              : item.status === 'REJECTED'
              ? 'red'
              : '',
        }"
      >
        {{ statusApplicationMap.get(item.status).text }}
      </p>
    </template>
    <template #[`item.rejected_reason`]="{ item }">
      <span v-if="item.rejected_reason !== 'OTHER'">
        {{ rejectedReasonMap.get(item.rejected_reason).text }}
      </span>
      <span v-else> {{ item.rejected_other }} </span>
    </template>
    <template #[`item.created_at`]="{ item }">
      {{ dayjs(item.created_at).format("DD/MM/YYYY HH:mm:ss") }}
    </template>

    <template #[`item.actions`]="{ item }">
      <template v-if="item.status === 'PENDING'">
        <div style="width: 100%; text-align: right">
          <v-tooltip text="Descartar" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                color="error"
                density="comfortable"
                icon="mdi-account-remove"
                class="mr-2"
                @click="rejectedItem(item)"
              >
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Aceptar" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                color="success"
                density="comfortable"
                icon="mdi-account-check"
                class="mr-2"
                @click="acceptedItem(item)"
              >
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </template>
    <template #no-data> No existen datos registrados </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue";
import dayjs from "dayjs";

import { statusApplicationMap, rejectedReasonMap } from "@/constants";

const props = defineProps({
  applications: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false },
});

const search = ref("");
const groupBy = ref(undefined);

const emit = defineEmits(["submit", "rejected", "accepted"]);

const headers = computed(() => {
  const baseHeaders = [
    {
      title: "ID",
      key: "id",
    },
    {
      title: "Vacante",
      key: "vacant_id",
    },
    {
      title: "Usuario",
      key: "user_id",
    },
    {
      title: "Curriculum Vitae",
      key: "view_cv",
    },
    {
      title: "Estatus",
      key: "status",
    },
    {
      title: "Fecha",
      key: "created_at",
    },
    {
      title: "",
      key: "actions",
    },
  ];

  if (props.applications.some((item) => item.status === "REJECTED")) {
    baseHeaders.splice(5, 0, {
      title: "Motivo de Rechazo",
      key: "rejected_reason",
    });
  }

  return baseHeaders;
});

const rejectedItem = (item) => {
  emit("rejected", item.id);
};

const acceptedItem = (item) => {
  emit("accepted", item.id);
};

const openCV = (item) => {
  emit("submit", item.user_id);
};
</script>
