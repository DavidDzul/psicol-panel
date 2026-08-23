<template>
  <!-- ── Vista de lectura: Aumento temporal de beca (aumento fijo con vigencia
       propia que SUMA al bruto, distinto de la retención temporal que
       descuenta; ver ScholarshipCalculationService::buildSnapshot) ── -->
  <template v-if="!editing">
    <template
      v-if="
        profile &&
        profile.temporary_increase_amount &&
        Number(profile.temporary_increase_amount) > 0
      "
    >
      <v-divider class="mb-3" />
      <div class="d-flex align-center ga-2 mb-2">
        <div class="text-caption text-medium-emphasis">
          Aumento temporal de beca
        </div>
        <v-chip
          v-if="increaseStatus"
          :color="increaseStatus.color"
          size="x-small"
          label
        >
          {{ increaseStatus.label }}
        </v-chip>
      </div>
      <v-row dense>
        <v-col cols="6" sm="2">
          <div class="text-caption text-medium-emphasis mb-1">Monto</div>
          <v-chip label color="success" variant="tonal" size="small">
            +{{ fmt(profile.temporary_increase_amount) }}
          </v-chip>
        </v-col>
        <v-col v-if="profile.temporary_increase_valid_from" cols="6" sm="2">
          <div class="text-caption text-medium-emphasis mb-1">
            Vigente desde
          </div>
          <div class="text-body-2 font-weight-medium">
            {{
              dayjs(profile.temporary_increase_valid_from).format(
                "DD/MM/YYYY",
              )
            }}
          </div>
        </v-col>
        <v-col v-if="profile.temporary_increase_valid_until" cols="6" sm="2">
          <div class="text-caption text-medium-emphasis mb-1">
            Vigente hasta
          </div>
          <div class="text-body-2 font-weight-medium">
            {{
              dayjs(profile.temporary_increase_valid_until).format(
                "DD/MM/YYYY",
              )
            }}
          </div>
        </v-col>
        <v-col v-if="profile.temporary_increase_reason" cols="6" sm="3">
          <div class="text-caption text-medium-emphasis mb-1">Motivo</div>
          <div class="text-body-2 font-weight-medium">
            {{ profile.temporary_increase_reason }}
          </div>
        </v-col>
        <v-col v-if="profile.granted_by" cols="6" sm="3">
          <div class="text-caption text-medium-emphasis mb-1">Autorizó</div>
          <div class="text-body-2 font-weight-medium">
            {{ profile.granted_by.first_name }}
            {{ profile.granted_by.last_name }}
          </div>
        </v-col>
      </v-row>
    </template>
  </template>

  <!-- ── Edición: bloque atómico de 4 campos — ver
       ScholarshipProfileController::update(): limpiar el monto limpia todo
       el bloque, incluido quién lo autorizó ── -->
  <template v-else>
    <v-col cols="12">
      <v-divider class="mb-1" />
      <div class="d-flex align-center justify-space-between mt-3 mb-1">
        <div class="text-caption text-medium-emphasis">
          Aumento temporal de beca
        </div>
        <v-btn
          v-if="amount"
          size="x-small"
          variant="text"
          color="error"
          @click="clearIncrease"
        >
          Limpiar aumento
        </v-btn>
      </div>
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model.number="amount"
        label="Monto del aumento"
        type="number"
        min="0"
        step="0.01"
        variant="outlined"
        density="compact"
        prefix="$"
        clearable
        :rules="[positiveIfPresent, requiredAmountIfIncreaseFields]"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="validFrom"
        :label="amount ? 'Vigente desde *' : 'Vigente desde'"
        type="date"
        variant="outlined"
        density="compact"
        clearable
        :rules="[requiredIfIncrease]"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="validUntil"
        :label="amount ? 'Vigente hasta *' : 'Vigente hasta'"
        type="date"
        variant="outlined"
        density="compact"
        clearable
        :rules="[requiredIfIncrease, increaseEndAfterStart]"
      />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="reason"
        :label="amount ? 'Motivo del aumento *' : 'Motivo del aumento'"
        maxlength="200"
        clearable
        density="compact"
        variant="outlined"
        :rules="[requiredIfIncrease]"
      />
    </v-col>
  </template>

  <!-- Confirmación de reemplazo de aumento vigente (422 del backend) -->
  <v-dialog v-model="replaceDialog" max-width="480">
    <v-card>
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center ga-2">
        <v-icon color="warning" size="small">mdi-alert-circle-outline</v-icon>
        Ya existe un aumento vigente
      </v-card-title>
      <v-card-text class="pt-0">
        <p class="text-body-2 mb-3">{{ replaceErrorMessage }}</p>
        <p class="text-body-2">
          ¿Querés reemplazarlo por el nuevo aumento de
          <strong>{{ fmt(amount ?? 0) }}</strong>
          ({{ validFrom }} — {{ validUntil }})? El aumento anterior no queda
          con historial en el perfil; los refrendos ya generados no se
          recalculan retroactivamente.
        </p>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="replaceDialog = false">Cancelar</v-btn>
        <v-btn
          color="warning"
          variant="tonal"
          :loading="saving"
          @click="$emit('confirm-replace')"
        >
          Confirmar reemplazo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
