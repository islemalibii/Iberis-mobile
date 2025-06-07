export interface Discount {
    value: number;
    type: '%' | 'fixed';
  }
  
  export interface ItemTax {
    hashed_id: string;
    title: string;
    rate?: number;
  }
  
  export interface ServiceItem {
    id: string;
    hashed_id: string;
    hashed_item_id: string;
    title: string;
    description: string;
    quantity: number;
    rate: number;
    discount?: Discount;
    taxes: ItemTax[];
    price?: number;
    temporary_item?: string | null;
    item_price_list_id?: number;
  }
  
  export interface ServiceContact {
    hashed_id: string;
    display_name: string;
    organisation: string;
    email?: string | null;
    phone?: string | null;
    billing: {
      address?: string;
      bill_state?: string;
      zip_code?: string;
      country_id?: string;
      country_title?: string;
    };
    delivery: {
      address?: string;
      bill_state?: string;
      zip_code?: string;
      country_id?: string;
      country_title?: string;
    };
  }
  
  export interface ServiceDisplaySettings {
    billing: number;
    unity: number;
    conditions: number;
    stamp: number;
    description: number;
    bank: number;
    pictures: number;
    selected_bank?: string;
    ttc?: number;
  }
  
  export interface ServiceTotals {
    discount: string;
    total: string;
    taxes: string;
    subtotal: string;
    total_formatted?: string;
    withhold_formatted?: string;
    currency_symbol?: string;
  }
  
  // Interface pour les retenues à la source
  export interface WithholdingTax {
    hashed_id: string;
    title: string;
    rate: number;
    amount: string;
    amount_formatted?: string;
  }
  
  // Interface pour les paiements liés au service
  export interface ServicePayment {
    id: string;
    hashed_id: string;
    amount: string;
    amount_formatted?: string;
    date: string;
    payment_method?: string;
    reference?: string;
  }
  
  export interface ServicePurchase {
    hashed_id: string;
    date: string;
    created_at: string;
    updated_at: string;
    status: number; // 0 = draft, 1 = valid, 2 = unknown, 3 = sent
    reference_number: string | null;
    conditions: string;
    totals: ServiceTotals;
    currency_rate: number;
    display: ServiceDisplaySettings;
    language: string;
    notes: string | null;
    object: string | null;
    watermark: string | null;
    tax_type: number;
    naming_series_prefix: string;
    naming_series_formatted_number: number;
    naming_series_composed_number: string;
    naming_series_dynamic: number;
    hashed_contact_id: string;
    hashed_contact_additional_id: string | null;
    hashed_company_id: string;
    hashed_expense_category_id: string;
    hashed_expense_id: string | null;
    hashed_withholding_tax_type_id?: string;
    
    // Relations
    contact: ServiceContact;
    items: ServiceItem[];
    withholding_tax?: WithholdingTax;
    payments?: ServicePayment[];
    
    // Champs calculés (basés sur la documentation API)
    total: string;
    summedPayments: string;
    summedWithholds: string;
    unpaid: string;
    total_formatted: string;
    withhold_formatted: string;
    currency_symbol: string;
    
    // Champs optionnels
    additional_inputs?: Array<{
      title: string;
      value: string;
      type: number;
    }>;
    attachments?: Array<{
      id: string;
      name: string;
      path: string;
      size: number;
      mime_type: string;
    }>;
  }
  
  // Interface pour le formulaire d'ajout de service
  export interface AddServicePurchaseForm {
    date: string;
    provider_id: string;
    items: ServiceItem[];
    tax_type: number;
    language: string;
    currency_rate: number;
    remarks: string;
    use_conditions: number;
    service_number?: string;
    referenceNumber: string;
    notes?: string;
    object: string | null;
    watermark: string | null;
    attachments: File[];
    category: string;
    generalTerms: string;
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
    totals: ServiceTotals;
    withholding_tax_type_id?: string;
  }
  
  // Interface pour les paramètres de requête de l'API
  export interface ServiceListParams {
    companyId: string;
    contactHashedId?: string;
    status?: number; // 0 = draft, 1 = valid, 2 = unknown, 3 = sent
    documentName?: string;
    filterByDate?: number; // 0 = service date, 1 = created_at, 2 = updated_at
    fromDate?: string; // Format: YYYY-MM-DD
    toDate?: string; // Format: YYYY-MM-DD
    withholdingTaxType?: string;
  }
  
  // Interface pour la réponse de l'API
  export interface ServiceListResponse {
    data: {
      services: any; // Format DataTables
    };
    message: string;
    status: {
      code: number;
    };
  }
  
  // Fonctions utilitaires pour les services
  export const getServiceStatusClass = (status: number): string => {
    const statusMap: Record<number, string> = {
      0: 'status-draft',
      1: 'status-valid',
      2: 'status-unknown',
      3: 'status-sent'
    };
    return statusMap[status] || 'status-draft';
  };
  
  export const getServiceStatusText = (status: number): string => {
    const textMap: Record<number, string> = {
      0: 'Brouillon',
      1: 'Valide',
      2: 'Inconnu',
      3: 'Envoyé'
    };
    return textMap[status] || 'Inconnu';
  };
  
  export const getDateFilterTypeText = (filterType: number): string => {
    const filterMap: Record<number, string> = {
      0: 'Date du service',
      1: 'Date de création',
      2: 'Date de modification'
    };
    return filterMap[filterType] || 'Date du service';
  };
  export const formatCurrency = (amount: string | number) => {
      const value = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
      }).format(value);
  };
  
  
  export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };
  
  export const calculateUnpaidAmount = (service: ServicePurchase): number => {
    const total = parseFloat(service.total);
    const payments = parseFloat(service.summedPayments || '0');
    const withholds = parseFloat(service.summedWithholds || '0');
    return total - payments - withholds;
  };