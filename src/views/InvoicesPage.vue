<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Iberis</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <div class="factures-header">
          <div class="title-container">
            <ion-label class="title">Invoices</ion-label>
            <p class="company">Invoices : company name</p>
          </div>
          <ion-button class="addButton" @click="addInvoice">New</ion-button>
        </div>
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <span class="search-label">Search:</span>
            <ion-input v-model="searchQuery" placeholder="Search..." class="search-input"></ion-input>
          </div>
        </ion-item>
        <ion-list>
          <ion-item 
            v-for="facture in paginatedInvoices" 
            :key="facture.id"
            button
            @click="openInvoiceModal(facture)">
            <ion-accordion-group>
              <ion-accordion :value="expandedFacture === facture.id ? 'open' : ''">
                <ion-item slot="header" @click="Details(facture.id)">
                  <ion-label>
                    <div class="header-container">
                      <h2 class="clientName">{{ facture.clientName }}</h2>
                      <div class="status-container">
                        <p :class="getStatusClass(facture.status)">{{ facture.status }}</p>
                      </div>
                    </div>
                    <p>Due date: {{ formatDate(facture.dueDate) }}</p>
                  </ion-label>
                </ion-item>
              </ion-accordion>
            </ion-accordion-group>
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
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="invoice-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedInvoice?.clientName }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <p><strong>Invoice n°:</strong> {{ selectedInvoice?.invoiceNumber }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedInvoice?.date) }}</p>
            <p><strong>Due date:</strong> {{ formatDate(selectedInvoice?.dueDate) }}</p>
            <p><strong>Amount:</strong> {{ selectedInvoice?.amount }}</p>
            <ion-button class="actionButton" :id="`action-trigger-${selectedInvoice?.id}`">Action</ion-button>
            <ion-popover ref="actionPopover" :trigger="`action-trigger-${selectedInvoice?.id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('visualize', selectedInvoice)">Preview</ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedInvoice)">Edit</ion-item>
                  <ion-item button detail="false" @click="handleAction('download', selectedInvoice)">Download</ion-item>
                  <ion-item button detail="false" @click="handleAction('delete', selectedInvoice)">Delete</ion-item>
                  <ion-item button detail="false" @click="handleAction('send', selectedInvoice.id)">Send</ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup, 
  IonButton, IonPopover 
} from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline, closeOutline } from 'ionicons/icons';
import { InvoicesController } from '@/controllers/InvoicesController';

const {
  currentPage,
  totalPages,
  paginatedInvoices,
  nextPage,
  prevPage,
  isModalOpen,
  openInvoiceModal,
  closeModal,
  selectedInvoice,
  handleAction,
  addInvoice,
  formatDate,
  getStatusClass
} = InvoicesController();
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
  --padding-start: 0; /* Remove Ionic's default padding on the start */
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
.factures-header {
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
.clientName{
  color: #413b3b;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap; 
  flex-grow: 0;
  min-width: 120px;
}
ion-label p {
  color: #746868 !important; 
  font-weight: 500;
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
.status-container {
  flex-shrink: 0;
  margin-left: 50px;
}
.status {
  display: inline-flex;
  align-items: center; 
  justify-content: center;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 15px;
  text-align: center;
  min-width: 100px;
  height: 24px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.status-draft {
  background-color: #f7f7f8;
  color: #7a7a7a;
  border: 1px solid #c4c4c4;
}
.status-sent {
  background-color: #ffffff;
  color: #000;
  border: 1px solid #000;
}
.status-overdue {
  background-color: #fff4dc;
  color: #f5a623;
  border: 1px solid #f5a623;
}
.status-paid {
  background-color: #d0edda;
  color: #26a823;
  border: 1px solid #26a823;
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
.actions{
  background: #ffffff !important;
  padding: 0 !important;
  border-radius: 30px;
  box-shadow: none !important;
  width: fit-content;
  height: 450px;
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
ion-popover {
  --background: #ffffff;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
  --border-radius: 30px; 
  --width: fit-content;
  --max-height: 280px; 
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
  .invoice-model {
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .invoice-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .invoice-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .invoice-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .invoice-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .invoice-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .invoice-model ion-buttons ion-button {
    --color: #000000;
  }
</style>