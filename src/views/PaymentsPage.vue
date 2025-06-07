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
          <p class="company">Payments : {{ companyName }}</p>
        </div>
        <ion-button class="addButton" @click="addPayment">New</ion-button>
      </div>
      <ion-item class="search-bar" lines="none">
        <div class="search-container">
          <span class="search-label">Search:</span>
          <ion-input v-model="searchQuery" placeholder="Search..." class="search-input"></ion-input>
          <ion-button v-if="searchQuery" size="small" fill="clear" @click="searchQuery = ''" class="clear-button">
            <ion-icon :icon="closeCircleOutline"></ion-icon>
          </ion-button>
        </div>
        <div v-if="searchQuery && filteredPayments.length === 0" class="no-data">
          <p>No payments found matching "{{ searchQuery }}"</p>
      </div>
      </ion-item>
      <ion-list>
        <ion-item 
          v-for="payment in paginatedPayments" 
          :key="payment.hashed_id"
          button
          @click="openPaymentModal(payment)">
          <ion-label>
            <h2 class="sales">{{ payment?.payment_number }}</h2>
            <p>Client: {{ payment.contact.display_name }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <div class="pagination-controls" v-if="hasPayments">
        <ion-button fill="clear" @click="prevPage" :disabled="currentPage === 1">
            <ion-icon :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <ion-button fill="clear" @click="nextPage" :disabled="currentPage === totalPages">
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
      </div>
      <div v-else class="no-data">
        <p>No payments found</p>
      </div>
      
      <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="payment-model">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ selectedPayment?.payment_number }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <p><strong>Client:</strong> {{ selectedPayment?.contact.display_name }}</p>
          <p><strong>Invoice N°:</strong> {{ selectedPayment?.invoices?.[0]?.invoice_number || 'N/A' }}</p>
          <p><strong>Paid amount:</strong> {{ selectedPayment?.total }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedPayment?.date) }}</p>

          <ion-button class="actionButton" :id="`action-trigger-${selectedPayment?.hashed_id}`">Action</ion-button>
          <ion-popover ref="actionPopover" :trigger="`action-trigger-${selectedPayment?.hashed_id}`" trigger-action="click">
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

      <ion-modal :is-open="isPdfModalOpen" @did-dismiss="() => { isPdfModalOpen = false; pdfUrl = null; }" class="pdf-modal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Payment PDF</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="() => { isPdfModalOpen = false; pdfUrl = null; }">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <iframe
              v-if="pdfUrl"
              :src="pdfUrl"
              style="width: 100%; height: 100%; border: none"
            ></iframe>
          </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonPopover, 
  IonButtons, IonIcon, IonModal, IonInput
} from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline, closeOutline, closeCircleOutline } from 'ionicons/icons';
import { PaymentsController } from '@/controllers/PaymentController';

const {
  currentPage,
  totalPages,
  paginatedPayments,
  isModalOpen,
  selectedPayment,
  hasPayments,
  searchQuery,
  companyName,
  isPdfModalOpen,
  pdfUrl,
  filteredPayments,
  formatDate,
  nextPage,
  prevPage,
  openPaymentModal,
  closeModal,
  handleAction,
  addPayment
} = PaymentsController();
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
    margin-right: 10px;
    margin: 0; 
    color: #000;
  }
  .search-input{
    border: 1px solid #b7b5b5; 
    padding: 5px;
    border-radius: 5px;
    font-size: 14px;
  }
  ion-input.search-input {
    --color: #000000;
    background-color: #ffffff;
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