<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Iberis</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="payments-header">
        <div class="header-row">
          <ion-label class="title">Edit payment</ion-label>
          <ion-button class="action" @click="handleModifyAction('History')">History</ion-button>
        </div>
        <p class="company">{{ companyName }}</p>
      </div>     
      <div class="content-wrapper">
        <ion-accordion-group class="all">         
          <ion-accordion>
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="createOutline"></ion-icon>
              <ion-label>Payment Details</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Client</ion-label>
                <div class="newpayment-paidamount">
                  <ion-input 
                    v-model="clientQuery"
                    placeholder="Client" 
                    class="newpayment-paid-input"
                    readonly
                    @click="toggleClientList">
                  </ion-input>
                </div>
              </ion-item>
              <ion-list v-if="showClientList" class="dropdown-list" ref="clientList">
                <ion-item v-if="clients.length === 0">
                  <ion-label>No clients found</ion-label>
                </ion-item>
                <ion-item 
                  v-else
                  v-for="client in clients" 
                  :key="client.hashed_id || client.hashed_id"
                  button
                  class="no-arrow"
                  @click="selectClient(client)">
                  <ion-label>
                    <h3>{{ client.display_name }}</h3>
                  </ion-label>
                </ion-item>
              </ion-list>            
              <ion-item>
                <ion-label class="newpayment-label">Paid Amount</ion-label>
                <div class="newpayment-paidamount">
                  <ion-input 
                    v-model.number="paymentForm.paid"
                    class="newpayment-paid-input" 
                    type="number" 
                    placeholder="Enter amount">
                  </ion-input>
                  <div class="currency-symbol">{{ selectedClientCurrency }}</div>
                </div>
              </ion-item>
              <ion-item>
                <ion-label>Payment method</ion-label>
                <ion-select v-model="paymentForm.payment_method" class="newpayment-select" @ionChange="logSelected">
                  <ion-select-option
                    v-for="method in paymentMethods" 
                    :key="method.hashed_id" 
                    :value="method.hashed_id">
                    {{ method.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <template v-if="showBankFields">
                <ion-item>
                  <ion-label class="newpayment-label">Bank fees</ion-label>
                  <div class="newpayment-paidamount">
                    <ion-input v-model.number="paymentForm.bank_fee" class="newpayment-paid-input" type="number" placeholder="Enter bank fees"></ion-input>
                  </div>
                </ion-item>
                <ion-item>
                  <ion-label class="newpayment-label">Bank fees tax</ion-label>
                  <ion-select 
                    v-model="paymentForm.bankTaxId"
                    class="newpayment-select" 
                    placeholder="Select tax rate"
                    :key="`tax-${paymentForm.bankTaxId}`">
                    <ion-select-option 
                      v-for="tax in taxes" 
                      :key="tax.hashed_id" 
                      :value="tax.hashed_id">
                      {{ tax.title }} ({{ tax.rate }}%)
                    </ion-select-option>
                  </ion-select>
                </ion-item>
                <ion-item>
                  <ion-label class="newpayment-label">Banks</ion-label>
                  <ion-select 
                    v-model="paymentForm.bank_id"
                    class="newpayment-select" 
                    placeholder="Select a bank">
                    <ion-select-option 
                      v-for="bank in banks" 
                      :key="bank.hashed_id" 
                      :value="bank.hashed_id">
                      {{ bank.bank }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </template>
              <ion-item>
                <ion-label>Payment n°</ion-label>
                <div class="newpayment-paidamount">
                  <div class="currency-symbol">PAY-S</div>
                  <div class="currency-symbol">{{ currentYear }}</div>
                  <ion-input 
                    v-model="paymentForm.payment_number"
                    class="newpayment-paid-input">
                  </ion-input>
                </div>
              </ion-item> 
              <ion-item>
                <ion-label>Date</ion-label>
                <ion-input class="newpayment-date-input" type="date" v-model="paymentForm.date"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label>Reference N°</ion-label>
                <div class="newpayment-paidamount">
                  <ion-input placeholder="Enter reference number" v-model="paymentForm.reference" class="newpayment-paid-input"></ion-input>
                </div>
              </ion-item>
              <ion-accordion-group>
                <ion-accordion>
                  <ion-item slot="header" class="invoices-item">
                      <ion-label class="invoices-label">Invoices ({{ clientInvoices.length }})</ion-label>
                  </ion-item>
                  <div slot="content">
                    <ion-item v-if="!selectedClient">
                      <ion-label>Please select a client first</ion-label>
                    </ion-item>
                    <ion-item v-else-if="clientInvoices.length === 0">
                      <ion-label>No unpaid invoices found</ion-label>
                    </ion-item>
                    <ion-item 
                        v-else
                        v-for="invoice in clientInvoices" 
                        :key="invoice.hashed_id" 
                        button
                        class="invoice"
                        @click="openPopover($event, invoice)">
                        <ion-label class="invoice">
                          <h3>Invoice: {{ invoice.invoice_number }}</h3>
                          <p>Total: {{ invoice?.formattedTotal }}</p>
                          <p>To Pay: {{ invoice.toPay }}</p>
                        </ion-label>
                      </ion-item>
                  </div>
                </ion-accordion>
              </ion-accordion-group>
              <ion-accordion-group>
                <ion-accordion>
                  <ion-item slot="header" class="invoices-item">
                      <ion-label class="invoices-label">Disbursement notes ({{ clientDisbursementNotes.length }})</ion-label>
                  </ion-item>
                  <div slot="content">
                    <ion-item v-if="!selectedClient">
                      <ion-label>Please select a client first</ion-label>
                    </ion-item>
                    
                    <ion-item v-else-if="clientDisbursementNotes.length === 0">
                      <ion-label>No unpaid disbursement notes found</ion-label>
                    </ion-item>
                    
                    <ion-item 
                        v-else
                        v-for="disbursement in clientDisbursementNotes" 
                        :key="disbursement.hashed_id" 
                        button
                        class="invoice"
                        @click="openPopover($event, disbursement)">
                        <ion-label class="invoice">
                          <h3>Disbursement note: {{ disbursement.hashed_id }}</h3>
                          <p>Total: {{ disbursement.formattedTotal }} | To Pay: {{ disbursement.toPay }}</p>
                        </ion-label>
                      </ion-item>
                  </div>
                </ion-accordion>
              </ion-accordion-group>

              <ion-item>
                <ion-label>Notes</ion-label>
                <div class="newpayment-paidamount">
                  <ion-textarea class="newpayment-paid-input" placeholder="Enter any remarks" v-model="paymentForm.notes"></ion-textarea>
                </div>
              </ion-item>
              <ion-item v-if="paymentForm.notes && paymentForm.notes.length > 0 && paymentForm.notes.length < 5" class="error-item">
                <ion-label style="color: #f04141; font-size: 12px;">Notes must be at least 5 characters long</ion-label>
              </ion-item>
              <ion-item>
                <div class="add-files">
                  <ion-label class="attachments-label">Attachments</ion-label>
                  <div class="file-selection-container">
                    <ion-button class="add-file" @click="triggerFileInput">
                      Choose Files
                    </ion-button>
                    <span class="file-status">
                      {{ selectedFile?.name || "No file chosen" }}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref="fileInputRef"
                    multiple
                    style="display: none"
                    @change="handleFileChange"/>
                  <div class="attachments-list">
                    <div
                      v-for="(attachment, index) in paymentForm.attachments"
                      :key="index"
                      class="attachment-item">
                      <ion-icon :icon="trashOutline" class="trash-icon" @click="removeAttachment(index)"></ion-icon>
                      <a :href="getFileUrl(attachment)" class="attachment-link">
                        {{ getCleanFileName(attachment) }}
                      </a>
                    </div>
                  </div>
                </div>
              </ion-item>
              <ion-item class="item">
                <ion-label class="label">Paid</ion-label>
                <ion-text class="text">{{ paymentForm.paid?.toFixed(3) || '0.000' }}</ion-text>
              </ion-item>
              <ion-item class="item">
                <ion-label class="label">Used</ion-label>
                <ion-text class="text">{{ totalUsedAmount.toFixed(3) }}</ion-text>
              </ion-item>
              <ion-item class="item">
                <ion-label class="label">Left to</ion-label>
                <ion-text class="text">{{ leftToUseAmount.toFixed(3) }} {{ selectedClientCurrency }}</ion-text>
              </ion-item>
            </div>
          </ion-accordion>
          <!-- contenu Section -->
          <ion-accordion value="PDF language">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <ion-label>PDF language</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                  <ion-label>PDF language</ion-label>
                    <ion-select class="newpayment-select" v-model="paymentForm.language">
                      <ion-select-option value="fr">French</ion-select-option>
                      <ion-select-option value="ar">Arabic</ion-select-option>
                      <ion-select-option value="en">English</ion-select-option>
                    </ion-select>
                </ion-item>
            </div>
          </ion-accordion>
          <!-- stamp Section -->
          <ion-accordion value="stamp">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Stamp & Signature</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item lines="none" class="toggle-row">
                <div class="a-toggle">
                  <ion-label class="toggle-label">Stamp & Signature</ion-label>
                  <ion-toggle :model-value="paymentForm.use_stamp === 1"
                  @update:modelValue="paymentForm.use_stamp = $event ? 1 : 0"></ion-toggle>
                </div>
              </ion-item>
            </div>
          </ion-accordion>
          <!--Only when currency is EUR, when currency is TND its removed-->
          <ion-accordion value="devise" v-if="selectedClientCurrency === '€'">
            <ion-item class="aTitle" slot="header">
              <ion-icon :icon="chatbubbleOutline"></ion-icon>
              <ion-label>Devise</ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ion-item>
                <ion-label>Currency rate (EUR to TND)</ion-label>
                <div class="input-button-container">
                  <div class="newpayment-paidamount">
                    <ion-input 
                      v-model.number="paymentForm.currency_rate"
                      placeholder="1"
                      class="newpayment-paid-input">
                    </ion-input>
                  </div>
                  <ion-button class="reload-btn" @click="reloadCurrencyRate">
                    <ion-icon :icon="refreshOutline"></ion-icon>
                  </ion-button>
                </div>
              </ion-item>
            </div>
          </ion-accordion>
        </ion-accordion-group>
        <div class="add-payment-container">
          <ion-button class="add-payment" @click="updatePayment">Save</ion-button>
        </div>
      </div>

      <ion-modal :is-open="popoverOpen" :event="popoverEvent" @didDismiss="popoverOpen = false" class="invoice-model">
        <ion-header>
          <ion-toolbar>
            <ion-title>
              {{ selectedInvoice?.invoice_number ? `Invoice ${selectedInvoice.invoice_number}` : 
                `Disbursement ${selectedInvoice?.hashed_id}` }}
            </ion-title>
            <ion-buttons slot="end">
              <ion-button @click="popoverOpen = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label>Total</ion-label>
            <div class="invoice-div">
              <ion-text class="invoice-champ">{{ selectedInvoice?.formattedTotal }}</ion-text>
            </div>            
          </ion-item>
          <ion-item>
            <ion-label>To pay</ion-label>
            <div class="invoice-div">
              <ion-text class="invoice-champ">{{ selectedInvoice?.toPay }}</ion-text>
            </div>
          </ion-item>
          <ion-item>
            <ion-label>Pay</ion-label>
            <div class="invoice-div">
              <ion-input 
                v-model.number="currentInvoicePayment"
                class="invoice-champ"
                type="number"
                :max="selectedInvoice?.toPay"
                placeholder="Enter payment amount">
              </ion-input>
            </div>            
          </ion-item>
          <div class="invoice-modal-actions">
            <ion-button color="danger" @click="popoverOpen = false">Close</ion-button>
            <ion-button color="primary" @click="addInvoicePayment">Update</ion-button>
          </div>
        </ion-content>
      </ion-modal>
  </ion-content>
</ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonPopover, 
  IonButtons, IonIcon, IonModal, IonInput, IonSelect,
  IonSelectOption, IonAccordion, IonAccordionGroup,
  IonTextarea, IonText, IonToggle
} from '@ionic/vue';
import { 
  closeOutline, 
  refreshOutline, 
  createOutline,
  calendarOutline,
  chatbubbleOutline,
  trashOutline
} from 'ionicons/icons';
import { PaymentsController } from '@/controllers/PaymentController';

const {
  companyName,
  banks,
  clientQuery,
  showClientList,
  clientList,
  toggleClientList,
  selectClient,
  showBankFields,
  paymentMethods,
  logSelected,
  taxes,
  clients,
  clientInvoices,
  clientDisbursementNotes,
  popoverOpen,
  popoverEvent,
  selectedInvoice,
  openPopover,
  currentYear,
  selectedClient,
  selectedClientCurrency,
  paymentForm,
  currentInvoicePayment,
  totalUsedAmount,
  leftToUseAmount,
  fileInputRef,
  reloadCurrencyRate,
  triggerFileInput,
  handleFileChange,
  selectedFile,
  getCleanFileName,
  getFileUrl,
  removeAttachment,
  addInvoicePayment,
  handleModifyAction,
  updatePayment,
} = PaymentsController();
</script>
<style scoped>
:root {
  --ion-background-color: #F8FAFC !important;
}
ion-page {
  --background: #ffffff !important;
  background: #ffffff !important;
}
ion-content {
  --background: #ffffff !important;
  background: #ffffff !important;
  --ion-background-color: #ffffff !important;
  min-height: 100vh;
  --padding-start: 10px;
  --padding-end: 10px;
}
.content-wrapper {
  overflow-y: auto;
  padding-bottom: 80px;
}
ion-item {
  width: 100%;
  --inner-padding-end: 0;
  --padding-start: 0;
  --background: #ffffff !important;
  --color : #000 !important;
}
ion-item::part(native) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
ion-label {
  display: block !important;
  width: 100% !important;
  margin-bottom: 5px;
  font-weight: bold;
  margin-left: 15px;
}
ion-toggle {
  color: #000;
  background: #e0e0e0 !important;
  width: 50px !important;
  height: 30px !important;
  border-radius: 35%;
  --background-unchecked: #345fbb !important; 
  --background-checked: #345fbb !important; 
  --handle-background: #fff !important;
  --handle-background-checked: #fff !important; 
  --handle-border: 2px solid #d1d1d6 !important; 
  --handle-border-radius: 50% !important; 
  --track-border-radius: 15px !important;
  --track-border: 1px solid #d1d1d6 !important;
  --track-border-checked: 1px solid transparent !important;
}
.toggle-row::part(native) {
  display: flex;
  justify-content: space-between;
  --padding-start: 0;
  --inner-padding-end: 0;
}
.toggle-label{
  font-weight: normal;
}
.a-toggle {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%; 
}
ion-input,
ion-select,
ion-textarea,
ion-text,
ion-toggle,
ion-button,
ion-radio,
p {
  display: block;
  width: 90%;
  margin-left: 15px;
  --color : #000 !important;
}
.payments-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 15px;
  margin-top: 30px;
}
.header-row {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  width: 100%; 
}

.title {
  margin-top: 30px;
  color: #000; 
  font-size: 30px;
  font-weight: bold;
}
.company {
  color: #746868 !important; 
  font-size: 14px;
  margin-top: 5px; 
  margin-left: 15px; 
}
.all{
  margin-top: 90px;
  background: transparent !important; 
  --background: transparent !important;
}
.all ion-accordion {
  margin-bottom: 20px; 
}
.all ion-accordion-group::part(container) {
  border-radius: 15px;
  box-shadow: none !important;
  overflow: hidden;
}
.aTitle::part(native) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important; 
  border-radius: 10px;
  margin-bottom: 5px;
  --background: #e7e3d5;
  --color: #000000;
  border-bottom: 2px solid #000000 !important;
}
.aTitle::part(native):hover {
  --background: #edc84e; 
}
.aTitle::part(native)[aria-expanded="true"] {
  --background: #edc84e !important;
}
p{
  color: #000;
  font-weight: bold;
  margin-bottom: 25px;
}
.add-files{
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}
.attachments-label{
  margin-top: 17px;
}
.add-file {
  --background: #27A2DB !important;
  --color: #ffffff !important;
  width: 100px;
}
.file-selection-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 7px;
}
.file-status {
  color: #666;
  font-size: 0.9em;
  border: 1px solid #666;
  border-radius: 5px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 20px;
  padding-right: 20px;
}
.attachments-list {
  margin-top: 16px;
  padding: 0;
}
.attachment-item {
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}
.attachment-item:hover {
  background: var(--ion-color-light-shade);
  transform: translateY(-1px);
}
.attachment-link {
  flex: 1;
  text-decoration: none;
  color: var(--ion-color-primary);
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.4;
}
.attachment-link:hover {
  color: var(--ion-color-primary-shade);
  text-decoration: underline;
}

