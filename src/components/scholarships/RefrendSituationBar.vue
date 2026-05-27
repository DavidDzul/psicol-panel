<template>
  <div class="d-flex align-center ga-1">
    <v-chip
      v-if="currentResolution"
      :color="resolutionColor(currentResolution)"
      size="x-small"
      label
      variant="tonal"
    >
      {{ resolutionLabel(currentResolution) }}
    </v-chip>

    <template v-if="!locked">
      <v-btn
        icon
        size="x-small"
        variant="text"
        color="green"
        title="Beca del mes (100%)"
        :loading="activeType === 'BECA_MES'"
        @click="submitDirect('BECA_MES')"
      >
        <v-icon size="16">mdi-check-circle-outline</v-icon>
      </v-btn>

      <v-menu :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="grey-darken-1"
            v-bind="menuProps"
            :loading="activeType != null && activeType !== 'BECA_MES'"
          >
            <v-icon size="16">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list density="compact" nav min-width="210">
          <v-list-item
            v-for="item in menuItems"
            :key="item.key"
            @click="emit('open', item.key)"
          >
            <template #prepend>
              <v-icon :color="item.color" size="18">{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ResolutionType } from "@/interfaces/scholarship";

type SituationKey = ResolutionType | "PAGO_MESES";

const props = defineProps<{
  currentResolution: ResolutionType | null;
  locked: boolean;
  activeType?: SituationKey | null;
}>();

const emit = defineEmits<{
  open: [type: SituationKey];
  submitDirect: [type: ResolutionType];
}>();

const menuItems: { key: SituationKey; icon: string; label: string; color: string }[] = [
  { key: "SIN_PAGO",        icon: "mdi-cash-off",           label: "Sin pago (0%)",        color: "grey-darken-2"  },
  { key: "RETENIDA",        icon: "mdi-lock-outline",        label: "Beca retenida",        color: "orange-darken-2"},
  { key: "PAGO_MESES",      icon: "mdi-cash-refund",         label: "Pago meses retenidos", color: "teal"           },
  { key: "SUSPENDIDA",      icon: "mdi-percent-outline",     label: "Suspensión temporal",  color: "deep-orange"    },
  { key: "BAJA_DEFINITIVA", icon: "mdi-account-off-outline", label: "Baja definitiva",      color: "red-darken-2"   },
  { key: "EGRESADO",        icon: "mdi-school-outline",      label: "Egresado",             color: "indigo"         },
];

const submitDirect = (type: ResolutionType) => emit("submitDirect", type);

const resolutionColor = (type: ResolutionType): string => {
  const map: Record<ResolutionType, string> = {
    BECA_MES:        "green",
    SIN_PAGO:        "grey-darken-2",
    RETENIDA:        "orange-darken-2",
    SUSPENDIDA:      "deep-orange",
    BAJA_DEFINITIVA: "red-darken-2",
    EGRESADO:        "indigo",
  };
  return map[type] ?? "default";
};

const resolutionLabel = (type: ResolutionType): string => {
  const map: Record<ResolutionType, string> = {
    BECA_MES:        "100%",
    SIN_PAGO:        "0%",
    RETENIDA:        "Retenida",
    SUSPENDIDA:      "Suspendida",
    BAJA_DEFINITIVA: "Baja",
    EGRESADO:        "Egresado",
  };
  return map[type] ?? type;
};
</script>
