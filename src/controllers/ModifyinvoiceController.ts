import { ref, computed, onMounted, watch, reactive  } from 'vue';
import type { AddInvoiceForm, InvoiceItem, AttachmentData } from '@/models/InvoicesModel';
import type { Currency, WithholdingType  } from '@/models/CompanyModel';
import type { Address } from '@/models/ClientModel';
import type { Client } from '@/models/ClientModel';
import { updateInvoice, getInvoice, API_URL } from '@/services/Invoices'; 
import { fetchWithholdingTypes, fetchTaxes } from '@/services/Company'; 
import { getClientsList } from '@/services/Clients'; 
import { fetchItems } from '@/services/Items'; 
import { Item } from '@/models/ItemModel';
import { fetchJournals } from '@/services/Journals'; 
import { toastController } from '@ionic/vue'; 
import { fetchCategories } from '@/services/Categories';
import { fetchDeadlines } from '@/services/Deadlines'; 
import { fetchBanks } from '@/services/Banks'; 
import { Bank } from '@/models/BankModel';
import { fetchCurrentCompany } from '@/services/Dashboard'; 
import  apiService  from '@/services/Dashboard'; 
import { AddItem, getPriceList, getBrandsList, getCategoriesList, getUnitiesList } from '@/services/Items'; 
import { useRoute } from 'vue-router';
import { createDefaultInvoiceForm } from '@/utils/invoiceFactory';
import { fetchLiveCurrencyRate } from '@/services/CurrencyRate'; 



export function useModifyInvoiceController() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const route = useRoute();
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
    taxes: [{ id: '', title: '', rate: 0 }],
    price: 0,
  });
  const Items = ref<string[]>([]);
  const availableArticles = ref<InvoiceItem[]>([]);
  const currentPage = ref(1);
  const articlesPerPage = 5;
  const searchQuery = ref('');
  const frequency = ref('monthly');
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
  const withholdings = ref<WithholdingType[]>([]);
  const taxes = ref<any[]>([]);
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
  const invoiceId = route.params.id as string;
  const selectedFile = ref<File | null>(null);

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
  const selectedJournalId = ref(null);
  const flattenedJournals = computed(() => {
    const result = [];
    for (const parent of journals.value) {
      result.push({
        id: parent.id,
        label: `${parent.composed_number} - ${parent.title}`,
      });
  
      if (parent.children && parent.children.length > 0) {
        for (const child of parent.children) {
          result.push({
            id: child.id,
            label: `--- ${child.composed_number} - ${child.title}`,
          });
          if (child.children && child.children.length > 0) {
            for (const grandChild  of child.children) {
              result.push({
                id: grandChild.id,
                label: `----- ${grandChild.composed_number} - ${grandChild.title}`,
              });
            }
          }
        }
      }
    }
    return result;
  });
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
  const isFile = (attachment: File | AttachmentData): attachment is File => {
    return typeof File !== 'undefined' && attachment instanceof File;
  };
  
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
        files.forEach(file => {
        invoiceForm.attachments.push(file);
      });
      selectedFile.value = files[files.length - 1]; 
      input.value = "";
    }
  };

  const getCleanFileName = (attachment: File | AttachmentData) => {
    if (!isFile(attachment)) {
      const fullFileName = attachment.file.split('/').pop() || "Attached file";
      const match = fullFileName.match(/(\d{4}-\d{5}\.pdf)$/);
      return match ? match[1] : fullFileName;
    }
    return "";
  };
  
  const getFileUrl = (attachment: File | AttachmentData): string => {
    if (attachment instanceof File) {
      return URL.createObjectURL(attachment);
    }
    if (attachment.file && attachment.file.startsWith("storage")) {
      return `${API_URL}/${attachment.file}`;
    }
    return attachment.file || "";
  };
  
  const removeAttachment = (index: number) => {
    if (invoiceForm.attachments && invoiceForm.attachments.length > index) {
      invoiceForm.attachments.splice(index, 1);
    }
  };
  


//calculations

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

const toDateOnly = (dateStr: string | null): string => {
  return dateStr ? dateStr.split('T')[0] : '';
};

