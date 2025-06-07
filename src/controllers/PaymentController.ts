import { getSalesPayments, deletesSalesPayments, fetchSalesPaymentPdfUrl, downloadPayment, getPaymentMethods, getClientDocuments, getLastPaymentNumber, addSalesPayments, getSalesPayment, API_URL, updateSalesPayment } from '@/services/Payment'; 
import type { Payment, PaymentMethod, PaymentForm  } from '@/models/PaymentModel';
import type { Disbursement } from '@/models/DisbursementModel'; 
import type { Invoice, ItemTax } from '@/models/InvoicesModel'; 
import type { Client } from '@/models/ClientModel'; 
import { fetchTaxes  } from '@/services/Company';
import { getClientsList } from '@/services/Clients';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { popoverController } from '@ionic/vue';
import { fetchCurrentCompany } from '@/services/Dashboard';
import { fetchBanks } from '@/services/Banks'; 
import type { Bank } from '@/models/BankModel'
import { fetchLiveCurrencyRate } from '@/services/CurrencyRate'; 


type PaymentAction = "modify" | "delete" | "download" | "send" | "visualize";
type ModifyPaymentAction = "History";



export const PaymentsController = () => {
    const router = useRouter();
    const companyName = ref('');
    const selectedCompany = ref('');
    const payments = ref<Payment[]>([]);
    const currentPage = ref(1);
    const paymentsPerPage = 7;
    const isModalOpen = ref(false);
    const selectedPayment = ref<Payment | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const pdfUrl = ref<string | null>(null);
    const isPdfModalOpen = ref(false);
    
    // Added form-related refs
    const paymentMethods = ref<PaymentMethod[]>([]);
    const selectedPaymentMethod = ref('');
    const isLoadingPaymentMethods = ref(false);
    const clientQuery = ref(""); 
    const showClientList = ref(false);
    const clientList = ref<any>(null);
    const clients = ref<Client[]>([]); 
    const selectedClient = ref<Client | null>(null);
    const clientDocuments = ref<any[]>([]);
    const selectedInvoice = ref<any>(null);
    const clientInvoices = ref<Invoice[]>([]);
    const clientDisbursementNotes = ref<Disbursement[]>([]);
    const popoverOpen = ref(false);
    const popoverEvent = ref<Event | null>(null);
    const paymentForm = ref<PaymentForm>({
        date: new Date().toISOString().split('T')[0],
        payment_number: '',
        paid:0,
        client_id: '',
        payment_method: '',
        currency_rate:1,
        reference_number: '',
        notes: '',
        language: 'fr',
        use_stamp: 0,
        pay: [],
        bank_id: '-1',
        bank_fee: 0, 
        bankTaxId: '', 
        attachments: [], 
      });
      const currentInvoicePayment = ref(0);
      const currentYear = computed(() => new Date().getFullYear());
      const banks = ref<Bank[]>([]);
      const taxes = ref<ItemTax[]>([]);
      const fileInputRef = ref<HTMLInputElement | null>(null);


    //  modify payment stuff
    const route = useRoute(); 
    const currentPaymentId = ref('');
    const selectedFile = ref<File | null>(null);




    // Existing computed properties
    const filteredPayments = computed(() => {
        if (!searchQuery.value) return payments.value;
        const query = searchQuery.value.toLowerCase();
        
        const filtered = payments.value.filter(payment => {
            const nameMatch = payment.contact.display_name?.toLowerCase().includes(query) || false;
            const numberMatch = payment.payment_number?.toLowerCase().includes(query) || false;
            const invoiceMatch = payment.invoices && 
                                payment.invoices.length > 0 && 
                                payment.invoices[0].display_name ?.toLowerCase().includes(query) || false;
            
            return nameMatch || numberMatch || invoiceMatch;
        });
        return filtered;
    });

    const paginatedPayments = computed(() => {
        const start = (currentPage.value - 1) * paymentsPerPage;
        return filteredPayments.value.slice(start, start + paymentsPerPage);
    });
    
    watch(searchQuery, () => {
        currentPage.value = 1;
    });
    
    watch(selectedCompany, async (newCompanyId) => {
        if (newCompanyId) {
            await loadPayments();
        }
    });
    
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredPayments.value.length / paymentsPerPage)));
    const hasPayments = computed(() => payments.value.length > 0);
    
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        if (!day || !month || !year) return dateString; 
        
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    const openPaymentModal = (payment: Payment) => {
        selectedPayment.value = payment;
        isModalOpen.value = true;
    };
    
    const closeModal = () => {
        isModalOpen.value = false;
        selectedPayment.value = null;
    };

        // Existing action handler
    const handleAction = async (action: PaymentAction, event: Event | any, payment: Payment | null = null) => {
        if (!payment && event && !(event instanceof Event)) {
            payment = event;
        }
        if (action === "modify") {
          closeModal();
            router.push({
                path: `/payments/${payment?.hashed_id}/modify-payment`
            });
        }
        else if (action === "visualize") {
            if (!payment?.hashed_id) return;
            console.log("Fetching payment:", payment.hashed_id);
            try {
                pdfUrl.value = await fetchSalesPaymentPdfUrl(payment.hashed_id);
                isPdfModalOpen.value = true;
            } catch (error) {
                console.error("Failed to load PDF:", error);
                pdfUrl.value = null;
                isPdfModalOpen.value = false;
            }
        }
        else if (action === "download") {
            if (!payment?.hashed_id) {
                console.error("Download failed: No payment ID");
                return;
            }
            try {
                await downloadPayment(payment.hashed_id);
            } catch (error) {
                console.error('Download failed:', error);
            }
        }
        else if (action === "delete") {
            if (!payment?.hashed_id) return;
            try {
                await deletesSalesPayments(payment.hashed_id);
                payments.value = payments.value.filter(i => i.hashed_id !== payment.hashed_id);
                closeModal();
                await popoverController.dismiss();
            } catch (error) {
                console.error('delete failed:', error);
            }
        }
        try {
            await popoverController.dismiss();
        } catch (err) {
            console.error('Error dismissing popover:', err);
        }
    };
        
    const addPayment = () => router.push('/create-payment');
    const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
    const prevPage = () => currentPage.value > 1 && currentPage.value--;
        
    const loadPayments = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await getSalesPayments();
            console.log('Full API response:', response);
            if (response?.payments?.data && Array.isArray(response.payments.data)) {
                payments.value = response.payments.data.map((payment: any) => ({
                    hashed_id: payment.hashed_id,
                    payment_number: payment.payment_number,
                    document_name: payment.document_name,
                    date: payment.date,
                    total: payment.total,
                    total_formatted: payment.total_formatted,
                    display_name: payment.display_name,
                    invoices: payment.invoices || [],
                    type: payment.type,
                    contact: payment.contact || { display_name: payment.display_name || 'Unknown' }
                }));
                console.log('Mapped payments:', payments.value);
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            error.value = 'Failed to load payments';
            console.error('Error loading payments:', err);
        } finally {
            isLoading.value = false;
        }
    };

    // Added form-related methods
    const loadPaymentMethods = async () => {
        isLoadingPaymentMethods.value = true;
        try {
            const methods = await getPaymentMethods();
            console.log("Fetched payment methods:", methods);
            paymentMethods.value = methods;
            if (methods.length > 0) {
                const cashMethod = methods.find((method: any) => 
                    method.type === 1
                );
                if (cashMethod) {
                    selectedPaymentMethod.value = cashMethod.hashed_id;
                } else {
                    selectedPaymentMethod.value = methods[0].hashed_id;
                }
            }
        } catch (err) {
            console.error('Error loading payment methods:', err);
        } finally {
            isLoadingPaymentMethods.value = false;
        }
    };

    const showBankFields = computed(() => {
        if (!paymentForm.value.payment_method || !paymentMethods.value.length) return false;
        const selectedMethod = paymentMethods.value.find((method: PaymentMethod) => 
            method.hashed_id === paymentForm.value.payment_method
        );
        return selectedMethod?.type === 2;
    });

    const logSelected = (event: any) => {
        paymentForm.value.payment_method = event.detail.value;
        console.log("Selected Payment Method:", paymentForm.value.payment_method);
    };

    const loadClients = async () => {
        try {
            const clientsData = await getClientsList();
            clients.value = clientsData;
        } catch (err) {
            console.error('Error loading clients:', err);
            clients.value = [];
        }
    };

    const toggleClientList = () => {
        showClientList.value = !showClientList.value;
        if (showClientList.value && clients.value.length === 0) {
            loadClients();
        }
    };

    const loadBanks = async () => {
        try {
            const response = await fetchBanks();
            console.log("Fetched banks:", response);
            banks.value = response.banks?.data || [];
        } catch (err) {
            console.error('Error loading banks:', err);
            banks.value = [];
        }
    };

    const loadTaxes = async () => {
        try {
            const response = await fetchTaxes();
            console.log("Fetched taxes:", response.data);
            taxes.value = response.data.data.taxes?.data || [];
        } catch (err) {
            console.error('Error loading taxes:', err);
            taxes.value = [];
        }
    };

    const loadClientDocuments = async (clientId: string) => {
        if (!clientId) return;
        try {
            console.log("Fetching documents for client:", clientId);
            const documents = await getClientDocuments(clientId);
            console.log("Client documents:", documents);
            clientInvoices.value = documents.invoices || [];
            clientDisbursementNotes.value = documents.disbursements || [];
        } catch (err) {
            console.error('Error loading client documents:', err);
            clientInvoices.value = [];
            clientDisbursementNotes.value = [];
        }
    };

    const reloadCurrencyRate = async () => {
        try {
            const rate = await fetchLiveCurrencyRate('EUR', 'TND');
            paymentForm.value.currency_rate = parseFloat(rate.toFixed(3));
            console.log("Currency rate updated:", rate);
        } catch (error) {
            console.error("Failed to reload currency rate:", error);
        }
    };

    const selectClient = async (client: Client) => {
        clientQuery.value = client.display_name;
        selectedClient.value = client;
        paymentForm.value.client_id = client.hashed_id; 
        showClientList.value = false;
        if (client.currency?.symbol === '€') {
            paymentForm.value.currency_rate = 1;
        }
        if (!currentPaymentId.value) {
            await loadClientDocuments(client.hashed_id);
        }
    };
    
    const selectedClientCurrency = computed(() => {
        return selectedClient.value?.currency?.symbol || 'TND'; 
    });
    const totalPaidAmount = computed(() => {
        return paymentForm.value.pay.reduce((sum, item) => sum + item.amount, 0);
      });
    const totalUsedAmount = computed(() => {
        return paymentForm.value.pay.reduce((sum, item) => sum + item.amount, 0);
    });
      
    const leftToUseAmount = computed(() => {
        const mainPaidAmount = paymentForm.value.paid || 0;
        return mainPaidAmount - totalUsedAmount.value;
    });

    const addInvoicePayment = () => {
        if (!selectedInvoice.value || currentInvoicePayment.value <= 0) return;
        const maxPayable = selectedInvoice.value.unpaid || 0;
        if (maxPayable > 0 && currentInvoicePayment.value > maxPayable) {
            alert(`Payment cannot exceed ${maxPayable}`);
            return;
        }
        const isInvoice = selectedInvoice.value.invoice_number !== undefined;
        const isDisbursement = selectedInvoice.value.hashed_invoice_id !== undefined; 
        const itemId = selectedInvoice.value.hashed_id;
        const existingIndex = paymentForm.value.pay.findIndex(
          item => item.invoice_hashed_id === itemId || item.disbursement_hashed_id === itemId
        );
        if (existingIndex >= 0) {
          paymentForm.value.pay[existingIndex].amount = currentInvoicePayment.value;
        } else {
          paymentForm.value.pay.push({
            invoice_hashed_id: isInvoice ? itemId : '',
            disbursement_hashed_id: isDisbursement ? itemId : '',
            amount: currentInvoicePayment.value
          });
        }
        console.log("Payment added:", paymentForm.value.pay);
        popoverOpen.value = false;
        currentInvoicePayment.value = 0;
    };

      const openPopover = (event: Event, document: any) => {
        selectedInvoice.value = document;
        popoverEvent.value = event;
        popoverOpen.value = true;
    };

    const validateForm = () => {
        const errors = [];
        if (!paymentForm.value.client_id) errors.push("Client is required");
        if (!paymentForm.value.payment_method) errors.push("Payment method is required");
        if (!paymentForm.value.paid || paymentForm.value.paid <= 0) errors.push("Paid amount must be greater than 0");
        if (paymentForm.value.notes && paymentForm.value.notes.length < 5) errors.push("Notes must be at least 5 characters");
        if (paymentForm.value.pay.length === 0) errors.push("Please allocate payment to at least one invoice or disbursement");
        return errors;
    };

    const Add = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            console.error("Validation errors:", errors);
            alert("Please fix the following errors:\n" + errors.join("\n"));
            return;
        }
        try {
            console.log("Submitting payment:", paymentForm.value);
            const result = await addSalesPayments(paymentForm.value);
            console.log("Payment created successfully:", result);
            router.push('/payments');
        } catch (error) {
            console.error("Error creating payment:", error);
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.value?.click();
    };

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const newFiles = Array.from(input.files);
            selectedFile.value = newFiles[0]; 
            const existingAttachments = paymentForm.value.attachments || [];
            paymentForm.value.attachments = [...existingAttachments, ...newFiles];
        }
    };

    const getFileDisplayText = () => {
        const attachments = paymentForm.value.attachments;
        if (!attachments || attachments.length === 0) {
            return "Choose Files";
        } else if (attachments.length === 1) {
            const attachment = attachments[0];
            return attachment instanceof File ? attachment.name : attachment.file;
        } else {
            return `${attachments.length} files selected`;
        }
    };

    //modify payment stuff

    // Function to load payment data and populate form
    const loadPaymentData = async (paymentId: string) => {
        if (!paymentId) return;
        
        currentPaymentId.value = paymentId;
        
        try {
            console.log("Loading payment data for ID:", paymentId);
            const paymentData = await getSalesPayment(paymentId);
            console.log("Fetched payment data:", paymentData);
            paymentForm.value.pay = [];
            paymentForm.value = {
                date: paymentData.date ? paymentData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                payment_number: paymentData.naming_series_formatted_number?.toString().padStart(5, '0') || '',
                paid: parseFloat(paymentData.total) || 0, 
                client_id: paymentData.hashed_contact_id || '',
                payment_method: paymentData.hashed_company_payment_method_id || '',
                currency_rate: paymentData.currency_rate || 1,
                reference: paymentData.reference_number || '',
                notes: paymentData.notes || '',
                language: paymentData.language,
                use_stamp: paymentData.display ? (JSON.parse(paymentData.display).stamp ? 1 : 0) : 0,
                pay: [],
                bank_id: paymentData.hashed_bank_id || '-1',
                bank_fee: parseFloat(paymentData.bank_fee) || 0,
                bankTaxId: paymentData.hashed_bank_tax_id || '',
                attachments: paymentData.attachments || []
            };
            if (paymentData.contact) {
                selectedClient.value = paymentData.contact as Client;
                clientQuery.value = paymentData.contact.display_name;

            }
            if ((paymentData as any).invoices && (paymentData as any).invoices.length > 0) {
                (paymentData as any).invoices.forEach((invoice: any) => {
                    if (invoice.pivot && invoice.pivot.rate) {
                        const paymentAmount = parseFloat(invoice.pivot.rate);
                        
                        paymentForm.value.pay.push({
                            invoice_hashed_id: invoice.hashed_id,
                            disbursement_hashed_id: '',
                            amount: paymentAmount 
                        });
                    }
                });
            }
            if ((paymentData as any).invoices && (paymentData as any).invoices.length > 0) {
                clientInvoices.value = (paymentData as any).invoices.map((invoice: any) => ({
                    hashed_id: invoice.hashed_id,
                    invoice_number: invoice.invoice_number,
                    formattedTotal: invoice.formattedTotal || `${JSON.parse(invoice.totals || '{}').total || 0} TND`,
                    toPay: invoice.toPay || `${invoice.unpaid || 0} TND`
                }));
            }
    
            console.log("Final payment form:", paymentForm.value);            
        } catch (error) {
            console.error('Error loading payment data:', error);
        }
    };

    const isFile = (attachment: any): attachment is File => {
        return attachment instanceof File;
      };
    const getCleanFileName = (attachment: File | any) => {
        if (!isFile(attachment)) {
          const fullFileName = attachment.file?.split('/').pop() || "Attached file";
          const match = fullFileName.match(/(\d{4}-\d{5}\.pdf)$/);
          return match ? match[1] : fullFileName;
        }
        return attachment.name || "";
      };
      
      const getFileUrl = (attachment: File | any): string => {
        if (attachment instanceof File) {
          return URL.createObjectURL(attachment);
        }
        if (attachment.file && attachment.file.startsWith("storage")) {
          return `${API_URL}/${attachment.file}`;
        }
        return attachment.file || "";
      };
      
      const removeAttachment = (index: number) => {
        if (paymentForm.value.attachments && paymentForm.value.attachments.length > index) {
          paymentForm.value.attachments.splice(index, 1);
        }
      };

      const updatePayment = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            console.error("Validation errors:", errors);
            alert("Please fix the following errors:\n" + errors.join("\n"));
            return;
        }
        if (!currentPaymentId.value) {
            console.error("No payment ID found for update");
            alert("Error: Payment ID not found");
            return;
        }
        try {
            console.log("Updating payment with ID:", currentPaymentId.value);
            console.log("Payment data:", paymentForm.value);
            const result = await updateSalesPayment(currentPaymentId.value, paymentForm.value);
            console.log("Payment updated successfully:", result);
            alert("Payment updated successfully!");
            //router.push('/payments');
        } catch (error: any) {
            console.error("Error updating payment:", error);
            
            let errorMessage = "Failed to update payment";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            alert(`Error: ${errorMessage}`);
        }
    };  

    const handleModifyAction = async (action: ModifyPaymentAction) => {
        console.log("Modify action triggered:", action);
        
        switch (action) {
            case "History":
                console.log("Preview payment");
                break;
        }
    };
    
    onMounted(async () => {
        try {
            const { companyId } = await fetchCurrentCompany();
            selectedCompany.value = companyId;
            await Promise.all([
                loadPayments(),
                loadPaymentMethods(),
                loadClients(),
                loadBanks(),
                loadTaxes()
            ]);
            const paymentId = route.params.id?.toString();
            if (paymentId) {
                await loadPaymentData(paymentId);
            } else {
                const nextNumber = await getLastPaymentNumber();
                paymentForm.value.payment_number = nextNumber.toString().padStart(5, '0');
            }
        } catch (err) {
            console.error('Error fetching current company on mount', err);
        }
    });



    return {
        // Existing properties
        currentPage,
        totalPages,
        paginatedPayments,
        filteredPayments,
        isModalOpen,
        selectedPayment,
        hasPayments,
        searchQuery,
        payments,
        isLoading,
        error,
        companyName,
        isPdfModalOpen,
        pdfUrl,
        selectedClient,
        clientDocuments,
        currentYear,
        banks,
        loadClientDocuments,
        formatDate,
        nextPage,
        prevPage,
        openPaymentModal,
        closeModal,
        handleAction,
        addPayment,
        
        // Added form-related properties
        clientQuery,
        showClientList,
        clientList,
        popoverOpen,
        popoverEvent,
        selectedInvoice,
        clients,
        clientInvoices,
        clientDisbursementNotes,
        paymentMethods,
        isLoadingPaymentMethods,
        showBankFields,
        selectedClientCurrency,
        paymentForm,
        currentInvoicePayment,
        totalPaidAmount,
        totalUsedAmount,
        leftToUseAmount,
        taxes,
        fileInputRef,
        reloadCurrencyRate,
        triggerFileInput,
        handleFileChange,
        getFileDisplayText,
        addInvoicePayment,
        logSelected,
        openPopover,
        toggleClientList,
        selectClient,
        Add,

        // Added modify payment properties
        currentPaymentId,

        selectedPaymentMethod,
        selectedFile,
        getCleanFileName,
        getFileUrl,
        removeAttachment,
        loadPaymentData,
        handleModifyAction,
        updatePayment,


    };
};