<template>
  <v-menu
    v-model="formMenuStart"
    :close-on-content-click="false"
    :close-on-back="true"
    max-width="400"
    min-width="200"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-bind="props"
        :label="inputText"
        :model-value="textDate"
        prepend-icon="mdi-calendar"
        readonly
        @update:model-value="$emit('update:modelValue', $event)"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="fromDate"
      no-title
      @update:model-value="getFormatDate($event)"
      :hide-header="true"
    ></v-date-picker>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import dayjs from "dayjs";

defineProps({
  modelValue: { type: String },
  inputText: { type: String },
});

const formMenuStart = ref(false);
const fromDate = ref(null);
const textDate = ref("");

const getFormatDate = (date: string) => {
  fromDate.value = date;
  formMenuStart.value = false;
  textDate.value = dayjs(fromDate.value).format("DD-MM-YYYY");
  emit("update:modelValue", dayjs(fromDate.value).format("YYYY-MM-DD"));
};

const emit = defineEmits<{
  "update:modelValue": [value: string];
  buttonClick: [];
}>();
</script>
