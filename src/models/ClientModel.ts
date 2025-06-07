export enum ClientTitle {
  MR = 1,
  MLLE = 2,
  MRS = 3
}

export enum ClientType {
  PROFESSIONAL = 1,
  INDIVIDUAL = 2
}

export enum DisplayNameType {
  COMPANY = 1,
  FIRSTNAME_LASTNAME = 2,
  LASTNAME_FIRSTNAME = 3
}

export interface Address {
  address?: string;
  bill_state?: string;
  zip_code?: string;
  country_id: string;
  country_title?: string;
}

export interface Currency {
  priority: number;
  iso_code: string;
  title: string;
  symbol: string;
  subunit: string;
  subunit_to_unit: number;
  symbol_first: number;
  html_entity: string;
  decimal_mark: string;
  thousands_separator: string;
  iso_numeric: number;
  created_at: string;
  updated_at: string;
  hashed_id: string;
}

export interface PaymentTerm {
  hashed_id: string;
  title: string;
  days: number;
  created_at: string;
  updated_at: string;
  hashed_company_id: string;
}

export interface Activity {
  hashed_id: string;
  title: string;
}

export interface Client {
  title: ClientTitle;
  email: string | null;
  reference: string | null;
  type: ClientType;
  personal_id: string | null;
  personal_id_date: string | null;
  fiscal_id: string | null;
  first_name: string;
  last_name: string;
  organisation: string; // Correction: de 'Company' à 'organisation'
  display_name: DisplayNameType;
  phone: string | null;
  website: string | null;
  role: number;
  note: string | null;
  updated_at: string;
  created_at: string;
  hashed_id: string;
  hashed_activity_id: string;
  hashed_currency_id: string;
  unpaid: number;
  has_external_access: number;
  hashed_company_id: string;
  hashed_default_items_price_list_id: string | null;
  hashed_default_invoice_deadline_id: string | null;
  billing: Address;
  delivery: Address;
  hashed_journal_id: string;
  deposit_balance: number;
  outcomes: any[];
  expenses: any[];
  currency: Currency;
}

export interface ClientRequest {
  token: string;
  first_name: string;
  last_name: string;
  display_name: DisplayNameType;
  title: ClientTitle;
  organisation: string; // Correction: de 'Company' à 'organisation'
  activity_id?: string;
  currency_id?: string;
  email?: string | null;
  phone?: string | null;
  deadline_id?: string;
  bill_country?: string;
  type: ClientType;
  reference?: string | null;
  hashed_company_id: string;
  hashed_activity_id: string;
  price_list_id?: string;
  hashed_default_items_price_list_id?: string | null;
  hashed_currency_id: string;
  hashed_default_invoice_deadline_id?: string | null;
  billing: Address;
  delivery?: Address;
  note?: string | null;
  fiscal_id?: string | null;
  personal_id?: string | null;
  website?: string | null;
}

export interface ClientResponse {
  data: {
    client: Client;
  };
  status: {
    message: string;
    code: number;
  };
}

export const parseAddress = (address: any): Address => {
  if (!address) return {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: '',
    country_title: ''
  };

  if (typeof address === 'object' && !Array.isArray(address)) {
    return {
      address: address.address || '',
      bill_state: address.bill_state || '',
      zip_code: address.zip_code || '',
      country_id: address.country_id || '',
      country_title: address.country_title || ''
    };
  }

  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (e) {
      console.error('Erreur de parsing d\'adresse:', e);
    }
  }

  return {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: '',
    country_title: ''
  };
};

// Modifier clientFromJson
export const clientFromJson = (json: any): Client => ({
  ...json,
  billing: parseAddress(json.billing),
  delivery: parseAddress(json.delivery),
  currency: json.currency || {} as Currency,
  unpaid: json.unpaid || 0,
  deposit_balance: json.deposit_balance || 0,
  outcomes: json.outcomes || [],
  expenses: json.expenses || []
});

export const createClientRequest = (
  data: Partial<ClientRequest>,
  token: string
): ClientRequest => ({
  token,
  first_name: data.first_name ?? '',
  last_name: data.last_name ?? '',
  display_name: data.display_name ?? DisplayNameType.COMPANY,
  title: data.title ?? ClientTitle.MR,
  type: data.type ?? ClientType.PROFESSIONAL,
  organisation: data.organisation ?? '', 
  activity_id: data.activity_id ?? '',
  currency_id: data.currency_id ?? '',
  price_list_id: data.price_list_id ?? '',
  deadline_id: data.deadline_id ?? '',
  bill_country: data.bill_country ?? 'TN',
  email: data.email ?? '',
  phone: data.phone ?? '',
  website: data.website ?? '',
  reference: data.reference ?? '',
  note: data.note ?? '',
  fiscal_id: data.fiscal_id ?? '',
  personal_id: data.personal_id ?? '',
  hashed_company_id: data.hashed_company_id ?? '',
  hashed_activity_id: data.hashed_activity_id ?? '',
  hashed_currency_id: data.hashed_currency_id ?? '',
  hashed_default_items_price_list_id: data.hashed_default_items_price_list_id ?? '',
  hashed_default_invoice_deadline_id: data.hashed_default_invoice_deadline_id ?? '',
  billing: data.billing ?? {
    country_id: '',
    address: '',
    bill_state: '',
    zip_code: '',
    country_title: ''
  },
  delivery: data.delivery ?? {
    country_id: '',
    address: '',
    bill_state: '',
    zip_code: '',
    country_title: ''
  }
});
