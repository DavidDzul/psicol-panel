<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mb-3"
    />

    <!-- Vista -->
    <template v-if="!editing">
      <div v-if="profile">
        <!-- ── Sección 1: Tipo de beca y monto ── -->
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
        >
          <div class="d-flex align-center ga-6">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Tipo de beca
              </div>
              <v-chip label color="primary" variant="tonal">
                <v-icon start>mdi-school-outline</v-icon>
                {{ profile.scholarship_type }}
              </v-chip>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Monto mensual
              </div>
              <div class="text-h6 font-weight-bold">
                {{ fmt(profile.monthly_amount) }}
              </div>
            </div>
            <div v-if="profile.monto_apoyo && Number(profile.monto_apoyo) > 0">
              <div class="text-caption text-medium-emphasis mb-1">Apoyo</div>
              <div class="text-h6 font-weight-bold">
                {{ fmt(profile.monto_apoyo) }}
              </div>
            </div>
            <v-chip
              v-if="profile.advance_payment_eligible"
              label
              color="secondary"
              variant="tonal"
              size="small"
            >
              <v-icon start size="small">mdi-check-circle-outline</v-icon>
              {{ advancePaymentLabel }}
            </v-chip>
          </div>
          <v-btn size="small" variant="tonal" @click="startEdit">
            Editar perfil
          </v-btn>
        </div>

        <!-- ── Sección 2: Retención temporal de beca (descuento con fecha
             de vigencia; se auto-desactiva al vencer, ver
             ScholarshipCalculationService::applyAcademicDiscount) ── -->
        <template v-if="profile.active_discount_percentage">
          <v-divider class="mb-3" />
          <div class="text-caption text-medium-emphasis mb-2">
            Retención temporal de beca
          </div>
          <v-row dense>
            <v-col cols="6" sm="2">
              <div class="text-caption text-medium-emphasis mb-1">
                Descuento
              </div>
              <v-chip label color="error" variant="tonal" size="small">
                -{{ profile.active_discount_percentage }}%
              </v-chip>
            </v-col>
            <v-col v-if="profile.discount_valid_from" cols="6" sm="2">
              <div class="text-caption text-medium-emphasis mb-1">
                Vigente desde
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.discount_valid_from).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col v-if="profile.discount_valid_until" cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Vigente hasta
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.discount_valid_until).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col v-if="profile.discount_reason" cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">Motivo</div>
              <div class="text-body-2 font-weight-medium">
                {{ profile.discount_reason }}
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- ── Sección: Aumento temporal de beca (aumento fijo con vigencia
             propia que SUMA al bruto, distinto de la retención temporal que
             descuenta; ver ScholarshipCalculationService::buildSnapshot) ── -->
        <template v-if="profile.temporary_increase_amount">
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
              <div class="text-caption text-medium-emphasis mb-1">
                Autorizó
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ profile.granted_by.first_name }}
                {{ profile.granted_by.last_name }}
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- ── Sección 3: Retícula ── -->
        <v-divider class="my-3" />
        <template
          v-if="profile.reticula_start_date && profile.reticula_end_date"
        >
          <v-row dense align="center">
            <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Inicio de carrera
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.reticula_start_date).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Fin de carrera
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.reticula_end_date).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col v-if="profile.egreso_administrativo" cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">
                Egreso administrativo
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.egreso_administrativo).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col v-if="profile.reticula_original_name" cols="12" sm="6">
              <div class="text-caption text-medium-emphasis mb-1">
                Documento
              </div>
              <div class="d-flex align-center ga-1">
                <v-icon size="small" color="error">mdi-file-pdf-box</v-icon>
                <span class="text-body-2 text-truncate flex-1-1">
                  {{ profile.reticula_original_name }}
                </span>
                <v-btn
                  :href="reticulaUrl"
                  target="_blank"
                  rel="noopener"
                  icon
                  size="x-small"
                  variant="text"
                  color="primary"
                >
                  <v-icon>mdi-eye-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Ver documento
                  </v-tooltip>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </template>
        <v-alert v-else type="info" variant="tonal" density="compact">
          No se ha registrado la retícula. Es necesaria para validar el periodo
          de pago.
          <template #append>
            <v-btn size="small" variant="text" @click="startEdit">
              Registrar
            </v-btn>
          </template>
        </v-alert>
      </div>

      <v-alert
        v-else-if="!loading"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Este becario no tiene perfil de beca. Configura el monto mensual para
        poder generar refrendos.
        <template #append>
          <v-btn size="small" variant="text" @click="startEdit">
            Configurar
          </v-btn>
        </template>
      </v-alert>
    </template>

    <!-- Formulario inline -->
    <v-form v-if="editing" ref="formRef" @submit.prevent="onSave">
      <v-row class="pa-2">
        <!-- Datos de beca -->
        <v-col cols="12" md="6">
          <v-select
            v-model="form.scholarship_type"
            :items="typeOptions"
            label="Tipo de beca *"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="form.monthly_amount"
            label="Monto mensual *"
            type="number"
            min="0"
            step="0.01"
            variant="outlined"
            density="compact"
            prefix="$"
            :rules="[required, positiveNumber]"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="form.monto_apoyo"
            label="Apoyo adicional"
            type="number"
            min="0"
            step="0.01"
            variant="outlined"
            density="compact"
            prefix="$"
            clearable
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-switch
            v-model="form.advance_payment_eligible"
            :label="advancePaymentLabel"
            color="primary"
            density="compact"
            hide-details
            inset
          />
        </v-col>
        <v-col cols="12">
          <v-divider class="mb-1" />
          <div class="text-caption text-medium-emphasis mt-3 mb-1">
            Retención temporal de beca
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="form.active_discount_percentage"
            label="Descuento académico %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            variant="outlined"
            density="compact"
            suffix="%"
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.discount_valid_from"
            :label="
              form.active_discount_percentage
                ? 'Descuento vigente desde *'
                : 'Descuento vigente desde'
            "
            type="date"
            variant="outlined"
            density="compact"
            clearable
            :rules="[requiredIfDiscount, discountStartBeforeEnd]"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.discount_valid_until"
            :label="
              form.active_discount_percentage
                ? 'Descuento vigente hasta *'
                : 'Descuento vigente hasta'
            "
            type="date"
            variant="outlined"
            density="compact"
            clearable
            :rules="[requiredIfDiscount]"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="form.discount_reason"
            :label="
              form.active_discount_percentage
                ? 'Motivo del descuento *'
                : 'Motivo del descuento'
            "
            maxlength="200"
            clearable
            density="compact"
            variant="outlined"
            :rules="[requiredIfDiscount]"
          />
        </v-col>

        <!-- Aumento temporal de beca (bloque atómico de 4 campos — ver
             ScholarshipProfileController::update(): limpiar el monto limpia
             todo el bloque, incluido quién lo autorizó) -->
        <v-col cols="12">
          <v-divider class="mb-1" />
          <div class="d-flex align-center justify-space-between mt-3 mb-1">
            <div class="text-caption text-medium-emphasis">
              Aumento temporal de beca
            </div>
            <v-btn
              v-if="form.temporary_increase_amount"
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
            v-model.number="form.temporary_increase_amount"
            label="Monto del aumento"
            type="number"
            min="0"
            step="0.01"
            variant="outlined"
            density="compact"
            prefix="$"
            clearable
            :rules="[positiveIfPresent]"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.temporary_increase_valid_from"
            :label="
              form.temporary_increase_amount
                ? 'Vigente desde *'
                : 'Vigente desde'
            "
            type="date"
            variant="outlined"
            density="compact"
            clearable
            :rules="[requiredIfIncrease]"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.temporary_increase_valid_until"
            :label="
              form.temporary_increase_amount
                ? 'Vigente hasta *'
                : 'Vigente hasta'
            "
            type="date"
            variant="outlined"
            density="compact"
            clearable
            :rules="[requiredIfIncrease, increaseEndAfterStart]"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.temporary_increase_reason"
            :label="
              form.temporary_increase_amount
                ? 'Motivo del aumento *'
                : 'Motivo del aumento'
            "
            maxlength="200"
            clearable
            density="compact"
            variant="outlined"
            :rules="[requiredIfIncrease]"
          />
        </v-col>

        <!-- Datos de retícula -->
        <v-col cols="12">
          <v-divider class="mb-1" />
          <div class="text-caption text-medium-emphasis mt-3 mb-1">
            Retícula
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.reticula_start_date"
            label="Inicio de carrera *"
            type="date"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.reticula_end_date"
            label="Fin de carrera *"
            type="date"
            variant="outlined"
            density="compact"
            :rules="[required, afterStart]"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-file-input
            v-model="form.file"
            label="Documento de retícula"
            accept=".pdf,.jpg,.jpeg,.png"
            variant="outlined"
            density="compact"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            :rules="[fileSizeRule]"
            clearable
          />
        </v-col>
      </v-row>

      <div class="d-flex ga-2 mt-1">
        <v-btn
          type="submit"
          color="primary"
          variant="tonal"
          size="small"
          :loading="saving"
        >
          Guardar
        </v-btn>
        <v-btn size="small" variant="text" @click="cancelEdit">Cancelar</v-btn>
      </div>
    </v-form>

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
            <strong>{{ fmt(form.temporary_increase_amount ?? 0) }}</strong>
            ({{ form.temporary_increase_valid_from }} —
            {{ form.temporary_increase_valid_until }})? El aumento anterior
            no queda con historial en el perfil; los refrendos ya generados
            no se recalculan retroactivamente.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="replaceDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="warning"
            variant="tonal"
            :loading="saving"
            @click="confirmReplace"
          >
            Confirmar reemplazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { isAxiosError } from "axios";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { API_URL } from "@/constants";
