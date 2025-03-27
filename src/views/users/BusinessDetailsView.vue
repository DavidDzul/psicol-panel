<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <!-- <v-expansion-panel>
        <v-expansion-panel-title color="#f8f8f8">
          <template #default="{ expanded }">
            <PanelHeaderOptions
              title="Logo"
              button-text="Subir foto"
              :expanded="expanded"
              @button-click="onPhotoUpload"
            />
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row class="pb-5">
            <v-col cols="12">
              <p>
                Agregue el logotipo de la institución (Tamaño máximo de archivo
                300k, en formato jpg o png).
              </p>
            </v-col>
          </v-row>
          <UserPhoto :photos="businessPhoto" />
        </v-expansion-panel-text>
      </v-expansion-panel> -->
        <!-- <v-file-input
        ref="fileInput"
        class="d-none"
        accept="image/*"
        @update:model-value="changePhoto"
      ></v-file-input> -->

        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="selectedBusiness && editBusiness"
                title="Información de usuario"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
              <PanelHeaderOptions
                v-else="selectedBusiness"
                title="Información de usuario"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <BusinessForm
              v-if="selectedBusiness"
              :business="selectedBusiness"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="businessData && editBusiness"
                title="Información de la Empresa"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateBusinessDialog"
              />
              <PanelHeaderOptions
                v-else="selectedBusiness"
                title="Información de la Empresa"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <BusinessData v-if="businessData" :business="businessData" />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="agreements && editBusiness"
                title="Convenios de la Empresa"
                button-text="Agregar"
                :expanded="expanded"
                @button-click="openAgreementDialog"
              />
              <PanelHeaderOptions v-else title="Convenios de la Empresa" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <BusinessAgreements v-if="agreements" :agreements="agreements" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>
  <BusinessUpdateDialog
    v-if="selectedBusiness && editBusiness"
    v-model="editDialog"
    :edit-item="selectedBusiness"
    :loading="loadingUpdate"
    @submit="onUpdateBusiness"
  />
  <BusinessUpdateDataDialog
    v-if="businessData && editBusiness"
    v-model="editBusinessDialog"
    :edit-item="businessData"
    :loading="loadingUpdate"
    @submit="onUpdateBusinessData"
  />
  <BusinessCreateAgreement
    v-if="editBusiness"
    v-model="agreementDialog"
    :loading="loadingCreate"
    @submit="onCreateAgreement"
  />
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useBusinessDetailsPageStore } from "@/stores/views/businessDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import BusinessData from "@/components/users/BusinessData.vue";
import BusinessForm from "@/components/users/BusinessForm.vue";
import BusinessAgreements from "@/components/users/BusinessAgreements.vue";
import BusinessUpdateDataDialog from "@/components/users/BusinessUpdateDataDialog.vue";
import BusinessUpdateDialog from "@/components/users/BusinessUpdateDialog.vue";
import BusinessCreateAgreement from "@/components/users/BusinessCreateAgreement.vue";

const {
  links,
  selectedBusiness,
  businessData,
  agreements,
  editBusinessDialog,
  loadingUpdate,
  loadingCreate,
  editDialog,
  agreementDialog,
  editBusiness,
} = storeToRefs(useBusinessDetailsPageStore());
const {
  openUpdateBusinessDialog,
  onUpdateBusinessData,
  openUpdateDialog,
  onUpdateBusiness,
  openAgreementDialog,
  onCreateAgreement,
} = useBusinessDetailsPageStore();

const panel = ref([0, 0, 0]);
const confirmationDialog = ref();
</script>
