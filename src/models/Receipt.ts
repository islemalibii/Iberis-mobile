export interface Discount {
    value: number;
    type: '%' | '0.0';
  }
  
  export interface ItemTax {
    hashed_id: string;
    title: string;
    rate?: number;
  }
  
  export interface ReceiptNoteItem {
      id: string;
      title: string;
      description: string;
      quantity: number;
      unitPrice: number;
      price?: number;
      discount: Discount;
      taxes: ItemTax[];
  }
  
  export interface ReceiptNote {
      category_id:string;
      hashed_id: string;
      receipt_number: string;
      document_name: string;
      date: string;
      created_at: string;
      updated_at: string;
      status: number;
      total: number;
      total_formatted: string;
      notes: string | null;
      object: string | null;
      conditions: string;
      watermark: string | null;
      tax_type: number;
      currency_rate: number;
      language: string;
      reference_number: string | null;
      naming_series_prefix: string;
      naming_series_formatted_number: number;
      naming_series_composed_number: string;
      naming_series_dynamic: number;
      display: {
          billing: number;
          unity: number;
          conditions: number;
          stamp: number;
          description: number;
          bank: string;
          pictures: number;
          selected_bank?: string;
          ttc?: number;
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
          delivery_address: string | null;
          phone: string;
          status: number;
          language: string;
          use_stamp: number;
          stamp: string | null;
      };
      hashed_expense_category_id: string;
      hashed_expense_id: string | null;
      hashed_contact_id: string;
      hashed_contact_additional_id: string | null;
      hashed_company_id: string;
      display_name: string;
      provider: {
          display_name: string;
          hashed_contact_id: string;
          additional_contact_id: string | null;
          email?: string;
          country_title?: string;
          billing_address: string | null;
          delivery_address: string | null;
      };
      attachments?: Array<{
          id: string;
          name: string;
          path: string;
          size: number;
          mime_type: string;
      }>;
      items: Array<{
          hashed_id: string;
          temporary_item: string;
          rate: string;
          quantity: number;
          description: string;
          discount_rate: string;
      }>;
  }
  
  export interface AddReceiptNoteForm {
      choice: number;
      date: string;
      category_id:string;
      provider_id: string;
      items: ReceiptNoteItem[];
      tax_type: number;
      language: string;
      currency_rate: number;
      remarks: string;
      use_conditions: number;
      receipt_number?: string;
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
      totals: {
          discount: string;
          total: string;
          taxes: string;
          subtotal: string;
      };
      AdditionalEntries: {
          tva: number;
      };
  }
  
  // Fonction pour convertir les nombres en lettres (pour le total en alphabétique)
  export const numberToWords = (num: number): string => {
      const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
      const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
      const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
      
      if (num === 0) return 'zéro';
      
      let result = '';
      
      if (num >= 100) {
          result += units[Math.floor(num / 100)] + ' cent ';
          num %= 100;
      }
      
      if (num >= 20) {
          result += tens[Math.floor(num / 10)] + ' ';
          num %= 10;
      } else if (num >= 10) {
          result += teens[num - 10] + ' ';
          num = 0;
      }
      
      if (num > 0) {
          result += units[num] + ' ';
      }
      
      return result.trim() + ' dinars';
  };
  
  export const getReceiptStatusClass = (status: number): string => {
      const statusMap: Record<number, string> = {
          0: 'status-draft',
          1: 'status-valid',
          2: 'status-sent',
          3: 'status-cancelled'
      };
      return statusMap[status] || 'status-draft';
  };
  
  export const getReceiptStatusText = (status: number): string => {
      const textMap: Record<number, string> = {
          0: 'Brouillon',
          1: 'Valide',
          2: 'Envoyé',
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