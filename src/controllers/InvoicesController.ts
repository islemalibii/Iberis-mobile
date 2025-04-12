import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { invoice } from '@/models/InvoicesModel';
import { formatDate, getStatusClass } from '@/models/InvoicesModel';

export const InvoicesController = () => {
    const router = useRouter();
    
    // Mock data (replace with API later)
    const invoice = ref<invoice[]>([
        {
            id: 1,
            clientName: 'John Doe',
            status: 'Pending',
            date: '2025-03-01',
            dueDate: '2025-03-15',
            amount: '$500.00',
            invoiceNumber: 'INV-001'
        }
    ]);
       const currentPage = ref(1);
       const invoicesPerPage = 7;
       const paginatedInvoices = computed(() => {
           const start = (currentPage.value - 1) * invoicesPerPage;
           return invoice.value.slice(start, start + invoicesPerPage);
       });
       const totalPages = computed(() => Math.ceil(invoice.value.length / invoicesPerPage));
   
       const isModalOpen = ref(false);
       const selectedInvoice = ref<invoice | null>(null);
   
       const openInvoiceModal = (invoice: invoice) => {
           selectedInvoice.value = invoice;
           isModalOpen.value = true;
       };

       const closeModal = () => {
        isModalOpen.value = false;
        selectedInvoice.value = null;
    };

    const handleAction = (action: string, event: Event, invoice: invoice) => {
        console.log(`Action: ${action}`, invoice);
        if (action === "modify") {
            closeModal();
            router.push({
                path: "/modify-invoice",
                query: { id: invoice.id, status: invoice.status }
            });
        }
    };
    const addInvoice = () => router.push('/create-invoice');
    const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;
    const prevPage = () => currentPage.value > 1 && currentPage.value--;

    return {
        currentPage,
        totalPages,
        paginatedInvoices,
        isModalOpen,
        selectedInvoice,
        nextPage,
        prevPage,
        openInvoiceModal,
        closeModal,
        handleAction,
        addInvoice,
        formatDate,
        getStatusClass
    };
};