<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <ClassUsersTable :class-data="classDetail" :attendances="attendances" />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ClassUsersTable from "@/components/classes/ClassUsersTable.vue";

import { useClassDetailsPageStore } from "@/stores/views/classDetailsPage";

const { classDetail, attendances } = storeToRefs(useClassDetailsPageStore());
</script>