import type {
  ScholarshipProfile,
  ScholarshipProfileForm,
  ScholarshipType,
} from "@/interfaces/scholarship";
import dayjs from "dayjs";

const props = defineProps<{
  userId: number;
}>();

const store = useScholarshipStore();

const loading = ref(false);
const saving = ref(false);
const editing = ref(false);
const formRef = ref();
const profile = ref<ScholarshipProfile | null>(null);

const reticulaUrl = computed(() =>
  profile.value?.reticula_file_path
    ? `${API_URL}/storage/${profile.value.reticula_file_path}`
    : "#",
);

// Single source of truth for the visible copy of `advance_payment_eligible` —
// today's eligibility criterion is CERT university affiliation, but the
// field itself is generic. Relabeling later means editing this one string.
const advancePaymentLabel = computed(() => "¿Estudia en la universidad CERT?");

const emptyForm = () => ({
  user_id: props.userId,
  scholarship_type: "IU" as ScholarshipType,
  monthly_amount: 0,
  monto_apoyo: null as number | null,
  advance_payment_eligible: false,
  active_discount_percentage: null as number | null,
  discount_reason: null as string | null,
  discount_valid_from: null as string | null,
  discount_valid_until: null as string | null,
  temporary_increase_amount: null as number | null,
  temporary_increase_valid_from: null as string | null,
  temporary_increase_valid_until: null as string | null,
  temporary_increase_reason: null as string | null,
  reticula_start_date: "",
  reticula_end_date: "",
  file: null as File | null,
});

