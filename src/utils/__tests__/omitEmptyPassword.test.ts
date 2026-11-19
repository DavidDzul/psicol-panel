import { describe, expect, it } from "vitest";
import { omitEmptyPassword } from "@/utils/omitEmptyPassword";

describe("omitEmptyPassword", () => {
  it("keeps a typed password", () => {
    const form = { email: "a@x.com", password: "abc12345" };
    expect(omitEmptyPassword(form)).toEqual(form);
  });

  it.each(["", null, undefined])("drops password and confirmation when password is %j", (value) => {
    const form = { email: "a@x.com", password: value, confirmation: "" };
    expect(omitEmptyPassword(form)).toEqual({ email: "a@x.com" });
  });

  it("does not mutate the original form", () => {
    const form = { email: "a@x.com", password: "" };
    omitEmptyPassword(form);
    expect(form).toEqual({ email: "a@x.com", password: "" });
  });
});
