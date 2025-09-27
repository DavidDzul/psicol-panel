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
        <v-dialog v-model="dialogOpen" max-width="500" persistent>
          <v-card
            :color="
              dialogData?.type === 'success'
                ? 'green-lighten-5'
                : 'red-lighten-5'
            "
            class="pa-4"
          >
            <v-card-title class="d-flex align-center gap-2">
              <v-icon
                :color="dialogData?.type === 'success' ? 'green' : 'red'"
                size="28"
              >
                {{
                  dialogData?.type === "success"
                    ? "mdi-check-circle"
                    : "mdi-alert-circle"
                }}
              </v-icon>
              <span class="text-h6 font-weight-medium">{{
                dialogData?.message
              }}</span>
            </v-card-title>
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
          }, 3000);
        }
      },
      () => {}
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
