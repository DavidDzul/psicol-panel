// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import router from "@/router";

describe("router", () => {
  it("no longer exposes the hidden /4dm1n staff roles route", () => {
    const paths = router.getRoutes().map((r) => r.path);

    expect(paths).not.toContain("/4dm1n");
    expect(router.getRoutes().some((r) => r.name === "RolesAdminView")).toBe(false);
    expect(router.resolve("/4dm1n").matched.every((r) => r.name !== "RolesAdminView")).toBe(true);
  });

  it("keeps the business plans /roles route", () => {
    expect(router.getRoutes().some((r) => r.path === "/roles")).toBe(true);
  });
});
