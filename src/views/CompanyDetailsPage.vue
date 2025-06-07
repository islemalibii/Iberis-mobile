<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button class="back-button" @click="goBack">
            <ion-icon :icon="arrowBack" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title class="page-title">Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <form @submit.prevent="updateExistingCompany">
        <div class="container">
          <div class="form-container">
            <h2 class="section-title">Company Information</h2>
            <div class="logo-upload-container">
              <div class="logo-preview" :class="{ 'has-logo': form.logo || existingLogoUrl }">
                <img v-if="logoPreview" :src="logoPreview" class="logo-image"/>
                <div v-else class="upload-placeholder">
                  <ion-icon :icon="imageOutline" class="placeholder-icon"></ion-icon>
                  <span>Upload Logo</span>
                </div>
              </div>
              <div class="logo-buttons">
                <ion-button class="logo-action-button upload-button" @click="triggerFileInput">
                  <ion-icon :icon="addOutline" slot="start"></ion-icon>
                  Upload Logo
                </ion-button>
                <ion-button v-if="logoPreview" class="logo-action-button delete-button" color="danger" @click="removeLogo">
                  <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                  Remove Logo
                </ion-button>
              </div>
              <input type="file" id="logo-upload" accept="image/*" @change="handleLogoUpload" style="display: none">
            </div>

            <div class="input-group">
              <ion-label class="label">Company's Name</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.title" placeholder="Enter company name"></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Activity</ion-label>
              <ion-item class="custom-input">
                <ion-select v-model="form.activity_id" placeholder="Select an activity">
                  <ion-select-option v-for="activity in activities" :key="activity.hashed_id" :value="activity.hashed_id">
                    {{ activity.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Phone</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.phone" placeholder="Enter phone number"></ion-input>
              </ion-item>
            </div>

            <h2 class="section-title">Location Details</h2>
            <div class="input-group">
              <ion-label class="label">Address</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.address" placeholder="Enter complete address"></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Governorate</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.state" placeholder="Enter governorate"></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Postal Code</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.zip_code" placeholder="Enter postal code"></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Country</ion-label>
              <ion-item class="custom-input">
                <ion-select v-model="form.country_id" placeholder="Select country">
                  <ion-select-option v-for="country in countries" :key="country.hashed_id" :value="country.hashed_id">
                    {{ country.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <h2 class="section-title">Business Settings</h2>
            <div class="input-group">
              <ion-label class="label">PDF Language</ion-label>
              <ion-item class="custom-input">
                <ion-select v-model="form.language" placeholder="Select language">
                  <ion-select-option value="en">English</ion-select-option>
                  <ion-select-option value="ar">Arabic</ion-select-option>
                  <ion-select-option value="fr">French</ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Tax Identification Number</ion-label>
              <ion-item class="custom-input">
                <ion-input v-model="form.fiscal_id" placeholder="Enter tax ID"></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Exercise</ion-label>
              <ion-item class="custom-input">
                <ion-select v-model="form.accounting_period_id" placeholder="Select exercise period">
                  <ion-select-option v-for="accounting in accountings" :key="accounting.hashed_id" :value="accounting.hashed_id">
                    {{ accounting.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Main Currency</ion-label>
              <ion-item class="custom-input">
                <ion-select v-model="form.default_currency_id" placeholder="Select currency">
                  <ion-select-option v-for="currency in currencies" :key="currency.hashed_id" :value="currency.hashed_id">
                    {{ currency.title }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="button-container">
              <ion-button class="submit-button" @click="updateExistingCompany">
                Save Changes
                <ion-icon :icon="checkmark" slot="end"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CompanyForm } from '@/controllers/CompanyController';
import { 
  addOutline, 
  trashOutline, 
  imageOutline,
  checkmark,
  arrowBack
} from 'ionicons/icons';
import {
  IonPage,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonButtons,
  IonItem,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/vue';

const router = useRouter();
const {
  form,
  activities,
  countries,
  currencies,
  accountings,
  logoPreview,
  existingLogoUrl,
  triggerFileInput,
  handleLogoUpload,
  removeLogo,
  loadAllDropdownData,
  loadCompanyData,
  updateExistingCompany,
} = CompanyForm();

const goBack = () => {
  router.back();
};

onMounted(async () => {
  await loadAllDropdownData();
  await loadCompanyData();
});
</script>

<style scoped>
ion-content {
  --background: #f5f5f5;
}

.back-button {
  --color: #191602;
  font-size: 24px;
  margin-left: 8px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  color: #191602;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
}

.form-container {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.section-title {
  color: #191602;
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f5f5f5;
}

.section-title:first-child {
  margin-top: 0;
}

.logo-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.logo-preview {
  width: 200px;
  height: 200px;
  border: 2px dashed #dedace;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.logo-preview.has-logo {
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.logo-action-button {
  --border-radius: 8px;
  font-size: 14px;
  height: 40px;
}

.logo-action-button.upload-button {
  --background: #dfc925;
}

.logo-action-button.delete-button {
  --background: #dc3545;
}

.input-group {
  margin-bottom: 24px;
  width: 100%;
}

.label {
  color: #47463d;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.custom-input {
  --background: #f8f8f8;
  --border-radius: 8px;
  --border-width: 1px;
  --border-color: #dedace;
  color: #191602;
  margin-top: 4px;
}

.custom-input:hover {
  --border-color: #dfc925;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.submit-button {
  width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  --background: #dfc925;
  --border-radius: 24px;
  text-transform: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>