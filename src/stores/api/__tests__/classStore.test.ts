import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const post = vi.fn();
vi.mock("@/axiosConfig", () => ({ default: { post: (...a: unknown[]) => post(...a) } }));
vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const showAlert = vi.fn();
vi.mock("@/stores/alert", () => ({ useAlertStore: () => ({ showAlert }) }));

import { useClassStore } from "@/stores/api/classStore";

const rejectWith = (data: unknown) => post.mockRejectedValue({ response: { status: 422, data } });

beforeEach(() => {
  setActivePinia(createPinia());
  post.mockReset();
  showAlert.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("classStore error alerts", () => {
  it("assignUsers shows the server message on 422", async () => {
    rejectWith({ res: false, code: "USERS_NOT_ELIGIBLE_FOR_CLASS", message: "No se pueden asignar 1 usuario(s): solo becarios activos de la sede y generación de la clase." });
    await expect(useClassStore().assignUsers({ class_id: 1, user_ids: [9] })).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({
      title: "No se pueden asignar 1 usuario(s): solo becarios activos de la sede y generación de la clase.",
      status: "error",
    });
  });

  it("createClass shows errors.date[0] when there is no message", async () => {
    rejectWith({ errors: { date: ["Ya existe una clase para esa sede, generación y fecha."] } });
    await expect(useClassStore().createClass({})).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({
      title: "Ya existe una clase para esa sede, generación y fecha.",
      status: "error",
    });
  });

  // Laravel 8 ValidationException always sends the generic English `message`;
  // the field error carries the real (Spanish) copy, so it must win.
  it("prefers the field error over Laravel's generic message (real 422 body)", async () => {
    rejectWith({ message: "The given data was invalid.", errors: { date: ["Ya existe una clase para esa sede, generación y fecha."] } });
    await expect(useClassStore().createClass({})).rejects.toBeTruthy();
    expect(showAlert.mock.calls[0][0].title).toBe("Ya existe una clase para esa sede, generación y fecha.");
  });

  it("uses the first error of any field, not only date", async () => {
    rejectWith({ message: "The given data was invalid.", errors: { end_time: ["La hora de fin debe ser posterior al inicio."] } });
    await expect(useClassStore().createClass({})).rejects.toBeTruthy();
    expect(showAlert.mock.calls[0][0].title).toBe("La hora de fin debe ser posterior al inicio.");
  });

  it("falls back to the generic copy when the error has no response", async () => {
    post.mockRejectedValue(new Error("network"));
    await expect(useClassStore().assignUsers({})).rejects.toBeTruthy();
    expect(showAlert).toHaveBeenCalledWith({
      title: "Error al guardar la información, intente nuevamente.",
      status: "error",
    });
  });
});
