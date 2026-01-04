<template>
  <BreadCrumbs :items="links" />
  <!-- {{ roles }} -->

  <v-row>
    <v-col cols="12">
      <RolesAdminTable :roles="roles" />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRolesAdminPageStore } from "@/stores/views/rolesAdminPage";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import RolesAdminTable from "@/components/roles/RolesAdminTable.vue";

const { roles, links } = storeToRefs(useRolesAdminPageStore());
</script>
