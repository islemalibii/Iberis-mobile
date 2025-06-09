<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="yellow-toolbar">
        <div class="toolbar-container">
          <div class="logo-container">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </div>
          
          <div class="header-actions">
            <div class="company-selector">
              <ion-select 
                v-model="selectedCompany"
                interface="popover"
                placeholder="Sélectionner une entreprise"
                class="custom-select"
                aria-label="Sélectionner une entreprise"
              >
                <ion-select-option 
                  v-for="company in userCompanies" 
                  :key="company.hashed_id" 
                  :value="company.hashed_id"
                >
                  {{ company.title }}  
                </ion-select-option>
              </ion-select>
              
              <ion-button 
                @click="goToCreateCompany" 
                fill="clear" 
                class="add-company-btn"
                aria-label="Ajouter une entreprise"
              >
                <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>

    <IonContent class="dashboard-content">
      <IonLoading :is-open="loading" message="Chargement des données..." spinner="crescent" />

      <div class="dashboard-container">
        <!-- Header avec animation -->
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1 class="welcome-title">
              <span class="greeting">Bonjour,</span>
              <span class="username">
                {{ userProfile?.fullname ||'Utilisateur' }}
              </span>
            </h1>
            <p class="welcome-subtitle">Tableau de bord - Aperçu de votre activité</p>
          </div>
          <div class="date-info">
            <div class="current-date">{{ getCurrentDate() }}</div>
          </div>
        </div>

        <!-- Nouveau filtre de période amélioré -->
        <div class="period-filter-container">
          <div class="filter-header">
            <h3 class="filter-title">
              <i class="fas fa-calendar-alt"></i>
              Période d'analyse
            </h3>
          </div>
          <div class="filter-options">
            <div class="period-buttons">
              <button 
                v-for="period in periodOptions" 
                :key="period.value"
                @click="selectPeriod(period.value)"
                :class="['period-btn', { active: selectedPeriod === period.value }]"
              >
                {{ period.label }}
              </button>
            </div>
            
            <!-- Option de date personnalisée -->
            <div class="custom-date-section" v-if="selectedPeriod === 'custom'">
              <div class="date-inputs">
                <div class="date-input-group">
                  <label>Du</label>
                  <input 
                    type="date" 
                    v-model="customStartDate" 
                    @change="onCustomDateChange"
                    class="custom-date-input"
                  />
                </div>
                <div class="date-input-group">
                  <label>Au</label>
                  <input 
                    type="date" 
                    v-model="customEndDate" 
                    @change="onCustomDateChange"
                    class="custom-date-input"
                  />
                </div>
              </div>
            </div>
            
            <!-- Affichage de la période sélectionnée -->
            <div class="selected-period-display">
              <span class="period-label">Période sélectionnée :</span>
              <span class="period-value">{{ getSelectedPeriodText() }}</span>
            </div>
          </div>
        </div>

        <!-- KPI Cards en ligne avec flex -->
        <div class="kpi-container">
  <div class="kpi-card received-card">
    <div class="kpi-icon-wrapper">
      <div class="kpi-icon received-icon">
        <i class="fas fa-arrow-down"></i>
      </div>
    </div>
    <div class="kpi-content">
      <div class="kpi-label">Paiements Reçus</div>
      <div class="kpi-value">
        <span v-if="loading" class="loading-dots">...</span>
        <span v-else>{{ formatAmount(totalReceived) }} <small>TND</small></span>
      </div>
      <div class="kpi-trend" :class="getTrendClass('received')">
        <!-- Add trend content here if needed -->
      </div>
    </div>
  </div>

  <div class="kpi-card emitted-card">
    <div class="kpi-icon-wrapper">
      <div class="kpi-icon emitted-icon">
        <i class="fas fa-arrow-up"></i>
      </div>
    </div>
    <div class="kpi-content">
      <div class="kpi-label">Paiements Émis</div>
      <div class="kpi-value">
        <span v-if="loading" class="loading-dots">...</span>
        <span v-else>{{ formatAmount(totalEmitted) }} <small>TND</small></span>
      </div>
      <div class="kpi-trend" :class="getTrendClass('emitted')">
        <!-- Add trend content here if needed -->
      </div>
    </div>
  </div>
