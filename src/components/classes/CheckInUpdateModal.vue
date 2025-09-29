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
          <v-toolbar-title>Actualizar entrada</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="6" md="6">
              <v-select
                v-model="startHour"
                :items="hours"
                label="Hora"
              ></v-select>
            </v-col>
            <v-col cols="6" md="6">
              <v-select
                v-model="startMinute"
                :items="minutes"
                label="Minutos"
              ></v-select>
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
import { computed, watch, ref } from "vue";
import * as yup from "yup";

import * as validations from "@/validations";
import { campusArray } from "@/constants";

const startHour = ref(null);
const startMinute = ref(null);
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});

const { defineField, meta, values, resetField, resetForm, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(
      yup.object({
        class_start_time: validations.class_start_time(),
      })
    ),
  });

defineField("class_start_time");

const class_start_time = computed(
  () => `${startHour.value}:${startMinute.value}`
);

watch(class_start_time, (val) => {
  setFieldValue("class_start_time", val);
});

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  editItem: { type: Object, default: null },
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

watch(
  () => props.modelValue,
  (value) => {
    if (value && props.editItem?.check_in) {
      const [hour, minute] = props.editItem.check_in.split(":");
      startHour.value = hour;
      startMinute.value = minute;
    } else if (!value) {
      startHour.value = null;
      startMinute.value = null;
    }
  }
);

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", {
      check_in: values.class_start_time,
    });
  }
};
</script>

<style scoped></style>
