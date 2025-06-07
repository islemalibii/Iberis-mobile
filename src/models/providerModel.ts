export enum ProviderTitle {
    MR = 1,
    MLLE = 2,
    MRS = 3
  }
  
  export enum ProviderType {
    PROFESSIONAL = 1,
    INDIVIDUAL = 2
  }
  
  export enum DisplayNameType {
    COMPANY = 1,
    FIRSTNAME_LASTNAME = 2,
    LASTNAME_FIRSTNAME = 3
  }
  
  export interface Address {
    address?: string | null;
    bill_state?: string | null;
    zip_code?: string | null;
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
  
  export interface Provider {
    title: ProviderTitle;
    email: string | null;
    reference: string | null;
    type: ProviderType;
    personal_id: string | null;
    personal_id_date: string | null;
    fiscal_id: string | null;
    first_name: string;
    last_name: string;
    organisation: string | null;
    display_name: string;
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
    has_external_access: number | null;
    hashed_company_id: string;
    hashed_default_items_price_list_id: string | null;
    hashed_default_invoice_deadline_id: string | null;
    billing: Address | string;
    delivery: Address | string;
    hashed_journal_id: string;
    deposit_balance: number;
    outcomes: any[];
    expenses: any[];
    currency: Currency;
  }
  
  export interface ProviderRequest {
    token: string;
    first_name: string;
    last_name: string;
    display_name: DisplayNameType;
    type: ProviderType;
    title: ProviderTitle;
    company?: string;
    activity_id?: string;
    currency_id?: string;
    price_list_id?: string;
    deadline_id?: string;
    bill_country?: string;
    email?: string;
    phone?: string;
    website?: string;
    reference?: string;
    note?: string;
    fiscal_id?: string;
    personal_id?: string;
    hashed_activity_id?: string;
    hashed_currency_id?: string;
    hashed_default_items_price_list_id?: string;
    hashed_default_invoice_deadline_id?: string;
    billing?: {
      country_id: string;
      address?: string;
      bill_state?: string;
      zip_code?: string;
      country_title?:string;
  
    };
    delivery?: {
      country_id: string;
      address?: string;
      bill_state?: string;
      zip_code?: string;
      country_title?:string;
  
    };
  }
  
  export interface ProviderResponse {
    data: {
      provider: Provider;
    };
    status: {
      message: string;
      code: number;
    };
  }
  
  export const providerFromJson = (json: any): Provider => {
    const parseAddress = (address: string | Address): Address => {
      if (typeof address === 'string') {
        try {
          return JSON.parse(address);
        } catch {
          return {
            address: null,
            bill_state: null,
            zip_code: null,
            country_id: '',
            country_title: ''
          };
        }
      }
      return address;
    };
  
    return {
      ...json,
      billing: parseAddress(json.billing),
      delivery: parseAddress(json.delivery),
      currency: json.currency || {} as Currency,
      unpaid: json.unpaid || 0,
      deposit_balance: json.deposit_balance || 0,
      outcomes: json.outcomes || [],
      expenses: json.expenses || []
    };
  };
  
  export const createProviderRequest = (
    data: Partial<ProviderRequest>,
    token: string
  ): ProviderRequest => ({
    token,
    first_name: data.first_name ?? '',
    last_name: data.last_name ?? '',
    display_name: data.display_name ?? DisplayNameType.FIRSTNAME_LASTNAME,
    type: data.type ?? ProviderType.PROFESSIONAL,
    title: data.title ?? ProviderTitle.MR,
    company: data.company ?? '',
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
    hashed_activity_id: data.hashed_activity_id ?? '',
    hashed_currency_id: data.hashed_currency_id ?? '',
    hashed_default_items_price_list_id: data.hashed_default_items_price_list_id ?? '',
    hashed_default_invoice_deadline_id: data.hashed_default_invoice_deadline_id ?? '',
    billing: data.billing ?? {
      country_id: '',
      address: '',
      bill_state: '',
      zip_code: '',
      country_title:''
  
    },
    delivery: data.delivery ?? {
      country_id: '',
      address: '',
      bill_state: '',
      zip_code: '',
        country_title:''
  
    }
  });