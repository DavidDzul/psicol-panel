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
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
          <div class="d-flex align-center ga-6">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Tipo de beca</div>
              <v-chip label color="primary" variant="tonal">
                <v-icon start>mdi-school-outline</v-icon>
                {{ profile.scholarship_type }}
              </v-chip>
            </div>
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Monto mensual</div>
              <div class="text-h6 font-weight-bold">
                {{ fmt(profile.monthly_amount) }}
              </div>
            </div>
          </div>
          <v-btn size="small" variant="tonal" @click="startEdit">
            Editar perfil
          </v-btn>
        </div>

        <!-- ── Sección 2: Descuento académico (si existe) ── -->
        <template v-if="profile.active_discount_percentage">
          <v-divider class="mb-3" />
          <v-row dense>
            <v-col cols="6" sm="2">
              <div class="text-caption text-medium-emphasis mb-1">Descuento</div>
              <v-chip label color="error" variant="tonal" size="small">
                -{{ profile.active_discount_percentage }}%
              </v-chip>
            </v-col>
            <v-col v-if="profile.discount_valid_until" cols="6" sm="3">
              <div class="text-caption text-medium-emphasis mb-1">Vigente hasta</div>
              <div class="text-body-2 font-weight-medium">
                {{ dayjs(profile.discount_valid_until).format("DD/MM/YYYY") }}
              </div>
            </v-col>
            <v-col v-if="profile.discount_reason" cols="12" sm="7">
              <div class="text-caption text-medium-emphasis mb-1">Motivo</div>
              <div class="text-body-2 font-weight-medium">
                {{ profile.discount_reason }}
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- ── Sección 3: Retícula ── -->
        <v-divider class="my-3" />
        <template v-if="profile.reticula_start_date && profile.reticula_end_date">
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
            <v-col v-if="profile.reticula_original_name" cols="12" sm="6">
              <div class="text-caption text-medium-emphasis mb-1">Documento</div>
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
        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="compact"
        >
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
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.discount_valid_until"
            :label="form.active_discount_percentage ? 'Descuento vigente hasta *' : 'Descuento vigente hasta'"
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
            :label="form.active_discount_percentage ? 'Motivo del descuento *' : 'Motivo del descuento'"
            maxlength="200"
            clearable
            density="compact"
            variant="outlined"
            :rules="[requiredIfDiscount]"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import { API_URL } from "@/constants";
import type {
  ScholarshipProfile,
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

const emptyForm = () => ({
  user_id: props.userId,
  scholarship_type: "IU" as ScholarshipType,
  monthly_amount: 0,
  active_discount_percentage: null as number | null,
  discount_reason: null as string | null,
  discount_valid_until: null as string | null,
  reticula_start_date: "",
  reticula_end_date: "",
  file: null as File | null,
});

const form = reactive(emptyForm());

onMounted(async () => {
  loading.value = true;
  profile.value = (await store.fetchProfile(props.userId)) ?? null;
  loading.value = false;
});

const startEdit = (): void => {
  if (profile.value) {
    form.scholarship_type = profile.value.scholarship_type;
    form.monthly_amount = Number(profile.value.monthly_amount);
    form.active_discount_percentage = profile.value.active_discount_percentage
      ? Number(profile.value.active_discount_percentage)
      : null;
    form.discount_reason = profile.value.discount_reason ?? null;
    form.discount_valid_until = profile.value.discount_valid_until
      ? dayjs(profile.value.discount_valid_until).format("YYYY-MM-DD")
      : null;
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

const onSave = async (): Promise<void> => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  saving.value = true;

  const profileResult = await store.saveProfile({
    user_id: form.user_id,
    scholarship_type: form.scholarship_type,
    monthly_amount: form.monthly_amount,
    active_discount_percentage: form.active_discount_percentage,
    discount_reason: form.discount_reason,
    discount_valid_until: form.discount_valid_until,
  });

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

  saving.value = false;
};

const required = (v: unknown): boolean | string =>
  (v !== null && v !== undefined && v !== "") || "Campo requerido.";

const requiredIfDiscount = (v: unknown): boolean | string => {
  if (!form.active_discount_percentage) return true;
  return (v !== null && v !== undefined && v !== "") || "Requerido cuando hay descuento.";
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
