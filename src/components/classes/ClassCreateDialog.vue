<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="760px"
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
            <v-col cols="12" md="12">
              <v-text-field
                v-model="class_name"
                v-bind="class_nameProps"
                label="Nombre"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="12">
              <DatePickerInput v-model="class_date" :input-text="'Fecha'" />
            </v-col>

            <v-col cols="12">
              <span class="font-weight-bold"
                >Seleccione la hora de inicio:</span
              >
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="startHour"
                :items="hours"
                label="Hora"
              ></v-select>
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="startMinute"
                :items="minutes"
                label="Minutos"
              ></v-select>
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="startSeconds"
                :items="seconds"
                label="Segundos"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <span class="font-weight-bold">
                Seleccione la hora de término:
              </span>
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="endHour"
                :items="hours"
                label="Hora"
              ></v-select>
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="endMinute"
                :items="minutes"
                label="Minutos"
              ></v-select>
            </v-col>
            <v-col cols="4" md="4">
              <v-select
                v-model="endSeconds"
                :items="seconds"
                label="Segundos"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                clearable
                :items="adminCampus"
                v-model="campus"
                item-title="text"
                item-value="value"
                label="Sede"
                v-bind="campusProps"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                clearable
                :items="filteredGenerations"
                v-model="generation_id"
                item-title="generation_name"
                item-value="id"
                label="Generación"
                v-bind="generation_idProps"
              />
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
import type { FieldState } from "vee-validate";
import { useForm } from "vee-validate";
import { computed, ref, watch, nextTick } from "vue";
import DatePickerInput from "@/components/shared/DatePickerInput.vue";
import * as yup from "yup";
import * as validations from "@/validations";
import dayjs from "dayjs";
import type { SelectOption } from "@/constants";
import type { Generation } from "@/interfaces/generation";
import type { ClassForm } from "@/interfaces/class";

interface Props {
  modelValue: boolean
  loading: boolean
  adminCampus: SelectOption[]
  generations: Generation[]
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit", value: ClassForm): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  adminCampus: () => [],
  generations: () => [],
});

const emit = defineEmits<Emits>();

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: {
    "error-messages": state.errors,
  },
});

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const seconds = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const startHour = ref<string>("09");
const startMinute = ref<string>("00");
const startSeconds = ref<string>("59");
const endHour = ref<string>("14");
const endMinute = ref<string>("00");
const endSeconds = ref<string>("00");

const filteredGenerations = computed<Generation[]>(() =>
  props.generations.filter((g) => g.campus === campus.value),
);

const { defineField, meta, values, resetForm, setFieldValue } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      campus: validations.campus(),
      class_name: validations.class_name(),
      class_date: validations.class_date(),
      class_start_time: validations.class_start_time(),
      class_end_time: validations.class_end_time(),
      generation_id: validations.generation_id(),
    }),
  ),
  initialValues: {
    class_start_time: "09:00:59",
    class_end_time: "14:00:00",
  },
});

const [campus, campusProps] = defineField("campus", vuetifyConfig);
const [class_name, class_nameProps] = defineField("class_name", vuetifyConfig);
const [class_date] = defineField("class_date");
const [generation_id, generation_idProps] = defineField(
  "generation_id",
  vuetifyConfig,
);

defineField("class_start_time");
defineField("class_end_time");

const class_start_time = computed<string>(
  () => `${startHour.value}:${startMinute.value}:${startSeconds.value}`,
);

const class_end_time = computed<string>(
  () => `${endHour.value}:${endMinute.value}:${endSeconds.value}`,
);

watch(class_start_time, (val) => {
  setFieldValue("class_start_time", val);
});

watch(class_end_time, (val) => {
  setFieldValue("class_end_time", val);
});

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      startHour.value = "09";
      startMinute.value = "00";
      startSeconds.value = "59";
      endHour.value = "14";
      endMinute.value = "00";
      endSeconds.value = "00";

      nextTick(() => {
        setFieldValue("class_start_time", class_start_time.value);
        setFieldValue("class_end_time", class_end_time.value);
      });
    } else {
      resetForm();
    }
  },
);

const close = (): void => {
  emit("update:modelValue", false);
};

const save = (): void => {
  if (meta.value.valid) {
    emit("submit", { ...values } as ClassForm);
  }
};
</script>

<style scoped></style>
