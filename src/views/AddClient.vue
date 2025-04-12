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
          <h1 class="heading">Nouveau Client</h1>

          <!-- Formulaire pour ajouter un client -->
          <form @submit.prevent="submitClient">
            <!-- Informations générales -->
            <ion-accordion-group>
              <ion-accordion value="generalInfo">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="person" slot="start"></ion-icon>
                  <ion-label>Informations générales</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Titre</ion-label>
                      <ion-select v-model="client.title" placeholder="Sélectionnez un titre">
                        <ion-select-option value="Mr.">Mr.</ion-select-option>
                        <ion-select-option value="Mme.">Mme.</ion-select-option>
                      </ion-select>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Prénom</ion-label>
                      <ion-input v-model="client.firstName" required></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Nom de famille</ion-label>
                      <ion-input v-model="client.lastName" required></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Entreprise</ion-label>
                      <ion-input v-model="client.company"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Email</ion-label>
                      <ion-input v-model="client.email" type="email" required></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Téléphone</ion-label>
                      <ion-input v-model="client.phone" type="tel" required></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Site Internet</ion-label>
                      <ion-input v-model="client.website" type="url"></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Informations professionnelles -->
            <ion-accordion-group>
              <ion-accordion value="professionalInfo">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="briefcase" slot="start"></ion-icon>
                  <ion-label>Informations professionnelles</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Type</ion-label>
                      <ion-select v-model="client.professionalInfo.type" placeholder="Sélectionnez un type">
                        <ion-select-option value="Entreprise">Entreprise</ion-select-option>
                        <ion-select-option value="Particulier">Particulier</ion-select-option>
                      </ion-select>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Grille des Prix</ion-label>
                      <ion-input v-model="client.professionalInfo.priceGrid"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Numéro d'identification fiscale</ion-label>
                      <ion-input v-model="client.professionalInfo.taxIdentificationNumber"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Activité</ion-label>
                      <ion-input v-model="client.professionalInfo.activity"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Agence ou société commerciale</ion-label>
                      <ion-input v-model="client.professionalInfo.agencyOrCommercialCompany"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Devise</ion-label>
                      <ion-input v-model="client.professionalInfo.currency" value="Dinar(s) tunisien" readonly></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Conditions de paiement</ion-label>
                      <ion-input v-model="client.professionalInfo.paymentTerms" value="Payable à réception" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Remarques -->
            <ion-accordion-group>
              <ion-accordion value="remarks">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="documentText" slot="start"></ion-icon>
                  <ion-label>Remarques</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Remarques</ion-label>
                      <ion-textarea v-model="client.remarks"></ion-textarea>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Adresse de facturation -->
            <ion-accordion-group>
              <ion-accordion value="billingAddress">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="home" slot="start"></ion-icon>
                  <ion-label>Adresse de facturation</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="client.billingAddress.address"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="client.billingAddress.governorate"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="client.billingAddress.postalCode"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="client.billingAddress.country" value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Adresse de livraison -->
            <ion-accordion-group>
              <ion-accordion value="deliveryAddress">
                <ion-item slot="header" class="accordion-header">
                  <ion-icon :icon="location" slot="start"></ion-icon>
                  <ion-label>Adresse de livraison</ion-label>
                </ion-item>
                <div slot="content" class="accordion-content">
                  <ion-list>
                    <ion-item class="item">
                      <ion-label position="stacked">Adresse</ion-label>
                      <ion-input v-model="client.deliveryAddress.address"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Gouvernorat</ion-label>
                      <ion-input v-model="client.deliveryAddress.governorate"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Code postal</ion-label>
                      <ion-input v-model="client.deliveryAddress.postalCode"></ion-input>
                    </ion-item>
                    <ion-item class="item">
                      <ion-label position="stacked">Pays</ion-label>
                      <ion-input v-model="client.deliveryAddress.country" value="Tunisie" readonly></ion-input>
                    </ion-item>
                  </ion-list>
                </div>
              </ion-accordion>
            </ion-accordion-group>

            <!-- Bouton pour soumettre le formulaire -->
            <ion-button expand="full" type="submit" class="submit-button">Ajouter</ion-button>
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

<script>
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
} from "@ionic/vue";
import { arrowBack, person, briefcase, documentText, home, location } from "ionicons/icons";
import axios from "axios";

export default {
  components: {
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
  },
  data() {
    return {
      client: {
        title: "",
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        professionalInfo: {
          type: "",
          priceGrid: "",
          taxIdentificationNumber: "",
          activity: "",
          agencyOrCommercialCompany: "",
          currency: "Dinar(s) tunisien",
          paymentTerms: "Payable à réception",
        },
        remarks: "",
        billingAddress: {
          address: "",
          governorate: "",
          postalCode: "",
          country: "Tunisie",
        },
        deliveryAddress: {
          address: "",
          governorate: "",
          postalCode: "",
          country: "Tunisie",
        },
      },
    };
  },
  methods: {
    async submitClient() {
      try {
        const lang = this.$route.params.lang; // Langue dynamique
        const companyId = this.$route.params.companyId; // ID de l'entreprise
        await axios.post(
          `/${lang}/api/public/company/${companyId}/client/new`,
          this.client
        );
        this.$router.push("/clients"); // Rediriger vers la liste des clients
      } catch (error) {
        console.error("Erreur lors de l'ajout du client:", error);
      }
    },
    goBack() {
      this.$router.push("/clients"); // Retour à la liste des clients
    },
  },
  setup() {
    return {
      arrowBack,
      person,
      briefcase,
      documentText,
      home,
      location,
    };
  },
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
  color: #000000; /* Couleur jaune pour les icônes */
}

.accordion-header:hover {
  --background: #edc84e; /* Fond jaune clair au survol */
}

/* Style pour le contenu des accordéons */
.accordion-content {
  padding: 16px;
  background: #ffffff; /* Fond jaune clair pour le contenu */
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
  --background: #ffffff;; /* Fond blanc */
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

/* Style pour les labels */
ion-label {
  color: #000000; /* Texte noir */
  
  
}

/* Style pour les inputs, selects et textareas */
ion-input, ion-select, ion-textarea {
  color: #000000; /* Texte noir */
  
}

/* Style pour le bouton de soumission */
.submit-button {
  --background: #f0d952; /* Fond jaune */
  --color: #000000; /* Texte noir */
  font-family:Arial, Helvetica, sans-serif;
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