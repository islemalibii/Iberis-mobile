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
          <p class="page-subtitle">{{ formattedPeriod }}</p>
        </div>
      </div>

      <!-- Carte principale du solde -->
      <ion-card class="balance-card">
        <ion-card-header class="balance-header">
          <div class="header-content">
            <div class="title-section">
              <ion-card-title class="main-title">Solde de l'entreprise</ion-card-title>
              <ion-card-subtitle class="subtitle">
                <ion-icon name="calendar-outline" class="date-icon"></ion-icon>
                {{ formattedPeriod }}
              </ion-card-subtitle>
            </div>
            <div class="status-indicator" v-if="!loading && !error">
              <div class="status-dot" :class="balanceStatus"></div>
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
          </div>

          <!-- Affichage du solde -->
          <div v-else class="balance-display">
            <!-- Message d'information si pas de données réelles -->
            <div v-if="!hasRealData" class="info-message">
              <ion-icon name="information-circle-outline"></ion-icon>
              <p>Aucune donnée de solde disponible pour cette période. Le solde affiché est nul.</p>
            </div>

            <div class="balance-main">
              <div class="balance-numbers">
                <span class="balance-amount">{{ balanceData?.strings || '0.000' }}</span>
                <span class="balance-currency">{{ currencySymbol }}</span>
              </div>
            </div>

          

         
          </div>
        </ion-card-content>
      </ion-card>

     
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonSpinner, IonText, IonIcon
} from '@ionic/vue';
import { ref, computed, onMounted, watch } from 'vue';
import useCompanyBalance from '@/controllers/CompanyBalanceController';

// Props reçus du dashboard
interface Props {
  period?: string;
  startDate?: Date;
  endDate?: Date;
}

const props = withDefaults(defineProps<Props>(), {
  period: 'default',
  startDate: () => new Date(),
  endDate: () => new Date()
});

const { 
  balanceData,
  loading, 
  error,
  currencySymbol,
  hasRealData,
  totalBalance,
  balanceStatus,
  formatAmount,
  fetchData,
  fetchDefaultData 
} = useCompanyBalance();

// Fonction pour formater les dates en YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fonction pour déterminer si on doit utiliser les dates par défaut ou les props
const shouldUseDefaultDates = (): boolean => {
  return !props.period || props.period === 'default' || props.period === 'thisYear';
};

// Fonction pour charger les données selon la configuration
const loadData = async () => {
  if (shouldUseDefaultDates()) {
    console.log('Utilisation de la période comptable par défaut');
    await fetchDefaultData();
  } else {
    console.log('Utilisation de la période spécifiée:', props.period);
    const fromDate = formatDate(props.startDate);
    const toDate = formatDate(props.endDate);
    await fetchData(fromDate, toDate);
  }
};

// Formatage de la période pour l'affichage
const formattedPeriod = computed(() => {
  if (shouldUseDefaultDates()) {
    return 'Période comptable par défaut';
  }
  
  const start = props.startDate.toLocaleDateString('fr-FR');
  const end = props.endDate.toLocaleDateString('fr-FR');
  return `Du ${start} au ${end}`;
});

// Texte du statut du solde
const balanceStatusText = computed(() => {
  switch (balanceStatus.value) {
    case 'positive': return 'Positif';
    case 'negative': return 'Négatif';
    default: return 'Neutre';
  }
});





// Initialisation
onMounted(() => {
  loadData();
});

// Surveiller les changements de période
watch([() => props.period, () => props.startDate, () => props.endDate], () => {
  loadData();
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
  background-color: #27ae60;
  box-shadow: 0 0 12px rgba(39, 174, 96, 0.4);
}

.status-dot.negative {
  background-color: #e74c3c;
  box-shadow: 0 0 12px rgba(231, 76, 60, 0.4);
}

.status-dot.neutral {
  background-color: #95a5a6;
  box-shadow: 0 0 12px rgba(149, 165, 166, 0.4);
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

/* Message d'information */
.info-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: #6c757d;
  font-size: 0.85rem;
}

.info-message ion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.info-message p {
  margin: 0;
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

.balance-currency {
  font-size: 1.2rem;
  font-weight: 500;
  color: #34495e;
  margin-left: 8px;
}

.balance-total {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 16px 0;
}

.total-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
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
  color: #27ae60;
}

.indicator-item.negative {
  background-color: #ffeaea;
  color: #e74c3c;
}

.indicator-item.neutral {
  background-color: #f0f0f0;
  color: #95a5a6;
}

.indicator-item ion-icon {
  font-size: 1.2rem;
}

/* Indicateurs supplémentaires */
.indicators-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.indicator-card {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.indicator-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  font-size: 20px;
  color: #6c757d;
}

.indicator-icon.positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.indicator-icon.negative {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.indicator-icon.neutral {
  background: rgba(149, 165, 166, 0.1);
  color: #95a5a6;
}

.indicator-content {
  flex: 1;
}

.indicator-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.indicator-value {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.indicator-value.positive {
  color: #27ae60;
}

.indicator-value.negative {
  color: #e74c3c;
}

.indicator-value.neutral {
  color: #95a5a6;
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
  
  .balance-currency {
    font-size: 1rem;
    margin-left: 4px;
  }
  
  .indicators-container {
    grid-template-columns: 1fr;
  }
  
  .balance-main {
    flex-direction: column;
    align-items: center;
    gap: 8px;
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

.indicator-card {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: 0.1s;
}
</style>