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
