<template>
  <v-list style="margin-top: -8px">
    <template v-for="(item, i) in links" :key="i">
      <template v-if="item.group">
        <v-list-group v-if="!item.key || can(item.key)" :value="item.text">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="item.text"
              :prepend-icon="item.icon"
            />
          </template>
          <template v-for="(subItem, map) in item.links">
            <v-list-item
              :key="map"
              :title="subItem.text"
              :to="subItem.link"
              :exact="true"
              v-if="!subItem.key || can(subItem.key)"
            />
          </template>
        </v-list-group>
      </template>
      <template v-else>
        <v-list-item
          v-if="!item.key || can(item.key)"
          :to="item.link"
          :title="item.text"
          :prepend-icon="item.icon"
          :exact="true"
        />
      </template>
    </template>
  </v-list>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "@/stores/api/authStore";

const { permissions } = storeToRefs(useAuthStore());

const links = ref([
  {
    text: "Inicio",
    icon: "mdi-home",
    link: "/",
    group: false,
  },
  {
    text: "Asistencias",
    icon: "mdi-timer",
    group: true,
    key: "PS_GROUP_ATTENDANCE",
    links: [
      { text: "Checador", link: "/checador", key: "PS_CHECK" },
      { text: "Sesiones de F.", link: "/clases", key: "PS_CLASSES" },
    ],
  },
  {
    text: "Usuarios",
    icon: "mdi-account-multiple",
    group: true,
    key: "PS_GROUP_USERS",
    links: [
      { text: "Becarios/as", link: "/becarios", key: "PS_USERS" },
      { text: "Egresados/as", link: "/egresados", key: "PS_GRADUATES" },
      { text: "Empresas", link: "/empresas", key: "PS_BUSINESS" },
    ],
  },
  {
    text: "Vinculación laboral",
    icon: "mdi-briefcase",
    group: true,
    key: "PS_GROUP_JOBS",
    links: [
      { text: "Vacantes", link: "/vacantes", key: "PS_VACANT" },
      {
        text: "Postulaciones",
        link: "/postulaciones",
        key: "PS_APPLICATION",
      },
    ],
  },
  {
    text: "Configuración",
    icon: "mdi-cog",
    group: true,
    key: "PS_GROUP_CONFIG",
    links: [
      { text: "Generaciones", link: "/generaciones", key: "PS_GENERATIONS" },
      // { text: "Roles", link: "/roles" key: "PS_ROLES" },
      { text: "Áreas e informes", link: "/datos", key: "PS_GRAPHICS" },
      { text: "Avisos", link: "/avisos" },
    ],
  },
]);

const can = (permission) => {
  return !permission || permissions.value.includes(permission);
};
</script>