.accordion-content {
  border-radius: 13px;
  box-shadow: 15px 15px 15px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #000000; 
  padding-top: 8px;
  padding-bottom: 8px;
}
.add-payment {
  --background: #edc84e !important;
  --color: #000 !important;
  font-weight: bold;
  font-size: 20px;
  width: 150px !important;
  --border-width: 2px !important;
  --border-style: solid !important;
  --border-color: #000000 !important;
  --border-radius: 15px !important;
}
.add-payment-container {
  display: flex;
  justify-content: center;
  margin-top: 80px; 
  padding-bottom: 20px;
}
ion-item {
  --border-color: transparent; 
}
.newpayment-paidamount {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 330px;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
  margin-left: 15px;
}
.newpayment-paid-input {
  flex: 1;
  font-size: 16px;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
}
.currency-symbol {
  padding: 10px 15px;
  font-size: 16px;
  color: #666;
  background: #f5f5f5;
  border-left: 1px solid #ccc;
  border-radius: 0 8px 8px 0;
}
.newpayment-date-input{
  border: 1px solid #ccc; 
  border-radius: 8px; 
  padding-left: 15px;
  background: white;
  width: 330px;
  margin-left: 15px;
}
.newpayment-select{
  border: 1px solid #ccc; 
  border-radius: 8px; 
  padding-left: 10px;
  background: white;
  width: 330px;
  margin-left: 15px;
}
.item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.label{
  flex: 1;
  text-align: left;
}
.text {
  text-align: right;
}
.dropdown-list {
  position: absolute;
  background-color: white;
  width: calc(100% - 40px);
  margin-left: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  z-index: 999;
  box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.1);
  padding-left: 10px;
  padding-top: 10px;
}
.no-arrow::part(native) {
  --inner-border-width: 0;
  --detail-icon-display: none;
}
.invoices-item::part(native) {
  display: flex !important;
  flex-direction: row !important; 
  align-items: center !important;
  justify-content: space-between !important; 
  padding-bottom: 15px;
}
.invoice::part(native) {
  display: flex !important;
  flex-direction: row !important; 
  align-items: center !important;
  justify-content: space-between !important;
  color: #333;
  flex-grow: 1; 
  text-align: left; 
}
.invoices-label{
  font-size: 20px;
  margin-top: 15px;
}

