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
                <v-select
                  :items="becTypeArray"
                  v-model="user_type"
                  v-bind="user_typeProps"
                  item-title="text"
                  item-value="value"
                  label="Tipo de usuario"
                  :readonly="isUserTypeLocked"
                  :hint="isUserTypeLocked ? USER_TYPE_LOCKED_HINT : undefined"
                  :persistent-hint="isUserTypeLocked"
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
    <ConfirmationDialog ref="deactivationConfirmation" />
  </v-dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import type { FieldState } from "vee-validate";
import { useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import {
  DEACTIVATION_CONFIRMATION,
  requiresDeactivationConfirmation,
} from "@/utils/userDeactivation";
import * as yup from "yup";
import * as validations from "@/validations";
import { becTypeArray } from "@/constants";
import type { SelectOption } from "@/constants";
import type { Generation } from "@/interfaces/generation";
import type { User, UserUpdateForm } from "@/interfaces/user";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  editItem?: User | null;
  userCampus?: SelectOption[];
  generations?: Generation[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
  userCampus: () => [],
  generations: () => [],
  title: "Actualizar becario/a",
});

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: UserUpdateForm): void;
}

const emit = defineEmits<Emits>();

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, setValues, resetForm } =
  useForm<UserUpdateForm>({
    validationSchema: toTypedSchema(
      yup.object({
        first_name: validations.first_name(),
        last_name: validations.last_name(),
        email: validations.email(),
        password: validations.updatePassword(),
        enrollment: validations.enrollment(),
        phone: validations.phone(),
        campus: validations.campus(),
        generation_id: validations.generation_id(),
        active: validations.user_active(),
        user_type: validations.user_type(),
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

const [enrollment, enrollmentProps] = defineField("enrollment", vuetifyConfig);
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
          active: props.editItem.active,
          user_type: props.editItem.user_type,
          campus: props.editItem.campus,
          generation_id: Number(props.editItem.generation_id),
        });
      }
    } else {
      resetForm();
    }
  },
);

watch(enrollment, (newValue) => {
  if (typeof newValue === "string") {
    enrollment.value = newValue.toUpperCase();
  }
});

// Holders of a scholarship profile cannot change user_type here (the API
// answers 422 USER_TYPE_LOCKED); graduation goes through the refrendo situation.
const USER_TYPE_LOCKED_HINT =
  "Para egresar a un becario usa la situación Egresado en su refrendo.";
const isUserTypeLocked = computed(() => !!props.editItem?.has_scholarship_profile);

const filteredGenerations = computed(() =>
  props.generations.filter((map) => map.campus === campus.value),
);

const close = () => {
  emit("update:modelValue", false);
};

const deactivationConfirmation = ref<InstanceType<typeof ConfirmationDialog> | null>(null);

const save = async () => {
  if (!meta.value.valid) return;
  const form = { ...values } as UserUpdateForm;

  // sdd/retenciones-pendientes S7: deactivating a becario cancels its pending
  // withholdings and advance payments — never do that without confirmation.
  if (props.editItem && requiresDeactivationConfirmation(props.editItem, form)) {
    const confirmed = await deactivationConfirmation.value?.open(DEACTIVATION_CONFIRMATION);
    if (!confirmed) return;
  }
  emit("submit", form);
};
</script>

<style scoped></style>
