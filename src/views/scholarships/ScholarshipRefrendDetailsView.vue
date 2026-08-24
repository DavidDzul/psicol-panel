<template>
  <BreadCrumbs :items="links" />

  <v-row v-if="loading">
    <v-col cols="12" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </v-col>
  </v-row>

  <template v-else-if="refrend">
    <!-- ── Alerta de arrastre de retenciones ────────────────────────────────── -->
    <RefrendCarryoverAlert
      :amount-pending="refrend.amount_pending_from_previous"
      :total-to-pay="refrend.total_to_pay"
    />

    <!-- Acciones secundarias -->
    <div class="mb-4 d-flex justify-end flex-wrap ga-2">
      <v-btn
        v-if="!isLocked && !hideWithholdAction"
        color="error"
        variant="text"
        size="small"
        prepend-icon="mdi-pause-circle"
        @click="openWithhold"
      >
        Retener refrendo
      </v-btn>
      <v-btn
        v-if="!isLocked"
        color="orange-darken-2"
        variant="text"
        size="small"
        prepend-icon="mdi-account-school"
        @click="graduateDialog = true"
      >
        Marcar como egresado
      </v-btn>
    </div>

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center" class="flex-wrap ga-2">
          <v-col cols="12" sm="auto">
            <div class="text-h6 font-weight-bold">
              {{ refrend.snapshot_name }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ refrend.snapshot_campus }} &middot;
              {{ refrend.snapshot_scholarship_type }} &middot; {{ periodLabel }}
            </div>
          </v-col>

          <v-spacer />

          <!-- Financials -->
          <v-col cols="auto" class="text-right">
            <div class="text-caption text-medium-emphasis">Monto base</div>
            <div class="text-body-1 font-weight-medium">
              {{ fmt(refrend.base_amount) }}
            </div>
            <!-- "Monto base" NO incluye el aumento temporal (ni monto_apoyo):
                 ver ScholarshipCalculationService::buildSnapshot(). Este chip
                 es la ÚNICA forma de ver de dónde sale el saldo extra acá. -->
            <div class="d-flex flex-wrap ga-1 justify-end mt-1">
              <v-tooltip
                v-if="refrend.snapshot_discount_percentage"
                :text="
                  refrend.snapshot_discount_reason ?? 'Sin motivo registrado'
                "
                location="bottom"
              >
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    size="x-small"
                    color="orange-darken-1"
                    variant="tonal"
                    label
                    prepend-icon="mdi-percent"
                  >
                    Desc. perfil {{ refrend.snapshot_discount_percentage }}%
                  </v-chip>
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="Number(refrend.snapshot_temporary_increase_amount) > 0"
                :text="
                  refrend.snapshot_temporary_increase_reason ??
                  'Sin motivo registrado'
                "
                location="bottom"
              >
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    size="x-small"
                    color="success"
                    variant="tonal"
                    label
                    prepend-icon="mdi-plus-circle-outline"
                  >
                    +{{ fmt(refrend.snapshot_temporary_increase_amount ?? 0) }}
                    aumento
                  </v-chip>
                </template>
              </v-tooltip>
            </div>
          </v-col>
          <v-col
            v-if="Number(refrend.discount_amount) > 0"
            cols="auto"
            class="text-right"
          >
            <div class="text-caption text-medium-emphasis">Descuento</div>
            <div class="text-body-1 font-weight-medium text-error">
              - {{ fmt(refrend.discount_amount) }} ({{
                refrend.discount_percentage
              }}%)
            </div>
          </v-col>
          <v-col cols="auto" class="text-right mx-2">
            <div class="text-caption text-medium-emphasis">
              {{
                Number(refrend.amount_pending_from_previous) > 0
                  ? "Total a pagar"
                  : "Pago final"
              }}
            </div>
            <div class="text-h6 font-weight-bold text-success">
              {{
                fmt(
                  Number(refrend.amount_pending_from_previous) > 0
                    ? refrend.total_to_pay
                    : refrend.final_amount,
                )
              }}
            </div>
          </v-col>

          <v-col class="mx-2" cols="auto">
            <v-chip :color="statusColor(refrend.status)" label size="default">
              {{ statusLabel(refrend.status) }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Two-actor sections ─────────────────────────────────────────────── -->
    <v-row class="mb-4">
      <!-- Actor 1: Atención de Becarios -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" color="blue" class="actor-card h-100">
          <v-card-title class="actor-header bg-blue-lighten-5">
            <v-icon color="blue" size="small" class="mr-1"
              >mdi-account-check</v-icon
            >
            Encargado/a de Atención de Becarios
          </v-card-title>
          <v-card-text class="pt-3">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon :color="atencionDone ? 'success' : 'grey'" size="small">
                {{ atencionDone ? "mdi-check-circle" : "mdi-circle-outline" }}
              </v-icon>
              <span class="text-body-2">
                {{ atencionDone ? "Revisado" : "Pendiente de revisión" }}
              </span>
              <span
                v-if="refrend.atencion_reviewed_at"
                class="text-caption text-medium-emphasis"
              >
                · {{ formatDate(refrend.atencion_reviewed_at) }}
              </span>
            </div>

            <!-- Etiquetas de revisión -->
            <div
              v-if="
                refrend.atencion_labels && refrend.atencion_labels.length > 0
              "
              class="mb-3"
            >
              <div class="text-caption text-medium-emphasis mb-1">
                Etiquetas
              </div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="label in refrend.atencion_labels"
                  :key="label"
                  color="blue"
                  variant="tonal"
                  size="x-small"
                  label
                >
                  {{ label }}
                </v-chip>
              </div>
            </div>

            <div v-if="refrend.atencion_observations" class="mb-3">
              <div class="text-caption text-medium-emphasis mb-1">
                Observaciones
              </div>
              <div class="text-body-2 observation-box">
                {{ refrend.atencion_observations }}
              </div>
            </div>

            <v-btn
              v-if="!isLocked && canAtencionReview"
              color="blue"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="openAtencionReview"
            >
              {{ atencionDone ? "Actualizar revisión" : "Marcar revisado" }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Actor 2: Pedagogía -->
      <v-col cols="12" md="6">
        <v-card variant="outlined" color="purple" class="actor-card h-100">
          <v-card-title class="actor-header bg-purple-lighten-5">
            <v-icon color="purple" size="small" class="mr-1">mdi-school</v-icon>
            Encargado/a de Pedagogía
          </v-card-title>
          <v-card-text class="pt-3">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon :color="pedagogiaDone ? 'success' : 'grey'" size="small">
                {{ pedagogiaDone ? "mdi-check-circle" : "mdi-circle-outline" }}
              </v-icon>
              <span class="text-body-2">{{ pedagogiaStatus }}</span>
              <span
                v-if="refrend.pedagogia_reviewed_at"
                class="text-caption text-medium-emphasis"
              >
                · {{ formatDate(refrend.pedagogia_reviewed_at) }}
              </span>
            </div>

            <div v-if="refrend.pedagogia_observations" class="mb-3">
              <div class="text-caption text-medium-emphasis mb-1">
                Observaciones
              </div>
              <div class="text-body-2 observation-box">
                {{ refrend.pedagogia_observations }}
              </div>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="!isLocked && canPedagogiaReview"
                color="purple"
                variant="tonal"
                size="small"
                prepend-icon="mdi-pencil"
                @click="openPedagogiaReview"
              >
                {{ pedagogiaDone ? "Actualizar revisión" : "Revisar" }}
              </v-btn>
              <v-btn
                v-if="!isLocked && canAuthorize"
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="mdi-check-all"
                @click="openAuthorize"
              >
                Autorizar pago
              </v-btn>
              <v-btn
                v-if="refrend.status === 'AUTHORIZED'"
                color="teal"
                variant="tonal"
                size="small"
                prepend-icon="mdi-cash-check"
                @click="onMarkPaid"
              >
                Marcar pagado
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Content tabs ────────────────────────────────────────────────────── -->
    <v-card>
      <v-tabs v-model="activeTab" color="primary" density="compact">
        <v-tab value="asistencias">
          <v-icon size="small" class="mr-1">mdi-calendar-check</v-icon>
          Asistencias
        </v-tab>
        <v-tab value="academico">
          <v-icon size="small" class="mr-1">mdi-school</v-icon>
          Académico
        </v-tab>
        <v-tab value="documentos">
          <v-badge
            v-if="docList.length > 0"
            :content="docList.length"
            color="primary"
            inline
          >
            <v-icon size="small" class="mr-1">mdi-file-multiple</v-icon>
            Documentos
          </v-badge>
          <template v-else>
            <v-icon size="small" class="mr-1">mdi-file-multiple</v-icon>
            Documentos
          </template>
        </v-tab>
        <v-tab value="descuentos">
          <v-badge
            v-if="(refrend.discounts?.length ?? 0) > 0"
            :content="refrend.discounts?.length"
            color="error"
            inline
          >
            <v-icon size="small" class="mr-1">mdi-percent</v-icon>
            Descuentos
          </v-badge>
          <template v-else>
            <v-icon size="small" class="mr-1">mdi-percent</v-icon>
            Descuentos
          </template>
        </v-tab>
        <v-tab value="semestre">
          <v-badge
            v-if="semesterRefrends.length > 1"
            :content="semesterRefrends.length"
            color="blue-grey"
            inline
          >
            <v-icon size="small" class="mr-1">mdi-calendar-month</v-icon>
            Semestre
          </v-badge>
          <template v-else>
            <v-icon size="small" class="mr-1">mdi-calendar-month</v-icon>
            Semestre
          </template>
        </v-tab>
        <v-tab value="historial">
          <v-icon size="small" class="mr-1">mdi-history</v-icon>
          Historial
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="activeTab">
        <!-- Asistencias -->
        <v-window-item value="asistencias">
          <v-card-text>
            <ScholarshipAttendanceSummary
              :user-id="refrend.user_id"
              :year="refrend.period_year"
              :month="refrend.period_month"
            />
          </v-card-text>
        </v-window-item>

        <!-- Académico (retícula + calificaciones, solo lectura) -->
        <v-window-item value="academico">
          <v-card-text>
            <StudentAcademicSummaryCard
              :user-id="refrend.user_id"
              :profile="scholarshipProfile"
            />
          </v-card-text>
        </v-window-item>

        <!-- Documentos (solo lectura, gestión en perfil del becario) -->
        <v-window-item value="documentos">
          <v-card-text>
            <ScholarshipDocumentsCard readonly :user-id="refrend.user_id" />
          </v-card-text>
        </v-window-item>

        <!-- Descuentos -->
        <v-window-item value="descuentos">
          <v-card-text>
            <ScholarshipDiscountsCard
              :refrend="refrend"
              :discounts="refrend.discounts ?? []"
            />
          </v-card-text>
        </v-window-item>

        <!-- Historial semestral -->
        <v-window-item value="semestre">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-3">
              Refrendos del {{ semesterLabel }} · {{ refrend.period_year }}
            </div>

            <div
              v-if="!semesterRefrends.length"
              class="text-body-2 text-medium-emphasis"
            >
              Sin refrendos registrados en este semestre.
            </div>

            <v-list v-else density="compact" lines="two">
              <v-list-item
                v-for="sr in semesterRefrends"
                :key="sr.id"
                :class="sr.id === refrend.id ? 'bg-blue-lighten-5' : ''"
                :to="
                  sr.id !== refrend.id ? `/scholarships/${sr.id}` : undefined
                "
                rounded="lg"
              >
                <template #prepend>
                  <v-icon
                    :color="statusColor(sr.status)"
                    size="small"
                    class="mr-2"
                  >
                    {{
                      sr.id === refrend.id ? "mdi-circle" : "mdi-circle-outline"
                    }}
                  </v-icon>
                </template>

                <template #title>
                  <span class="text-body-2 font-weight-medium">
                    {{ monthName(sr.period_month) }}
                    <span
                      v-if="sr.id === refrend.id"
                      class="text-caption text-blue ml-1"
                      >(actual)</span
                    >
                  </span>
                </template>

                <template #subtitle>
                  <span class="text-caption">
                    Base {{ fmt(sr.base_amount) }}
                    <template v-if="Number(sr.discount_amount) > 0">
                      · Desc. {{ fmt(sr.discount_amount) }}
                    </template>
                    · <strong>Final {{ fmt(sr.final_amount) }}</strong>
                    <template
                      v-if="Number(sr.amount_pending_from_previous) > 0"
                    >
                      <span class="text-warning">
                        +
                        {{ fmt(sr.amount_pending_from_previous) }}
                        retenido</span
                      >
                    </template>
                  </span>
                </template>

                <template #append>
                  <v-chip :color="statusColor(sr.status)" size="x-small" label>
                    {{ statusLabel(sr.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>

            <!-- Totales del semestre -->
            <v-divider class="my-3" />
            <div class="d-flex flex-wrap ga-4">
              <div>
                <div class="text-caption text-medium-emphasis">Pagados</div>
                <div class="text-body-2 font-weight-medium text-success">
                  {{ fmt(semesterTotals.paid) }}
                </div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">Retenidos</div>
                <div class="text-body-2 font-weight-medium text-warning">
                  {{ fmt(semesterTotals.withheld) }}
                </div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">Pendientes</div>
                <div class="text-body-2 font-weight-medium">
                  {{ fmt(semesterTotals.pending) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- Historial de cambios del refrendo -->
        <v-window-item value="historial">
          <v-card-text>
            <ScholarshipHistoryTimeline :logs="refrend.logs ?? []" />
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>
  </template>

  <div v-else class="pa-8 text-center text-medium-emphasis">
    Refrendo no encontrado.
  </div>

  <!-- Atencion review dialog (with labels + rules) -->
  <ScholarshipAtencionReviewDialog
    v-model="reviewDialog"
    :attendance-summary="reviewMode === 'atencion' ? attendanceSummary : null"
    :refrend="reviewMode === 'atencion' ? refrend : null"
    @submit="onSubmitReview"
  />

  <!-- Pedagogia review dialog (plain observations) -->
  <ScholarshipReviewDialog
    v-model="pedagogiaReviewDialog"
    title="Revisión — Pedagogía"
    @submit="onSubmitPedagogiaReview"
  />

  <!-- Authorize dialog -->
  <v-dialog v-model="authorizeDialog" max-width="540">
    <v-card>
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center ga-2">
        <v-icon color="success" size="small">mdi-check-all</v-icon>
        Autorizar pago
      </v-card-title>
      <v-card-text class="pt-0">
        <!-- Faltas administrativas -->
        <div v-if="attendanceSummary" class="mb-4">
          <div
            class="text-caption font-weight-medium text-medium-emphasis mb-2"
          >
            FALTAS ADMINISTRATIVAS (reglamento art. 5)
          </div>
          <v-row dense>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">
                Faltas injustificadas
              </div>
              <div
                class="text-body-2 font-weight-medium"
                :class="
                  attendanceSummary.absent_unjustified > 0
                    ? 'text-error'
                    : 'text-success'
                "
              >
                {{ attendanceSummary.absent_unjustified }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">
                Retardos no consumidos
              </div>
              <div
                class="text-body-2 font-weight-medium"
                :class="
                  attendanceSummary.late_unconsumed >= 2 ? 'text-warning' : ''
                "
              >
                {{ attendanceSummary.late_unconsumed }}
                <span
                  v-if="effectiveAbsencesFromLate > 0"
                  class="text-caption text-warning"
                >
                  (= {{ effectiveAbsencesFromLate }} falta extra)
                </span>
              </div>
            </v-col>
          </v-row>

          <v-alert
            v-if="totalEffectiveAbsences > 0"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            <strong
              >{{ totalEffectiveAbsences }} falta(s) administrativa(s)</strong
            >
            — El reglamento indica suspensión del pago mensual. Monto sugerido:
            <strong>{{ fmt(adminSuggestedAmount) }}</strong>
          </v-alert>
          <v-alert
            v-else
            type="success"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            Sin faltas administrativas — no aplica suspensión por asistencia.
          </v-alert>
        </div>

        <!-- Monto calculado por el sistema -->
        <div class="mb-4 pa-3 rounded bg-grey-lighten-5">
          <div class="text-caption text-medium-emphasis">
            Monto calculado por descuentos académicos
          </div>
          <div class="text-h6 font-weight-bold">
            {{ fmt(refrend?.final_amount ?? 0) }}
          </div>
          <div
            v-if="Number(refrend?.amount_pending_from_previous) > 0"
            class="text-caption text-warning mt-1"
          >
            + {{ fmt(refrend?.amount_pending_from_previous ?? 0) }} de meses
            retenidos =
            <strong>{{ fmt(refrend?.total_to_pay ?? 0) }}</strong> total a pagar
          </div>
          <div
            v-if="Number(refrend?.discount_amount) > 0"
            class="text-caption text-error"
          >
            Incluye descuento de {{ fmt(refrend?.discount_amount ?? 0) }} ({{
              refrend?.discount_percentage
            }}%) por calificaciones
          </div>
        </div>

        <!-- Monto sugerido final considerando ambos criterios -->
        <div
          v-if="attendanceSummary"
          class="mb-4 pa-3 rounded bg-blue-lighten-5"
        >
          <div class="text-caption text-medium-emphasis text-blue">
            MONTO SUGERIDO TOTAL (académico + administrativo)
          </div>
          <div class="text-h5 font-weight-bold text-blue">
            {{ fmt(combinedSuggestedAmount) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            <template v-if="totalEffectiveAbsences > 0">
              Suspensión por falta(s) administrativa(s) tiene prioridad sobre
              descuento académico.
            </template>
            <template v-else>
              Sin faltas administrativas — se aplica solo el descuento
              académico.
            </template>
          </div>
        </div>

        <v-text-field
          v-model.number="authorizeForm.final_amount_override"
          label="Monto a pagar (dejar vacío para usar el monto sugerido)"
          type="number"
          min="0"
          step="0.01"
          variant="outlined"
          density="compact"
          prefix="$"
          class="mb-3"
          hint="Si lo modifica, se ignorarán los descuentos automáticos."
          persistent-hint
        />

        <v-textarea
          v-model="authorizeForm.authorization_notes"
          label="Notas de autorización"
          variant="outlined"
          density="compact"
          rows="2"
          auto-grow
          placeholder="Razón del pago, excepciones aplicadas, etc."
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="authorizeDialog = false">Cancelar</v-btn>
        <v-btn
          color="success"
          variant="tonal"
          @click="
            onAuthorize({
              final_amount_override:
                authorizeForm.final_amount_override || null,
              authorization_notes: authorizeForm.authorization_notes || null,
            })
          "
        >
          Confirmar autorización
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Withhold dialog -->
  <v-dialog v-model="withholdDialog" max-width="440">
    <v-card>
      <v-card-title class="text-subtitle-1 pa-4">Retener refrendo</v-card-title>
      <v-card-text class="pt-0">
        <v-textarea
          v-model="withholdReason"
          label="Motivo (opcional)"
          variant="outlined"
          density="compact"
          rows="3"
          auto-grow
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="withholdDialog = false">Cancelar</v-btn>
        <v-btn
          color="error"
          variant="tonal"
          @click="onWithhold(withholdReason || undefined)"
        >
          Retener
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Graduate dialog -->
  <v-dialog v-model="graduateDialog" max-width="480">
    <v-card>
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center ga-2">
        <v-icon color="orange-darken-2" size="small">mdi-account-school</v-icon>
        Marcar como egresado
      </v-card-title>
      <v-card-text class="pt-0">
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          Esta acción cambiará al becario a estado <strong>Inactivo</strong> y
          cancelará el refrendo activo del mes actual. Esta acción no se puede
          deshacer fácilmente.
        </v-alert>

        <v-textarea
          v-model="graduateComment"
          label="Comentario obligatorio"
          variant="outlined"
          density="compact"
          rows="3"
          auto-grow
          placeholder="Razón del egreso, fecha de graduación, observaciones..."
          :rules="[requiredRule]"
        />

        <v-checkbox
          v-model="graduateConfirmed"
          label="Entiendo que esta acción marcará al becario como egresado y es irreversible."
          density="compact"
          color="warning"
          class="mt-1"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="graduateDialog = false">Cancelar</v-btn>
        <v-btn
          color="orange-darken-2"
          variant="tonal"
          :disabled="!graduateConfirmed || !graduateComment.trim()"
          @click="onGraduate({ comment: graduateComment })"
        >
          Confirmar egreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useScholarshipDetails } from "@/composables/useScholarshipDetails";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import ScholarshipDiscountsCard from "@/components/scholarships/ScholarshipDiscountsCard.vue";
import ScholarshipReviewDialog from "@/components/scholarships/ScholarshipReviewDialog.vue";
import ScholarshipAtencionReviewDialog from "@/components/scholarships/ScholarshipAtencionReviewDialog.vue";
import ScholarshipAttendanceSummary from "@/components/scholarships/ScholarshipAttendanceSummary.vue";
import ScholarshipHistoryTimeline from "@/components/scholarships/ScholarshipHistoryTimeline.vue";
import StudentAcademicSummaryCard from "@/components/scholarships/StudentAcademicSummaryCard.vue";
import ScholarshipDocumentsCard from "@/components/scholarships/ScholarshipDocumentsCard.vue";
import RefrendCarryoverAlert from "@/components/scholarships/RefrendCarryoverAlert.vue";
import { isFullyWithheld } from "@/utils/refrendActionability";
import type { ReviewForm } from "@/interfaces/scholarship";
import {
  refrendStatusColor as statusColor,
  refrendStatusLabel as statusLabel,
} from "@/utils/refrendStatusDisplay";
import type { LinkInterface } from "@/interfaces";

const links: LinkInterface[] = [
  { title: "Inicio", disabled: false, href: "/" },
  { title: "Refrendos", disabled: false, href: "/scholarships" },
  { title: "Detalle", disabled: true, href: "" },
];

const activeTab = ref<string>("asistencias");

const authorizeForm = reactive<{
  final_amount_override: number | null;
  authorization_notes: string;
}>({
  final_amount_override: null,
  authorization_notes: "",
});

const graduateComment = ref<string>("");
const graduateConfirmed = ref<boolean>(false);

// Separate dialog ref for pedagogia (atencion uses reviewDialog from composable)
const pedagogiaReviewDialog = ref<boolean>(false);

const {
  refrend,
  docList,
  semesterRefrends,
  attendanceSummary,
  loading,
  scholarshipProfile,
  reviewDialog,
  reviewMode,
  withholdDialog,
  withholdReason,
  authorizeDialog,
  graduateDialog,
  openAtencionReview,
  openPedagogiaReview: _openPedagogiaReview,
  onSubmitReview,
  openAuthorize,
  onAuthorize,
  onMarkPaid,
  openWithhold,
  onWithhold,
  onGraduate,
} = useScholarshipDetails();

// Override pedagogia review to use separate dialog
const openPedagogiaReview = (): void => {
  reviewMode.value = "pedagogia";
  pedagogiaReviewDialog.value = true;
};

const onSubmitPedagogiaReview = async (form: ReviewForm): Promise<void> => {
  await onSubmitReview(form);
  pedagogiaReviewDialog.value = false;
};

// ── Attendance-based calculations ────────────────────────────────────────────

const effectiveAbsencesFromLate = computed<number>(() => {
  if (!attendanceSummary.value) return 0;
  return Math.floor(attendanceSummary.value.late_unconsumed / 2);
});

const totalEffectiveAbsences = computed<number>(() => {
  if (!attendanceSummary.value) return 0;
  return (
    attendanceSummary.value.absent_unjustified + effectiveAbsencesFromLate.value
  );
});

// When there are administrative absences, the payment for the month is suspended (= $0)
// Otherwise, the academic final_amount already applies
const adminSuggestedAmount = computed<number>(() => {
  if (totalEffectiveAbsences.value > 0) return 0;
  return Number(refrend.value?.final_amount ?? 0);
});

// Combined suggestion: admin infractions override academic discounts
const combinedSuggestedAmount = computed<number>(
  () => adminSuggestedAmount.value,
);

// ── Computed state helpers ────────────────────────────────────────────────

const isLocked = computed<boolean>(() =>
  refrend.value
    ? ["AUTHORIZED", "PAID", "CANCELLED"].includes(refrend.value.status)
    : false,
);

/**
 * The "Retener refrendo" action hides only when the retention is TOTAL
 * (`final_amount === 0`). A PARTIAL retention (`final_amount > 0`) behaves
 * like a normal refrend and keeps the action visible.
 */
const hideWithholdAction = computed<boolean>(() =>
  refrend.value ? isFullyWithheld(refrend.value) : false,
);

const atencionDone = computed<boolean>(() =>
  refrend.value
    ? ["ATENCION_REVIEW", "PEDAGOGIA_REVIEW", "AUTHORIZED", "PAID"].includes(
        refrend.value.status,
      )
    : false,
);

const pedagogiaDone = computed<boolean>(() =>
  refrend.value
    ? ["PEDAGOGIA_REVIEW", "AUTHORIZED", "PAID"].includes(refrend.value.status)
    : false,
);

const canAtencionReview = computed<boolean>(() =>
  refrend.value
    ? ["DRAFT", "ATENCION_REVIEW"].includes(refrend.value.status)
    : false,
);

const canPedagogiaReview = computed<boolean>(() =>
  refrend.value
    ? ["ATENCION_REVIEW", "PEDAGOGIA_REVIEW"].includes(refrend.value.status)
    : false,
);

const canAuthorize = computed<boolean>(() =>
  refrend.value ? refrend.value.status === "PEDAGOGIA_REVIEW" : false,
);

const pedagogiaStatus = computed<string>(() => {
  if (!refrend.value) return "Pendiente";
  if (["AUTHORIZED", "PAID"].includes(refrend.value.status))
    return "Autorizado";
  if (refrend.value.status === "PEDAGOGIA_REVIEW")
    return "Revisado — pendiente de autorizar";
  return "Pendiente de revisión";
});

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const monthName = (month: number): string => MONTHS[month - 1] ?? String(month);

const periodLabel = computed<string>(() => {
  if (!refrend.value) return "";
  return `${monthName(refrend.value.period_month)} ${refrend.value.period_year}`;
});

const semesterLabel = computed<string>(() => {
  if (!refrend.value) return "";
  return refrend.value.period_month <= 7
    ? "Semestre 1 (Ene–Jul)"
    : "Semestre 2 (Ago–Dic)";
});

const semesterTotals = computed<{
  paid: number;
  withheld: number;
  pending: number;
}>(() => {
  return semesterRefrends.value.reduce(
    (acc, sr) => {
      const amount = Number(sr.final_amount);
      if (sr.status === "PAID") acc.paid += amount;
      else if (sr.status === "WITHHELD") acc.withheld += Number(sr.discount_amount);
      else if (!["CANCELLED"].includes(sr.status)) acc.pending += amount;
      return acc;
    },
    { paid: 0, withheld: 0, pending: 0 },
  );
});

const fmt = (value: string | number): string =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(value),
  );

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const requiredRule = (v: string): boolean | string =>
  (v && v.trim().length > 0) || "Campo requerido.";
</script>

<style scoped>
.actor-card {
  border-width: 1.5px;
}

.actor-header {
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.observation-box {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.5;
}
</style>
