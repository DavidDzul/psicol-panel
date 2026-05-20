<template>
  <v-card variant="text" class="mb-4">
    <v-card-title
      class="text-subtitle-2 pa-3 bg-grey-lighten-5 d-flex align-center ga-2"
    >
      <v-icon size="small" color="primary">mdi-school</v-icon>
      Información académica
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <div class="mb-4">
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">
          RETÍCULA
        </div>
        <ScholarshipReticulaCard
          :user-id="userId"
          :profile="profile"
          :readonly="true"
        />
      </div>

      <v-divider class="mb-4" />

      <div>
        <div class="text-caption font-weight-medium text-medium-emphasis mb-2">
          CALIFICACIONES SEMESTRALES
        </div>
        <ScholarshipSemesterGradesCard :user-id="userId" :readonly="true" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import ScholarshipReticulaCard from "@/components/scholarships/ScholarshipReticulaCard.vue";
import ScholarshipSemesterGradesCard from "@/components/scholarships/ScholarshipSemesterGradesCard.vue";
import type { ScholarshipProfile } from "@/interfaces/scholarship";

defineProps<{
  userId: number;
  profile: ScholarshipProfile | null;
}>();
</script>
