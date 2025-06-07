<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <router-link to="/clients">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </router-link>
        
        <div class="deliveries-header">
          <div class="title-container">
            <ion-label class="title">Exit Voucher</ion-label>
            <p class="company">Exit voucher : {{ selectedExitVoucher?.company?.title || 'Company' }}</p>
          </div>
        </div>
        
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <ion-input 
              v-model="searchQuery"
              placeholder="Rechercher..." 
              class="search-input"
              @input="resetPagination"
            ></ion-input>
          </div>
        </ion-item>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="ion-text-center ion-padding">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p>Chargement des bons de sortie...</p>
        </div>
  
        <!-- Error State -->
        <ion-alert
          v-if="error"
          :is-open="true"
          header="Erreur"
          :message="error"
          :buttons="['OK']"
          @didDismiss="error = null"
        ></ion-alert>
  
        <!-- Empty State -->
        <div v-if="!isLoading && filteredVouchers.length === 0" class="ion-text-center ion-padding">
          <ion-icon :icon="documentTextOutline" size="large" color="medium"></ion-icon>
          <h3>Aucun bon de sortie trouvé</h3>
          <p v-if="searchQuery">Aucun résultat pour "{{ searchQuery }}"</p>
          <ion-button @click="loadExitVouchers" fill="outline" size="small">
            Rafraîchir
          </ion-button>
        </div>
  
        <ion-list v-if="!isLoading && filteredVouchers.length > 0">
          <ion-item 
            v-for="voucher in paginatedVouchers" 
            :key="voucher.hashed_id"
            button
            @click="openExitVoucherModal(voucher)"
          >
            <ion-accordion-group>
              <ion-accordion :value="expandedExitVoucherId === voucher.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(voucher.hashed_id)">
                  <ion-label class="delivery-note-card">
                    <div class="delivery-header">
                      <div class="delivery-meta">
                        <h3 class="delivery-number">Bon de Sortie #{{ voucher.exit_voucher_number }}</h3>
                        <div class="delivery-date-amount">
  <span class="delivery-date"><!--{{ formatExitVoucherDate(voucher.date) }}--></span>
                          <span class="delivery-amount">{{ voucher.total_formatted }}</span>
                        </div>
                      </div>
                      <div class="status-container">
                        <!--<span :class="['status-badge', getExitVoucherStatusClass(voucher.status)]">
                          {{ getExitVoucherStatusText(voucher.status) }}
                        </span>-->
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
              <ion-title>{{ selectedExitVoucher?.display_name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <p><strong>Bon de Sortie n°:</strong> {{ selectedExitVoucher?.exit_voucher_number }}</p>
            <p><strong>Date:</strong> {{ selectedExitVoucher?.date }}</p>
            <p><strong>Montant:</strong> {{ selectedExitVoucher?.total_formatted }}</p>
            
            <ion-button class="actionButton" :id="`action-trigger-${selectedExitVoucher?.hashed_id}`">
              Actions
            </ion-button>
            
            <ion-popover :trigger="`action-trigger-${selectedExitVoucher?.hashed_id}`" trigger-action="click">
              <ion-content>
                <ion-list class="actions">
                  <ion-item button detail="false" @click="handleAction('duplicate', $event, selectedExitVoucher)">
                    <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                    Duaplicate
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('download', $event, selectedExitVoucher)">
                    <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                    Télécharger
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('modify', $event, selectedExitVoucher)">
                    <ion-icon :icon="createOutline" slot="start"></ion-icon>
                      Edit</ion-item>
  
                  <ion-item 
                    button 
                    detail="false" 
                    @click="handleAction('validate', $event, selectedExitVoucher)"
                    v-if="selectedExitVoucher?.status === 0"
                  >
                    <ion-icon :icon="checkmarkDoneOutline" slot="start"></ion-icon>
                    Valider
                  </ion-item>
                  <ion-item button detail="false" @click="handleAction('send', $event, selectedExitVoucher)">
                    <ion-icon :icon="sendOutline" slot="start"></ion-icon>
                    Envoyer
                  </ion-item>
                  <ion-item 
                    button 
                    detail="false"
                    lines="none"
                    @click="handleAction('delete', $event, selectedExitVoucher)"
                    class="delete-action"
                  >
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Supprimer
                  </ion-item>
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
    IonPage, IonContent, IonList, IonItem, IonLabel, 
    IonButton, IonIcon, IonModal, IonHeader, IonToolbar, 
    IonTitle, IonButtons, IonInput, IonAlert, IonSpinner,
    IonAccordion, IonAccordionGroup, IonPopover
  } from '@ionic/vue';
  import { 
    refreshOutline, documentTextOutline, downloadOutline, 
    checkmarkDoneOutline, closeOutline, eyeOutline, 
    sendOutline, trashOutline, chevronBackOutline, 
    chevronForwardOutline
  } from 'ionicons/icons';
  import { useExitVoucherController } from '@/controllers/BonSortieController';
  /*import { 
    formatExitVoucherDate, 
    getExitVoucherStatusClass,
    getExitVoucherStatusText 
  } from '@/models/BonsortieModel';*/
  const {
    exitVouchers,
    isLoading,
    error,
    searchQuery,
    currentPage,
    filteredVouchers,
    paginatedVouchers,
    totalPages,
    isModalOpen,
    selectedExitVoucher,
    expandedExitVoucherId,
    loadExitVouchers,
    nextPage,
    prevPage,
    resetPagination,
    openExitVoucherModal,
    closeModal,
    toggleAccordion,
    handleAction,
  
  } = useExitVoucherController();
  
  
  
  
  
  
  </script>
  
  <style scoped>
  :root {
    --ion-background-color: #ffffff !important;
  }
  p {
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
    box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.2); 
    margin: 20px;
    border: none !important;
    display: flex;
    flex-direction: column;
    gap: 12px;  
  }
  
  ion-item::after, 
  ion-item::before {
    display: none !important;
  }
  
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
  
  .status-badge.status-invoiced {
    background-color: #e1f7ed;
    color: #27ae60;
    border: 1px solid #b3e6b3;
  }
  
  .status-badge.status-unknown {
    background-color: #fde8e8;
    color: #e74c3c;
    border: 1px solid #f5c6cb;
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
  
  .deliveries-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }
  
  .title {
    margin-top: 5px;
    font-size: 28px;
    font-weight: bold;
    color: #413b3b;
  }
  
  .company {
    color: #746868 !important; 
    font-size: 12px;
    margin-top: 5px; 
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
  
  .actions {
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
  
  .delete-action {
    --color: var(--ion-color-danger);
  }
  
  .search-container {
    display: flex;
    align-items: center; 
    justify-content: flex-start; 
    gap: 10px; 
    width: 100%; 
    flex-wrap: nowrap; 
  }
  
  .search-input {
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
  </style>