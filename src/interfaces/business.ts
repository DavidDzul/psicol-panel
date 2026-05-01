import type { User } from "./user";
import type { Role } from "./role";

export interface Business extends User {
  role: Role;
  business_data: BusinessData;
}

export interface BusinessData {
  id: number;
  user_id: string;
  bs_name: string;
}

export interface BusinessAgreement {
  id: number;
  [key: string]: any;
}
