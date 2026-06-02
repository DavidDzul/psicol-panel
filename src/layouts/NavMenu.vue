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

<style lang="scss" scoped>
.nav-list { margin-top: 4px; padding: 4px 8px; }
:deep(.v-list) { background: transparent !important; }

.nav-item { min-height: 40px !important; border-radius: 8px; transition: background 0.15s ease; }
.nav-item :deep(.v-list-item-title) {
  font-size: 13px;
  font-weight: 500;
  color: #000000;
  transition: color 0.15s ease;
}
.nav-item :deep(.v-icon) { color: #000000; transition: color 0.15s ease; }
.nav-item:hover { background: rgba(39, 95, 252, 0.06); }
.nav-item:hover :deep(.v-list-item-title) { color: #275FFC; }
.nav-item:hover :deep(.v-icon) { color: #275FFC; }

.nav-subitem {
  padding-left: 36px !important;
  min-height: 34px !important;
  border-radius: 8px;
  transition: background 0.15s ease;
}
.nav-subitem :deep(.v-list-item-title) {
  font-size: 12.5px;
  font-weight: 400;
  color: #000000;
  transition: color 0.15s ease;
}
.nav-subitem:hover { background: rgba(39, 95, 252, 0.06); }
.nav-subitem:hover :deep(.v-list-item-title) { color: #275FFC; }

:deep(.v-list-group) { margin-bottom: 4px; }

:deep(.v-list-item--active) {
  background: rgba(39, 95, 252, 0.08) !important;
  position: relative;
}
:deep(.v-list-item--active .v-list-item-title) {
  color: #275FFC !important;
  font-weight: 600;
}
:deep(.v-list-item--active .v-icon) { color: #275FFC !important; }
:deep(.v-list-item--active)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: #275FFC;
}

:deep(.v-list-item:focus-visible) {
  outline: 2px solid #275FFC;
  outline-offset: -2px;
}

:deep(.v-list-item__overlay) { display: none; }
</style>
