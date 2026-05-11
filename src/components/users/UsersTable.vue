<template>
  <v-data-table
    :headers="tableHeaders"
    :items="filteredUsers"
    class="elevation-1"
    :loading="loading"
    :search="search"
    item-value="id"
  >
    <template #top>
      <v-toolbar :flat="true">
        <v-text-field
          class="ml-5 mr-3"
          v-model="search"
          hide-details
          prepend-icon="mdi-magnify"
          density="compact"
          single-line
          label="Buscar"
          :clearable="true"
        ></v-text-field>
        <v-menu min-width="280px" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-tooltip location="top">
              <template v-slot:activator="{ props: tooltip }">
                <v-btn
                  color="warning"
                  v-bind="mergeProps(props, tooltip)"
                  variant="text"
                  icon="mdi-filter"
                />
              </template>
              <span>Filtros</span>
            </v-tooltip>
          </template>

          <v-card>
            <v-card-title><small>Seleccionar filtros</small></v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-select
                    clearable
                    :items="userTypeOptions"
                    v-model="userTypeFilter"
                    item-title="text"
                    item-value="value"
                    label="Tipo de usuario"
                  ></v-select>
                  <v-select
                    clearable
                    :items="userCampus"
                    v-model="campus"
                    item-title="text"
                    item-value="value"
                    label="Sede"
                  ></v-select>
                  <v-select
                    clearable
                    :items="filteredGenerations"
                    v-model="generation_id"
                    item-title="generation_name"
                    item-value="id"
                    label="Generación"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-menu>

        <v-spacer></v-spacer>

        <v-btn
          v-if="create"
          prepend-icon="mdi-plus"
          color="primary"
          @click="$emit('create')"
        >
          Agregar
        </v-btn>
      </v-toolbar>

      <div class="d-flex align-center px-4 py-2 bg-grey-lighten-5 border-b">
        <v-icon class="mr-2" size="small" color="medium-emphasis">mdi-account-group</v-icon>
        <span class="text-subtitle-2 font-weight-medium">{{ filterLabel }}</span>
        <v-chip
          class="ml-auto"
          size="x-small"
          variant="tonal"
          :color="filterChipColor"
        >
          {{ filteredUsers.length }}
          {{ filteredUsers.length === 1 ? "usuario" : "usuarios" }}
        </v-chip>
      </div>
    </template>

    <template #[`item.user_type`]="{ item }">
      <v-chip
        :color="item.user_type === 'BEC_ACTIVE' ? 'primary' : 'secondary'"
        size="small"
        variant="tonal"
      >
        {{ userTypeLabelMap[item.user_type] ?? item.user_type }}
      </v-chip>
    </template>

    <template #[`item.active`]="{ item }">
      <v-icon v-if="item.active" color="success">mdi-check</v-icon>
      <v-icon v-else color="error">mdi-close</v-icon>
    </template>

    <template #[`item.actions`]="{ item }">
      <div style="width: 100%; text-align: right">
        <v-tooltip v-if="edit" text="Editar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="warning"
              density="comfortable"
              icon="mdi-pencil"
              class="mr-2"
              size="small"
              @click="editItem(item)"
            ></v-btn>
          </template>
        </v-tooltip>
        <v-tooltip v-if="read" text="Visualizar" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              color="warning"
              density="comfortable"
              icon="mdi-eye"
              class="mr-2"
              size="small"
              @click="showItem(item)"
            ></v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>
    <template #no-data>No existen datos registrados</template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref, mergeProps, watch } from "vue";
import type { User, UserType } from "@/interfaces/user";
import type { Generation } from "@/interfaces/generation";
import type { SelectOption } from "@/constants";

interface Props {
  users?: User[];
  loading?: boolean;
  read?: boolean;
  create?: boolean;
  edit?: boolean;
  generations?: Generation[];
  userCampus?: SelectOption[];
  /** Pre-selects the user_type filter. null = "Todos" (no filter). */
  defaultUserType?: UserType | null;
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  loading: false,
  read: false,
  create: false,
  edit: false,
  generations: () => [],
  userCampus: () => [],
  defaultUserType: null,
});

interface Emits {
  (e: "create"): void;
  (e: "edit", id: number): void;
  (e: "show", id: number): void;
}

const emit = defineEmits<Emits>();

const search = ref("");
const generation_id = ref<number | null>(null);
const campus = ref<string | null>(null);
const userTypeFilter = ref<UserType | null>(props.defaultUserType ?? null);

// Used for individual row chips (singular)
const userTypeLabelMap: Record<string, string> = {
  BEC_ACTIVE: "Becario/a",
  BEC_INACTIVE: "Egresado/a",
  ADMIN: "Admin",
  BUSINESS: "Empresa",
};

// Used for the group title bar (plural)
const filterGroupLabel: Record<string, string> = {
  BEC_ACTIVE: "Becarios",
  BEC_INACTIVE: "Egresados",
  ADMIN: "Administradores",
  BUSINESS: "Empresas",
};

const userTypeOptions: SelectOption[] = [
  { value: "BEC_ACTIVE", text: "Becario/a" },
  { value: "BEC_INACTIVE", text: "Egresado/a" },
];

const filterLabel = computed<string>(() =>
  userTypeFilter.value ? (filterGroupLabel[userTypeFilter.value] ?? userTypeFilter.value) : "Todos los usuarios",
);

const filterChipColor = computed<string>(() => {
  switch (userTypeFilter.value) {
    case "BEC_ACTIVE": return "primary";
    case "BEC_INACTIVE": return "secondary";
    case "ADMIN": return "error";
    case "BUSINESS": return "success";
    default: return "default";
  }
});

const showTypeColumn = computed(() => userTypeFilter.value === null);

const baseHeaders = [
  { title: "ID", key: "id" },
  { title: "Matrícula", key: "enrollment" },
  { title: "Nombre(s)", key: "first_name" },
  { title: "Apellido(s)", key: "last_name" },
  { title: "Activo", key: "active" },
  { title: "", key: "actions" },
];

const typeHeader = { title: "Tipo", key: "user_type" };

const tableHeaders = computed(() =>
  showTypeColumn.value
    ? [
        baseHeaders[0],
        baseHeaders[1],
        baseHeaders[2],
        baseHeaders[3],
        typeHeader,
        baseHeaders[4],
        baseHeaders[5],
      ]
    : baseHeaders,
);

const filteredGenerations = computed(() =>
  props.generations.filter((gen) => gen.campus === campus.value),
);

const filteredUsers = computed(() =>
  props.users.filter((user) => {
    const typeMatch = userTypeFilter.value
      ? user.user_type === userTypeFilter.value
      : true;
    const campusMatch = campus.value ? user.campus === campus.value : true;
    const generationMatch = generation_id.value
      ? Number(user.generation_id) === generation_id.value
      : true;
    return typeMatch && campusMatch && generationMatch;
  }),
);

watch(campus, () => {
  generation_id.value = null;
});

const editItem = (item: User) => emit("edit", item.id);
const showItem = (item: User) => emit("show", item.id);
</script>
