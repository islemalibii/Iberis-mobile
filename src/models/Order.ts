export interface Discount {
    value: number;
    type: '%' | 'fixed';
  }
  
  export interface ItemTax {
    hashed_id: string;
    title: string;
    rate?: number;
  }
  
  export interface OrderItem {
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
  
  export interface OrderContact {
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
  
  export interface OrderDisplaySettings {
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
  
  export interface OrderTotals {
    discount: string;
    total: string;
    taxes: string;
    subtotal: string;
  }
  
  export interface PurchaseOrder {
    hashed_id: string;
    order_number: string;
    date: string;
    created_at: string;
    updated_at: string;
    status: number;
    reference_number: string | null;
    conditions: string;
    totals: OrderTotals;
    currency_rate: number;
    display: OrderDisplaySettings;
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
    contact: OrderContact;
    items: OrderItem[];
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
  
  export interface AddPurchaseOrderForm {
    date: string;
    provider_id: string;
    items: OrderItem[];
    tax_type: number;
    language: string;
    currency_rate: number;
    remarks: string;
    use_conditions: number;
    order_number?: string;
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
    totals: OrderTotals;
  }
  
  export const getOrderStatusClass = (status: number): string => {
      const statusMap: Record<number, string> = {
          0: 'status-draft',
          1: 'status-valid',
          2: 'status-sent',
          3: 'status-cancelled'
      };
      return statusMap[status] || 'status-draft';
  };
  
  export const getOrderStatusText = (status: number): string => {
      const textMap: Record<number, string> = {
          0: 'Brouillon',
          1: 'Valide',
          2: 'Facturé',
          3: 'Annulé'
      };
      return textMap[status] || 'Inconnu';
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
          const [day, month, year] = dateString.split('-');
          const date = new Date(`${year}-${month}-${day}`);
          return date.toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          });
      } catch {
          return 'N/A';
      }
  };