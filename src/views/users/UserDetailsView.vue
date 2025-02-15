<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      {{ selectedUser }}
    </v-col>
  </v-row>

  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserDetailsPageStore } from "@/stores/views/userDetailsPage";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import UserCreateDialog from "@/components/users/UserCreateDialog.vue";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";

const { links, selectedUser } = storeToRefs(useUserDetailsPageStore());
const {} = useUserDetailsPageStore();

const confirmationDialog = ref();
</script>
