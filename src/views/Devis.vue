<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <router-link to="/clients">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
        </router-link>
        
        <div class="estimates-header">
          <div class="title-container">
            <ion-label class="title">Estimates</ion-label>
            <p class="company">Estimates : {{ selectedEstimate?.company?.title || 'Company' }}</p>
                <p>{{ selectedEstimate?.client?.display_name }}</p>
  
          </div>
        </div>
  
        <ion-item class="search-bar" lines="none">
          <div class="search-container">
            <ion-input 
              v-model="searchQuery"
              placeholder="Search..." 
              class="search-input"
              @input="searchQuery = $event.target.value"
            ></ion-input>
          </div>
        </ion-item>
  
        <ion-list>
          <ion-item 
            v-for="estimate in paginatedEstimates" 
            :key="estimate.hashed_id"
            button
            @click="openEstimateModal(estimate)"
            class="estimate-item"
          >
            <ion-accordion-group>
              <ion-accordion :value="expandedEstimate === estimate.hashed_id ? 'open' : ''">
                <ion-item slot="header" @click="toggleAccordion(estimate.hashed_id)" lines="none">
                  <ion-label class="estimate-card">
                    <div class="estimate-header">
                      <div class="estimate-meta">
                        <h3 class="estimate-number">Estimate #{{ estimate.estimate_number }}</h3>
                        <div class="estimate-date-amount">
                          <span class="estimate-date">{{ formatDate(estimate.date) }}</span>
                          <span class="estimate-amount">{{ estimate.total_formatted }}</span>
                        </div>
                      </div>
                      <div class="status-container">
                        <span :class="['status-badge', getEstimateStatusClass(estimate.status)]">
                          {{ getEstimateStatusText(estimate.status) }}
                        </span>
                      </div>
                    </div>
                  </ion-label>
                </ion-item>
              </ion-accordion>
            </ion-accordion-group>
          </ion-item>
  
          <div v-if="!isLoading && paginatedEstimates.length === 0" class="empty-state">
            <p>No estimates found for this client</p>
          </div>
        </ion-list>
  
        <div class="pagination-controls" v-if="totalPages > 1">
          <ion-button fill="clear" @click="prevPage" :disabled="currentPage === 1">
            <ion-icon :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <span>Page {{ currentPage }} / {{ totalPages }}</span>
          <ion-button fill="clear" @click="nextPage" :disabled="currentPage === totalPages">
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
        </div>
  
       <ion-modal 
    :is-open="isModalOpen" 
    @did-dismiss="closeModal" 
    class="estimate-modal"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ selectedEstimate?.client?.display_name || 'Détails du devis' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div v-if="selectedEstimate" class="modal-content">
        <div class="info-section">
          <p><strong>Numéro:</strong> {{ selectedEstimate.estimate_number }}</p>
          <p><strong>Date:</strong> {{ formatDate(selectedEstimate.date) }}</p>
          <p><strong>Montant:</strong> {{ selectedEstimate.total_formatted }}</p>
          <p>
            <strong>Statut:</strong> 
            <span :class="['status-badge', getEstimateStatusClass(selectedEstimate.status)]">
              {{ getEstimateStatusText(selectedEstimate.status) }}
            </span>
          </p>
        </div>
  
        <ion-button 
          class="action-button" 
          :id="`action-trigger-${selectedEstimate.hashed_id}`"
          expand="block"
        >
          Actions
          <ion-icon :icon="chevronDownOutline" slot="end"></ion-icon>
        </ion-button>
        
        <ion-popover 
          :trigger="`action-trigger-${selectedEstimate.hashed_id}`" 
          trigger-action="click"
          class="actions-popover"
        >
          <ion-content>
            <ion-list class="actions-list">
             <ion-item 
    button 
    detail="false" 
    @click="handleAction('validate', $event, selectedEstimate)"
    class="action-item"
    v-if=" selectedEstimate.status == 1"
  >
    <ion-icon :icon="checkmarkCircleOutline" slot="start"></ion-icon>
    <ion-label>Valider</ion-label>
  </ion-item>
              <ion-item 
                button 
                detail="false" 
                @click="handleAction('visualize', $event, selectedEstimate)"
                class="action-item"
              >
                <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                Visualiser
              </ion-item>
  
                <ion-item 
                button 
                detail="false"
                @click="handleAction('delete', $event, selectedEstimate)"
                class="action-item delete-action"
              >
                <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                Supprimer
              </ion-item>
                    <ion-item button detail="false" @click="handleAction('duplicate', $event, selectedEstimate)">
                    <ion-icon :icon="copyOutline" slot="start"></ion-icon>
                    Duaplicate
                  </ion-item>
              <ion-item 
                button 
                detail="false" 
                @click="handleAction('modify', $event, selectedEstimate)"
                class="action-item"
              >
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                Modifier
              </ion-item>
              
              <ion-item 
                button 
                detail="false" 
                @click="handleAction('download', $event, selectedEstimate)"
                class="action-item"
              >
                <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
                Télécharger
              </ion-item>
              
          
              
              <ion-item 
                button 
                detail="false" 
                @click="handleAction('send', $event, selectedEstimate)"
                class="action-item"
              >
                <ion-icon :icon="sendOutline" slot="start"></ion-icon>
                Envoyer
              </ion-item>
              
            
            </ion-list>
          </ion-content>
        </ion-popover>
      </div>
    </ion-content>
  </ion-modal>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup, 
    IonButton, IonPopover, IonButtons, IonIcon, IonModal, IonInput,
    IonSpinner
  } from '@ionic/vue';
  import { 
    chevronBackOutline, 
    chevronForwardOutline, 
    closeOutline, 
    trashOutline,
    eyeOutline,
    createOutline,
    downloadOutline,
    checkmarkCircleOutline,
    sendOutline,
     copyOutline 
  } from 'ionicons/icons';
  import { EstimatesController } from '@/controllers/DevisController';
  
  
  const {
    clientName,
    currentPage,
    totalPages,
    paginatedEstimates,
    searchQuery,
    isModalOpen,
    selectedEstimate,
    isLoading,
    expandedEstimate,
    formatDate,
    getEstimateStatusClass,
    getEstimateStatusText,
    toggleAccordion,
    openEstimateModal,
    closeModal,
    nextPage,
    prevPage,
    handleAction,
    
  } = EstimatesController();
  </script>
  
  <style scoped>
  :root {
    --ion-background-color: #d1b8b8 !important;
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
  .estimate-number-note-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  
  .estimate-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .delivery-meta {
    flex: 1;
  }
  
  .estimate-number {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }
  
  .estimate-date-amount {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .estimate-date::before {
    content: "📅 ";
  }
  
  .estimate-amount::before {
    content: "💰 ";
  }
  
  .estimate-amount {
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
  .estimate-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .estimate-modal-actions ion-button {
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
  
  .estimate-client {
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
  
  
  .estimate-item {
    --inner-padding-end: 0;
    --padding-start: 0;
    --inner-padding-start: 0;
  }
  
  ion-accordion-group {
    width: 100%;
  }
  
  ion-accordion {
    width: 100%;
  }
  
  /* Empêcher le clic sur le contenu de l'accordéon de déclencher l'ouverture du modal */
  .estimate-content {
    pointer-events: none;
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
  .estimate-header {
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
  .estimate-modal{
    --width: 90%;
    --max-width: 400px;
    --height: 340px;
    --border-radius: 10px;
    --background: #ffffff;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .estimate-modal ion-header {
    --background: #ffffff;
    --color: #000000;
  }
  .estimate-modal ion-content {
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 16px;
    --padding-bottom: 16px;
  }
  .estimate-modalion-item {
    --background: #ffffff;
    --padding-start: 0;
    --padding-end: 0;
  }
  .estimate-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .estimate-modal-actions ion-button {
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
