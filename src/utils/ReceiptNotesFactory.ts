import type { AddReceiptNoteForm } from '@/models/Receipt';

export function createDefaultReceiptNoteForm(): AddReceiptNoteForm {
  return {
    choice: 0,
      category_id:'',

    category: '',
    date: '',
    currency_rate: 0,
    use_conditions: 0,
    object: '',
    receipt_number: '',
    provider_id: '',
    referenceNumber: '',
    tax_type: 1,
    items: [],
    generalTerms: '',
    attachments: [],
    totals: {
      discount: '',
      total: '',
      taxes: '',
      subtotal: '',
    },
    watermark: '',
    language: 'fr',
    show_description: 1,
    showArticleUnit: 1,
    showArticleTTCPrices: 0,
    show_pictures: 1,
    show_billing: 1,
    show_delivery: 0,
    show_conditions: 0,
    show_stamp: 1,
    show_bank: 0,
    selected_bank: '',
    AdditionalEntries: {
      tva: 0,
    },
    remarks: '',
  };
}