<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    @keydown.stop.esc="close"
    :persistent="true"
  >
    <v-card>
      <v-form>
        <v-toolbar dark>
          <v-toolbar-title>Actualizar área</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field v-model="areaName" label="Nombre"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" :disabled="loading" @click="close"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            variant="text"
            :disabled="!areaName"
            :loading="loading"
            @click="save"
          >
            Actualizar</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import type { Area, AreaForm } from "@/interfaces/data";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  editItem?: Area | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
});

const areaName = ref<string>("");

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: AreaForm): void;
}

const emit = defineEmits<Emits>();

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      areaName.value = props.editItem?.name ?? "";
    } else {
      areaName.value = "";
    }
  },
);

const close = () => emit("update:modelValue", false);

const save = () => {
  if (areaName.value) {
    emit("submit", { name: areaName.value });
  }
};
</script>

<style scoped></style>
