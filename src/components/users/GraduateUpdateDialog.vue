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
          <v-toolbar-title>Actualizar egresado/a</v-toolbar-title>
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
              <v-col cols="12" md="6">
                <v-select
                  :items="becTypeArray"
                  v-model="user_type"
                  v-bind="user_typeProps"
                  item-title="text"
                  item-value="value"
                  label="Tipo de usuario"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
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

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { type FieldState, useForm } from "vee-validate";
import { watch } from "vue";
import * as yup from "yup";

import type { Graduate, GraduateUpdateForm } from "@/interfaces/graduate";
import * as validations from "@/validations";
import { becTypeArray } from "@/constants";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  editItem?: Graduate | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", values: GraduateUpdateForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
});

const emit = defineEmits<Emits>();

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, setValues, resetForm } = useForm<GraduateUpdateForm>({
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
      user_type: validations.user_type(),
    })
  ),
});

const rules = {
  required: (value: string) => !!value || "Este campo es obligatorio",
  validYear: (value: string) => /^\d{4}$/.test(value) || "El año debe tener 4 dígitos",
  validPhone: (value: string) =>
    /^\d{10}$/.test(value) || "El número de celular debe tener 10 dígitos",
  maxLength: (value: string) =>
    value.length <= 350 || "Máximo 350 caracteres permitidos",
};

const onlyNumbers = (event: KeyboardEvent) => {
  const charCode = event.which ? event.which : event.keyCode;
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
const [user_type, user_typeProps] = defineField("user_type", vuetifyConfig);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          enrollment: props.editItem.enrollment ?? "",
          first_name: props.editItem.first_name,
          last_name: props.editItem.last_name,
          email: props.editItem.email,
          phone: props.editItem.phone,
          active: props.editItem.active ? true : false,
          user_type: props.editItem.user_type,
        });
      }
    } else {
      resetForm();
    }
  }
);

watch(enrollment, (newValue) => {
  if (newValue) {
    enrollment.value = newValue.toUpperCase();
  }
});
// const filteredGenerations = computed(() =>
//   props.generations.filter((gen) => gen.campus === campus.value)
// );

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", { ...values } as GraduateUpdateForm);
  }
};
</script>

<style scoped></style>
