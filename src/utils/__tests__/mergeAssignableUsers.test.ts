import { describe, expect, it } from "vitest";
import { mergeAssignableUsers } from "@/utils/mergeAssignableUsers";
import type { User } from "@/interfaces/user";
import type { ClassAttendance } from "@/interfaces/class";

const eligible = (id: number): User =>
  ({ id, first_name: `N${id}`, last_name: `L${id}` }) as User;

const attendance = (userId: number, checkIn: string | null = null): ClassAttendance => ({
  id: userId * 10,
  status: "ABSENT",
  check_in: checkIn,
  check_out: null,
  observations: null,
  user: {
    id: userId,
    first_name: `N${userId}`,
    last_name: `L${userId}`,
    enrollment: null,
    email: `u${userId}@x.mx`,
  },
});

describe("mergeAssignableUsers", () => {
  it("returns the union by id without duplicates", () => {
    const rows = mergeAssignableUsers([eligible(1), eligible(2)], [attendance(2), attendance(3)]);
    expect(rows.map((r) => r.id).sort()).toEqual([1, 2, 3]);
  });

  it("flags assigned users missing from the eligible list as notEligible", () => {
    const rows = mergeAssignableUsers([eligible(1)], [attendance(3)]);
    expect(rows.find((r) => r.id === 3)?.notEligible).toBe(true);
    expect(rows.find((r) => r.id === 1)?.notEligible).toBe(false);
  });

  it("does not flag assigned users that are also eligible", () => {
    const rows = mergeAssignableUsers([eligible(2)], [attendance(2)]);
    expect(rows).toHaveLength(1);
    expect(rows[0].notEligible).toBe(false);
  });

  it("marks attendees as selected and others as not selected", () => {
    const rows = mergeAssignableUsers([eligible(1)], [attendance(2)]);
    expect(rows.find((r) => r.id === 1)?.selected).toBe(false);
    expect(rows.find((r) => r.id === 2)?.selected).toBe(true);
  });

  it("locks rows whose attendance has a check_in", () => {
    const rows = mergeAssignableUsers([], [attendance(1, "09:00:00"), attendance(2)]);
    expect(rows.find((r) => r.id === 1)?.locked).toBe(true);
    expect(rows.find((r) => r.id === 2)?.locked).toBe(false);
  });

  it("does not mutate its inputs", () => {
    const users = [eligible(1)];
    const atts = [attendance(2)];
    const snapshot = JSON.stringify([users, atts]);
    mergeAssignableUsers(users, atts);
    expect(JSON.stringify([users, atts])).toBe(snapshot);
  });
});
