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
          <v-toolbar-title>Editar Información de la Empresa</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
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
                >Por favor, ingresa un enlace al sitio web, perfil de redes
                sociales o cualquier plataforma que permita a los usuarios
                conocer más sobre la empresa.</span
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

import { lineBusiness } from "@/constants";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  editItem: { type: Object, default: () => null },
});

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});
const { defineField, meta, values, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      id: validations.id(),
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
    })
  ),
});

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

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          id: props.editItem.id,
          bs_name: props.editItem.bs_name,
          bs_director: props.editItem.bs_director,
          bs_rfc: props.editItem.bs_rfc,
          bs_country: props.editItem.bs_country,
          bs_state: props.editItem.bs_state,
          bs_locality: props.editItem.bs_locality,
          bs_adrress: props.editItem.bs_adrress,
          bs_telphone: props.editItem.bs_telphone,
          bs_line: props.editItem.bs_line,
          bs_other_line: props.editItem.bs_other_line,
          bs_website: props.editItem.bs_website,
          bs_description: props.editItem.bs_description,
        });
      }
    } else {
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
