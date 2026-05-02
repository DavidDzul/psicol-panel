<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900px"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-toolbar dark>
        <v-toolbar-title>Asignar usuarios</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <!-- Filtros -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              clearable
              :items="userCampus"
              v-model="campus"
              item-title="text"
              item-value="value"
              label="Sede"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              clearable
              :items="filteredGenerations"
              v-model="generation_id"
              item-title="generation_name"
              item-value="id"
              label="Generación"
            />
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn
              density="comfortable"
              color="grey"
              prepend-icon="mdi-magnify"
              @click="applyFilters"
            >
              Buscar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tabla -->
        <v-data-table
          density="compact"
          :headers="headers"
          :items="users"
          class="elevation-0"
          :loading="loading"
          item-value="id"
          :items-per-page="-1"
        >
          <template v-slot:headers="{ columns }">
            <tr>
              <template v-for="column in columns" :key="column.key">
                <td>
                  <template v-if="column.key === 'id'">
                    <v-checkbox
                      :indeterminate="
                        selectedUsers.length > 0 &&
                        selectedUsers.length < users.length
                      "
                      :model-value="
                        selectedUsers.length === users.length &&
                        users.length > 0
                      "
                      @update:model-value="toggleAll"
                      :ripple="false"
                    />
                  </template>
                  <template v-if="column.key === 'first_name'">
                    <strong>Nombre(s)</strong>
                  </template>
                  <template v-if="column.key === 'last_name'">
                    <strong> Apellidos</strong>
                  </template>
                </td>
              </template>
            </tr>
          </template>

          <template #[`item.id`]="{ item }">
            <v-checkbox
              :ripple="false"
              :model-value="!!usersMap[item.id]"
              @update:model-value="toggleUser($event, item.id)"
            />
          </template>

          <template #no-data>No hay usuarios disponibles</template>
        </v-data-table>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="text" :disabled="loading" @click="close">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="text" :loading="loading" @click="save">
          Guardar selección
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { SelectOption } from "@/constants";
import type { Generation } from "@/interfaces/generation";
import type { User } from "@/interfaces/user";
import type { AssignedUserId, AssignUsersFilter } from "@/interfaces/class";

interface Props {
  modelValue: boolean
  loading: boolean
  users: User[]
  assignedUserIds: AssignedUserId[]
  userCampus: SelectOption[]
  generations: Generation[]
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit", ids: number[]): void
  (e: "findUsers", filter: AssignUsersFilter): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  users: () => [],
  assignedUserIds: () => [],
  userCampus: () => [],
  generations: () => [],
});

const emit = defineEmits<Emits>();

const generation_id = ref<number | null>(null);
const campus = ref<string | null>(null);
const usersMap = ref<Record<number, true>>({});

const headers = [
  { title: "ID", key: "id" },
  { title: "Nombre(s)", key: "first_name" },
  { title: "Apellidos", key: "last_name" },
];

const filteredGenerations = computed<Generation[]>(() =>
  props.generations.filter((g) => g.campus === campus.value)
);

watch(
  () => [props.modelValue, props.assignedUserIds] as const,
  ([open, assigned]) => {
    if (open && assigned.length) {
      usersMap.value = Object.assign(
        {},
        ...assigned.map((a) => ({ [Number(a.user_id)]: true as const }))
      );
    } else if (!open) {
      usersMap.value = {};
    }
  },
  { immediate: true }
);

const selectedUsers = computed<number[]>(() => Object.keys(usersMap.value).map(Number));

const toggleAll = (checked: boolean | null): void => {
  if (checked) {
    usersMap.value = Object.assign(
      {},
      ...props.users.map((u) => ({ [u.id]: true as const }))
    );
  } else {
    const clone: Record<number, true> = { ...usersMap.value };
    props.users.forEach((u) => {
      delete clone[u.id];
    });
    usersMap.value = clone;
  }
};

const toggleUser = (checked: boolean | null, id: number): void => {
  if (checked) {
    usersMap.value = { ...usersMap.value, [id]: true };
  } else {
    const { [id]: _removed, ...rest } = usersMap.value;
    usersMap.value = rest as Record<number, true>;
  }
};

const close = (): void => emit("update:modelValue", false);

const applyFilters = (): void => {
  emit("findUsers", {
    campus: campus.value,
    generation_id: generation_id.value,
  });
};

const save = (): void => {
  emit("submit", selectedUsers.value);
};
</script>
