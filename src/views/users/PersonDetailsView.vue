<template>
  <BreadCrumbs :items="links" />

  <!-- Header del becario -->
  <v-card v-if="selectedPerson" class="mb-4">
    <v-card-text>
      <v-row align="center" no-gutters>
        <!-- Avatar -->
        <v-col cols="auto" class="mr-6">
          <v-avatar color="primary" size="64" class="elevation-1">
            <span class="text-h5 font-weight-bold text-white">
              {{ selectedPerson.first_name[0]
              }}{{ selectedPerson.last_name[0] }}
            </span>
          </v-avatar>
        </v-col>

        <!-- Nombre y Status -->
        <v-col class="mr-4">
          <div class="text-h6 text-uppercase font-weight-bold">
            {{ selectedPerson.first_name }} {{ selectedPerson.last_name }}
          </div>
          <v-chip
            :color="selectedPerson.active ? 'success' : 'error'"
            size="x-small"
            variant="flat"
          >
            {{ selectedPerson.active ? "Activo" : "Inactivo" }}
          </v-chip>
        </v-col>

        <!-- Información -->
        <v-col cols="12" md="7" class="mt-4 mt-md-0">
          <v-row>
            <!-- Matrícula -->
            <v-col cols="12" sm="6">
              <div
                class="d-flex align-center text-caption text-medium-emphasis mb-1"
              >
                <v-icon size="small" class="mr-1">mdi-identifier</v-icon>
                Matrícula
              </div>
              <div class="font-weight-medium">
                {{ selectedPerson.enrollment || "N/A" }}
              </div>
            </v-col>

            <!-- Sede -->
            <v-col cols="12" sm="6">
              <div
                class="d-flex align-center text-caption text-medium-emphasis mb-1"
              >
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon> Sede
              </div>
              <div class="font-weight-medium">{{ selectedPerson.campus }}</div>
            </v-col>

            <!-- Correo -->
            <v-col cols="12" sm="6">
              <div
                class="d-flex align-center text-caption text-medium-emphasis mb-1"
              >
                <v-icon size="small" class="mr-1">mdi-email</v-icon> Correo
                electrónico
              </div>
              <div class="font-weight-medium">{{ selectedPerson.email }}</div>
            </v-col>

            <!-- Teléfono -->
            <v-col cols="12" sm="6">
              <div
                class="d-flex align-center text-caption text-medium-emphasis mb-1"
              >
                <v-icon size="small" class="mr-1">mdi-phone</v-icon> Teléfono
              </div>
              <div class="font-weight-medium">
                {{ selectedPerson.phone || "No registrado" }}
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-row>
    <v-col cols="12">
      <v-expansion-panels v-model="panel" multiple>
        <!-- Panel 1 — Información de usuario -->
        <v-expansion-panel>
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                v-if="selectedPerson"
                title="Información de usuario"
                button-text="Actualizar"
                :expanded="expanded"
                @button-click="openUpdateDialog"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <UserForm v-if="selectedPerson" :user="selectedPerson" />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 2 — Perfil de beca (solo becarios activos) -->
        <v-expansion-panel v-if="selectedPerson?.user_type === 'BEC_ACTIVE'">
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Perfil de beca"
                button-text=""
                :expanded="expanded"
                @button-click="goToScholarships"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ScholarshipProfileCard
              v-if="selectedPerson"
              :user-id="selectedPerson.id"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 3 — Retícula (solo becarios activos) -->
        <v-expansion-panel v-if="selectedPerson?.user_type === 'BEC_ACTIVE'">
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions title="Retícula" :expanded="expanded" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ScholarshipReticulaCard
              v-if="selectedPerson"
              :user-id="selectedPerson.id"
              :profile="scholarshipProfile"
              @updated="scholarshipProfile = $event"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 4 — Calificaciones semestrales (solo becarios activos) -->
        <v-expansion-panel v-if="selectedPerson?.user_type === 'BEC_ACTIVE'">
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Calificaciones semestrales"
                button-text="Agregar calificación"
                :expanded="expanded"
                @button-click="gradesCard?.openAdd()"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ScholarshipSemesterGradesCard
              v-if="selectedPerson"
              ref="gradesCard"
              :user-id="selectedPerson.id"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 5 — Documentos (solo becarios activos) -->
        <v-expansion-panel v-if="selectedPerson?.user_type === 'BEC_ACTIVE'">
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Documentos"
                button-text="Subir documento"
                :expanded="expanded"
                @button-click="documentsCard?.openUpload()"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ScholarshipDocumentsCard
              v-if="selectedPerson"
              ref="documentsCard"
              :user-id="selectedPerson.id"
              :period-year="currentYear"
              :period-month="currentMonth"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 6 — Historial de refrendos (solo becarios activos) -->
        <v-expansion-panel v-if="selectedPerson?.user_type === 'BEC_ACTIVE'">
          <v-expansion-panel-title color="#f8f8f8">
            <template #default="{ expanded }">
              <PanelHeaderOptions
                title="Historial de pagos"
                :expanded="expanded"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ScholarshipRefrendMiniList
              v-if="selectedPerson"
              :user-id="selectedPerson.id"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>

  <UserUpdateDialog
    v-if="selectedPerson"
    v-model="updateDialog"
    :title="dialogTitle"
    :edit-item="selectedPerson"
    :loading="loadingUpdate"
    :user-campus="filteredCampus"
    :generations="generations"
    @submit="onUpdate"
  />

  <ConfirmationDialog ref="confirmationDialog" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { usePersonDetailsPage } from "@/composables/usePersonDetailsPage";
