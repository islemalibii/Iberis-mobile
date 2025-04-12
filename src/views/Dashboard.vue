<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="logo-container">
          <a href="clients">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </a>
        </div>
        <div class="header">
          <h1 class="title">Tableau de bord</h1>
          <div class="company-selector">
            <ion-select 
              v-model="selectedCompany" 
              interface="popover" 
              placeholder="Sélectionner une entreprise"
              @ionChange="changeCompany"
            >
              <ion-select-option 
                v-for="company in userCompanies" 
                :key="company.id" 
                :value="company.id"
              >
                {{ company.name }}
              </ion-select-option>
            </ion-select>
            
            <ion-button @click="goToCreateCompany" fill="clear" class="add-company-btn">
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Ajouter une entreprise
            </ion-button>
          </div>
        </div>

        <!-- Statistiques principales -->
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-header>
              <ion-card-title class="stat-title">
                <ion-icon :icon="cashOutline" class="stat-icon"></ion-icon>
                Chiffre d'affaires
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="stat-value">250,000 TND</p>
              <p class="stat-subtext">Ce mois-ci</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-header>
              <ion-card-title class="stat-title">
                <ion-icon :icon="alertCircleOutline" class="stat-icon"></ion-icon>
                Impayés
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="stat-value">45,000 TND</p>
              <p class="stat-subtext">En attente</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Graphiques -->
        <div class="charts-grid">
          <ion-card class="chart-card">
            <ion-card-header>
              <ion-card-title class="chart-title">
                Chiffre d'affaires mensuel
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <canvas ref="barChart"></canvas>
            </ion-card-content>
          </ion-card>

          <ion-card class="chart-card">
            <ion-card-header>
              <ion-card-title class="chart-title">
                Répartition des impayés
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <canvas ref="pieChart"></canvas>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonButton
} from "@ionic/vue";
import { cashOutline, alertCircleOutline, addOutline } from "ionicons/icons";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

export default {
  components: {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonButton
  },
  setup() {
    const router = useRouter();
    const barChart = ref(null);
    const pieChart = ref(null);
    const selectedCompany = ref(null);
    
    const userCompanies = ref([
      { id: 1, name: "Entreprise A" },
      { id: 2, name: "Entreprise B" },
    ]);

    const changeCompany = (companyId) => {
      console.log("Entreprise sélectionnée:", companyId);
      // Charger les données de la nouvelle entreprise
    };

    const goToCreateCompany = () => {
      router.push('/create-company');
    };

    // Données pour les graphiques
    const barChartData = {
      labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil"],
      datasets: [{
        label: "Chiffre d'affaires (TND)",
        data: [50000, 70000, 90000, 60000, 80000, 100000, 120000],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      }],
    };

    const pieChartData = {
      labels: ["Impayés clients", "Retards de paiement", "Litiges"],
      datasets: [{
        data: [30000, 10000, 5000],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      }],
    };

    onMounted(() => {
      new Chart(barChart.value, {
        type: "bar",
        data: barChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });

      new Chart(pieChart.value, {
        type: "pie",
        data: pieChartData,
        options: { responsive: true, maintainAspectRatio: false },
      });
    });

    return {
      cashOutline,
      alertCircleOutline,
      addOutline,
      barChart,
      pieChart,
      selectedCompany,
      userCompanies,
      changeCompany,
      goToCreateCompany
    };
  },
};
</script>


  
  <style scoped>

  ion-content {
    --background: #f8f9fa; /* Fond légèrement gris */
  }
  
  .container {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* En-tête */
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #d9c94f; /* Couleur sombre */
  }
  
  /* Grille des statistiques */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Ombre légère */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); /* Ombre plus prononcée */
  }
  
  .stat-title {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #47463d; /* Couleur sombre */
  }
  
  .stat-icon {
    font-size: 1.5rem;
    color: #d9c94f; /* Couleur jaune */
    margin-right: 8px;
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #47463d; /* Couleur sombre */
    margin: 8px 0;
  }
  
  .stat-subtext {
    font-size: 1rem;
    color: #636e72; /* Couleur grise */
    margin: 0;
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  
  
  .chart-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Ombre légère */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .add-company-btn {
  --color: #d9c94f; /* Couleur principale jaune Iberis */
  --background: transparent;
  --background-hover: rgba(217, 201, 79, 0.08);
  --background-activated: rgba(217, 201, 79, 0.16);
  --border-radius: 8px;
  --border-color: #d9c94f;
  --border-style: solid;
  --border-width: 1px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --transition: all 0.3s ease;
  --box-shadow: none;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  margin: 8px 0;
}
  .chart-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); /* Ombre plus prononcée */
  }
  
  .chart-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #47463d; /* Couleur sombre */
  }
  
  canvas {
    width: 100% !important;
    height: 300px !important;
  }
  </style>