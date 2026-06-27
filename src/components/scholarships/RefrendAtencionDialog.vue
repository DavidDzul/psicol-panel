<template>
  <v-dialog v-model="model" max-width="520" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon :color="titleColor" size="small">{{ titleIcon }}</v-icon>
        {{ titleText }}
      </v-card-title>

      <v-card-text class="pt-0">
        <v-alert
          v-if="readonly"
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-school-outline"
          class="mb-4"
        >
          Pedagogía ya respondió esta incidencia.
        </v-alert>

        <p v-else class="text-body-2 text-medium-emphasis mb-4">
          {{
            isEditMode
              ? "Editá la descripción de la incidencia registrada."
              : "Registrá una incidencia para este refrendo. El becario pasará a revisión de Pedagogía."
          }}
        </p>

        <v-select
          v-model="form.incident_category"
          :items="categoryItems"
          label="Categoría (opcional)"
          variant="outlined"
          density="compact"
          clearable
          :disabled="readonly || loading"
          class="mb-3"
        />

        <v-textarea
          v-model="form.description"
          label="Descripción *"
          rows="4"
          variant="outlined"
          counter="2000"
          maxlength="2000"
          placeholder="Describí el motivo de la incidencia..."
          :disabled="readonly || loading"
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <template v-if="readonly">
          <v-spacer />
          <v-btn variant="text" @click="model = false">Cerrar</v-btn>
        </template>
        <template v-else>
          <v-btn
            v-if="isEditMode"
            variant="text"
            color="error"
            :loading="clearLoading"
            :disabled="loading"
            @click="emit('remove')"
          >
            Remover incidencia
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="loading || clearLoading"
            @click="model = false"
            >Cancelar</v-btn
          >
          <v-btn
            :color="isEditMode ? 'orange-darken-2' : 'blue'"
            variant="elevated"
            :loading="loading"
            :disabled="!form.description.trim() || clearLoading"
            @click="submit"
          >
            {{ isEditMode ? "Guardar cambios" : "Registrar incidencia" }}
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type {
  AtencionFlagForm,
  IncidentCategory,
} from "@/interfaces/scholarship";

const props = defineProps<{
  loading?: boolean;
  clearLoading?: boolean;
  initialDescription?: string | null;
  initialCategory?: IncidentCategory | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  submit: [form: AtencionFlagForm];
  remove: [];
}>();

const model = defineModel<boolean>();

const isEditMode = computed(() => !!props.initialDescription);

const titleColor = computed(() => {
  if (props.readonly) return "grey";
  return isEditMode.value ? "orange-darken-2" : "blue";
});

const titleIcon = computed(() => {
  if (props.readonly) return "mdi-eye-outline";
  return isEditMode.value ? "mdi-flag-outline" : "mdi-flag-plus-outline";
});

const titleText = computed(() => {
  if (props.readonly) return "Ver incidencia";
  return isEditMode.value ? "Editar incidencia" : "Registrar incidencia";
});

const categoryItems: { title: string; value: IncidentCategory }[] = [
  { title: "Asistencia", value: "ASISTENCIA" },
  { title: "Académico", value: "ACADEMICO" },
  { title: "Documentos", value: "DOCUMENTOS" },
  { title: "Administrativo", value: "ADMINISTRATIVO" },
  { title: "Otro", value: "OTRO" },
];

const form = reactive<AtencionFlagForm>({
  description: "",
  incident_category: undefined,
});

watch(model, (v) => {
  if (v) {
    form.description = props.initialDescription ?? "";
    form.incident_category = props.initialCategory ?? undefined;
  }
});

const submit = (): void => {
  if (!form.description.trim()) return;
  emit("submit", { ...form });
};
</script>
