<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      {{ business }}
    </v-col>
  </v-row>

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useBusinessPageStore } from "@/stores/views/businessPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";

const { links, business } = storeToRefs(useBusinessPageStore());
const {} = useBusinessPageStore();

const confirmationDialog = ref();
</script>