</div>

        <!-- Grille des composants avec design amélioré -->
        <div class="dashboard-grid">
          <div class="grid-item large-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-chart-line"></i>
                Revenus vs Dépenses
              </h3>
            </div>
            <div class="component-content">
              <RevenuesVsExpensesChart :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
          
          <div class="grid-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-wallet"></i>
                Solde de l'Entreprise
              </h3>
            </div>
            <div class="component-content">
              <CompanyBalanceView :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
          
          <div class="grid-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-chart-bar"></i>
                Chiffre d'Affaires
              </h3>
            </div>
            <div class="component-content">
              <CompanyTurnoverView :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
          
          <div class="grid-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-chart-pie"></i>
                Résultats
              </h3>
            </div>
            <div class="component-content">
              <ResultsChart :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
          
          <div class="grid-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-shopping-cart"></i>
                Ventes
              </h3>
            </div>
            <div class="component-content">
              <SalesChart :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
          
          <div class="grid-item">
            <div class="component-header">
              <h3 class="component-title">
                <i class="fas fa-shopping-bag"></i>
                Achats
              </h3>
            </div>
            <div class="component-content">
              <Purechase :period="selectedPeriod" :startDate="startDate" :endDate="endDate" />
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>
<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonContent, IonButton,
  IonSelect, IonSelectOption, IonIcon, IonLoading
} from '@ionic/vue';
import { onMounted, ref, computed, watch } from 'vue';
import { addOutline } from 'ionicons/icons';
import { useDashboardController } from '@/controllers/DashboardController';
import { useUserController } from '@/controllers/UserController';

// Import des composants
import CompanyBalanceView from '@/views/CompanyBalanceView.vue';
import CompanyTurnoverView from '@/views/CompanyTurnoverView.vue';
import RevenuesVsExpensesChart from '@/views/RevenuesVsExpnsesChart.vue';
import ResultsChart from '@/views/ResultsChart.vue';
import SalesChart from '@/views/SalesChart.vue';
import Purechase from '@/views/Purechase.vue';

const { userProfile, loadUserProfile } = useUserController();

const {
  loading,
  totalEmitted,
  totalReceived,
  userCompanies,
  selectedCompany,
  loadPayments,
  goToCreateCompany,
  getCurrentDateRange
} = useDashboardController();

// Variables pour le filtre de période
const selectedPeriod = ref('thisYear');
const customStartDate = ref('');
const customEndDate = ref('');

// Options de période étendues
const periodOptions = [
  { value: 'yesterday', label: 'Hier' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'tomorrow', label: 'Demain' },
  { value: 'thisWeek', label: 'Cette semaine' },
  { value: 'last7Days', label: 'Les 7 derniers jours' },
  { value: 'next7Days', label: 'Les 7 prochains jours' },
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'last30Days', label: 'Les 30 derniers jours' },
  { value: 'next30Days', label: 'Les 30 prochains jours' },
  { value: 'last60Days', label: 'Les 60 derniers jours' },
  { value: 'next60Days', label: 'Les 60 prochains jours' },
  { value: 'last90Days', label: 'Les 90 derniers jours' },
  { value: 'next90Days', label: 'Les 90 prochains jours' },
  { value: 'thisQuarter', label: 'Ce trimestre' },
  { value: 'lastQuarter', label: 'Le trimestre dernier' },
  { value: 'nextQuarter', label: 'Le trimestre prochain' },
  { value: 'thisYear', label: 'Cette année' },
  { value: 'lastYear', label: "L'année précédente" },
  { value: 'nextYear', label: "L'année prochaine" },
  { value: 'custom', label: 'Manuelle' }
];

// Fonctions utilitaires pour les calculs de dates
const getQuarterStartMonth = (quarter: number) => (quarter - 1) * 3;
const getCurrentQuarter = (date: Date) => Math.floor(date.getMonth() / 3) + 1;

const getTrendClass = (type: 'received' | 'emitted') => {
  return type === 'received' ? 'positive' : 'negative';
};

