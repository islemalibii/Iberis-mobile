<template>
    <ion-page>
      <ion-content class="ion-padding">
        <!-- Header avec logo et titre -->
        <div class="header-section">
          <div class="logo-container">
            <img src="../assets/budget.png" alt="Logo Iberis" class="logo" @click="goBack" />
          </div>
          <div class="header-text">
            <h1 class="page-title">Tableau de Bord Financier</h1>
            <p class="page-subtitle">Gestion du solde de l'entreprise</p>
          </div>
        </div>
  
        <!-- Carte principale du solde -->
        <ion-card class="balance-card">
          <ion-card-header class="balance-header">
            <div class="header-content">
              <div class="title-section">
                <ion-card-title class="main-title">Solde de l'entreprise</ion-card-title>
                <ion-card-subtitle class="subtitle" v-if="balanceData">
                  <ion-icon name="calendar-outline" class="date-icon"></ion-icon>
                  {{ toDate ? `Au ${formattedDate}` : 'Solde actuel' }}
                </ion-card-subtitle>
              </div>
            </div>
          </ion-card-header>
  
          <ion-card-content class="balance-content">
            <!-- État de chargement -->
            <div v-if="loading" class="spinner-container">
              <div class="loading-content">
                <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
                <p class="loading-text">Chargement des données...</p>
              </div>
            </div>
            
            <!-- État d'erreur -->
            <div v-else-if="error" class="error-container">
              <div class="error-icon">
                <ion-icon name="alert-circle-outline"></ion-icon>
              </div>
              <ion-text color="danger" class="error-text">{{ error }}</ion-text>
              <ion-button 
                v-if="error.includes('permissions')" 
                @click="openSettings"
                fill="outline"
                color="primary"
                class="error-button"
              >
                <ion-icon name="settings-outline" slot="start"></ion-icon>
                Ouvrir les paramètres
              </ion-button>
            </div>
  
            <!-- Affichage du solde -->
            <div v-else-if="balanceData" class="balance-display">
              <div class="balance-main">
                <div class="balance-numbers">
                  <span class="balance-amount">{{ balanceData.strings }}</span>
                  <span class="balance-decimal">.{{ balanceData.integer.toString().padStart(2, '0') }}</span>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { 
    IonPage, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonSpinner, IonText, IonButton, IonItem, IonInput, 
    IonLabel, IonIcon
  } from '@ionic/vue';
  import useCompanyBalance from '@/controllers/CompanyBalanceController';
  
  const { balanceData, loading, error, fetchData } = useCompanyBalance();
  const toDate = ref<string>('');
  
  const formattedDate = computed(() => {
    if (!toDate.value) return '';
    return new Date(toDate.value).toLocaleDateString('fr-FR');
  });
  // Props reçus du dashboard
  interface Props {
    period?: string;
    startDate?: Date;
    endDate?: Date;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    period: 'thisMonth',
    startDate: () => new Date(),
    endDate: () => new Date()
  });
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  const loadDataWithPeriod = async () => {
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    
    await fetchData(fromDate, toDate);
  };
  
  // Charger les données au montage
  onMounted(() => {
    loadDataWithPeriod();
  });
  
  
  
  onMounted(() => {
    fetchData();
  });
  watch([() => props.period, () => props.startDate, () => props.endDate], () => {
    loadDataWithPeriod();
  }, { deep: true });
  </script>
  
  <style scoped>
  /* Configuration générale */
  ion-content {
    --background: #ffffff;
    --padding-top: 20px;
  }
  
  ion-page {
    --background: #ffffff;
  }
  
  /* Header section */
  .header-section {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #faf8f0 0%, #ffffff 100%);
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .logo-container {
    margin-right: 12px;
  }
  
  .logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  .logo:hover {
    transform: scale(1.03);
  }
  
  .header-text {
    flex: 1;
  }
  
  .page-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c2c2c;
    margin: 0 0 2px 0;
    letter-spacing: -0.01em;
  }
  
  .page-subtitle {
    font-size: 0.8rem;
    color: #666;
    margin: 0;
    font-weight: 400;
  }
  
  /* Carte principale */
  .balance-card {
    margin-bottom: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;
    overflow: hidden;
    background: #ffffff;
  }
  
  .balance-header {
    background: linear-gradient(135deg, #f7c52d 0%, #e6b800 100%);
    color: #2c2c2c;
    padding: 16px;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .title-section {
    flex: 1;
  }
  
  .main-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 4px;
    color: #2c2c2c;
  }
  
  .subtitle {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    color: rgba(44, 44, 44, 0.8);
  }
  
  .date-icon {
    margin-right: 4px;
    font-size: 0.9rem;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
  }
  
  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .status-dot.positive {
    background-color: #4CAF50;
    box-shadow: 0 0 12px rgba(76, 175, 80, 0.4);
  }
  
  .status-dot.negative {
    background-color: #F44336;
    box-shadow: 0 0 12px rgba(244, 67, 54, 0.4);
  }
  
  /* Contenu de la carte */
  .balance-content {
    padding: 20px 16px;
    background: #ffffff;
  }
  
  /* États de chargement et d'erreur */
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 120px;
  }
  
  .loading-content {
    text-align: center;
  }
  
  .custom-spinner {
    --color: #f7c52d;
    transform: scale(1.2);
    margin-bottom: 12px;
  }
  
  .loading-text {
    color: #666;
    font-size: 0.8rem;
    margin: 0;
  }
  
  .error-container {
    text-align: center;
    padding: 20px 12px;
  }
  
  .error-icon {
    margin-bottom: 12px;
  }
  
  .error-icon ion-icon {
    font-size: 2rem;
    color: var(--ion-color-danger);
  }
  
  .error-text {
    display: block;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  
  .error-button {
    --border-radius: 8px;
    height: 36px;
  }
  
  /* Affichage du solde */
  .balance-display {
    text-align: center;
  }
  
  .balance-main {
    display: flex;
    justify-content: center;
    align-items: baseline;
    margin-bottom: 12px;
    gap: 4px;
  }
  
  .balance-numbers {
    display: flex;
    align-items: baseline;
  }
  
  .balance-amount {
    font-size: 2.4rem;
    font-weight: 700;
    color: #2c2c2c;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  
  .balance-decimal {
    font-size: 1.4rem;
    font-weight: 400;
    color: #666;
    margin-left: 1px;
  }
  
  .balance-indicators {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .indicator-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .indicator-item.positive {
    background-color: #e8f5e8;
    color: #2e7d2e;
  }
  
  .indicator-item.negative {
    background-color: #ffeaea;
    color: #d32f2f;
  }
  
  .indicator-item ion-icon {
    font-size: 1.2rem;
  }
  
  /* Carte d'actions */
  .actions-card {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    background: #ffffff;
  }
  
  .actions-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .actions-content {
    padding: 16px 20px 20px;
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .action-btn {
    --border-radius: 12px;
    --border-width: 1.5px;
    --border-color: #e0e0e0;
    --color: #333;
    height: 44px;
    flex: 1;
    min-width: 120px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .action-btn:hover {
    --border-color: #667eea;
    --color: #667eea;
    transform: translateY(-1px);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .header-section {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
    
    .balance-amount {
      font-size: 2rem;
    }
    
    .balance-decimal {
      font-size: 1.2rem;
    }
  }
  
  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .balance-card {
    animation: fadeInUp 0.5s ease forwards;
  }
  </style>