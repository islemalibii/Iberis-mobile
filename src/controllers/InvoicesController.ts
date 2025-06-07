import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchInvoices, downloadInvoice, deleteInvoice, fetchInvoicePdfUrl  } from '@/services/Invoices';
import { Invoice } from '@/models/InvoicesModel';
import { popoverController  } from '@ionic/vue';
import { fetchCurrentCompany } from '@/services/Dashboard';
import moment from 'moment';
import  apiService  from '@/services/Dashboard'; 


type InvoiceAction = "modify" | "delete" | "download" | "send" | "visualize";

export const InvoicesController = () => {
    const router = useRouter();
    const invoices = ref<Invoice[]>([]);
    const companyName = ref('');
    const selectedCompany = ref('');
    const currentPage = ref(1);
    const invoicesPerPage = 7;
    const isModalOpen = ref(false);
    const selectedInvoice = ref<Invoice | Invoice | null>(null);
    const isLoading = ref(false);
    const error = ref<string|null>(null);
    const searchQuery = ref('');
    const expandedInvoice = ref<string | null>(null);
    const pdfUrl = ref<string | null>(null);
    const isPdfModalOpen = ref(false);
    
    const filteredInvoices = computed(() => {
        if (!searchQuery.value) return invoices.value;
        return invoices.value.filter(invoice => 
            invoice.client.display_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            invoice.invoice_number.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    });
    const toggleAccordion = (id: string) => {
        expandedInvoice.value = expandedInvoice.value === id ? null : id;
    };
    const paginatedInvoices = computed(() => {
        const start = (currentPage.value - 1) * invoicesPerPage;
        return filteredInvoices.value.slice(start, start + invoicesPerPage);
    });
    const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / invoicesPerPage));

    watch(searchQuery, () => {
        currentPage.value = 1;
    });

    const hasInvoices = computed(() => invoices.value.length > 0);

    const openInvoiceModal = (invoice: Invoice) => {
        selectedInvoice.value = invoice;
        isModalOpen.value = true;
    };
    const closeModal = () => {
        isModalOpen.value = false;
        selectedInvoice.value = null;
    };

    const handleAction = async (action: InvoiceAction, event: Event, invoice: Invoice | null) => {
        if (action === "modify") {
            closeModal();
            router.push({
                path: `/invoices/${invoice?.hashed_id}/modify-invoice`
            });
        }
        if (action === "download") {
            if (!invoice?.hashed_id) {
                console.error("Download failed: No invoice ID");
                return;
            }
            try {
                await downloadInvoice(invoice.hashed_id);
            } catch (error) {
                console.error('Download failed:', error);
            }
        }
        if (action === "visualize") {
            if (!invoice?.hashed_id) return;
            console.log("Fetching invoice:", invoice.hashed_id);
            try {
                pdfUrl.value = await fetchInvoicePdfUrl(invoice.hashed_id);
                isPdfModalOpen.value = true;
            } catch (error) {
                console.error("Failed to load PDF:", error);
                pdfUrl.value = null;
                isPdfModalOpen.value = false;
            }
        }
        if (action === "delete") {
            if (!invoice?.hashed_id) return;
            try {
                await deleteInvoice(invoice.hashed_id);
                invoices.value = invoices.value.filter(i => i.hashed_id !== invoice.hashed_id);
                closeModal();
                await popoverController.dismiss();
            } catch (error) {
                console.error('delete failed:', error);
            }
        }
        
        if (action === "send") {
            closeModal();
            router.push({
                path: `/invoices/${invoice?.hashed_id}/send-invoice`
            });
        }
    };
    const addInvoice = () => router.push('/create-invoice');
    const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
    const prevPage = () => currentPage.value > 1 && currentPage.value--;
    
    const getInvoiceBadgeDetails = (invoice: Invoice): { badgeText: string; badgeClass: string } => {
        const today = moment().startOf('day');
        const due = moment(invoice.due, 'YYYY-MM-DD').startOf('day');
        
        const status = Number(invoice.status);
        const countedPayments = Number(invoice.countedPayments || 0);
        const unpaid = Number(invoice.unpaid || 0);
        const summedCredits = Number(invoice.summedCredits || 0);
        const total = Number(invoice.total || 0);
    
        if (status === 0) {
            return { badgeText: 'Draft', badgeClass: 'badge-secondary' };
        } 
        if (status > 0 && countedPayments > 0 && unpaid === summedCredits) {
            return { badgeText: 'Paid', badgeClass: 'badge-success' };
        } 
        if (status > 0 && total === summedCredits) {
            return { badgeText: 'Cancelled', badgeClass: 'badge-danger' };
        } 
        if (status === 1 && due.isSameOrAfter(today)) {
            return { badgeText: 'Valid', badgeClass: 'badge-primary' };
        } 
        if (status === 3) {
            return { badgeText: 'Sent', badgeClass: 'badge-dark' };
        } 
        if (due.isBefore(today)) {
            return { badgeText: 'Overdue', badgeClass: 'badge-warning' };
        }
        return { badgeText: 'Unknown', badgeClass: 'badge-secondary' };
    };

    const loadInvoices = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await fetchInvoices();
            console.log('Full API response:', response);
            if (response?.invoices?.data) {
                invoices.value = response.invoices.data.map((inv: any) => ({
                    hashed_id: inv.hashed_id,
                    invoice_number: inv.invoice_number,
                    date: inv.date,       
                    due: inv.due,         
                    status: Number(inv.status || 0),
                    total: Number(inv.total || 0),
                    unpaid: Number(inv.unpaid || 0),
                    summedCredits: Number(inv.summedCredits || 0),  
                    countedPayments: Number(inv.countedPayments || 0),  
                    client: {
                        display_name: inv.display_name 
                    }
                }));
                console.log('Mapped invoices:', invoices.value);
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            error.value = 'Failed to load invoices';
            console.error('Error loading invoices:', err);
        } finally {
            isLoading.value = false;
        }
    };

    watch(selectedCompany, async (newCompanyId) => {
        if (newCompanyId) {
          await loadInvoices(); 
        }
    });
      
    onMounted(async () => {
        try {
            const { companyId } = await fetchCurrentCompany();
            selectedCompany.value = companyId;
            await loadInvoices(); 
            const companyData = await apiService.getCompanyData(companyId);
            companyName.value = companyData.data.company.title;
        } catch (err) {
          console.error('Error fetching current company on mount', err);
        }
    });
      

    return {
        currentPage,
        totalPages,
        paginatedInvoices,
        isModalOpen,
        selectedInvoice,
        hasInvoices,
        filteredInvoices,
        searchQuery,
        expandedInvoice,
        pdfUrl,
        isPdfModalOpen,
        companyName,
        toggleAccordion,
        nextPage,
        prevPage,
        openInvoiceModal,
        closeModal,
        handleAction,
        addInvoice,
        getInvoiceBadgeDetails,
        
    };
};

