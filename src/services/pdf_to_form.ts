// src/services/pdf_to_form.ts
import type { AddInvoiceForm, InvoiceItem } from '@/models/InvoicesModel';

// Define interfaces for better type safety
interface ExtractedData {
  [key: string]: any;
}

interface MappingOptions {
  clients?: any[];
  categories?: any[];
  deadlines?: any[];
  banks?: any[];
  onClientSelected?: (id: string) => void;
  addArticleForm?: () => void;
  updateTotals?: () => void;
  selectedJournalId?: string; 
  addDirectItemFromPdf?: (itemData: any) => void;  
}

export const pdfFormMappingService = {
  /**
   * Maps extracted PDF data to form fields
   */
  mapExtractedDataToForm(data: ExtractedData, invoiceForm: AddInvoiceForm, options: MappingOptions): void {
    console.log('Mapping PDF data to form:', data);
    
    // Process dates
    this.processDateFields(data, invoiceForm);
    
    // Process text fields
    this.processTextFields(data, invoiceForm);
    
    // Process select fields
    this.processSelectFields(data, invoiceForm, options);
    
    // Process toggle fields
    this.processToggleFields(data, invoiceForm);
    
    // Process recurrence fields
    this.processRecurrenceFields(data, invoiceForm);
    
    // Process invoice item
    this.processInvoiceItem(data, invoiceForm, options);
    
    // Update totals
    if (options.updateTotals) {
      options.updateTotals();
    }
    
    console.log('Form after mapping:', JSON.stringify(invoiceForm));
  },

  /**
   * Process date fields
   */
  processDateFields(data: ExtractedData, invoiceForm: AddInvoiceForm): void {
    // Helper to convert date string to YYYY-MM-DD format
    const formatDate = (dateStr: string): string | null => {
      if (!dateStr) return null;
      
      // Check for DD/MM/YYYY format
      const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
      if (ddmmyyyyMatch) {
        const day = ddmmyyyyMatch[1].padStart(2, '0');
        const month = ddmmyyyyMatch[2].padStart(2, '0');
        const year = ddmmyyyyMatch[3].length === 2 ? `20${ddmmyyyyMatch[3]}` : ddmmyyyyMatch[3];
        return `${year}-${month}-${day}`;
      }
      
      return null;
    };
    
    // Process invoice date
    if (data.date) {
      const formattedDate = formatDate(data.date);
      if (formattedDate) {
        invoiceForm.date = formattedDate;
        console.log('Set invoice date:', formattedDate);
      }
    }
    
    // Process due date
    if (data.due_date) {
      const formattedDueDate = formatDate(data.due_date);
      if (formattedDueDate) {
        invoiceForm.due = formattedDueDate;
        console.log('Set due date:', formattedDueDate);
      }
    }
    
    // Process recurrence dates
    if (data.recurrence_start) {
      const formattedStart = formatDate(data.recurrence_start);
      if (formattedStart) invoiceForm.recurrence_start = formattedStart;
    }
    
    if (data.recurrence_end) {
      const formattedEnd = formatDate(data.recurrence_end);
      if (formattedEnd) invoiceForm.recurrence_end = formattedEnd;
    }
  },

  /**
   * Process text fields
   */
  processTextFields(data: ExtractedData, invoiceForm: AddInvoiceForm): void {
    // Simple text fields
    if (data.object) {
      invoiceForm.object = data.object;
      console.log('Set object:', data.object);
    }
    
    if (data.reference_number) {
      invoiceForm.referenceNumber = data.reference_number;
      console.log('Set reference number:', data.reference_number);
    }
    
    if (data.general_terms) {
      invoiceForm.generalTerms = data.general_terms;
      console.log('Set general terms:', data.general_terms);
    }
    
    if (data.watermark) {
      invoiceForm.watermark = data.watermark;
      console.log('Set watermark:', data.watermark);
    }
    
    if (data.remarks) {
      invoiceForm.remarks = data.remarks;
      console.log('Set remarks:', data.remarks);
    }
    
    // Tax type
    if (data.tax_type !== undefined) {
      invoiceForm.tax_type = data.tax_type;
      console.log('Set tax type:', data.tax_type);
    }
  },

  /**
   * Process select fields
   */
  processSelectFields(data: ExtractedData, invoiceForm: AddInvoiceForm, options: MappingOptions): void {
    // Process category
    if (data.category && options.categories?.length) {
      const categoryId = this.findBestMatch(data.category, options.categories, 'title');
      if (categoryId) {
        invoiceForm.category = categoryId;
        console.log('Set category:', categoryId, 'from', data.category);
      }
    }
    
    // Process deadline/condition
    if (data.condition && options.deadlines?.length) {
      const deadlineId = this.findBestMatch(data.condition, options.deadlines, 'title');
      if (deadlineId) {
        invoiceForm.deadline = deadlineId;
        console.log('Set deadline:', deadlineId, 'from', data.condition);
      }
    }
    
    // Process client
    if (data.client_name && options.clients?.length) {
      const clientId = this.findBestMatch(data.client_name, options.clients, 'display_name');
      if (clientId) {
        invoiceForm.client_id = clientId;
        console.log('Set client ID:', clientId, 'from', data.client_name);
        
        // Trigger client selection callback to update addresses
        if (options.onClientSelected) {
          options.onClientSelected(clientId);
          console.log('Called onClientSelected with:', clientId);
        }
      }
    }
    
    // Process bank
    if (data.bank && options.banks?.length) {
      const bankId = this.findBestMatch(data.bank, options.banks, 'bank');
      if (bankId) {
        invoiceForm.selected_bank = bankId;
        invoiceForm.show_bank = 1;  // Enable bank details
        console.log('Set bank:', bankId, 'from', data.bank);
      }
    }
    
    // Process language
    if (data.language) {
      const lang = data.language.toLowerCase();
      if (lang.includes('fr') || lang.includes('fre') || lang === 'frensh') {
        invoiceForm.language = 'frensh';
        console.log('Set language: frensh');
      } else if (lang.includes('ar') || lang.includes('arab')) {
        invoiceForm.language = 'arabic';
        console.log('Set language: arabic');
      } else if (lang.includes('en') || lang.includes('ang')) {
        invoiceForm.language = 'english';
        console.log('Set language: english');
      }
    }
  },

  /**
   * Process toggle fields
   */
  processToggleFields(data: ExtractedData, invoiceForm: AddInvoiceForm): void {
    // Helper to convert to 0/1 value
    const toToggleValue = (value: any): number => {
      if (value === undefined || value === null) return 0;
      return value === true || value === 1 || value === '1' || value === 'yes' ? 1 : 0;
    };
    
    // Map toggle fields
    if (data.show_billing !== undefined) invoiceForm.show_billing = toToggleValue(data.show_billing);
    if (data.show_delivery !== undefined) invoiceForm.show_delivery = toToggleValue(data.show_delivery);
    if (data.show_bank !== undefined) invoiceForm.show_bank = toToggleValue(data.show_bank);
    if (data.show_description !== undefined) invoiceForm.show_description = toToggleValue(data.show_description);
    if (data.show_pictures !== undefined) invoiceForm.show_pictures = toToggleValue(data.show_pictures);
    if (data.show_conditions !== undefined) invoiceForm.show_conditions = toToggleValue(data.show_conditions);
    if (data.show_stamp !== undefined) invoiceForm.show_stamp = toToggleValue(data.show_stamp);
    if (data.showArticleUnit !== undefined) invoiceForm.showArticleUnit = toToggleValue(data.showArticleUnit);
    if (data.showArticleTTCPrices !== undefined) invoiceForm.showArticleTTCPrices = toToggleValue(data.showArticleTTCPrices);
    if (data.use_conditions !== undefined) invoiceForm.use_conditions = toToggleValue(data.use_conditions);

    // Additional entries
    if (data.tva !== undefined) invoiceForm.additionalEntries.tva = toToggleValue(data.tva);
    if (data.fiscalStamp !== undefined) invoiceForm.additionalEntries.fiscalStamp = toToggleValue(data.fiscalStamp);
    if (data.exemple !== undefined) invoiceForm.additionalEntries.exemple = toToggleValue(data.exemple);
    
    console.log('Processed toggle fields');
  },

  /**
   * Process recurrence fields
   */
  processRecurrenceFields(data: ExtractedData, invoiceForm: AddInvoiceForm): void {
    // Set recurrence toggle (1=No, 2=Yes)
    if (data.recurrence !== undefined) {
      invoiceForm.recurrence = data.recurrence === true ? 2 : 1;
      console.log('Set recurrence:', invoiceForm.recurrence);
    }
    
    // Set recurrence interval
    if (data.recurrence_each !== undefined) {
      invoiceForm.recurrence_each = data.recurrence_each;
      console.log('Set recurrence interval:', data.recurrence_each);
    }
    
    // Set recurrence type
    if (data.recurrence_type !== undefined) {
      invoiceForm.recurrence_type = data.recurrence_type;
      console.log('Set recurrence type:', data.recurrence_type);
    }
  },

  /**
   * Process invoice item
   */
  processInvoiceItem(data: ExtractedData, invoiceForm: AddInvoiceForm, options: MappingOptions): void {
    console.log('Processing invoice item with data:', {
      item_title: data.item_title,
      item_description: data.item_description,
      item_quantity: data.item_quantity,
      item_unit_price: data.item_unit_price,
      solde: data.solde
    });
    
    // Check if we have item details and the direct add function
    if (data.item_title && options.addDirectItemFromPdf) {
      // Use direct add function
      options.addDirectItemFromPdf({
        title: data.item_title,
        description: data.item_description,
        quantity: data.item_quantity,
        unitPrice: data.item_unit_price
      });
    }
  },

  /**
   * Helper: Find best matching option for a value
   */
  findBestMatch(value: string, options: any[], labelField: string): string | null {
    if (!value || !options?.length) return null;
    
    console.log(`Finding match for '${value}' in ${options.length} options`);
    
    const searchTerm = value.toLowerCase().trim();
    
    // Try exact match
    const exactMatch = options.find(item => 
      item[labelField]?.toLowerCase() === searchTerm
    );
    if (exactMatch) {
      console.log(`Found exact match: ${exactMatch[labelField]}`);
      return exactMatch.hashed_id;
    }
    
    // Try includes match
    const includesMatch = options.find(item => {
      const itemLabel = item[labelField]?.toLowerCase() || '';
      return itemLabel.includes(searchTerm) || searchTerm.includes(itemLabel);
    });
    if (includesMatch) {
      console.log(`Found includes match: ${includesMatch[labelField]}`);
      return includesMatch.hashed_id;
    }
    
    // Try word match
    const searchWords = searchTerm.split(/\s+/);
    const wordMatch = options.find(item => {
      const itemLabel = item[labelField]?.toLowerCase() || '';
      const itemWords = itemLabel.split(/\s+/);
      return searchWords.some(searchWord => 
        itemWords.some(itemWord => 
          itemWord.includes(searchWord) || searchWord.includes(itemWord)
        )
      );
    });
    
    if (wordMatch) {
      console.log(`Found word match: ${wordMatch[labelField]}`);
      return wordMatch.hashed_id;
    }
    
    console.log(`No match found for: ${value}`);
    return null;
  }
};