<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <router-link to="/providers">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </router-link>
  
        <div class="orders-header">
          <div class="title-container">
            <ion-label class="title">Bons de Commande</ion-label>
            <p class="company">Bons de Commande : {{ selectedOrder?.contact?.organisation || 'Entreprise' }}</p>
          </div>
        </div>
  
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <ion-input
              v-model="searchQuery"
              placeholder="Rechercher..."
              class="search-input"
            ></ion-input>
          </div>
        </ion-item>
  
        <ion-list>
          <ion-item 
            v-for="order in paginatedOrders" 
            :key="order.hashed_id"
            button
            @click="openOrderModal(order)">
            <ion-accordion-group>
              <ion-accordion :value="expandedOrder === order.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(order.hashed_id)">
                  <ion-label class="order-note-card">
                    <div class="order-header">
                      <div class="order-meta">
                        <h3 class="order-number">Bon de Commande #{{ order.order_number }}</h3>
                        <div class="order-date-amount">
                          <span class="order-date">{{ formatDate(order.date) }}</span>
                          <span class="order-amount">{{ formatCurrency(order.total_formatted) }}</span>
                        </div>
                      </div>
                      <div class="status-container">
                        <span :class="['status-badge', getOrderStatusClass(order.status)]">
                          {{ getOrderStatusText(order.status) }}
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
  
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="order-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedOrder?.contact?.display_name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          
          <ion-content class="ion-padding">
            <p><strong>Bon de Commande n°:</strong> {{ selectedOrder?.order_number }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedOrder?.date) }}</p>
            <p><strong>Montant:</strong> {{ formatCurrency(selectedOrder?.total_formatted) }}</p>
            
            <ion-button class="actionButton" :id="`action-trigger-${selectedOrder?.hashed_id}`">
              Actions
            </ion-button>
            
            <ion-popover :trigger="`action-trigger-${selectedOrder?.hashed_id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('duplicate', $event, selectedOrder)">
                    <ion-icon :icon="copyOutline" slot="start"></ion-icon>
                    Dupliquer
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('download', $event, selectedOrder)">
                    <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                    Télécharger
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedOrder)">
                    <ion-icon :icon="createOutline" slot="start"></ion-icon>
                    Modifier
                  </ion-item>
                  <ion-item 
                    button 
                    detail="false"
                    @click="handleAction('delete', $event, selectedOrder)"
                    class="delete-action">
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Supprimer
                  </ion-item>
                  <ion-item 
                    button 
                    detail="false" 
                    @click="handleAction('validate', $event, selectedOrder)"
                    v-if="selectedOrder?.status === 0">
                    <ion-icon :icon="checkmarkDoneOutline" slot="start"></ion-icon>
                    Valider
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('convertToInvoice', $event, selectedOrder)">
                    <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                    Convertir en facture
                  </ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>
  
        <ion-modal 
          :is-open="orderData !== null" 
          @didDismiss="orderData = null" 
          css-class="order-preview-modal">
          <div class="order-content" v-if="orderData">
            <div class="order-header">
              <div class="order-title">
                <h1>BON DE COMMANDE</h1>
                <p class="order-number">#{{ orderData.order_number }}</p>
              </div>
              <div class="order-date">
                <p><strong>Date:</strong> {{ formatDate(orderData.date) }}</p>
                <p><strong>Statut:</strong> {{ getOrderStatusText(orderData.status) }}</p>
              </div>
            </div>
            <div class="order-parties">
              <div class="order-from">
                <h3>DE</h3>
                <p class="company-name">{{ orderData.contact?.organisation }}</p>
                <p v-if="orderData.contact?.billing?.address">
                  {{ orderData.contact.billing.address }}
                  {{ orderData.contact.billing.zip_code }}
                  {{ orderData.contact.billing.bill_state }}
                </p>
              </div>
              <div class="order-to" v-if="orderData.contact">
                <h3>À</h3>
                <p class="provider-name">{{ orderData.contact.display_name }}</p>
                <p v-if="orderData.contact.email">{{ orderData.contact.email }}</p>
                <p v-if="orderData.contact.phone">{{ orderData.contact.phone }}</p>
              </div>
            </div>
            <div class="order-items">
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
                  <tr v-for="(item, index) in orderData.items" :key="item.hashed_id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div>{{ item.title }}</div>
                      <div v-if="item.description">{{ item.description }}</div>
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
            <div class="order-totals">
              <div class="totals-grid">
                <span>Total HT:</span>
                <span class="text-right">{{ formatCurrency(orderData.totals?.subtotal) }}</span>
                <template v-if="orderData.totals?.taxes && Number(orderData.totals.taxes) > 0">
                  <span>Taxes:</span>
                  <span class="text-right">{{ formatCurrency(orderData.totals.taxes) }}</span>
                </template>
                <span class="total-label">Total TTC:</span>
                <span class="total-amount text-right">{{ formatCurrency(orderData.totals?.total) }}</span>
              </div>
              <div class="total-in-words" v-if="orderData.totals?.total">
                Arrêté le présent bon de commande à la somme de: 
                <strong>{{ numberToWords(Math.round(parseFloat(orderData.totals.total))) }}</strong>
              </div>
            </div>
            <div class="order-footer">
              <div class="order-signature" v-if="orderData.display?.stamp">
                <div class="signature-line"></div>
                <p>Signature autorisée</p>
              </div>
            </div>
            <div class="order-preview-modal-actions">
              <ion-button @click="orderData = null">Fermer</ion-button>
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
  import { 
    chevronBackOutline, 
    chevronForwardOutline, 
    closeOutline,
    downloadOutline,
    createOutline,
    trashOutline,
    checkmarkDoneOutline,
    documentTextOutline,
    copyOutline
  } from 'ionicons/icons';
  import { OrdersController } from '@/controllers/OrderController';
  import { 
    formatDate, 
    formatCurrency, 
    
    getOrderStatusClass,
    getOrderStatusText,
    
  } from '@/models/Order';
  
  const {
    currentPage,
    totalPages,
    paginatedOrders,
    toggleAccordion,
    expandedOrder,
    filteredOrders,
    searchQuery,
    nextPage,
    prevPage,
    isModalOpen,
    orderData,
    openOrderModal,
    closeModal,
    selectedOrder,
    handleAction,
    getOrderStatusClass,
    getOrderStatusText,
    formatCurrency,
  } = OrdersController();
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
  .receipts-note-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .receipts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }
  
  .order-note-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .order-meta {
    flex: 1;
  }
  
  .order-number {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  .order-date-amount {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .order-date::before {
    content: "📅 ";
  }
  
  .order-amount::before {
    content: "💰 ";
  }
  
  .order-amount {
    font-weight: 600;
    color: #27ae60;
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
  .order-model {
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .order-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .order-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .order-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .order-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .order-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .order-model ion-buttons ion-button {
    --color: #000000;
  }
  .order-preview-modal {
    --width: 370px;
    --height: auto;
    --max-height: 100vh;
    --background: white;
    --border-radius: 0;
    --box-shadow: none;
  }
  .order-preview-modal .order-content {
    padding: 20px;
    width: 100%;
    margin-top: 50px;
    color: #333;
    font-family: Arial, sans-serif;
    background: white;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  .order-title h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
  .order-number {
    font-size: 16px;
    color: #666;
    margin-top: 5px;
  }
  .order-date {
    text-align: right;
  }
  .order-parties {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  .order-from, .delivery-to {
    flex: 0 0 48%;
  }
  .order-from h3, .delivery-to h3 {
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
  .company-name, .customer-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .order-items table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  .order-items th {
    text-align: left;
    padding: 10px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  .order-items td {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  .text-right {
    text-align: right;
  }
  .order-totals {
    margin-left: auto;
    width: 300px;
    margin-bottom: 30px;
  }
  .totals-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
  }
  .order-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  .order-notes {
    flex: 0 0 60%;
  }
  .order-signature {
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
  .order-preview-modal-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>
