import { describe, expect, it } from "vitest";
import * as yup from "yup";
import * as v from "@/validations/business";

const valid = (schema: yup.Schema, value: unknown) =>
  schema.isValidSync(value);

describe("business validators", () => {
  describe("businessPassword (create)", () => {
    it("rejects a 7-char password", () => {
      expect(valid(v.businessPassword(), "abc1234")).toBe(false);
    });
    it("accepts an 8-char password", () => {
      expect(valid(v.businessPassword(), "abc12345")).toBe(true);
    });
    it("requires a value", () => {
      expect(valid(v.businessPassword(), undefined)).toBe(false);
    });
  });

  describe("businessUpdatePassword", () => {
    it("is optional", () => {
      expect(valid(v.businessUpdatePassword(), undefined)).toBe(true);
    });
    it("treats a cleared field (empty string) as no value", () => {
      expect(valid(v.businessUpdatePassword(), "")).toBe(true);
    });
    it("rejects a 7-char password", () => {
      expect(valid(v.businessUpdatePassword(), "abc1234")).toBe(false);
    });
    it("accepts 8 chars", () => {
      expect(valid(v.businessUpdatePassword(), "abc12345")).toBe(true);
    });
  });

  describe("emails", () => {
    it("rejects an invalid format", () => {
      expect(valid(v.businessEmail(), "not-an-email")).toBe(false);
      expect(valid(v.businessUpdateEmail(), "not-an-email")).toBe(false);
    });
    it("rejects more than 255 chars on create only", () => {
      const long = `${"a".repeat(250)}@x.com`;
      expect(valid(v.businessEmail(), long)).toBe(false);
      expect(valid(v.businessUpdateEmail(), long)).toBe(true);
    });
    it("accepts a valid email", () => {
      expect(valid(v.businessEmail(), "a@b.com")).toBe(true);
    });
  });

  describe("names", () => {
    it("rejects names over 255 chars", () => {
      expect(valid(v.businessFirstName(), "a".repeat(256))).toBe(false);
      expect(valid(v.businessLastName(), "a".repeat(256))).toBe(false);
    });
    it("accepts 255 chars", () => {
      expect(valid(v.businessFirstName(), "a".repeat(255))).toBe(true);
    });
  });

  describe("phone and workstation are nullable", () => {
    it("accepts null, undefined and empty phone", () => {
      expect(valid(v.businessPhone(), null)).toBe(true);
      expect(valid(v.businessPhone(), undefined)).toBe(true);
      expect(valid(v.businessPhone(), "")).toBe(true);
    });
    it("rejects phone over 15 chars", () => {
      expect(valid(v.businessPhone(), "1".repeat(16))).toBe(false);
      expect(valid(v.businessPhone(), "1".repeat(15))).toBe(true);
    });
    it("accepts null workstation and rejects over 255", () => {
      expect(valid(v.workstation(), null)).toBe(true);
      expect(valid(v.workstation(), "a".repeat(256))).toBe(false);
    });
  });

  describe("campus and role", () => {
    it("accepts the 4 API campuses only", () => {
      for (const c of ["MERIDA", "VALLADOLID", "OXKUTZCAB", "TIZIMIN"]) {
        expect(valid(v.businessCampus(), c)).toBe(true);
      }
      expect(valid(v.businessCampus(), "CANCUN")).toBe(false);
      expect(valid(v.businessCampus(), undefined)).toBe(false);
    });
    it("accepts the 6 API roles only", () => {
      for (const r of ["BASIC", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]) {
        expect(valid(v.role(), r)).toBe(true);
      }
      expect(valid(v.role(), "ADMIN")).toBe(false);
    });
  });

  describe("business data", () => {
    it("rejects rfc of 14 chars and accepts 13", () => {
      expect(valid(v.bs_rfc(), "A".repeat(14))).toBe(false);
      expect(valid(v.bs_rfc(), "A".repeat(13))).toBe(true);
    });
    it("applies the API max lengths", () => {
      expect(valid(v.bs_name(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_director(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_country(), "a".repeat(101))).toBe(false);
      expect(valid(v.bs_state(), "a".repeat(101))).toBe(false);
      expect(valid(v.bs_locality(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_adrress(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_telphone(), "1".repeat(16))).toBe(false);
      expect(valid(v.bs_line(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_other_line(), "a".repeat(256))).toBe(false);
      expect(valid(v.bs_website(), "a".repeat(256))).toBe(false);
    });
    it("keeps bs_description unbounded and bs_other_line/bs_website optional", () => {
      expect(valid(v.bs_description(), "a".repeat(5000))).toBe(true);
      expect(valid(v.bs_other_line(), undefined)).toBe(true);
      expect(valid(v.bs_website(), undefined)).toBe(true);
    });
  });

  describe("agreement date labels", () => {
    it("uses Fecha de inicio / Fecha de fin", async () => {
      await expect(v.start_date().validate(undefined)).rejects.toThrow();
      expect(v.start_date().describe().label).toBe("Fecha de inicio");
      expect(v.end_date().describe().label).toBe("Fecha de fin");
    });
  });
});
