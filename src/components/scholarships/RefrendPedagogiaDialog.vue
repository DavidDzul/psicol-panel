<template>
  <v-dialog v-model="model" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="deep-purple" size="small">mdi-school-outline</v-icon>
        Validación pedagógica
      </v-card-title>

      <v-card-text class="pt-0">
        <div v-if="atencionObservations" class="mb-4">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-1">
            INCIDENCIA REGISTRADA POR ATENCIÓN
          </div>
          <v-sheet color="blue-grey-lighten-5" rounded="lg" class="pa-3">
            <p class="text-body-2 mb-0">{{ atencionObservations }}</p>
          </v-sheet>
        </div>

        <v-textarea
          v-model="form.comment"
          label="Respuesta de Pedagogía (opcional)"
          rows="4"
          variant="outlined"
          counter="2000"
          maxlength="2000"
          placeholder="Anotá la resolución, acuerdos o indicaciones para el becario..."
          class="mb-2"
        />

      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn
          v-if="isEditMode"
          variant="text"
          color="error"
          :loading="clearLoading"
          :disabled="loading"
          @click="emit('remove')"
        >
          Remover respuesta
        </v-btn>
        <v-spacer />
        <v-btn variant="text" :disabled="loading || clearLoading" @click="model = false">Cancelar</v-btn>
        <v-btn
          color="deep-purple"
          variant="elevated"
          :loading="loading"
          :disabled="clearLoading"
          @click="submit"
        >
          {{ isEditMode ? 'Guardar cambios' : 'Guardar validación' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { PedagogiaResolveForm } from "@/interfaces/scholarship";

const props = defineProps<{
  loading?: boolean;
  clearLoading?: boolean;
  atencionObservations?: string | null;
  initialComment?: string | null;
}>();

const emit = defineEmits<{
  submit: [form: PedagogiaResolveForm];
  remove: [];
}>();

const isEditMode = computed(() => !!props.initialComment);

const model = defineModel<boolean>();

const form = reactive<PedagogiaResolveForm>({
  comment: null,
});

watch(model, (v) => {
  if (v) {
    form.comment = props.initialComment ?? null;
  }
});

const submit = (): void => {
  emit("submit", {
    comment: form.comment?.trim() || null,
  });
};
</script>
