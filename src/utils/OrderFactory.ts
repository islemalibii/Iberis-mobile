import type { AddPurchaseOrderForm } from '@/models/Order';

export function createDefaultPurchaseOrderForm(): AddPurchaseOrderForm {
  return {
    date: new Date().toISOString().split('T')[0],
    provider_id: '',
    items: [],
    tax_type: 1,
    language: 'fr',
    currency_rate: 1,
    remarks: '',
    use_conditions: 0,
    referenceNumber: '',
    object: null,
    watermark: null,
    attachments: [],
    category: '',
    generalTerms: '',
    show_description: 1,
    showArticleUnit: 1,
    showArticleTTCPrices: 0,
    show_pictures: 0,
    show_billing: 1,
    show_delivery: 0,
    show_conditions: 0,
    show_stamp: 0,
    show_bank: 0,
    selected_bank: '',
    totals: {
      discount: '0',
      total: '0',
      taxes: '0',
      subtotal: '0'
    }
  };
}