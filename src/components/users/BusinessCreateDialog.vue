<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="890px"
    @keydown.stop.esc="close"
    :persistent="true"
  >
    <v-card>
      <v-form>
        <v-toolbar dark>
          <v-toolbar-title>Nueva empresa </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-stepper v-model="step" show-actions elevation="0">
            <v-stepper-header>
              <v-stepper-item
                :complete="step > 1"
                title="Usuario"
                :value="1"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                title="Información de la empresa"
                :value="2"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item title="Convenio" :value="3"></v-stepper-item>
            </v-stepper-header>
            <v-stepper-window>
              <v-stepper-window-item :value="1">
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
                  <v-col cols="12" md="6">
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
                    <v-text-field
                      v-model="workstation"
                      v-bind="workstationProps"
                      label="Puesto de trabajo"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      :items="roleArray"
                      v-model="role"
                      v-bind="roleProps"
                      item-title="text"
                      item-value="value"
                      label="Rol"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="password"
                      v-bind="passwordProps"
                      label="Contraseña"
                      readonly
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="next">Siguiente</v-btn>
                  </v-row>
                </v-col>
              </v-stepper-window-item>
              <v-stepper-window-item :value="2">
                <v-row>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_name"
                      v-bind="bs_nameProps"
                      label="Nombre de la empresa"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_director"
                      v-bind="bs_directorProps"
                      label="Nombre del director"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_rfc"
                      v-bind="bs_rfcProps"
                      label="RFC"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_country"
                      v-bind="bs_countryProps"
                      label="País"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_state"
                      v-bind="bs_stateProps"
                      label="Estado"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_locality"
                      v-bind="bs_localityProps"
                      label="Localidad"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_adrress"
                      v-bind="bs_adrressProps"
                      label="Dirección"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="bs_telphone"
                      v-bind="bs_telphoneProps"
                      label="Teléfono"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-select
                      v-model="bs_line"
                      :items="lineBusiness"
                      v-bind="bs_lineProps"
                      item-title="text"
                      item-value="value"
                      label="Categoria"
                    ></v-select>
                  </v-col>
                  <v-col v-if="bs_line === 'OTHER'" cols="12" md="12">
                    <v-text-field
                      v-model="bs_other_line"
                      v-bind="bs_other_lineProps"
                      label="Especificar"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <span
                      >Por favor, ingresa un enlace al sitio web, perfil de
                      redes sociales o cualquier plataforma que permita a los
                      usuarios conocer más sobre la empresa.</span
                    >
                    <v-text-field
                      class="mt-2"
                      v-model="bs_website"
                      v-bind="bs_websiteProps"
                      label="Enlace de información"
                      placeholder="Ej: https://www.tuempresa.com"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-textarea
                      v-model="bs_description"
                      v-bind="bs_descriptionProps"
                      label="Descripción"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-btn color="grey" @click="back">Atrás</v-btn>
                    <v-btn color="primary" @click="next">Siguiente</v-btn>
                  </v-row>
                </v-col>
              </v-stepper-window-item>
              <v-stepper-window-item :value="3">
                <v-row>
                  <v-col cols="12" md="12">
                    <DatePickerInput
                      v-model="start_date"
                      :input-text="'Fecha de inicio'"
                    />
                  </v-col>
                  <v-col cols="12" md="12">
                    <DatePickerInput
                      v-model="end_date"
                      :input-text="'Fecha de término'"
                    />
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-btn color="grey" @click="back">Atrás</v-btn>
                    <v-btn color="success" :disabled="!meta.valid" @click="save"
                      >Finalizar</v-btn
                    >
                  </v-row>
                </v-col>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { PublicPathState, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";

import * as yup from "yup";
import * as validations from "@/validations";
import { lineBusiness, roleArray } from "@/constants";
import DatePickerInput from "@/components/shared/DatePickerInput.vue";

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  userCampus: { type: Array, default: () => [] },
});

const { defineField, meta, values, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      role: validations.role(),
      campus: validations.campus(),
      first_name: validations.first_name(),
      last_name: validations.last_name(),
      email: validations.email(),
      password: validations.updatePassword(),
      phone: validations.phone(),
      workstation: validations.workstation(),

      bs_name: validations.bs_name(),
      bs_director: validations.bs_director(),
      bs_rfc: validations.bs_rfc(),
      bs_country: validations.bs_country(),
      bs_state: validations.bs_state(),
      bs_locality: validations.bs_locality(),
      bs_adrress: validations.bs_adrress(),
      bs_telphone: validations.bs_telphone(),
      bs_line: validations.bs_line(),
      bs_other_line: validations.bs_other_line(),
      bs_website: validations.bs_website(),
      bs_description: validations.bs_description(),

      start_date: validations.start_date(),
      end_date: validations.end_date(),
    })
  ),
});

const [role, roleProps] = defineField("role", vuetifyConfig);
const [first_name, first_nameProps] = defineField("first_name", vuetifyConfig);
const [last_name, last_nameProps] = defineField("last_name", vuetifyConfig);
const [email, emailProps] = defineField("email", vuetifyConfig);
const [password, passwordProps] = defineField("password", vuetifyConfig);
const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [phone, phoneProps] = defineField("phone", vuetifyConfig);
const [workstation, workstationProps] = defineField(
  "workstation",
  vuetifyConfig
);

const [bs_name, bs_nameProps] = defineField("bs_name", vuetifyConfig);
const [bs_director, bs_directorProps] = defineField(
  "bs_director",
  vuetifyConfig
);
const [bs_rfc, bs_rfcProps] = defineField("bs_rfc", vuetifyConfig);
const [bs_country, bs_countryProps] = defineField("bs_country", vuetifyConfig);
const [bs_state, bs_stateProps] = defineField("bs_state", vuetifyConfig);
const [bs_locality, bs_localityProps] = defineField(
  "bs_locality",
  vuetifyConfig
);
const [bs_adrress, bs_adrressProps] = defineField("bs_adrress", vuetifyConfig);
const [bs_telphone, bs_telphoneProps] = defineField(
  "bs_telphone",
  vuetifyConfig
);
const [bs_line, bs_lineProps] = defineField("bs_line", vuetifyConfig);
const [bs_other_line, bs_other_lineProps] = defineField(
  "bs_other_line",
  vuetifyConfig
);
const [bs_website, bs_websiteProps] = defineField("bs_website", vuetifyConfig);
const [bs_description, bs_descriptionProps] = defineField(
  "bs_description",
  vuetifyConfig
);

const [start_date, start_dateProps] = defineField("start_date");
const [end_date, end_dateProps] = defineField("end_date");

const validateStep1 = computed(() => {
  return first_name.value &&
    last_name.value &&
    email.value &&
    campus.value &&
    phone.value &&
    workstation.value
    ? false
    : true;
});

const validateStep2 = computed(() => {
  return bs_name.value &&
    bs_director.value &&
    bs_rfc.value &&
    bs_country.value &&
    bs_state.value &&
    bs_locality.value &&
    bs_adrress.value &&
    bs_telphone.value &&
    bs_line.value &&
    bs_website.value &&
    bs_description.value
    ? false
    : true;
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
      step.value = 1;
    } else {
      password.value = "Agentedecambio";
      start_date.value = today;
      end_date.value = nextYear;
    }
  }
);

const step = ref(1);
const today = dayjs().format("YYYY-MM-DD");
const nextYear = dayjs().add(1, "year").format("YYYY-MM-DD");

const close = () => {
  emit("update:modelValue", false);
};

const next = () => {
  step.value++;
};

const back = () => {
  step.value--;
};

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
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", values);
  }
};
</script>

<style scoped></style>
