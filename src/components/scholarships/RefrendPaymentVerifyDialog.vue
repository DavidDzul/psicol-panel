<template>
  <v-dialog v-model="model" max-width="620" persistent scrollable>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center ga-2">
        <v-icon color="orange-darken-2" size="small">mdi-currency-usd-off</v-icon>
        Verificar pago
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">MOTIVO</div>
        <v-radio-group v-model="form.motivo" class="mt-0 mb-4" hide-details>
          <v-radio label="Beca retenida" value="RETENIDA" color="orange-darken-2" />
          <v-radio label="Suspendida temporalmente" value="SUSPENDIDA" color="deep-orange" />
          <v-radio label="Baja" value="BAJA" color="red-darken-2" />
        </v-radio-group>

        <v-divider class="mb-4" />

        <!-- RETENIDA -->
        <template v-if="form.motivo === 'RETENIDA'">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">OPCIÓN</div>
          <v-radio-group v-model="form.retenida_opcion" class="mt-0 mb-4" hide-details>
            <v-radio label="Beca retenida" value="BECA_RETENIDA" color="orange-darken-2" />
            <v-radio label="Pago de meses retenidos" value="PAGO_MESES_RETENIDOS" color="orange-darken-2" />
          </v-radio-group>

          <v-text-field
            v-model.number="form.retenida_num_meses"
            label="Núm. de meses"
            type="number"
            variant="outlined"
            density="compact"
            min="1"
            max="12"
            class="mb-3"
            hide-details
          />

          <v-textarea
            v-model="form.retenida_meses_especificar"
            label="Meses retenidos — especificar (opcional)"
            rows="2"
            variant="outlined"
            density="compact"
            class="mb-4"
            hide-details
          />

          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
          <v-radio-group v-model="form.retenida_causa" class="mt-0 mb-3" hide-details>
            <v-radio label="Faltas a F.I." value="FALTAS_FI" color="orange-darken-2" />
            <v-radio label="Sin entrevista de calificaciones" value="SIN_ENTREVISTA_CALIFICACIONES" color="orange-darken-2" />
            <v-radio label="No entregó calificaciones provisionales" value="NO_ENTREGO_CALIFICACIONES_PROVISIONALES" color="orange-darken-2" />
            <v-radio label="No entregó calificaciones originales" value="NO_ENTREGO_CALIFICACIONES_ORIGINALES" color="orange-darken-2" />
            <v-radio label="Otro" value="OTRO" color="orange-darken-2" />
          </v-radio-group>
          <v-text-field
            v-if="form.retenida_causa === 'OTRO'"
            v-model="form.retenida_causa_otro"
            label="Especificar causa *"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />
        </template>

        <!-- SUSPENDIDA -->
        <template v-if="form.motivo === 'SUSPENDIDA'">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">PORCENTAJE DE SUSPENSIÓN</div>
          <v-radio-group v-model="form.suspendida_pct" class="mt-0 mb-4" hide-details>
            <div class="d-flex flex-wrap ga-3">
              <v-radio
                v-for="pct in [100, 75, 65, 50, 30, 25]"
                :key="pct"
                :label="`${pct}%`"
                :value="pct"
                color="deep-orange"
              />
            </div>
          </v-radio-group>

          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
          <v-radio-group v-model="form.suspendida_causa" class="mt-0 mb-3" hide-details>
            <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="deep-orange" />
            <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="deep-orange" />
            <v-radio label="Por llevarse a extraordinario" value="LLEVARSE_EXTRAORDINARIO" color="deep-orange" />
            <v-radio label="Otro" value="OTRO" color="deep-orange" />
          </v-radio-group>
          <v-text-field
            v-if="form.suspendida_causa === 'OTRO'"
            v-model="form.suspendida_causa_otro"
            label="Especificar causa *"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />
        </template>

        <!-- BAJA -->
        <template v-if="form.motivo === 'BAJA'">
          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">TIPO DE BAJA</div>
          <v-radio-group v-model="form.baja_opcion" class="mt-0 mb-4" hide-details>
            <v-radio label="Cancelada definitivamente" value="DEFINITIVA" color="red-darken-2" />
            <v-radio label="Cancelada temporalmente" value="TEMPORAL" color="red-darken-2" />
          </v-radio-group>

          <div class="text-caption font-weight-medium text-medium-emphasis mb-2">CAUSA</div>
          <v-radio-group v-model="form.baja_causa" class="mt-0 mb-3" hide-details>
            <v-radio label="Bajo promedio" value="BAJO_PROMEDIO" color="red-darken-2" />
            <v-radio label="Faltas a Formación Integral" value="FALTAS_FORMACION_INTEGRAL" color="red-darken-2" />
            <v-radio label="Dejó la escuela por problemas personales" value="DEJO_ESCUELA_PERSONALES" color="red-darken-2" />
            <v-radio label="Dejó la escuela por falta de orientación vocacional" value="DEJO_ESCUELA_VOCACIONAL" color="red-darken-2" />
            <v-radio label="Desapareció sin avisar" value="DESAPARECIO" color="red-darken-2" />
            <v-radio label="Faltas al reglamento" value="FALTAS_REGLAMENTO" color="red-darken-2" />
            <v-radio label="Otro" value="OTRO" color="red-darken-2" />
          </v-radio-group>
          <v-text-field
            v-if="form.baja_causa === 'OTRO'"
            v-model="form.baja_causa_otro"
            label="Especificar causa *"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          />
        </template>

        <v-divider class="my-4" />
        <v-textarea
          v-model="form.notes"
          label="Notas adicionales (opcional)"
          rows="2"
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="model = false">Cancelar</v-btn>
        <v-btn
          :color="actionColor"
          variant="elevated"
          :loading="loading"
          :disabled="!isValid"
          @click="submit"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { RefrendPaymentVerifyForm } from "@/interfaces/scholarship";

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [form: RefrendPaymentVerifyForm];
}>();

