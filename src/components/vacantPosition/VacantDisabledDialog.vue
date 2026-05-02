<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="480px"
    @keydown.stop.esc="close"
    :persistent="true"
  >
    <v-card>
      <v-card-title> Desactivar vacante </v-card-title>
      <v-card-text>
        <p>
          La vacante será deshabilitada y dejará de estar visible para los
          usuarios. Por favor, selecciona el estatus correspondiente para
          indicar si la vacante ha sido cubierta.
        </p>
        <v-radio-group class="mt-5" v-model="selectedCandidateType" mandatory>
          <v-radio
            label="Candidato interno de Impulso Universitario A.C."
            value="INTERNAL"
          ></v-radio>
          <v-radio label="Candidato externo" value="EXTERNAL"></v-radio>
          <v-radio label="No fue cubierto" value="NOT_COVERED"></v-radio>
          <v-radio label="Otro" value="OTHER"></v-radio>
          <v-text-field
            v-if="selectedCandidateType === 'OTHER'"
            v-model="otherValue"
            label="Descripción"
          ></v-text-field>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" :disabled="loading" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          :disabled="!selectedCandidateType"
          color="primary"
          variant="text"
          :loading="loading"
          @click="save"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { VacantPosition, CandidateType, VacantDisabledPayload } from "@/interfaces/vacant";

interface Props {
  modelValue: boolean;
  loading: boolean;
  editItem: VacantPosition | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", value: VacantDisabledPayload): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  editItem: null,
});

const emit = defineEmits<Emits>();

const selectedCandidateType = ref<CandidateType | null>(null);
const otherValue = ref<string>("");

const close = (): void => {
  emit("update:modelValue", false);
};

const save = (): void => {
  emit("submit", {
    candidate_type: selectedCandidateType.value,
    candidate_other: otherValue.value ? otherValue.value : "",
  });
};
</script>
