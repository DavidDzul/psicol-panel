import type { User } from "@/interfaces/user";
import type { ClassAttendance } from "@/interfaces/class";

export interface AssignableUser {
  id: number;
  first_name: string;
  last_name: string;
  /** Already assigned to the class but no longer eligible (chip "No elegible"). */
  notEligible: boolean;
  /** Attendance already has a check_in: cannot be unassigned. */
  locked: boolean;
  /** Currently attending the class (selected by default in the modal). */
  selected: boolean;
}

/**
 * Union (by user id) of eligible users and users already assigned to the class.
 * Pure: inputs are never mutated.
 */
export const mergeAssignableUsers = (
  eligible: readonly User[],
  attendances: readonly ClassAttendance[],
): AssignableUser[] => {
  const rows = new Map<number, AssignableUser>();

  for (const user of eligible) {
    rows.set(user.id, {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      notEligible: false,
      locked: false,
      selected: false,
    });
  }

  const eligibleIds = new Set(eligible.map((u) => u.id));
  for (const attendance of attendances) {
    const { user } = attendance;
    rows.set(user.id, {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      notEligible: !eligibleIds.has(user.id),
      locked: attendance.check_in !== null && attendance.check_in !== "",
      selected: true,
    });
  }

  return [...rows.values()];
};
