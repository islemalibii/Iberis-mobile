export interface Discount {//sure
    value: number;
    type: '%' | '0.0';
  }
  
  export interface ItemTax {//sure
    hashed_id: string;
    title: string;
    rate?: number;
  }
  
  // Voucher Item
  export interface VoucherItem {//sure
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: Discount;
    taxes: ItemTax[];
    price?: number;
  }
  
  
  
  
  export interface ExitVoucher {//sure
    hashed_id: string;
    exit_voucher_number: string;
    date: string;
    created_at: string;
    updated_at: string;
    tax_type: number;
    status: number;
    language: string;
    currency_rate: number;
    notes:string|null;
    // Content
    reference_number: string ;
    conditions: string;
    object: string ;
    watermark: string | null;
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
      document_name:string|null;
     client: {
        display_name: string;
        hashed_contact_id: string;
        additional_contact_id: string | null;
        email?: string;
        country_title?: string;
        billing_address: string | null;
        delivary_address: string | null;
      };
      withhold:number;
  
      items: Array<{
        hashed_id: string;
        temporary_item: string;
        rate: string;
        quantity: number;
        description: string;
        discount_rate:  string;
      }>;
      hashed_invoice_category_id:string;
   attachments: Array<{
        id: string;
        name: string;
        path: string;
        size: number;
        mime_type: string;
      }>;
    
    total: number;
    total_formatted?: string;
    display_name?: string;
  }
  
  
  
  export interface AddExitVoucherForm {//sure
  
    choice: number;//
    date: string;//
    client_id: string;//
    items: VoucherItem[];//
    tax_type: number;//
    language: string;//
    currency_rate: number;//
    remarks:string;//
    use_conditions :number;//
  
    // Optional fields
    ExitVoucher_number?: string;//
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
  
  export const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'  
    }).format(value);
  };
  
  export function formatExitVoucherDate(dateString: string): string {
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
  }
  
  export function getExitVoucherStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'Brouillon',
      1: 'Validé',
      2: 'Facturé'
    };
    return statusMap[status] || 'Inconnu';
  }
  
  export function getExitVoucherStatusClass(status: number): string {
    const classMap: Record<number, string> = {
      0: 'status-draft',
      1: 'status-validated',
      2: 'status-invoiced'
    };
    return classMap[status] || 'status-unknown';
  }
  
  
  
  
  
  /*
  
  
  
  
  
  export interface CreateExitVoucherApiResponse {
    data: {
      exit_voucher: ExitVoucher;
    };
    status: ApiStatus;
  }
  
  export interface ExitVouchersApiResponse {
    data: {
      exit_vouchers: ExitVouchersData;
    };
    status: ApiStatus;
  }
  export interface Discount{
    value:number;
    type:'%'| '0.0';
  }
  
  
  export interface ExitVouchersData {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: ExitVoucher[];
  }
  
  export interface ApiStatus {
    message: string;
    code: number;
  }
  export interface ItemTax {
    hashed_id:string;
    title:string;
    rate?:number;
  
  }
  export interface VoucherItem {
    id:string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: Discount;
  taxes:ItemTax[];
    price?: number;
   
  }
  export interface AdditionalEntries {
  tva:number;
  
  }
  export interface AddExitVoucherForm {
    choice:number;//
    date:string,//
    document_name?: string;
    ExitVoucher_number: string; // 
    hashed_id: string;
     display: {
       billing: number,
        unity: number,
        delivery: number,
        conditions: number,
        stamp: number,
        description: number,
        bank: string,
        pictures: number,
        selected_bank: string,
        ttc: number;
    };
  
    items: VoucherItem[];//
    tax_type: number;//
      generalTerms:string,
  
    status: number;
    language: string;//
    currency_rate: number;//
    referenceNumber: string; // 
    conditions: string | null;//
    notes: string | null;//
    object: string | null;//
    watermark: string | null;
    totals:{
      discount:string;
      total:string;
      taxes:string;
      subtotal:string;
    };
  
    total?: number;
    client_Id: string;//
    company?: any;
    additional_contact_id: string;
    attachments?: File[];
    selected_bank:string;
    AdditionalEntries:{
      tva:number;
    }
    show_unity:number;//
    show_stamp: number;//
    show_billing: number;//
    show_delivery: number;//
    show_bank: number;//
    show_conditions: number;//
    show_description: number;//
    show_prices:number;
    showArticleUnit:number;
    showArticleTTCPrices:number;
    show_pictures: number;//
    bank_id?: string;//
    use_conditions?: number;//
    category:string;
  }
  
  export interface ExitVoucher {
    document_name?: string;
    exit_voucher_number: string;
    hashed_id: string;
    naming_series_prefix: string;
    naming_series_formatted_number: number;
    naming_series_composed_number: string;
    naming_series_dynamic: string | number; 
    items: VoucherItem[];
    date: string; 
      created_at: string;
    updated_at: string;
  
    tax_type: string | number;  
    status: number;
    language: string;
    currency_rate: string | number;  // API returns this as string
  
    // Content
    reference_number: string | null;
    conditions: string ;
    notes: string | null;
    object: string | null;
    watermark: string | null;
  
    totals: {
  
     discount:string;
      total:string;
      taxes:string;
      subtotal:string;
    }
  
    display: {
       billing: number,
        unity: number,
        delivery: number,
        conditions: number,
        stamp: number,
        description: number,
        bank: string,
        pictures: number,
        selected_bank: string,
        ttc: number,
  
    };
  
    hashed_contact_id: string;
    hashed_contact_additional_id: string | null;
    hashed_company_id: string;
    hashed_invoice_category_id: string;
    hashed_invoice_id: string | null;
  
    total?: number;
    total_formatted?: string;
    display_name?: string;
    action?: string;?: string;
    clientHashedId?: string;
  
    company?: any;
    contact?: any;
    additional_inputs?: any[];
    attachments: Array<{
  id:string;
  name:string;
  path:string;
  size:number;
  mime_type:string;
  
    }>;
    invoice?: any | null;
  }
  
  
  export function parseExitVoucher(voucher: ExitVoucher): ParsedExitVoucher {
    // Parsing sécurisé des totaux
    const parseTotals = (totals: any) => {
      if (typeof totals === 'string') {
        try {
          return JSON.parse(totals.replace(/&quot;/g, '"'));
        } catch {
          return { discount: '0', total: '0', taxes: '0', subtotal: '0' };
        }
      }
      return totals || {};
    };
  
    // Parsing sécurisé des affichages
    const parseDisplay = (display: any) => {
      if (typeof display === 'string') {
        try {
          return JSON.parse(display.replace(/&quot;/g, '"'));
        } catch {
          return {
            billing: 1,
            unity: 1,
            delivery: 0,
            conditions: 0,
            stamp: 1,
            description: 1,
            bank: 0,
            pictures: 1
          };
        }
      }
      return display || {};
    };
  
    return {
      ...voucher,
      totals: parseTotals(voucher.totals),
      display: parseDisplay(voucher.display)
    };
  }
  /*
  // Fonctions utilitaires
  export function parseExitVoucher(voucher: ExitVoucher): ParsedExitVoucher {
    try {
      // Vérifier que les propriétés `totals` et `display` sont des chaînes valides avant de les parser
      const parsedTotals = voucher.totals ? JSON.parse(voucher.totals.replace(/&quot;/g, '"')) : {};
      const parsedDisplay = voucher.display ? JSON.parse(voucher.display.replace(/&quot;/g, '"')) : {};
  
      return {
        ...voucher,
        totals: parsedTotals,
        display: parsedDisplay
      };
    } catch (error) {
      console.error('Error parsing exit voucher:', error);
      throw new Error('Failed to parse exit voucher data');
    }
  }
  */
  /*
  export function formatExitVoucherDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  export function getExitVoucherStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'Brouillon',
      1: 'Validé',
      2: 'Facturé'
    };
    return statusMap[status] || 'Inconnu';
  }
  
  export function getExitVoucherStatusClass(status: number): string {
    const classMap: Record<number, string> = {
      0: 'status-draft',
      1: 'status-validated',
      2: 'status-invoiced'
    };
    return classMap[status] || 'status-unknown';
  }
  /*
  export interface CreateExitVoucherApiResponse {
    data: {
      exit_voucher: ExitVoucher;
    };
    status: ApiStatus;
  }
  
  export interface ExitVouchersApiResponse {
    data: {
      exit_vouchers: ExitVouchersData;
    };
    status: ApiStatus;
  }
  
  export interface VoucherItemTax {
    tax_hashed_id: string;
    rate: number;
    title?: string; // Ajouté pour l'affichage
  }
  
  
  
  export interface ExitVouchersData {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: ExitVoucher[];
  }
  
  export interface ApiStatus {
    message: string;
    code: number;
  }
  
  
  
  
  export interface AddExitVoucherForm {
    choice:number;
    date:string,
  
    document_name?: string;
    ExitVoucher_number: string; // Nouveau champ
    hashed_id: string;
    items: VoucherItem[];
    created_at: string;
    updated_at: string;
    tax_type: number;
    status: number;
    language: string;
    currency_rate: number;
    referenceNumber: string; // Corrigé en string
    conditions: string | null;
    notes: string | null;
    object: string | null;
    watermark: string | null;
    totals:{
      discount:string;
      total:string;
      taxes:string;
      substotal:string;
  
    };
    total?: number;
    client_Id: string;
    company?: any;
    contact?: any;
    additional_inputs?: any[];
    attachments?: File[];
  selected_bank:string;
  AdditionalEntries:{
    tva:number;
  }
    show_stamp: number;
    show_billing: number;
    show_delivery: number;
    show_bank: number;
    show_conditions: number;
    show_description: number;
    showArticleUnit:number;
    showArticleTTCPrices:number;
    show_pictures: number;
    bank_id?: string;
    use_conditions?: number;
    category:string;
    remarks:string;
  }
  
  
  export interface ExitVoucher {
    hashed_id:string;
    ExitVoucher_number:string;
    document_name?: string;
    exit_voucher_number: string;
    raw_exit_voucher_number: string; // Nouveau champ
    naming_series_prefix: string;
    naming_series_formatted_number: number;
    naming_series_composed_number: string;
    naming_series_dynamic: number;
    date: string;
    created_at: string;
    updated_at: string;
    type:number;
    tax_type: number;
    status: number;
    language: string;
    currency_rate: number;
    reference_number: string; // Corrigé en string
    conditions: string | null;
    notes: string | null;
    object: string | null;
    watermark: string | null;
    total: string;
    display:{
      billing:number;
      unity:number;
      delivery:number;
      conditions:number;
      stamp:number;
      description:number;
      bank:string;
  pictures:number;
  selected_bank:string;
  ttc:number;
  
    };
    totals:{
  
    discount:string;
      total:string;
      taxes:string;
      substotal:string;
    };
  
    total_formatted?: string;
    action: string;
    exitVoucherHashedId?: string;
    clientHashedId?: string;
    company?: any;
    contact?: any;
    additional_inputs?: any[];
    attachments?: any[];
    invoice?: any | null;
    show_stamp: number;
    show_billing: number;
    show_delivery: number;
    show_bank: number;
    show_conditions: number;
    show_description: number;
    show_pictures: number;
    bank_id?: string;
    use_conditions?: number;
    items:Array<{
        hashed_id:string;
        temporary_item:string;
        rate:string;
        quantity:number;
        description:string;
        discount_rate:string;
      
      }>;
  
    
    client:{
  display_name:string;
  hashed_contact_id:string;
  additional_contact_id:string|null;
  email?:string;
  country_title?:string|null;
  billing_adress:string|null;
  delivary_adress:string|null;
    }
    attachements:Array<{
      id:string;
      nam:string;
  path:string;
  size:number;
  mime_type:string;
    }>;
  }
  
  export interface ParsedExitVoucher extends Omit<ExitVoucher, 'totals' | 'display'> {
    totals: {
      discount: number;
      total: number;
      taxes: number;
      subtotal: number;
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
      prices?: number;
      ttc?: number;
    };
  }
  
  export function parseExitVoucher(voucher: ExitVoucher): ParsedExitVoucher {
    try {
      // Extraction de la partie numérique du numéro de bon
      const extractVoucherNumber = (fullNumber: string) => {
        const parts = fullNumber.split('-');
        return parts.length === 3 ? parts[2] : fullNumber;
      };
  
      const parsedTotals = typeof voucher.totals === 'string' 
        ? JSON.parse(voucher.totals.replace(/&quot;/g, '"')) 
        : voucher.totals;
  
      const parsedDisplay = typeof voucher.display === 'string'
        ? JSON.parse(voucher.display.replace(/&quot;/g, '"'))
        : voucher.display;
  
      return {
        ...voucher,
        raw_exit_voucher_number: extractVoucherNumber(voucher.exit_voucher_number),
        totals: {
          discount: Number(parsedTotals.discount) || 0,
          total: Number(parsedTotals.total) || 0,
          taxes: Number(parsedTotals.taxes) || 0,
          subtotal: Number(parsedTotals.subtotal) || 0
        },
        display: parsedDisplay
      };
    } catch (error) {
      console.error('Error parsing exit voucher:', error);
      return {
        ...voucher,
        raw_exit_voucher_number: '',
        totals: {
          discount: 0,
          total: 0,
          taxes: 0,
          subtotal: 0
        },
        display: {
          billing: 1,
          unity: 1,
          delivery: 0,
          conditions: 0,
          stamp: 1,
          description: 1,
          bank: 0,
          pictures: 1,
          prices: 0,
          ttc: 0
        }
      };
    }
  }
  
  // Les fonctions restantes restent inchangées
  
  export function formatExitVoucherDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  export function getExitVoucherStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'Brouillon',
      1: 'Validé',
      2: 'Facturé'
    };
    return statusMap[status] || 'Inconnu';
  }
  
  export function getExitVoucherStatusClass(status: number): string {
    const classMap: Record<number, string> = {
      0: 'status-draft',
      1: 'status-validated',
      2: 'status-invoiced'
    };
    return classMap[status] || 'status-unknown';
  }*/