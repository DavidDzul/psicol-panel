import { afterEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  selectCampusGenerations,
  useSedeRefrendGeneration,
} from "@/composables/useSedeRefrendGeneration";
import { useGenerationsStore } from "@/stores/api/generationStore";
import type { Generation } from "@/interfaces/generation";
import type { GenerateRefrendsResult } from "@/interfaces/scholarship";

// ── Test harness ─────────────────────────────────────────────────────────────
//
// sdd/verificacion-incidencias-ux PR3 (design): the composable loops over
// the generaciones whose campus matches the selected sede, sorted by name, and
// sdd/generaciones-activas-refrendos: ONLY active ones — the API guard now
// guarantees an inactive generación has no becarios with pending payments, so
// skipping them cannot silently drop real becarios. It
// calls scholarshipStore.generatePeriod SEQUENTIALLY, one request in flight
// at a time. scholarshipStore is mocked at the module boundary (it now
// returns a typed result and rethrows on failure, see
// scholarshipStore.generatePeriod.test.ts) — this file exercises ONLY the
// composable's own orchestration: ordering, progress, continue-on-reject,
// aggregation, and the campus filter.

const generatePeriod = vi.fn<
  (form: {
    year: number;
    month: number;
    campus: string;
    generation_id: number;
  }) => Promise<GenerateRefrendsResult>
>();

vi.mock("@/stores/api/scholarshipStore", () => ({
  useScholarshipStore: () => ({ generatePeriod }),
}));

const buildGeneration = (overrides: Partial<Generation> = {}): Generation => ({
  id: 1,
  campus: "CDMX",
  generation_active: true,
  generation_name: "Gen A",
  ...overrides,
});

const buildResult = (
  overrides: Partial<GenerateRefrendsResult> = {},
): GenerateRefrendsResult => ({
  created: 1,
  skipped: 0,
  skipped_out_of_reticula: 0,
  errors: 0,
  failures: [],
  ...overrides,
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── selectCampusGenerations (pure helper) ───────────────────────────────────

describe("selectCampusGenerations", () => {
  it("keeps only generaciones matching the given campus", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_name: "Gen A" }),
      buildGeneration({ id: 2, campus: "MTY", generation_name: "Gen B" }),
    ];

    expect(selectCampusGenerations(generations, "CDMX")).toEqual([
      generations[0],
    ]);
  });

  it("sorts the result by generation_name", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_name: "Gen Z" }),
      buildGeneration({ id: 2, campus: "CDMX", generation_name: "Gen A" }),
    ];

    expect(selectCampusGenerations(generations, "CDMX").map((g) => g.id)).toEqual([
      2, 1,
    ]);
  });

  it("sorts numeric generation names numerically (2 before 19)", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_name: "19" }),
      buildGeneration({ id: 2, campus: "CDMX", generation_name: "2" }),
      buildGeneration({ id: 3, campus: "CDMX", generation_name: "1" }),
    ];

    expect(selectCampusGenerations(generations, "CDMX").map((g) => g.id)).toEqual([
      3, 2, 1,
    ]);
  });

  it("does not crash when the API returns generation_name as a number", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_name: 19 as unknown as string }),
      buildGeneration({ id: 2, campus: "CDMX", generation_name: 2 as unknown as string }),
    ];

    expect(selectCampusGenerations(generations, "CDMX").map((g) => g.id)).toEqual([
      2, 1,
    ]);
  });

  it("excludes inactive generaciones of the campus (generation_active filter)", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_active: false, generation_name: "Gen A" }),
      buildGeneration({ id: 2, campus: "CDMX", generation_active: true, generation_name: "Gen B" }),
    ];

    expect(selectCampusGenerations(generations, "CDMX").map((g) => g.id)).toEqual([2]);
  });

  it("returns an empty list when every generación of the campus is inactive", () => {
    const generations = [
      buildGeneration({ id: 1, campus: "CDMX", generation_active: false }),
      buildGeneration({ id: 2, campus: "MTY", generation_active: true }),
    ];

    expect(selectCampusGenerations(generations, "CDMX")).toEqual([]);
  });
});

// ── useSedeRefrendGeneration.run ─────────────────────────────────────────────

