<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <ClassUsersTable
        :class-data="classDetail"
        :attendances="attendances"
        @assign="openAssignDialog"
      />
      <ClassAssignUserModa
        v-model="assignDialog"
        :user-campus="filteredCampus"
        :generations="generations"
        :users="users"
        :assigned-user-ids="attendances"
        @findUsers="searchUsers"
        @submit="onAssignUsersToClass"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ClassUsersTable from "@/components/classes/ClassUsersTable.vue";
import ClassAssignUserModa from "@/components/classes/ClassAssignUserModa.vue";

import { useClassDetailsPageStore } from "@/stores/views/classDetailsPage";

const {
  links,
  classDetail,
  attendances,
  assignDialog,
  filteredCampus,
  generations,
  users,
} = storeToRefs(useClassDetailsPageStore());
const { openAssignDialog, searchUsers, onAssignUsersToClass } =
  useClassDetailsPageStore();
</script>
