export type AttendanceStatus = "PRESENT" | "LATE";

export interface CheckInAttendance {
  status: AttendanceStatus;
  check_in: string;
  class: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface CheckInResponse {
  message: string;
  attendance: CheckInAttendance;
}
