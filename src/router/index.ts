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
        component: () =>
          catchReload(import("@/views/generations/GenerationView.vue")),
      },
      {
        path: "/roles",
        name: "RolesView",
        component: () => catchReload(import("@/views/roles/RolesView.vue")),
      },
      {
        path: "/becarios",
        name: "UsersView",
        component: () => catchReload(import("@/views/users/PersonsView.vue")),
        props: { mode: "becarios" },
      },
      {
        path: "/becarios/:id",
        name: "UserDetailsView",
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
        component: () => catchReload(import("@/views/users/BusinessView.vue")),
      },
      {
        path: "/empresas/:id",
        name: "BusinessDetailsView",
        component: () =>
          catchReload(import("@/views/users/BusinessDetailsView.vue")),
      },
      {
        path: "/vacantes",
        name: "VacantPositionView",
        component: () =>
          catchReload(import("@/views/vacantPosition/VacantPositionView.vue")),
      },
      {
        path: "/vacantes/:id",
        name: "VacantDetailsView",
        component: () =>
          catchReload(import("@/views/vacantPosition/VacantDetailsView.vue")),
      },
      {
        path: "/postulaciones",
        name: "JobApplicationsView",
        component: () =>
          catchReload(
            import("@/views/jobApplications/JobApplicationsView.vue"),
          ),
      },
      {
        path: "/datos",
        name: "DataView",
        component: () => catchReload(import("@/views/data/DataView.vue")),
      },
      {
        path: "/checador",
        name: "CreateAttendanceView",
        component: () =>
          catchReload(import("@/views/attendance/CreateAttendanceView.vue")),
      },
      {
        path: "/clases",
        name: "ClassView",
        component: () => catchReload(import("@/views/classes/ClassView.vue")),
      },
      {
        path: "/clases/:id",
        name: "ClassDetailsView",
        component: () =>
          catchReload(import("@/views/classes/ClassDetailsView.vue")),
      },
      {
        path: "/avisos",
        name: "NoticesView",
        component: () => catchReload(import("@/views/notices/NoticesView.vue")),
      },
      {
        path: "/4dm1n",
        name: "RolesAdminView",
        component: () =>
          catchReload(import("@/views/roles/RolesAdminView.vue")),
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

// Guard global para manejar autenticación
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const { getProfile, getPermissions } = authStore;
  const { loggedUser } = storeToRefs(authStore);

  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (token && loggedUser.value) {
      return true;
    }

    if (token && !loggedUser.value) {
      await getProfile(token);
      await getPermissions(token);

      if (loggedUser.value) {
        return true;
      }

      return {
        path: "/auth/login",
        query: { redirect: to.fullPath },
      };
    }

    return {
      path: "/auth/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guest && token && loggedUser.value) {
    return "/";
  }

  return true;
});

export default router;
