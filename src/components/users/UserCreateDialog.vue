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
          <v-toolbar-title>Nuevo becario/a</v-toolbar-title>
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
              <!-- <v-col cols="12" md="6">
                <v-text-field
                  v-model="confirmation"
                  type="password"
                  v-bind="confirmationProps"
                  label="Confirmar Contraseña"
                ></v-text-field>
              </v-col> -->
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

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import type { FieldState } from "vee-validate";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import * as yup from "yup";
import * as validations from "@/validations";
import type { Generation } from "@/interfaces/generation";
import type { UserForm } from "@/interfaces/user";
import type { SelectOption } from "@/constants";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  generations?: Generation[];
  userCampus?: SelectOption[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  generations: () => [],
  userCampus: () => [],
});

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: UserForm): void;
}

const emit = defineEmits<Emits>();

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetForm } = useForm<UserForm>({
  validationSchema: toTypedSchema(
    yup.object({
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

const rules = {
  required: (value: unknown): true | string =>
    !!value || "Este campo es obligatorio",
  validPhone: (value: string): true | string =>
    /^\d{10}$/.test(value) || "El número de celular debe tener 10 dígitos",
};

const onlyNumbers = (event: KeyboardEvent) => {
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
};

const [first_name, first_nameProps] = defineField("first_name", vuetifyConfig);
const [last_name, last_nameProps] = defineField("last_name", vuetifyConfig);
const [email, emailProps] = defineField("email", vuetifyConfig);
const [password, passwordProps] = defineField("password", vuetifyConfig);
const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [phone, phoneProps] = defineField("phone", vuetifyConfig);
const [generation_id, generation_idProps] = defineField(
  "generation_id",
  vuetifyConfig,
);
const [enrollment, enrollmentProps] = defineField("enrollment", vuetifyConfig);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm();
    } else {
      password.value = "Agentedecambio";
    }
  },
);

const filteredGenerations = computed(() =>
  props.generations.filter((map) => map.campus === campus.value),
);

watch(enrollment, (newValue) => {
  if (typeof newValue === "string") {
    enrollment.value = newValue.toUpperCase();
  }
});

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", { ...values } as UserForm);
  }
};
</script>

<style scoped></style>
