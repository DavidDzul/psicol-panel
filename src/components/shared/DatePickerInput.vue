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
        :label="inputText"
        readonly
        :model-value="textDate"
        v-bind="props"
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

const props = defineProps({
  modelValue: { type: String },
  inputText: { type: String },
  textDate: { type: String, default: () => "" },
});

const formMenuStart = ref(false);
const fromDate = ref(null);

const getFormatDate = (date) => {
  fromDate.value = date;
  formMenuStart.value = false;
  emit("update:modelValue", dayjs(fromDate.value).format("DD/MM/YYYY"));
};

const emit = defineEmits<{
  "update:modelValue": [value: string];
  buttonClick: [];
}>();
</script>
