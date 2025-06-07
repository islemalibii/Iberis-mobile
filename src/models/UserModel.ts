import { Company } from '@/models/CompanyModel';

export interface UserProfile {
  hashed_id: string;
  name: string;
  email: string;
  phone: string;
  phone_country_code: string;
  phone_status: number;
  phone_validation?: number;
  status: number;

  photo: string | null;
  gender: number;
  birthday: string;

  token?: string;
  sessionExpiration?: number | null;
  tfa_status: number;
  google2fa_secret?: string | null;
  last_ip_address?: string;

  language: string;
  settings_preferred_module: number;
  enable_auto_save: number;
  hashed_settings_preferred_company?: string;
  walkthrough?: number;

  formattedRoles: number[];
  notifications: NotificationPreferences;

  joined_companies: CompanyRelation[];
  owned_companies: CompanyRelation[];
  all_companies: CompanyRelation[];

  validation?: string;
  billing_address?: string | null;
  affiliate_payout_settings?: unknown;
  affiliate_tag?: string;
  referrer_id?: string | null;
  source?: string | null;
  notes?: string | null;

  delete_request_ticket_id?: string | null;
  expiration_time?: string | null;

  showTestimonials?: number;
  showOpinion?: number;
  isMaintenance?: boolean;

  partner?: unknown;
  managing_partner?: unknown;

  current_finance_subscription?: unknown;
}

export interface CompanyRelation {
  status?: number;
  created_at?: string;
  updated_at?: string;
  hashed_id?: string;
  hashed_company_id?: string;
  hashed_company_role_id?: string;
  hashed_user_id?: string;
  company: Company;
}

// src/models/UserModel.ts

export interface NotificationPreferences {
  all: boolean;
  login: boolean;
  company: boolean;
  invite: boolean;
  subscription: boolean;
  support: boolean;
  birou: boolean;
}

// Tu peux aussi avoir d'autres exports dans ce fichier, comme des classes ou des fonctions.


/*import { Company } from '@/models/CreatCompanyModel';

export interface UserProfile {
  // Informations de base
  hashed_id: string;
  name: string;
  email: string;
  phone: string;
  phone_country_code: string;
  phone_status: number;
  phone_validation?: number;
  status: number;
  
  // Informations personnelles
  photo: string | null;
  gender: number;
  birthday: string; // Format: "YYYY-MM-DD"
  
  // Authentification et sécurité
  token?: string;
  sessionExpiration?: number | null;
  tfa_status: number;
  google2fa_secret?: string | null;
  last_ip_address?: string;
  
  // Préférences
  language: string;
  settings_preferred_module: number;
  enable_auto_save: number;
  hashed_settings_preferred_company?: string;
  walkthrough?: number;
  
  // Rôles et permissions
  formattedRoles: number[];
  notifications: NotificationPreferences;


  
  // Entreprises
  joined_companies: CompanyRelation[];
  owned_companies: CompanyRelation[];
  all_companies: CompanyRelation[];
  
  // Informations supplémentaires
  validation?: string;
  billing_address?: string | null;
  affiliate_payout_settings?: unknown;
  affiliate_tag?: string;
  referrer_id?: string | null;
  source?: string | null;
  notes?: string | null;
  
  // Gestion de compte
  delete_request_ticket_id?: string | null;
  expiration_time?: string | null;
  
  // Préférences d'affichage
  showTestimonials?: number;
  showOpinion?: number;
  isMaintenance?: boolean;
  
  // Partenariat
  partner?: unknown;
  managing_partner?: unknown;
  
  // Abonnement
  current_finance_subscription?: unknown;
}

export interface CompanyRelation {
  status?: number;
  created_at?: string;
  updated_at?: string;
  hashed_id?: string;
  hashed_company_id?: string;
  hashed_company_role_id?: string;
  hashed_user_id?: string;
  company: Company;
}

export interface NotificationPreferences {

    all: boolean;
    login: boolean;
    company: boolean;
    invite: boolean;
    subscription: boolean;
    support: boolean;
    birou: boolean;

}*/
