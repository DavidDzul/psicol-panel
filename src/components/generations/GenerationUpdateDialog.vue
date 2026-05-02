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
          <v-toolbar-title>Actualizar Generación</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="generation_name"
                v-bind="generation_nameProps"
                label="Nombre/Número de generación"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="12">
              <v-checkbox
                v-model="generation_active"
                v-bind="generation_activeProps"
                label="¿Generación activa?"
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

import type { Generation, GenerationForm } from "@/interfaces/generation";
import * as validations from "@/validations";

interface Props {
  modelValue: boolean
  loading: boolean
  editItem: Generation | null
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit", value: GenerationForm): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
});

const emit = defineEmits<Emits>();

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetForm, setValues } = useForm<GenerationForm>(
  {
    validationSchema: toTypedSchema(
      yup.object({
        generation_name: validations.generation_name(),
        generation_active: validations.generation_active(),
      })
    ),
  }
);

const [generation_name, generation_nameProps] = defineField(
  "generation_name",
  vuetifyConfig
);
const [generation_active, generation_activeProps] = defineField(
  "generation_active",
  vuetifyConfig
);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          generation_name: props.editItem.generation_name,
          generation_active: props.editItem.generation_active ? true : false,
        });
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", { ...values } as GenerationForm);
  }
};
</script>

<style scoped></style>
