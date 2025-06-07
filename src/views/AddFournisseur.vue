<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <!-- Logo de l'application -->
        <div class="logo-container">
          <a href="/fournisseur">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </a>
        </div>
  
        <div class="content-wrapper">
          <h1 class="heading">Nouveau Fournisseur</h1>
  
          <!-- Formulaire pour ajouter un fournisseur -->
          <form @submit.prevent="submitForm">
            <!-- Informations générales -->
            <ion-accordion-group>
              <ion-accordion value="generalInfo" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="person" slot="start"></ion-icon>
                  <ion-label>1. Informations générales</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item>
                      <ion-label position="stacked">Titre*</ion-label>
                      <ion-select v-model="formData.title" interface="popover" required>
                        <ion-select-option :value="1">Mr.</ion-select-option>
                        <ion-select-option :value="2">Mlle.</ion-select-option>
                        <ion-select-option :value="3">Mme.</ion-select-option>
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
                    <ion-item>
                      <ion-label position="stacked">Entreprise</ion-label>
                      <ion-input v-model="formData.Company"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Format du nom affiché</ion-label>
                      <ion-select v-model="formData.display_name" interface="popover">
                        <ion-select-option :value="1">Nom de l'entreprise</ion-select-option>
                        <ion-select-option :value="2">Prénom Nom</ion-select-option>
                        <ion-select-option :value="3">Nom Prénom</ion-select-option>
                      </ion-select>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Référence</ion-label>
                      <ion-input v-model="formData.reference"></ion-input>
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
                      <ion-label position="stacked">Site Internet</ion-label>
                      <ion-input v-model="formData.website" type="url"></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>
  
            <!-- Informations professionnelles -->
            <ion-accordion-group>
              <ion-accordion value="professionalInfo" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="briefcase" slot="start"></ion-icon>
                  <ion-label>2. Informations professionnelles</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Type</ion-label>
                      <ion-select v-model="formData.type" interface="popover">
                        <ion-select-option :value="1">Entreprise</ion-select-option>
                        <ion-select-option :value="2">Particulier</ion-select-option>
                      </ion-select>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Numéro fiscal</ion-label>
                      <ion-input v-model="formData.fiscal_id"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Activité*</ion-label>
                      <ion-select 
                        v-model="formData.hashed_activity_id" 
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
                        v-model="formData.hashed_currency_id" 
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
                    <ion-item>
                      <ion-label position="stacked">Conditions de paiement</ion-label>
                      <ion-select 
                        v-model="formData.hashed_default_invoice_deadline_id"
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
  
            <!-- Remarques -->
            <ion-accordion-group>
              <ion-accordion value="remarks" :disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="documentText" slot="start"></ion-icon>
                  <ion-label>3. Remarques</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <ion-item>
                      <ion-textarea v-model="formData.note" placeholder="Ajoutez vos remarques ici..." rows="4"></ion-textarea>
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
                      <ion-input v-model="formData.billing.address"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="formData.billing.bill_state"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="formData.billing.zip_code"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-select v-model="formData.billing.country_id" interface="popover">
                        <ion-select-option value="TN">Tunisie</ion-select-option>
                      </ion-select>
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
                      <ion-input v-model="formData.delivery.address"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="formData.delivery.bill_state"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="formData.delivery.zip_code"></ion-input>
                    </ion-item>
                    <ion-item>
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-select v-model="formData.delivery.country_id" interface="popover">
                        <ion-select-option value="TN">Tunisie</ion-select-option>
                      </ion-select>
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
              {{ isLoadingAdd ? 'Enregistrement...' : 'Enregistrer le fournisseur' }}
            </ion-button>
          </form>
        </div>
      </div>
  
      <!-- Bouton de retour -->
      <ion-button fill="clear" @click="goBack" class="back-button">
        <ion-icon :icon="arrowBack"></ion-icon>
        Retour
      </ion-button>
    </ion-content>
  </ion-page>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useIonRouter } from '@ionic/vue';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonSpinner,
  toastController
} from "@ionic/vue";
import {
  arrowBack,
  person,
  briefcase,
  documentText,
  home,
  location,
} from "ionicons/icons";
import { useProviderController } from '@/controllers/ProviderController';
import { DisplayNameType, ProviderTitle, ProviderType } from './../models/providerModel';

// Initialiser le router
const router = useIonRouter();

// Récupérer les méthodes et propriétés du contrôleur
const {
  activities,
  currencies,
  paymentTerms,
  isLoadingPaymentTerms,
  isLoadingAdd,
  loadPaymentTerms,
  formData,

  submitForm,
  submitProvider
} = useProviderController();


const goBack = () => {
  router.go(-1); 
};
</script>

<style scoped>
ion-content {
  --background: #ffffff; /* Fond blanc */
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
  color: #000000; /* Texte noir */
}

.back-button {
  --color: #000000; /* Couleur du bouton de retour en noir */
  margin-bottom: 20px;
}

.heading {
  font-size: 2rem;
  line-height: 1.8;
  color: #dac136; /* Couleur jaune pour le titre */
  margin-bottom: 1.5rem;
  font-weight: 550;
}

/* Style pour le formulaire */
form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Style pour les groupes d'accordéons */
ion-accordion-group {
  margin-bottom: 16px;
  border-radius: 13px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Ombre légère */
}

/* Style pour les en-têtes d'accordéons */
ion-accordion {
  --background: #e4e7ca; /* Fond blanc */
  --border-radius: 12px;
}

.accordion-header {
  --background: #ffffff; /* Fond blanc */
  --color: #000000; /* Texte noir */
  --border-radius: 12px;
  margin-bottom: -2px;
  font-family: 'Courier New', Courier, monospace;
}

.accordion-header ion-icon {
  color: #000000; /* Couleur des icônes */
}

.accordion-header:hover {
  --background: #edc84e; /* Fond jaune clair au survol */
}

/* Style pour le contenu des accordéons */
.accordion-content {
  padding: 16px;
  background: #ffffff; /* Fond pour le contenu */
  border-radius: 0 0 12px 12px;
}

/* Style pour la liste */
ion-list {
  background: #ffffff; /* Fond blanc */
  border-radius: 12px;
  padding: 16px;
}

/* Style pour les éléments de la liste */
ion-item {
  --background: #ffffff; /* Fond blanc */
  --color: #000000; /* Texte noir */
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

ion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Ombre légère */
}

/* Style pour le bouton de soumission */
.submit-button {
  --background: #f0d952; /* Fond jaune */
  --color: #000000; /* Texte noir */
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 680;
  margin-top: 105px;
  max-width: 150px;
  margin-left: auto;
  margin-right: auto;
  --border-radius: 12px;
}

.submit-button:hover {
  --background: #e3cd53; /* Jaune plus foncé au survol */
  transform: scale(1.05);
}
</style>