<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800px"
    @keydown.stop.esc="close"
    :persistent="true"
  >
    <v-card>
      <v-card-title> Descartar postulación </v-card-title>
      <v-card-text>
        <p>
          Por favor, seleccione la opción por el cual fue descartada la
          postulación.
        </p>
        <v-radio-group
          v-for="item in bsRejectedArray"
          class="mt-5"
          v-model="rejectedType"
          mandatory
        >
          <v-radio
            class="mb-0 pa-0"
            :label="item.text"
            :value="item.value"
          ></v-radio>
        </v-radio-group>
        <v-text-field
          v-if="rejectedType === 'OTHER'"
          v-model="otherValue"
          label="Descripción"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="close" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn
          :disabled="!rejectedType"
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
import { onBeforeMount, ref } from "vue";

import { bsRejectedArray } from "@/constants";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  editItem: { type: Object, default: () => null },
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

const rejectedType = ref(null);
const otherValue = ref("");

const close = () => {
  emit("update:modelValue", false);
  rejectedType.value = null;
};

const save = () => {
  emit("submit", {
    rejected_reason: rejectedType.value,
    rejected_other: otherValue.value ? otherValue.value : "",
    status: "REJECTED",
  });
};
</script>
