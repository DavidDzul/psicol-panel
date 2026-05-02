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
          <v-toolbar-title>Editar perfil</v-toolbar-title>
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
                <v-text-field
                  v-model="password"
                  type="password"
                  v-bind="passwordProps"
                  label="Contraseña"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="confirmation"
                  type="password"
                  v-bind="confirmationProps"
                  label="Confirmar Contraseña"
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

import type { User } from "@/interfaces/user";
import * as validations from "@/validations";

interface UserProfileForm {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  confirmation: string
  phone: string
}

interface Props {
  modelValue: boolean
  loading: boolean
  editItem: User
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit", value: UserProfileForm): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
});

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, setValues, resetForm } = useForm<UserProfileForm>({
  validationSchema: toTypedSchema(
    yup.object({
      id: validations.id(),
      first_name: validations.first_name(),
      last_name: validations.last_name(),
      email: validations.email(),
      password: validations.updatePassword(),
      confirmation: validations.confirmation(),
      phone: validations.phone(),
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
  // Permite solo números (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const [first_name, first_nameProps] = defineField("first_name", vuetifyConfig);
const [last_name, last_nameProps] = defineField("last_name", vuetifyConfig);
const [email, emailProps] = defineField("email", vuetifyConfig);
const [password, passwordProps] = defineField("password", vuetifyConfig);
const [confirmation, confirmationProps] = defineField(
  "confirmation",
  vuetifyConfig
);
const [phone, phoneProps] = defineField("phone", vuetifyConfig);

const emit = defineEmits<Emits>();

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          id: props.editItem.id,
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

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", { ...values } as UserProfileForm);
  }
};
</script>

<style scoped></style>
