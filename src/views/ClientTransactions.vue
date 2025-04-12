<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <!-- Logo de l'application -->
        <div class="logo-container">
          <a href="clients"> <!-- Remplacez "/" par l'URL de destination souhaitée -->
    <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
  </a>        </div>

        <div class="content-wrapper">
          <h1 class="heading">Historique des transactions</h1>

          <!-- Indicateur de chargement -->
          <div v-if="isLoading" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Chargement en cours...</p>
          </div>

          <!-- Liste des transactions -->
          <ion-list v-else-if="transactions.length > 0" class="transaction-list">
            <ion-item
              v-for="transaction in transactions"
              :key="transaction.id"
              class="transaction-item"
            >
              <ion-label>
                <h2>{{ transaction.date }}</h2>
                <p>{{ transaction.description }}</p>
                <p><strong>Montant :</strong> {{ transaction.amount }} €</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Message si aucune transaction -->
          <p v-else class="no-transactions">Aucune transaction trouvée pour ce client.</p>

          <!-- Bouton de retour -->
          <ion-button @click="goBack" class="back-button">
            <ion-icon :icon="arrowBackOutline" class="button-icon"></ion-icon>
            Retour
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonIcon,
} from "@ionic/vue";
import { arrowBackOutline } from "ionicons/icons";
import axios from "axios";

export default {
  components: {
    IonPage,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonIcon,
  },
  data() {
    return {
      transactions: [], // Historique des transactions
      isLoading: true, // État de chargement
      error: null, // Message d'erreur
    };
  },
  async mounted() {
    await this.fetchTransactions(); // Récupérer l'historique des transactions
  },
  methods: {
    // Récupérer l'historique des transactions du client
    async fetchTransactions() {
      try {
        const clientId = this.$route.params.id;
        const response = await axios.get(`/api/clients/${clientId}/transactions`);
        this.transactions = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des transactions:", error);
        this.error = "Une erreur s'est produite lors du chargement des transactions.";
      } finally {
        this.isLoading = false;
      }
    },
    // Retour à la liste des clients
    goBack() {
      this.$router.push("/clients");
    },
  },
};
</script>

<style scoped>
/* Styles globaux */
ion-content {
  --background: linear-gradient(135deg, #f8f9fa, #e9ecef); /* Fond dégradé */
}

.container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* Logo */
.logo-container {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  height: 160px;
  width: 260px;
}

/* Contenu principal */
.content-wrapper {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

/* Titre */
.heading {
  font-size: 2rem;
  line-height: 1.8;
  color: #dac136; /* Couleur jaune pour le titre */
  margin-bottom: 1.5rem;
  font-weight: 550;
}

/* Indicateur de chargement */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.loading p {
  margin-top: 1rem;
  color: #636e72; /* Couleur grise */
}

/* Liste des transactions */
.transaction-list {
  background: transparent;
  margin-bottom: 1.8rem;
}

.transaction-item {
  --background: #ffffff; /* Fond blanc */
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(210, 180, 0, 0.2); /* Ombre jaune */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transaction-item:hover {
  transform: translateY(-5px); /* Effet de levée au survol */
  box-shadow: 0 8px 16px rgba(210, 180, 0, 0.3); /* Ombre jaune plus prononcée */
}

ion-label h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #47463d; /* Couleur sombre */
}

ion-label p {
  color: #636e72; /* Couleur grise */
  font-size: 0.9rem;
  margin: 4px 0;
}

/* Message si aucune transaction */
.no-transactions {
  color: #636e72; /* Couleur grise */
  font-style: italic;
  margin-top: 1rem;
}

/* Bouton de retour */
.back-button {
  --background: #d9c94f; /* Couleur jaune */
  --color: #47463d; /* Texte sombre */
  font-weight: 550;
  border-radius: 20px;
  margin-top: 2rem;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.back-button:hover {
  --background: #cab40f; /* Jaune plus foncé au survol */
  transform: scale(1.05); /* Effet de zoom au survol */
}

.button-icon {
  margin-right: 8px;
}
</style>