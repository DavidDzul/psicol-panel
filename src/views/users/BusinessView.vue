<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <BusinessTable :business="business" @create="openCreateDialog" />
    </v-col>
  </v-row>

  <BusinessCreateDialog
    v-model="createDialog"
    :user-campus="filteredCampus"
    @submit="onSaveBusiness"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useBusinessPageStore } from "@/stores/views/businessPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import BusinessTable from "@/components/users/BusinessTable.vue";
import BusinessCreateDialog from "@/components/users/BusinessCreateDialog.vue";

const { links, business, createDialog, filteredCampus } = storeToRefs(
  useBusinessPageStore()
);
const { openCreateDialog, onSaveBusiness } = useBusinessPageStore();

const confirmationDialog = ref();
</script>
