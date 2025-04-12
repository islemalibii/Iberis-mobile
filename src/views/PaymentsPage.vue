<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Iberis</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <div class="payments-header">
          <div class="title-container">
            <ion-label class="title">Payments</ion-label>
            <p class="company"> Payments : company name</p>
          </div>
          <ion-button class="addButton" @click="addPayment">New</ion-button>
        </div>
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <span class="search-label">Search:</span>
            <ion-input v-model="searchQuery" placeholder="Search..." class="search-input"></ion-input>
          </div>
        </ion-item>
        <ion-list>
          <ion-item 
            v-for="payment in paginatedPayments" 
            :key="payment.id"
            button
            @click="openPaymentModal(payment)">
            <ion-label>
              <h2 class="sales">{{ payment.sales }}</h2>
              <p>Client: {{ payment.client }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        <div class="pagination-controls">
          <ion-button fill="clear" @click="prevPage" :disabled="currentPage === 1">
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </ion-button>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <ion-button fill="clear" @click="nextPage" :disabled="currentPage === totalPages.value">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </ion-button>
        </div>
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="payment-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedPayment?.sales }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <p><strong>Client:</strong> {{ selectedPayment?.client }}</p>
            <p><strong>Payment N°:</strong> {{ selectedPayment?.paymentNumber }}</p>
            <p><strong>Paid amount:</strong> {{ selectedPayment?.amount }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedPayment?.date) }}</p>

            <ion-button class="actionButton" :id="`action-trigger-${selectedPayment?.id}`">Action</ion-button>
            <ion-popover ref="actionPopover" :trigger="`action-trigger-${selectedPayment?.id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('visualize', selectedPayment)">Preview</ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedPayment)">Edit</ion-item>
                  <ion-item button detail="false" @click="handleAction('download', selectedPayment)">Download</ion-item>
                  <ion-item button detail="false" @click="handleAction('delete', selectedPayment)">Delete</ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>
      </ion-content>
    </ion-page>
</template>
<script>
import { chevronBackOutline, chevronForwardOutline, closeOutline } from 'ionicons/icons';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAccordion, 
  IonAccordionGroup, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButton,
  IonPopover
} from '@ionic/vue';
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 
export default defineComponent({
  name: 'FacturesPage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAccordion,
    IonAccordionGroup,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonPopover,
  },
  setup() {
    const actionPopover = ref(null);
    const currentPage = ref(1);
    const paymentsPerPage = 7;
    const router = useRouter();
    const isModalOpen = ref(false);
    const selectedPayment = ref(null);
    const payments = ref([
      {
        id: 1,
        sales: 'INV-2024-00001',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 2,
        sales: 'INV-2024-00002',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 3,
        sales: 'INV-2024-00003',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 4,
        sales: 'INV-2024-00004',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 5,
        sales: 'INV-2024-00005',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 6,
        sales: 'INV-2024-00006',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 7,
        sales: 'INV-2024-00007',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 8,
        sales: 'INV-2024-00008',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 9,
        sales: 'INV-2024-00009',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      },
      {
        id: 10,
        sales: 'INV-2024-00010',
        client: 'John Doeh',
        date: '2025-03-01',
        amount: '$75.00',
        paymentNumber: 'PAY-S-2025-00001'
      }
    ]);
    function openPaymentModal(payment) {
      selectedPayment.value = payment; 
      isModalOpen.value = true;
    }
    function closeModal() {
      isModalOpen.value = false;
      selectedPayment.value = null;
    }
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    const totalPages = computed(() => Math.max(1, Math.ceil(payments.value.length / paymentsPerPage)));
    const paginatedPayments = computed(() => {
      const start = (currentPage.value - 1) * paymentsPerPage;
      return payments.value.slice(start, start + paymentsPerPage);
    });
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
    const handleAction = async (action, $event, payment) => {
      console.log(`Action selected: ${action}`, payment);
      const target = event.target;
      const popover = target.closest('ion-popover');
      if (popover) {
        await popover.dismiss();
      }
      if (action === "modify") {
        isModalOpen.value = false;
        router.push({
          path: "/modify-payment",
          query: { id: payment.id}
        });
      }
    };
    const addPayment = () => {
      console.log('Add payment button clicked');
      router.push('/create-payment');
    };
    return {
      actionPopover,
      currentPage,
      totalPages,
      paginatedPayments,
      nextPage,
      prevPage,
      chevronBackOutline, 
      chevronForwardOutline,
      closeOutline,
      isModalOpen,
      openPaymentModal,
      closeModal,
      selectedPayment,
      payments,
      formatDate,
      handleAction,
      addPayment,
    };
  }
});
</script>
<style scoped>
:root {
  --ion-background-color: #ffffff !important;
}
p{
  color: #000;
}
ion-page {
  --background: #ffffff !important;
  background: #ffffff !important;
}
ion-content {
  --background: #ffffff !important;
  background: #ffffff !important;
  min-height: 90vh;
}
ion-list {
  background: #f5f0f0;
  padding: 5px;
  border-radius: 15px; 
  box-shadow:10px 10px 10px 10px rgba(0, 0, 0, 0.2); 
  margin: 20px;
  border: none !important;
  display: flex;
  flex-direction: column;
  gap:12px;  
}
ion-item::after, 
ion-item::before {
  display: none !important;
}
ion-item {
  --background: transparent !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  --border-width: 0 !important;
  --inner-border-width: 0 !important;
}
ion-accordion ion-item[slot="content"]::part(native) {
  --padding-start: 0; 
  --padding-end: 0;
  border-bottom: 2px solid black !important;
  padding-bottom: 10px;
  width: 100% !important;
  display: block;
}
ion-item::part(native) {
  background: transparent !important;
  --background: transparent !important;
  border: none !important;
  --border-color: transparent !important;
}
ion-accordion {
  --background: transparent !important;
  background: transparent !important;
}
ion-accordion::part(native) {
  border: none !important;
}
ion-accordion-group {
  overflow: visible;
  flex-direction: column;
  border: none !important;
  background: transparent !important;
}
.addButton {
  margin-top: 10px;
  --background: #dfc925;  
}
.date-text {
  white-space: nowrap !important;
  display: inline-block;
}
.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}
.title {
  margin-top:5px;
  font-size: 28px;
  font-weight: bold;
  color: #413b3b;
}
.sales{
  color: #413b3b;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  padding-bottom: 8px;
  white-space: nowrap; 
  flex-grow: 0;
  min-width: 120px;
}
ion-label p {
  color: #746868 !important; 
  font-weight: 500px;
}