const form = reactive(emptyForm());

// Estado calculado de vigencia para el chip de la vista (Programado /
// Vigente / Vencido). No prorratea ni afecta el cálculo real del backend,
// es puramente informativo — la fuente de verdad es
// ScholarshipProfile::isTemporaryIncreaseActiveOn().
const increaseStatus = computed<{
  label: string;
  color: string;
} | null>(() => {
  if (!profile.value?.temporary_increase_amount) return null;
  const today = dayjs().format("YYYY-MM-DD");
  const from = profile.value.temporary_increase_valid_from;
  const until = profile.value.temporary_increase_valid_until;
  if (from && today < from) return { label: "Programado", color: "info" };
  if (until && today > until) return { label: "Vencido", color: "grey" };
  return { label: "Vigente", color: "success" };
});

// ── Reemplazo de aumento vigente (422 de UpdateScholarshipProfileRequest) ──

const replaceDialog = ref(false);
const replaceErrorMessage = ref("");

const extractIncreaseConflictMessage = (error: unknown): string | null => {
  if (!isAxiosError(error) || error.response?.status !== 422) return null;
  const errors = (
    error.response.data as { errors?: Record<string, string[]> }
  )?.errors;
  return errors?.temporary_increase_amount?.[0] ?? null;
};

onMounted(async () => {
  loading.value = true;
  profile.value = (await store.fetchProfile(props.userId)) ?? null;
  loading.value = false;
});

const startEdit = (): void => {
  if (profile.value) {
    form.scholarship_type = profile.value.scholarship_type;
    form.monthly_amount = Number(profile.value.monthly_amount);
    form.monto_apoyo = profile.value.monto_apoyo
      ? Number(profile.value.monto_apoyo)
      : null;
    form.advance_payment_eligible =
      profile.value.advance_payment_eligible ?? false;
    form.active_discount_percentage = profile.value.active_discount_percentage
      ? Number(profile.value.active_discount_percentage)
      : null;
    form.discount_reason = profile.value.discount_reason ?? null;
    form.discount_valid_from = profile.value.discount_valid_from
      ? dayjs(profile.value.discount_valid_from).format("YYYY-MM-DD")
      : null;
    form.discount_valid_until = profile.value.discount_valid_until
      ? dayjs(profile.value.discount_valid_until).format("YYYY-MM-DD")
      : null;
    form.temporary_increase_amount = profile.value.temporary_increase_amount
      ? Number(profile.value.temporary_increase_amount)
      : null;
    form.temporary_increase_valid_from = profile.value
      .temporary_increase_valid_from
      ? dayjs(profile.value.temporary_increase_valid_from).format(
          "YYYY-MM-DD",
        )
      : null;
    form.temporary_increase_valid_until = profile.value
      .temporary_increase_valid_until
      ? dayjs(profile.value.temporary_increase_valid_until).format(
          "YYYY-MM-DD",
        )
      : null;
    form.temporary_increase_reason =
      profile.value.temporary_increase_reason ?? null;
    form.reticula_start_date = profile.value.reticula_start_date
      ? dayjs(profile.value.reticula_start_date).format("YYYY-MM-DD")
      : "";
    form.reticula_end_date = profile.value.reticula_end_date
      ? dayjs(profile.value.reticula_end_date).format("YYYY-MM-DD")
      : "";
    form.file = null;
  } else {
    Object.assign(form, emptyForm());
  }
  editing.value = true;
};

