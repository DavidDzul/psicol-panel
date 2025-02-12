<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        {{ generations }}
        <!-- <BusinessApplications
            :applications="applications"
            @submit="openUserCV"
            @rejected="onApplicationRejected"
            @accepted="onApplicationAccepted"
            :loading="loadingCV"
          /> -->
      </v-col>
    </v-row>
  </v-container>

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGenerationsPageStore } from "@/stores/views/generationPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";

//   import BusinessApplications from "@/components/applications/BusinessApplications.vue";
const { generations } = storeToRefs(useGenerationsPageStore());

const confirmationDialog = ref();
</script>
