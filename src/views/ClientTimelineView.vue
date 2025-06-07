<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="container">
          <!-- En-tête avec logo -->
          <div class="header">
            <div class="header-left">
              <ion-button fill="clear" @click="router.back()" class="back-button">
              <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
              </ion-button>
          
          
            </div>
  <h1 class="title">Chronologie de </h1>
        
          </div>
  
          <!-- Contenu principal -->
          <div class="timeline-container">
            <div 
              v-for="(entities, date) in timelineData" 
              :key="date" 
              class="timeline-day"
            >
              <ion-card class="timeline-card">
                <!-- En-tête de date -->
                <ion-card-header class="timeline-header">
                  <div class="date-container">
                    <ion-icon :icon="timeOutline" class="date-icon" />
                    <ion-card-title class="timeline-date">
                      {{ formatDate(date) }}
                    </ion-card-title>
                  </div>
                </ion-card-header>
  
                <!-- Liste des entités -->
                <ion-card-content>
                  <div 
                    v-for="(actions, entityId) in entities" 
                    :key="entityId" 
                    class="entity-block"
                  >
                    <div class="entity-header">
                      <ion-icon :icon="getEntityIcon(entityId)" class="entity-icon" />
                      <h3 class="entity-id">{{ entityId }}</h3>
                    </div>
  
                    <!-- Liste des actions -->
                    <div class="action-list">
                      <div 
                        v-for="(action, index) in actions" 
                        :key="index" 
                        class="action-item"
                        :class="getActionColor(action)"
                      >
                        <ion-icon :icon="getActionIcon(action)" class="action-icon" />
                        <div class="action-content">
                          <p class="action-text">{{ getActionText(action) }}</p>
                          <div class="action-details">
                            <span class="time">
                              <ion-icon :icon="timeOutline" />
                              {{ getActionTime(action) }}
                            </span>
                            <span class="user">
                              <ion-icon :icon="personCircleOutline" />
                              {{ getUserInfo(action) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>
  
          <!-- État de chargement -->
          <div v-if="isLoading" class="loading-state">
            <ion-spinner name="crescent" class="spinner" />
            <p class="loading-text">Chargement de l'historique...</p>
          </div>
  
          <!-- Gestion des erreurs -->
          <ion-alert
            v-if="error"
            :is-open="true"
            :message="error"
            :buttons="['OK']"
            @didDismiss="error = null"
            class="error-alert"
          />
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import {
    IonPage, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonSpinner, IonAlert
  } from '@ionic/vue';
  import { useTimeline } from '@/controllers/TimelineController';
  import {
    arrowBackOutline,
    refreshOutline,
    timeOutline,
    personCircleOutline
  } from 'ionicons/icons';
  
  const router = useRouter();
  const { params: { id } } = useRoute();
  
  const {
    timelineData,
    isLoading,
    error,
    reload,
    formatDate,
    getEntityIcon,
    getActionText,
    getActionTime,
    getUserInfo,
    getActionIcon,
  
    getActionColor
  } = useTimeline(id as string);
  </script>
  
  <style scoped>
  /* Styles de base */
  ion-content {
    --background: #f8fafc;
  }
  
  
  /* En-tête */
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  
  
  .title {
    font-size: 1.5rem;
    color: #1e293b;
    font-weight: 600;
    margin: 0;
    flex-grow: 1;
    text-align: center;
  }
  
  /* Carte de timeline */
  .timeline-card {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    background: white;
  }
  
  .timeline-header {
    padding: 1rem;
    background: #f1f5f9;
  }
  
  .date-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .timeline-date {
    font-size: 1rem;
    color: #475569;
    font-weight: 500;
  }
  
  /* Entités */
  .entity-block {
    margin: 1.5rem 0;
  }
  
  .entity-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .entity-icon {
    font-size: 1.5rem;
    color: #475569;
  }
  
  .entity-id {
    font-size: 1rem;
    color: #1e293b;
    margin: 0;
    font-weight: 500;
  }
  
  
  
  
  
  /* Actions */
  .action-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid transparent;
    transition: transform 0.1s ease;
  }
  
  .action-item:hover {
    transform: translateX(2px);
  }
  
  .action-icon {
    font-size: 1.25rem;
    color: #475569;
    margin-top: 0.25rem;
  }
  
  .action-content {
    flex: 1;
  }
  
  .action-text {
    font-weight: 500;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }
  
  .action-details {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #64748b;
  }
  
  .time,
  .user {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  /* Couleurs des actions */
  .action-created { border-left-color: #10b981; }
  .action-updated { border-left-color: #f59e0b; }
  .action-sent { border-left-color: #3b82f6; }
  
  /* État de chargement */
  .loading-state {
    text-align: center;
    padding: 3rem;
    color: #64748b;
  }
  
  .spinner {
    width: 48px;
    height: 48px;
    --color: #475569;
  }
  
  .loading-text {
    margin-top: 1rem;
    font-size: 0.875rem;
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .container {
      padding: 0 0.5rem;
    }
  
    .title {
      font-size: 1.25rem;
    }
  
    .entity-id {
      font-size: 0.875rem;
    }
  
    .action-text {
      font-size: 0.875rem;
    }
  
    .action-details {
      flex-direction: column;
      gap: 0.25rem;
    }
    .logo {
    height: 60px;
    width: auto;
    max-width: 100%;
  }
  
  
  }
  </style>