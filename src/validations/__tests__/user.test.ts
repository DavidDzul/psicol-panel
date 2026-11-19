import { describe, expect, it } from "vitest";
import { updatePassword } from "@/validations/user";

describe("updatePassword", () => {
  it("is optional", () => {
    expect(updatePassword().isValidSync(undefined)).toBe(true);
  });
  it("treats a cleared field (empty string) as no value", () => {
    expect(updatePassword().isValidSync("")).toBe(true);
  });
  it("rejects a 5-char password", () => {
    expect(updatePassword().isValidSync("abc12")).toBe(false);
  });
  it("accepts 6 chars", () => {
    expect(updatePassword().isValidSync("abc123")).toBe(true);
  });
});
