<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560px"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.stop.esc="close"
  >
    <v-card>
      <v-toolbar dark>
        <v-toolbar-title>Nuevo administrador</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon aria-label="Cerrar" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text>
        <v-text-field v-model="form.first_name" label="Nombre(s)" :error-messages="shown.first_name" />
        <v-text-field v-model="form.last_name" label="Apellidos" :error-messages="shown.last_name" />
        <v-text-field v-model="form.email" label="Correo electrónico" :error-messages="shown.email" />
        <v-select
          v-model="form.campus"
          :items="campusArray"
          item-title="text"
          item-value="value"
          label="Sede"
          :error-messages="shown.campus"
        />
        <v-select
          v-model="form.role_id"
          :items="roles"
          item-title="name"
          item-value="id"
          label="Rol"
          :error-messages="shown.role_id"
        />
        <v-text-field
          v-model="form.password"
          type="password"
          label="Contraseña"
          autocomplete="new-password"
          :error-messages="shown.password"
        />
        <v-text-field
          v-model="form.password_confirmation"
          type="password"
          label="Confirmar contraseña"
          autocomplete="new-password"
          :error-messages="shown.password_confirmation"
        />
        <v-alert v-if="serverError" type="error" variant="tonal" class="mt-2" density="compact">
          {{ serverError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="submit">Crear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { campusArray } from "@/constants";
import { validateStaffAdministratorForm } from "@/utils/staffAdministratorForm";
import type { StaffAdministratorFormValues } from "@/utils/staffAdministratorForm";
import type { CreateStaffAdministratorPayload, StaffRole } from "@/interfaces/staff";

interface Props {
  modelValue: boolean;
  roles?: StaffRole[];
  loading?: boolean;
  serverError?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  loading: false,
  serverError: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", payload: CreateStaffAdministratorPayload): void;
}>();

const emptyForm = (): StaffAdministratorFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  campus: "",
  role_id: null,
  password: "",
  password_confirmation: "",
});

const form = reactive<StaffAdministratorFormValues>(emptyForm());
const touched = ref(false);

const errors = computed(() => validateStaffAdministratorForm(form));
const shown = computed(() => (touched.value ? errors.value : {}));

const submit = (): void => {
  touched.value = true;
  if (Object.keys(errors.value).length > 0 || form.role_id === null) return;
  emit("submit", {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    campus: form.campus,
    role_id: form.role_id,
    password: form.password,
    password_confirmation: form.password_confirmation,
  });
};

const close = (): void => emit("update:modelValue", false);

// Fresh form on every open: a previous password must never linger in the dialog.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      Object.assign(form, emptyForm());
      touched.value = false;
    }
  },
);
</script>
