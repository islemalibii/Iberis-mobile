<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="logo-container">
          <a href="/clients">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </a>
        </div>

        <div class="content-wrapper">
          <h1 class="heading">Modifier un client</h1>

          <!-- Chargement -->
          <div v-if="isLoadingDetails" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            Chargement des données...
          </div>

          <!-- Erreur de chargement -->
          <div v-else-if="error" class="error-message">
            <ion-icon :icon="warning" class="error-icon"></ion-icon>
            {{ error }}
            <ion-button @click="loadClientData" class="retry-button">Réessayer</ion-button>
          </div>

          <!-- Formulaire -->
          <form v-else-if="currentClient" @submit.prevent="saveChanges">
            <!-- Informations générales -->
            <ion-accordion-group>
              <ion-accordion value="generalInfo">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="person" slot="start"></ion-icon>
                  <ion-label>Informations générales</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Titre (*)</ion-label>
                      <ion-select 
                        v-model="formData.title" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="1">Monsieur</ion-select-option>
                        <ion-select-option :value="2">Mademoiselle</ion-select-option>
                        <ion-select-option :value="3">Madame</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Prénom (*)</ion-label>
                      <ion-input v-model="formData.first_name" required></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Nom de famille</ion-label>
                      <ion-input v-model="formData.last_name"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Entreprise</ion-label>
                      <ion-input v-model="formData.organisation"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Nom affiché (*)</ion-label>
                      <ion-select 
                        v-model="formData.display_name" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="DisplayNameType.COMPANY">
                          {{ formData.organisation || 'Entreprise' }}
                        </ion-select-option>
                        <ion-select-option :value="DisplayNameType.FIRSTNAME_LASTNAME">
                          {{ `${formData.first_name || 'Prénom'} ${formData.last_name || ''}`.trim() }}
                        </ion-select-option>
                        <ion-select-option :value="DisplayNameType.LASTNAME_FIRSTNAME">
                          {{ `${formData.last_name || ''}, ${formData.first_name || 'Prénom'}`.replace(/^,\s*/, '').replace(/,\s*$/, '') }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Email</ion-label>
                      <ion-input v-model="formData.email" type="email"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Téléphone</ion-label>
                      <ion-input v-model="formData.phone" type="tel"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Site web</ion-label>
                      <ion-input v-model="formData.website" type="url"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Référence</ion-label>
                      <ion-input v-model="formData.reference"></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Informations professionnelles -->
            <ion-accordion-group>
              <ion-accordion value="professionalInfo">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="briefcase" slot="start"></ion-icon>
                  <ion-label>Informations professionnelles</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Type (*)</ion-label>
                      <ion-select 
                        v-model="formData.type" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="ClientType.PROFESSIONAL">Professionnel</ion-select-option>
                        <ion-select-option :value="ClientType.INDIVIDUAL">Particulier</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Activité (*)</ion-label>
                      <ion-select 
                        v-model="formData.hashed_activity_id" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option 
                          v-for="activity in activities" 
                          :key="activity.hashed_id" 
                          :value="activity.hashed_id">
                          {{ activity.title }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Devise (*)</ion-label>
                      <ion-select 
                        v-model="formData.hashed_currency_id" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option 
                          v-for="currency in currencies" 
                          :key="currency.hashed_id" 
                          :value="currency.hashed_id">
                          {{ currency.title }} ({{ currency.symbol }})
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Conditions de paiement</ion-label>
                      <ion-select 
                        v-model="formData.hashed_default_invoice_deadline_id" 
                        interface="action-sheet"
                      >
                        <ion-select-option :value="null">Aucune</ion-select-option>
                        <ion-select-option 
                          v-for="term in paymentTerms" 
                          :key="term.hashed_id" 
                          :value="term.hashed_id">
                          {{ term.title }} ({{ term.days }} jours)
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Adresse de facturation -->
            <ion-accordion-group>
              <ion-accordion value="billingAddress">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="home" slot="start"></ion-icon>
                  <ion-label>Adresse de facturation</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="formData.billing.address"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="formData.billing.bill_state"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="formData.billing.zip_code"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Adresse de livraison -->
            <ion-accordion-group>
              <ion-accordion value="deliveryAddress">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="location" slot="start"></ion-icon>
                  <ion-label>Adresse de livraison</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="formData.delivery.address"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="formData.delivery.bill_state"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="formData.delivery.zip_code"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Remarques -->
            <ion-accordion-group>
              <ion-accordion value="remarks">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="documentText" slot="start"></ion-icon>
                  <ion-label>Remarques</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Notes</ion-label>
                      <ion-textarea v-model="formData.note" rows="3"></ion-textarea>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Bouton de soumission -->
            <ion-button 
              @click="saveChanges"
              type="button" 
              expand="block" 
              class="submit-button"
              :disabled="isLoadingUpdate"
            >
              <template v-if="isLoadingUpdate">
                <ion-spinner name="crescent" class="mr-2"></ion-spinner>
                Mise à jour...
              </template>
              <template v-else>
                <ion-icon :icon="saveOutline" class="mr-2"></ion-icon>
                Sauvegarder
              </template>
            </ion-button>
          </form>
        </div>

        <!-- Bouton de retour -->
        <ion-button 
          fill="clear" 
          @click="goBack" 
          class="back-button"
          :disabled="isLoadingUpdate"
        >
          <ion-icon :icon="arrowBack"></ion-icon>
          Retour
        </ion-button>
      </div>

      <!-- Toasts -->
      <ion-toast
        :is-open="showSuccessToast"
        message="Client modifié avec succès"
        duration="2000"
        color="success"
        @didDismiss="showSuccessToast = false">
      </ion-toast>

      <ion-toast
        :is-open="!!updateError"
        :message="updateError"
        duration="3000"
        color="danger"
        @didDismiss="updateError = ''">
      </ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonList, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonTextarea, IonSpinner, IonToast, 
  IonIcon, IonAccordion, IonAccordionGroup, IonButton
} from '@ionic/vue';
import { 
  person, briefcase, documentText, home, location, 
  arrowBack, warning, saveOutline
} from 'ionicons/icons';
import { useClientController } from '@/controllers/ClientController';
import { ClientTitle, ClientType, DisplayNameType ,parseAddress} from '@/models/ClientModel';

const route = useRoute();
const router = useRouter();
const clientId = route.params.id as string;

const {
  currentClient,
  activities,
  currencies,
  paymentTerms,
  isLoadingDetails,
  isLoadingUpdate,
  error,
  updateError,
  loadClientDetails,
  updateExistingClient,
  loadActivities,
  loadCurrencies,
  getDisplayNameType,
  loadPaymentTerms
} = useClientController();

const formData = ref({
  title: ClientTitle.MR,
  first_name: '',
  last_name: '',
  organisation: '',
  email: '',
  phone: '',
  website: '',
  type: ClientType.PROFESSIONAL,
  display_name: DisplayNameType.FIRSTNAME_LASTNAME,
  reference: '',
  hashed_activity_id: '',
  hashed_currency_id: '',
  hashed_default_invoice_deadline_id: '',
  hashed_default_items_price_list_id: '',
  billing: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: 'TN'
  },
  delivery: {
    address: '',
    bill_state: '',
    zip_code: '',
    country_id: 'TN'
  },
  note: ''
});

