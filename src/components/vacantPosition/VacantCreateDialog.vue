<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="890px"
    @keydown.stop.esc="close"
    :persistent="true"
  >
    <v-card>
      <v-form>
        <v-toolbar dark>
          <v-toolbar-title>Nueva vacante laboral </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-stepper v-model="step" show-actions elevation="0">
            <v-stepper-header>
              <v-stepper-item
                :complete="step > 1"
                title="Seleccionar empresa"
                :value="1"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                :complete="step > 2"
                title="Información General"
                :value="2"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                :complete="step > 3"
                title="Prestaciones"
                :value="3"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                title="Información adicional"
                :value="4"
              ></v-stepper-item>
            </v-stepper-header>
            <v-stepper-window>
              <v-stepper-window-item :value="1">
                <v-row>
                  <v-col cols="12" lg="12">
                    <v-autocomplete
                      v-model="selectedBusiness"
                      v-model:search="searchQuery"
                      :items="businessList"
                      item-title="bs_name"
                      item-value="user_id"
                      label="Buscar Empresa"
                      :loading="loading"
                      clearable
                    />
                  </v-col>
                </v-row>

                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      @click="next"
                      :disabled="validateStep1"
                      >Siguiente</v-btn
                    >
                  </v-row>
                </v-col>
              </v-stepper-window-item>
              <v-stepper-window-item :value="2">
                <v-row>
                  <v-col cols="12" md="12">
                    <b>Información acerca de la vacante:</b>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="vacant_name"
                      v-bind="vacant_nameProps"
                      label="Nombre de la vacante"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <small>
                      <b>Nota:</b> Describe las actividades en un solo párrafo,
                      separándolas con comas. Ejemplo: gestionar la base de
                      datos, generar reportes, coordinar compras, atender
                      solicitudes de clientes.
                    </small>
                    <v-textarea
                      v-model="activities"
                      v-bind="activitiesProps"
                      label="Actividades o funciones"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="study_profile"
                      v-bind="study_profileProps"
                      label="Perfil de estudios"
                      placeholder="Ej: Licenciado/a en Psicología"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-select
                      v-model="mode"
                      :items="modeArray"
                      v-bind="modeProps"
                      item-title="text"
                      item-value="value"
                      label="Modalidad de trabajo"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="net_salary"
                      v-bind="net_salaryProps"
                      label="Sueldo neto"
                      prefix="$"
                      @keypress="onlyNumbers"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-btn color="grey" @click="back">Atrás</v-btn>
                    <v-btn color="primary" @click="next">Siguiente</v-btn>
                  </v-row>
                </v-col>
              </v-stepper-window-item>
              <v-stepper-window-item :value="3">
                <v-row>
                  <v-col cols="12" md="12">
                    <h3>
                      Seleccione las prestaciones que ofrece la vacante laboral.
                    </h3>
                  </v-col>
                  <v-col cols="12" md="12">
                    <b>Prestaciones de ley:</b>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Seguro social"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Salario mínimo"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Vacaciones"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Prima vacacional"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Prima Dominical"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Días de descanso"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Pago horas extras"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Aguinaldo"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      label="Licencia por maternidad/paternidad, de lactancia y/o adopción"
                      density="comfortable"
                      :model-value="true"
                      disabled
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="utilities"
                      v-bind="utilitiesProps"
                      label="Participación de utilidades (en caso de aplicar)"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>

                  <v-col cols="12" md="12">
                    <b>Prestaciones superiores a la ley:</b>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="bonuses"
                      v-bind="bonusesProps"
                      label="Bonos"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="dining_room"
                      v-bind="dining_roomProps"
                      label="Servicio de comedor"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="savings_fund"
                      v-bind="savings_fundProps"
                      label="Fondo de ahorro"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="grocery_vouchers"
                      v-bind="grocery_vouchersProps"
                      label="Vales de despensa"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="extensive_vacation_bonus"
                      v-bind="extensive_vacation_bonusProps"
                      label="Prima vacacional ampliada"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="top_christmas_bonus"
                      v-bind="top_christmas_bonusProps"
                      label="Aguinaldo superior a la ley"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="flexible_hours"
                      v-bind="flexible_hoursProps"
                      label="Flexibilidad en los horarios"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="major_medical_expenses"
                      v-bind="major_medical_expensesProps"
                      label="Gastos médicos mayores"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="transportation_help"
                      v-bind="transportation_helpProps"
                      label="Ayuda o servicios de transporte (vales de gasolina, transporte)"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="automobile"
                      v-bind="automobileProps"
                      label="Automóvil"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="loans"
                      v-bind="loansProps"
                      label="Préstamos y/o créditos"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="life_insurance"
                      v-bind="life_insuranceProps"
                      label="Seguro de vida"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-checkbox
                      v-model="other"
                      v-bind="otherProps"
                      label="Otro"
                      density="comfortable"
                    ></v-checkbox>
                    <v-text-field
                      v-if="other"
                      v-model="benefit_description"
                      v-bind="benefit_descriptionProps"
                      label="Especificar"
                      :disabled="other ? false : true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-btn color="grey" @click="back">Atrás</v-btn>
                    <v-btn color="primary" @click="next">Siguiente</v-btn>
                  </v-row>
                </v-col>
              </v-stepper-window-item>

              <v-stepper-window-item :value="4">
                <v-row>
                  <v-col cols="12" md="12">
                    <b>Horario laboral (24 hrs):</b>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="start_day"
                      :items="daysValue"
                      v-bind="start_dayProps"
                      item-title="text"
                      item-value="value"
                      label="Día laboral inicio"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="end_day"
                      :items="daysValue"
                      v-bind="end_dayProps"
                      item-title="text"
                      item-value="value"
                      label="Día laboral fin"
                    ></v-select>
                  </v-col>
                  <!-- Hora de inicio -->
                  <v-col cols="12" md="6">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de inicio:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="start_hour"
                          v-bind="start_hourProps"
                          :items="hours"
                          label="Hora"
                          :error="!!startHourError"
                          :error-messages="startHourError"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="start_minute"
                          v-bind="start_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :error="!!startMinuteError"
                          :error-messages="startMinuteError"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <!-- Hora de inicio -->
                  <v-col cols="12" md="6">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de término:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="end_hour"
                          v-bind="end_hourProps"
                          :items="hours"
                          label="Hora"
                          :error="!!endHourError"
                          :error-messages="endHourError"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="end_minute"
                          v-bind="end_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :error="!!endMinuteError"
                          :error-messages="endMinuteError"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="12">
                    <v-checkbox
                      v-model="saturday_hour"
                      v-bind="saturday_hourProps"
                      label="Horario de Sábados"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>

                  <!-- Hora de inicio -->
                  <v-col cols="12" md="6" v-if="saturday_hour">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de inicio:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="saturday_start_hour"
                          v-bind="saturday_start_hourProps"
                          :items="hours"
                          label="Hora"
                          :disabled="saturday_hour ? false : true"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="saturday_start_minute"
                          v-bind="saturday_start_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :disabled="saturday_hour ? false : true"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <!-- Hora de término -->
                  <v-col cols="12" md="6" v-if="saturday_hour">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de término:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="saturday_end_hour"
                          v-bind="saturday_end_hourProps"
                          :items="hours"
                          label="Hora"
                          :disabled="saturday_hour ? false : true"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="saturday_end_minute"
                          v-bind="saturday_end_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :disabled="saturday_hour ? false : true"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="12">
                    <v-checkbox
                      v-model="sunday_hour"
                      v-bind="sunday_hourProps"
                      label="Horario de Domingos"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>

                  <!-- Hora de inicio -->
                  <v-col cols="12" md="6" v-if="sunday_hour">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de inicio:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="sunday_start_hour"
                          v-bind="sunday_start_hourProps"
                          :items="hours"
                          label="Hora"
                          :disabled="sunday_hour ? false : true"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="sunday_start_minute"
                          v-bind="sunday_start_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :disabled="sunday_hour ? false : true"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <!-- Hora de término -->
                  <v-col cols="12" md="6" v-if="sunday_hour">
                    <p
                      style="
                        padding-bottom: 10px;
                        padding-top: 0px;
                        font-weight: 600;
                      "
                    >
                      Hora de término:
                    </p>
                    <v-row>
                      <v-col
                        cols="12"
                        class="d-flex align-center justify-center p-0"
                      >
                        <v-select
                          v-model="sunday_end_hour"
                          v-bind="sunday_end_hourProps"
                          :items="hours"
                          label="Hora"
                          :disabled="sunday_hour ? false : true"
                        ></v-select>
                        <span class="px-4" style="font-size: x-large">:</span>

                        <v-select
                          v-model="sunday_end_minute"
                          v-bind="sunday_end_minuteProps"
                          :items="minutes"
                          label="Minutos"
                          :disabled="sunday_hour ? false : true"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="12">
                    <v-textarea
                      v-model="additional_time_info"
                      v-bind="additional_time_infoProps"
                      label="Información adicional respecto al horario"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="12">
                    <b>Conocimientos:</b>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-checkbox
                      v-model="experience"
                      v-bind="experienceProps"
                      label="¿Necesita experiencia?"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="12" v-if="experience">
                    <v-textarea
                      v-model="experience_description"
                      v-bind="experience_descriptionProps"
                      label="Especificar"
                      rows="3"
                      :disabled="experience ? false : true"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-checkbox
                      v-model="software_use"
                      v-bind="software_useProps"
                      label="Manejo de software"
                      density="comfortable"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12" md="12" v-if="software_use">
                    <v-textarea
                      v-model="software_description"
                      v-bind="software_descriptionProps"
                      label="Software requerido"
                      rows="3"
                      :disabled="software_use ? false : true"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="12">
                    <v-textarea
                      v-model="skills"
                      v-bind="skillsProps"
                      label="Habilidades y/o competencias"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="12">
                    <small>
                      <b>Ej:</b> Requisitos adicionales, tipo de contrato,
                      documentos necesarios (INE, RFC, CURP, comprobante de
                      domicilio), disponibilidad de horario o cualquier otra
                      información relevante.</small
                    >
                    <v-textarea
                      v-model="observations"
                      v-bind="observationsProps"
                      label="Observaciones"
                      rows="3"
                    ></v-textarea>
                  </v-col>
                </v-row>
                <v-col class="my-5" cols="12" md="12">
                  <v-row justify="space-between">
                    <v-btn color="grey" @click="back">Atrás</v-btn>
                    <v-btn
                      color="success"
                      :disabled="!meta.valid"
                      :loading="loading"
                      @click="save"
                      >Finalizar</v-btn
                    >
                  </v-row>
                </v-col>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { toTypedSchema } from "@vee-validate/yup";
