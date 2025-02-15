<template>
  <v-list style="margin-top: -8px">
    <template v-for="(item, i) in links" :key="i">
      <template v-if="item.group">
        <v-list-group :value="item.text">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.text"
              :prepend-icon="item.icon"
            >
            </v-list-item>
          </template>
          <v-list-item
            v-for="(subItem, map) in item.links"
            :key="map"
            :title="subItem.text"
            :to="subItem.link"
            :exact="true"
          >
          </v-list-item>
        </v-list-group>
      </template>
      <template v-else>
        <v-list-item
          :to="item.link"
          :title="item.text"
          :prepend-icon="item.icon"
          :exact="true"
        >
        </v-list-item>
        <!-- <v-list-item v-if="userProfile?.root || !item.admin" :to="item.link" :title="item.text" :prepend-icon="item.icon" :exact="true"> </v-list-item> -->
      </template>
    </template>
  </v-list>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";

const links = ref([
  {
    text: "Inicio",
    icon: "mdi-home",
    link: "/",
    group: false,
  },
  {
    text: "Usuarios",
    icon: "mdi-account-multiple",
    link: "/usuarios",
    group: true,
    links: [
      {
        text: "Becarios/as",
        link: "/becarios",
      },
      {
        text: "Egresados/as",
        link: "/egresados",
      },
      {
        text: "Empresas",
        link: "/empresas",
      },
      // {
      //   text: "Administradores",
      //   link: "/administradores",
      // },
    ],
  },
  {
    text: "Vacantes",
    icon: "mdi-map",
    link: "/vacantes",
    group: false,
  },
  {
    text: "Configuración",
    icon: "mdi-cog",
    link: "/configuracion",
    group: true,
    links: [
      {
        text: "Generaciones",
        link: "/generaciones",
      },
    ],
  },
]);
</script>
