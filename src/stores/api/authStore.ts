import axios from "@/axiosConfig";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alert";
import { useGenerationsStore } from "@/stores/api/generationStore";
import { useRolesStore } from "@/stores/api/rolesStore";
import { campusArray } from "@/constants";
import type { SelectOption } from "@/constants";
import type { UserProfile } from "@/interfaces/user";
import type {
  LoginResponse,
  PermissionsListResponse,
  UpdateProfileResponse,
} from "@/interfaces/api";

export const useAuthStore = defineStore("authStore", () => {
  const router = useRouter();
  const { showAlert } = useAlertStore();
  const { fetchGenerations } = useGenerationsStore();
  const { fetchRoles } = useRolesStore();

  const token = ref<string>("");
  const loggedUser = ref<boolean>(false);
  const userProfile = ref<UserProfile | null>(null);
  const openUserProfileDialog = ref<boolean>(false);
  const permissions = ref<string[]>([]);

  const openUserDialog = (): void => {
    openUserProfileDialog.value = true;
  };

  const login = async (email: string, password: string): Promise<void> => {
    const credentials = { email, password };
    try {
      await axios.get("sanctum/csrf-cookie");
      const res = await axios.post<LoginResponse>(
        "api/admin/login",
        credentials,
        {
          headers: { accept: "application/json" },
        },
      );

      token.value = res.data.token;
      localStorage.setItem("token", token.value);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;

      await fetchRoles();
      await fetchGenerations();
      await getPermissions(token.value);
      await router.push({ path: "/" });
    } catch (error: any) {
      console.error("Error en login:", error);
      showAlert({
        title: "Error al iniciar sesión, verifica tu usuario y/o contraseña.",
        status: "error",
      });
    }
  };

  const logout = async (): Promise<void> => {
    await axios
      .post("api/admin/logout")
      .then(async () => {
        loggedUser.value = false;
        userProfile.value = null;
        token.value = "";
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      })
      .catch(() => {
        showAlert({
          title: "Error al cerrar sesión.",
          status: "error",
        });
      });
  };

  const getProfile = async (authToken: string): Promise<void> => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    await axios.get("sanctum/csrf-cookie");
    await axios
      .get<UserProfile>("api/admin/admin")
      .then(async (res) => {
        loggedUser.value = true;
        userProfile.value = res.data;
        token.value = authToken;
        await fetchRoles();
        await fetchGenerations();
      })
      .catch((error: any) => {
        console.error("Error al obtener el perfil:", error);
      });
  };

  const getPermissions = async (authToken: string): Promise<unknown> => {
    try {
      const response = await axios.get<PermissionsListResponse>(
        "/api/admin/permissions",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      permissions.value = response.data.permissions;
      return permissions;
    } catch (error: any) {
      console.error("Error fetching user permissions:", error);
      return [];
    }
  };

  const updateUserProfile = async (form: unknown): Promise<unknown> => {
    try {
      const param = await axios.post<UpdateProfileResponse>(
        "api/admin/updateProfile",
        form,
        {
          headers: { accept: "application/json" },
        },
      );
      if (param) {
        showAlert({
          title: "Información guardada exitosamente.",
          status: "success",
        });
        userProfile.value = {
          ...(userProfile.value as object),
          first_name: param.data.user.first_name,
          last_name: param.data.user.last_name,
          email: param.data.user.email,
          phone: param.data.user.phone,
          workstation: param.data.user.workstation,
        } as UserProfile;
        openUserProfileDialog.value = false;
        return param.data.res;
      }
    } catch (error: any) {
      console.error(error);
      showAlert({
        title: "Error al guardar la información, intente nuevamente.",
        status: "error",
      });
      throw error;
    }
  };

  const userInitials = computed<string>(
    () =>
      `${userProfile?.value?.first_name.charAt(0) || ""}${userProfile?.value?.last_name.charAt(0) || ""}`,
  );

  const fullName = computed<string>(
    () =>
      `${userProfile?.value?.first_name || ""} ${userProfile?.value?.last_name || ""}`,
  );

  const isRoot = computed<boolean>(() => {
    return userProfile.value?.roles.some((r) => r.name === "ROOT") ?? false;
  });

  const filteredCampus = computed<SelectOption[]>(() => {
    if (
      userProfile.value?.roles.some(
        (r) => r.name === "ROOT" || r.name === "ROOT_JOB",
      )
    ) {
      return campusArray;
    }
    return campusArray.filter((c) => c.value === userProfile.value?.campus);
  });

  const readUsers: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_READ_USERS"),
  );
  const createUsers: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CREATE_USERS"),
  );
  const editUsers: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_EDIT_USERS"),
  );
  const readGraduates: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_READ_GRADUATES"),
  );
  const createGraduates: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CREATE_GRADUATES"),
  );
  const editGraduates: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_EDIT_GRADUATES"),
  );
  const readBusiness: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_READ_BUSINESS"),
  );
  const createBusinessPermission: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CREATE_BUSINESS"),
  );
  const editBusiness: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_EDIT_BUSINESS"),
  );
  const readVacant: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_READ_VACANT"),
  );
  const createVacant: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CREATE_VACANT"),
  );
  const editVacant: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_EDIT_VACANT"),
  );
  const readApplication: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_READ_APPLICATION"),
  );
  const editApplication: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_EDIT_APPLICATION"),
  );
  const checkView: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CHECK"),
  );
  const classesView: ComputedRef<boolean> = computed(
    () => !!permissions.value.find((map) => map === "PS_CLASSES"),
  );

  return {
    login,
    logout,
    getProfile,
    openUserDialog,
    updateUserProfile,
    getPermissions,
    token,
    isRoot,
    fullName,
    loggedUser,
    userProfile,
    userInitials,
    filteredCampus,
    openUserProfileDialog,
    // PERMISSIONS
    permissions,
    readUsers,
    createUsers,
    editUsers,
    readGraduates,
    createGraduates,
    editGraduates,
    readBusiness,
    createBusinessPermission,
    editBusiness,
    readVacant,
    createVacant,
    editVacant,
    readApplication,
    editApplication,
    checkView,
    classesView,
  };
});
