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
          <v-toolbar-title>Nueva sesión</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-row>
            <!-- Nombre -->
            <v-col cols="12" md="12">
              <v-text-field
                v-model="class_name"
                v-bind="class_nameProps"
                label="Nombre"
              ></v-text-field>
            </v-col>

            <!-- Fecha -->
            <v-col cols="12" md="12">
              <DatePickerInput v-model="class_date" :input-text="'Fecha'" />
            </v-col>

            <v-col cols="12">
              <p
                style="
                  padding-bottom: -10px;
                  padding-top: 0px;
                  font-weight: 600;
                "
              >
                Hora de inicio:
              </p>
            </v-col>
            <!-- Hora de inicio -->
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

            <v-col cols="12">
              <p
                style="padding-bottom: 0px; padding-top: 0px; font-weight: 600"
              >
                Hora de término:
              </p>
            </v-col>
            <!-- Hora fin -->
            <v-col cols="6" md="6">
              <v-select
                v-model="endHour"
                :items="hours"
                label="Hora"
              ></v-select>
            </v-col>
            <v-col cols="6" md="6">
              <v-select
                v-model="endMinute"
                :items="minutes"
                label="Minutos"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            :disabled="loading"
            @click="close"
          >
            Cancelar
          </v-btn>
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
import { PublicPathState, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import DatePickerInput from "@/components/shared/DatePickerInput.vue";
import * as yup from "yup";
import * as validations from "@/validations";
import dayjs from "dayjs";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
});

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

const startHour = ref(null);
const startMinute = ref(null);
const endHour = ref(null);
const endMinute = ref(null);

const { defineField, meta, values, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      class_name: validations.class_name(),
      class_date: validations.class_date(),
      class_start_time: validations.class_start_time(),
      class_end_time: validations.class_end_time(),
    })
  ),
});

const [class_name, class_nameProps] = defineField("class_name", vuetifyConfig);
const [class_date, class_dateProps] = defineField("class_date");

defineField("class_start_time");
defineField("class_end_time");

const class_start_time = computed(
  () => `${startHour.value}:${startMinute.value}`
);
const class_end_time = computed(() => `${endHour.value}:${endMinute.value}`);

watch(class_start_time, (val) => {
  setFieldValue("class_start_time", val);
});

watch(class_end_time, (val) => {
  setFieldValue("class_end_time", val);
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

watch(
  () => props.modelValue,
  (value) => {
    startHour.value = "09";
    startMinute.value = "00";
    endHour.value = "14";
    endMinute.value = "00";
    if (!value) resetForm();
  }
);

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  if (meta.value.valid) {
    emit("submit", {
      name: values.class_name,
      date: dayjs(values.class_date).format("YYYY-MM-DD"),
      start_time: values.class_start_time,
      end_time: values.class_end_time,
    });
  }
};
</script>

<style scoped></style>
