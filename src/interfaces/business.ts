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
  bs_director?: string;
  bs_rfc?: string;
  bs_country?: string;
  bs_state?: string;
  bs_locality?: string;
  bs_adrress?: string;
  bs_telphone?: string;
  bs_line?: string;
  bs_other_line?: string;
  bs_website?: string;
  bs_description?: string;
}

export interface BusinessAgreement {
  id: number;
  start_date: string;
  end_date: string;
}

export interface BusinessCreateForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  campus: string;
  workstation: string;
  role: string;
  password: string;
  bs_name: string;
  bs_director: string;
  bs_rfc: string;
  bs_country: string;
  bs_state: string;
  bs_locality: string;
  bs_adrress: string;
  bs_telphone: string;
  bs_line: string;
  bs_other_line?: string;
  bs_website?: string;
  bs_description: string;
  start_date: string;
  end_date: string;
}

export interface BusinessDataForm {
  id?: number;
  bs_name: string;
  bs_director: string;
  bs_rfc: string;
  bs_country: string;
  bs_state: string;
  bs_locality: string;
  bs_adrress: string;
  bs_telphone: string;
  bs_line: string;
  bs_other_line?: string;
  bs_website?: string;
  bs_description: string;
}

export interface AgreementForm {
  start_date: string;
  end_date: string;
}

export interface BusinessUpdateForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  workstation: string;
  role: string;
  password?: string;
  active: boolean;
}
