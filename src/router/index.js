import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

const routes = [
  {
    path: "/auth",
    name: "AuthLayout",
    component: () => import("@/layouts/AuthLayout.vue"),
    redirect: "auth/login",
    beforeEnter: async (to, from, next) => {
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
      { path: "login", name: "Login", component: () => import("@/views/auth/LoginView.vue") },
    ],
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "/",
        name: "Inicio",
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "/generaciones",
        name: "GenerationView",
        component: () => import("@/views/generations/GenerationView.vue"),
      },
      {
        path: "/roles",
        name: "RolesView",
        component: () => import("@/views/roles/RolesView.vue"),
      },
      {
        path: "/becarios",
        name: "UsersView",
        component: () => import("@/views/users/UsersView.vue"),
      },
      {
        path: "/becarios/:id",
        name: "UserDetailsView",
        component: () => import("@/views/users/UserDetailsView.vue"),
      },
      {
        path: "/egresados",
        name: "GraduatesView",
        component: () => import("@/views/users/GraduatesView.vue"),
      },
      {
        path: "/egresados/:id",
        name: "GraduateDetailsView",
        component: () => import("@/views/users/GraduateDetailsView.vue"),
      },
      {
        path: "/empresas",
        name: "BusinessView",
        component: () => import("@/views/users/BusinessView.vue"),
      },
      {
        path: "/empresas/:id",
        name: "BusinessDetailsView",
        component: () => import("@/views/users/BusinessDetailsView.vue"),
      },
    ],
  },
  {
    path: "/404",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
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
  const { getProfile } = authStore;
  const { loggedUser } = storeToRefs(authStore);
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (token && loggedUser.value) {
      return next();
    } else if (token && !loggedUser.value) {
      await getProfile(token);
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