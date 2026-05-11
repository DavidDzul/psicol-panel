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
          <v-toolbar-title>{{ title }}</v-toolbar-title>
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
                  :items="userTypeOptions"
                  v-model="user_type"
                  v-bind="user_typeProps"
                  item-title="title"
                  item-value="value"
                  label="Tipo de usuario"
                ></v-select>
              </v-col>
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
                <v-select
                  :items="filteredGenerations"
                  v-model="generation_id"
                  v-bind="generation_idProps"
                  item-title="generation_name"
                  item-value="id"
                  label="Generación"
                ></v-select>
              </v-col>
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
                  readonly
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
            Guardar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import type { FieldState } from "vee-validate";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import * as yup from "yup";
import * as validations from "@/validations";
import type { Generation } from "@/interfaces/generation";
import type { UserForm, UserType } from "@/interfaces/user";
import type { SelectOption } from "@/constants";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  generations?: Generation[];
  userCampus?: SelectOption[];
  title?: string;
  defaultUserType?: UserType;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  generations: () => [],
  userCampus: () => [],
  title: "Nueva persona",
  defaultUserType: "BEC_ACTIVE",
});

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: UserForm): void;
}

const emit = defineEmits<Emits>();

const userTypeOptions = [
  { title: "Becario/a", value: "BEC_ACTIVE" },
  { title: "Egresado/a", value: "BEC_INACTIVE" },
];

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: { "error-messages": state.errors },
});

const { defineField, meta, values, resetForm } = useForm<UserForm>({
  validationSchema: toTypedSchema(
    yup.object({
      user_type: yup
        .string()
        .required("Campo requerido")
        .oneOf(["BEC_ACTIVE", "BEC_INACTIVE"] as const),
      campus: validations.campus(),
      first_name: validations.first_name(),
      last_name: validations.last_name(),
      email: validations.email(),
      password: validations.updatePassword(),
      enrollment: validations.enrollment(),
      phone: validations.phone(),
      generation_id: validations.generation_id(),
    }),
  ),
});

const onlyNumbers = (event: KeyboardEvent) => {
  if (!/^\d$/.test(event.key)) event.preventDefault();
};

const [user_type, user_typeProps] = defineField("user_type", vuetifyConfig);
const [first_name, first_nameProps] = defineField("first_name", vuetifyConfig);
const [last_name, last_nameProps] = defineField("last_name", vuetifyConfig);
const [email, emailProps] = defineField("email", vuetifyConfig);
const [password, passwordProps] = defineField("password", vuetifyConfig);
const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [phone, phoneProps] = defineField("phone", vuetifyConfig);
const [generation_id, generation_idProps] = defineField("generation_id", vuetifyConfig);
const [enrollment, enrollmentProps] = defineField("enrollment", vuetifyConfig);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      resetForm();
    } else {
      user_type.value = props.defaultUserType;
      password.value = "Agentedecambio";
    }
  },
);

const filteredGenerations = computed(() =>
  props.generations.filter((g) => g.campus === campus.value),
);

watch(enrollment, (val) => {
  if (typeof val === "string") enrollment.value = val.toUpperCase();
});

const close = () => emit("update:modelValue", false);

const save = () => {
  if (meta.value.valid) emit("submit", { ...values } as UserForm);
};
</script>
