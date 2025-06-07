<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <router-link to="/clients">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </router-link>
  
        <div class="deliveries-header">
          <div class="title-container">
            <ion-label class="title">Services</ion-label>
            <p class="company">Services : {{ selectedService?.contact?.organisation || 'Entreprise' }}</p>
          </div>
        </div>
  
  
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <ion-input
              v-model="searchQuery"
              placeholder="Rechercher..."
              class="search-input"
              @input="filteredServices"
            ></ion-input>
          </div>
        </ion-item>
  
        <ion-list>
          <ion-item 
            v-for="service in paginatedServices" 
            :key="service.hashed_id"
            button
            @click="openServiceModal(service)">
            <ion-accordion-group>
              <ion-accordion :value="expandedService === service.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(service.hashed_id)">
                  <ion-label class="service-note-card">
                    <div class="service-header">
                      <div class="service-meta">
                        <h3 class="service-number">
                          Service #{{ 
                            service?.hashed_id
                            
                          }}
                        </h3>
                      
                        <div class="service-date-amount">
                          <span class="service-date">{{ formatDate(service.date) }}</span>
                          <span class="service-amount">{{ service.total_formatted || formatCurrency(service.total) }}</span>
                        </div>
                      </div>
                      <div class="status-container">
                        <span :class="['status-badge', getServiceStatusClass(service.status)]">
                          {{ getServiceStatusText(service.status) }}
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
  
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal" class="service-model">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedService?.contact?.display_name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          
          <ion-content class="ion-padding">
            <p><strong>Service n°:</strong> {{ 
              selectedService?.hashed_id
            }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedService?.date) }}</p>
            <p><strong>Montant:</strong> {{ selectedService?.total_formatted }}</p>
            
            <ion-button class="actionButton" :id="`action-trigger-${selectedService?.hashed_id}`">
              Actions
            </ion-button>
            
            <ion-popover :trigger="`action-trigger-${selectedService?.hashed_id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('download', $event, selectedService)">
                    <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                    Télécharger
                  </ion-item>
                
                   <ion-item 
                    button 
                    detail="false"
                    @click="handleAction('delete', $event, selectedService)"
                    class="delete-action"
                  >
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Supprimer
                  </ion-item>
                 <ion-item 
    button 
    detail="false" 
    @click="handleAction('validate', $event, selectedService)"
    v-if="selectedService?.status === 0">
    <ion-icon :icon="checkmarkDoneOutline" slot="start"></ion-icon>
    Valider
  </ion-item>
                 <ion-item 
    button 
    detail="false" 
    @click="handleAction('duplicate', $event, selectedService)">
    <ion-icon :icon="copyOutline" slot="start"></ion-icon>
    Dupliquer
  </ion-item>
                </ion-list>
              </ion-content>
            </ion-popover>
          </ion-content>
        </ion-modal>
  
        <ion-modal 
          :is-open="serviceData !== null" 
          @didDismiss="serviceData = null" 
          css-class="service-preview-modal">
          <div class="delivery-content" v-if="serviceData">
            <div class="delivery-header">
              <div class="delivery-title">
                <h1>FICHE DE SERVICE</h1>
                <p class="delivery-number">#{{ 
                  serviceData?.service_number || 
                  serviceData?.serviceNumber || 
                  serviceData?.naming_series_composed_number ||
                  serviceData?.id ||
                  'N/A' 
                }}</p>
              </div>
              <div class="delivery-date">
                <p><strong>Date:</strong> {{ formatDate(serviceData.date) }}</p>
                <p><strong>Statut:</strong> {{ getServiceStatusText(serviceData.status) }}</p>
              </div>
            </div>
            
            <div class="delivery-parties">
              <div class="delivery-from">
                <h3>FOURNISSEUR</h3>
                <p class="company-name">{{ serviceData.contact?.organisation }}</p>
                <p>{{ serviceData.contact?.billing?.address }}</p>
                <p>{{ serviceData.contact?.billing?.zip_code }} {{ serviceData.contact?.billing?.bill_state }}</p>
              </div>
              <div class="delivery-to" v-if="serviceData.contact">
                <h3>CLIENT</h3>
                <p class="customer-name">{{ serviceData.contact.display_name }}</p>
                <p v-if="serviceData.contact.email">{{ serviceData.contact.email }}</p>
                <p v-if="serviceData.contact.phone">{{ serviceData.contact.phone }}</p>
              </div>
            </div>
  
            <div class="delivery-items">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Article</th>
                    <th>Description</th>
                    <th>Qté</th>
                    <th>Taux</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in serviceData.items" :key="item.hashed_id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.title }}</td>
                    <td>{{ item.description || '-' }}</td>
                    <td class="text-right">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatCurrency(item.rate) }}</td>
                    <td class="text-right">{{ formatCurrency(item.rate * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div class="delivery-totals">
              <div class="totals-grid">
                <span>Sous-total:</span>
                <span class="text-right">{{ formatCurrency(serviceData.totals?.subtotal) }}</span>
                
                <template v-if="serviceData.totals?.taxes">
                  <span>Taxes:</span>
                  <span class="text-right">{{ formatCurrency(serviceData.totals.taxes) }}</span>
                </template>
  
                <span class="total-label">Total:</span>
                <span class="total-amount text-right">{{ formatCurrency(serviceData.totals?.total) }}</span>
              </div>
              <div class="total-in-words" v-if="serviceData.totals?.total">
                Arrêté le présent service à la somme de: 
                <strong>{{ numberToWords(Math.round(parseFloat(serviceData.totals.total))) }}</strong>
              </div>
            </div>
  
            <div class="delivery-footer">
              <div class="delivery-signature" v-if="serviceData.display?.stamp">
                <div class="signature-line"></div>
                <p>Signature autorisée</p>
              </div>
            </div>
  
            <div class="delivery-preview-modal-modal-actions">
              <ion-button @click="serviceData = null">Fermer</ion-button>
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
    copyOutline,
    sendOutline
  } from 'ionicons/icons';
  import { onMounted, watch } from 'vue';
  import { useServiceController } from '@/controllers/ServiceController';
  import { 
    formatDate, 
    formatCurrency, 
    getServiceStatusClass,
    getServiceStatusText
  } from '@/models/Services';
  
  const {
    currentPage,
    totalPages,
    paginatedServices,
    toggleAccordion,
    expandedService,
    filteredServices,
    searchQuery,
    nextPage,
    prevPage,
    isModalOpen,
    serviceData,
    openServiceModal,
    closeModal,
    selectedService,
    handleAction
  } = useServiceController();
  
  // Fonction de debug pour identifier la structure des données
  const debugServices = () => {
    console.log('🔍 Services reçus:', paginatedServices.value);
    if (paginatedServices.value && paginatedServices.value.length > 0) {
      console.log('🔍 Structure du premier service:', paginatedServices.value[0]);
      console.log('🔍 Propriétés disponibles:', Object.keys(paginatedServices.value[0]));
      
      // Recherche spécifique des propriétés liées au numéro
      const firstService = paginatedServices.value[0];
      console.log('🔍 Propriétés numéro trouvées:');
      console.log('   - service_number:', firstService.service_number);
      console.log('   - serviceNumber:', firstService.serviceNumber);
      console.log('   - number:', firstService.number);
      console.log('   - naming_series_composed_number:', firstService.naming_series_composed_number);
      console.log('   - naming_series_formatted_number:', firstService.naming_series_formatted_number);
      console.log('   - id:', firstService.id);
    }
  };
  
  // Fonction numberToWords (si elle n'existe pas déjà)
  const numberToWords = (num: number): string => {
    // Implémentation basique pour les nombres en français
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return 'zéro';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      return tens[ten] + (unit > 0 ? '-' + units[unit] : '');
    }
    
    // Pour les nombres plus grands, retourner la valeur numérique
    return num.toString() + ' euros';
  };
  
  // Debug au montage et lors des changements
  onMounted(() => {
    console.log('🚀 Composant Services monté');
    debugServices();
  });
  
  watch(paginatedServices, (newServices) => {
    console.log('🔄 Services mis à jour:', newServices);
    debugServices();
  }, { deep: true });
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
  
  .service-note-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .service-meta {
    flex: 1;
  }
  
  .service-number {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  .service-date-amount {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .service-date::before {
    content: "📅 ";
  }
  
  .service-amount::before {
    content: "💰 ";
  }
  
  .service-amount {
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
  .service-model {
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .service-model ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .service-model ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .service-model ion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .service-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .service-modal-actions ion-button {
    --border-radius: 8px;
    --padding-start: 20px;
    --padding-end: 20px;
    font-size: 16px;
    font-weight: bold;
  }
  .service-model ion-buttons ion-button {
    --color: #000000;
  }
  .service-preview-modal {
    --width: 370px;
    --height: auto;
    --max-height: 100vh;
    --background: white;
    --border-radius: 0;
    --box-shadow: none;
  }
  .service-preview-modal .service-content {
    padding: 20px;
    width: 100%;
    margin-top: 50px;
    color: #333;
    font-family: Arial, sans-serif;
    background: white;
  }
  
  .delivery-content {
    padding: 20px;
    width: 100%;
    margin-top: 50px;
    color: #333;
    font-family: Arial, sans-serif;
    background: white;
  }
  
  .delivery-header,
  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  .delivery-title,
  .service-title h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
  .delivery-number,
  .service-number {
    font-size: 16px;
    color: #666;
    margin-top: 5px;
  }
  .delivery-date,
  .service-date {
    text-align: right;
  }
  .delivery-parties,
  .service-parties {
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
  .delivery-items table,
  .service-items table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  .delivery-items th,
  .service-items th {
    text-align: left;
    padding: 10px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  .delivery-items td,
  .service-items td {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  .text-right {
    text-align: right;
  }
  .delivery-totals,
  .service-totals {
    margin-left: auto;
    width: 300px;
    margin-bottom: 30px;
  }
  .totals-grid {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
  }
  .total-label {
    font-weight: bold;
  }
  .total-amount {
    font-weight: bold;
  }
  .total-in-words {
    margin-top: 15px;
    font-style: italic;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }
  .delivery-footer,
  .service-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  .delivery-notes,
  .service-notes {
    flex: 0 0 60%;
  }
  
  .service-signature {
    text-align: center;
  }
  .stamp {
    max-width: 150px;
    max-height: 100px;
    margin-bottom: 10px;
  }
  
  .signature-line {
    width: 200px;}
  
  .signature-line {
    width: 200px;
    height: 1px;
    background: #333;
    margin: 10px auto;
  }
  .service-preview-modal-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>
