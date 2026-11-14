import { describe, expect, it } from "vitest";
import { getAttendanceStatusInfo, isAttendanceStatus } from "@/utils/attendanceStatus";

describe("attendanceStatus", () => {
  it.each(["PRESENT", "ABSENT", "JUSTIFIED_LATE", "JUSTIFIED_ABSENCE", "LATE"])(
    "recognizes the DB status %s",
    (status) => {
      expect(isAttendanceStatus(status)).toBe(true);
      expect(getAttendanceStatusInfo(status)).toBeDefined();
    },
  );

  it("returns the label and color of a known status", () => {
    expect(getAttendanceStatusInfo("LATE")).toEqual({ label: "Retardo", color: "orange" });
  });

  it("returns undefined for an unknown or empty status", () => {
    expect(isAttendanceStatus("JUSTIFIED")).toBe(false);
    expect(getAttendanceStatusInfo("JUSTIFIED")).toBeUndefined();
    expect(getAttendanceStatusInfo("")).toBeUndefined();
    expect(getAttendanceStatusInfo(null)).toBeUndefined();
  });

  it("does not treat Object.prototype keys as statuses", () => {
    expect(isAttendanceStatus("toString")).toBe(false);
    expect(getAttendanceStatusInfo("constructor")).toBeUndefined();
  });
});