// Computed pour les dates de début et fin
const startDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  
  switch (selectedPeriod.value) {
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(date - 1);
      return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    case 'today':
      return new Date(year, month, date);
    
    case 'tomorrow':
      const tomorrow = new Date(now);
      tomorrow.setDate(date + 1);
      return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    case 'thisWeek':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(date - now.getDay() + 1);
      return startOfWeek;
    
    case 'last7Days':
      const last7 = new Date(now);
      last7.setDate(date - 7);
      return last7;
    
    case 'next7Days':
      return new Date(year, month, date);
    
    case 'thisMonth':
      return new Date(year, month, 1);
    
    case 'lastMonth':
      return new Date(year, month - 1, 1);
    
    case 'last30Days':
      const last30 = new Date(now);
      last30.setDate(date - 30);
      return last30;
    
    case 'next30Days':
      return new Date(year, month, date);
    
    case 'last60Days':
      const last60 = new Date(now);
      last60.setDate(date - 60);
      return last60;
    
    case 'next60Days':
      return new Date(year, month, date);
    
    case 'last90Days':
      const last90 = new Date(now);
      last90.setDate(date - 90);
      return last90;
    
    case 'next90Days':
      return new Date(year, month, date);
    
    case 'thisQuarter':
      const currentQuarter = getCurrentQuarter(now);
      const quarterStartMonth = getQuarterStartMonth(currentQuarter);
      return new Date(year, quarterStartMonth, 1);
    
    case 'lastQuarter':
      const lastQuarter = getCurrentQuarter(now) - 1;
      const lastQuarterStartMonth = lastQuarter <= 0 ? 9 : getQuarterStartMonth(lastQuarter);
      const lastQuarterYear = lastQuarter <= 0 ? year - 1 : year;
      return new Date(lastQuarterYear, lastQuarterStartMonth, 1);
    
    case 'nextQuarter':
      const nextQuarter = getCurrentQuarter(now) + 1;
      const nextQuarterStartMonth = nextQuarter > 4 ? 0 : getQuarterStartMonth(nextQuarter);
      const nextQuarterYear = nextQuarter > 4 ? year + 1 : year;
      return new Date(nextQuarterYear, nextQuarterStartMonth, 1);
    
    case 'thisYear':
      return new Date(year, 0, 1);
    
    case 'lastYear':
      return new Date(year - 1, 0, 1);
    
    case 'nextYear':
      return new Date(year + 1, 0, 1);
    
    case 'custom':
      return customStartDate.value ? new Date(customStartDate.value) : new Date();
    
    default:
      return new Date(year, 0, 1);
  }
});

const endDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  
  switch (selectedPeriod.value) {
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(date - 1);
      return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
    
    case 'today':
      return new Date(year, month, date, 23, 59, 59);
    
    case 'tomorrow':
      const tomorrow = new Date(now);
      tomorrow.setDate(date + 1);
      return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
    
    case 'thisWeek':
      const endOfWeek = new Date(now);
      endOfWeek.setDate(date - now.getDay() + 7);
      return endOfWeek;
    
    case 'last7Days':
    case 'next7Days':
      const end7 = new Date(now);
      end7.setDate(date + (selectedPeriod.value === 'last7Days' ? 0 : 7));
      return end7;
    
    case 'thisMonth':
      return new Date(year, month + 1, 0, 23, 59, 59);
    
    case 'lastMonth':
      return new Date(year, month, 0, 23, 59, 59);
    
    case 'last30Days':
    case 'next30Days':
      const end30 = new Date(now);
      end30.setDate(date + (selectedPeriod.value === 'last30Days' ? 0 : 30));
      return end30;
    
    case 'last60Days':
    case 'next60Days':
      const end60 = new Date(now);
      end60.setDate(date + (selectedPeriod.value === 'last60Days' ? 0 : 60));
      return end60;
    
    case 'last90Days':
    case 'next90Days':
      const end90 = new Date(now);
      end90.setDate(date + (selectedPeriod.value === 'last90Days' ? 0 : 90));
      return end90;
    
    case 'thisQuarter':
      const currentQuarter = getCurrentQuarter(now);
      const quarterEndMonth = getQuarterStartMonth(currentQuarter) + 2;
      return new Date(year, quarterEndMonth + 1, 0, 23, 59, 59);
    
    case 'lastQuarter':
      const lastQuarter = getCurrentQuarter(now) - 1;
      const lastQuarterEndMonth = lastQuarter <= 0 ? 11 : getQuarterStartMonth(lastQuarter) + 2;
      const lastQuarterYear = lastQuarter <= 0 ? year - 1 : year;
      return new Date(lastQuarterYear, lastQuarterEndMonth + 1, 0, 23, 59, 59);
    
    case 'nextQuarter':
      const nextQuarter = getCurrentQuarter(now) + 1;
      const nextQuarterEndMonth = nextQuarter > 4 ? 2 : getQuarterStartMonth(nextQuarter) + 2;
      const nextQuarterYear = nextQuarter > 4 ? year + 1 : year;
      return new Date(nextQuarterYear, nextQuarterEndMonth + 1, 0, 23, 59, 59);
    
    case 'thisYear':
      return new Date(year, 11, 31, 23, 59, 59);
    
    case 'lastYear':
      return new Date(year - 1, 11, 31, 23, 59, 59);
    
    case 'nextYear':
      return new Date(year + 1, 11, 31, 23, 59, 59);
    
    case 'custom':
      return customEndDate.value ? new Date(customEndDate.value + 'T23:59:59') : new Date();
    
    default:
      return new Date(year, 11, 31, 23, 59, 59);
  }
});

