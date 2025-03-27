import { defineStore, storeToRefs } from "pinia";
import { useJobApplicationsStore } from "@/stores/api/jobApplicationsStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/api/authStore";

export const useJobAppliactionPageStore = defineStore("jobAppliactionPage", () => {
    const { setLoading } = useAppStore();

    const { readApplication,
        editApplication } = storeToRefs(useAuthStore())
    const { resApplications } = storeToRefs(useJobApplicationsStore());
    const { fetchApplications, dowloandCV, updateStatusApplications } = useJobApplicationsStore();

    const router = useRouter()
    const selectedApplication = ref(null)
    const businessRejectedDialog = ref(false)
    const loadingCV = ref(false)
    const loadingRejected = ref(false)

    onBeforeMount(async () => {
        await fetchApplications()
    })

    const links = computed(() => [
        {
            title: "Inicio",
            disabled: false,
            href: "/",
        },
        {
            title: "Postulaciones",
            disabled: true,
            href: "/postulaciones",
        },
    ])

    const applications = computed(() => [...resApplications.value.values()])

    const openBusinessRejectedDialog = (id) => {
        const data = resApplications.value.get(id)
        if (data) {
            selectedApplication.value = data.id
            businessRejectedDialog.value = true
        }
    }

    const openUserCV = async (userId) => {
        loadingCV.value = true
        try {
            await dowloandCV(userId)
        } catch (error) {
            console.log(error)
        }
        loadingCV.value = false
    }

    const onRejectedApplication = async (form) => {
        if (!selectedApplication.value) return
        loadingRejected.value = true
        try {
            const res = await updateStatusApplications(selectedApplication.value, form)
            if (res) {
                selectedApplication.value = null
                businessRejectedDialog.value = false
            }
        } catch (e) {
            console.error(e)
        }
        loadingRejected.value = false
    }

    const onAcceptedApplication = async (id) => {
        try {
            await updateStatusApplications(id, {
                status: "ACCEPTED",
            })
        } catch (e) {
            console.error(e)
        }
    }

    return {
        links,
        loadingCV,
        applications,
        loadingRejected,
        businessRejectedDialog,
        readApplication,
        editApplication,
        openBusinessRejectedDialog,
        onRejectedApplication,
        openUserCV,
        onAcceptedApplication,
    };
});