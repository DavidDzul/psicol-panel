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
        <v-card-title> Nueva foto </v-card-title>
        <v-card-text>
          <v-item-group mandatory class="mt-5">
            <v-container>
              <v-img :src="previewUrl" max-height="600px"></v-img>
            </v-container>
          </v-item-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" :disabled="loading" @click="close"
            >Cancelar</v-btn
          >
          <v-btn
            color="primary"
            :loading="loading"
            variant="text"
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
import { PropType, ref } from "vue";
import * as yup from "yup";

defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  previewUrl: { type: String, default: () => "" },
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [];
}>();

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  emit("submit");
};
</script>
