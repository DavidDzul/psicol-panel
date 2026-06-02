<template>
  <v-list density="compact" nav class="nav-list">
    <template v-for="(item, i) in links" :key="i">
      <!-- GROUP -->
      <v-list-group
        v-if="item.group && (!item.key || can(item.key))"
        :value="item.text"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="item.text"
            :prepend-icon="item.icon"
            class="nav-item"
          />
        </template>

        <template v-for="(subItem, j) in item.links" :key="j">
          <v-list-item
            v-if="!subItem.key || can(subItem.key)"
            :to="subItem.link"
            :title="subItem.text"
            density="compact"
            class="nav-subitem"
          />
        </template>
      </v-list-group>

      <!-- SINGLE -->
      <v-list-item
        v-else-if="!item.key || can(item.key)"
        :to="item.link"
        :title="item.text"
        :prepend-icon="item.icon"
        class="nav-item"
        :exact="item.link === '/'"
      />
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
      { text: "Becarios y egresados", link: "/becarios", key: "PS_USERS" },
      // { text: "Egresados/as", link: "/egresados", key: "PS_GRADUATES" },
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
    text: "Becas",
    icon: "mdi-school",
    group: true,
    key: "PS_GROUP_SCHOLARSHIPS",
    links: [
      { text: "Atención a Becarios", link: "/scholarships/atencion", key: "PS_SCHOLARSHIPS_ATENCION" },
      { text: "Pedagogía", link: "/scholarships/pedagogia", key: "PS_SCHOLARSHIPS_PEDAGOGIA" },
    ],
  },
  {
    text: "Configuración",
    icon: "mdi-cog",
    group: true,
    key: "PS_GROUP_CONFIG",
    links: [
      { text: "Generaciones", link: "/generaciones", key: "PS_GENERATIONS" },
      { text: "Roles", link: "/roles", key: "PS_ROLES" },
      { text: "Áreas e informes", link: "/datos", key: "PS_GRAPHICS" },
      { text: "Avisos", link: "/avisos", key: "PS_NOTICES" },
    ],
  },
]);

const can = (permission) => {
  return !permission || permissions.value.includes(permission);
};
</script>

<style scoped>
.nav-list {
  margin-top: 0;
  padding: 4px;
}

/* ITEM PRINCIPAL */
.nav-item {
  min-height: 40px !important;
  font-size: 13px;
  font-weight: 600;
  color: #000000; /* gris elegante */

  transition: all 0.2s ease;
}

/* HOVER */
.nav-item:hover {
  background: rgba(189, 189, 189, 0.596);
}

/* SUBITEM */
.nav-subitem {
  padding-left: 36px !important;
  min-height: 34px !important;
  font-size: 12.5px;
  color: #6b7280; /* gris más suave */
}

/* ACTIVO */
:deep(.v-list-item--active) {
  background: rgba(25, 118, 210, 0.08);
  color: #000000;
  font-weight: 600;
}

/* ICONOS más pequeños */
:deep(.v-list-item__prepend > .v-icon) {
  font-size: 19px;
  opacity: 0.8;
}
</style>
