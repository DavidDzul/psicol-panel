<template>
  <BreadCrumbs :items="links" />
  <v-row>
    <v-col cols="12">
      <ClassUsersTable
        :class-data="classDetail"
        :attendances="attendances"
        @assign="openAssignDialog"
        @checkIn="openCheckInDialog"
        @checkOut="openCheckOutDialog"
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

  <CheckInUpdateModal
    v-model="checkInDialog"
    :edit-item="editItem"
    @submit="onCheckInUpdate"
  />
  <CheckOutUpdateModal v-model="checkOutDialog" :edit-item="editItem" />
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ClassUsersTable from "@/components/classes/ClassUsersTable.vue";
import ClassAssignUserModa from "@/components/classes/ClassAssignUserModa.vue";
import CheckInUpdateModal from "@/components/classes/CheckInUpdateModal.vue";
import CheckOutUpdateModal from "@/components/classes/CheckOutUpdateModal.vue";

import { useClassDetailsPageStore } from "@/stores/views/classDetailsPage";
const {
  links,
  classDetail,
  attendances,
  assignDialog,
  filteredCampus,
  generations,
  users,
  checkInDialog,
  editItem,
  checkOutDialog,
} = storeToRefs(useClassDetailsPageStore());
const {
  openAssignDialog,
  searchUsers,
  onAssignUsersToClass,
  openCheckInDialog,
  openCheckOutDialog,
  onCheckInUpdate,
} = useClassDetailsPageStore();
</script>
