import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

// 💡 FUNCIÓN DE MANEJO DE ERROR DE CARGA DE CHUNK (IMPLEMENTACIÓN)
const catchReload = (importPromise) => {
  return importPromise.catch((error) => {
    const isChunkLoadError =
      /Failed to fetch dynamically imported module|chunk load failed/i.test(error.message) ||
      error.name === 'ChunkLoadError';

    if (isChunkLoadError) {
      console.warn("Versión antigua detectada. Forzando recarga controlada.");

      // Retrasar la recarga y detener la navegación de Vue Router.
      // 1. Mostrar un mensaje de consola
      // 2. Usar setTimeout para garantizar que la pila de JS se limpie antes de recargar.
      setTimeout(() => {
        window.location.reload(true);
      }, 100);
      return new Promise(() => { });
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
    beforeEnter: async (to, from, next) => {
      // ... (Lógica de beforeEnter original)
      const { getProfile } = useAuthStore()
      const { loggedUser } = storeToRefs(useAuthStore())
      const token = localStorage.getItem("token")
      if (!token) {
        return next()
      } else if (loggedUser.value?.id) {
        await router.push("/")
      } else {
        await getProfile(token, to)
      }
      return next()
    },
    children: [
      {
        path: "login",
        name: "Login",
        component: () => catchReload(import("@/views/auth/LoginView.vue"))
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
        component: () => catchReload(import("@/views/generations/GenerationView.vue")),
      },
      {
        path: "/roles",
        name: "RolesView",
        component: () => catchReload(import("@/views/roles/RolesView.vue")),
      },
      {
        path: "/becarios",
        name: "UsersView",
        component: () => catchReload(import("@/views/users/UsersView.vue")),
      },
      {
        path: "/becarios/:id",
        name: "UserDetailsView",
        component: () => catchReload(import("@/views/users/UserDetailsView.vue")),
      },
      {
        path: "/egresados",
        name: "GraduatesView",
        component: () => catchReload(import("@/views/users/GraduatesView.vue")),
      },
      {
        path: "/egresados/:id",
        name: "GraduateDetailsView",
        component: () => catchReload(import("@/views/users/GraduateDetailsView.vue")),
      },
      {
        path: "/empresas",
        name: "BusinessView",
        component: () => catchReload(import("@/views/users/BusinessView.vue")),
      },
      {
        path: "/empresas/:id",
        name: "BusinessDetailsView",
        component: () => catchReload(import("@/views/users/BusinessDetailsView.vue")),
      },
      {
        path: "/vacantes",
        name: "VacantPositionView",
        component: () => catchReload(import("@/views/vacantPosition/VacantPositionView.vue")),
      },
      {
        path: "/vacantes/:id",
        name: "VacantDetailsView",
        component: () => catchReload(import("@/views/vacantPosition/VacantDetailsView.vue")),
      },
      {
        path: "/postulaciones",
        name: "JobApplicationsView",
        component: () => catchReload(import("@/views/jobApplications/JobApplicationsView.vue")),
      },
      {
        path: "/datos",
        name: "DataView",
        component: () => catchReload(import("@/views/data/DataView.vue")),
      },
      {
        path: "/checador",
        name: "CreateAttendanceView",
        component: () => catchReload(import("@/views/attendance/CreateAttendanceView.vue")),
      },
      {
        path: "/clases",
        name: "ClassView",
        component: () => catchReload(import("@/views/classes/ClassView.vue")),
      },
      {
        path: "/clases/:id",
        name: "ClassDetailsView",
        component: () => catchReload(import("@/views/classes/ClassDetailsView.vue")),
      },
      {
        path: "/avisos",
        name: "NoticesView",
        component: () => catchReload(import("@/views/notices/NoticesView.vue")),
      },
      {
        path: "/4dm1n",
        name: "RolesAdminView",
        component: () => catchReload(import("@/views/roles/RolesAdminView.vue")),
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
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
// Guard global para manejar autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const { getProfile, getPermissions } = authStore;
  const { loggedUser } = storeToRefs(authStore);
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (token && loggedUser.value) {
      return next();
    } else if (token && !loggedUser.value) {
      await getProfile(token);
      await getPermissions(token)

      if (loggedUser.value) {
        return next();
      } else {
        return next({ path: "/auth/login", query: { redirect: to.fullPath } });
      }
    } else {
      return next({ path: "/auth/login", query: { redirect: to.fullPath } });
    }
  } else if (to.meta.guest && token && loggedUser.value) {
    return next({ path: "/" });
  }
  return next();
});

export default router;