.title-container {
  display: flex;
  flex-direction: column;
}
.company {
  color: #746868 !important; 
  font-size: 12px;
  margin-top: 5px; 
}
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  width: 10%;
}
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #000;
}
.pagination-controls ion-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  visibility: visible;
  opacity: 1;
  color: #000;
}
.actionButton {
  --background: #dfc925 !important; 
  --color: #000000 !important;
  --border-radius: 8px;
  width: auto;
  font-weight: bold;
  min-width: 100px; 
  max-width: 200px; 
  text-align: center;
  display: block; 
  margin: 50px auto;
}
.actions{
  background: #ffffff !important;
  padding: 0 !important;
  border-radius: 30px;
  box-shadow: none !important;
  width: fit-content;
  height: 450px;
}
ion-popover {
  --background: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
  --border-radius: 30px; 
  --width: fit-content;
  --max-height: 240px; 
  --overflow: hidden;
}
ion-popover ion-item {
  --background: #ffffff;
  --color: #000000;
  font-size: 16px; 
  --min-height: 40px; 
}
  ion-item {
  --border-color: transparent; 
  }
  .search-bar{
    --background: transparent; 
    --padding-start: 20px; 
    --padding-end: 20px;
    --inner-padding-end: 0; 
    --inner-padding-start: 0;
    margin-top: 20px;
    margin-bottom: 40px;
  }
  .search-container {
    display: flex;
    align-items: center; 
    justify-content: flex-start; 
    gap: 10px; 
    width: 100%; 
    flex-wrap: nowrap; 
  }
  .search-label {
    flex-shrink: 0; 
    font-weight: bold;
    margin: 0; 
    color: #000;
  }
  .search-input{
    margin: 0; 
    min-width: 0; 
    border: 1px solid #b7b5b5; 
    padding: 5px;
    border-radius: 5px;
  }
  .payment-model {
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .payment-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .payment-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .payment-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .payment-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .payment-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .payment-model ion-buttons ion-button {
    --color: #000000;
  }
</style>