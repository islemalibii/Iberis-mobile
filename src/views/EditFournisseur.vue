<template>
  <ion-page>
    <ion-content>
      <div class="container">
         <div class="logo-container">
          <a href="/fournisseur">
            <img src="../assets/logo-iberis.png" alt="Logo Iberis" class="logo" />
          </a>
        </div>

        <div class="content-wrapper">
          <h1 class="heading">Modifier un fournisseur</h1>

          <!-- Chargement -->
          <div v-if="isLoadingDetails" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            Chargement des données...
          </div>

          <!-- Formulaire -->
          <form v-else-if="providerDetails" @submit.prevent="submitEditForm">
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
                        v-model="localFormData.title" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="ProviderTitle.MR">Mr.</ion-select-option>
                        <ion-select-option :value="ProviderTitle.MLLE">Mlle.</ion-select-option>
                        <ion-select-option :value="ProviderTitle.MRS">Mme.</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Prénom (*)</ion-label>
                      <ion-input v-model="localFormData.first_name" required></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Nom de famille</ion-label>
                      <ion-input v-model="localFormData.last_name"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Entreprise</ion-label>
                      <ion-input v-model="localFormData.organisation"></ion-input>
                    </ion-item>

                  <!-- Modifier le sélecteur de display_name -->
<ion-item class="item">
  <ion-label position="stacked">Nom affiché (*)</ion-label>
  <ion-select 
    v-model="localFormData.display_name" 
    interface="action-sheet"
    required
  >
    <ion-select-option :value="DisplayNameType.COMPANY">
      {{ localFormData.organisation || '' }}
    </ion-select-option>
    <ion-select-option :value="DisplayNameType.FIRSTNAME_LASTNAME">
      {{ `${localFormData.first_name || 'Prénom'} ${localFormData.last_name || ''}`.trim() }}
    </ion-select-option>
    <ion-select-option :value="DisplayNameType.LASTNAME_FIRSTNAME">
      {{ `${localFormData.last_name || ''}, ${localFormData.first_name || 'Prénom'}`.replace(/^,\s*/, '').replace(/,\s*$/, '') }}
    </ion-select-option>
  </ion-select>
</ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Email</ion-label>
                      <ion-input v-model="localFormData.email" type="email"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Téléphone</ion-label>
                      <ion-input v-model="localFormData.phone" type="tel"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Site web</ion-label>
                      <ion-input v-model="localFormData.website" type="url"></ion-input>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Référence</ion-label>
                      <ion-input v-model="localFormData.reference"></ion-input>
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
                        v-model="localFormData.type" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option :value="ProviderType.PROFESSIONAL">Professionnel</ion-select-option>
                        <ion-select-option :value="ProviderType.INDIVIDUAL">Particulier</ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Activité (*)</ion-label>
                      <ion-select 
                        v-model="localFormData.hashed_activity_id" 
                        interface="action-sheet"
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

                    <ion-item class="item">
                      <ion-label position="stacked">Devise (*)</ion-label>
                      <ion-select 
                        v-model="localFormData.hashed_currency_id" 
                        interface="action-sheet"
                        required
                      >
                        <ion-select-option 
                          v-for="currency in currencies"
                          :key="currency.hashed_id"
                          :value="currency.hashed_id"
                        >
                          {{ currency.title }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Conditions de paiement</ion-label>
                      <ion-select 
                        v-model="localFormData.hashed_default_invoice_deadline_id" 
                        interface="action-sheet"
                      >
                        <ion-select-option 
                          v-for="term in paymentTerms" 
                          :key="term.hashed_id" 
                          :value="term.hashed_id"
                        >
                          {{ term.title }} ({{ term.days }} jours)
                        </ion-select-option>
                      </ion-select>
                    </ion-item>

                    <ion-item class="item">
                      <ion-label position="stacked">Identifiant fiscal</ion-label>
                      <ion-input v-model="localFormData.fiscal_id"></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Adresse de facturation -->
            <ion-accordion-group>
              <ion-accordion value="billingAddress":disabled="isLoadingAdd">
                <ion-item slot="header" class="accordion-header yellow">
                  <ion-icon :icon="home" slot="start"></ion-icon>
                  <ion-label>Adresse de facturation</ion-label>
                </ion-item>
                <div slot="content">
                  <ion-list>
                    <ion-item >
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="localFormData.billing.address"></ion-input>
                    </ion-item>

                    <ion-item >
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="localFormData.billing.bill_state"></ion-input>
                    </ion-item>

                    <ion-item >
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="localFormData.billing.zip_code"></ion-input>
                    </ion-item>

                    <ion-item >
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="localFormData.billing.country_title" readonly></ion-input>
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
                      <ion-input v-model="localFormData.delivery.address"></ion-input>
                    </ion-item>

                    <ion-item>
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="localFormData.delivery.bill_state"></ion-input>
                    </ion-item>

                    <ion-item >
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="localFormData.delivery.zip_code"></ion-input>
                    </ion-item>

                    <ion-item >
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="localFormData.delivery.country_title" ></ion-input>
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
                      <ion-textarea v-model="localFormData.note" rows="3"></ion-textarea>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>
<!-- Bouton de soumission -->
<ion-button 
  @click="submitEditForm(route.params.id as string, localFormData)"
  type="button" 
  expand="block" 
  class="submit-button"
  :disabled="isSubmitting"
>
  <template v-if="isSubmitting">
    <ion-spinner name="crescent" class="mr-2"></ion-spinner>
    Mise à jour...
  </template>
  <template v-else>
    <ion-icon :icon="saveOutline" class="mr-2"></ion-icon>
    Sauvegarder
  </template>
</ion-button>
          </form>

          <!-- Erreur de chargement -->
          <div v-else class="error-message">
            <ion-icon :icon="warning" class="error-icon"></ion-icon>
            Impossible de charger les données du fournisseur
          </div>
        </div>

        <!-- Bouton de retour -->
        <ion-button 
          fill="clear" 
          @click="goBack" 
          class="back-button"
          :disabled="isSubmitting"
        >
          <ion-icon :icon="arrowBack"></ion-icon>
          Retour
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { saveOutline, addOutline } from 'ionicons/icons';
import { 
  IonPage, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonSpinner
} from "@ionic/vue";
import { 
  arrowBack, 
  person, 
  briefcase, 
  home, 
  location, 
  warning,
  documentText 
} from "ionicons/icons";
import { useProviderController} from '@/controllers/ProviderController';
import { ProviderTitle, ProviderType, DisplayNameType } from './../models/providerModel';
import { computed } from 'vue';
const route = useRoute();
const router = useRouter();
const {
  providerDetails,
  isLoadingDetails,
  fetchProviderDetails,
  activities,
  updateProvider,
  currencies,displayNameOptions,
  paymentTerms,
  submitForm,submitEditForm,
  localFormData,initializeFormWithProviderData
} = useProviderController();

const isSubmitting = ref(false);

onMounted(async () => {
  console.log('Route params:', route.params); // Ajoutez ce log
  if (route.params.id) {
    await initializeFormWithProviderData(route.params.id as string);
  }
});

const goBack = () => {
  if (!isSubmitting.value) {
    router.push('/fournisseur');
  }
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
