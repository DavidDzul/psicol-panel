import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "@/axiosConfig";
import { useScholarshipWithholdings } from "@/composables/useScholarshipWithholdings";

vi.mock("@/axiosConfig", () => ({ default: { get: vi.fn() } }));

afterEach(() => vi.clearAllMocks());

const row = { id: 1, status: "CANCELLED" };

describe("useScholarshipWithholdings", () => {
  it("loads every withholding (status=all) for the user", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [row] } });
    const { rows, loading, error, load } = useScholarshipWithholdings();

    const p = load(7);
    expect(loading.value).toBe(true);
    await p;

    expect(axios.get).toHaveBeenCalledWith("api/admin/users/7/scholarship-withholdings", {
      params: { status: "all" },
    });
    expect(rows.value).toEqual([row]);
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it("exposes an error message and empty rows when the request fails", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("boom"));
    const { rows, loading, error, load } = useScholarshipWithholdings();

    await load(7);

    expect(rows.value).toEqual([]);
    expect(loading.value).toBe(false);
    expect(error.value).toBe("No se pudieron cargar las retenciones.");
  });

  it("clears a previous error on a successful reload", async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error("boom"));
    const { error, load } = useScholarshipWithholdings();
    await load(7);
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { data: [] } });
    await load(7);
    expect(error.value).toBeNull();
  });
});
