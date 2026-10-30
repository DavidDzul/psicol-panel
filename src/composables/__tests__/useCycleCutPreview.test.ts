import { describe, expect, it, vi } from "vitest";
import { useCycleCutPreview } from "@/composables/useCycleCutPreview";
import type { CycleCutPreview } from "@/interfaces/scholarship";

const makePreview = (reason: string): CycleCutPreview => ({
  reason,
  can_cut: true,
  blockers: [],
  advance: { months: [], origins: [], cancelled_amount: "0.00", overpaid_amount: "0.00", advance_payment_reduction: "0.00" },
});

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

describe("useCycleCutPreview", () => {
  it("loads the preview and toggles loading", async () => {
    const d = deferred<CycleCutPreview | null>();
    const fetcher = vi.fn().mockReturnValue(d.promise);
    const { preview, loading, load } = useCycleCutPreview(fetcher);

    const p = load(1, "BAJA_DEFINITIVA");
    expect(loading.value).toBe(true);
    d.resolve(makePreview("BAJA_DEFINITIVA"));
    await p;

    expect(fetcher).toHaveBeenCalledWith(1, "BAJA_DEFINITIVA");
    expect(loading.value).toBe(false);
    expect(preview.value?.reason).toBe("BAJA_DEFINITIVA");
  });

  it("discards a stale response when reloaded for another refrend (S53)", async () => {
    const first = deferred<CycleCutPreview | null>();
    const second = deferred<CycleCutPreview | null>();
    const fetcher = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { preview, loading, load } = useCycleCutPreview(fetcher);

    const p1 = load(1, "BAJA_DEFINITIVA");
    const p2 = load(2, "EGRESADO");
    second.resolve(makePreview("EGRESADO"));
    await p2;
    first.resolve(makePreview("BAJA_DEFINITIVA"));
    await p1;

    expect(preview.value?.reason).toBe("EGRESADO");
    expect(loading.value).toBe(false);
  });

  it("reset clears state and discards the in-flight response", async () => {
    const d = deferred<CycleCutPreview | null>();
    const { preview, loading, load, reset } = useCycleCutPreview(vi.fn().mockReturnValue(d.promise));

    const p = load(1, "EGRESADO");
    reset();
    d.resolve(makePreview("EGRESADO"));
    await p;

    expect(preview.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it("leaves preview null when the fetch returns null (S52)", async () => {
    const { preview, load } = useCycleCutPreview(vi.fn().mockResolvedValue(null));
    await load(1, "EGRESADO");
    expect(preview.value).toBeNull();
  });
});
