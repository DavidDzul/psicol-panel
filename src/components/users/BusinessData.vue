<template>
  <v-container class="user-details-list" fluid>
    <v-row>
      <!-- Primera columna -->
      <v-col cols="12" md="6">
        <v-list density="comfortable">
          <v-list-item
            title="Nombre de la empresa:"
            :subtitle="business?.bs_name"
          />
          <v-list-item title="Director:" :subtitle="business?.bs_director" />
          <v-list-item title="RFC:" :subtitle="business?.bs_rfc" />
          <v-list-item title="País:" :subtitle="business?.bs_country" />
          <v-list-item title="Estado:" :subtitle="business?.bs_state" />
        </v-list>
      </v-col>
      <!-- Segunda columna -->
      <v-col cols="12" md="6">
        <v-list density="comfortable">
          <v-list-item
            title="Localidad/Municipio:"
            :subtitle="business?.bs_locality"
          />
          <v-list-item title="Dirección:" :subtitle="business?.bs_adrress" />
          <v-list-item title="Teléfono:" :subtitle="business?.bs_telphone" />
          <v-list-item
            title="Giro:"
            :subtitle="
              business?.bs_line !== 'OTHER'
                ? lineBusinessMap.get(business?.bs_line)?.text
                : business?.bs_other_line
            "
          />
          <v-list-item
            title="Enlace de información:"
            :subtitle="business?.bs_website"
          />
        </v-list>
      </v-col>

      <v-col cols="12" md="12">
        <p style="font-weight: 500">Descripción:</p>
        <p>{{ business?.bs_description }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

import { lineBusinessMap } from "@/constants";

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
