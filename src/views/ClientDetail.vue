<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <!-- Logo de l'application -->
        <div class="logo-container">
          <a href="clients">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </a>
        </div>

        <!-- Section des détails du client en haut -->
        <div class="client-summary">
          <div class="summary-header">
            <h2 class="summary-title">A company</h2>
            <p class="summary-subtitle">ahmed</p>
            <div class="summary-item">
              <ion-icon :icon="mailOutline" class="summary-icon"></ion-icon>
              <p class="summary-text">chattaoui@hotmail.com</p>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <ion-icon :icon="walletOutline" class="summary-icon"></ion-icon>
              <p class="summary-text"><strong>Solde :</strong> 5.475,00 €</p>
            </div>

            <div class="summary-item">
              <ion-icon :icon="cashOutline" class="summary-icon"></ion-icon>
              <p class="summary-text"><strong>Paiements reçus :</strong> 240.000 TND</p>
            </div>

            <div class="summary-item">
              <ion-icon :icon="documentTextOutline" class="summary-icon"></ion-icon>
              <p class="summary-text"><strong>Factures :</strong> 5,106.000 TND</p>
            </div>

            <div class="summary-item">
              <ion-icon :icon="receiptOutline" class="summary-icon"></ion-icon>
              <p class="summary-text"><strong>Factures d'avoir :</strong> 0.000 TND</p>
            </div>
          </div>
        </div>

        <div class="header">
          <h1 class="title">Détails du client</h1>
        </div>

        <!-- Détails du client -->
        <div class="client-details">
          <!-- Informations de base -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="personCircleOutline" class="card-icon"></ion-icon>
                Informations de base
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Nom complet :</strong> {{ client.title }} {{ client.firstName }} {{ client.lastName }}</p>
              <p><strong>Entreprise :</strong> {{ client.company }}</p>
              <p><strong>Email :</strong> {{ client.email }}</p>
              <p><strong>Téléphone :</strong> {{ client.phone }}</p>
              <p><strong>Site web :</strong> {{ client.website }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Informations professionnelles -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="businessOutline" class="card-icon"></ion-icon>
                Informations professionnelles
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Type :</strong> {{ client.professionalInfo.type }}</p>
              <p><strong>Grille tarifaire :</strong> {{ client.professionalInfo.priceGrid }}</p>
              <p><strong>Numéro d'identification fiscale :</strong> {{ client.professionalInfo.taxIdentificationNumber }}</p>
              <p><strong>Activité :</strong> {{ client.professionalInfo.activity }}</p>
              <p><strong>Agence ou société commerciale :</strong> {{ client.professionalInfo.agencyOrCommercialCompany }}</p>
              <p><strong>Devise :</strong> {{ client.professionalInfo.currency }}</p>
              <p><strong>Conditions de paiement :</strong> {{ client.professionalInfo.paymentTerms }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Adresse de facturation -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="locationOutline" class="card-icon"></ion-icon>
                Adresse de facturation
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Adresse :</strong> {{ client.billingAddress.address }}</p>
              <p><strong>Gouvernorat :</strong> {{ client.billingAddress.governorate }}</p>
              <p><strong>Code postal :</strong> {{ client.billingAddress.postalCode }}</p>
              <p><strong>Pays :</strong> {{ client.billingAddress.country }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Adresse de livraison -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="navigateOutline" class="card-icon"></ion-icon>
                Adresse de livraison
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Adresse :</strong> {{ client.deliveryAddress.address }}</p>
              <p><strong>Gouvernorat :</strong> {{ client.deliveryAddress.governorate }}</p>
              <p><strong>Code postal :</strong> {{ client.deliveryAddress.postalCode }}</p>
              <p><strong>Pays :</strong> {{ client.deliveryAddress.country }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Remarques -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="documentTextOutline" class="card-icon"></ion-icon>
                Remarques
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>{{ client.remarks }}</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Bouton pour ouvrir le menu d'actions -->
        <div class="actions">
          <ion-button @click="openActionPopover($event)" class="action-button" expand="block">
            <ion-icon :icon="ellipsisHorizontalOutline" class="button-icon"></ion-icon>
            Actions
          </ion-button>
        </div>

        <!-- Popover avec les options -->
        <ion-popover
          :is-open="popoverOpen"
          :event="popoverEvent"
          @didDismiss="popoverOpen = false"
        >
          <ion-content>
            <ion-list>
              <ion-item button @click="viewClientTransactions(client.id)">
                <ion-icon :icon="listOutline" slot="start"></ion-icon>
                <ion-label>Voir les transactions</ion-label>
              </ion-item>
              <ion-item button @click="createInvoice">
                <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                <ion-label>Créer une facture</ion-label>
              </ion-item>
              <ion-item button @click="recordPayment">
                <ion-icon :icon="cashOutline" slot="start"></ion-icon>
                <ion-label>Enregistrer un paiement</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
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
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel
} from "@ionic/vue";
import {
  personCircleOutline,
  businessOutline,
  locationOutline,
  navigateOutline,
  documentTextOutline,
  cashOutline,
  mailOutline,
  walletOutline,
  receiptOutline,
  ellipsisHorizontalOutline,
  listOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";

export default {
  components: {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonPopover,
    IonList,
    IonItem,
    IonLabel
  },
  data() {
    return {
      client: {
        id: 1,
        title: "M.",
        firstName: "John",
        lastName: "Doe",
        company: "Iberis Solutions",
        email: "john.doe@example.com",
        phone: "123456789",
        website: "www.iberis.com",
        professionalInfo: {
          type: "Entreprise",
          priceGrid: "Standard",
          taxIdentificationNumber: "123456789",
          activity: "Informatique",
          agencyOrCommercialCompany: "Iberis SARL",
          currency: "Dinar(s) tunisien",
          paymentTerms: "Payable à réception",
        },
        remarks: "Client fidèle depuis 5 ans.",
        billingAddress: {
          address: "123 Rue de l'Innovation",
          governorate: "Tunis",
          postalCode: "1000",
          country: "Tunisie",
        },
        deliveryAddress: {
          address: "456 Avenue de la Technologie",
          governorate: "Ariana",
          postalCode: "2000",
          country: "Tunisie",
        },
      },
      popoverOpen: false,
      popoverEvent: null,
    };
  },
  setup() {
    const router = useRouter();

    const viewClientTransactions = (clientId) => {
      router.push(`/client/${clientId}/transactions`);
    };

    return {
      personCircleOutline,
      businessOutline,
      locationOutline,
      navigateOutline,
      documentTextOutline,
      cashOutline,
      mailOutline,
      walletOutline,
      receiptOutline,
      ellipsisHorizontalOutline,
      listOutline,
      viewClientTransactions,
    };
  },
  methods: {
    openActionPopover(event) {
      this.popoverEvent = event;
      this.popoverOpen = true;
    },
    createInvoice() {
      this.popoverOpen = false;
      // Ajoutez ici la navigation vers la création de facture
      console.log("Créer une facture pour le client", this.client.id);
      // this.$router.push(`/client/${this.client.id}/create-invoice`);
    },
    recordPayment() {
      this.popoverOpen = false;
      // Ajoutez ici la navigation vers l'enregistrement de paiement
      console.log("Enregistrer un paiement pour le client", this.client.id);
      // this.$router.push(`/client/${this.client.id}/record-payment`);
    },
  },
};
</script>

<style scoped>
/* Styles globaux */
ion-content {
  --background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* Section des détails du client en haut */
.client-summary {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(210, 180, 0, 0.2);
  margin-bottom: 24px;
}

.summary-header {
  text-align: center;
  margin-bottom: 24px;
}

.summary-title {
  font-size: 1.9rem;
  font-weight: bold;
  color: #47463d;
  margin: 0;
}

.summary-subtitle {
  font-size: 1.5rem;
  color: #636e72;
  margin: 4px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 2fr);
  gap: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background-color: #d2c057;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(210, 180, 0, 0.3);
}

.summary-icon {
  font-size: 2rem;
  color: #2f2f26;
  margin-right: 9px;
}

.summary-text {
  font-size: 1rem;
  color: #47463d;
  margin: 0;
}

/* En-tête */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 1.9rem;
  font-weight: bold;
  color: #dac136;
  margin-left: 50px;
}

/* Cartes d'informations */
.info-card {
  background-color: #f0edc3;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(210, 180, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(210, 180, 0, 0.3);
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #535247;
}

.card-icon {
  margin-right: 8px;
  font-size: 1.5rem;
  color: #d8c639;
}

.info-card p {
  margin: 8px 0;
  color: #5a5e60;
}

/* Bouton d'action */
.actions {
  margin-top: 24px;
  padding: 0 16px;
}

.action-button {
  --background: #d9c94f;
  --color: #47463d;
  font-weight: 550;
  border-radius: 20px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  width: 100%;
}

.action-button:hover {
  --background: #cab40f;
  transform: scale(1.02);
}

.button-icon {
  margin-right: 8px;
}

ion-popover {
  --width: 250px;
}

ion-popover ion-item {
  --padding-start: 12px;
  --min-height: 50px;
}

ion-popover ion-icon {
  margin-right: 12px;
  color: var(--ion-color-primary);
  font-size: 1.2rem;
}

ion-popover ion-label {
  font-size: 0.95rem;
}
</style>