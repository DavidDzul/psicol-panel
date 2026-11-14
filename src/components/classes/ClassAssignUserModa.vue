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
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
          text="La asistencia nueva se registra como Falta; si no se registra entrada contará como falta injustificada en el refrendo."
        />

        <!-- Tabla -->
        <v-data-table
          density="compact"
          :headers="headers"
          :items="rows"
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
                        selectedUsers.length < rows.length
                      "
                      :model-value="
                        selectedUsers.length === rows.length &&
                        rows.length > 0
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
              :data-user-id="item.id"
              :disabled="item.locked"
              :model-value="!!usersMap[item.id]"
              @update:model-value="toggleUser($event, item.id)"
            />
          </template>

          <template #[`item.last_name`]="{ item }">
            {{ item.last_name }}
            <v-chip
              v-if="item.notEligible"
              size="x-small"
              color="warning"
              label
              class="ml-2"
            >
              No elegible
            </v-chip>
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
import type { User } from "@/interfaces/user";
import type {
  ClassAttendance,
  ClassEntity,
  AssignUsersFilter,
} from "@/interfaces/class";
import { mergeAssignableUsers } from "@/utils/mergeAssignableUsers";

interface Props {
  modelValue: boolean
  loading: boolean
  classData: ClassEntity | null
  users: User[]
  attendances: ClassAttendance[]
}

interface Emits {
  (e: "update:modelValue", value: boolean): void
  (e: "submit", ids: number[]): void
  (e: "findUsers", filter: AssignUsersFilter): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  loading: false,
  classData: null,
  users: () => [],
  attendances: () => [],
});

const emit = defineEmits<Emits>();

const usersMap = ref<Record<number, true>>({});

const headers = [
  { title: "ID", key: "id" },
  { title: "Nombre(s)", key: "first_name" },
  { title: "Apellidos", key: "last_name" },
];

const rows = computed(() => mergeAssignableUsers(props.users, props.attendances));

// Existing attendees are selected by default so saving unchanged is a no-op.
watch(
  () => [props.modelValue, props.attendances] as const,
  ([open, attendances]) => {
    if (open) {
      usersMap.value = Object.fromEntries(
        attendances.map((a) => [a.user.id, true as const]),
      );
    } else {
      usersMap.value = {};
    }
  },
  { immediate: true }
);

// Ask the container for the eligible users of the class each time the modal opens.
watch(
  () => props.modelValue,
  (open) => {
    if (!open || !props.classData) return;
    emit("findUsers", {
      campus: props.classData.campus ?? null,
      generation_id: props.classData.generation_id ?? null,
    });
  },
  { immediate: true }
);

const selectedUsers = computed<number[]>(() => Object.keys(usersMap.value).map(Number));

const toggleAll = (checked: boolean | null): void => {
  if (checked) {
    usersMap.value = Object.fromEntries(rows.value.map((r) => [r.id, true as const]));
  } else {
    // Locked rows (already checked in) cannot be unassigned.
    usersMap.value = Object.fromEntries(
      rows.value.filter((r) => r.locked && usersMap.value[r.id]).map((r) => [r.id, true as const]),
    );
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

const save = (): void => {
  emit("submit", selectedUsers.value);
};
</script>
