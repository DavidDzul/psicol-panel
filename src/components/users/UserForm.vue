<template>
  <v-container class="user-details-list" fluid>
    <v-row>
      <!-- Primera columna -->
      <v-col cols="12" md="8">
        <v-list density="comfortable">
          <v-list-item title="ID" :subtitle="user.id" />
          <v-list-item title="Matrícula" :subtitle="user.enrollment" />
          <v-list-item title="Nombre(s):" :subtitle="user.first_name" />
          <v-list-item title="Apellidos:" :subtitle="user.last_name" />
          <v-list-item title="Correo electrónico:" :subtitle="user.email" />
          <v-list-item title="Número de celular:" :subtitle="user.phone" />
          <v-list-item
            title="Tipo de usuario:"
            :subtitle="becTypeMap.get(user.user_type).text"
          />
          <v-list-item
            title="Sede:"
            :subtitle="campusMap.get(user.campus).text"
          />
          <v-list-item
            title="¿Acceso a la plataforma?"
            :subtitle="user.active ? 'Sí' : 'No'"
          />
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { campusMap, becTypeMap } from "@/constants";

const props = defineProps({
  user: { type: Object, required: false, default: {} },
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