import { PublicPathState, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useBusinessSearchStore } from "@/stores/views/businessSearch";

import * as yup from "yup";

import * as validations from "@/validations";

import { daysValue, modeArray } from "@/constants";

const { businessList } = storeToRefs(useBusinessSearchStore());
const { getBusiness } = useBusinessSearchStore();

const vuetifyConfig = (state: PublicPathState) => ({
  props: {
    "error-messages": state.errors,
  },
});

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
});

const { defineField, meta, values, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      mode: validations.mode(),
      category: validations.category(),
      vacant_name: validations.vacant_name(),
      activities: validations.activities(),
      study_profile: validations.study_profile(),
      net_salary: validations.net_salary(),
      start_day: validations.start_day(),
      end_day: validations.end_day(),
      start_hour: validations.start_hour(),
      start_minute: validations.start_minute(),
      end_hour: validations.end_hour(),
      end_minute: validations.end_minute(),

      saturday_hour: validations.saturday_hour(),
      saturday_start_hour: validations.saturday_start_hour(),
      saturday_start_minute: validations.saturday_start_minute(),
      saturday_end_hour: validations.saturday_end_hour(),
      saturday_end_minute: validations.saturday_end_minute(),

      sunday_hour: validations.sunday_hour(),
      sunday_start_hour: validations.sunday_start_hour(),
      sunday_start_minute: validations.sunday_start_minute(),
      sunday_end_hour: validations.sunday_end_hour(),
      sunday_end_minute: validations.sunday_end_minute(),

      additional_time_info: validations.additional_time_info(),
      experience: validations.experience(),
      experience_description: validations.experience_description(),
      software_use: validations.software_use(),
      software_description: validations.software_description(),
      skills: validations.skills(),
      observations: validations.observations(),

      utilities: validations.utilities(),
      bonuses: validations.bonuses(),
      dining_room: validations.dining_room(),
      savings_fund: validations.savings_fund(),
      grocery_vouchers: validations.grocery_vouchers(),
      extensive_vacation_bonus: validations.extensive_vacation_bonus(),
      top_christmas_bonus: validations.top_christmas_bonus(),
      flexible_hours: validations.flexible_hours(),
      major_medical_expenses: validations.major_medical_expenses(),
      transportation_help: validations.transportation_help(),
      automobile: validations.automobile(),
      loans: validations.loans(),
      life_insurance: validations.life_insurance(),
      other: validations.other(),
      benefit_description: validations.benefit_description(),
    })
  ),
});

