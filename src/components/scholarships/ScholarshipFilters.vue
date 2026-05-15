<template>
  <v-row dense class="mb-2">
    <v-col cols="12" sm="4" md="3">
      <v-select
        v-model="internalYear"
        :items="yearOptions"
        label="Año"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="emit('update:year', internalYear)"
      />
    </v-col>
    <v-col cols="12" sm="4" md="3">
      <v-select
        v-model="internalMonth"
        :items="monthOptions"
        label="Mes"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="emit('update:month', internalMonth)"
      />
    </v-col>
    <v-col cols="12" sm="4" md="2" class="d-flex align-center">
      <v-btn
        color="primary"
        variant="tonal"
        block
        @click="emit('search')"
      >
        Buscar
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  year: number;
  month: number;
}>();

const emit = defineEmits<{
  "update:year": [value: number];
  "update:month": [value: number];
  search: [];
}>();

const internalYear  = ref<number>(props.year);
const internalMonth = ref<number>(props.month);

const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const monthOptions = [
  { title: "Enero",      value: 1 },
  { title: "Febrero",    value: 2 },
  { title: "Marzo",      value: 3 },
  { title: "Abril",      value: 4 },
  { title: "Mayo",       value: 5 },
  { title: "Junio",      value: 6 },
  { title: "Julio",      value: 7 },
  { title: "Agosto",     value: 8 },
  { title: "Septiembre", value: 9 },
  { title: "Octubre",    value: 10 },
  { title: "Noviembre",  value: 11 },
  { title: "Diciembre",  value: 12 },
];
</script>
