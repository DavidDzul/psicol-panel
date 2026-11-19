import { describe, expect, it } from "vitest";
import { password, updatePassword } from "@/validations/user";

describe("password (create, API createRulesUser: required|min:8)", () => {
  it("requires a value", () => {
    expect(password().isValidSync(undefined)).toBe(false);
    expect(password().isValidSync("")).toBe(false);
  });
  it("rejects a 7-char password", () => {
    expect(password().isValidSync("abc1234")).toBe(false);
  });
  it("accepts 8 chars", () => {
    expect(password().isValidSync("abc12345")).toBe(true);
  });
  it("accepts the default person password", () => {
    expect(password().isValidSync("Agentedecambio")).toBe(true);
  });
});

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