// Méthodes
const selectPeriod = (period: string) => {
  selectedPeriod.value = period;
  
  if (period !== 'custom') {
    customStartDate.value = '';
    customEndDate.value = '';
  }
};

const onCustomDateChange = () => {
  if (customStartDate.value && customEndDate.value) {
    console.log('Nouvelles dates:', customStartDate.value, 'au', customEndDate.value);
  }
};

const getSelectedPeriodText = () => {
  if (selectedPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
    const start = new Date(customStartDate.value).toLocaleDateString('fr-FR');
    const end = new Date(customEndDate.value).toLocaleDateString('fr-FR');
    return `Du ${start} au ${end}`;
  }
  
  const option = periodOptions.find(p => p.value === selectedPeriod.value);
  return option ? option.label : 'Cette année';
};

// Watcher pour surveiller les changements de période
watch([selectedPeriod, customStartDate, customEndDate], () => {
  console.log('Période changée:', selectedPeriod.value);
  console.log('Dates:', startDate.value, 'à', endDate.value);
});

onMounted(async () => {
  await loadUserProfile();
  const now = new Date();
  if (!customStartDate.value) {
    customStartDate.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  }
  if (!customEndDate.value) {
    customEndDate.value = now.toISOString().split('T')[0];
  }
});

// Fonction pour formater les montants
const formatAmount = (amount: number) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.000';
  }
  return amount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction pour obtenir la date actuelle
const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
/* Tous les styles CSS existants restent identiques */
.yellow-toolbar {
  --background: rgba(255, 214, 51, 0.8);
  --border-color: transparent;
  backdrop-filter: blur(5px);
}

