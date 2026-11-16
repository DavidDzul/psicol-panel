import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "@/utils/apiErrorMessage";

const axiosError = (data: unknown) => ({ isAxiosError: true, response: { status: 422, data } });

describe("apiErrorMessage", () => {
  it("prefers the first Laravel field error over the generic message", () => {
    const error = axiosError({ message: "The given data was invalid.", errors: { email: ["El correo ya está registrado."] } });
    expect(apiErrorMessage(error, "fallback")).toBe("El correo ya está registrado.");
  });

  it("skips fields with empty message lists", () => {
    const error = axiosError({ errors: { a: [], b: ["Segundo."] } });
    expect(apiErrorMessage(error, "fallback")).toBe("Segundo.");
  });

  it("uses msg, then message, when there are no field errors", () => {
    expect(apiErrorMessage(axiosError({ msg: "Desde msg" }), "fallback")).toBe("Desde msg");
    expect(apiErrorMessage(axiosError({ message: "Desde message" }), "fallback")).toBe("Desde message");
  });

  it("falls back for non-Axios errors and empty bodies", () => {
    expect(apiErrorMessage(new Error("network"), "fallback")).toBe("fallback");
    expect(apiErrorMessage(axiosError({}), "fallback")).toBe("fallback");
    expect(apiErrorMessage(undefined)).toBe("Ocurrió un error, intente nuevamente.");
  });
});
