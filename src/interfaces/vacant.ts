import type { Business } from "./business";

export type JobCategory =
  | "JOB_POSITION"
  | "PROFESSIONAL_PRACTICE"
  | "PROFESSIONAL_PRACTICE";

export interface VacantPosition {
  id: number;
  user_id: string;
  vacant_name: string;
  status: boolean;
  category: JobCategory;
  created_at: string;
  business: Business;
}

export type CandidateType = "INTERNAL" | "EXTERNAL" | "NOT_COVERED" | "OTHER";

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
