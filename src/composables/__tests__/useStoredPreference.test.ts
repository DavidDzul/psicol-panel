// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { uiPreferenceKey, useStoredPreference } from "@/composables/useStoredPreference";

// Vitest's default environment is `node` (vite.config.ts) — `localStorage`
// does not exist there. This file opts into jsdom via the docblock above,
// same pattern as RefrendSituationBar.test.ts.

describe("uiPreferenceKey", () => {
  it("builds a namespaced key from scope and pref", () => {
    expect(uiPreferenceKey("pedagogia-refrend-table", "optional-columns")).toBe(
      "impulsou.ui.pedagogia-refrend-table.optional-columns",
    );
  });
});

describe("useStoredPreference", () => {
  const KEY = "impulsou.ui.test-scope.test-pref";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns the default value when nothing is stored", () => {
    const state = useStoredPreference<string[]>(KEY, []);
    expect(state.value).toEqual([]);
  });

  it("persists a written value and reads it back on a new instance (simulated remount)", async () => {
    const first = useStoredPreference<string[]>(KEY, []);
    first.value = ["snapshot_monto_apoyo"];
    await nextTick();

    const second = useStoredPreference<string[]>(KEY, []);
    expect(second.value).toEqual(["snapshot_monto_apoyo"]);
  });

  it("falls back to the default value when stored JSON is corrupted", () => {
    localStorage.setItem(KEY, "{not-valid-json");

    const state = useStoredPreference<string[]>(KEY, ["default"]);

    expect(state.value).toEqual(["default"]);
  });

  it("falls back to the default value when the stored shape fails the isValid guard", () => {
    localStorage.setItem(KEY, JSON.stringify({ legacy: true }));
    const isStringArray = (raw: unknown): raw is string[] =>
      Array.isArray(raw) && raw.every((v) => typeof v === "string");

    const state = useStoredPreference<string[]>(KEY, ["default"], isStringArray);

    expect(state.value).toEqual(["default"]);
  });

  it("degrades gracefully to the default value when localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: access is denied for this document");
    });

    const state = useStoredPreference<string[]>(KEY, ["default"]);

    expect(state.value).toEqual(["default"]);
  });

  it("degrades gracefully without throwing or crashing when localStorage.setItem throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const state = useStoredPreference<string[]>(KEY, []);

    expect(() => {
      state.value = ["snapshot_monto_apoyo"];
    }).not.toThrow();
    await nextTick();
    expect(state.value).toEqual(["snapshot_monto_apoyo"]);
  });
});
