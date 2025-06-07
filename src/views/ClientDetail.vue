<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="container">
        <!-- Logo et header -->
        <div class="logo-container">
          <router-link to="/clients">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </router-link>
        </div>

        <!-- Section résumé client -->
        <div class="client-summary" v-if="client">
          <div class="summary-header">
            <h2 class="summary-title">{{ client.display_name }}</h2>
            <div class="summary-item">
              <ion-icon :icon="mailOutline" class="summary-icon"></ion-icon>
              <p class="summary-text">{{ client.email || 'Non renseigné' }}</p>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <ion-icon :icon="walletOutline" class="summary-icon"></ion-icon>
              <p><strong>Solde :</strong> {{ formatCurrency(client.unpaid || 0) }}</p>
            </div>

            <div class="summary-item">
              <ion-icon :icon="cashOutline" class="summary-icon"></ion-icon>
              <p class="summary-text"><strong>Téléphone :</strong> {{ client.phone || 'Non renseigné' }}</p>
            </div>
          </div>
        </div>

        <div class="header">
          <h1 class="title">Détails du client</h1>
        </div>

        <!-- Détails du client -->
        <div class="client-details" v-if="client">
          <!-- Informations de base -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="personCircleOutline" class="card-icon"></ion-icon>
                Informations de base
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Nom complet :</strong> {{ client.display_name }}</p>
              <p><strong>Email :</strong> {{ client.email || 'Non renseigné' }}</p>
              <p><strong>Téléphone :</strong> {{ client.phone || 'Non renseigné' }}</p>
              <p><strong>Créé le :</strong> {{ formatDate(client.created_at) }}</p>
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
              <p><strong>Type :</strong> {{ client.type === 1 ? 'Professionnel' : 'Particulier' }}</p>
              <p><strong>Référence :</strong> {{ client.reference || 'Non renseigné' }}</p>
              <p><strong>Activité :</strong> {{ getActivityName(client.hashed_activity_id) }}</p>
              <p><strong>Devise :</strong> {{ getCurrencyName(client.hashed_currency_id) }}</p>
              <p><strong>Conditions de paiement :</strong> {{ getPaymentTermName(client.hashed_default_invoice_deadline_id) }}</p>
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
              <p><strong>Adresse :</strong> {{ client.billing.address || 'Non renseigné' }}</p>
              <p><strong>Gouvernorat :</strong> {{ client.billing.bill_state || 'Non renseigné' }}</p>
              <p><strong>Code postal :</strong> {{ client.billing.zip_code || 'Non renseigné' }}</p>
              <p><strong>Pays :</strong> {{ client.billing.country_title || 'Non renseigné' }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Adresse de livraison -->
          <ion-card 
            class="info-card" 
            v-if="client.delivery && (client.delivery.address || client.delivery.bill_state || client.delivery.zip_code)"
          >
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="navigateOutline" class="card-icon"></ion-icon>
                Adresse de livraison
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Adresse :</strong> {{ client.delivery.address || 'Non renseigné' }}</p>
              <p><strong>Gouvernorat :</strong> {{ client.delivery.bill_state || 'Non renseigné' }}</p>
              <p><strong>Code postal :</strong> {{ client.delivery.zip_code || 'Non renseigné' }}</p>
              <p><strong>Pays :</strong> {{ client.delivery.country_title || 'Non renseigné' }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Remarques -->
          <ion-card class="info-card" v-if="client.note">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon :icon="documentTextOutline" class="card-icon"></ion-icon>
                Remarques
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>{{ client.note }}</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Bouton actions -->
        <div class="actions" v-if="client">
          <ion-button @click="openActionPopover($event)" class="action-button" expand="block">
            <ion-icon :icon="ellipsisHorizontalOutline" class="button-icon" slot="start"></ion-icon>
            Actions
          </ion-button>
        </div>

        <!-- Popover actions -->
        <ion-popover
          :is-open="popoverOpen"
          :event="popoverEvent"
          @didDismiss="popoverOpen = false"
        >
          <ion-content>
            <ion-list>
              <ion-item button @click="BonsLivraison">
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                <ion-label> Bons de livraison</ion-label>
              </ion-item>
              <ion-item button @click="BonsSortie">
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                <ion-label> Bons de Sortie</ion-label>
              </ion-item>
              <ion-item button @click="Devis">
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                <ion-label> Devis</ion-label>
              </ion-item>
              <ion-item button @click="Modifier">
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                <ion-label> Modifier</ion-label>
              </ion-item>
              <ion-item button @click="createInvoice">
                <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                <ion-label> factures</ion-label>
              </ion-item>
              <ion-item button @click="recordPayment">
                <ion-icon :icon="cashOutline" slot="start"></ion-icon>
                <ion-label>paiements</ion-label>
              </ion-item>
              <ion-item button @click="chronologie">
                <ion-icon :icon="cashOutline" slot="start"></ion-icon>
                <ion-label>Chronologie</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonList, IonItem, 
  IonLabel, IonIcon, IonButton, IonPopover
} from '@ionic/vue';
import { 
  personCircleOutline, businessOutline, locationOutline, 
  navigateOutline, documentTextOutline, cashOutline, 
  mailOutline, walletOutline, ellipsisHorizontalOutline, 
  createOutline 
} from 'ionicons/icons';
import { useClientController } from '@/controllers/ClientController';

const route = useRoute();
const router = useRouter();
const clientId = ref<string>(route.params.id as string);
const popoverOpen = ref(false);
const popoverEvent = ref<any>(null);

const { 
  clients, 
  activities, 
  currencies, 
  paymentTerms,
  currentClient: controllerCurrentClient,
  loadClientDetails,
  loadActivities,
  loadCurrencies,
  loadPaymentTerms
} = useClientController();

const client = computed(() => controllerCurrentClient.value);

const loadData = async () => {
  try {
    await loadClientDetails(clientId.value);
    if (activities.value.length === 0) await loadActivities();
    if (currencies.value.length === 0) await loadCurrencies();
    if (paymentTerms.value.length === 0) await loadPaymentTerms();
  } catch (err: any) {
    console.error('Erreur:', err);
  }
};

onMounted(() => {
  loadData();
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'Non renseigné';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'TND',
  }).format(value);
};

const getActivityName = (id: string) => {
  if (!id) return 'Non renseigné';
  const activity = activities.value.find(a => a.hashed_id === id);
  return activity ? activity.title : 'Non renseigné';
};

const getCurrencyName = (id: string) => {
  if (!id) return 'Non renseigné';
  const currency = currencies.value.find(c => c.hashed_id === id);
  return currency ? `${currency.title} (${currency.symbol})` : 'Non renseigné';
};

const getPaymentTermName = (id: string) => {
  if (!id) return 'Non renseigné';
  const term = paymentTerms.value.find(p => p.hashed_id === id);
  return term ? `${term.title} (${term.days >= 0 ? term.days + ' jours' : 'Fin de mois'})` : 'Non renseigné';
};

const BonsLivraison = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/bonslivraison`);
};

const BonsSortie = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/bonsortie`);
};

const Devis = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/devis`);
};

const chronologie = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/timeline`);
};

const openActionPopover = (event: any) => {
  popoverEvent.value = event;
  popoverOpen.value = true;
};

const createInvoice = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/create-invoice`);
};

const recordPayment = () => {
  popoverOpen.value = false;
  router.push(`/clients/${clientId.value}/record-payment`);
};
</script>



<style scoped>
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