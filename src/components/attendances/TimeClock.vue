<template>
  <div>
    <div id="reader" style="width: 400px; margin: auto"></div>

    <p v-if="qrResult">Resultado: {{ qrResult }}</p>

    <div style="margin-top: 1rem">
      <button @click="startScanner" v-if="!isScanning">Iniciar escaneo</button>
      <button @click="stopScanner" v-if="isScanning">Detener escaneo</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { useAttendancePageStore } from "@/stores/views/attendancePage";
import { storeToRefs } from "pinia";

const qrResult = ref<string>("");
const errorMessage = ref<string>("");
const isScanning = ref<boolean>(false);
let html5QrCode: Html5Qrcode | null = null;
let isProcessing = false;

const { loading } = storeToRefs(useAttendancePageStore());
const { onCreateCheckIn } = useAttendancePageStore();

async function startScanner() {
  if (isScanning.value) return;

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (!isProcessing) {
          isProcessing = true;
          qrResult.value = decodedText;
          errorMessage.value = ""; // limpiar error anterior

          console.log("QR detectado:", decodedText);

          // 👉 Pausar escaneo mientras procesas
          await html5QrCode?.pause();

          try {
            await onCreateCheckIn(decodedText);
          } catch (err) {
            console.error("Error al procesar el QR:", err);
            errorMessage.value =
              "❌ QR inválido o caducado. Vuelve a intentar.";
          }

          // 👉 Reanudar con un pequeño delay
          setTimeout(async () => {
            await html5QrCode?.resume();
            isProcessing = false;
          }, 2000);
        }
      },
      () => {
        // se ejecuta cuando no detecta QR, lo dejamos vacío
      }
    );

    isScanning.value = true;
  } catch (err) {
    console.error("Error al iniciar cámara:", err);
    errorMessage.value = "No se pudo iniciar la cámara 📷";
  }
}

async function stopScanner() {
  if (html5QrCode && isScanning.value) {
    await html5QrCode.stop();
    await html5QrCode.clear();
    isScanning.value = false;
    html5QrCode = null;
  }
}

onUnmounted(() => {
  stopScanner();
});
</script>
<style scoped>
:deep(#reader video) {
  transform: scaleX(-1); /* espejo */
}
</style>
