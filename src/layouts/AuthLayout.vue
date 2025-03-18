<template>
  <v-app>
    <v-main>
      <v-container :fluid="true" class="fill-height pa-0">
        <v-row no-gutters class="login__container fill-height">
          <v-col class="login__screen flex-shrink-1 flex-grow-1 flex-md-grow-0">
            <v-card
              rounded="0"
              :flat="true"
              min-height="100%"
              class="d-flex flex-wrap"
            >
              <v-card-text class="card-center">
                <div class="login__screen-logo mx-auto">
                  <img
                    class="v-responsive"
                    src="@/assets/img/logo_text.png"
                    alt="logo"
                  />
                </div>
                <router-view />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col class="login__cover d-none d-md-flex flex-md-grow-1"> </v-col>
        </v-row>
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
  </v-app>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAlertStore } from "@/stores/alert";
const { show, config } = storeToRefs(useAlertStore());
</script>
<style scoped lang="scss">
.login__container {
  min-height: 100svh;
}
.card-center {
  align-self: center;
}
.login__screen {
  display: flex;
  flex-direction: column;
  flex-basis: 435px;
  max-width: inherit;
  &-logo {
    max-width: 330px;
    margin-bottom: 40px;
  }
  &-form {
    max-width: 350px;
  }
  &-footer {
    width: 100%;
    background-color: #ededed;
    border-top: #a4a4a4 2px solid;
    &-header {
      flex-basis: 435px;
      flex-grow: 0;
    }
  }
}
.login__cover {
  background-image: url("@/assets/img/bg1.jpg");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}
</style>
