import { ref, computed, onMounted, watch, reactive  } from 'vue';
import type { AddInvoiceForm, InvoiceItem, ItemTax } from '@/models/InvoicesModel';
import type { Currency } from '@/models/CompanyModel';
import type { Address } from '@/models/ClientModel';
import type { Client } from '@/models/ClientModel';
import { createInvoice, getLastInvoiceNumber  } from '@/services/Invoices'; 
import { getClientsList } from '@/services/Clients'; 
import { fetchItems } from '@/services/Items'; 
import { Item } from '@/models/ItemModel';
import { fetchJournals, fetchDefaultSalesJournal } from '@/services/Journals'; 
import { toastController } from '@ionic/vue'; 
import { fetchCategories } from '@/services/Categories'; 
import { fetchDeadlines } from '@/services/Deadlines'; 
import { fetchBanks } from '@/services/Banks'; 
import { Bank } from '@/models/BankModel';
import { fetchCurrentCompany } from '@/services/Dashboard'; 
import { fetchTaxes } from '@/services/Company'; 
import apiService from '@/services/Dashboard'; 
import { createDefaultInvoiceForm } from '@/utils/invoiceFactory';
import { voiceService } from '@/services/VoiceRecording';
import { VoiceFormMapper, type VoiceFormMappingResult } from '@/services/Voice_to_form';
import { fetchLiveCurrencyRate } from '@/services/CurrencyRate'; 
import { pdfService } from '@/services/PdfService';
import { pdfFormMappingService } from '@/services/pdf_to_form';

import { AddItem, getPriceList, getBrandsList, getCategoriesList, getUnitiesList } from '@/services/Items'; 

