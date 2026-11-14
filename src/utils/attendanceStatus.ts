import { attendanceStatusMap } from "@/constants";
import type { AttendanceStatus, AttendanceStatusInfo } from "@/constants";

/** Narrows an API status string to a known attendance status (own keys only). */
export const isAttendanceStatus = (status: string): status is AttendanceStatus =>
  Object.prototype.hasOwnProperty.call(attendanceStatusMap, status);

/** Label and color for an attendance status; undefined when the status is unknown. */
export const getAttendanceStatusInfo = (
  status: string | null | undefined,
): AttendanceStatusInfo | undefined =>
  status && isAttendanceStatus(status) ? attendanceStatusMap[status] : undefined;