const showSuccessToast = ref(false);

const loadClientData = async () => {
  try {
    await loadClientDetails(clientId);
    if (activities.value.length === 0) await loadActivities();
    if (currencies.value.length === 0) await loadCurrencies();
    if (paymentTerms.value.length === 0) await loadPaymentTerms();
  } catch (err) {
    console.error('Erreur lors du chargement:', err);
    error.value = "Échec du chargement des données";
  }
};


const saveChanges = async () => {
  try {
    console.log('Données avant envoi:', JSON.stringify(formData.value, null, 2));
    
    await updateExistingClient(clientId, formData.value);
    
    showSuccessToast.value = true;
    setTimeout(() => {
      router.push('/clients');
    }, 2000);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
  }
};

const goBack = () => {
  if (!isLoadingUpdate.value) {
    router.push('/clients');
  }
};

onMounted(() => {
  loadClientData();
});

watch(currentClient, (newVal) => {
  if (newVal) {
    const billing = parseAddress(newVal.billing);
    const delivery = parseAddress(newVal.delivery);

    formData.value = {
      title: newVal.title,
      first_name: newVal.first_name,
      last_name: newVal.last_name,
      email: newVal.email || '',
      phone: newVal.phone || '',
      website: newVal.website || '',
      type: newVal.type,
      organisation: newVal.organisation || '',
      display_name: getDisplayNameType(newVal),
      reference: newVal.reference || '',
      hashed_activity_id: newVal.hashed_activity_id || '',
      hashed_currency_id: newVal.hashed_currency_id || '',
      hashed_default_invoice_deadline_id: newVal.hashed_default_invoice_deadline_id || '',
      hashed_default_items_price_list_id: newVal.hashed_default_items_price_list_id || 'RNmlK',
      billing: {
        address: billing.address || '',
        bill_state: billing.bill_state || '',
        zip_code: billing.zip_code || '',
        country_id: billing.country_id || 'TN'
      },
      delivery: {
        address: delivery.address || '',
        bill_state: delivery.bill_state || '',
        zip_code: delivery.zip_code || '',
        country_id: delivery.country_id || 'TN'
      },
      note: newVal.note || ''
    };

    console.log('Données du client chargées:', formData.value);
  }
}, { immediate: true });


</script>




<style scoped>
ion-content {
  --background: #ffffff;
}

.container {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.logo-container {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  height: 160px;
  width: 260px;
}

.content-wrapper {
  max-width: 800px;
  width: 100%;
  text-align: center;
  color: #000000;
}

.back-button {
  --color: #000000;
  margin-bottom: 20px;
}

.heading {
  font-size: 2rem;
  line-height: 1.8;
  color: #dac136;
  margin-bottom: 1.5rem;
  font-weight: 550;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  color: #000000;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  color: #d32f2f;
}

.error-icon {
  font-size: 48px;
}

.retry-button {
  --background: #f0d952;
  --color: #000000;
  margin-top: 16px;
}

form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

ion-accordion-group {
  margin-bottom: 16px;
  border-radius: 13px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

ion-accordion {
  --background: #e4e7ca;
  --border-radius: 12px;
}

.accordion-header {
  --background: #ffffff;
  --color: #000000;
  --border-radius: 12px;
  margin-bottom: -2px;
  font-family: 'Courier New', Courier, monospace;
}

.accordion-header ion-icon {
  color: #000000;
}

.accordion-header:hover {
  --background: #edc84e;
}

.accordion-content {
  padding: 16px;
  background: #ffffff;
  border-radius: 0 0 12px 12px;
}

ion-list {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
}

ion-item {
  --background: #ffffff;
  --color: #000000;
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

ion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.submit-button {
  --background: #f0d952;
  --color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 680;
  margin-top: 105px;
  max-width: 150px;
  margin-left: auto;
  margin-right: auto;
  --border-radius: 12px;
}

.submit-button:hover {
  --background: #e3cd53;
  transform: scale(1.05);
}

.mr-2 {
  margin-right: 8px;
}
</style>