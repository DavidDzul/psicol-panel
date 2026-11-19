import type { Business } from "./business";

export type JobCategory =
  | "JOB_POSITION"
  | "PROFESSIONAL_PRACTICE"
  | "JR_POSITION";

/** Business columns the vacancy endpoints select with the vacancy. */
export interface VacantBusinessRef {
  id: number;
  user_id: number;
  bs_name: string;
}

/** Row of the vacancy index (`api/admin/vacantPositions`). */
export interface VacantPosition {
  id: number;
  user_id: number;
  vacant_name: string;
  status: boolean;
  category: JobCategory;
  created_at: string;
  business: VacantBusinessRef | null;
}

export type CandidateType = "INTERNAL" | "EXTERNAL" | "NOT_COVERED" | "OTHER";

/**
 * Full vacancy as returned by show/create/update. Every column is typed by the
 * model casts: booleans are nullable because they are not required on every
 * category.
 */
export interface VacantPositionDetail
  extends Omit<VacantPosition, "business"> {
  mode: string;
  activities: string;
  study_profile: string;
  start_day: string;
  end_day: string;
  start_hour: string;
  start_minute: string;
  end_hour: string;
  end_minute: string;
  skills: string;
  campus: string;
  updated_at: string;
  net_salary: string | null;
  support_amount: string | null;
  semester: string | null;
  saturday_start_hour: string | null;
  saturday_start_minute: string | null;
  saturday_end_hour: string | null;
  saturday_end_minute: string | null;
  sunday_start_hour: string | null;
  sunday_start_minute: string | null;
  sunday_end_hour: string | null;
  sunday_end_minute: string | null;
  additional_time_info: string | null;
  experience_description: string | null;
  software_description: string | null;
  knowledge_description: string | null;
  benefit_description: string | null;
  observations: string | null;
  compensations: string | null;
  candidate_other: string | null;
  candidate_type: CandidateType | null;
  saturday_hour: boolean | null;
  sunday_hour: boolean | null;
  experience: boolean | null;
  software_use: boolean | null;
  general_knowledge: boolean | null;
  financial_support: boolean | null;
  overtime_pay: boolean | null;
  utilities: boolean | null;
  bonuses: boolean | null;
  dining_room: boolean | null;
  savings_fund: boolean | null;
  grocery_vouchers: boolean | null;
  extensive_vacation_bonus: boolean | null;
  top_christmas_bonus: boolean | null;
  flexible_hours: boolean | null;
  major_medical_expenses: boolean | null;
  transportation_help: boolean | null;
  automobile: boolean | null;
  loans: boolean | null;
  life_insurance: boolean | null;
  other: boolean | null;
  /** show() does not load the business; create/update do. */
  business?: VacantBusinessRef | null;
}

export interface VacantDisabledPayload {
  candidate_type: CandidateType | null;
  candidate_other: string;
}

export interface VacantForm {
  id?: number;
  mode: string;
  category: string;
  vacant_name: string;
  activities: string;
  study_profile: string;
  net_salary: string | number;
  start_day: string;
  end_day: string;
  start_hour: string;
  start_minute: string;
  end_hour: string;
  end_minute: string;
  saturday_hour: boolean;
  saturday_start_hour: string;
  saturday_start_minute: string;
  saturday_end_hour: string;
  saturday_end_minute: string;
  sunday_hour: boolean;
  sunday_start_hour: string;
  sunday_start_minute: string;
  sunday_end_hour: string;
  sunday_end_minute: string;
  additional_time_info: string;
  experience: boolean;
  experience_description: string;
  software_use: boolean;
  software_description: string;
  skills: string;
  observations: string;
  overtime_pay: boolean;
  utilities: boolean;
  bonuses: boolean;
  dining_room: boolean;
  savings_fund: boolean;
  grocery_vouchers: boolean;
  extensive_vacation_bonus: boolean;
  top_christmas_bonus: boolean;
  flexible_hours: boolean;
  major_medical_expenses: boolean;
  transportation_help: boolean;
  automobile: boolean;
  loans: boolean;
  life_insurance: boolean;
  other: boolean;
  benefit_description: string;
}

export interface VacantJrForm {
  id?: number;
  category: string;
  mode: string;
  vacant_name: string;
  activities: string;
  study_profile: string;
  net_salary: string | number;
  start_day: string;
  end_day: string;
  start_hour: string;
  start_minute: string;
  end_hour: string;
  end_minute: string;
  saturday_hour: boolean;
  saturday_start_hour: string;
  saturday_start_minute: string;
  saturday_end_hour: string;
  saturday_end_minute: string;
  sunday_hour: boolean;
  sunday_start_hour: string;
  sunday_start_minute: string;
  sunday_end_hour: string;
  sunday_end_minute: string;
  semester: string;
  software_use: boolean;
  software_description: string;
  skills: string;
  general_knowledge: boolean;
  knowledge_description: string;
  observations: string;
  compensations: string;
}

export interface VacantPracticeForm {
  id?: number;
  mode: string;
  category: string;
  vacant_name: string;
  activities: string;
  study_profile: string;
  financial_support: boolean;
  support_amount: string | number | null;
  start_day: string;
  end_day: string;
  start_hour: string;
  start_minute: string;
  end_hour: string;
  end_minute: string;
  saturday_hour: boolean;
  saturday_start_hour: string;
  saturday_start_minute: string;
  saturday_end_hour: string;
  saturday_end_minute: string;
  sunday_hour: boolean;
  sunday_start_hour: string;
  sunday_start_minute: string;
  sunday_end_hour: string;
  sunday_end_minute: string;
  semester: string;
  software_use: boolean;
  software_description: string;
  skills: string;
  general_knowledge: boolean;
  knowledge_description: string;
  observations: string;
  compensations: string;
}