const cancelEdit = (): void => {
  editing.value = false;
};

const clearIncrease = (): void => {
  form.temporary_increase_amount = null;
  form.temporary_increase_valid_from = null;
  form.temporary_increase_valid_until = null;
  form.temporary_increase_reason = null;
};

const buildProfilePayload = (
  withReplace: boolean,
): ScholarshipProfileForm => ({
  user_id: form.user_id,
  scholarship_type: form.scholarship_type,
  monthly_amount: form.monthly_amount,
  monto_apoyo: form.monto_apoyo,
  advance_payment_eligible: form.advance_payment_eligible,
  active_discount_percentage: form.active_discount_percentage,
  discount_reason: form.discount_reason,
  discount_valid_from: form.discount_valid_from,
  discount_valid_until: form.discount_valid_until,
  temporary_increase_amount: form.temporary_increase_amount,
  temporary_increase_valid_from: form.temporary_increase_valid_from,
  temporary_increase_valid_until: form.temporary_increase_valid_until,
  temporary_increase_reason: form.temporary_increase_reason,
  ...(withReplace ? { replace_temporary_increase: true } : {}),
});

const persistProfile = async (withReplace: boolean): Promise<void> => {
  saving.value = true;

  try {
    const profileResult = await store.saveProfile(
      buildProfilePayload(withReplace),
    );

    if (profileResult) {
      const fd = new FormData();
      fd.append("reticula_start_date", form.reticula_start_date);
      fd.append("reticula_end_date", form.reticula_end_date);
      if (form.file) fd.append("file", form.file);

      const reticulaResult = await store.uploadReticula(props.userId, fd);
      if (reticulaResult) {
        profile.value = reticulaResult;
        editing.value = false;
      }
    }
  } catch (error: unknown) {
    // El store ya muestra un toast genérico; si el 422 es específicamente
    // por "aumento vigente duplicado", además ofrecemos confirmar el
    // reemplazo sin perder los datos ya cargados en el formulario.
    const conflictMessage = extractIncreaseConflictMessage(error);
    if (conflictMessage) {
      replaceErrorMessage.value = conflictMessage;
      replaceDialog.value = true;
    }
  } finally {
    saving.value = false;
  }
};

const onSave = async (): Promise<void> => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  await persistProfile(false);
};

const confirmReplace = async (): Promise<void> => {
  replaceDialog.value = false;
  await persistProfile(true);
};

const required = (v: unknown): boolean | string =>
  (v !== null && v !== undefined && v !== "") || "Campo requerido.";

const requiredIfDiscount = (v: unknown): boolean | string => {
  if (!form.active_discount_percentage) return true;
  return (
    (v !== null && v !== undefined && v !== "") ||
    "Requerido cuando hay descuento."
  );
};

const discountStartBeforeEnd = (v: string): boolean | string => {
  if (!v || !form.discount_valid_until) return true;
  return (
    v <= form.discount_valid_until ||
    "Debe ser anterior o igual a la fecha de fin."
  );
};

const requiredIfIncrease = (v: unknown): boolean | string => {
  if (!form.temporary_increase_amount) return true;
  return (
    (v !== null && v !== undefined && v !== "") ||
    "Requerido cuando hay aumento."
  );
};

const increaseEndAfterStart = (v: string): boolean | string => {
  if (!v || !form.temporary_increase_valid_from) return true;
  return (
    v > form.temporary_increase_valid_from ||
    "Debe ser posterior a la fecha de inicio."
  );
};

const positiveIfPresent = (v: number | null): boolean | string => {
  if (v === null || v === undefined || (v as unknown) === "") return true;
  return v > 0 || "Debe ser mayor a 0.";
};

const positiveNumber = (v: number): boolean | string =>
  v > 0 || "Debe ser mayor a 0.";

const afterStart = (v: string): boolean | string => {
  if (!v || !form.reticula_start_date) return true;
  return v > form.reticula_start_date || "Debe ser posterior al inicio.";
};

const fileSizeRule = (v: File | null): boolean | string => {
  if (!v) return true;
  return v.size <= 20 * 1024 * 1024 || "El archivo no debe superar 20 MB.";
};

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

const typeOptions: { title: string; value: ScholarshipType }[] = [
  { title: "IU", value: "IU" },
  { title: "TELMEX", value: "TELMEX" },
];
</script>
