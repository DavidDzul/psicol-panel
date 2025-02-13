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
          <v-toolbar-title>Nueva Generación</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="12">
              <v-select
                :items="userCampus"
                v-model="campus"
                v-bind="campusProps"
                item-title="text"
                item-value="value"
                label="Sede"
              ></v-select>
            </v-col>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="generation_name"
                v-bind="generation_nameProps"
                label="Nombre/Número de generación"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12">
              <v-checkbox
                v-model="generation_active"
                v-bind="generation_activeProps"
                label="¿Generación activa?"
                density="comfortable"
              ></v-checkbox>
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
            :disabled="!meta.valid"
            :loading="loading"
            @click="save"
          >
            Guardar</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { PublicPathState, useForm } from "vee-validate";
import { computed, watch } from "vue";
import * as yup from "yup";

import * as validations from "@/validations";
import { campusArray } from "@/constants";

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetField, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      generation_name: validations.generation_name(),
      campus: validations.campus(),
      generation_active: validations.generation_active(),
    })
  ),
});

const [generation_name, generation_nameProps] = defineField(
  "generation_name",
  vuetifyConfig
);
const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [generation_active, generation_activeProps] = defineField(
  "generation_active",
  vuetifyConfig
);

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  userCampus: { type: Array, default: () => [] },
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm();
    }
  }
);

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", values);
  }
};
</script>

<style scoped></style>
