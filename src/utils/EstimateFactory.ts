import type { AddEstimateForm,AdditionalInput } from '@/models/DevisModel';


export const DEFAULT_ADDITIONAL_INPUTS: AdditionalInput[] = [
  {
    hashed_id: 'tva',
    title: 'TVA (19%)',
    rate: 19,
    value: 0,
    active: false
  },
  {
    hashed_id: 'stamp',
    title: 'Timbre Fiscal',
    value: 1,
    active: false
  },
  {
    hashed_id: 'example',
    title: 'Example',
    value: 0,
    active: false
  }
];

export function createDefautEstimateForm(): AddEstimateForm {
  return {
    choice: 0,
    due: '',
    show_unity: 0,
    category: '',
    date: '',
    currency_rate: 1,
    use_conditions: 0,
    object: '',
    estimate_number: '',
    client_id: '',
    referenceNumber: '',
    tax_type: 1,
    items: [],
    generalTerms: '',
    attachments: [],
    totals: {
      discount: '0',
      total: '0',
      taxes: '0',
      subtotal: '0'
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
    additional_inputs: [...DEFAULT_ADDITIONAL_INPUTS],
    activeAdditionalInputs: {
      tva: false,
      stamp: false,
      example: false
    },
    remarks: ''
  };
}