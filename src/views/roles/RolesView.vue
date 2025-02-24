<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <!-- <GenerationsTable :generations="generations" @create="openCreateDialog" /> -->
      {{ roles }}
    </v-col>
  </v-row>

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRolesPageStore } from "@/stores/views/rolesPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import GenerationsTable from "@/components/generations/GenerationsTable.vue";

const { roles, links } = storeToRefs(useRolesPageStore());

const confirmationDialog = ref();
</script>