.dashboard-content {
  --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.welcome-section {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin: 0;
  line-height: 1.2;
}

.greeting {
  opacity: 0.9;
}

.username {
  font-weight: 600;
  background: linear-gradient(45deg, #ffeaa7, #fab1a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 10px 0 0 0;
}

.date-info {
  text-align: right;
}

.current-date {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 500;
}

.period-filter-container {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-header {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-title i {
  color: #667eea;
  font-size: 1.1rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.period-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.period-btn {
  padding: 10px 20px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  background: white;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.period-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.period-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.custom-date-section {
  background: #f8f9ff;
  padding: 20px;
  border-radius: 15px;
  border: 1px solid #e8ecff;
}

.date-inputs {
  display: flex;
  gap: 20px;
  align-items: end;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.custom-date-input {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9rem;
  background: white;
  color: #495057;
  transition: border-color 0.3s ease;
  outline: none;
  min-width: 150px;
}

.custom-date-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.selected-period-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.period-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.period-value {
  font-size: 1rem;
  color: #2d3436;
  font-weight: 600;
}

.kpi-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
}

.kpi-card {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

.kpi-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.received-icon {
  background: linear-gradient(135deg, #00b894, #00cec9);
}

.emitted-icon {
  background: linear-gradient(135deg, #e17055, #d63031);
}

.kpi-content {
  text-align: center;
}


.kpi-label {
  font-size: 0.85rem;
  color: #636e72;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8px;
  line-height: 1;
}

.kpi-value small {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.7;
}

.kpi-trend {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.kpi-trend.positive {
  background: rgba(0, 184, 148, 0.1);
  color: #00b894;
}

.kpi-trend.negative {
  background: rgba(214, 48, 49, 0.1);
  color: #d63031;
}

.loading-dots {
  color: #ddd;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Styles de grille existants */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 25px;
  grid-auto-rows: minmax(350px, auto);
}

.grid-item {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  grid-column: span 6;
}

.grid-item.large-item {
  grid-column: span 12;
  min-height: 400px;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

.component-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.component-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.component-title i {
  color: #667eea;
  font-size: 1rem;
}

.component-content {
  padding: 25px;
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Styles toolbar existants */
.company-selector {
  color: #333;
}

.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
}

.logo-container .logo {
  height: 40px;
  width: auto;
}

.custom-select {
  color: #333;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 5px 10px;
  margin-right: 10px;
}

.add-company-btn {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: #333;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .grid-item {
    grid-column: span 4;
  }
  
  .grid-item.large-item {
    grid-column: span 8;
  }
}

@media (max-width: 992px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .grid-item,
  .grid-item.large-item {
    grid-column: span 4;
  }
  
  .period-buttons {
    justify-content: center;
  }
  
  .date-inputs {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .kpi-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .grid-item,
  .grid-item.large-item {
    grid-column: span 1;
    min-height: 300px;
  }
  
  .component-header {
    padding: 15px 20px;
  }
  
  .component-content {
    padding: 20px;
  }
  
  .period-filter-container {
    padding: 20px;
  }
  
  .period-buttons {
    gap: 8px;
  }
  
  .period-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
  
  .selected-period-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .kpi-value {
    font-size: 1.6rem;
  }
  
  .component-title {
    font-size: 1rem;
  }
  
  .period-buttons {
    gap: 6px;
  }
  
  .period-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .filter-title {
    font-size: 1.1rem;
  }
  
  .period-filter-container {
    padding: 15px;
  }
}

/* Animations supplémentaires */
.grid-item {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.grid-item:nth-child(1) { animation-delay: 0.1s; }
.grid-item:nth-child(2) { animation-delay: 0.2s; }
.grid-item:nth-child(3) { animation-delay: 0.3s; }
.grid-item:nth-child(4) { animation-delay: 0.4s; }
.grid-item:nth-child(5) { animation-delay: 0.5s; }
.grid-item:nth-child(6) { animation-delay: 0.6s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation pour le filtre de période */
.period-filter-container {
  animation: slideInDown 0.6s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation pour les boutons de période */
.period-btn {
  animation: fadeInScale 0.4s ease-out;
  animation-fill-mode: both;
}

.period-btn:nth-child(1) { animation-delay: 0.1s; }
.period-btn:nth-child(2) { animation-delay: 0.15s; }
.period-btn:nth-child(3) { animation-delay: 0.2s; }
.period-btn:nth-child(4) { animation-delay: 0.25s; }
.period-btn:nth-child(5) { animation-delay: 0.3s; }
.period-btn:nth-child(6) { animation-delay: 0.35s; }
.period-btn:nth-child(7) { animation-delay: 0.4s; }
.period-btn:nth-child(8) { animation-delay: 0.45s; }

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Effet de transition smooth pour le changement de période */
.custom-date-section {
  transition: all 0.3s ease;
  animation: expandDown 0.4s ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 200px;
    padding-top: 20px;
    padding-bottom: 20px;
  }
}

/* Styles pour les états de hover et focus améliorés */
.period-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.custom-date-input:hover {
  border-color: #adb5bd;
}

/* Indicateur de chargement pour les données filtrées */
.data-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  backdrop-filter: blur(2px);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
  </style>