const fetchInvoice = async () => {
  try {
    const data = await getInvoice(invoiceId);
  
    console.log("ahawa : ", data);
    data.date = toDateOnly(data.date);
    data.due = toDateOnly(data.due);
    data.recurrence_start = toDateOnly(data.recurrence_start);
    data.recurrence_end = toDateOnly(data.recurrence_end);
    if (typeof data.totals === 'string') {
      try {
        data.totals = JSON.parse(data.totals);
      } catch (e) {
        console.error("Failed to parse totals JSON:", e);
        data.totals = { discount: '', total: '', taxes: '', subtotal: '' }; 
      }
    }
    invoiceForm.category = data.hashed_invoice_category_id;
    invoiceForm.deadline = data.hashed_invoice_deadline_id;

    invoiceForm.date = data.date;
    invoiceForm.due = data.due;
    invoiceForm.currency_rate = data.currency_rate;
    invoiceForm.invoice_number = data.naming_series_composed_number;
    invoiceForm.client_id = data.hashed_contact_id;
    invoiceForm.referenceNumber = data.journal_entry?.reference_number ?? '';
    invoiceForm.tax_type = data.tax_type;
    invoiceForm.items = data.items.map((item: any) => ({
      id: item.item_hashed_id || item.id,
      title: item.item?.title || '',
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
    invoiceForm.journalEntry = data.hashed_journal_entry_id;
    invoiceForm.generalTerms = data.conditions;
    invoiceForm.use_conditions = data.use_conditions;

    invoiceForm.attachments = data.attachments;
    invoiceForm.object = data.object;
    invoiceForm.totals = data.totals;
    invoiceForm.watermark = data.watermark ?? '';
    invoiceForm.language = data.language;
    invoiceForm.withholding_type_id = data.hashed_withholding_type_id ?? '';
    invoiceForm.recurrence = data.recurrence;
    invoiceForm.recurrence_start = data.recurrence_start;
    invoiceForm.recurrence_end = data.recurrence_end;
    invoiceForm.recurrence_each = data.recurrence_each;
    invoiceForm.recurrence_type = data.recurrence_type;
    invoiceForm.remarks = data.notes;
    const display = JSON.parse(data.display);
    invoiceForm.show_billing = display.billing;
    invoiceForm.showArticleUnit = display.unity;
    invoiceForm.show_delivery = display.delivery;
    invoiceForm.show_conditions = display.conditions;
    invoiceForm.showArticleTTCPrices = display.ttc;
    invoiceForm.show_stamp = display.stamp;
    invoiceForm.show_description = display.description;
    invoiceForm.show_bank = Number(display.bank);
    invoiceForm.selected_bank = display.selected_bank;
    invoiceForm.show_pictures = display.pictures;
    /*invoiceForm.additionalEntries = {
      tva: data.withhold ?? 0,
      fiscalStamp: display.stamp ?? 0,
      exemple: 0,
    };*/

    if (data.hashed_withholding_type_id) {
      const withholdingType = await getWithholdingType(data.hashed_withholding_type_id);
      console.log("Withholding Type: ", withholdingType);  // Debugging line
      data.withholdingType = withholdingType;
    }
  } catch (err: any) {
    error.value = 'Failed to fetch invoice';
    console.error(err);
  }
};

const validateAndSubmit = async () => {
  if (validateInvoiceForm()) {
    isLoading.value = true;
    try {
      console.log('Submitting category:', invoiceForm.category); // or invoiceForm.value.category

      const updatedInvoice = await updateInvoice(invoiceId, invoiceForm);
      console.log("Invoice updated successfully:", updatedInvoice);
    } catch (error) {
      console.error("Failed to update invoice:", error);
  
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
      selectedArticle.value = { 
        id: article.id,
        title: article.title,
        description: article.description || '',
        quantity: article.quantity || 0,
        unitPrice: article.unitPrice || 0,
        discount: article.discount || { value: 0, type: '0.0' },
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
        quantity: 0,
        unitPrice: 0,
        discount: { value: 0, type: '0.0' },
        taxes: [],
        price: 0
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

  const reloadCurrencyRate = async () => {
    try {
        const rate = await fetchLiveCurrencyRate('EUR', 'TND');
        invoiceForm.currency_rate = parseFloat(rate.toFixed(3));
        console.log("Currency rate updated:", rate);
    } catch (error) {
        console.error("Failed to reload currency rate:", error);
    }
  };
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
      const journal = await fetchJournals();
      journals.value = journal.journals;
      console.log('Fetched journalsss:', journal);
      
      const category = await fetchCategories();
      categories.value = category.categories;
      console.log('Fetched categoriiesss:', category);

      const deadline = await fetchDeadlines();
      deadlines.value = deadline.invoiceDeadlines;
      console.log('Fetched deadlinesss:', deadline);

      const bankResponse = await fetchBanks();
      banks.value = bankResponse.banks.data;
      console.log('Fetched bankssss:', bankResponse);

      const { companyId } = await fetchCurrentCompany();
      const companyData = await apiService.getCompanyData(companyId);
      companyName.value = companyData.data.company.title;

      const response = await fetchWithholdingTypes ();
      withholdings.value = response.data.data.withholdingTypes;
      console.log('Fetched withholdings:', withholdings.value);
      
      const tax = await fetchTaxes();
      const taxList = tax?.data?.data?.taxes?.data ?? [];
      taxes.value = taxList;
      console.log('Fetched taxes:', taxes.value);

      fetchInvoice();

    } catch (error) {
      console.error('Error fetching :', error);
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
    withholdings,
    taxes,
    selectedFile,
    reloadCurrencyRate,
    isFile,
    getCleanFileName,
    getFileUrl,
    removeAttachment,
    onTaxChange,
    getTaxAmount,
    onClientSelected,
    calculateTaxes,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    updateTotals,
    handleFileChange,
    triggerFileInput,
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
    saveArticle
  };
}