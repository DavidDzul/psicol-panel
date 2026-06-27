<template>
  <div class="d-flex align-center ga-1">
    <!-- Primary action when there are pending retained months -->
    <v-btn
      v-if="hasPending && !locked"
      size="x-small"
      color="teal"
      variant="tonal"
      prepend-icon="mdi-cash-refund"
      :loading="loading"
      @click="emit('open', 'PAGO_MESES')"
    >
      Pagar retenidos
    </v-btn>

    <v-menu v-if="!locked" :close-on-content-click="true">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          size="x-small"
          variant="tonal"
          color="primary"
          :loading="loading"
          :disabled="locked"
          append-icon="mdi-chevron-down"
        >
          Acciones
        </v-btn>
      </template>

      <v-list density="compact" nav min-width="210">
        <!-- Acciones rápidas -->
        <v-list-item @click="emit('approve-full')">
          <template #prepend>
            <v-icon color="green-darken-1" size="18">mdi-cash-check</v-icon>
          </template>
          <v-list-item-title class="text-body-2"
            >Pago al 100%</v-list-item-title
          >
        </v-list-item>

        <v-divider class="my-1" />

        <!-- Situaciones especiales -->
        <v-list-item
          v-for="item in menuItems"
          :key="item.key"
          @click="emit('open', item.key)"
        >
          <template #prepend>
            <v-icon :color="item.color" size="18">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-body-2">{{
            item.label
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ResolutionType } from "@/interfaces/scholarship";

type SituationKey = ResolutionType | "PAGO_MESES";

const props = defineProps<{
  currentResolution: ResolutionType | null;
  locked: boolean;
  loading?: boolean;
  amountPending?: string | number;
}>();

const emit = defineEmits<{
  open: [type: SituationKey];
  "approve-full": [];
  recalculate: [];
}>();

const hasPending = computed(() => Number(props.amountPending ?? 0) > 0);

const menuItems: {
  key: SituationKey;
  icon: string;
  label: string;
  color: string;
}[] = [
  {
    key: "SIN_PAGO",
    icon: "mdi-cash-off",
    label: "Sin pago (0%)",
    color: "grey-darken-2",
  },
  {
    key: "RETENIDA",
    icon: "mdi-lock-outline",
    label: "Beca retenida",
    color: "orange-darken-2",
  },
  {
    key: "PAGO_MESES",
    icon: "mdi-cash-refund",
    label: "Pago meses retenidos",
    color: "teal",
  },
  {
    key: "SUSPENDIDA",
    icon: "mdi-percent-outline",
    label: "Suspensión temporal",
    color: "deep-orange",
  },
  {
    key: "BAJA_DEFINITIVA",
    icon: "mdi-account-off-outline",
    label: "Baja definitiva",
    color: "red-darken-2",
  },
  {
    key: "EGRESADO",
    icon: "mdi-school-outline",
    label: "Egresado",
    color: "indigo",
  },
];
</script>
