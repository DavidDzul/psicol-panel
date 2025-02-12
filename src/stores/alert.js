import { defineStore } from "pinia"
import { ref } from "vue"

export const useAlertStore = defineStore("alertStore", () => {
    const show = ref(false)
    const config = ref({ title: "", body: "", status: "success", icon: "" })

    const showAlert = (conf) => {
        if (!show.value) {
            show.value = false
        }
        config.value = { ...conf }
        show.value = true
    }

    const $reset = () => {
        show.value = false
        config.value = { title: "", body: "", status: "success", icon: "" }
    }

    return {
        show,
        config,
        showAlert,
        $reset,
    }
})
