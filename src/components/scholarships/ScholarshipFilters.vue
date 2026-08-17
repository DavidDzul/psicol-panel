<template>
  <v-row class="mb-2">
    <v-col md="2">
      <v-select
        v-model="internalYear"
        :items="yearOptions"
        label="Año de refrendo"
        density="compact"
        hide-details
        @update:model-value="emit('update:year', internalYear)"
      />
    </v-col>
    <v-col md="2">
      <v-select
        v-model="internalMonth"
        :items="monthOptions"
        label="Mes de refrendo"
        density="compact"
        hide-details
        @update:model-value="emit('update:month', internalMonth)"
      />
    </v-col>
    <v-col v-if="campuses && campuses.length > 0" md="2">
      <v-select
        v-model="internalCampus"
        :items="campuses"
        item-title="text"
        item-value="value"
        label="Sede"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-map-marker"
        @update:model-value="emit('update:campus', internalCampus)"
      />
    </v-col>
    <v-col v-if="requireGeneration !== false" md="2">
      <v-autocomplete
        v-model="internalGenerationId"
        :items="generationList"
        item-title="generation_name"
        item-value="id"
        label="Generación"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-account-group"
        @update:model-value="emit('update:generationId', internalGenerationId)"
      />
    </v-col>
    <v-col class="d-flex text-center justify-between" md="4">
      <v-btn
        class="mx-3"
        color="grey"
        prepend-icon="mdi-magnify"
        :disabled="!campus || (requireGeneration !== false && !generationId)"
        @click="emit('search')"
      >
        Buscar
      </v-btn>

      <slot />
    </v-col>
    <!-- <v-col md="2" v-if="$slots.default">
      
    </v-col> -->
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import type { SelectOption } from "@/constants";
import { useGenerationsStore } from "@/stores/api/generationStore";

const props = defineProps<{
  year: number;
  month: number;
  campuses?: SelectOption[] | null;
  campus?: string | null;
  generationId?: number | null;
  requireGeneration?: boolean;
}>();

const emit = defineEmits<{
  "update:year": [value: number];
  "update:month": [value: number];
  "update:campus": [value: string | null];
  "update:generationId": [value: number | null];
  search: [];
}>();

const { resGenerations } = storeToRefs(useGenerationsStore());
const generationList = computed(() => [...resGenerations.value.values()]);

const internalYear = ref<number>(props.year);
const internalMonth = ref<number>(props.month);
const internalCampus = ref<string | null>(props.campus ?? null);
const internalGenerationId = ref<number | null>(props.generationId ?? null);
const yearOptions = Array.from(
  { length: 6 },
  (_, i) => new Date().getFullYear() - i,
);

const monthOptions = [
  { title: "Enero", value: 1 },
  { title: "Febrero", value: 2 },
  { title: "Marzo", value: 3 },
  { title: "Abril", value: 4 },
  { title: "Mayo", value: 5 },
  { title: "Junio", value: 6 },
  { title: "Julio", value: 7 },
  { title: "Agosto", value: 8 },
  { title: "Septiembre", value: 9 },
  { title: "Octubre", value: 10 },
  { title: "Noviembre", value: 11 },
  { title: "Diciembre", value: 12 },
];
</script>
