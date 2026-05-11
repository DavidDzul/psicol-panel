import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import type { User, UserForm, UserUpdateForm } from "@/interfaces/user";
import type {
  UsersResponse,
  UserResponse,
  GraduatesResponse,
  CreatePersonResponse,
  UpdateUserResponse,
  UpdateGraduateResponse,
} from "@/interfaces/api";

export const usePersonsStore = defineStore("personsStore", () => {
  const { showAlert } = useAlertStore();

  const allPersons = ref<Map<number, User>>(new Map());
  const personDetails = ref<User | null>(null);

  const becarios = computed<User[]>(() =>
    [...allPersons.value.values()].filter((u) => u.user_type === "BEC_ACTIVE"),
  );

  const egresados = computed<User[]>(() =>
    [...allPersons.value.values()].filter(
      (u) => u.user_type === "BEC_INACTIVE",
    ),
  );

  const fetchPersons = async (): Promise<void> => {
    try {
      const [usersRes, graduatesRes] = await Promise.all([
        axios.get<UsersResponse>("api/admin/users", {
          headers: { accept: "application/json" },
        }),
        axios.get<GraduatesResponse>("api/admin/graduates", {
          headers: { accept: "application/json" },
        }),
      ]);
      const combined: User[] = [
        ...usersRes.data.users,
        ...graduatesRes.data.graduates,
      ];
      allPersons.value = new Map(combined.map((p) => [p.id, p]));
    } catch (error: unknown) {
      console.error("Error al cargar personas:", error);
    }
  };

  const showPerson = async (id: number): Promise<User | undefined> => {
    try {
      const currentType = allPersons.value.get(id)?.user_type;
      const endpoint =
        currentType === "BEC_INACTIVE"
          ? `api/admin/graduates/${id}`
          : `api/admin/users/${id}`;
      const res = await axios.get<UserResponse>(endpoint, {
        headers: { accept: "application/json" },
      });
      personDetails.value = res.data.user;
      return res.data.user;
    } catch (error: unknown) {
      console.error("Error al obtener persona:", error);
    }
  };

  const createPerson = async (form: UserForm): Promise<User | undefined> => {
    try {
      const res = await axios.post<CreatePersonResponse>("api/admin/persons", form, {
        headers: { accept: "application/json" },
      });
      const created = res.data.createPerson;
      const newMap = new Map(allPersons.value);
      newMap.set(created.id, created);
      allPersons.value = newMap;
      showAlert({ title: "Información guardada exitosamente.", status: "success" });
      return created;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as {
          errors?: Record<string, string[]>;
          message?: string;
        };
        const msg = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : (data.message ?? "Ocurrió un error inesperado.");
        showAlert({ title: msg, status: "error" });
      } else {
        showAlert({ title: "Error de red, intenta más tarde.", status: "error" });
      }
      throw error;
    }
  };

  const updatePerson = async (
    form: UserUpdateForm,
    id: number,
  ): Promise<User | undefined> => {
    try {
      const currentType = allPersons.value.get(id)?.user_type;
      let updated: User;
      if (currentType === "BEC_INACTIVE") {
        const res = await axios.patch<UpdateGraduateResponse>(
          `api/admin/graduates/${id}`,
          form,
          { headers: { accept: "application/json" } },
        );
        updated = res.data.updateGraduate;
      } else {
        const res = await axios.patch<UpdateUserResponse>(
          `api/admin/users/${id}`,
          form,
          { headers: { accept: "application/json" } },
        );
        updated = res.data.updateUser;
      }
      const newMap = new Map(allPersons.value);
      newMap.set(updated.id, updated);
      allPersons.value = newMap;
      if (personDetails.value?.id === id) {
        personDetails.value = updated;
      }
      showAlert({ title: "Información actualizada exitosamente.", status: "success" });
      return updated;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ??
          "Error de red, intenta más tarde.")
        : "Error de red, intenta más tarde.";
      showAlert({ title: msg, status: "error" });
      throw error;
    }
  };

  return {
    allPersons,
    personDetails,
    becarios,
    egresados,
    fetchPersons,
    showPerson,
    createPerson,
    updatePerson,
  };
});
