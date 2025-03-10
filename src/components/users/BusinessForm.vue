<template>
  <v-container class="user-details-list" fluid>
    <v-row>
      <!-- Primera columna -->
      <v-col cols="12" md="8">
        <v-list density="comfortable">
          <v-list-item title="Nombre(s):" :subtitle="business.first_name" />
          <v-list-item title="Apellidos:" :subtitle="business.first_name" />
          <v-list-item title="Correo electrónico:" :subtitle="business.email" />
          <v-list-item title="Número de celular:" :subtitle="business.phone" />
          <v-list-item
            title="Puesto de trabajo:"
            :subtitle="business.workstation"
          />
          <v-list-item
            title="Sede:"
            :subtitle="campusMap.get(business.campus).text"
          />
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { campusMap } from "@/constants";

const props = defineProps({
  business: { type: Object, required: false, default: {} },
});
</script>

<style lang="scss">
.user-details-list {
  max-width: 100%;
  .v-list-item__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: black;
  }
  .v-list-item-title {
    font-weight: 500;
  }
  .v-list-item-subtitle {
    opacity: 100%;
    color: black;
  }
}
</style>
