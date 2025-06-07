import { Disbursement } from './DisbursementModel';
import { Invoice, AttachmentData } from '@/models/InvoicesModel';

export interface Payment {
  date: string;
  type: number;
  reference: string | null;
  notes: string | null;
  bank_fee: string;
  total: string;
  currency_rate: number;
  language: string;
  display: string;
  hashed_id: string;
  hashed_contact_id: string;
  hashed_bank_id: string;
  hashed_company_id: string;
  hashed_company_payment_method_id: string;
  hashed_journal_entry_id: string;
  payment_number: string;
  naming_series_prefix: string;
  naming_series_formatted_number: number;
  invoices: Invoice[];
  disbursements: Disbursement[];
  contact: {
    display_name: string;
    hashed_id: string;
    currency: {
      symbol: string;
      iso_code: string;
    };
  };
  method: PaymentMethod[];
  bank?: {
    bank: string;
    hashed_id: string;
  };
  attachments: (File | AttachmentData)[];
}

export interface PaymentMethod {
  hashed_id: string;
  title: string;
  type: number;
}


export interface PaymentForm {
  date: string
  paid: number;
  payment_number: string;
  client_id: string;
  payment_method: string;
  reference: string;
  notes: string;
  bank_fee?: number;
  bankTaxId?: string;
  bank_id?: string;
  language: string;
  use_stamp: number;
  currency_rate?: number;
  attachments?: (File | AttachmentData)[];
  pay: Array<{
    invoice_hashed_id: string;
    disbursement_hashed_id: string;
    amount: number;
  }>;
}