.invoice-model {
  --width: 90%;
  --max-width: 400px;
  --height: 380px;
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
.invoice-div {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 290px;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
  margin-left: 15px;
}
.invoice-champ {
  flex: 1;
  font-size: 16px;
  color: #333;
  border: none;
  outline: none;
  background: transparent;
  margin-top: 10px; 
  padding-bottom: 10px;
}
.input-button-container {
  display: flex !important;
  align-items: center !important;
  width: 95%; 
  justify-content: flex-end !important;
}
.reload-btn{
  --background: #27A2DB !important;
  --color: #ffffff !important; 
  width: 50px !important; 
  height: 40px !important;
  font-size: 20px;
  border-radius: 10px !important;
  --padding-start: 5px !important; 
  --padding-end: 5px !important; 
}
.action {
    --background: #27A2DB !important;
    --color: #ffffff !important; 
    font-size: 16px; 
    width: 100px; 
    height: 40px; 
    --border-radius: 8px !important; 
    margin-top: 20px;
  }
  .action:hover {
    --background: #2a6acc !important; 
  }
  .actions-top{
    --background: transparent !important;
    background: transparent !important;
  }
  ion-popover {
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
    --border-radius: 10px; 
    --width: 130px;
    --padding-top: 8px; 
    --padding-bottom: 8px;
    --height: 150px;
  }
  ion-popover ion-item {
    --background: #ffffff;
    --color: #000000;
    font-size: 18px; 
    --min-height: 48px; 
    padding-top: 5px;
  }
</style>