const [vacant_name, vacant_nameProps] = defineField(
  "vacant_name",
  vuetifyConfig
);
const [mode, modeProps] = defineField("mode", vuetifyConfig);
const [activities, activitiesProps] = defineField("activities", vuetifyConfig);
const [study_profile, study_profileProps] = defineField(
  "study_profile",
  vuetifyConfig
);
const [net_salary, net_salaryProps] = defineField("net_salary", vuetifyConfig);
const [start_day, start_dayProps] = defineField("start_day", vuetifyConfig);
const [end_day, end_dayProps] = defineField("end_day", vuetifyConfig);
const [start_hour, start_hourProps] = defineField("start_hour");
const [start_minute, start_minuteProps] = defineField("start_minute");
const [end_hour, end_hourProps] = defineField("end_hour");
const [end_minute, end_minuteProps] = defineField("end_minute");

const [saturday_hour, saturday_hourProps] = defineField(
  "saturday_hour",
  vuetifyConfig
);
const [saturday_start_hour, saturday_start_hourProps] = defineField(
  "saturday_start_hour"
);
const [saturday_start_minute, saturday_start_minuteProps] = defineField(
  "saturday_start_minute"
);
const [saturday_end_hour, saturday_end_hourProps] =
  defineField("saturday_end_hour");
