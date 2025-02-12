<template>
  <v-row no-gutters justify="space-between">
    <v-col cols="4" class="d-flex justify-start panel-title">
      {{ title }}
    </v-col>
    <v-col cols="8">
      <v-fade-transition leave-absolute>
        <v-row v-if="expanded" no-gutters justify="end">
          <v-col cols="auto">
            <v-text-field
              v-if="search"
              :model-value="modelValue"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-magnify"
              single-line
              @click.stop="() => null"
              label="Buscar (Nombre)"
              style="min-width: 300px; margin-right: 20px"
              @update:model-value="$emit('update:modelValue', $event)"
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-btn
              variant="outlined"
              color="primary"
              class="mr-5"
              @click.stop="$emit('buttonClick')"
              >{{ buttonText }}</v-btn
            >
          </v-col>
        </v-row>
      </v-fade-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String },
  expanded: { type: Boolean, default: () => false },
  title: { type: String, default: () => "" },
  buttonText: { type: String, default: () => "" },
  search: { type: Boolean, default: () => false },
});

defineEmits<{
  "update:modelValue": [value: string];
  buttonClick: [];
}>();
</script>
<style lang="scss" scoped>
.panel-title {
  font-weight: 600;
  text-transform: uppercase;
}
</style>
