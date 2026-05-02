<template>
  <v-data-table
    :headers="headers"
    :items="agreements"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
  >
    <!-- <template #top>
      <v-toolbar :flat="true">
        <v-spacer></v-spacer>

        <v-btn prepend-icon="mdi-plus" color="primary" @click="$emit('create')">
          Agregar
        </v-btn>
      </v-toolbar>
    </template> -->
    <template #[`item.start_date`]="{ item }">
      {{ dayjs(item.start_date).format("DD-MM-YYYY") }}
    </template>
    <template #[`item.end_date`]="{ item }">
      {{ dayjs(item.end_date).format("DD-MM-YYYY") }}
    </template>
    <template #[`item.validate`]="{ item }">
      <v-icon v-if="item.end_date > today" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>

    <!-- <template #[`item.actions`]="{ item }">
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
      </div>
    </template> -->
    <template #no-data> No existen datos registrados </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";

import type { BusinessAgreement } from "@/interfaces/business";

interface Props {
  agreements: BusinessAgreement[];
  loading: boolean;
}

interface Emits {
  (e: "create"): void;
  (e: "edit", id: number): void;
  (e: "show", id: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  agreements: () => [],
  loading: false,
});

const search = ref<string>("");
const today = dayjs().format("YYYY-MM-DD");

const emit = defineEmits<Emits>();

const headers = computed(() => [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Fecha de inicio",
    key: "start_date",
  },
  {
    title: "Fecha de término",
    key: "end_date",
  },
  {
    title: "Vigente",
    key: "validate",
  },
]);

const editItem = (item: BusinessAgreement) => {
  emit("edit", item.id);
};

const showItem = (item: BusinessAgreement) => {
  emit("show", item.id);
};
</script>
