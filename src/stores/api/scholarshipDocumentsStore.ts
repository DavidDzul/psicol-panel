import axios from "@/axiosConfig";
import { isAxiosError } from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAlertStore } from "@/stores/alert";
import type { StudentDocument } from "@/interfaces/scholarship";
import type {
  ScholarshipDocumentsResponse,
  ScholarshipDocumentResponse,
} from "@/interfaces/api";

export const useScholarshipDocumentsStore = defineStore("scholarshipDocumentsStore", () => {
  const { showAlert } = useAlertStore();

  const documents = ref<Map<number, StudentDocument>>(new Map());

  const fetchDocuments = async (
    userId: number,
    year?: number,
    month?: number
  ): Promise<StudentDocument[]> => {
    try {
      const res = await axios.get<ScholarshipDocumentsResponse>(
        `api/admin/scholarship-documents/user/${userId}`,
        { params: { year, month } }
      );
      const list = res.data.data;
      const newMap = new Map(documents.value);
      list.forEach((d) => newMap.set(d.id, d));
      documents.value = newMap;
      return list;
    } catch {
      showAlert({ title: "Error al cargar documentos.", status: "error" });
      return [];
    }
  };

  const uploadDocument = async (formData: FormData): Promise<StudentDocument | undefined> => {
    try {
      const res = await axios.post<ScholarshipDocumentResponse>(
        "api/admin/scholarship-documents/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const doc = res.data.data;
      const newMap = new Map(documents.value);
      newMap.set(doc.id, doc);
      documents.value = newMap;
      showAlert({ title: "Documento subido exitosamente.", status: "success" });
      return doc;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { message?: string })?.message ?? "Error al subir documento.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
    }
  };

  const acceptDocument = async (id: number): Promise<StudentDocument | undefined> => {
    try {
      const res = await axios.put<ScholarshipDocumentResponse>(
        `api/admin/scholarship-documents/${id}/accept`
      );
      return _merge(res.data.data);
    } catch {
      showAlert({ title: "Error al aceptar documento.", status: "error" });
    }
  };

  const rejectDocument = async (id: number, reason: string): Promise<StudentDocument | undefined> => {
    try {
      const res = await axios.put<ScholarshipDocumentResponse>(
        `api/admin/scholarship-documents/${id}/reject`,
        { reason }
      );
      return _merge(res.data.data);
    } catch {
      showAlert({ title: "Error al rechazar documento.", status: "error" });
    }
  };

  const deleteDocument = async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`api/admin/scholarship-documents/${id}`);
      const newMap = new Map(documents.value);
      newMap.delete(id);
      documents.value = newMap;
      showAlert({ title: "Documento eliminado.", status: "success" });
      return true;
    } catch (error: unknown) {
      const msg = isAxiosError(error)
        ? ((error.response?.data as { msg?: string })?.msg ?? "Error al eliminar documento.")
        : "Error de red.";
      showAlert({ title: msg, status: "error" });
      return false;
    }
  };

  const _merge = (doc: StudentDocument): StudentDocument => {
    const newMap = new Map(documents.value);
    newMap.set(doc.id, doc);
    documents.value = newMap;
    return doc;
  };

  return {
    documents,
    fetchDocuments,
    uploadDocument,
    acceptDocument,
    rejectDocument,
    deleteDocument,
  };
});
