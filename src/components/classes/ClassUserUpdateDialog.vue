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
            <v-col cols="12">
              <v-select
                clearable
                :items="classStatus"
                v-model="class_status"
                item-title="text"
                item-value="value"
                label="Estatus"
              />
            </v-col>

            <!-- Hora de inicio -->
            <template v-if="showTimes">
              <v-col cols="12"><strong>Hora de entrada:</strong></v-col>
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
            </template>

            <!-- Hora fin -->
            <template v-if="showTimes">
              <v-col cols="12"><strong>Hora de salida:</strong></v-col>
              <v-col cols="6">
                <v-select v-model="endHour" :items="hours" label="Hora" />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="endMinute"
                  :items="minutes"
                  label="Minutos"
                />
              </v-col>
            </template>

            <v-col cols="12">
              <v-textarea
                v-model="class_observation"
                v-bind="class_observationProps"
                label="Observaciones"
                rows="3"
              ></v-textarea>
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
import type { FieldState } from "vee-validate";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import * as validations from "@/validations";
import { classStatus } from "@/constants";
import type { ClassAttendance, ClassUserForm } from "@/interfaces/class";

interface Props {
  modelValue?: boolean;
  loading?: boolean;
  editItem?: ClassAttendance | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
});

const vuetifyConfig = (state: FieldState<unknown>) => ({
  props: { "error-messages": state.errors },
});

// Horas y minutos
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

const startHour = ref<string>("");
const startMinute = ref<string>("");
const endHour = ref<string>("");
const endMinute = ref<string>("");
const showTimes = ref<boolean>(false);

// Formulario vee-validate
const { defineField, meta, values, setFieldValue, setValues, resetForm } =
  useForm<ClassUserForm>({
    validationSchema: toTypedSchema(
      yup.object({
        class_status: validations.class_status(),
        class_observation: validations.class_observation(),
        class_start_time: validations.class_start_time(),
        class_end_time: validations.class_end_time(),
      }),
    ),
  });

const [class_status, class_statusProps] = defineField(
  "class_status",
  vuetifyConfig,
);
const [class_observation, class_observationProps] = defineField(
  "class_observation",
  vuetifyConfig,
);

defineField("class_start_time");
defineField("class_end_time");

const class_start_time = computed(() => {
  return startHour.value && startMinute.value
    ? `${startHour.value}:${startMinute.value}`
    : null;
});

const class_end_time = computed(() => {
  return endHour.value && endMinute.value
    ? `${endHour.value}:${endMinute.value}`
    : null;
});

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
        console.log(props.editItem);
        setValues({
          class_status: props.editItem.status,
          class_start_time: props.editItem.check_in,
          class_end_time: props.editItem.check_out,
          class_observation: props.editItem.observations,
        });

        if (props.editItem.check_in) {
          const [h, m] = props.editItem.check_in.split(":");
          startHour.value = h;
          startMinute.value = m;
        }

        if (props.editItem.check_out) {
          const [h, m] = props.editItem.check_out.split(":");
          endHour.value = h;
          endMinute.value = m;
        }
      } else {
        // Valores por defecto para crear
        startHour.value = "";
        startMinute.value = "";
        endHour.value = "";
        endMinute.value = "";
      }
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(class_status, (val) => {
  if (val === "ABSENT" || val === "JUSTIFIED_ABSENCE") {
    startHour.value = "00";
    startMinute.value = "00";
    endHour.value = "00";
    endMinute.value = "00";

    setFieldValue("class_start_time", "00:00");
    setFieldValue("class_end_time", "00:00");
    showTimes.value = false;
  } else {
    showTimes.value = true;
  }
});

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: { status: string; check_in: string | null | undefined; check_out: string | null | undefined; observations: string | undefined }): void;
}

const emit = defineEmits<Emits>();

const close = () => emit("update:modelValue", false);

const save = () => {
  if (meta.value.valid) {
    emit("submit", {
      status: values.class_status,
      check_in: values.class_start_time,
      check_out: values.class_end_time,
      observations: values.class_observation,
    });
  }
};
</script>

<style scoped></style>
