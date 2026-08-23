import { ref, watch, type Ref } from "vue";

// ── UI preference key convention ─────────────────────────────────────────────
//
// `impulsou.ui.<scope>.<pref>` — this composable is generic; callers own the
// full key via `uiPreferenceKey()`. Pre-existing bare-string localStorage
// keys ("token" in authStore.ts / router/index.ts) are NOT migrated here.

export const uiPreferenceKey = (scope: string, pref: string): string =>
  `impulsou.ui.${scope}.${pref}`;

// ── Lazy, defensive localStorage access ──────────────────────────────────────
//
// Access happens inside these functions, never at module top-level, because
// this composable can be imported in contexts where `localStorage` does not
// exist (Vitest's default `environment: "node"`) or throws (incognito mode /
// disabled storage raises SecurityError on access). A read failure falls
// back to `defaultValue`; a write failure is swallowed — a cosmetic UI
// preference must never break the page.

const readPreference = <T>(
  key: string,
  defaultValue: T,
  isValid?: (raw: unknown) => raw is T,
): T => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;

    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return defaultValue;

    return parsed as T;
  } catch {
    return defaultValue;
  }
};

const writePreference = <T>(key: string, value: T): void => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Swallowed on purpose — a persistence failure (quota, disabled storage)
    // must not break the UI, and this project forbids console.log in
    // production code.
  }
};

/**
 * Reactive, localStorage-backed preference. Returns a writable `Ref<T>` that
 * initializes from the stored value (or `defaultValue` when unset, corrupted,
 * or rejected by the optional `isValid` type-guard) and persists every
 * subsequent change.
 *
 * `isValid` guards against valid-JSON-but-wrong-shape values (e.g. a legacy
 * format from a previous version) — `JSON.parse` succeeding is not the same
 * as the parsed value matching `T`.
 */
export const useStoredPreference = <T>(
  key: string,
  defaultValue: T,
  isValid?: (raw: unknown) => raw is T,
): Ref<T> => {
  const state = ref<T>(readPreference(key, defaultValue, isValid)) as Ref<T>;

  watch(
    state,
    (value) => writePreference(key, value),
    { deep: true },
  );

  return state;
};
