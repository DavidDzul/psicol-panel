import { storeToRefs } from "pinia";
import type {
  UserType,
  User,
  UserForm,
  UserUpdateForm,
} from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { SelectOption } from "@/constants";
import type { LinkInterface } from "@/interfaces/link.interface";
import type { Ref } from "vue";
import { useUserPageStore } from "@/stores/views/usersPage";
import { useGraduatesPageStore } from "@/stores/views/graduatesPage";

export type PersonsMode = "becarios" | "egresados";

export interface PersonsPageAdapter {
  links: Ref<LinkInterface[]>;
  persons: Ref<User[]>;
  editPerson: Ref<User | undefined>;
  createDialog: Ref<boolean>;
  updateDialog: Ref<boolean>;
  filteredCampus: Ref<SelectOption[]>;
  loadingCreate: Ref<boolean>;
  loadingUpdate: Ref<boolean>;
  loadingTable: Ref<boolean>;
  generations: Ref<Generation[]>;
  canRead: Ref<boolean>;
  canCreate: Ref<boolean>;
  canEdit: Ref<boolean>;
  openCreateDialog: () => void;
  openUpdateDialog: (id: number) => void;
  openDetail: (id: number) => void;
  onSave: (form: UserForm) => Promise<void>;
  onUpdate: (form: UserUpdateForm) => Promise<void>;
  defaultUserType: UserType | null;
  createDefaultUserType: UserType;
  createTitle: string;
  updateTitle: string;
}

export function usePersonsPage(mode: PersonsMode): PersonsPageAdapter {
  if (mode === "becarios") {
    const store = useUserPageStore();
    const refs = storeToRefs(store);
    return {
      links: refs.links as Ref<LinkInterface[]>,
      persons: refs.users,
      editPerson: refs.editUser,
      createDialog: refs.createDialog,
      updateDialog: refs.updateDialog,
      filteredCampus: refs.filteredCampus,
      loadingCreate: refs.loadingCreate,
      loadingUpdate: refs.loadingUpdate,
      loadingTable: refs.loadingTable,
      generations: refs.generations,
      canRead: refs.readUsers,
      canCreate: refs.createUsers,
      canEdit: refs.editUsers,
      openCreateDialog: store.openCreateDialog,
      openUpdateDialog: store.openUpdateDialog,
      openDetail: store.openUserDetail,
      onSave: store.onSaveUser,
      onUpdate: store.onUpdateUser,
      defaultUserType: null,
      createDefaultUserType: "BEC_ACTIVE",
      createTitle: "Nuevo becario/a",
      updateTitle: "Actualizar becario/a",
    };
  } else {
    const store = useGraduatesPageStore();
    const refs = storeToRefs(store);
    return {
      links: refs.links,
      persons: refs.graduates,
      editPerson: refs.editGraduate,
      createDialog: refs.createDialog,
      updateDialog: refs.updateDialog,
      filteredCampus: refs.filteredCampus,
      loadingCreate: refs.loadingCreate,
      loadingUpdate: refs.loadingUpdate,
      loadingTable: refs.loadingTable,
      generations: refs.generations,
      canRead: refs.readGraduates,
      canCreate: refs.createGraduates,
      canEdit: refs.editGraduates,
      openCreateDialog: store.openCreateDialog,
      openUpdateDialog: store.openUpdateDialog,
      openDetail: store.openGraduateDetail,
      onSave: store.onSaveGradute,
      onUpdate: store.onUpdateGraduate,
      defaultUserType: null,
      createDefaultUserType: "BEC_INACTIVE",
      createTitle: "Nuevo egresado/a",
      updateTitle: "Actualizar egresado/a",
    };
  }
}
