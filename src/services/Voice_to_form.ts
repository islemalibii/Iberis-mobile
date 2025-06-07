// services/VoiceFormMapper.ts
import type { AddInvoiceForm, InvoiceItem } from '@/models/InvoicesModel';
import type { VoiceToFormResponse } from './VoiceRecording';
import type { Client } from '@/models/ClientModel';

export interface VoiceFormMappingResult {
  success: boolean;
  fieldsUpdated: string[];
  warnings: string[];
  errors: string[];
}

export class VoiceFormMapper {
  private clients: Client[] = [];
  private categories: any[] = [];
  private deadlines: any[] = [];
  private banks: any[] = [];

  // Set reference data for mapping
  setReferenceData(clients: Client[], categories: any[], deadlines: any[], banks: any[] = []) {
    this.clients = clients;
    this.categories = categories;
    this.deadlines = deadlines;
    this.banks = banks;
  }

  // Main mapping function
  mapVoiceToInvoiceForm(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm
  ): VoiceFormMappingResult {
    const result: VoiceFormMappingResult = {
      success: false,
      fieldsUpdated: [],
      warnings: [],
      errors: []
    };

    try {
      // Map basic invoice fields
      this.mapBasicFields(voiceData, invoiceForm, result);
      
      // Map client information
      this.mapClientFields(voiceData, invoiceForm, result);
      
      // Map date fields
      this.mapDateFields(voiceData, invoiceForm, result);
      
      // Map items/articles
      this.mapItemFields(voiceData, invoiceForm, result);
      
      // Map toggle fields
      this.mapToggleFields(voiceData, invoiceForm, result);
      
      // Map additional fields
      this.mapAdditionalFields(voiceData, invoiceForm, result);

      this.mapRecurrenceDetails(voiceData, invoiceForm, result);

      result.success = result.fieldsUpdated.length > 0;
      
      if (result.fieldsUpdated.length === 0) {
        result.warnings.push('No recognizable fields found in voice input');
      }

    } catch (error) {
      console.error('Error mapping voice to form:', error);
      result.errors.push('Failed to process voice data');
    }

    return result;
  }

  // Map basic invoice fields
  private mapBasicFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    const basicFieldMappings = {
      'object': ['object', 'subject', 'title', 'invoice_object'],
      'referenceNumber': ['reference_number', 'reference', 'ref_number', 'order_number'],
      'generalTerms': ['terms', 'general_terms', 'conditions', 'payment_terms'],
      'watermark': ['watermark', 'stamp', 'mark'],
      'remarks': ['notes', 'remarks', 'comments', 'additional_notes']
    };

