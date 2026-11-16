import { describe, expect, it } from "vitest";
import { validateStaffAdministratorForm } from "@/utils/staffAdministratorForm";
import type { StaffAdministratorFormValues } from "@/utils/staffAdministratorForm";

const valid: StaffAdministratorFormValues = {
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.com",
  campus: "MERIDA",
  role_id: 3,
  password: "x",
  password_confirmation: "x",
};

describe("validateStaffAdministratorForm", () => {
  it("accepts a one-character password (no min length for staff)", () => {
    expect(validateStaffAdministratorForm(valid)).toEqual({});
  });

  it("requires every field", () => {
    const errors = validateStaffAdministratorForm({
      first_name: "",
      last_name: " ",
      email: "",
      campus: "",
      role_id: null,
      password: "",
      password_confirmation: "",
    });
    expect(Object.keys(errors).sort()).toEqual(
      ["campus", "email", "first_name", "last_name", "password", "password_confirmation", "role_id"].sort(),
    );
  });

  it("rejects a malformed email", () => {
    expect(validateStaffAdministratorForm({ ...valid, email: "nope" }).email).toBeTruthy();
  });

  it("requires the confirmation to match", () => {
    const errors = validateStaffAdministratorForm({ ...valid, password_confirmation: "y" });
    expect(errors.password_confirmation).toBe("Las contraseñas no coinciden.");
    expect(errors.password).toBeUndefined();
  });

  it("requires a confirmation when a password is set", () => {
    const errors = validateStaffAdministratorForm({ ...valid, password_confirmation: "" });
    expect(errors.password_confirmation).toBeTruthy();
  });
});