const model = defineModel<boolean>();

const form = reactive<RefrendPaymentVerifyForm>({
  motivo: "RETENIDA",
  retenida_opcion: null,
  retenida_num_meses: null,
  retenida_meses_especificar: null,
  retenida_causa: null,
  retenida_causa_otro: null,
  suspendida_pct: null,
  suspendida_causa: null,
  suspendida_causa_otro: null,
  baja_opcion: null,
  baja_causa: null,
  baja_causa_otro: null,
  notes: null,
});

watch(model, (v) => {
  if (!v) return;
  form.motivo = "RETENIDA";
  form.retenida_opcion = null;
  form.retenida_num_meses = null;
  form.retenida_meses_especificar = null;
  form.retenida_causa = null;
  form.retenida_causa_otro = null;
  form.suspendida_pct = null;
  form.suspendida_causa = null;
  form.suspendida_causa_otro = null;
  form.baja_opcion = null;
  form.baja_causa = null;
  form.baja_causa_otro = null;
  form.notes = null;
});

const isValid = computed<boolean>(() => {
  if (form.motivo === "RETENIDA") {
    return !!form.retenida_causa &&
      (form.retenida_causa !== "OTRO" || !!form.retenida_causa_otro?.trim());
  }
  if (form.motivo === "SUSPENDIDA") {
    return form.suspendida_pct != null && !!form.suspendida_causa &&
      (form.suspendida_causa !== "OTRO" || !!form.suspendida_causa_otro?.trim());
  }
  if (form.motivo === "BAJA") {
    return !!form.baja_opcion && !!form.baja_causa &&
      (form.baja_causa !== "OTRO" || !!form.baja_causa_otro?.trim());
  }
  return false;
});

const actionColor = computed<string>(() => {
  if (form.motivo === "RETENIDA") return "orange-darken-2";
  if (form.motivo === "SUSPENDIDA") return "deep-orange";
  return "red-darken-2";
});

const submit = (): void => {
  if (!isValid.value) return;
  emit("submit", { ...form });
};
</script>
