<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-form @submit.prevent="save">
        <v-toolbar dark>
          <v-toolbar-title>Editar rol </v-toolbar-title>
          <v-spacer />
          <v-btn icon variant="text" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-row>
            <div class="text-h6">
              Rol seleccionado:
              <strong>{{ rolesMap.get(editItem.name).text }}</strong>
            </div>

            <v-col cols="12">
              <v-switch
                v-model="unlimited"
                label="Publicaciones y visualizaciones Ilimitadas"
                color="primary"
                density="compact"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="num_visualizations"
                v-bind="num_visualizationsProps"
                label="Visualizaciones"
                type="number"
                density="comfortable"
                prepend-inner-icon="mdi-eye"
                :disabled="unlimited"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="num_vacancies"
                v-bind="num_vacanciesProps"
                label="Vacantes"
                type="number"
                density="comfortable"
                prepend-inner-icon="mdi-briefcase"
                :disabled="unlimited"
              />
            </v-col>

            <v-col cols="12">
              <div class="text-overline text-grey-darken-1 mb-2">
                Permisos Asignados
              </div>
              <v-autocomplete
                v-model="permissions_ids"
                :items="permissions"
                item-title="name"
                item-value="id"
                label="Seleccionar permisos"
                placeholder="Escribe para buscar..."
                multiple
                chips
                closable-chips
                variant="outlined"
                color="primary"
                :filter="customFilter"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :text="getPermissionText(item.raw.name)"
                    size="small"
                    variant="tonal"
                  ></v-chip>
                </template>

                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="getPermissionText(item.raw.name)"
                  >
                    <template v-slot:prepend="{ isSelected }">
                      <v-checkbox-btn
                        :model-value="isSelected"
                      ></v-checkbox-btn>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="error" variant="text" @click="close"> Cancelar </v-btn>
          <v-btn
            color="primary"
            variant="text"
            :disabled="!meta.valid"
            :loading="loading"
            type="submit"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import * as validations from "@/validations";
import { rolesMap, permissionsMap } from "@/constants";

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  editItem: { type: Object, default: null },
  permissions: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const vuetifyConfig = (state) => ({
  props: { "error-messages": state.errors },
});

const { defineField, meta, values, setValues, resetForm, handleSubmit } =
  useForm({
    validationSchema: toTypedSchema(
      yup.object({
        num_visualizations: validations.num_visualizations(),
        num_vacancies: validations.num_vacancies(),
        unlimited: validations.unlimited(),
        permissions_ids: yup.array().of(yup.number()).default([]),
      })
    ),
    initialValues: {
      unlimited: false,
      num_visualizations: 0,
      num_vacancies: 0,
      permissions_ids: [],
    },
  });

const [permissions_ids] = defineField("permissions_ids");
const [num_visualizations, num_visualizationsProps] = defineField(
  "num_visualizations",
  vuetifyConfig
);
const [num_vacancies, num_vacanciesProps] = defineField(
  "num_vacancies",
  vuetifyConfig
);
const [unlimited] = defineField("unlimited");

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.editItem) {
      const currentIds = props.editItem.permissions?.map((p) => p.id) || [];

      setValues({
        num_visualizations:
          props.editItem.configuration?.num_visualizations ?? 0,
        num_vacancies: props.editItem.configuration?.num_vacancies ?? 0,
        unlimited: props.editItem.configuration?.unlimited ?? false,
        permissions_ids: currentIds,
      });
    } else if (!isOpen) {
      resetForm();
    }
  }
);

const getPermissionText = (name) => {
  return permissionsMap.get(name)?.text || name;
};

const customFilter = (value, query, item) => {
  const text = getPermissionText(item.raw.name).toLowerCase();
  const name = item.raw.name.toLowerCase();
  const searchText = query.toLowerCase();
  return text.includes(searchText) || name.includes(searchText);
};

const close = () => emit("update:modelValue", false);

const save = handleSubmit((values) => {
  emit("submit", {
    ...values,
  });
});
</script>
