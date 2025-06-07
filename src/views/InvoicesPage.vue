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
            <p class="company">Invoices : {{ companyName }}</p>
          </div>
          <ion-button class="addButton" @click="addInvoice">New</ion-button>
        </div>
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <span class="search-label">Search:</span>
            <ion-input 
              v-model="searchQuery"
              placeholder="Search..." 
              class="search-input"
            ></ion-input>
          </div>
        </ion-item>
        <ion-list>
          <ion-item 
            v-for="invoice in paginatedInvoices" 
            :key="invoice.hashed_id"
            button
            @click="openInvoiceModal(invoice)">
            <ion-accordion-group>
              <ion-accordion :value="expandedInvoice === invoice.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(invoice.hashed_id)">
                  <ion-label>
                    <div class="header-container">
                      <h2 class="clientName">{{ invoice.client?.display_name }}</h2>
                      <div class="status-container">
                        <span class="status" :class="getInvoiceBadgeDetails(invoice).badgeClass">
                          {{ getInvoiceBadgeDetails(invoice).badgeText }}
                        </span>
                      </div>
                    </div>
                    <p>Due date: {{ invoice.due }}</p>
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
            <ion-button fill="clear" @click="nextPage" :disabled="currentPage === totalPages">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </ion-button>
        </div>

        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="invoice-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedInvoice?.client.display_name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <p><strong>Invoice n°:</strong> {{ selectedInvoice?.invoice_number }}</p>
            <p><strong>Date:</strong> {{ selectedInvoice?.date }}</p>
            <p><strong>Due date:</strong> {{ selectedInvoice?.due }}</p>
            <p><strong>Amount:</strong> {{ selectedInvoice?.total }}</p>
            <ion-button class="actionButton" :id="`action-trigger-${selectedInvoice?.hashed_id}`">Action</ion-button>
            <ion-popover :trigger="`action-trigger-${selectedInvoice?.hashed_id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('visualize', $event, selectedInvoice)">Preview</ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedInvoice)">Edit</ion-item>
                  <ion-item button detail="false" @click="handleAction('download', $event, selectedInvoice)">Download</ion-item>
                  <ion-item button detail="false" @click="handleAction('delete', $event, selectedInvoice)">Delete</ion-item>
                  <ion-item button detail="false" @click="handleAction('send', $event, selectedInvoice)">Send</ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>

        <ion-modal :is-open="isPdfModalOpen" @did-dismiss="() => { isPdfModalOpen = false; pdfUrl = null; }" class="pdf-modal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Invoice PDF</ion-title>
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
  IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup, 
  IonButton, IonPopover, IonButtons, IonIcon, IonModal, IonInput
} from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline, closeOutline } from 'ionicons/icons';
import { InvoicesController } from '@/controllers/InvoicesController';

const {
  currentPage,
  totalPages,
  paginatedInvoices,
  toggleAccordion,
  expandedInvoice,
  searchQuery,
  nextPage,
  prevPage,
  isModalOpen,
  pdfUrl,
  isPdfModalOpen,
  companyName,
  openInvoiceModal,
  closeModal,
  selectedInvoice,
  handleAction,
  addInvoice,
  getInvoiceBadgeDetails
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
.badge-secondary {
  background-color: #f7f7f8;
  color: #7a7a7a;
  border: 1px solid #c4c4c4;
}
.badge-dark {
  background-color: #ffffff;
  color: #000;
  border: 1px solid #000;
}
.badge-warning {
  background-color: #fff4dc;
  color: #f5a623;
  border: 1px solid #f5a623;
}
.badge-success {
  background-color: #d0edda;
  color: #26a823;
  border: 1px solid #26a823;
}
.badge-danger {
  background-color: #ffefef;
  color: #e02020;
  border: 1px solid #de1616;
}
.badge-primary {
  background-color: #e9ecff;
  color: #4431e8;
  border: 1px solid #4431e8;
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
.invoice-preview-modal {
  --width: 370px;
  --height: auto;
  --max-height: 100vh;
  --background: white;
  --border-radius: 0;
  --box-shadow: none;
}
.invoice-preview-modal .invoice-content {
  padding: 20px;
  width: 100%;
  color: #333;
  font-family: Arial, sans-serif;
  background: white;
}

.invoice-header {
  display: flex;
  flex-direction: column; 
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.invoice-title h2 {
  font-size: 24px;
  color: #333;
}
.invoice-number {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

.invoice-date {
  text-align: left;
  font-size: 12px;
}
.invoice-parties {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.invoice-from, .invoice-to {
  flex: 0 0 48%;
}
.invoice-from h3, .invoice-to h3 {
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.company-name, .customer-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.invoice-items table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
.invoice-items th {
  text-align: left;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
.invoice-items td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.text-right {
  text-align: right;
}
.invoice-totals {
  margin-left: auto;
  width: 300px;
  margin-bottom: 30px;
}
.totals-grid {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
}
.invoice-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.invoice-notes {
  flex: 0 0 60%;
}
.invoice-signature {
  text-align: center;
}
.stamp {
  max-width: 150px;
  max-height: 100px;
  margin-bottom: 10px;
}
.signature-line {
  width: 200px;
  height: 1px;
  background: #333;
  margin: 10px auto;
}
.invoice-preview-modal-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>