const [saturday_end_minute, saturday_end_minuteProps] = defineField(
  "saturday_end_minute"
);

const [sunday_hour, sunday_hourProps] = defineField(
  "sunday_hour",
  vuetifyConfig
);
const [sunday_start_hour, sunday_start_hourProps] =
  defineField("sunday_start_hour");
const [sunday_start_minute, sunday_start_minuteProps] = defineField(
  "sunday_start_minute"
);
const [sunday_end_hour, sunday_end_hourProps] = defineField("sunday_end_hour");
const [sunday_end_minute, sunday_end_minuteProps] =
  defineField("sunday_end_minute");

const [additional_time_info, additional_time_infoProps] = defineField(
  "additional_time_info",
  vuetifyConfig
);
const [experience, experienceProps] = defineField("experience", vuetifyConfig);
const [experience_description, experience_descriptionProps] = defineField(
  "experience_description",
  vuetifyConfig
);
const [software_use, software_useProps] = defineField(
  "software_use",
  vuetifyConfig
);
const [software_description, software_descriptionProps] = defineField(
  "software_description",
  vuetifyConfig
);
const [skills, skillsProps] = defineField("skills", vuetifyConfig);
const [observations, observationsProps] = defineField(
  "observations",
  vuetifyConfig
);

const [utilities, utilitiesProps] = defineField("utilities", vuetifyConfig);
const [bonuses, bonusesProps] = defineField("bonuses", vuetifyConfig);
const [dining_room, dining_roomProps] = defineField(
  "dining_room",
  vuetifyConfig
);
const [savings_fund, savings_fundProps] = defineField(
  "savings_fund",
  vuetifyConfig
);
const [grocery_vouchers, grocery_vouchersProps] = defineField(
  "grocery_vouchers",
  vuetifyConfig
);
const [extensive_vacation_bonus, extensive_vacation_bonusProps] = defineField(
  "extensive_vacation_bonus",
  vuetifyConfig
);
const [top_christmas_bonus, top_christmas_bonusProps] = defineField(
  "top_christmas_bonus",
  vuetifyConfig
);
const [flexible_hours, flexible_hoursProps] = defineField(
  "flexible_hours",
  vuetifyConfig
);
const [major_medical_expenses, major_medical_expensesProps] = defineField(
  "major_medical_expenses",
  vuetifyConfig
);
const [transportation_help, transportation_helpProps] = defineField(
  "transportation_help",
  vuetifyConfig
);
const [automobile, automobileProps] = defineField("automobile", vuetifyConfig);
const [loans, loansProps] = defineField("loans", vuetifyConfig);
const [life_insurance, life_insuranceProps] = defineField(
  "life_insurance",
  vuetifyConfig
);
const [other, otherProps] = defineField("other", vuetifyConfig);
const [benefit_description, benefit_descriptionProps] = defineField(
  "benefit_description",
  vuetifyConfig
);

const validateStep1 = computed(() => {
  return selectedBusiness.value ? false : true;
});

const validateStep3 = computed(() => {
  return start_day.value &&
    end_day.value &&
    start_hour.value &&
    end_hour.value &&
    end_minute.value &&
    skills.value
    ? false
    : true;
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [value: Object];
}>();

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      resetForm();
      step.value = 1;
    } else {
      setValues({
        category: "JOB_POSITION",
      });
    }
  }
);

const step = ref(1);
const close = () => {
  emit("update:modelValue", false);
};

const next = () => {
  step.value++;
};

const back = () => {
  step.value--;
};

const hours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
});

const minutes = computed(() => {
  return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
});

const onlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  // Permite solo números (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const startHourError = computed(() => errors.value.start_hour);
const startMinuteError = computed(() => errors.value.start_minute);
const endHourError = computed(() => errors.value.end_hour);
const endMinuteError = computed(() => errors.value.end_minute);

const searchQuery = ref("");
const selectedBusiness = ref(null);
let timeout = null;

watch(searchQuery, (newQuery) => {
  clearTimeout(timeout);

  if (!newQuery || newQuery.length < 3) {
    businessList.value = [];
    return;
  }

  timeout = setTimeout(() => {
    getBusiness(newQuery);
  }, 500);
});

const save = () => {
  if (meta.value.valid && selectedBusiness.value) {
    emit("submit", { ...values, id: selectedBusiness.value });
  }
};
</script>

<style scoped></style>
