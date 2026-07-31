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
        <v-list-item
          v-if="workflowStatus === 'CON_INCIDENCIA' && hasDiscount"
          @click="emit('approve-as-is')"
        >
          <template #prepend>
            <v-icon color="green-darken-1" size="18">mdi-cash-check</v-icon>
          </template>
          <v-list-item-title class="text-body-2"
            >Aprobar con descuento</v-list-item-title
          >
        </v-list-item>

        <v-list-item @click="emit('approve-full')">
          <template #prepend>
            <v-icon color="green-darken-1" size="18">mdi-cash-check</v-icon>
          </template>
          <v-list-item-title class="text-body-2"
            >Pago al 100% (sin descuento)</v-list-item-title
          >
        </v-list-item>

        <v-divider class="my-1" />

        <!-- Situaciones especiales -->
        <v-list-item
          v-for="item in visibleMenuItems"
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
import type { ResolutionType, WorkflowStatus } from "@/interfaces/scholarship";
import {
  visibleSituationMenuItems,
  type SituationKey,
} from "@/composables/useSituationMenuItems";

const props = defineProps<{
  currentResolution: ResolutionType | null;
  locked: boolean;
  loading?: boolean;
  amountPending?: string | number;
  workflowStatus?: WorkflowStatus | null;
  // "Aprobar con descuento" (ApproveRefrendAction) approves as-is with
  // whatever discount is already calculated — when there is none, it's
  // functionally identical to "Pago al 100%", so it's hidden entirely
  // instead of showing a misleading label (user-reported confusion).
  hasDiscount?: boolean;
}>();

const emit = defineEmits<{
  open: [type: SituationKey];
  "approve-full": [];
  "approve-as-is": [];
  recalculate: [];
}>();

const hasPending = computed(() => Number(props.amountPending ?? 0) > 0);

// Catalog + `hidden` filtering live in `useSituationMenuItems.ts` (unit
// tested there) — SUSPENDIDA is flagged `hidden: true` so it stays in the
// catalog (its dialog and `situationDialogs` key are untouched) but is no
// longer offered here.
const visibleMenuItems = computed(() => visibleSituationMenuItems());
</script>
