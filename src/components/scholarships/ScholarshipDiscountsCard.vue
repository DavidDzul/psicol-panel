<template>
  <v-card variant="text">
    <v-card-title class="text-subtitle-1 font-weight-bold pa-3">
      Descuentos aplicados
    </v-card-title>
    <v-card-text class="pa-0">
      <v-list v-if="discounts.length > 0" lines="two">
        <v-list-item
          v-for="discount in discounts"
          :key="discount.id"
          :subtitle="discount.description ?? ''"
        >
          <template #title>
            <span class="text-body-2 font-weight-medium">
              {{ discountLabel(discount.discount_type) }}
            </span>
          </template>
          <template #append>
            <v-chip
              v-if="Number(discount.discount_percentage) === 0"
              size="small"
              color="grey"
              label
            >
              Condonado
            </v-chip>
            <v-chip v-else size="small" color="error" label>
              -{{ discount.discount_percentage }}%
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="pa-4 text-body-2 text-medium-emphasis">
        Sin descuentos aplicados.
      </div>
    </v-card-text>
    <v-divider />
    <v-card-text class="d-flex justify-space-between pa-3">
      <span class="text-body-2">Monto base</span>
      <span class="font-weight-medium">{{ fmt(refrend.base_amount) }}</span>
    </v-card-text>
    <v-card-text class="d-flex justify-space-between pa-3 pt-0">
      <span class="text-body-2 text-error">Descuento total</span>
      <span class="text-error"
        >-{{ fmt(refrend.discount_amount) }} ({{
          refrend.discount_percentage
        }}%)</span
      >
    </v-card-text>
    <v-card-text class="d-flex justify-space-between pa-3 pt-0">
      <span class="text-body-1 font-weight-bold">Pago final</span>
      <span class="text-h6 text-primary font-weight-bold">{{
        fmt(refrend.final_amount)
      }}</span>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type {
  ScholarshipRefrend,
  ScholarshipRefrendDiscount,
  DiscountType,
} from "@/interfaces/scholarship";

defineProps<{
  refrend: ScholarshipRefrend;
  discounts: ScholarshipRefrendDiscount[];
}>();

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

const discountLabel = (type: DiscountType): string => {
  const map: Record<DiscountType, string> = {
    RETARDOS: "Penalización por retardos",
    FALTA_INJUSTIFICADA: "Falta injustificada",
    PROMEDIO_BAJO: "Promedio académico bajo",
    DOCUMENTOS: "Documentos faltantes",
    RECAUDACION: "Actividad de recaudación",
    OTRO: "Otro descuento",
  };
  return map[type] ?? type;
};
</script>
