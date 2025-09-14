<template>
  <v-row>
    <v-col cols="12">
      <TimeClock />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import TimeClock from "@/components/attendances/TimeClock.vue";
</script>
