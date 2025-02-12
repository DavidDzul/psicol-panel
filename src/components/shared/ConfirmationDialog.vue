<template>
  <v-dialog
    v-model="dialog"
    max-width="400px"
    @click:outside.stop="cancel"
    @keydown.stop.esc="cancel"
    :persistent="true"
  >
    <v-card>
      <v-card-title>
        {{ options?.title }}
      </v-card-title>
      <v-card-text>
        {{ options?.body }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="cancel"> Cancelar </v-btn>
        <v-btn color="primary" variant="text" @click="confirm">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";

import { ConfirmationOptionsInterface } from "@/interfaces";

const dialog = ref(false);
const options = ref<ConfirmationOptionsInterface>();
const resolve = ref();
const open: (opt: ConfirmationOptionsInterface) => Promise<boolean> = (
  opt: ConfirmationOptionsInterface
) => {
  options.value = { ...opt };
  dialog.value = true;
  return new Promise((res) => {
    resolve.value = res;
  });
};
const confirm = () => {
  resolve.value?.(true);
  close();
};
const cancel = () => {
  resolve.value?.(false);
  close();
};
const close = () => {
  dialog.value = false;
};

defineExpose({ open });
</script>
