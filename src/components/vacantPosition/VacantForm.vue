<template>
  <v-container class="user-details-list" fluid>
    <v-row>
      <v-col cols="12" md="12">
        <h3>Sobre la vacante:</h3>
      </v-col>
      <v-col cols="12" md="12">
        <ul>
          <li>
            <b>Tipo:</b>
            {{
              props.vacant.category === "JOB_POSITION"
                ? "Vacante laboral"
                : vacantTypeMap.get(props.vacant.category).text
            }}
          </li>
          <li><b>Perfil de estudio:</b> {{ props.vacant.study_profile }}</li>
          <li>
            <b>Modalidad de trabajo:</b>
            {{ modeVacantMap.get(props.vacant.mode).text }}
          </li>

          <!-- Campos específicos según la categoría -->
          <template v-if="props.vacant.category === 'JOB_POSITION'">
            <li><b>Actividades:</b> {{ props.vacant.activities }}</li>
            <li>
              <b>Habilidades y/o competencias:</b> {{ props.vacant.skills }}
            </li>
            <li>
              <b>Experiencia:</b>
              {{ props.vacant.experience ? "Sí" : "No" }}
            </li>
            <li v-if="props.vacant.experience">
              <b>Descripción de experiencia:</b>
              {{ props.vacant.experience_description }}
            </li>
          </template>

          <template
            v-else-if="
              props.vacant.category === 'PROFESSIONAL_PRACTICE' ||
              props.vacant.category === 'JR_POSITION'
            "
          >
            <li>
              <b>Semestre y/o cuatrimestre admitido:</b>
              {{ props.vacant.semester }}
            </li>
            <li>
              <b>Habilidades y/o competencias:</b> {{ props.vacant.skills }}
            </li>
            <li>
              <b>¿Conocimientos sobre algún tema en específico?</b>
              {{ props.vacant.general_knowledge ? "Sí" : "No" }}
            </li>
            <li v-if="props.vacant.general_knowledge">
              <b>Descripción de conocimientos:</b>
              {{ props.vacant.knowledge_description }}
            </li>
          </template>

          <!-- Campos comunes opcionales -->
          <li v-if="props.vacant.software_use">
            <b>Manejo de software:</b>
            {{ props.vacant.software_description }}
          </li>
          <li v-if="props.vacant.compensations">
            <b>Compensaciones:</b> {{ props.vacant.compensations }}
          </li>
        </ul>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12">
        <h3>Te ofrecemos:</h3>
      </v-col>
      <v-col cols="12" md="12">
        <template
          v-if="
            props.vacant.category === 'JOB_POSITION' ||
            props.vacant.category === 'JR_POSITION'
          "
        >
          <ul>
            <li><b>Sueldo neto mensual:</b> ${{ props.vacant.net_salary }}</li>
          </ul>
        </template>

        <template v-if="props.vacant.category === 'PROFESSIONAL_PRACTICE'">
          <ul>
            <li>
              <b>Apoyo económico:</b>
              {{ props.vacant.financial_support ? "Sí" : "No" }}
            </li>
            <li v-if="props.vacant.financial_support">
              <b>Monto mensual asignado:</b>
              ${{ props.vacant.support_amount }}
            </li>
          </ul>
        </template>
        <ul>
          <li>
            <b>Días que se laboran:</b> <br />
            <ul class="mx-5 my-2">
              <li>
                <b>
                  {{ props.vacant.start_day }} a {{ props.vacant.end_day }}:</b
                >
                {{ props.vacant.start_hour }}:{{
                  props.vacant.start_minute
                }}
                hrs - {{ props.vacant.end_hour }}:{{ props.vacant.end_minute }}
                hrs
              </li>
              <li v-if="props.vacant.saturday_hour">
                <b>Sábados:</b> {{ props.vacant.saturday_start_hour }}:{{
                  props.vacant.saturday_start_minute
                }}
                hrs - {{ props.vacant.saturday_end_hour }}:{{
                  props.vacant.saturday_end_minute
                }}
                hrs
              </li>
              <li v-if="props.vacant.sunday_hour">
                <b>Domingos:</b> {{ props.vacant.sunday_start_hour }}:{{
                  props.vacant.sunday_start_minute
                }}
                hrs - {{ props.vacant.sunday_end_hour }}:{{
                  props.vacant.sunday_end_minute
                }}
                hrs
              </li>
              <li v-if="props.vacant.additional_time_info">
                <b>Información adicional respecto al horario:</b>
                {{ props.vacant.additional_time_info }}
              </li>
            </ul>
          </li>
        </ul>
        <ul v-if="props.vacant.category === 'JOB_POSITION'">
          <li><b>Prestaciones</b></li>
          <ul class="mx-5 my-2">
            <li>Seguro social</li>
            <li>Salario mínimo</li>
            <li>Vacaciones</li>
            <li>Prima vacacional</li>
            <li>Prima Dominical</li>
            <li>Días de descanso</li>
            <li>Pago horas extras</li>
            <li>Aguinaldo</li>
            <li>
              Licencia por maternidad/paternidad, de lactancia y/o adopción
            </li>
            <li v-if="props.vacant.utilities">
              Participación de utilidades (en caso de aplicar)
            </li>
            <li v-if="props.vacant.bonuses">Bonos</li>
            <li v-if="props.vacant.dining_room">Servicio de comedor</li>
            <li v-if="props.vacant.savings_fund">Fondo de ahorro</li>
            <li v-if="props.vacant.grocery_vouchers">Vales de despensa</li>
            <li v-if="props.vacant.extensive_vacation_bonus">
              Prima vacacional ampliada
            </li>
            <li v-if="props.vacant.top_christmas_bonus">
              Aguinaldo superior a la ley
            </li>
            <li v-if="props.vacant.flexible_hours">
              Flexibilidad en los horarios
            </li>
            <li v-if="props.vacant.major_medical_expenses">
              Gastos médicos mayores
            </li>
            <li v-if="props.vacant.transportation_help">
              Ayuda o servicios de transporte (vales de gasolina, transporte)
            </li>
            <li v-if="props.vacant.automobile">Automóvil</li>
            <li v-if="props.vacant.loans">Préstamos y/o créditos</li>
            <li v-if="props.vacant.life_insurance">Seguro de vida</li>
            <li v-if="props.vacant.other">
              {{ props.vacant.benefit_description }}
            </li>
          </ul>

          <!-- Agregar más beneficios según los datos -->
        </ul>

        <ul>
          <li v-if="props.vacant.observations">
            <b>Observaciones:</b>
            {{ props.vacant.observations }}
          </li>
        </ul>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { modeVacantMap, vacantTypeMap } from "@/constants";

const props = defineProps({
  vacant: { type: Object, required: true },
});
</script>
