<template>
  <v-layout id="app">
    <v-app-bar
      :color="'appbar'"
      border="b"
      :elevation="0"
      height="60"
      :order="0"
    >
      <v-app-bar-nav-icon @click="onClick"></v-app-bar-nav-icon>

      <div class="brand-inline">
        <img
          src="@/assets/img/logo-black.png"
          alt="Impulso"
          class="brand-logo"
        />
        <div class="brand-text">
          <span class="brand-name">Impulso Universitario</span>
          <span class="brand-suffix">A.C.</span>
        </div>
      </div>

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
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!mobile"
      width="280"
      style="background-color: #ffffff"
    >
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
import { ref, watch } from "vue";
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
const route = useRoute();

const onClick = () => {
  drawer.value = !drawer.value;
};

watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes("/checador")) {
      drawer.value = false;
    } else if (!mobile.value) {
      drawer.value = true;
    }
  },
);
</script>
<style lang="scss" scoped>
.container__main {
  height: calc(100svh - var(--v-layout-top));
  overflow-y: auto;
  padding-top: 8px;
}
:deep(.v-navigation-drawer) {
  border-right: 1px solid rgba(0, 0, 0, 0.07) !important;
}
.brand-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 2px;
}
.brand-logo {
  height: 28px;
  width: auto;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.brand-suffix {
  font-size: 10px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.4);
}
</style>
