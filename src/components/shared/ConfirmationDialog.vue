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
import type { ConfirmationOptionsInterface } from "@/interfaces";

const dialog = ref<boolean>(false);
const options = ref<ConfirmationOptionsInterface | undefined>(undefined);
const resolve = ref<((value: boolean) => void) | null>(null);

const open = (opt: ConfirmationOptionsInterface): Promise<boolean> => {
  options.value = { ...opt };
  dialog.value = true;
  return new Promise((res) => {
    resolve.value = res;
  });
};

const confirm = (): void => {
  resolve.value?.(true);
  close();
};

const cancel = (): void => {
  resolve.value?.(false);
  close();
};

const close = (): void => {
  dialog.value = false;
};

defineExpose({ open });
</script>
