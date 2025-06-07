export interface Discount {
    value: number;
    type: '%' | 'fixed';
  }
  
  export interface ItemTax {
    id: string;
    title: string;
    rate?: number;
  }
  
  export interface EstimateItem {
    id?: string;
    hashed_id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: Discount;
    taxes: ItemTax[];
    price?: number;
  }
  
  export interface AdditionalInput {
    hashed_id: string;
    title: string;
    rate?: number;
    value?: number;
    active?: boolean;
  }
  
  export interface AddEstimateForm {
    choice: number;
    date: string;
    due: string;
    client_id: string;
    items: EstimateItem[];
    tax_type: number;
    language: string;
    currency_rate: number;
    remarks: string;
    use_conditions: number;
  
    // Optional fields
    estimate_number?: string;
    referenceNumber: string;
    notes?: string;
    object: string;
    watermark: string;
    attachments: File[];
  
    category: string;
    generalTerms: string;
    
    // Display settings
    show_description: number;
    showArticleUnit: number;
    showArticleTTCPrices: number;
    show_pictures: number;
    show_billing: number;
    show_delivery: number;
    show_conditions: number;
    show_stamp: number;
    show_bank: number;
    selected_bank: string;
    show_unity: number;
  
    totals: {
      discount: string;
      total: string;
      taxes: string;
      subtotal: string;
    };
    
    additional_inputs: AdditionalInput[];
    activeAdditionalInputs: {
      tva: boolean;
      stamp: boolean;
      example: boolean;
    };
  }
  
  export interface Estimate {
    hashed_id: string;
    estimate_number: string;
    document_name: string;
    date: string;
    due: string;
    status: number;
    total: number;
    total_formatted: string;
    naming_series_prefix: string;
    naming_series_composed_number: string;
    hashed_company_id: string;
    additional_inputs: AdditionalInput[];
    n_g_sign_transactions: any[];
    display_name: string;
    reference_number: string | null;
    conditions: string;
    
    totals: {
      discount: string;
      total: string;
      taxes: string;
      subtotal: string;
    };
    
    display: {
      billing: number;
      unity: number;
      delivery: number;
      conditions: number;
      stamp: number;
      description: number;
      bank: number;
      pictures: number;
      selected_bank: string;
      ttc: number;
    };
    
    company: {
      title: string;
      hashed_id: string;
      logo: string | null;
      fiscal_id: string;
      billing_address: string | null;
      delivary_address: string | null;
      phone: string;
      status: number;
      language: string;
      use_stamp: number;
      stamp: string | null;
    };
    
    withhold: number;
    show_unity: number;
    
    client: {
      display_name: string;
      hashed_contact_id: string;
      additional_contact_id: string | null;
      email?: string;
      country_title?: string;
      billing_address: string | null;
      delivary_address: string | null;
    };
    
    items: Array<{
      hashed_id: string;
      temporary_item: string;
      rate: string;
      quantity: number;
      description: string;
      discount_rate: string;
      taxes?: Array<{
        hashed_id: string;
        title: string;
        rate: number;
      }>;
    }>;
    
    attachments: Array<{
      id: string;
      name: string;
      path: string;
      size: number;
      mime_type: string;
    }>;
    
    currency_rate: number;
    language: string;
    notes: string;
    object: string | null;
    watermark: string | null;
    tax_type: number;
    hashed_invoice_category_id: string;
    hashed_invoice_id: string | null;
  }
  
  // Fonctions utilitaires
  export const formatEstimateDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString.split('-').reverse().join('-')).toLocaleDateString('fr-FR', options);
  };
  
  export const getEstimateStatusText = (status: number): string => {
    switch (status) {
      case 0: return 'Brouillon';
      case 1: return 'ValidÃ©';
      default: return 'Inconnu';
    }
  };
  
  export const getEstimateStatusClass = (status: number): string => {
    switch (status) {
      case 0: return 'status-draft';
      case 1: return 'status-valid';
      default: return 'status-unknown';
    }
  };
  
  export const formatEstimateCurrency = (value: number | string, currency: string = 'EUR'): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };
