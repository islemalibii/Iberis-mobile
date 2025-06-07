import { ref, computed, onMounted, watch, reactive } from 'vue';
import type { AddExitVoucherForm, VoucherItem } from '@/models/BonSortieModel';
import type { Currency } from '@/models/CompanyModel';
import type { Address } from '@/models/ClientModel';
import type { Client } from '@/models/ClientModel';
import { updateExitVoucher, getExitVoucherDetails } from '@/services/BonSortie'; 
import { fetchTaxes } from '@/services/Company'; 
import { getClientsList } from '@/services/Clients'; 
import { fetchItems } from '@/services/Items'; 
import { Item } from '@/models/ItemModel';
import { toastController } from '@ionic/vue'; 
import { fetchCategories } from '@/services/Categories';
import { fetchBanks } from '@/services/Banks'; 
import { Bank } from '@/models/BankModel';
import { fetchCurrentCompany } from '@/services/Dashboard'; 
import apiService from '@/services/Dashboard'; 
import { AddItem, getPriceList, getBrandsList, getCategoriesList, getUnitiesList } from '@/services/Items'; 
import { useRoute } from 'vue-router';
import { createDefautEstimateForm } from '@/utils/EstimateFactory';

export function useUpdateExitVoucherController() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const route = useRoute();
  const voucherForm = reactive<AddExitVoucherForm>(createDefautEstimateForm());
  const companyName = ref('');
  const isArticleModalOpen = ref(false);
  const isArticleDetailsModalOpen = ref(false);
  const isNewItemModalOpen = ref(false);
  const isNewItemPopoverOpen = ref(false);
  const selectedArticle = ref<VoucherItem>({
    id: '',
    title: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
    taxes: [{ hashed_id: '', title: '', rate: 0 }],
    price: 0
  });
  const Items = ref<string[]>([]);
  const availableArticles = ref<VoucherItem[]>([]);
  const currentPage = ref(1);
  const articlesPerPage = 5;
  const searchQuery = ref('');
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
  const taxes = ref<any[]>([]);
  const itemDestination = ref<number | null>(null);
  const itemType = ref<number | null>(null);
  const sellingRate = ref(0);
  const buyingRate = ref(0);
  const taxValues = ref({
    tva: 10.07
  });
  const currentYear = ref(new Date().getFullYear());

  const categories = ref<any[]>([]);
  const voucherId = route.params.id as string;
  const currencyRate = ref(3.315);

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
      voucherForm.attachments = Array.from(input.files);
      console.log("Files added:", voucherForm.attachments);
      if (voucherForm.attachments.length > 0) {
        console.log("Files successfully saved to form");
        console.log("Number of files:", voucherForm.attachments.length);
        const fileNames = voucherForm.attachments.slice(0, 3).map(file => file.name);
        console.log("File names:", fileNames);
      } else {
        console.error("Files were not saved to form");
      }
    }
  };
  
  const getFileDisplayText = () => {
    if (!voucherForm.attachments || voucherForm.attachments.length === 0) {
      return "No file chosen";
    } else if (voucherForm.attachments.length === 1) {
      return voucherForm.attachments[0].name;
    } else {
      return `${voucherForm.attachments.length} files selected`; // Fixed template string syntax
    }
  };
  
  // Calculs
  const calculateSubtotal = () => {
    if (!voucherForm.items || voucherForm.items.length === 0) {
      return 0;
    }
    const subtotal = voucherForm.items.reduce((sum, item) => {
      const itemTotal = calculateArticlePrice(item);
      return sum + itemTotal;
    }, 0);
    voucherForm.totals.subtotal = subtotal.toFixed(3);
    return subtotal;
  };

  const calculateTaxes = (): number => {
    if (!voucherForm?.AdditionalEntries) {
      return 0;
    }
    const totalTax = (Object.keys(taxValues.value) as Array<keyof typeof taxValues.value>)
      .reduce((sum, key) => {
        const isEnabled = voucherForm.AdditionalEntries[key] === 1;
        const taxAmount = taxValues.value[key] || 0;
        return sum + (isEnabled ? taxAmount : 0);
      }, 0);
    console.log('exitvoucher Form:', voucherForm);
    voucherForm.totals.taxes = totalTax.toFixed(3);
    return totalTax;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(voucherForm.totals.discount) ;
    const taxes = calculateTaxes();
    const total = Math.max(0, subtotal - discount + taxes);
    voucherForm.totals.taxes = taxes.toFixed(3);
    voucherForm.totals.total = total.toFixed(3);
    return total;
  };

  const formatPrice = (price: any) => {
    return Number(price).toFixed(3);
  };

  const updateTotals = () => {
    calculateTotal();
  };

  const toDateOnly = (dateStr: string | null): string => {
    return dateStr ? dateStr.split('T')[0] : '';
  };

  // Gestion des articles
  const addArticleForm = () => {
    const newItemForm: VoucherItem = {
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
      price: 0.0
    };
    selectedArticle.value = newItemForm;
    isNewItem.value = true;
    isArticleDetailsModalOpen.value = true;
  };

  const removeArticle = (articleId: string) => {
    if (voucherForm.items.length > 1) {
      voucherForm.items = voucherForm.items.filter(item => item.id !== articleId);
    }
  };

  const openArticleDetailsModal = (articleParam: any) => {
    let article;
    if (typeof articleParam === 'object') {
      article = articleParam;
    } else {
      article = voucherForm.items.find(item => item.id === articleParam);
    }
    
    if (article) {
      selectedArticle.value = { 
        id: article.id || '',
        title: article.title || '',
        description: article.description || '',
        quantity: article.quantity || 0,
        unitPrice: article.unitPrice || 0,
        discount: article.discount || { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
        taxes: article.taxes || [],
        price: 0
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
      selectedArticle.value = {
        id: '',
        title: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: { value: 0, type: '%' }, // Fixed type from '0.0' to '%'
        taxes: [],
        price: 0
      };
    }, 100);
  };

  const calculateArticlePrice = (article: VoucherItem): number => {
    const quantity = Number(article.quantity || 0);
    const unitPrice = Number(article.unitPrice || 0);
    const basePrice = quantity * unitPrice;
    let discountedPrice = basePrice;
    const discount = article.discount || { value: 0, type: '%' }; // Fixed type from '0.0' to '%'

    if (discount.type === '0.0') { // Keep this for backward compatibility
      discountedPrice = Math.max(0, basePrice - discount.value);
    } else {
      discountedPrice = basePrice * (1 - (discount.value / 100));
    }
    
    return parseFloat(discountedPrice.toFixed(2));
  };
  
  const getTaxAmount = (article: VoucherItem, tax: { rate: number }): number => {
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
      : voucherForm.items.find(a => a.id === articleId);

    if (article) {
      article.taxes = article.taxes || [];
      article.taxes.push({
        hashed_id: '',
        title: '',
        rate: 0
      });
    }
  };

  const removeTax = (articleId: string, taxIndex: number) => {
    const article = selectedArticle.value?.id === articleId
      ? selectedArticle.value
      : voucherForm.items.find(a => a.id === articleId);
  
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
  
      const itemCopy = {
        ...selectedArticle.value,
        taxes: selectedArticle.value.taxes
          ? selectedArticle.value.taxes.map(t => ({ ...t })) 
          : []
      };
      const itemIndex = voucherForm.items.findIndex(
        item => item.id === selectedArticle.value.id
      );
  
      if (itemIndex !== -1) {
        voucherForm.items[itemIndex] = itemCopy;
      } else {
        voucherForm.items.push(itemCopy);
      }
      closeArticleDetailsModal();
    }
  };
  
  const validateVoucherForm = (): boolean => { // Fixed function name casing
    if (voucherForm.items.length === 0) {
      console.error('At least one article is required');
      return false;
    }
    if (!voucherForm.client_id) {
      console.error('Client is required');
      return false;
    }
    return true;
  };
  
  const validateAndSubmit = async () => {
    if (validateVoucherForm()) { // Fixed function name casing
      isLoading.value = true;
      try {
        const updatedVoucher = await updateExitVoucher(voucherId, voucherForm);
        console.log("Voucher updated successfully:", updatedVoucher); // Fixed typo in "voucher"
      } catch (error) {
        console.error("Failed to update voucher:", error);
      } finally {
        isLoading.value = false;
      }
    }
  };
  
  // Gestion des articles en masse
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
  
  const itemSelection = async (itemId: any) => {
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
      const newItem: VoucherItem = {
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        quantity: 1,
        unitPrice: item.unitPrice || 0,
        discount: { value: 0, type: '%' },
        taxes: item.taxes || [{ id: Date.now().toString(), type: 'TVA(0%)' }],

        price: item.unitPrice || 0,
      };
      voucherForm.items.push(newItem);
      item.quantity -= 1;
    }
    Items.value = [];
    isArticleModalOpen.value = false;
  };

  // Navigation pagination
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

  // Gestion nouveau article
  const openNewItemModal = async () => {
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
      console.error("Error fetching item data:", error);
    }
  };


  const closeNewItemModal = () => {
    console.log('Closing modal');  
    isNewItemModalOpen.value = false;
  };


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
/**
 * Fixed function to fetch and process exit voucher data
 */
const fetchVoucher = async () => {
  try {
    const data = await getExitVoucherDetails(voucherId);
    console.log("Exit voucher data:", data);
    
    const voucherData = data.data.exit_voucher;
    
    voucherForm.date = toDateOnly(voucherData.date);
    
    if (typeof voucherData.totals === 'string') {
      try {
        voucherForm.totals = JSON.parse(voucherData.totals);
      } catch (e) {
        console.error("Failed to parse totals JSON:", e);
        voucherForm.totals = { discount: '0', total: '0', taxes: '0', subtotal: '0' };
      }
    } else {
      voucherForm.totals = voucherData.totals;
    }

    voucherForm.currency_rate = voucherData.currency_rate;
    voucherForm.ExitVoucher_number = voucherData.exit_voucher_number;
        console.log("number:", voucherForm.ExitVoucher_number);

    voucherForm.referenceNumber = voucherData.reference_number;
            console.log("ref:", voucherForm.referenceNumber);

    voucherForm.tax_type = voucherData.tax_type;
    voucherForm.object = voucherData.object;
    console.log("object:", voucherForm.object);

    voucherForm.client_id = voucherData.hashed_contact_id;
    voucherForm.category =voucherData.hashed_invoice_category_id;
    console.log("Category before update:", voucherForm.category);

    voucherForm.items = voucherData.items.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: parseFloat(item.rate) || 0,
      discount: {
        value: parseFloat(item.discount_rate) || 0,
        type: item.discount_type === 1 ? '%' : '0.0',
      },
      taxes: (item.taxes || []).map((tax: any) => {
        const matchedTax = taxes.value.find(
          (t: any) => t.hashed_id === tax.hashed_company_tax_id
        );
        return {
          id: tax.hashed_company_tax_id, 
          title: matchedTax?.title || 'No Title',
          rate: parseFloat(matchedTax?.rate) || 0,
        };
      }),
    }));
    
    voucherForm.generalTerms = voucherData.conditions ;
    voucherForm.attachments = voucherData.attachments;
    voucherForm.object = voucherData.object;
    voucherForm.watermark = voucherData.watermark  ;
    voucherForm.language = voucherData.language;
        console.log("laguage:", voucherForm.language);
