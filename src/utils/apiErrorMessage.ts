import axios from "axios";

interface ApiErrorBody {
  message?: string;
  msg?: string;
  errors?: Record<string, string[] | undefined>;
}

export const GENERIC_ERROR_MESSAGE = "Ocurrió un error, intente nuevamente.";

/**
 * Laravel 422 bodies carry a generic English `message` and the real copy in
 * `errors`, so the first field error wins over `msg`/`message`.
 */
export const apiErrorMessage = (
  error: unknown,
  fallback: string = GENERIC_ERROR_MESSAGE,
): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const body = error.response?.data as ApiErrorBody | undefined;
  const firstFieldError = Object.values(body?.errors ?? {}).find(
    (messages) => messages?.length,
  )?.[0];
  return firstFieldError || body?.msg || body?.message || fallback;
};
