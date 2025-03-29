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
          <v-toolbar-title>Nuevo dato</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  :items="userTypeArray"
                  v-model="user_type"
                  v-bind="user_typeProps"
                  item-title="text"
                  item-value="value"
                  label="Tipo de usuario"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="campusArray"
                  v-model="campus"
                  v-bind="campusProps"
                  item-title="text"
                  item-value="value"
                  label="Sede"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="jobTypeArray"
                  v-model="job_type"
                  v-bind="job_typeProps"
                  item-title="text"
                  item-value="value"
                  label="Tipo de trabajo"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="areas"
                  v-model="area_id"
                  v-bind="area_idProps"
                  item-title="name"
                  item-value="id"
                  label="Áreas"
                ></v-select>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="count"
                  v-bind="countProps"
                  label="Total"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="close">Cancelar</v-btn>
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
import { userTypeArray, campusArray, jobTypeArray } from "@/constants";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  areas: { type: Array, default: () => [] },
});

const vuetifyConfig = (state) => ({
  props: {
    "error-messages": state.errors,
  },
});
const { defineField, meta, values, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      user_type: validations.user_type(),
      campus: validations.campus(),
      job_type: validations.job_type(),
      area_id: validations.area_id(),
      count: validations.count(),
    })
  ),
});

const rules = {
  required: (value) => !!value || "Este campo es obligatorio",
  validYear: (value) => /^\d{4}$/.test(value) || "El año debe tener 4 dígitos",
  validPhone: (value) =>
    /^\d{10}$/.test(value) || "El número de celular debe tener 10 dígitos",
  maxLength: (value) =>
    value.length <= 350 || "Máximo 350 caracteres permitidos",
};

const onlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  // Permite solo números (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const [user_type, user_typeProps] = defineField("user_type", vuetifyConfig);
const [job_type, job_typeProps] = defineField("job_type", vuetifyConfig);
const [area_id, area_idProps] = defineField("area_id", vuetifyConfig);
const [count, countProps] = defineField("count", vuetifyConfig);
const [campus, campusProps] = defineField("campus", vuetifyConfig);

const emit = defineEmits(["update:modelValue", "submit"]);

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
