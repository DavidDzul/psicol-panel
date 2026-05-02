import { defineStore, storeToRefs } from "pinia";
import { useJobApplicationsStore } from "@/stores/api/jobApplicationsStore";
import { useAppStore } from "@/stores/app";
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/api/authStore";

import type { JobApplication } from "@/interfaces/jobApplication";
import type { LinkInterface } from "@/interfaces/link.interface";

export const useJobAppliactionPageStore = defineStore(
  "jobAppliactionPage",
  () => {
    const { setLoading } = useAppStore();

    const { readApplication, editApplication } = storeToRefs(useAuthStore());
    const { resApplications } = storeToRefs(useJobApplicationsStore());
    const { fetchApplications, dowloandCV, updateStatusApplications } =
      useJobApplicationsStore();

    const router = useRouter();
    const selectedApplication = ref<number | null>(null);
    const businessRejectedDialog = ref<boolean>(false);
    const loadingCV = ref<boolean>(false);
    const loadingRejected = ref<boolean>(false);
    const loadingTable = ref<boolean>(false);

    onBeforeMount(async () => {
      loadingTable.value = true;
      await fetchApplications();
      loadingTable.value = false;
    });

    const links = computed<LinkInterface[]>(() => [
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
    ]);

    const applications = computed<JobApplication[]>(() => [
      ...resApplications.value.values(),
    ]);

    const openBusinessRejectedDialog = (id: number): void => {
      const data = resApplications.value.get(id);
      if (data) {
        selectedApplication.value = data.id;
        businessRejectedDialog.value = true;
      }
    };

    const openUserCV = async (userId: number): Promise<void> => {
      loadingCV.value = true;
      try {
        await dowloandCV(userId);
      } catch (error) {
        console.error(error);
      }
      loadingCV.value = false;
    };

    const onRejectedApplication = async (form: unknown): Promise<void> => {
      if (!selectedApplication.value) return;
      loadingRejected.value = true;
      try {
        const res = await updateStatusApplications(
          selectedApplication.value,
          form,
        );
        if (res) {
          selectedApplication.value = null;
          businessRejectedDialog.value = false;
        }
      } catch (e) {
        console.error(e);
      }
      loadingRejected.value = false;
    };

    const onAcceptedApplication = async (id: number): Promise<void> => {
      try {
        await updateStatusApplications(id, {
          status: "ACCEPTED",
        });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      links,
      loadingCV,
      applications,
      loadingRejected,
      businessRejectedDialog,
      readApplication,
      editApplication,
      loadingTable,
      openBusinessRejectedDialog,
      onRejectedApplication,
      openUserCV,
      onAcceptedApplication,
    };
  },
);
