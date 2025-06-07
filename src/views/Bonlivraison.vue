<template>
    <ion-page>
   
       
          
      <ion-content :fullscreen="true">
        <router-link to="/clients">
              <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
            </router-link
            >
        <div class="deliveries-header">
          <div class="title-container">
            <ion-label class="title">Delivery Notes</ion-label>
            <p class="company">Delivery Notes : {{ selectedDeliveryNote?.company?.title || 'Company' }}</p>
          </div>
        </div>
        <ion-item class="search-bar" lines="none">
          <div class="search-container">          <ion-input 
              v-model="searchQuery"
              placeholder="Search..." 
              class="search-input"
              @input="filteredDeliveryNotes"
            ></ion-input>
   
          </div>
        </ion-item>
        <ion-list>
          <ion-item 
            v-for="delivery in paginatedDeliveryNotes" 
            :key="delivery.hashed_id"
            button
            @click="openDeliveryNoteModal(delivery)">
            <ion-accordion-group>
              <ion-accordion :value="expandedDeliveryNote === delivery.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(delivery.hashed_id)">
                  <ion-label class="delivery-note-card">
    <div class="delivery-header">
      <div class="delivery-meta">
        <h3 class="delivery-number">Delivery Note #{{ delivery.delivery_number }}</h3>
        <div class="delivery-date-amount">
          <span class="delivery-date">{{ formatDate(delivery.date) }}</span>
          <span class="delivery-amount">{{ delivery.total_formatted || formatCurrency(delivery.total) }}</span>
        </div>
      </div>
      <div class="status-container">
        <span :class="['status-badge', getDeliveryStatusClass(delivery.status)]">
          {{ getDeliveryStatusText(delivery.status) }}
        </span>
      </div>
    </div>
   
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
  
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="delivery-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedDeliveryNote?.client?.display_name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            
            <p><strong>Delivery Note n°:</strong> {{ selectedDeliveryNote?.delivery_number }}</p>
            <p><strong>Date:</strong> {{ selectedDeliveryNote?.date }}</p>
            <p><strong>Amount:</strong> {{ selectedDeliveryNote?.total_formatted }}</p>
            <ion-button class="actionButton" :id="`action-trigger-${selectedDeliveryNote?.hashed_id}`">
              Actions
            </ion-button>
            
            <ion-popover :trigger="`action-trigger-${selectedDeliveryNote?.hashed_id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('duplicate', $event, selectedDeliveryNote)">
                    <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                    Duaplicate
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('download', $event, selectedDeliveryNote)">
                    <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                    Télécharger
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedDeliveryNote)">
                    <ion-icon :icon="createOutline" slot="start"></ion-icon>
                      Edit</ion-item>
     <ion-item 
                    button 
                    detail="false"
                    @click="handleAction('delete', $event, selectedDeliveryNote)"
                    class="delete-action"
                  >
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Supprimer
                  </ion-item>
                  <ion-item 
                    button 
                    detail="false" 
                    @click="handleAction('validate', $event, selectedDeliveryNote)"
                    v-if="selectedDeliveryNote?.status === 0"
                  >
                    <ion-icon :icon="checkmarkDoneOutline" slot="start"></ion-icon>
                    Valider
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('send', $event, selectedDeliveryNote)">
                    <ion-icon :icon="sendOutline" slot="start"></ion-icon>
                    Envoyer
                  </ion-item>
               
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>
        <ion-modal :is-open="deliveryData !== null && deliveryData.delivery_number" @didDismiss="deliveryData = null" css-class="delivery-preview-modal">
          <div class="delivery-content" v-if="deliveryData">
            <div class="delivery-header">
              <div class="delivery-title">
                <h1>DELIVERY NOTE</h1>
                <p class="delivery-number">#{{ deliveryData.delivery_number }}</p>
              </div>
              <div class="delivery-date">
                <p><strong>Date:</strong> {{ formatDate(deliveryData.date) }}</p>
                <p><strong>Status:</strong> {{ getDeliveryStatusText(deliveryData.status) }}</p>
              </div>
            </div>
            <div class="delivery-parties" v-if="deliveryData.display?.billing">
              <div class="delivery-from">
                <h3>FROM</h3>
                <p class="company-name">{{ deliveryData.company.title }}</p>
                <p v-if="deliveryData.company.address">{{ deliveryData.company.address }}</p>
                <p v-if="deliveryData.company.phone">Tel: {{ deliveryData.company.phone }}</p>
              </div>
              <div class="delivery-to" v-if="deliveryData.client">
                <h3>TO</h3>
                <p class="customer-name">{{ deliveryData.client.display_name }}</p>
                <p v-if="deliveryData.client.email">{{ deliveryData.client.email }}</p>
                <p v-if="deliveryData.client.billing?.address">
                  {{ deliveryData?.client.billing.address }}
                </p>
                <p v-else-if="deliveryData.client.country_title">
                  {{ deliveryData?.client.country_title }}
                </p>
              </div>
            </div>
            <div class="delivery-items">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Article</th>
          <th>Qté</th>
          <th>P.U HT</th>
          <th>Montant HT</th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in deliveryData.items" :key="item.hashed_id">
          <td>{{ index + 1 }}</td>
          <td>
              <div v-if="item.reference">{{ item.reference }}</div>
              <div>{{ item.description || item.item }}</div>
          </td>
          <td class="text-right">{{ item.quantity }}</td>
          <td class="text-right">{{ formatCurrency(item.rate) }}</td>
          <td class="text-right">
              {{ formatCurrency(item.rate * item.quantity) }}
          </td>
      </tr>
  </tbody>
    </table>
  </div>
          <div class="delivery-totals">
    <div class="totals-grid">
      <span>Total HT:</span>
      <span class="text-right">{{ formatCurrency(deliveryData.totals?.subtotal) }}</span>
      
      <template v-if="deliveryData.totals?.taxes && Number(deliveryData.totals.taxes) > 0">
        <span>Taxes:</span>
        <span class="text-right">{{ formatCurrency(deliveryData.totals.taxes) }}</span>
      </template>
      
      <span class="total-label">Total TTC:</span>
      <span class="total-amount text-right">{{ formatCurrency(deliveryData.totals?.total) }}</span>
    </div>
    <div class="total-in-words">
      Arrêté le présent bon de livraison à la somme de: 
      <strong>{{ numberToWords(Math.round(parseFloat(deliveryData.totals?.total || '0'))) }}</strong>
    </div>
  </div>
          <div class="delivery-footer">
            
            <div class="delivery-signature" v-if="deliveryData.display?.stamp && deliveryData.company?.use_stamp">
              <img
                :src="deliveryData.company?.stamp || '/assets/stamp-placeholder.png'"
                alt="Company Stamp"
                class="stamp"/>
              <div class="signature-line"></div>
              <p>Authorized Signature</p>
            </div>
          </div>
          <div class="delivery-preview-modal-modal-actions">
            <ion-button @click="deliveryData = null">Close</ion-button>
          </div>
        </div>
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
  import { DeliveryNotesController } from '@/controllers/DeliveryController';
  import { searchOutline } from 'ionicons/icons';
  import { 
    formatDate, 
    formatCurrency, 
    numberToWords,  
    getDeliveryStatusClass,
    getDeliveryStatusText,Item
  } from '@/models/DeliveryNotesModel';
  const {
  currentPage,
  totalPages,
  paginatedDeliveryNotes,
  toggleAccordion,
  expandedDeliveryNote,
  filteredDeliveryNotes,
  searchQuery,
  nextPage,
  prevPage,
  isModalOpen,
  deliveryData,
  openDeliveryNoteModal,
  closeModal,
  selectedDeliveryNote,
  handleAction,
  getDeliveryStatusText,
  formatDate,
  getDeliveryStatusClass,
  formatCurrency,
  
  } = DeliveryNotesController();
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
  /* Delivery Note Card Styles */
  .delivery-note-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .delivery-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .delivery-meta {
    flex: 1;
  }
  
  .delivery-number {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  .delivery-date-amount {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .delivery-date::before {
    content: "📅 ";
  }
  
  .delivery-amount::before {
    content: "💰 ";
  }
  
  .delivery-amount {
    font-weight: 600;
    color: #27ae60; /* Green for amount */
  }
  
  .status-container {
    flex-shrink: 0;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  /* Status colors */
  .status-badge.status-draft {
    background-color: #f5f5f5;
    color: #7f8c8d;
    border: 1px solid #e0e0e0;
  }
  
  .status-badge.status-valid {
    background-color: #e1f0fa;
    color: #2980b9;
    border: 1px solid #b3d7ff;
  }
  
  .status-badge.status-sent {
    background-color: #e1f7ed;
    color: #27ae60;
    border: 1px solid #b3e6b3;
  }
  
  .status-badge.status-cancelled {
    background-color: #fde8e8;
    color: #e74c3c;
    border: 1px solid #f5c6cb;
  }
  
  .delivery-client {
    border-top: 1px dashed #eee;
    padding-top: 8px;
    margin-top: 4px;
  }
  
  .client-name {
    font-size: 14px;
    font-weight: 500;
    color: #34495e;
    margin: 0;
  }
  
  .client-contact {
    font-size: 13px;
    color: #95a5a6;
    margin: 2px 0 0 0;
  }
  .search-bar {
    margin-bottom: 20px;
    --background: #ffffff;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    color: #282721;
    --border-radius: 12px;
    --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  .deliveries-header {
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
    width: 100%;
  }
  .status-container {
    flex-shrink: 0;
    margin-left: 50px;
  }
  .status {
    font-size: 15px;
    font-weight: 600;
    border-radius: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }.status-draft {
    background-color: #f0f0f0;
    color: #636e72;
    border: 1px solid #e0e0e0;
  }
  
  .status-valid {
    background-color: #e0f0ff;
    color: #007bff;
    border: 1px solid #b3d7ff;
  }
  
  .status-sent {
    background-color: #e0ffe0;
    color: #28a745;
    border: 1px solid #b3e6b3;
  }
  
  .status-cancelled {
    background-color: #ffebee;
    color: #dc3545;
    border: 1px solid #f5c6cb;
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
  .delivery-model {
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .delivery-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .delivery-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .delivery-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .delivery-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .delivery-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .delivery-model ion-buttons ion-button {
    --color: #000000;
  }
  .delivery-preview-modal {
    --width: 370px;
    --height: auto;
    --max-height: 100vh;
    --background: white;
    --border-radius: 0;
    --box-shadow: none;
  }
  .delivery-preview-modal .delivery-content {
    padding: 20px;
    width: 100%;
    margin-top: 50px;
    color: #333;
    font-family: Arial, sans-serif;
    background: white;
  }
  
  .delivery-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  .delivery-title h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
  .delivery-number {
    font-size: 16px;
    color: #666;
    margin-top: 5px;
  }
  .delivery-date {
    text-align: right;
  }
  .delivery-parties {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .delivery-from, .delivery-to {
    flex: 0 0 48%;
  }
  .delivery-from h3, .delivery-to h3 {
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  .company-name, .customer-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .delivery-items table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  .delivery-items th {
    text-align: left;
    padding: 10px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  .delivery-items td {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  .text-right {
    text-align: right;
  }
  .delivery-totals {
    margin-left: auto;
    width: 300px;
    margin-bottom: 30px;
  }
  .totals-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
  }
  .delivery-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  .delivery-notes {
    flex: 0 0 60%;
  }
  .delivery-signature {
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
  .delivery-preview-modal-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>