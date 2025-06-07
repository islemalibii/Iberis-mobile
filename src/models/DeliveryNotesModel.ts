export interface Discount {//sure
    value: number;
    type: '%' | '0.0';
  }
  export interface ItemTax {//sure
    hashed_id: string;
    title: string;
    rate?: number;
  }
  export interface DeliveryNoteItem {
      id: string;
      title: string;
      description: string;
      quantity: number;
      unitPrice: number;
      price?: number;
      discount:Discount;
      taxes: ItemTax[];
   
  }
  
  export interface DeliveryNote {
      hashed_id: string;//
      delivery_number: string;//
      date: string;//
      created_at: string;//
      updated_at: string;//
      due: string;
      status: number;//
      total: number;//
      total_formatted: string;//
      notes: string | null;//
      object: string ;//
      conditions: string;//
      watermark: string;//
      tax_type: number;//
      currency_rate: number;//
      language: string;//
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
      hashed_invoice_category_id: string;//
      document_name: string | null;//
      withhold:number;//
      display_name?: string;//
      reference_number: string ;//
      attachments: Array<{
          id: string;
          name: string;
          path: string;
          size: number;
          mime_type: string;
      }>;
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
      }>;
  }
  
  
  
  export interface AddDeliveryNoteForm {//sure
    choice: number;//
    date: string;//
    client_id: string;//
    items: DeliveryNoteItem[];//
    tax_type: number;//
    language: string;//
    currency_rate: number;//
    remarks:string;//
    use_conditions :number;//
  
    DeliveryNote_number?: string;//
    referenceNumber: string;//
    notes?: string;//
    object: string ;
    watermark: string ;//
    attachments: File[];//
  
    category: string;//
    generalTerms:string;//
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
  
  
    totals: {//
      discount: string;
      total: string;
      taxes: string;
      subtotal: string;
    }; 
     AdditionalEntries: {
      tva: number;
    };
  }
  // Ajoutez cette fonction pour convertir les nombres en lettres (pour le total en alphabetique)
  export const numberToWords = (num: number): string => {
      const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
      const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
      const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
      
      if (num === 0) return 'zÃ©ro';
      
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
  
  export const getDeliveryStatusClass = (status: number): string => {
      const statusMap: Record<number, string> = {
        0: 'status-draft',
        1: 'status-valid',
        2: 'status-sent',
        3: 'status-cancelled'
      };
      return statusMap[status] || 'status-draft';
    };
  
  export const getDeliveryStatusText = (status: number): string => {
      const textMap: Record<number, string> = {
        0: 'Draft',
        1: 'Valid',
        2: 'Invoiced', 
        3: 'Cancelled'
      };
      return textMap[status] || 'Unknown';
    };
  
  export const formatCurrency = (amount: string | number) => {
      const value = typeof amount === 'string' ? parseFloat(amount) : amount;
      return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
      }).format(value);
  };
  
  export const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
          const [day, month, year] = dateString.split('-');
          const date = new Date(`${year}-${month}-${day}`);
          return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          });
      } catch {
          return 'N/A';
      }
  };