describe("useSedeRefrendGeneration — run", () => {
  const setup = (generations: Generation[]) => {
    setActivePinia(createPinia());
    const generationsStore = useGenerationsStore();
    // NOTE: `generationsStore` is the reactive Pinia store PROXY, which
    // auto-unwraps top-level refs — assigning through `.resGenerations.value`
    // would read the already-unwrapped Map and bolt a stray "value" property
    // onto it instead of replacing the ref's contents (silently leaves the
    // real ref's Map empty). Assign directly to the unwrapped property so
    // Vue's auto-unwrap setter forwards it to the underlying ref.
    generationsStore.resGenerations = new Map(
      generations.map((g) => [g.id, g]),
    );
    return useSedeRefrendGeneration();
  };

  it("calls generatePeriod sequentially, once per generación of the sede, sorted by name", async () => {
    const gens = [
      buildGeneration({ id: 2, campus: "CDMX", generation_name: "Gen B" }),
      buildGeneration({ id: 1, campus: "CDMX", generation_name: "Gen A" }),
      buildGeneration({ id: 3, campus: "MTY", generation_name: "Gen C" }),
    ];
    const composable = setup(gens);
    generatePeriod.mockResolvedValue(buildResult());

    await composable.run("CDMX", 2026, 10);

    expect(generatePeriod).toHaveBeenCalledTimes(2);
    expect(generatePeriod.mock.calls[0][0]).toEqual({
      year: 2026,
      month: 10,
      campus: "CDMX",
      generation_id: 1,
    });
    expect(generatePeriod.mock.calls[1][0]).toEqual({
      year: 2026,
      month: 10,
      campus: "CDMX",
      generation_id: 2,
    });
  });

  it("never has two generatePeriod calls in flight at the same time (true sequential, not Promise.all)", async () => {
    const gens = [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ];
    const composable = setup(gens);
    let inFlight = 0;
    let maxInFlight = 0;
    generatePeriod.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 0));
      inFlight -= 1;
      return buildResult();
    });

    await composable.run("CDMX", 2026, 10);

    expect(maxInFlight).toBe(1);
  });

  it("updates progress (currentIndex/total/currentGenerationName/progressText) as each generación is processed", async () => {
    const gens = [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ];
    const composable = setup(gens);
    const progressSnapshots: (string | null)[] = [];
    generatePeriod.mockImplementation(async () => {
      progressSnapshots.push(composable.progressText.value);
      return buildResult();
    });

    expect(composable.running.value).toBe(false);
    expect(composable.progressText.value).toBeNull();

    await composable.run("CDMX", 2026, 10);

    expect(progressSnapshots).toEqual([
      "Generando 1 de 2: Gen A…",
      "Generando 2 de 2: Gen B…",
    ]);
    // Finished: no longer running, progress text clears.
    expect(composable.running.value).toBe(false);
    expect(composable.progressText.value).toBeNull();
    expect(composable.total.value).toBe(2);
    expect(composable.currentIndex.value).toBe(2);
  });

  it("continues to the next generación when one request rejects, recording a requestError summary for it", async () => {
    const gens = [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
      buildGeneration({ id: 3, generation_name: "Gen C" }),
    ];
    const composable = setup(gens);
    generatePeriod
      .mockResolvedValueOnce(buildResult({ created: 5 }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(buildResult({ created: 2 }));

    const summaries = await composable.run("CDMX", 2026, 10);

    expect(generatePeriod).toHaveBeenCalledTimes(3);
    expect(summaries).toEqual([
      { generationId: 1, generationName: "Gen A", result: buildResult({ created: 5 }) },
      { generationId: 2, generationName: "Gen B", requestError: "network down" },
      { generationId: 3, generationName: "Gen C", result: buildResult({ created: 2 }) },
    ]);
  });

  it("aggregates the final summaries into the exposed `summaries` ref", async () => {
    const gens = [buildGeneration({ id: 1, generation_name: "Gen A" })];
    const composable = setup(gens);
    generatePeriod.mockResolvedValue(buildResult({ created: 7 }));

    expect(composable.summaries.value).toEqual([]);

    await composable.run("CDMX", 2026, 10);

    expect(composable.summaries.value).toEqual([
      { generationId: 1, generationName: "Gen A", result: buildResult({ created: 7 }) },
    ]);
  });

  it("skips inactive generaciones: generatePeriod is never called for them", async () => {
    const gens = [
      buildGeneration({ id: 1, generation_name: "Gen A", generation_active: false }),
      buildGeneration({ id: 2, generation_name: "Gen B", generation_active: true }),
    ];
    const composable = setup(gens);
    generatePeriod.mockResolvedValue(buildResult());

    await composable.run("CDMX", 2026, 10);

    expect(generatePeriod).toHaveBeenCalledTimes(1);
    expect(generatePeriod.mock.calls[0][0].generation_id).toBe(2);
    expect(composable.total.value).toBe(1);
  });

  it("only loops generaciones of the selected campus, ignoring other sedes", async () => {
    const gens = [
      buildGeneration({ id: 1, campus: "CDMX" }),
      buildGeneration({ id: 2, campus: "MTY" }),
      buildGeneration({ id: 3, campus: "GDL" }),
    ];
    const composable = setup(gens);
    generatePeriod.mockResolvedValue(buildResult());

    await composable.run("MTY", 2026, 10);

    expect(generatePeriod).toHaveBeenCalledTimes(1);
    expect(generatePeriod.mock.calls[0][0].generation_id).toBe(2);
  });

  it("resets progress/summaries on a retry run instead of accumulating duplicates across runs", async () => {
    const gens = [
      buildGeneration({ id: 1, generation_name: "Gen A" }),
      buildGeneration({ id: 2, generation_name: "Gen B" }),
    ];
    const composable = setup(gens);
    generatePeriod
      .mockResolvedValueOnce(buildResult({ created: 1 }))
      .mockRejectedValueOnce(new Error("timeout"));

    await composable.run("CDMX", 2026, 10);
    expect(composable.summaries.value).toHaveLength(2);
    expect(
      composable.summaries.value.some((s) => s.requestError === "timeout"),
    ).toBe(true);

    generatePeriod.mockReset();
    generatePeriod.mockResolvedValue(buildResult({ created: 1 }));

    const retrySummaries = await composable.run("CDMX", 2026, 10);

    // Exactly one entry per generación — the retry does not keep the
    // previous run's failed entry alongside the new one.
    expect(retrySummaries).toHaveLength(2);
    expect(composable.summaries.value).toHaveLength(2);
    expect(composable.summaries.value.every((s) => s.result !== undefined)).toBe(
      true,
    );
    expect(generatePeriod).toHaveBeenCalledTimes(2);
  });
});
