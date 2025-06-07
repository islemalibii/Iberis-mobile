export interface Invoice {
    hashed_id: string;
    invoice_number: string;
    date: string; 
    due: string; 
    status: number; 
    type: number; 
    total: number | string;
    formattedTotal?: string;
    paid: number;
    unpaid?: number | string;
    toPay: string;
    display_name: string;
    credited: number;
    notes: string | null;
    object: string | null;
    conditions: string;
    watermark: string;
    tax_type: number; 
    currency_rate: number;
    language: string; 
    withholding_tax_deducted: string;
    withhold: number;
    recurrence: number;
    recurrence_start: string | null;
    recurrence_type: string | null;
    recurrence_each: number | null;
    recurrence_end: string | null;
    recurrence_of: string | null;
    recurrence_next: string | null;
    display: {
      billing: number;
      unity: number;
      delivery: number;
      conditions: number;
      stamp: number;
      description: number;
      bank: string;
      pictures: number;
      selected_bank: string;
      ttc: number;
    };
    totals: {
      discount: string;
      total: string;
      taxes: string;
      subtotal: string;
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
    summedPayments: string;
    countedPayments?: number | string;
    summedCredits?: number | string;
    hashed_invoice_category_id: string;
    hashed_withholding_type_id: string | null;
    hashed_journal_entry_id: string;
    hashed_withholding_journal_entry_id: string | null;
    hashed_invoice_deadline_id: string;
    document_name: string | null;
    order_number: string | null;
    withholding_path: string;
    attachments: Array<{
      id: string;
      name: string;
      path: string;
      size: number;
      mime_type: string;
    }>;
    action: string;
    invoiceHashedId: string;
    additionalContact: any | null;
    journal_entry?: {
      entry_number: string;
      elements: Array<{
        description: string;
        rate: number;
        journal: {
          title: string;
        };
      }>;
    };
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
      discount_rate:  string;

    }>;
}
export interface AttachmentData {
  file: string;
  hashed_id: string;
  hashed_invoice_id: string;
}

export interface AddInvoiceForm {
  choice: number;
  date: string;
  due: string;
  deadline: string;
  use_conditions :number;
  category: string;
  object: string;
  invoice_number:string;
  client_id: string;
  referenceNumber: string;
  tax_type: number; 
  items: InvoiceItem[];
  currency_rate: number;
  generalTerms: string;
  attachments: (File | AttachmentData)[];
  totals: {
    discount: string;
    total: string;
    taxes: string;
    subtotal: string;
  };
  watermark: string;
  language: string;
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
  withholdingTitle:string;
  withholding_type_id: string;
  additionalEntries: {
    tva: number;
    fiscalStamp: number;
    exemple: number;
  };
  recurrence: number;
  recurrence_start: string;
  recurrence_end: string;
  recurrence_each: number;
  recurrence_type: number;
  remarks: string;
}

export interface InvoiceItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount:Discount;
  taxes: ItemTax[];
  price: number;
  journal_id: string;
}

export interface ItemTax {
  hashed_id: string;
  title: string;
  rate?: number; 
}

interface Discount {
  value: number;
  type: '%' | '0.0';
}

export interface SendInvoiceRequest {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  message: string;
  ngsign_include?: boolean;
  attachments?: any[];
}

export interface SendWhatsAppRequest {
  phone: string;
  message: string;
  attachmentUrl?: string;
}

export type AdditionalEntries = {
  tva: number;
  fiscalStamp: number;
  exemple: number;
};

export interface MonthlyRevenue {
  month: string; 
  amount: number;
  invoiceCount: number;
}

export interface RevenueAnalysis {
  currentMonth: number;
  previousMonth: number;
  growthPercentage: number;
  monthlyTrend: MonthlyRevenue[];
}