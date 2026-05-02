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
interface Props {
  modelValue: boolean
  loading: boolean
  previewUrl: string
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit"): void
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  previewUrl: "",
});

const emit = defineEmits<Emits>();

const close = () => {
  emit("update:modelValue", false);
};

const save = () => {
  emit("submit");
};
</script>
