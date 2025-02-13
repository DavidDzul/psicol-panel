<template>
  <BreadCrumbs :items="links" />
  <v-container>
    <v-row>
      <!-- <v-col cols="12">
        <h3>Listado de Generaciones</h3>
      </v-col> -->
      <v-col cols="12">
        <GenerationsTable
          :generations="generations"
          @create="openCreateDialog"
        />
      </v-col>
    </v-row>
  </v-container>

  <GenerationCreateDialog
    v-model="createDialog"
    @submit="onSaveGeneration"
    :user-campus="filteredCampus"
    :loading="loadingCreate"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useGenerationsPageStore } from "@/stores/views/generationPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import GenerationsTable from "@/components/generations/GenerationsTable.vue";
import GenerationCreateDialog from "@/components/generations/GenerationCreateDialog.vue";

const { generations, links, createDialog, loadingCreate, filteredCampus } =
  storeToRefs(useGenerationsPageStore());
const { openCreateDialog, onSaveGeneration } = useGenerationsPageStore();

const confirmationDialog = ref();
</script>
