<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="logo-container">
          <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" @click="goBack" />
        </div>

        <div class="content-wrapper">
          <h1 class="heading">Nouveau Client</h1>

          <form @submit.prevent="submitClient">
            <!-- 1. Informations générales -->
            <ion-accordion-group>
              <ion-accordion value="generalInfo" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="person" slot="start"></ion-icon>
                  <ion-label>1. Informations générales</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <!-- Titre (Mr/Mlle/Mme) -->
                    <ion-item>
                      <ion-label position="stacked">Titre*</ion-label>
                      <ion-select v-model="clientForm.title" interface="popover" required>
                        <ion-select-option value="1">Mr.</ion-select-option>
                        <ion-select-option value="2">Mlle.</ion-select-option>
                        <ion-select-option value="3">Mme.</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Prénom (requis) -->
                    <ion-item>
                      <ion-label position="stacked">Prénom*</ion-label>
                      <ion-input v-model="clientForm.first_name" required></ion-input>
                    </ion-item>

                    <!-- Nom de famille -->
                    <ion-item>
                      <ion-label position="stacked">Nom de famille</ion-label>
                      <ion-input v-model="clientForm.last_name"></ion-input>
                    </ion-item>

                    <!-- Entreprise -->
                 <ion-item>
    <ion-label position="stacked">
      Entreprise
      <span v-if="clientForm.display_name === DisplayNameType.COMPANY">*</span>
    </ion-label>
    <ion-input 
      v-model="clientForm.organisation" 
      :required="clientForm.display_name === DisplayNameType.COMPANY"
    ></ion-input>
  </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Nom affiché (*)</ion-label>
                      <ion-select 
                        v-model="clientForm.display_name" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="DisplayNameType.COMPANY">
                          {{ clientForm.organisation || 'Entreprise' }}
                        </ion-select-option>
                        <ion-select-option :value="DisplayNameType.FIRSTNAME_LASTNAME">
                          {{ `${clientForm.first_name || 'Prénom'} ${clientForm.last_name || ''}`.trim() }}
                        </ion-select-option>
                        <ion-select-option :value="DisplayNameType.LASTNAME_FIRSTNAME">
                          {{ `${clientForm.last_name || ''}, ${clientForm.first_name || 'Prénom'}`.replace(/^,\s*/, '').replace(/,\s*$/, '') }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Référence -->
                    <ion-item>
                      <ion-label position="stacked">Référence</ion-label>
                      <ion-input v-model="clientForm.reference"></ion-input>
                    </ion-item>

                    <!-- Email -->
                    <ion-item>
                      <ion-label position="stacked">Email</ion-label>
                      <ion-input v-model="clientForm.email" type="email"></ion-input>
                    </ion-item>

                    <!-- Téléphone -->
                    <ion-item>
                      <ion-label position="stacked">Téléphone</ion-label>
                      <ion-input v-model="clientForm.phone" type="tel"></ion-input>
                    </ion-item>

                    <!-- Site internet -->
                    <ion-item>
                      <ion-label position="stacked">Site internet</ion-label>
                      <ion-input v-model="clientForm.website" type="url"></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- 2. Informations professionnelles -->
            <ion-accordion-group>
              <ion-accordion value="professionalInfo" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="briefcase" slot="start"></ion-icon>
                  <ion-label>2. Informations professionnelles</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <!-- Type de client -->
                    <ion-item>
                      <ion-label position="stacked">Type de client*</ion-label>
                      <ion-select v-model="clientForm.type" interface="popover" required>
                        <ion-select-option :value="1">Professionnel</ion-select-option>
                        <ion-select-option :value="2">Particulier</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Numéro d'identification fiscale -->
                    <ion-item>
                      <ion-label position="stacked">Numéro fiscal</ion-label>
                      <ion-input v-model="clientForm.fiscalId"></ion-input>
                    </ion-item>

                    <!-- Activité -->
                    <ion-item>
                      <ion-label position="stacked">Activité*</ion-label>
                      <ion-select 
                        v-model="clientForm.activityId" 
                        interface="popover"
                        required
                      >
                        <ion-select-option 
                          v-for="activity in activities" 
                          :key="activity.hashed_id" 
                          :value="activity.hashed_id"
                        >
                          {{ activity.title }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Devise -->
                    <ion-item>
                      <ion-label position="stacked">Devise*</ion-label>
                      <ion-select 
                        v-model="clientForm.currencyId" 
                        interface="popover"
                        required
                      >
                        <ion-select-option 
                          v-for="currency in currencies" 
                          :key="currency.hashed_id" 
                          :value="currency.hashed_id"
                        >
                          {{ currency.title }} ({{ currency.symbol }})
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <!-- Conditions de paiement -->
                    <ion-item>
                      <ion-label position="stacked">Conditions de paiement</ion-label>
                      <ion-select 
                        v-model="clientForm.paymentTerms"
                        :disabled="isLoadingPaymentTerms"
                        interface="popover"
                      >
                        <ion-select-option 
                          v-if="isLoadingPaymentTerms" 
                          value="" 
                          disabled
                        >
                          Chargement...
                        </ion-select-option>
                        <ion-select-option 
                          v-else-if="paymentTerms.length === 0" 
                          value="" 
                          disabled
                        >
                          Aucune condition disponible
                        </ion-select-option>
                        <ion-select-option 
                          v-for="term in paymentTerms" 
                          :key="term.hashed_id" 
                          :value="term.hashed_id"
                        >
                          {{ term.title }} ({{ term.days >= 0 ? term.days + ' jours' : 'Fin de mois' }})
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- 3. Remarques -->
            <ion-accordion-group>
              <ion-accordion value="remarks" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="documentText" slot="start"></ion-icon>
                  <ion-label>3. Remarques</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <ion-item>
                      <ion-textarea v-model="clientForm.notes" placeholder="Ajoutez vos remarques ici..." rows="4"></ion-textarea>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- 4. Adresse de facturation -->
            <ion-accordion-group>
              <ion-accordion value="billingAddress" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="home" slot="start"></ion-icon>
                  <ion-label>4. Adresse de facturation</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <ion-item>
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="clientForm.billingAddress.address"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="clientForm.billingAddress.governorate"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="clientForm.billingAddress.postalCode"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="clientForm.billingAddress.country" value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- 5. Adresse de livraison -->
            <ion-accordion-group>
              <ion-accordion value="deliveryAddress" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="location" slot="start"></ion-icon>
                  <ion-label>5. Adresse de livraison</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <ion-item>
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="clientForm.deliveryAddress.address"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="clientForm.deliveryAddress.governorate"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="clientForm.deliveryAddress.postalCode"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="clientForm.deliveryAddress.country" value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Bouton de soumission -->
            <ion-button 
              expand="block" 
              type="submit" 
              :disabled="isLoadingAdd"
              class="submit-button"
            >
              <ion-spinner v-if="isLoadingAdd" name="crescent"></ion-spinner>
              {{ isLoadingAdd ? 'Enregistrement...' : 'Enregistrer le client' }}
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent, IonButton, IonIcon, IonList, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonAccordion, IonAccordionGroup, IonSpinner
} from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClientController } from '@/controllers/ClientController';
import { person, briefcase, documentText, home, location } from 'ionicons/icons';
import { DisplayNameType } from '@/models/ClientModel';

const router = useRouter();
const {
  activities,
  currencies,
  paymentTerms,
  isLoadingPaymentTerms,
  isLoadingAdd,
  clientForm,
  addNewClient,
  loadPaymentTerms
} = useClientController();

const submitClient = async () => {
  try {
    await addNewClient();
  } catch (error) {
    console.error("Erreur lors de l'ajout du client:", error);
  }
};

onMounted(async () => {
  try {
    await loadPaymentTerms();
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
});


const goBack = () => {
  router.back();
};
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

.heading {
  font-size: 2rem;
  line-height: 1.8;
  color: #dac136;
  margin-bottom: 1.5rem;
  font-weight: 550;
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

ion-label {
  color: #000000;
}

ion-input, ion-select, ion-textarea {
  color: #000000;
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
</style>