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
          <v-toolbar-title>Nuevo aviso</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col v-if="root" cols="12" md="6">
              <v-checkbox
                v-model="global"
                v-bind="globalProps"
                label="¿Mensaje para todas las sedes?"
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="12">
              <v-select
                :items="adminCampus"
                v-model="campus"
                item-title="text"
                item-value="value"
                label="Sede"
                :disabled="global ? true : false"
              />
            </v-col>
            <v-col cols="12" md="12">
              <v-textarea
                v-model="message"
                v-bind="messageProps"
                label="Aviso"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-checkbox
                v-model="active"
                v-bind="activeProps"
                label="Mensaje activo"
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

<script setup>
import { toTypedSchema } from "@vee-validate/yup";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import * as yup from "yup";

import * as validations from "@/validations";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  root: { type: Boolean, default: () => false },
  adminCampus: { type: Array, default: () => [] },
});

const vuetifyConfig = (state) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetField, resetForm, setValues } = useForm(
  {
    validationSchema: toTypedSchema(
      yup.object({
        message: validations.message(),
        campus: validations.campus(),
        active: validations.notice_active(),
        global: validations.notice_global(),
      })
    ),
  }
);

const [message, messageProps] = defineField("message", vuetifyConfig);
const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [active, activeProps] = defineField("active", vuetifyConfig);
const [global, globalProps] = defineField("global", vuetifyConfig);

// const emit = defineEmits<{
//   "update:modelValue": [value: boolean];
//   submit: [value: Object];
// }>();

const emit = defineEmits(["update:modelValue", "submit"]);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm();
    } else {
      setValues({
        campus: props.adminCampus[0].value,
      });
    }
  },
  { immediate: true }
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
