<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900px"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-toolbar dark>
        <v-toolbar-title>Generar reporte de asistencias</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <!-- Filtros -->
        <v-row>
          <v-col>
            <span>
              Seleccione la sede y la generación, luego haga clic en el botón
              "Generar reporte".
            </span>
          </v-col>
        </v-row>
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="adminCampus"
              v-model="campus"
              item-title="text"
              item-value="value"
              label="Sede"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              clearable
              :items="filteredGenerations"
              v-model="generation_id"
              item-title="generation_name"
              item-value="id"
              label="Generación"
            />
          </v-col>

          <v-col cols="12" md="12" class="d-flex justify-center">
            <v-btn color="grey" prepend-icon="mdi-file" @click="submit">
              Generar reporte
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tabla -->
      </v-card-text>

      <!-- Footer -->
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  adminCampus: { type: Array, default: () => [] },
  generations: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit", "findUsers"]);

const generation_id = ref(null);
const campus = ref(null);

const filteredGenerations = computed(() =>
  props.generations.filter((g) => g.campus === campus.value)
);

const close = () => emit("update:modelValue", false);

const submit = () => {
  console.log(1);
};
</script>
