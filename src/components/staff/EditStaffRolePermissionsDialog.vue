<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760px"
    persistent
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
    @keydown.stop.esc="emit('cancel')"
  >
    <v-card>
      <v-toolbar dark>
        <v-toolbar-title>Permisos del rol {{ role?.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon aria-label="Cerrar" @click="emit('cancel')"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          {{ role?.users_count ?? 0 }} usuario(s) tienen este rol. Los cambios se aplican cuando
          vuelvan a iniciar sesión.
        </v-alert>

        <div v-for="group in catalog" :key="group.module" class="mb-4">
          <div class="text-subtitle-2 font-weight-bold">{{ group.module }}</div>
          <v-checkbox
            v-for="permission in group.permissions"
            :key="permission.id"
            :model-value="selected"
            :value="permission.id"
            density="compact"
            hide-details
            @update:model-value="onChange"
          >
            <template #label>
              <span>{{ permission.description }}</span>
              <v-chip size="x-small" class="ml-2" :color="KIND_COLOR[permission.kind]">
                {{ KIND_LABEL[permission.kind] }}
              </v-chip>
            </template>
          </v-checkbox>
        </div>

        <v-alert v-if="serverError" type="error" variant="tonal" density="compact">
          {{ serverError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="emit('save')">Guardar</v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog :model-value="confirmOpen" max-width="480px" persistent>
      <v-card>
        <v-card-title>Confirmar cambios</v-card-title>
        <v-card-text>
          Los usuarios con este rol dejarán de ver:
          <ul class="mt-2">
            <li v-for="permission in lockout.removedMenus" :key="permission.id">
              {{ permission.description }}
            </li>
          </ul>
          <p class="mt-3">Afecta a {{ role?.users_count ?? 0 }} usuario(s).</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="emit('cancel-confirm')">Volver</v-btn>
          <v-btn color="error" :loading="saving" @click="emit('confirm')">Confirmar y guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  PermissionKind,
  StaffPermissionModule,
  StaffRole,
} from "@/interfaces/staff";
import type { StaffPermissionChanges } from "@/utils/staffPermissionChanges";

interface Props {
  modelValue: boolean;
  role: StaffRole | null;
  catalog: StaffPermissionModule[];
  draftIds: number[];
  lockout: StaffPermissionChanges;
  confirmOpen?: boolean;
  saving?: boolean;
  serverError?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  confirmOpen: false,
  saving: false,
  serverError: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:draftIds", ids: number[]): void;
  (e: "save"): void;
  (e: "cancel"): void;
  (e: "confirm"): void;
  (e: "cancel-confirm"): void;
}>();

const KIND_LABEL: Record<PermissionKind, string> = {
  "menu-group": "Menú",
  page: "Página",
  action: "Acción",
};
const KIND_COLOR: Record<PermissionKind, string> = {
  "menu-group": "primary",
  page: "secondary",
  action: "grey",
};

const selected = computed(() => props.draftIds);

const onChange = (ids: unknown): void => {
  emit("update:draftIds", Array.isArray(ids) ? (ids as number[]) : []);
};
</script>
