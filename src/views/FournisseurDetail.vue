<template>
    <ion-page>
      <ion-content class="ion-padding">
        <div class="container">
          <!-- Logo de l'application -->
          <div class="logo-container">
            <router-link to="/fournisseur">
              <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
            </router-link>
          </div>
  
          <!-- Section des détails du fournisseur en haut -->
          <div class="provider-summary" v-if="provider">
            <div class="summary-header">
              <h2 class="summary-title">{{ provider.display_name }}</h2>
              <div class="summary-item">
                <ion-icon :icon="mailOutline" class="summary-icon"></ion-icon>
                <p class="summary-text">{{ provider.email || 'Non renseigné' }}</p>
              </div>
            </div>
  
            <div class="summary-grid">
              <div class="summary-item">
                <ion-icon :icon="callOutline" class="summary-icon"></ion-icon>
                <p><strong>Téléphone :</strong> {{ provider.phone || 'Non renseigné' }}</p>
              </div>
  
              <div class="summary-item">
                <ion-icon :icon="businessOutline" class="summary-icon"></ion-icon>
                <p class="summary-text"><strong>Entreprise :</strong> {{ provider.organisation || 'Non renseigné' }}</p>
              </div>
            </div>
          </div>
  
          <div class="header">
            <h1 class="title">Détails du fournisseur</h1>
          </div>
  
          <!-- Détails du fournisseur -->
          <div class="provider-details" v-if="provider">
            <!-- Informations de base -->
            <ion-card class="info-card">
              <ion-card-header>
                <ion-card-title class="card-title">
                  <ion-icon :icon="personCircleOutline" class="card-icon"></ion-icon>
                  Informations de base
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Nom complet :</strong> {{ provider.display_name }}</p>
                <p><strong>Titre :</strong> {{ formatTitle(provider.title) }}</p>
                <p><strong>Prénom :</strong> {{ provider.first_name || 'Non renseigné' }}</p>
                <p><strong>Nom :</strong> {{ provider.last_name || 'Non renseigné' }}</p>
                <p><strong>Email :</strong> {{ provider.email || 'Non renseigné' }}</p>
                <p><strong>Téléphone :</strong> {{ provider.phone || 'Non renseigné' }}</p>
                <p><strong>Créé le :</strong> {{ formatDate(provider.created_at) }}</p>
              </ion-card-content>
            </ion-card>
  
            <!-- Informations professionnelles -->
            <ion-card class="info-card">
              <ion-card-header>
                <ion-card-title class="card-title">
                  <ion-icon :icon="briefcaseOutline" class="card-icon"></ion-icon>
                  Informations professionnelles
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Type :</strong> {{ provider.type === ProviderType.PROFESSIONAL ? 'Professionnel' : 'Particulier' }}</p>
                <p><strong>Entreprise :</strong> {{ provider.organisation || 'Non renseigné' }}</p>
                <p><strong>Référence :</strong> {{ provider.reference || 'Non renseigné' }}</p>
                <p><strong>Activité :</strong> {{ getActivityName(provider.hashed_activity_id) }}</p>
                <p><strong>Devise :</strong> {{ getCurrencyName(provider.hashed_currency_id) }}</p>
                <p><strong>Conditions de paiement :</strong> {{ getPaymentTermName(provider.hashed_default_invoice_deadline_id) }}</p>
                <p><strong>Identifiant fiscal :</strong> {{ provider.fiscal_id || 'Non renseigné' }}</p>
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
                <p><strong>Adresse :</strong> {{ provider.billing.address || 'Non renseigné' }}</p>
                <p><strong>Gouvernorat :</strong> {{ provider.billing.bill_state || 'Non renseigné' }}</p>
                <p><strong>Code postal :</strong> {{ provider.billing.zip_code || 'Non renseigné' }}</p>
                <p><strong>Pays :</strong> {{ provider.billing.country_title || 'Non renseigné' }}</p>
              </ion-card-content>
            </ion-card>
  
            <!-- Adresse de livraison -->
            <ion-card class="info-card" v-if="provider.delivery && typeof provider.delivery === 'object'">
              <ion-card-header>
                <ion-card-title class="card-title">
                  <ion-icon :icon="navigateOutline" class="card-icon"></ion-icon>
                  Adresse de livraison
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><strong>Adresse :</strong> {{ provider.delivery.address || 'Non renseigné' }}</p>
                <p><strong>Gouvernorat :</strong> {{ provider.delivery.bill_state || 'Non renseigné' }}</p>
                <p><strong>Code postal :</strong> {{ provider.delivery.zip_code || 'Non renseigné' }}</p>
                <p><strong>Pays :</strong> {{ provider.delivery.country_title || 'Non renseigné' }}</p>
              </ion-card-content>
            </ion-card>
  
            <!-- Remarques -->
            <ion-card class="info-card" v-if="provider.note">
              <ion-card-header>
                <ion-card-title class="card-title">
                  <ion-icon :icon="documentTextOutline" class="card-icon"></ion-icon>
                  Remarques
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>{{ provider.note }}</p>
              </ion-card-content>
            </ion-card>
          </div>
  
          <!-- Bouton pour ouvrir le menu d'actions -->
          <div class="actions" v-if="provider">
            <ion-button @click="openActionPopover($event)" class="action-button" expand="block">
              <ion-icon :icon="ellipsisHorizontalOutline" class="button-icon" slot="start"></ion-icon>
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
                <ion-item button @click="Receipt">
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  <ion-label> Bons de Reception</ion-label>
                </ion-item>
                <ion-item button @click="Order">
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  <ion-label> Bons de Commande</ion-label>
                </ion-item>
                <ion-item button @click="service">
                  <ion-icon :icon="createOutline" slot="start"></ion-icon>
                  <ion-label> Services</ion-label>
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
    personCircleOutline, briefcaseOutline, locationOutline, 
    navigateOutline, documentTextOutline, cashOutline, 
    mailOutline, callOutline, ellipsisHorizontalOutline, 
    createOutline, timeOutline, businessOutline
  } from 'ionicons/icons';
  import { useProviderController } from '@/controllers/ProviderController';
  import { ProviderType, ProviderTitle } from './../models/providerModel';
  
  const route = useRoute();
  const router = useRouter();
  const providerId = ref<string>(route.params.id as string);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const popoverOpen = ref(false);
  const popoverEvent = ref<any>(null);
  
  const { 
    providers, 
    activities, 
    currencies, 
    paymentTerms,
    providerDetails,
    fetchProviderDetails
  } = useProviderController();
  
  const provider = computed(() => {
    return providerDetails.value || providers.value.find(p => p.hashed_id === providerId.value);
  });
  
  const loadData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      if (!provider.value) {
        await fetchProviderDetails(providerId.value);
      }
      
      if (!provider.value) {
        error.value = 'Fournisseur non trouvé';
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des données';
      console.error('Erreur:', err);
    } finally {
      isLoading.value = false;
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
  
  const formatTitle = (title: ProviderTitle) => {
    switch(title) {
      case ProviderTitle.MR: return 'M.';
      case ProviderTitle.MLLE: return 'Mlle';
      case ProviderTitle.MRS: return 'Mme';
      default: return 'Non renseigné';
    }
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
  
  const openActionPopover = (event: any) => {
    popoverEvent.value = event;
    popoverOpen.value = true;
  };
  
  const Order = () => {
    popoverOpen.value = false;
    router.push(`/provider/${providerId.value}/order`);
  };
  const editProvider = () => {
    popoverOpen.value = false;
    router.push(`/edit-fournisseur/${providerId.value}`);
  };
  
  const viewDocuments = () => {
    popoverOpen.value = false;
    router.push(`/fournisseur/${providerId.value}/documents`);
  };
  
  const viewPayments = () => {
    popoverOpen.value = false;
    router.push(`/fournisseur/${providerId.value}/paiements`);
  };
  const service = () => {
    popoverOpen.value = false;
    router.push(`/provider/${providerId.value}/service`);
  };
  const Receipt = () => {
    popoverOpen.value = false;
    router.push(`/provider/${providerId.value}/reciept`);
  };
  const chronologie = () => {
    popoverOpen.value = false;
    router.push(`/fournisseur/${providerId.value}/timeline
  `);
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
  
  /* Section des détails du fournisseur en haut */
  .provider-summary {
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
    grid-template-columns: repeat(2, 1fr);
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
    font-size: 1.5rem;
    color: #2f2f26;
    margin-right: 8px;
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