export function useInvoiceController() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const invoiceForm = reactive<AddInvoiceForm>(createDefaultInvoiceForm());
  const companyName = ref('');
  const isArticleModalOpen = ref(false);
  const isArticleDetailsModalOpen = ref(false);
  const isNewItemModalOpen = ref(false);
  const isNewItemPopoverOpen = ref(false);
  const selectedArticle = ref<InvoiceItem>({
    id: '',
    title: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    discount: { value: 0, type: '0.0' },
    taxes: [{ hashed_id: '', title: '', rate: 0 }],
    price: 0,
    journal_id:'',
  });
  const Items = ref<string[]>([]);
  const availableArticles = ref<InvoiceItem[]>([]);
  const currentPage = ref(1);
  const articlesPerPage = 5;
  const searchQuery = ref('');
  const frequency = ref('');
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const clients = ref<Client[]>([]);
  const selectedClient = ref<Client | null>(null);
  const selectedCurrency = ref<Currency | null>(null);
  const billingAddress = ref<Address | null>(null);
  const deliveryAddress = ref<Address | null>(null);
  const isNewItem = ref(false);
  const newItemForm = ref({
    title: '',
    reference: '',
    description: '',
    taxe: '0%',  
    unity: '',  
    category: 'None',  
    brand: 'None',  
  });
  const itemUnities = ref([]);
  const itemCategories = ref([]);
  const itemBrands = ref([]);
  const banks = ref<Bank[]>([]);
  const itemDestination = ref<number | null>(null);
  const itemType = ref<number | null>(null);
  const sellingRate = ref(0);
  const buyingRate = ref(0);
  const taxValues = ref({
    tva: 10.07,
    fiscalStamp: 1.0,
    exemple: 0.0
  });
  const categories = ref<any[]>([]);
  const deadlines = ref<any[]>([]);
  const currentYear = new Date().getFullYear();
  const taxes = ref<ItemTax[]>([]);
  
  // PDF upload related refs
  const pdfFileInputRef = ref<HTMLInputElement | null>(null);
  const isProcessingPdf = ref(false);
  const pdfProcessingError = ref<string | null>(null);
  const isPdfPreviewModalOpen = ref(false);
  const pdfExtractedData = ref<any>(null);
  
  const journals = ref([
    {
      id: '',
      composed_number: '',
      title: '',
      children: [
        {
          id: '',
          composed_number: '',
          title: '',
          children: [
            {
              id: '',
              composed_number: '',
              title: '',
            },
          ],
        },
      ],
    },
  ]);

  const isVoiceEnabled = ref(true);
  const voiceEndpoint = ref('http://127.0.0.1:8000/transcribe/'); // Your Django transcribe endpoint
  const lastVoiceResult = ref<VoiceFormMappingResult | null>(null);
  const selectedJournalId = ref<string | null>(null);
  
  const flattenedJournals = computed(() => {
    const result = [];
    for (const parent of journals.value) {
      if (!parent) continue;
      
      result.push({
        id: parent.id?.toString() || '',
        hashed_id: parent.hashed_id || parent.id?.toString() || '', // Include hashed_id if available
        label: `${parent.composed_number || ''} - ${parent.title || ''}`,
      });
    
      if (parent.children && Array.isArray(parent.children) && parent.children.length > 0) {
        for (const child of parent.children) {
          if (!child) continue;
          
          result.push({
            id: child.id?.toString() || '',
            hashed_id: child.hashed_id || child.id?.toString() || '',
            label: `--- ${child.composed_number || ''} - ${child.title || ''}`,
          });
          
          if (child.children && Array.isArray(child.children) && child.children.length > 0) {
            for (const grandChild of child.children) {
              if (!grandChild) continue;
              
              result.push({
                id: grandChild.id?.toString() || '',
                hashed_id: grandChild.hashed_id || grandChild.id?.toString() || '',
                label: `----- ${grandChild.composed_number || ''} - ${grandChild.title || ''}`,
              });
            }
          }
        }
      }
    }
    console.log(`Flattened ${result.length} journals with IDs and hashed_ids`);
    return result;
  });

  const getJournalHashedId = (journalId: string): string => {
    if (!journalId) return '';
    
    if (/^[a-zA-Z]/.test(journalId)) {
      return journalId;
    }
    const journal = flattenedJournals.value.find(j => j.id === journalId);
    return journal?.hashed_id || journalId;
  };

  const showToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      color: 'warning',
      position: 'top',
    });
    toast.present();
  };

  const triggerFileInput = () => {
    if (fileInputRef.value) {
      fileInputRef.value.click();
    } else {
      console.error("File input ref not found");
    }
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      invoiceForm.attachments = Array.from(input.files);
      console.log("Files added:", invoiceForm.attachments);
      if (invoiceForm.attachments.length > 0) {
        console.log("Files successfully saved to form");
        console.log("Number of files:", invoiceForm.attachments.length);
        const fileNames = invoiceForm.attachments.slice(0, 3).map(file => file.name);
        console.log("File names:", fileNames);
      } else {
        console.error("Files were not saved to form");
      }
    }
  };

  const getFileDisplayText = () => {
    if (!invoiceForm.attachments || invoiceForm.attachments.length === 0) {
      return "No file chosen";
    } else if (invoiceForm.attachments.length === 1) {
      return invoiceForm.attachments[0].name;
    } else {
      return `${invoiceForm.attachments.length} files selected`;
    }
  };

  const calculateSubtotal = () => {
    if (!invoiceForm.items || invoiceForm.items.length === 0) {
      return 0;
    }
    const subtotal = invoiceForm.items.reduce((sum, item) => {
        const itemTotal = calculateArticlePrice(item);
        return sum + itemTotal;
      }, 0);
      invoiceForm.totals.subtotal = subtotal.toFixed(3);
      return subtotal;
  };
   
  const calculateTaxes = (): number => {
    let totalTaxes = 0;
    for (const item of invoiceForm.items) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const basePrice = quantity * unitPrice
      let discountedPrice = basePrice;
      if (item.discount) {
        const discountValue = item.discount.value || 0;
        const discountType = item.discount.type;
        if (discountType === '0.0') {
          discountedPrice = Math.max(0, basePrice - discountValue);
        } else {
          discountedPrice = basePrice * (1 - (discountValue / 100));
        }
      }
      if (item.taxes && Array.isArray(item.taxes)) {
        for (const tax of item.taxes) {
          const rate = Number(tax.rate || 0);
          totalTaxes += discountedPrice * (rate / 100);
        }
      }
    }
    return parseFloat(totalTaxes.toFixed(3));
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(invoiceForm.totals.discount) || 0;
    const taxes = calculateTaxes();
    const total = Math.max(0, subtotal - discount + taxes); 
    invoiceForm.totals.taxes = taxes.toFixed(3);
    invoiceForm.totals.total = total.toFixed(3);
    return total;
  };

  const formatPrice = (price :any) => {
    return Number(price).toFixed(3);
  };

  const updateTotals = () => {
    calculateTotal();
  };

  const handleAction = (action: string) => {
    invoiceForm.choice = action === 'valider' ? 1 : 0;
  };

  const saveAsDraft = () => {
    console.log('Saving as draft', invoiceForm);
  };

  const validateAndSubmit = async () => {
    if (validateInvoiceForm()) {
      isLoading.value = true;
      try {
        console.log('Submitting invoice with items:');
        invoiceForm.items.forEach((item, index) => {
          console.log(`Item ${index + 1}: ${item.title}, Journal ID: ${item.journal_id}, Hashed ID: ${getJournalHashedId(item.journal_id)}`);
        });
        
        const formToSubmit = JSON.parse(JSON.stringify(invoiceForm));
        
        formToSubmit.items = formToSubmit.items.map(item => {
          const hashedJournalId = getJournalHashedId(item.journal_id);
          console.log(`Converting journal ID ${item.journal_id} to hashed ID ${hashedJournalId}`);
          
          return {
            ...item,
            journal_id: hashedJournalId
          };
        });
        
        const result = await createInvoice(formToSubmit);
        console.log('Invoice created successfully:', result);
      } catch (err: any) {
        console.error('Error creating invoice:', err);
        error.value = err.response?.data?.message || 'Something went wrong.';
      } finally {
        isLoading.value = false;
      }
    }
  };

  const validateInvoiceForm = (): boolean => {
    if (invoiceForm.items.length === 0) {
      console.error('At least one article is required');
      return false;
    }
    if (!invoiceForm.client_id) {
      console.error('Client is required');
      return false;
    }
    return true;
  };

  //add article akahaw code
  const addArticleForm = () => {
    const newItemForm: InvoiceItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: { value: 0, type: '%' },
      taxes: [{
        hashed_id: '',        
        title: '',    
        rate: 0        
      }],
      price: 0.0,
      journal_id: selectedJournalId.value || '',
    };
    selectedArticle.value = newItemForm;
    isNewItem.value = true;
    isArticleDetailsModalOpen.value = true;
  };

  const removeArticle = (articleId: string) => {
    if (invoiceForm.items.length > 1) {
      invoiceForm.items = invoiceForm.items.filter(
        item => item.id !== articleId
      );
    }
  };

  const openArticleDetailsModal = (articleParam: any) => {
    let article;
    if (typeof articleParam === 'object') {
      article = articleParam;
    } else {
      article = invoiceForm.items.find(item => item.id === articleParam);
    }
    if (article) {
      let journalId = '';
      if (article.journal_id !== undefined && article.journal_id !== null) {
        journalId = article.journal_id.toString();
      } else if (selectedJournalId.value) {
        journalId = selectedJournalId.value.toString();
      }
      console.log('Journal ID after conversion:', journalId, '(Type:', typeof journalId, ')');
      selectedArticle.value = { 
        id: article.id || '',
        title: article.title || '',
        description: article.description || '',
        quantity: article.quantity || 0,
        unitPrice: article.unitPrice || 0,
        discount: article.discount || { value: 0, type: '0.0' },
        taxes: article.taxes || [],
        price: 0,
        journal_id: journalId,
      };
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
      if (!article.title) {
        isNewItemPopoverOpen.value = true;
      }
      isNewItem.value = false;
      isArticleDetailsModalOpen.value = true;
    } else {
      console.error("Could not find article:", articleParam);
    }
  };

  const closeArticleDetailsModal = () => {
    isArticleDetailsModalOpen.value = false;
    setTimeout(() => {
      const savedJournal = selectedArticle.value.journal_id;
    console.log('Saving journal before reset:', savedJournal);
      selectedArticle.value = {
        id: '',
        title: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        discount: { value: 0, type: '0.0' },
        taxes: [],
        price: 0,
        journal_id: savedJournal,
      };
    }, 100);
  };

  const calculateArticlePrice = (article: any): number => {
    const quantity = Number(article.quantity || 0);
    const unitPrice = Number(article.unitPrice || 0);
    const basePrice = quantity * unitPrice;

    let discountedPrice = basePrice;
    const discount = article.discount || { value: 0, type: '0.0' };
  
    if (discount.type === '0.0') {
      discountedPrice = Math.max(0, basePrice - discount.value);
    } else {
      discountedPrice = basePrice * (1 - (discount.value / 100));
    }
    return Math.round(discountedPrice * 100) / 100;
  };
  
  watch(
    () => ({
      quantity: selectedArticle.value.quantity,
      unitPrice: selectedArticle.value.unitPrice,
      discount: selectedArticle.value.discount,
      taxes: selectedArticle.value.taxes.map(t => t.hashed_id) 
    }),
    () => {
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
    },
    { deep: true }
  );

  const getTaxAmount = (article: InvoiceItem, tax: { rate: number }): number => {
    const quantity = Number(article.quantity || 0);
    const unitPrice = Number(article.unitPrice || 0);
    const rate = Number(tax.rate || 0);
    const basePrice = quantity * unitPrice;  
    const discount = article.discount || { value: 0, type: "%" };
    let discountedPrice = basePrice;
  
    if (discount.type === "%") {
      discountedPrice = basePrice * (1 - discount.value / 100);
    } else {
      discountedPrice = Math.max(0, basePrice - discount.value);
    }

    const taxAmount = parseFloat((discountedPrice * rate / 100).toFixed(2));  
    return taxAmount;
  };

  const onTaxChange = (selectedTaxId: string, articleId: string, taxIndex: number) => {
    const selectedTax = taxes.value.find(t => t.hashed_id === selectedTaxId);
    if (selectedTax) {  
      selectedArticle.value.taxes[taxIndex] = {
        hashed_id: selectedTax.hashed_id,
        title: selectedTax.title,
        rate: selectedTax.rate,
      };
    } else {
      console.warn('Tax not found for ID:', selectedTaxId);
    }
  };

  const addTax = (articleId: string) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : invoiceForm.items.find(a => a.id === articleId);
  
    if (!article) return;
  
    article.taxes = article.taxes || [];
    article.taxes.push({
      hashed_id: '',  
      title: '',
      rate: 0
    });
  };
  
  const removeTax = (articleId: string, taxIndex: number) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : invoiceForm.items.find(a => a.id === articleId);
  
    if (!article || !article.taxes) return;
  
    if (article.taxes.length <= 1) {
      console.warn("At least one tax must remain.");
      return;
    }
    article.taxes.splice(taxIndex, 1);
  };

  const saveArticle = () => {
    if (selectedArticle.value) {
      selectedArticle.value.price = calculateArticlePrice(selectedArticle.value);
      console.log('Saving article with journal ID:', selectedArticle.value.journal_id);

      const itemCopy = {
        ...selectedArticle.value,
        taxes: selectedArticle.value.taxes
          ? selectedArticle.value.taxes.map(t => ({ ...t })) 
          : []
      };
      const itemIndex = invoiceForm.items.findIndex(
        item => item.id === selectedArticle.value.id
      );

      if (itemIndex !== -1) {
        invoiceForm.items[itemIndex] = itemCopy;
      } else {
        invoiceForm.items.push(itemCopy);
      }
      const savedItem = invoiceForm.items.find(item => item.id === itemCopy.id);
      console.log('Item saved with journal:', savedItem?.journal_id);
      
      closeArticleDetailsModal();
    }
  };

  //item in bulk code
  const openArticleModal = () => isArticleModalOpen.value = true;
  const closeArticleModal = () => isArticleModalOpen.value = false;

  const paginatedArticles = computed(() => {
    const filtered = availableArticles.value.filter(article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    const start = (currentPage.value - 1) * articlesPerPage;
    return filtered.slice(start, start + articlesPerPage);
  });

  const totalPages = computed(() => {
    const filteredCount = availableArticles.value.filter(article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).length;
    return Math.ceil(filteredCount / articlesPerPage);
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const itemSelection = async (itemId :  any) => {
    const isSelected = Items.value.includes(itemId);
    const article = availableArticles.value.find(a => a.id === itemId);
    if (!article) return;
    if (!isSelected) {
      if (article.quantity <= 0) {
        await showToast(`${article.title || 'Item'} is not in stock`);
        return;
      }
      Items.value.push(itemId);
      article.quantity -= 1;
    } else {
      Items.value = Items.value.filter(id => id !== itemId);
      article.quantity += 1;
    }
  };

  const addSelectedItems = async () => {
    for (const itemId of Items.value) {
      const item = availableArticles.value.find(a => a.id === itemId);
      if (!item) continue;
      if (item.quantity <= -1) {
        await showToast(`${item.title || 'Item'} is not in stock`);
        continue;
      }
      const newItem: InvoiceItem = {
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        quantity: 1,
        unitPrice: item.unitPrice || 0,
        discount: { value: 0, type: '%' },
        taxes: item.taxes || [{ id: Date.now().toString(), type: 'TVA(0%)' }],
        price: item.unitPrice || 0,
        journal_id: selectedJournalId.value || '',
      };
      invoiceForm.items.push(newItem);
      item.quantity -= 1;
    }
    Items.value = [];
    isArticleModalOpen.value = false;
  };

  //navigating code 
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  //new item code
  const openNewItemModal = async () => {
    console.log('Opening modal');  
    isNewItemModalOpen.value = true;
    isNewItemPopoverOpen.value = false;
    newItemForm.value = {
      title: '',
      reference: '',
      description: '',
      taxe: '0%', 
      unity: '', 
      category: '', 
      brand: '',
    };
    itemDestination.value = 1; 
    itemType.value = 1;
    sellingRate.value = 0;
    buyingRate.value = 0;
    try {
      const [unitiesRes, categoriesRes, brandsRes] = await Promise.all([
        getUnitiesList(),
        getCategoriesList(),
        getBrandsList(),
      ]);
  
      itemUnities.value = unitiesRes.unities || [];
      itemCategories.value = categoriesRes.categories || [];
      itemBrands.value = brandsRes.brands || [];
  
    } catch (error) {
      console.error("Error fetching item modal dropdowns:", error);
    }
  };

  const closeNewItemModal = () => {
    console.log('Closing modal');  
    isNewItemModalOpen.value = false;
  };

  //Create item
  const addNewItem = async () => {
    try {
      const priceListResponse  = await getPriceList();
      const priceLists = priceListResponse.priceLists;
      const priceListId = priceLists[0]?.hashed_id;
      if (!priceListId) {
        throw new Error('No price list found');
      }
      const payload = {
        title: newItemForm.value.title,
        reference: newItemForm.value.reference,
        description: newItemForm.value.description,
        taxe: newItemForm.value.taxe,
        type: itemType.value ?? 1,
        destination: itemDestination.value ?? 1,
        unity_id: newItemForm.value.unity,
        category: newItemForm.value.category,
        brand: newItemForm.value.brand,
        prices: [{
          default_selling_rate: sellingRate.value.toString(),
          default_buying_rate: buyingRate.value.toString(),
          item_price_list_hashed_id: priceListId, 
        }],
      };
      const createdItem = await AddItem(payload);
      console.log('jadwil dharb : ', payload);

      console.log('Item created:', createdItem);
      closeNewItemModal();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const onClientSelected = (selectedValue : string) => {
    console.log('Client ID selected:', selectedValue);
    const client = clients.value.find(c => c.hashed_id === selectedValue);
    console.log('Found client:', client);
    selectedClient.value = client || null;
    selectedCurrency.value = client?.currency || null;
    console.log('Selected currency:', selectedCurrency.value);
    if (client?.billing) {
      if (typeof client.billing === 'string') {
        try {
          billingAddress.value = JSON.parse(client.billing) as Address;
          deliveryAddress.value = JSON.parse(client.delivery) as Address;

        } catch (e) {
          console.warn('Failed to parse billing address:', e);
          billingAddress.value = null;
          deliveryAddress.value = null;

        }
      } else {
        billingAddress.value = client.billing;
        deliveryAddress.value = client.billing;

      }
    } else {
      billingAddress.value = null;
      deliveryAddress.value = null;

    }
    console.log('Selected billing:', billingAddress.value);
    console.log('Selected delivary:', deliveryAddress.value);
  };

  // Voice handlers
  const handleVoiceFormUpdate = (result: VoiceFormMappingResult) => {
    lastVoiceResult.value = result;
    if (result.fieldsUpdated.some(field => field.includes('item') || field.includes('Item'))) {
      calculateTotal();
    }
    showToast(`Voice input updated: ${result.fieldsUpdated.join(', ')}`);
    console.log('Voice form update result:', result);
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
    showToast(`Voice input failed: ${error}`);
  };
  const toggleVoiceHelp = ref(false);

  // Initialize voice service on mount
  const initializeVoice = async () => {
    try {
      const hasPermission = await voiceService.initializeVoiceRecording();
      if (!hasPermission) {
        isVoiceEnabled.value = false;
        console.warn('Voice input disabled - no microphone permission');
      }
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      isVoiceEnabled.value = false;
    }
  };

  // PDF upload handler functions
  const openPdfUpload = () => {
    if (pdfFileInputRef.value) {
      pdfFileInputRef.value.click();
    } else {
      console.error("PDF file input ref not found");
    }
  };

  const handlePdfUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    isProcessingPdf.value = true;
    pdfProcessingError.value = null;
    
    try {
      const extractedData = await pdfService.processPdfInvoice(file);
      openPdfPreviewModal(extractedData);
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      pdfProcessingError.value = error.response?.data?.error || 'Failed to process PDF';
      showToast(`Error processing PDF: ${pdfProcessingError.value}`);
    } finally {
      isProcessingPdf.value = false;
      if (input) input.value = '';
    }
  };

  const openPdfPreviewModal = (data: any) => {
    pdfExtractedData.value = data;
    isPdfPreviewModalOpen.value = true;
  };

  const closePdfPreviewModal = () => {
    isPdfPreviewModalOpen.value = false;
  };

  // Add this function to your controller
  const addDirectItemFromPdf = (itemData: {
    title?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
  }) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: itemData.title || '',
      description: itemData.description || '',
      quantity: itemData.quantity !== undefined ? itemData.quantity : 1,
      unitPrice: itemData.unitPrice !== undefined ? itemData.unitPrice : 0,
      discount: { value: 0, type: '%' },
      taxes: [{
        hashed_id: '',        
        title: '',    
        rate: 0        
      }],
      price: (itemData.quantity || 1) * (itemData.unitPrice || 0),
      journal_id: selectedJournalId.value || '',
    };
    
    // Add directly to items array
    invoiceForm.items.push(newItem);
    console.log('Directly added item to form:', newItem);
    
    // Update totals
    updateTotals();
  };

  const applyExtractedData = () => {
    if (!pdfExtractedData.value) return;
    
    pdfFormMappingService.mapExtractedDataToForm(
      pdfExtractedData.value,
      invoiceForm,
      {
        clients: clients.value,
        categories: categories.value,
        deadlines: deadlines.value,
        banks: banks.value,
        onClientSelected,
        addArticleForm,
        updateTotals,
        selectedJournalId: selectedJournalId.value || undefined,
        addDirectItemFromPdf  
      }
    );
    closePdfPreviewModal();
    showToast("PDF data applied to form");
  };

  const reloadCurrencyRate = async () => {
    try {
        const rate = await fetchLiveCurrencyRate('EUR', 'TND');
        invoiceForm.currency_rate = parseFloat(rate.toFixed(3));
        console.log("Currency rate updated:", rate);
    } catch (error) {
        console.error("Failed to reload currency rate:", error);
    }
  };
  
  const defaultJournalLabel = computed(() => {
    if (!selectedJournalId.value) return 'None';
    const journalIdStr = selectedJournalId.value.toString();
    const journal = flattenedJournals.value.find(j => j.id.toString() === journalIdStr);
    return journal ? journal.label : `ID: ${journalIdStr}`;
  });

  watch(isArticleDetailsModalOpen, (isOpen) => {
    if (isOpen && selectedArticle.value) {
      if (!selectedArticle.value.journal_id && !isNewItem.value) {
        selectedArticle.value.journal_id = selectedJournalId.value || '';
        console.log('Initialized journal for edited item:', selectedArticle.value.journal_id);
      }
    }
  });

  onMounted(async () => {
    try {
      clients.value = await getClientsList();
      const nextNumber = await getLastInvoiceNumber();
      invoiceForm.invoice_number =  nextNumber.toString().padStart(5, '0');
      const res = await fetchItems(); 
      const items = res.items.data;
      availableArticles.value = items.map((item: Item) => ({
        id: item.hashed_id,
        title: item.title,
        quantity: item.stock,
        unitPrice: parseFloat(item.prices?.[0]?.default_selling_rate || '0'),
        discount: { value: 0, type: '%' },
        taxes: [], 
        price: parseFloat(item.prices?.[0]?.default_selling_rate || '0'),
      }));
      const journal = await fetchJournals();
      journals.value = journal.journals;
      console.log('Fetched journalsss:', journal);

      try {
        console.log('Sample journals:', journals.value.slice(0, 3).map(j => ({ id: j.id, title: j.title })));
        const defaultJournal = await fetchDefaultSalesJournal();
        if (defaultJournal) {
          selectedJournalId.value = defaultJournal.id;
          console.log('Using default journal:', defaultJournal.id, defaultJournal.title);
          setTimeout(() => {
            const journalExists = flattenedJournals.value.some(j => 
              j.id.toString() === selectedJournalId.value.toString()
            );
            if (!journalExists) {
              console.warn('Warning: Selected journal not found in dropdown list');
            }
          }, 100);
        } else {
          selectedJournalId.value = journals.value[0]?.id;
          console.log('No default journal found, using first journal:', selectedJournalId.value);
        }
      } catch (error) {
        console.error('Journal setup error:', error);
        if (journals.value.length > 0) {
          selectedJournalId.value = journals.value[0]?.id;
        }
      }

      const category = await fetchCategories();
      categories.value = category.categories;
      if (categories.value.length > 0) {
        invoiceForm.category = categories.value[0].hashed_id;
      }
      console.log('Fetched categoriiesss:', category);
      const deadline = await fetchDeadlines();
      deadlines.value = deadline.invoiceDeadlines;
      if (deadlines.value.length > 0) {
        invoiceForm.deadline = deadlines.value[0].hashed_id;
      }
      console.log('Fetched deadlinesss:', deadline);
      const bankResponse = await fetchBanks();
      banks.value = bankResponse.banks.data;
      if (banks.value.length > 0) {
        invoiceForm.selected_bank = banks.value[0].hashed_id;
      }
      console.log('Fetched bankssss:', bankResponse);
      const { companyId } = await fetchCurrentCompany();
      const companyData = await apiService.getCompanyData(companyId);
      companyName.value = companyData.data.company.title;

      const tax = await fetchTaxes();
      taxes.value = tax.data.data.taxes.data;
      console.log('Fetched taxes:', taxes.value);

      await initializeVoice();

    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  });

  return {
    invoiceForm,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    isNewItemPopoverOpen,
    selectedArticle,
    currentPage,
    searchQuery,
    frequency,
    itemDestination,
    itemType,
    Items,
    articles: invoiceForm.items,
    paginatedArticles,
    totalPages,
    clients,
    isNewItem,
    selectedJournalId,
    flattenedJournals,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    taxValues,
    categories,
    deadlines,
    currentYear,
    selectedCurrency,
    selectedClient,
    billingAddress,
    deliveryAddress,
    itemCategories,
    itemBrands,
    itemUnities,
    banks,
    companyName,
    taxes,
    defaultJournalLabel,
    reloadCurrencyRate,
    getTaxAmount,
    onClientSelected,
    calculateTaxes,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    getFileDisplayText,
    handleFileChange,
    triggerFileInput,
    onTaxChange,
    handleAction,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    addTax,
    removeTax,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    addNewItem,
    openArticleModal,
    closeArticleModal,
    openNewItemModal,
    closeNewItemModal,
    validateAndSubmit,
    saveArticle,

    // Voice related
    isVoiceEnabled,
    voiceEndpoint,
    lastVoiceResult,
    toggleVoiceHelp,
    handleVoiceFormUpdate,
    handleVoiceError,
    initializeVoice,
    
    // PDF related
    pdfFileInputRef,
    isProcessingPdf,
    pdfProcessingError,
    isPdfPreviewModalOpen,
    pdfExtractedData,
    openPdfUpload,
    handlePdfUpload,
    openPdfPreviewModal,
    closePdfPreviewModal,
    applyExtractedData
  };
}