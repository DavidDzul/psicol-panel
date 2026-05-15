<template>
  <div>
    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

    <!-- Vista del perfil actual -->
    <template v-if="!editing">
      <div v-if="profile" class="d-flex align-center flex-wrap ga-4 mb-4">
        <v-chip label color="primary" variant="tonal">
          {{ profile.scholarship_type }}
        </v-chip>
        <div>
          <div class="text-caption text-medium-emphasis">Monto mensual</div>
          <div class="text-h6 font-weight-bold">{{ fmt(profile.monthly_amount) }}</div>
        </div>
        <div>
          <div class="text-caption text-medium-emphasis">Inicio</div>
          <div class="text-body-2">{{ profile.payment_start_date }}</div>
        </div>
        <div v-if="profile.payment_end_date">
          <div class="text-caption text-medium-emphasis">Fin</div>
          <div class="text-body-2">{{ profile.payment_end_date }}</div>
        </div>
        <div v-if="profile.active_discount_percentage">
          <div class="text-caption text-medium-emphasis">Descuento académico</div>
          <div class="text-body-2 text-error">{{ profile.active_discount_percentage }}%</div>
        </div>
        <v-spacer />
        <v-btn size="small" variant="tonal" @click="startEdit">Editar perfil</v-btn>
      </div>

      <v-alert
        v-else-if="!loading"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Este becario no tiene perfil de beca. Configura el monto mensual para poder generar refrendos.
        <template #append>
          <v-btn size="small" variant="text" @click="startEdit">Configurar</v-btn>
        </template>
      </v-alert>
    </template>

    <!-- Formulario inline -->
    <v-form v-if="editing" ref="formRef" @submit.prevent="onSave">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-select
            v-model="form.scholarship_type"
            :items="typeOptions"
            label="Tipo de beca *"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12" sm="4">
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
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.payment_start_date"
            label="Fecha inicio *"
            type="date"
            variant="outlined"
            density="compact"
            :rules="[required]"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.payment_end_date"
            label="Fecha fin (opcional)"
            type="date"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="4">
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
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.discount_valid_until"
            label="Descuento vigente hasta"
            type="date"
            variant="outlined"
            density="compact"
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

    <v-divider class="my-4" />

    <!-- Historial de refrendos -->
    <div class="text-subtitle-2 font-weight-medium mb-2">Historial de refrendos</div>
    <ScholarshipRefrendMiniList :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import ScholarshipRefrendMiniList from "@/components/scholarships/ScholarshipRefrendMiniList.vue";
import type { ScholarshipProfile, ScholarshipProfileForm, ScholarshipType } from "@/interfaces/scholarship";

const props = defineProps<{
  userId: number;
}>();

const store = useScholarshipStore();

const loading  = ref(false);
const saving   = ref(false);
const editing  = ref(false);
const formRef  = ref();
const profile  = ref<ScholarshipProfile | null>(null);

const emptyForm = (): ScholarshipProfileForm => ({
  user_id: props.userId,
  scholarship_type: 'IU',
  monthly_amount: 0,
  payment_start_date: '',
  payment_end_date: null,
  active_discount_percentage: null,
  discount_valid_until: null,
});

const form = reactive<ScholarshipProfileForm>(emptyForm());

onMounted(async () => {
  loading.value = true;
  profile.value = (await store.fetchProfile(props.userId)) ?? null;
  loading.value = false;
});

const startEdit = (): void => {
  if (profile.value) {
    form.scholarship_type          = profile.value.scholarship_type;
    form.monthly_amount            = Number(profile.value.monthly_amount);
    form.payment_start_date        = profile.value.payment_start_date;
    form.payment_end_date          = profile.value.payment_end_date ?? null;
    form.active_discount_percentage = profile.value.active_discount_percentage
      ? Number(profile.value.active_discount_percentage)
      : null;
    form.discount_valid_until = profile.value.discount_valid_until ?? null;
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
  const result = await store.saveProfile({ ...form });
  if (result) {
    profile.value = result;
    editing.value = false;
  }
  saving.value = false;
};

// Validation rules
const required = (v: unknown): boolean | string =>
  (v !== null && v !== undefined && v !== '') || 'Campo requerido.';

const positiveNumber = (v: number): boolean | string =>
  v > 0 || 'Debe ser mayor a 0.';

const fmt = (value: string | number): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));

const typeOptions: { title: string; value: ScholarshipType }[] = [
  { title: 'IU', value: 'IU' },
  { title: 'TELMEX', value: 'TELMEX' },
];
</script>
