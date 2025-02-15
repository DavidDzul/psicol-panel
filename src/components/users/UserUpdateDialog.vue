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
          <v-toolbar-title>Actualizar becario/a</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="first_name"
                  v-bind="first_nameProps"
                  label="Nombre"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="last_name"
                  v-bind="last_nameProps"
                  label="Apellidos"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="email"
                  v-bind="emailProps"
                  label="Correo electrónico"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="phone"
                  v-bind="phoneProps"
                  label="Número de celular"
                  :rules="[rules.required, rules.validPhone]"
                  required
                  @keypress="onlyNumbers"
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12" md="6">
                <v-select
                  :items="userCampus"
                  v-model="campus"
                  v-bind="campusProps"
                  item-title="text"
                  item-value="value"
                  label="Sede"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="filteredGenerations"
                  v-model="generation_id"
                  v-bind="generation_idProps"
                  item-title="generation_name"
                  item-value="id"
                  label="Generación"
                ></v-select>
              </v-col> -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="enrollment"
                  v-bind="enrollmentProps"
                  label="Matrícula"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="password"
                  v-bind="passwordProps"
                  label="Contraseña"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-checkbox
                  v-model="active"
                  v-bind="activeProps"
                  label="¿Permitir acceso a la plataforma?"
                  density="comfortable"
                ></v-checkbox>
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
            Actualizar</v-btn
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
import { campusMap } from "@/constants";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  generations: { type: Array, default: () => [] },
  userCampus: { type: Array, default: () => [] },
  editItem: { type: Object, default: () => null },
});

const vuetifyConfig = (state) => ({
  props: {
    "error-messages": state.errors,
  },
});
const { defineField, meta, values, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      first_name: validations.first_name(),
      last_name: validations.last_name(),
      email: validations.email(),
      password: validations.updatePassword(),
      enrollment: validations.enrollment(),
      phone: validations.phone(),
      // campus: validations.campus(),
      // generation_id: validations.generation_id(),
      active: validations.user_active(),
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

const [enrollment, enrollmentProps] = defineField("enrollment", vuetifyConfig);
const [first_name, first_nameProps] = defineField("first_name", vuetifyConfig);
const [last_name, last_nameProps] = defineField("last_name", vuetifyConfig);
const [email, emailProps] = defineField("email", vuetifyConfig);
const [password, passwordProps] = defineField("password", vuetifyConfig);
// const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [phone, phoneProps] = defineField("phone", vuetifyConfig);
// const [generation_id, generation_idProps] = defineField(
//   "generation_id",
//   vuetifyConfig
// );
const [active, activeProps] = defineField("active", vuetifyConfig);
const emit = defineEmits(["update:modelValue", "submit"]);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          id: props.editItem.id,
          enrollment: props.editItem.enrollment,
          first_name: props.editItem.first_name,
          last_name: props.editItem.last_name,
          email: props.editItem.email,
          phone: props.editItem.phone,
        });
      }
    } else {
      resetForm();
    }
  }
);

// const filteredGenerations = computed(() =>
//   props.generations.filter((map) => map.campus === campus.value)
// );

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
