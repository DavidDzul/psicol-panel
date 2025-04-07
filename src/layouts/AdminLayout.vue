<template>
  <v-layout id="app">
    <v-app-bar color="primary" :order="0">
      <v-app-bar-nav-icon @click="onClick"></v-app-bar-nav-icon>
      <v-toolbar-title>Impulso Universitario A.C.</v-toolbar-title>

      <v-spacer></v-spacer>

      <ProfileMenu
        v-if="userProfile"
        :user="userProfile"
        :initials="userInitials"
        :full-name="fullName"
        @configuration="openUserDialog"
        @logout="logout"
      />
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :permanent="!mobile" width="280">
      <NavMenu />
    </v-navigation-drawer>

    <v-main>
      <!-- <LoadingOverlay v-model="loading" /> -->
      <v-container class="container__main" :fluid="true">
        <router-view />
      </v-container>
    </v-main>
    <v-snackbar
      v-model="show"
      :timeout="7000"
      :location="'right top'"
      :close-on-content-click="true"
      :color="config.status"
      :vertical="true"
    >
      <div class="d-flex">
        <v-icon
          class="mt-1 mr-2"
          v-if="config?.icon"
          :icon="config.icon"
        ></v-icon>
        <div>
          <div class="text-subtitle-1 font-weight-bold">{{ config.title }}</div>
          <p>{{ config?.body }}</p>
        </div>
      </div>
    </v-snackbar>
  </v-layout>
  <UserProfileDialog
    v-model="openUserProfileDialog"
    :edit-item="userProfile"
    @submit="updateUserProfile"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

import { useAuthStore } from "@/stores/api/authStore";
import { useAlertStore } from "@/stores/alert";

import ProfileMenu from "@/layouts/ProfileMenu.vue";
import NavMenu from "@/layouts/NavMenu.vue";
import UserProfileDialog from "@/components/auth/UserProfileDialog.vue";

const { userProfile, userInitials, fullName, openUserProfileDialog } =
  storeToRefs(useAuthStore());
const { logout, openUserDialog, updateUserProfile } = useAuthStore();
const { show, config } = storeToRefs(useAlertStore());

const { mobile } = useDisplay();
const drawer = ref(!mobile.value);

const onClick = () => {
  drawer.value = !drawer.value;
};
</script>
<style lang="scss" scoped>
.container__main {
  height: calc(100svh - var(--v-layout-top));
  overflow-y: auto;
}
</style>
