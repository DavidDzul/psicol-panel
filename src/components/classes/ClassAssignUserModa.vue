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

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  users: { type: Array, default: () => [] },
  assignedUserIds: { type: Array, default: () => [] },
  userCampus: { type: Array, default: () => [] },
  generations: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit", "findUsers"]);

const generation_id = ref(null);
const campus = ref(null);
const usersMap = ref({});

const headers = [
  { title: "ID", key: "id" },
  { title: "Nombre(s)", key: "first_name" },
  { title: "Apellidos", key: "last_name" },
];

const filteredGenerations = computed(() =>
  props.generations.filter((g) => g.campus === campus.value)
);

const assignedIds = computed(() =>
  props.assignedUserIds.map((a) => Number(a.user_id))
);

watch(
  () => [props.modelValue, props.assignedUserIds],
  ([open, assigned]) => {
    if (open && assigned.length) {
      usersMap.value = Object.assign(
        {},
        ...assigned.map((a) => ({ [Number(a.user_id)]: true }))
      );
    } else if (!open) {
      usersMap.value = {};
    }
  },
  { immediate: true }
);

const selectedUsers = computed(() => Object.keys(usersMap.value).map(Number));

const toggleAll = (checked) => {
  if (checked) {
    usersMap.value = Object.assign(
      {},
      ...props.users.map((u) => ({ [u.id]: true }))
    );
  } else {
    const clone = { ...usersMap.value };
    props.users.forEach((u) => {
      delete clone[u.id];
    });
    usersMap.value = clone;
  }
};

const toggleUser = (checked, id) => {
  if (checked) {
    usersMap.value = { ...usersMap.value, [id]: true };
  } else {
    const { [id]: _, ...rest } = usersMap.value;
    usersMap.value = rest;
  }
};

const close = () => emit("update:modelValue", false);

const applyFilters = () => {
  emit("findUsers", {
    campus: campus.value,
    generation_id: generation_id.value,
  });
};

const save = () => {
  console.log(selectedUsers.value);
  emit("submit", selectedUsers.value);
};
</script>
