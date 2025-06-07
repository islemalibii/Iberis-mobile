<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-title class="page-title">Create Company</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <form @submit.prevent="createNewCompany">
          <div class="container">
            <div class="progress-bar">
              <div class="progress-step" :class="{ active: page >= 1 }">1</div>
              <div class="progress-line" :class="{ active: page >= 2 }"></div>
              <div class="progress-step" :class="{ active: page >= 2 }">2</div>
              <div class="progress-line" :class="{ active: page >= 3 }"></div>
              <div class="progress-step" :class="{ active: page >= 3 }">3</div>
            </div>
  
            <div class="form-container">
              <div v-if="page === 1" class="fade-enter-active">
                <h2 class="section-title">Company Information</h2>
                <div class="logo-upload-container">
                  <div class="logo-preview" :class="{ 'has-logo': form.logo }">
                    <img v-if="form.logo" :src="logoPreview" class="logo-image"/>
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
                    <ion-button v-if="form.logo" class="logo-action-button delete-button" color="danger" @click="removeLogo">
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
  
                <div class="button-container">
                  <ion-button expand="block" class="next-button" @click="nextPage1">
                    Next
                    <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
  
              <div v-if="page === 2" class="fade-enter-active">
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
  
                <div class="button-container">
                  <ion-button fill="outline" class="back-button" @click="page = 1">
                    <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                    Back
                  </ion-button>
                  <ion-button class="next-button" @click="nextPage2">
                    Next
                    <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
  
              <div v-if="page === 3" class="fade-enter-active">
                <h2 class="section-title">Business Settings</h2>
                <div class="input-group">
                  <ion-label class="label">PDF Language</ion-label>
                  <ion-item class="custom-input">
                    <ion-select v-model="form.language" placeholder="Select language">
                      <ion-select-option value="english">English</ion-select-option>
                      <ion-select-option value="arabic">Arabic</ion-select-option>
                      <ion-select-option value="french">French</ion-select-option>
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
                  <ion-button fill="outline" class="back-button" @click="page = 2">
                    <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                    Back
                  </ion-button>
                  <ion-button class="submit-button" @click="createNewCompany">
                    Create Company
                    <ion-icon :icon="checkmark" slot="end"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { CompanyForm } from '@/controllers/CompanyController';
  import { 
    addOutline, 
    trashOutline, 
    imageOutline, 
    arrowForward, 
    arrowBack,
    checkmark 
  } from 'ionicons/icons';
  import {
    IonPage,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonItem,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle
  } from '@ionic/vue';
  
  const {
    page,
    form,
    activities,
    countries,
    currencies,
    accountings,
    logoPreview,
    triggerFileInput,
    handleLogoUpload,
    removeLogo,
    loadAllDropdownData,
    nextPage1,
    nextPage2,
    createNewCompany,
  } = CompanyForm();
  
  onMounted(() => {
    loadAllDropdownData();
 });
  </script>
  
<style scoped>
  ion-content {
    --background: #f5f5f5;
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
  
  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    width: 100%;
    max-width: 400px;
  }
  
  .progress-step {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #dedace;
    color: #191602;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .progress-step.active {
    background: #dfc925;
    color: white;
  }
  
  .progress-line {
    flex: 1;
    height: 3px;
    background: #dedace;
    margin: 0 10px;
    transition: all 0.3s ease;
  }
  
  .progress-line.active {
    background: #dfc925;
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
    margin-bottom: 32px;
    text-align: center;
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
    margin-top: 4px;
  }
  
  .custom-input:hover {
    --border-color: #dfc925;
  }
  
  .button-container {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 32px;
  }
  
  .next-button,
  .back-button,
  .submit-button {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    --border-radius: 24px;
    text-transform: none;
  }
  
  .next-button,
  .submit-button {
    --background: #dfc925;
    --color: white;
  }
  
  .back-button {
    --border-color: #dfc925;
    --color: #dfc925;
  }
  
  .fade-enter-active {
    animation: fadeIn 0.3s ease-out;
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