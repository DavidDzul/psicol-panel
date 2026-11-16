import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

// 💡 FUNCIÓN DE MANEJO DE ERROR DE CARGA DE CHUNK (IMPLEMENTACIÓN)
const catchReload = <T>(importPromise: Promise<T>): Promise<T> => {
  return importPromise.catch((error: unknown) => {
    if (error instanceof Error) {
      const isChunkLoadError =
        /Failed to fetch dynamically imported module|chunk load failed/i.test(
          error.message,
        ) || error.name === "ChunkLoadError";

      if (isChunkLoadError) {
        console.warn("Versión antigua detectada. Recargando...");

        setTimeout(() => {
          window.location.reload(); // 👈 limpio
        }, 100);

        return new Promise<T>(() => {});
      }
    }

    throw error;
  });
};

const routes = [
  {
    path: "/auth",
    name: "AuthLayout",
    component: () => catchReload(import("@/layouts/AuthLayout.vue")),
    redirect: "auth/login",
    beforeEnter: async (to) => {
      const authStore = useAuthStore();
      const { getProfile } = authStore;
      const { loggedUser } = storeToRefs(authStore);

      const token = localStorage.getItem("token");

      if (!token) return true;

      if (loggedUser.value) {
        return "/";
      }

      await getProfile(token, to);
      return true;
    },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => catchReload(import("@/views/auth/LoginView.vue")),
      },
    ],
  },
  {
    path: "/",
    name: "home",
    component: () => catchReload(import("@/layouts/AdminLayout.vue")),
    meta: { requiresAuth: true },
    children: [
      {
        path: "/",
        name: "Inicio",
        component: () => catchReload(import("@/views/HomeView.vue")),
      },
      {
        path: "/generaciones",
        name: "GenerationView",
        meta: { permission: "PS_GENERATIONS" },
        component: () =>
          catchReload(import("@/views/generations/GenerationView.vue")),
      },
      {
        path: "/roles",
        name: "RolesView",
        meta: { permission: "PS_ROLES" },
        component: () => catchReload(import("@/views/roles/RolesView.vue")),
      },
      {
        path: "/becarios",
        name: "UsersView",
        meta: { permission: "PS_USERS" },
        component: () => catchReload(import("@/views/users/PersonsView.vue")),
        props: { mode: "becarios" },
      },
      {
        path: "/becarios/:id",
        name: "UserDetailsView",
        meta: { permission: "PS_USERS" },
        component: () =>
          catchReload(import("@/views/users/PersonDetailsView.vue")),
        props: { mode: "becarios" },
      },
      // {
      //   path: "/egresados",
      //   name: "GraduatesView",
      //   component: () => catchReload(import("@/views/users/PersonsView.vue")),
      //   props: { mode: "egresados" },
      // },
      // {
      //   path: "/egresados/:id",
      //   name: "GraduateDetailsView",
      //   component: () =>
      //     catchReload(import("@/views/users/PersonDetailsView.vue")),
      //   props: { mode: "egresados" },
      // },
      {
        path: "/empresas",
        name: "BusinessView",
        meta: { permission: "PS_BUSINESS" },
        component: () => catchReload(import("@/views/users/BusinessView.vue")),
      },
      {
        path: "/empresas/:id",
        name: "BusinessDetailsView",
        meta: { permission: "PS_BUSINESS" },
        component: () =>
          catchReload(import("@/views/users/BusinessDetailsView.vue")),
      },
      {
        path: "/vacantes",
        name: "VacantPositionView",
        meta: { permission: "PS_VACANT" },
        component: () =>
          catchReload(import("@/views/vacantPosition/VacantPositionView.vue")),
      },
      {
        path: "/vacantes/:id",
        name: "VacantDetailsView",
        meta: { permission: "PS_VACANT" },
        component: () =>
          catchReload(import("@/views/vacantPosition/VacantDetailsView.vue")),
      },
      {
        path: "/postulaciones",
        name: "JobApplicationsView",
        meta: { permission: "PS_APPLICATION" },
        component: () =>
          catchReload(
            import("@/views/jobApplications/JobApplicationsView.vue"),
          ),
      },
      {
        path: "/datos",
        name: "DataView",
        meta: { permission: "PS_GRAPHICS" },
        component: () => catchReload(import("@/views/data/DataView.vue")),
      },
      {
        path: "/checador",
        name: "CreateAttendanceView",
        meta: { permission: "PS_CHECK" },
        component: () =>
          catchReload(import("@/views/attendance/CreateAttendanceView.vue")),
      },
      {
        path: "/clases",
        name: "ClassView",
        meta: { permission: "PS_CLASSES" },
        component: () => catchReload(import("@/views/classes/ClassView.vue")),
      },
      {
        path: "/clases/:id",
        name: "ClassDetailsView",
        meta: { permission: "PS_CLASSES" },
        component: () =>
          catchReload(import("@/views/classes/ClassDetailsView.vue")),
      },
      {
        path: "/administradores",
        name: "StaffAdministratorsView",
        meta: { permission: "PS_MANAGE_ADMINS" },
        component: () =>
          catchReload(import("@/views/administrators/StaffAdministratorsView.vue")),
      },
      {
        path: "/avisos",
        name: "NoticesView",
        meta: { permission: "PS_NOTICES" },
        component: () => catchReload(import("@/views/notices/NoticesView.vue")),
      },
      {
        path: "/scholarships/atencion",
        name: "ScholarshipAtencionView",
        meta: { permission: "PS_SCHOLARSHIPS_ATENCION" },
        component: () =>
          catchReload(import("@/views/scholarships/ScholarshipRefrendsView.vue")),
        props: { mode: "verificacion" },
      },
      {
        path: "/scholarships/pedagogia",
        name: "ScholarshipPedagogiaView",
        meta: { permission: "PS_SCHOLARSHIPS_PEDAGOGIA" },
        component: () =>
          catchReload(import("@/views/scholarships/ScholarshipRefrendsView.vue")),
        props: { mode: "aprobacion" },
      },
    ],
  },
  {
    path: "/404",
    name: "NotFound",
    component: () => catchReload(import("@/views/NotFound.vue")),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Same rule as NavMenu: a route is reachable only with its meta.permission. ROOT always passes.
// Permissions must be loaded before deciding, otherwise a reload would redirect a valid user.
const hasRoutePermission = async (
  permission: string,
  token: string,
): Promise<boolean> => {
  const authStore = useAuthStore();
  if (!authStore.permissionsLoaded) {
    await authStore.getPermissions(token);
  }

  return authStore.isRoot || authStore.permissions.includes(permission);
};

// Guard global para manejar autenticación y permisos por ruta
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const { getProfile, getPermissions } = authStore;
  const { loggedUser } = storeToRefs(authStore);

  const token = localStorage.getItem("token");
  const permission = to.meta.permission as string | undefined;

  if (to.meta.requiresAuth) {
    if (token && !loggedUser.value) {
      await getProfile(token);
      await getPermissions(token);
    }

    if (!token || !loggedUser.value) {
      return {
        path: "/auth/login",
        query: { redirect: to.fullPath },
      };
    }

    if (permission && !(await hasRoutePermission(permission, token))) {
      return "/";
    }

    return true;
  }

  if (to.meta.guest && token && loggedUser.value) {
    return "/";
  }

  return true;
});

export default router;