    for (const [formField, voiceFields] of Object.entries(basicFieldMappings)) {
      const value = this.findValueInVoiceData(voiceData, voiceFields);
      if (value && typeof value === 'string') {
        (invoiceForm as any)[formField] = value;
        result.fieldsUpdated.push(this.getFieldDisplayName(formField));
      }
    }
  }

  // Map client information
  private mapClientFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    const clientIdentifiers = ['client_name', 'client', 'customer', 'customer_name', 'company'];
    const clientValue = this.findValueInVoiceData(voiceData, clientIdentifiers);
    
    console.log('Client mapping - found value:', clientValue);
    
    if (clientValue && typeof clientValue === 'string') {
      const matchedClient = this.findClientByName(clientValue);
      if (matchedClient) {
        console.log('Setting client_id to:', matchedClient.hashed_id);
        invoiceForm.client_id = matchedClient.hashed_id;
        result.fieldsUpdated.push('Client');
      } else {
        result.warnings.push(`Client "${clientValue}" not found in system`);
        console.log('Available client names:', this.clients.map(c => c.display_name));
      }
    } else {
      console.log('No client value found in voice data');
    }
  }

  // Map date fields
  private mapDateFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    // Invoice date
    const dateIdentifiers = ['date', 'invoice_date', 'issue_date'];
    const dateValue = this.findValueInVoiceData(voiceData, dateIdentifiers);
    if (dateValue) {
      const parsedDate = this.parseDate(dateValue);
      if (parsedDate) {
        invoiceForm.date = parsedDate;
        result.fieldsUpdated.push('Invoice Date');
      } else {
        result.warnings.push(`Could not parse date: ${dateValue}`);
      }
    }

    // Due date
    const dueDateIdentifiers = ['due', 'due_date', 'payment_due', 'deadline'];
    const dueDateValue = this.findValueInVoiceData(voiceData, dueDateIdentifiers);
    if (dueDateValue) {
      const parsedDueDate = this.parseDate(dueDateValue);
      if (parsedDueDate) {
        invoiceForm.due = parsedDueDate;
        result.fieldsUpdated.push('Due Date');
      } else {
        result.warnings.push(`Could not parse due date: ${dueDateValue}`);
      }
    }
  }

  // Map items/articles
  private mapItemFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    const itemsData = voiceData.items || voiceData.articles || voiceData.products;
    
    if (Array.isArray(itemsData) && itemsData.length > 0) {
      const newItems: InvoiceItem[] = [];
      
      itemsData.forEach((item: any, index: number) => {
        const newItem: InvoiceItem = {
          id: Date.now().toString() + index,
          title: item.title || item.name || item.product || '',
          description: item.description || item.desc || '',
          quantity: this.parseNumber(item.quantity || item.qty) || 1,
          unitPrice: this.parseNumber(item.price || item.unit_price || item.rate) || 0,
          discount: { 
            value: this.parseNumber(item.discount_value) || 0,
            type: item.discount_type || '0.0'
          },
          taxes: [{ hashed_id: '', title: '', rate: 0 }],
          price: 0
        };
  
        // Calculate price
        newItem.price = newItem.quantity * newItem.unitPrice;
        newItems.push(newItem);
        
        console.log('Created new item from voice:', newItem);
      });
  
      if (newItems.length > 0) {
        invoiceForm.items.push(...newItems);
        result.fieldsUpdated.push(`${newItems.length} item(s) added`);
      }
    }
  
    // Handle single item description (fallback)
    const singleItemIdentifiers = ['item', 'product', 'service'];
    const singleItemValue = this.findValueInVoiceData(voiceData, singleItemIdentifiers);
    if (singleItemValue && typeof singleItemValue === 'string' && !itemsData) {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        title: singleItemValue,
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: { value: 0, type: '0.0' },
        taxes: [{ hashed_id: '', title: '', rate: 0 }],
        price: 0
      };
      
      invoiceForm.items.push(newItem);
      result.fieldsUpdated.push('Item added');
    }
  }

  // Map toggle fields
  private mapToggleFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    const toggleFieldMappings = {
      'show_description': 'Items Description',
      'showArticleUnit': 'Items Unity', 
      'showArticleTTCPrices': 'Items TTC Prices',
      'show_pictures': 'Items Pictures',
      'show_billing': 'Billing Address',
      'show_delivery': 'Delivery Address', 
      'show_conditions': 'General Conditions',
      'show_stamp': 'Stamp & Signature',
      'show_bank': 'Bank Details',
      'tva': 'TVA (19%)',
      'fiscalStamp': 'Timbre Fiscal',
      'exemple': 'Exemple',
      'recurrence': 'Recurrence'
    };

    for (const [voiceField, displayName] of Object.entries(toggleFieldMappings)) {
      const value = voiceData[voiceField];
      if (value !== null && value !== undefined) {
        const toggleValue = Number(value);
        
        if (voiceField === 'recurrence') {
          if (toggleValue === 1 || toggleValue === 2) {
            invoiceForm.recurrence = toggleValue;
            const toggleText = toggleValue === 2 ? 'Enabled' : 'Disabled';
            result.fieldsUpdated.push(`${displayName} (${toggleText})`);
          }
        } else if (['tva', 'fiscalStamp', 'exemple'].includes(voiceField)) {
          if (toggleValue === 0 || toggleValue === 1) {
            if (!invoiceForm.additionalEntries) {
              invoiceForm.additionalEntries = {
                tva: 0,
                fiscalStamp: 0,
                exemple: 0
              };
            }
            (invoiceForm.additionalEntries as any)[voiceField] = toggleValue;
            const toggleText = toggleValue === 1 ? 'Enabled' : 'Disabled';
            result.fieldsUpdated.push(`${displayName} (${toggleText})`);
          }
        } else {
          if (toggleValue === 0 || toggleValue === 1) {
            (invoiceForm as any)[voiceField] = toggleValue;
            const toggleText = toggleValue === 1 ? 'Enabled' : 'Disabled';
            result.fieldsUpdated.push(`${displayName} (${toggleText})`);
          }
        }
      }
    }
  }

  private mapRecurrenceDetails(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    // Only process recurrence details if recurrence is enabled (value 2)
    if (invoiceForm.recurrence !== 2) {
      return;
    }
  
    console.log('Processing recurrence details...');
  
    // Recurrence start date
    const recurrenceStartValue = this.findValueInVoiceData(voiceData, ['recurrence_start']);
    if (recurrenceStartValue) {
      const parsedStartDate = this.parseDate(recurrenceStartValue);
      if (parsedStartDate) {
        invoiceForm.recurrence_start = parsedStartDate;
        result.fieldsUpdated.push('Recurrence Start Date');
        console.log('Set recurrence start date:', parsedStartDate);
      }
    }
  
    // Recurrence end date
    const recurrenceEndIdentifiers = ['recurrence_end'];
    const recurrenceEndValue = this.findValueInVoiceData(voiceData, recurrenceEndIdentifiers);
    if (recurrenceEndValue) {
      const parsedEndDate = this.parseDate(recurrenceEndValue);
      if (parsedEndDate) {
        invoiceForm.recurrence_end = parsedEndDate;
        result.fieldsUpdated.push('Recurrence End Date');
        console.log('Set recurrence end date:', parsedEndDate);
      }
    }

    // Recurrence interval (every X) - USE TYPE ASSERTION
    const recurrenceEachValue = this.findValueInVoiceData(voiceData, ['recurrence_each']);
    if (recurrenceEachValue) {
      const parsedInterval = this.parseNumber(recurrenceEachValue);
      if (parsedInterval && parsedInterval > 0) {
        invoiceForm.recurrence_each = parsedInterval;
        result.fieldsUpdated.push('Recurrence Interval');
        console.log('Set recurrence interval:', parsedInterval);
      }
    }
  
    // Recurrence frequency
    const recurrenceTypeValue = this.findValueInVoiceData(voiceData, ['recurrence_type']);
    if (recurrenceTypeValue) {
      const parsedType = this.parseNumber(recurrenceTypeValue);
      if (parsedType && [1, 2, 3, 4].includes(parsedType)) {
        invoiceForm.recurrence_type = parsedType;
        const typeText = ['', 'Daily', 'Weekly', 'Monthly', 'Yearly'][parsedType];
        result.fieldsUpdated.push(`Recurrence Frequency (${typeText})`);
        console.log('Set recurrence type:', parsedType, typeText);
      }
    }
  }

  // Map additional fields
  private mapAdditionalFields(
    voiceData: VoiceToFormResponse, 
    invoiceForm: AddInvoiceForm, 
    result: VoiceFormMappingResult
  ): void {
    // Map category if mentioned
    const categoryIdentifiers = ['category', 'type', 'invoice_type'];
    const categoryValue = this.findValueInVoiceData(voiceData, categoryIdentifiers);
    if (categoryValue && typeof categoryValue === 'string') {
      const matchedCategory = this.findCategoryByName(categoryValue);
      if (matchedCategory) {
        invoiceForm.category = matchedCategory.hashed_id;
        result.fieldsUpdated.push('Category');
      }
    }

    // Map deadline/condition if mentioned
    const deadlineIdentifiers = ['deadline', 'condition', 'payment_terms', 'terms', 'payment_condition'];
    const deadlineValue = this.findValueInVoiceData(voiceData, deadlineIdentifiers);
    if (deadlineValue && typeof deadlineValue === 'string') {
      const matchedDeadline = this.findDeadlineByName(deadlineValue);
      if (matchedDeadline) {
        invoiceForm.deadline = matchedDeadline.hashed_id;
        result.fieldsUpdated.push('Payment Condition');
      } else {
        result.warnings.push(`Payment condition "${deadlineValue}" not found in system`);
      }
    }

    // Map bank selection if mentioned
    const bankIdentifiers = ['selected_bank', 'bank', 'chosen_bank'];
    const bankValue = this.findValueInVoiceData(voiceData, bankIdentifiers);
    if (bankValue && typeof bankValue === 'string') {
      const matchedBank = this.findBankByName(bankValue);
      if (matchedBank) {
        invoiceForm.selected_bank = matchedBank.hashed_id;
        result.fieldsUpdated.push('Bank');
      } else {
        result.warnings.push(`Bank "${bankValue}" not found in system`);
      }
    }

    // Map tax type if mentioned
    const taxTypeIdentifiers = ['tax_type'];
    const taxTypeValue = this.findValueInVoiceData(voiceData, taxTypeIdentifiers);
    if (taxTypeValue !== null && taxTypeValue !== undefined) {
      const taxTypeNumber = Number(taxTypeValue);
      if (taxTypeNumber === 1 || taxTypeNumber === 2) {
        invoiceForm.tax_type = taxTypeNumber;
        const taxTypeText = taxTypeNumber === 1 ? 'Without Taxes' : 'Tax Included';
        result.fieldsUpdated.push(`Tax Type (${taxTypeText})`);
      }
    }
        
    // Map use_conditions toggle if mentioned
    const useConditionsIdentifiers = ['use_conditions'];
    const useConditionsValue = this.findValueInVoiceData(voiceData, useConditionsIdentifiers);
    if (useConditionsValue !== null && useConditionsValue !== undefined) {
      const useConditionsNumber = Number(useConditionsValue);
      if (useConditionsNumber === 0 || useConditionsNumber === 1) {
        invoiceForm.use_conditions = useConditionsNumber;
        const toggleText = useConditionsNumber === 1 ? 'Enabled' : 'Disabled';
        result.fieldsUpdated.push(`Use in Future (${toggleText})`);
      }
    }

    // Map language if mentioned
    const languageIdentifiers = ['language', 'lang', 'pdf_language'];
    const languageValue = this.findValueInVoiceData(voiceData, languageIdentifiers);
    
    if (languageValue && typeof languageValue === 'string') {
      const normalizedLang = languageValue.toLowerCase();
      if (['en', 'english', 'anglais'].includes(normalizedLang)) {
        invoiceForm.language = 'english';
        result.fieldsUpdated.push('Language');
      } else if (['fr', 'french', 'français', 'frensh'].includes(normalizedLang)) {
        invoiceForm.language = 'frensh';
        result.fieldsUpdated.push('Language');
      } else if (['ar', 'arabic', 'arabe'].includes(normalizedLang)) {
        invoiceForm.language = 'arabic';
        result.fieldsUpdated.push('Language');
      } else {
        console.log('Language value not recognized:', normalizedLang);
      }
    } else {
      console.log('No language value found in voice data');
    }

    // Map total/amount if mentioned
    const amountIdentifiers = ['total', 'amount', 'sum', 'price'];
    const amountValue = this.findValueInVoiceData(voiceData, amountIdentifiers);
    if (amountValue) {
      const parsedAmount = this.parseNumber(amountValue);
      if (parsedAmount && parsedAmount > 0) {
        invoiceForm.totals.total = parsedAmount.toString();
        result.fieldsUpdated.push('Total Amount');
      }
    }
  }

  // Helper methods
  private findValueInVoiceData(voiceData: VoiceToFormResponse, keys: string[]): any {
    for (const key of keys) {
      if (voiceData.hasOwnProperty(key) && voiceData[key] !== null && voiceData[key] !== undefined) {
        return voiceData[key];
      }
    }
    return null;
  }

  private findClientByName(clientName: string): Client | null {
    const normalizedName = clientName.toLowerCase().trim();
    const cleanClientName = (name: string | undefined): string => {
      return name?.trim().toLowerCase() || '';
    };
    
    console.log('Available clients:', this.clients.map(c => `"${c.display_name}"`));
    let match = this.clients.find(client => 
      cleanClientName(client.display_name) === normalizedName
    );
    if (match) {
      return match;
    }
    match = this.clients.find(client => {
      const cleanName = cleanClientName(client.display_name);
      return cleanName.includes(normalizedName) || normalizedName.includes(cleanName);
    });
    if (match) {
      return match;
    }
    return null;
  }

  private findCategoryByName(categoryName: string): any | null {
    const normalizedName = categoryName.toLowerCase().trim();
    let searchTerm = normalizedName;
    if (normalizedName.includes('primary')) {
      searchTerm = 'primary';
    } else if (normalizedName.includes('secondary')) {
      searchTerm = 'secondary';
    }
    const match = this.categories.find(cat => {
      const catTitle = cat.title?.toLowerCase();
      return catTitle === searchTerm || catTitle?.includes(searchTerm);
    });
    return match || null;
  }

  private findBankByName(bankName: string): any | null {
    // Check if banks array exists
    if (!this.banks || !Array.isArray(this.banks)) {
      return null;
    }

    const normalizedName = bankName.toLowerCase().trim();
    
    const cleanBankName = (name: string | undefined): string => {
      return name?.trim().toLowerCase() || '';
    };
    // Try exact match first
    let match = this.banks.find(bank => 
      cleanBankName(bank.bank) === normalizedName
    );
    if (match) {
      return match;
    }
    match = this.banks.find(bank => {
      const cleanName = cleanBankName(bank.bank);
      return cleanName.includes(normalizedName) || normalizedName.includes(cleanName);
    });
    if (match) {
      return match;
    }
    
    // Try common bank name variations
    const bankMappings: { [key: string]: string[] } = {
      'biat': ['banque internationale arabe de tunisie', 'biat'],
      'stb': ['société tunisienne de banque', 'stb'],
      'attijari': ['attijari bank', 'attijari'],
      'amen': ['amen bank', 'amen'],
      'zitouna': ['zitouna bank', 'zitouna'],
      'zaytouna': ['zaytouna bank', 'zitouna'],
      'zaytuna': ['zaytuna bank', 'zaytuna'],
      'bh': ['banque de l\'habitat', 'bh bank'],
    };
    
    for (const [key, variations] of Object.entries(bankMappings)) {
      if (variations.some(v => normalizedName.includes(v) || v.includes(normalizedName))) {
        match = this.banks.find(bank => 
          cleanBankName(bank.bank).includes(key)
        );
        if (match) {
          console.log('Found mapping match:', match.bank);
          return match;
        }
      }
    }
    
    console.log('No bank match found');
    return null;
  }

  private findDeadlineByName(deadlineName: string): any | null {
    const normalizedName = deadlineName.toLowerCase().trim();
    let match = this.deadlines.find(deadline => 
      deadline.title?.toLowerCase() === normalizedName
    );
    if (match) {
      return match;
    }
    match = this.deadlines.find(deadline => 
      deadline.title?.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(deadline.title?.toLowerCase())
    );
    
    if (match) {
      return match;
    }
    const deadlineMappings: { [key: string]: string[] } = {
      'net': ['net 30', 'net 15', 'net 7', 'net 60', 'payment net'],
      '30': ['net 30', '30 days', 'thirty days'],
      '15': ['net 15', '15 days', 'fifteen days'],
      '7': ['net 7', '7 days', 'seven days'],
      '60': ['net 60', '60 days', 'sixty days'],
      'immediate': ['immediate payment', 'due immediately', 'cash'],
      'cash': ['cash payment', 'immediate', 'due now'],
      'advance': ['payment in advance', 'prepayment', 'advance payment']
    };
    
    for (const [key, variations] of Object.entries(deadlineMappings)) {
      if (variations.some(v => normalizedName.includes(v) || v.includes(normalizedName))) {
        match = this.deadlines.find(deadline => 
          deadline.title?.toLowerCase().includes(key)
        );
        if (match) {
          return match;
        }
      }
    }
    return null;
  }

  private parseDate(dateValue: any): string | null {
    if (!dateValue) return null;
    
    try {
      let dateStr = typeof dateValue === 'string' ? dateValue : String(dateValue);
      
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; 
      }
      
      const datePatterns = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})/,
        /(\d{1,2})-(\d{1,2})-(\d{4})/
      ];
      
      for (const pattern of datePatterns) {
        const match = dateStr.match(pattern);
        if (match) {
          const parsedDate = new Date(match[0]);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
      }
    } catch (error) {
      console.error('Date parsing error:', error);
    }
    
    return null;
  }

  private parseNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove common currency symbols and spaces
      const cleanValue = value.replace(/[€$£¥,\s]/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'object': 'Invoice Object',
      'referenceNumber': 'Reference Number',
      'generalTerms': 'General Terms',
      'watermark': 'Watermark',
      'remarks': 'Notes',
      'client_id': 'Client',
      'date': 'Invoice Date',
      'due': 'Due Date',
      'category': 'Category',
      'language': 'Language',
      'deadline': 'Payment Condition',
      'tax_type': 'Tax Type',
      'use_conditions': 'Use in Future'
    };
    
    return displayNames[fieldName] || fieldName;
  }
}

export const voiceFormMapper = new VoiceFormMapper();