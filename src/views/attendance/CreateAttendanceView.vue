<template>
  <v-row>
    <v-col cols="12">
      <div class="scanner-wrapper">
        <!-- Lector QR fullscreen -->
        <div id="reader" class="scanner-wrapper"></div>

        <!-- Botones flotantes -->
        <div class="scanner-buttons">
          <v-btn v-if="!isScanning" color="primary" icon @click="startScanner">
            <v-icon>mdi-play</v-icon>
          </v-btn>

          <v-btn v-if="isScanning" color="red" icon @click="stopScanner">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
        </div>

        <!-- Dialog de resultados -->
        <v-dialog v-model="dialogOpen" max-width="600" persistent>
          <v-card
            :color="
              dialogData?.attendance
                ? dialogData.attendance.status === 'LATE'
                  ? 'red-lighten-5'
                  : 'green-lighten-5'
                : dialogData?.type === 'success'
                  ? 'green-lighten-5'
                  : 'red-lighten-5'
            "
            class="pa-4"
          >
            <!-- Encabezado -->

            <!-- Contenido detallado -->
            <v-card-text v-if="dialogData?.attendance" class="pt-2 text-center">
              <!-- <v-icon
                :color="dialogData?.type === 'success' ? 'green' : 'red'"
                size="20"
              >
                {{
                  dialogData?.type === "success"
                    ? "mdi-check-circle"
                    : "mdi-alert-circle"
                }}
              </v-icon> -->
              <span
                class="text-h6 font-weight-medium"
                :style="{
                  color:
                    dialogData?.attendance?.status === 'LATE'
                      ? 'orange'
                      : dialogData?.type === 'success'
                        ? 'green'
                        : 'red',
                }"
              >
                {{ dialogData?.message }}
              </span>
              <!-- Nombre del usuario destacado -->
              <div class="text-h5 font-weight-medium mb-2 mt-5">
                {{ dialogData.attendance.user.first_name }}
                {{ dialogData.attendance.user.last_name }}
              </div>

              <!-- Estatus con color -->
              <v-chip
                :color="
                  dialogData.attendance.status === 'LATE' ? 'error' : 'green'
                "
                text-color="white"
                class="mb-4"
              >
                {{
                  dialogData.attendance.status === "LATE"
                    ? "Retardo"
                    : "A tiempo"
                }}
              </v-chip>

              <!-- Detalles en formato limpio -->
              <v-row dense>
                <v-col cols="12">
                  <strong>📚 Sesión:</strong>
                  <div>{{ dialogData.attendance.class.name }}</div>
                </v-col>

                <v-col cols="12">
                  <strong>🕓 Hora de entrada:</strong>
                  <div>{{ dialogData.attendance.check_in }}</div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text v-else class="text-center">
              <v-icon color="red" size="28" class="mb-2"
                >mdi-alert-circle</v-icon
              >
              <div class="text-h6 font-weight-medium text-red">
                {{ dialogData?.message || "Ocurrió un error inesperado." }}
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { useCheckPageStore } from "@/stores/views/checkPage";
import { storeToRefs } from "pinia";

const isScanning = ref(false);
let html5QrCode: Html5Qrcode | null = null;
let isProcessing = false;

const dialogOpen = ref(false);
const dialogData = ref<{
  type: string;
  message: string;
  attendance?: any;
} | null>(null);

const { onCreateCheckIn } = useCheckPageStore();

async function startScanner() {
  if (isScanning.value) return;

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 400, height: 400 },
        aspectRatio: 1.7778,
      },
      async (decodedText) => {
        if (!isProcessing) {
          isProcessing = true;
          html5QrCode?.pause();

          try {
            const res = await onCreateCheckIn(decodedText);

            dialogData.value = {
              type: "success",
              message: "Entrada registrada",
              attendance: res.attendance,
            };
          } catch (err: any) {
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "❌ QR inválido o caducado";
            dialogData.value = {
              type: "error",
              message: msg,
            };
          }

          dialogOpen.value = true;

          // Cerrar diálogo automáticamente después de 3s y reanudar escaneo
          setTimeout(async () => {
            dialogOpen.value = false;
            dialogData.value = null;
            await html5QrCode?.resume();
            isProcessing = false;
          }, 13000);
        }
      },
      () => {},
    );

    isScanning.value = true;
  } catch (err) {
    dialogData.value = {
      type: "error",
      message: "No se pudo iniciar la cámara 📷",
    };
    dialogOpen.value = true;
  }
}

async function stopScanner() {
  if (html5QrCode && isScanning.value) {
    await html5QrCode.stop();
    html5QrCode.clear();
    isScanning.value = false;
    html5QrCode = null;
  }
}

onUnmounted(() => {
  stopScanner();
});
</script>

<style scoped>
.scanner-wrapper {
  width: 100%;
  height: calc(100vh - 100px);
  position: relative;
  overflow: hidden;
  background: black;
  /* border: 2px solid #ff7900; */
  border-radius: 10px;
}

/* Video espejo */
:deep(#reader video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

/* Botones flotantes */
.scanner-buttons {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}
</style>
