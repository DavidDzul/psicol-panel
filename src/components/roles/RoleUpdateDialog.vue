<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-form @submit.prevent="save">
        <v-toolbar dark>
          <v-toolbar-title>Configuración de Límites por Rol</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <div class="text-h6 mb-4">
            <strong>{{
              editItem?.name ? rolesMap.get(editItem.name)?.text : ""
            }}</strong>
          </div>

          <v-row>
            <v-col cols="12" class="pb-0"
              ><div class="text-subtitle-2">
                Publicaciones de vacantes laborales
              </div></v-col
            >
            <v-col cols="12" sm="4">
              <v-switch
                v-model="unlimited_jobs"
                label="Ilimitado"
                color="success"
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model.number="num_job_vacancies"
                label="N. Vacantes laborales"
                type="number"
                density="comfortable"
                :disabled="unlimited_jobs"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" class="py-0"><v-divider class="my-2" /></v-col>
            <v-col cols="12" class="pb-0"
              ><div class="text-subtitle-2">
                Publicaciones de Vacantes Profesionales
              </div></v-col
            >
            <v-col cols="12" sm="4">
              <v-switch
                v-model="unlimited_professionals"
                label="Ilimitado"
                color="success"
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model.number="num_professional_vacancies"
                label="N. Vacantes Profesionales"
                type="number"
                density="comfortable"
                :disabled="unlimited_professionals"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" class="py-0"><v-divider class="my-2" /></v-col>
            <v-col cols="12" class="pb-0"
              ><div class="text-subtitle-2">
                Publicaciones de Vacantes Jr.
              </div></v-col
            >
            <v-col cols="12" sm="4">
              <v-switch
                v-model="unlimited_jr"
                label="Ilimitado"
                color="success"
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model.number="num_jr_vacancies"
                label="N. Vacantes Jr."
                type="number"
                density="comfortable"
                :disabled="unlimited_jr"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" class="py-0"><v-divider class="my-2" /></v-col>
            <v-col cols="12" class="pb-0"
              ><div class="text-subtitle-2">
                Visualizaciones de Perfiles Laborales
              </div>
              <div>
                Acción relacionada a cuando las empresas quieren visualizar las
                vacantes de los jóvenes en formación y/o egresados
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="unlimited_visualizations"
                label="Ilimitado"
                color="success"
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model.number="num_visualizations"
                label="Visualizaciones Permitidas"
                type="number"
                density="comfortable"
                :disabled="unlimited_visualizations"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-divider class="my-4" />
              <v-autocomplete
                v-model="permissions_ids"
                :items="permissions"
                item-title="name"
                item-value="id"
                label="Permisos del Sistema"
                multiple
                chips
                closable-chips
                variant="outlined"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :text="getPermissionText(item.name)"
                    size="small"
                  />
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="error" variant="text" @click="close">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" type="submit"
            >Guardar Cambios</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { rolesMap, permissionsMap } from "@/constants";
import type { Role, Permission, RoleForm } from "@/interfaces/role";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  editItem?: Role | null;
  permissions?: Permission[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
  permissions: () => [],
});

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: RoleForm): void;
}

const emit = defineEmits<Emits>();

const schema = yup.object({
  unlimited_jobs: yup.boolean(),
  num_job_vacancies: yup.number().min(0).required(),
  unlimited_professionals: yup.boolean(),
  num_professional_vacancies: yup.number().min(0).required(),
  unlimited_jr: yup.boolean(),
  num_jr_vacancies: yup.number().min(0).required(),
  unlimited_visualizations: yup.boolean(),
  num_visualizations: yup.number().min(0).required(),
  permissions_ids: yup.array().of(yup.number()).default([]),
});

const { defineField, setValues, resetForm, handleSubmit } = useForm<RoleForm>({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    unlimited_jobs: false,
    num_job_vacancies: 0,
    unlimited_professionals: false,
    num_professional_vacancies: 0,
    unlimited_jr: false,
    num_jr_vacancies: 0,
    unlimited_visualizations: false,
    num_visualizations: 0,
    permissions_ids: [],
  },
});

const [unlimited_jobs] = defineField("unlimited_jobs");
const [num_job_vacancies] = defineField("num_job_vacancies");
const [unlimited_professionals] = defineField("unlimited_professionals");
const [num_professional_vacancies] = defineField("num_professional_vacancies");
const [unlimited_jr] = defineField("unlimited_jr");
const [num_jr_vacancies] = defineField("num_jr_vacancies");
const [unlimited_visualizations] = defineField("unlimited_visualizations");
const [num_visualizations] = defineField("num_visualizations");
const [permissions_ids] = defineField("permissions_ids");

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.editItem) {
      const config = props.editItem.configuration || null;
      setValues({
        unlimited_jobs: config?.unlimited_jobs ?? false,
        num_job_vacancies: config?.num_job_vacancies ?? 0,
        unlimited_professionals: config?.unlimited_professionals ?? false,
        num_professional_vacancies: config?.num_professional_vacancies ?? 0,
        unlimited_jr: config?.unlimited_jr ?? false,
        num_jr_vacancies: config?.num_jr_vacancies ?? 0,
        unlimited_visualizations: config?.unlimited_visualizations ?? false,
        num_visualizations: config?.num_visualizations ?? 0,
        permissions_ids: props.editItem.permissions?.map((p) => p.id) ?? [],
      });
    } else if (!isOpen) {
      resetForm();
    }
  },
);

const getPermissionText = (name: string): string =>
  permissionsMap.get(name)?.text ?? name;
const close = () => emit("update:modelValue", false);
const save = handleSubmit((values) => emit("submit", values));
</script>