import { useScholarshipStore } from "@/stores/api/scholarshipStore";
import type { PersonsMode } from "@/composables/usePersonsPage";
import type { ScholarshipProfile } from "@/interfaces/scholarship";

import ConfirmationDialog from "@/components/shared/ConfirmationDialog.vue";
import BreadCrumbs from "@/components/shared/BreadCrumbs.vue";
import PanelHeaderOptions from "@/components/shared/PanelHeaderOptions.vue";
import UserUpdateDialog from "@/components/users/UserUpdateDialog.vue";
import UserForm from "@/components/users/UserForm.vue";
import ScholarshipProfileCard from "@/components/scholarships/ScholarshipProfileCard.vue";
import ScholarshipReticulaCard from "@/components/scholarships/ScholarshipReticulaCard.vue";
import ScholarshipSemesterGradesCard from "@/components/scholarships/ScholarshipSemesterGradesCard.vue";
import ScholarshipDocumentsCard from "@/components/scholarships/ScholarshipDocumentsCard.vue";
import ScholarshipRefrendMiniList from "@/components/scholarships/ScholarshipRefrendMiniList.vue";

const props = defineProps<{
  mode: PersonsMode;
}>();

const router = useRouter();
const confirmationDialog = ref();
const panel = ref<number[]>([]);
const gradesCard = ref<{ openAdd: () => void } | null>(null);
const documentsCard = ref<{ openUpload: () => void } | null>(null);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const scholarshipStore = useScholarshipStore();
const scholarshipProfile = ref<ScholarshipProfile | null>(null);

const loadProfile = async (userId: number | undefined): Promise<void> => {
  if (!userId) return;
  scholarshipProfile.value =
    (await scholarshipStore.fetchProfile(userId)) ?? null;
};

const {
  links,
  selectedPerson,
  updateDialog,
  loadingUpdate,
  generations,
  filteredCampus,
  dialogTitle,
  openUpdateDialog,
  onUpdate,
} = usePersonDetailsPage(props.mode);

const goToScholarships = (): void => {
  router.push("/scholarships");
};

watch(
  () => selectedPerson.value,
  (person) => {
    if (person?.user_type === "BEC_ACTIVE") {
      loadProfile(person.id);
    } else {
      scholarshipProfile.value = null;
    }
  },
  { immediate: true },
);
</script>
