/** Sentinel for the "Todos los meses" option (v-select treats null as empty). */
export const ALL_MONTHS = 0;

/** First year with classes; the year select starts here. */
export const CLASS_FIRST_YEAR = 2025;

export interface ClassListFilters {
  campus: string;
  generation_id: number;
  year: number | null;
  month: number | null;
}

export interface ClassListParams {
  campus: string;
  generation_id: number;
  year?: number;
  month?: number;
}

/**
 * Builds the query params for GET api/admin/class.
 * No year -> no period params; ALL_MONTHS (or null) month -> year only.
 */
export const buildClassListParams = (
  filters: ClassListFilters,
): ClassListParams => {
  const { campus, generation_id, year, month } = filters;
  const params: ClassListParams = { campus, generation_id };

  if (year === null || year === undefined) return params;

  params.year = year;
  if (month !== null && month !== undefined && month !== ALL_MONTHS) {
    params.month = month;
  }
  return params;
};

/** Years from CLASS_FIRST_YEAR up to next year (inclusive). */
export const buildYearOptions = (currentYear: number): number[] => {
  const last = Math.max(currentYear + 1, CLASS_FIRST_YEAR);
  return Array.from(
    { length: last - CLASS_FIRST_YEAR + 1 },
    (_, i) => CLASS_FIRST_YEAR + i,
  );
};
