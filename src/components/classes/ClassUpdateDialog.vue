<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    persistent
  >
    <v-card>
      <v-form>
        <v-toolbar dark>
          <v-toolbar-title>Nueva sesión</v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-row>
            <!-- Nombre -->
            <v-col cols="12">
              <v-text-field
                v-model="class_name"
                v-bind="class_nameProps"
                label="Nombre"
              />
            </v-col>

            <!-- Fecha -->
            <v-col cols="12">
              <DatePickerInput v-model="class_date" input-text="Fecha" />
            </v-col>

            <!-- Hora de inicio -->
            <v-col cols="12"><strong>Hora de inicio:</strong></v-col>
            <v-col cols="6">
              <v-select v-model="startHour" :items="hours" label="Hora" />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="startMinute"
                :items="minutes"
                label="Minutos"
              />
            </v-col>

            <!-- Hora fin -->
            <v-col cols="12"><strong>Hora de término:</strong></v-col>
            <v-col cols="6">
              <v-select v-model="endHour" :items="hours" label="Hora" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="endMinute" :items="minutes" label="Minutos" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
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
import { ref, computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import * as validations from "@/validations";
import dayjs from "dayjs";
import DatePickerInput from "@/components/shared/DatePickerInput.vue";

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  editItem: { type: Object, default: null },
});

const vuetifyConfig = (state) => ({
  props: { "error-messages": state.errors },
});

// Horas y minutos
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

// Selects de hora
const startHour = ref(null);
const startMinute = ref(null);
const endHour = ref(null);
const endMinute = ref(null);

// Formulario vee-validate
const { defineField, meta, values, setFieldValue, setValues, resetForm } =
  useForm({
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
const [class_date] = defineField("class_date");

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
// Inicializa valores al abrir modal
watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (props.editItem) {
        setValues({
          class_name: props.editItem.name,
          class_date: props.editItem.date,
          class_start_time: props.editItem.start_time,
          class_end_time: props.editItem.end_time,
        });

        if (props.editItem.start_time) {
          const [h, m] = props.editItem.start_time.split(":");
          startHour.value = h;
          startMinute.value = m;
        }

        if (props.editItem.end_time) {
          const [h, m] = props.editItem.end_time.split(":");
          endHour.value = h;
          endMinute.value = m;
        }
      } else {
        // Valores por defecto para crear
        startHour.value = "09";
        startMinute.value = "00";
        endHour.value = "14";
        endMinute.value = "00";
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const emit = defineEmits(["update:modelValue", "submit"]);

const close = () => emit("update:modelValue", false);

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
