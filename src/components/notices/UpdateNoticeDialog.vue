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
          <v-toolbar-title>Nuevo aviso</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col v-if="root" cols="12" md="6">
              <v-checkbox
                v-model="global"
                v-bind="globalProps"
                label="¿Mensaje para todas las sedes?"
                density="comfortable"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="12">
              <v-select
                :items="adminCampus"
                v-model="campus"
                item-title="text"
                item-value="value"
                label="Sede"
                :disabled="global ? true : false"
              />
            </v-col>
            <v-col cols="12" md="12">
              <v-textarea
                v-model="message"
                v-bind="messageProps"
                label="Aviso"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-checkbox
                v-model="active"
                v-bind="activeProps"
                label="Mensaje activo"
                density="comfortable"
              ></v-checkbox>
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
import { useForm } from "vee-validate";
import type { FieldState } from "vee-validate";
import { watch } from "vue";
import * as yup from "yup";

import type { SelectOption } from "@/constants";
import type { Notice, NoticeForm } from "@/interfaces/notice";
import * as validations from "@/validations";

interface Props {
  modelValue: boolean;
  loading: boolean;
  adminCampus: SelectOption[];
  root: boolean;
  editItem: Notice | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", value: NoticeForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  adminCampus: () => [],
  root: false,
  editItem: null,
});

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      message: validations.message(),
      campus: validations.campus(),
      active: validations.notice_active(),
      global: validations.notice_global(),
    })
  ),
});

const [message, messageProps] = defineField("message", vuetifyConfig);
const [campus] = defineField("campus", vuetifyConfig);
const [active, activeProps] = defineField("active", vuetifyConfig);
const [global, globalProps] = defineField("global", vuetifyConfig);

const emit = defineEmits<Emits>();

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          message: props.editItem.message,
          campus: props.editItem.campus,
          active: props.editItem.active ? true : false,
          global: props.editItem.global ? true : false,
        });
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const close = (): void => {
  emit("update:modelValue", false);
};

const save = (): void => {
  if (meta.value.valid) {
    emit("submit", { ...values } as NoticeForm);
  }
};
</script>

<style scoped></style>
