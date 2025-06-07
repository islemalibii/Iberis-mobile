export interface Activity {
    title: string;
    hashed_id: string;
}
export interface Country {
    status: number;
    title: string;
    iso_2: string;
    iso_3: string;
    iso_on: string;
    hashed_id: string;
    hashed_currency_id: string;
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
    hashed_id: string;
}
export interface AccountingPeriod {
    title: string;
    hashed_id: string;
}
export interface WithholdingType {
    rate: number;
    title: string;
    created_at: string;
    updated_at: string;
    usageCount: number;
    isUsed: boolean;
    hashed_id: string;
    hashed_company_id: string;
    hashed_sales_journal_id: string;
    hashed_purchases_journal_id: string;
    formatted_title: string;
}
  
export interface CompanyFormData {
    title: string;      
    logo?: File | null;        
    country_id: string;          
    activity_id: string;         
    default_currency_id: string;
    accounting_period_id: string;
    language?: string;         
    address?: string;        
    state?: string;     
    zip_code?: string;         
    fiscal_id?: string;        
    phone?: string;
}
export interface Company {
    hashed_id: string;
    title: string;
    logo?: string | null;
    fiscal_id?: string;
    address?: string;
    state?: string;
    zip_code?: string;
    phone?: string;
    website?: string | null;
    status?: number;
    language?: string;
    accounting_period_id?: number;
    hashed_activity_id?: string;
    hashed_country_id?: string;
    hashed_default_currency_id?: string;
    created_at?: string;
    updated_at?: string;
  }