///voucherForm.show_billing=voucherData.billing
      //  console.log("showbilling:", voucherForm.show_billing);

    voucherForm.remarks = voucherData.notes ;
 
    // Process display settings
    const display = typeof voucherData.display === 'string' 
      ? JSON.parse(voucherData.display) 
      : voucherData.display;
      
    voucherForm.show_billing = display.billing;
    voucherForm.showArticleUnit = display.unity;
    voucherForm.show_delivery = display.delivery;
    voucherForm.show_conditions = display.conditions;
    voucherForm.showArticleTTCPrices = display.ttc;
    voucherForm.show_stamp = display.stamp;
    voucherForm.show_description = display.description;
    voucherForm.show_bank = Number(display.bank);
    voucherForm.selected_bank = display.selected_bank;
    voucherForm.show_pictures = display.pictures;
  
  } catch (err: any) {
    error.value = 'Failed to fetch exit voucher';
    console.error(err);
  }
};

  // Initialisation
  onMounted(async () => {
    try {
      clients.value = await getClientsList();
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
      
      const category = await fetchCategories();
      categories.value = category.categories;
      console.log('Fetched categories:', category);

      const bankResponse = await fetchBanks();
      banks.value = bankResponse.banks.data;
      console.log('Fetched banks:', bankResponse);

      const { companyId } = await fetchCurrentCompany();
      const companyData = await apiService.getCompanyData(companyId);
      companyName.value = companyData.data.company.title;

      const tax = await fetchTaxes();
      const taxList = tax?.data?.data?.taxes?.data ?? [];
      taxes.value = taxList;
      console.log('Fetched taxes:', taxes.value);

      await fetchVoucher();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
 

  });

  return {
    voucherForm,
    isArticleModalOpen,
    isArticleDetailsModalOpen,
    isNewItemModalOpen,
    isNewItemPopoverOpen,
    selectedArticle,
    currentPage,
    searchQuery,
    Items,
    paginatedArticles,
    totalPages,
    clients,
    isNewItem,
    newItemForm,
    sellingRate,
    buyingRate,
    fileInputRef,
    categories,
    selectedCurrency,
    selectedClient,
    billingAddress,
    deliveryAddress,
    itemCategories,
    itemBrands,
    itemUnities,
    banks,
    companyName,
    taxValues,
    currencyRate,
    taxes,
    onClientSelected,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    getFileDisplayText,
    triggerFileInput,
    handleFileChange,
    addArticleForm,
    removeArticle,
    openArticleDetailsModal,
    closeArticleDetailsModal,
    addTax,
    removeTax,
    saveArticle,
    itemSelection,
    addSelectedItems,
    nextPage,
    prevPage,
    openArticleModal,
    closeArticleModal,
    openNewItemModal,
    closeNewItemModal,
    addNewItem,
    validateAndSubmit,
    calculateArticlePrice,
    onTaxChange,
    getTaxAmount,
    fetchVoucher,
    validateVoucherForm 
  };
}