// Sección "Aumento temporal de beca" extraída de ScholarshipProfileCard.vue
// (bloque de lectura + bloque de edición + diálogo de confirmación de
// reemplazo). Solo uno de los dos bloques (lectura/edición) está montado a
// la vez porque el padre decide cuál renderizar vía `editing`, así que el
// diálogo — siempre presente en este template — nunca se duplica en el DOM.
import { computed } from "vue";
import dayjs from "dayjs";
import type { ScholarshipProfile } from "@/interfaces/scholarship";

const props = defineProps<{
  profile: ScholarshipProfile | null;
  editing: boolean;
  saving: boolean;
  replaceErrorMessage: string;
}>();

defineEmits<{
  (e: "confirm-replace"): void;
}>();

const amount = defineModel<number | null>("amount", { required: true });
const validFrom = defineModel<string | null>("validFrom", { required: true });
const validUntil = defineModel<string | null>("validUntil", {
  required: true,
});
const reason = defineModel<string | null>("reason", { required: true });
const replaceDialog = defineModel<boolean>("replaceDialog", {
  required: true,
});

// Estado calculado de vigencia para el chip de la vista (Programado /
// Vigente / Vencido). No prorratea ni afecta el cálculo real del backend,
// es puramente informativo — la fuente de verdad es
// ScholarshipProfile::isTemporaryIncreaseActiveOn().
const increaseStatus = computed<{
  label: string;
  color: string;
} | null>(() => {
  const amt = props.profile?.temporary_increase_amount;
  if (!amt || Number(amt) <= 0) return null;
  const today = dayjs().format("YYYY-MM-DD");
  const from = props.profile?.temporary_increase_valid_from;
  const until = props.profile?.temporary_increase_valid_until;
  if (from && today < from) return { label: "Programado", color: "info" };
  if (until && today > until) return { label: "Vencido", color: "grey" };
  return { label: "Vigente", color: "success" };
});

const clearIncrease = (): void => {
  amount.value = null;
  validFrom.value = null;
  validUntil.value = null;
  reason.value = null;
};

const requiredIfIncrease = (v: unknown): boolean | string => {
  if (!amount.value) return true;
  return (
    (v !== null && v !== undefined && v !== "") ||
    "Requerido cuando hay aumento."
  );
};

// Regla inversa (bugfix HIGH): el backend exige el monto
// (`required_with:temporary_increase_valid_from,temporary_increase_valid_until,temporary_increase_reason`
// en UpdateScholarshipProfileRequest::rules()) si CUALQUIERA de los otros 3
// campos viene cargado — antes solo se validaba en el sentido opuesto
// (exigir los otros 3 si había monto), permitiendo mandar al backend un
// payload que siempre fallaba el 422 en loop.
const requiredAmountIfIncreaseFields = (v: unknown): boolean | string => {
  const hasOtherField = !!(
    validFrom.value ||
    validUntil.value ||
    (reason.value && reason.value.trim())
  );
  if (!hasOtherField) return true;
  return (
    (v !== null && v !== undefined && (v as unknown) !== "") ||
    "Requerido cuando se especifica vigencia o motivo del aumento."
  );
};

const increaseEndAfterStart = (v: string): boolean | string => {
  if (!v || !validFrom.value) return true;
  return v > validFrom.value || "Debe ser posterior a la fecha de inicio.";
};

const positiveIfPresent = (v: number | null): boolean | string => {
  if (v === null || v === undefined || (v as unknown) === "") return true;
  return v > 0 || "Debe ser mayor a 0.";
};

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value));
</script>
