<template>
    <ion-page>
      <ion-header :translucent="true"></ion-header>
      <ion-content :fullscreen="true">
        <form @submit.prevent="submitForm">
        <div class="container">
            <div v-if="page === 1">
                <div class="logo-upload-container">
                    <div class="logo-preview">
                    <img v-if="form.logo" :src="logoPreview" class="logo-image"/>
                    <ion-button 
                        class="add-button" 
                        fill="clear" 
                        @click="triggerFileInput">
                        <ion-icon :icons=addOutline></ion-icon>
                    </ion-button>
                    <ion-button 
                        v-if="form.logo"
                        class="delete-button" 
                        fill="clear" 
                        @click="removeLogo">
                        <ion-icon :icons="trashOutline"></ion-icon>
                    </ion-button>
                    </div>
                    <input 
                        type="file" 
                        id="logo-upload"
                        accept="image/*"
                        @change="handleLogoUpload"
                        style="display: none">
                </div>
                <div class="input-group">
                    <ion-label class="label">Company's name</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.title" placeholder="GOOGLE ?"></ion-input>
                   </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Activity</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.activity_id" placeholder="Select an activity">
                            <ion-select-option
                            v-for="activity in activities"
                            :key="activity.hashed_id" 
                            :value="activity.hashed_id"
                            >
                            {{ activity.title }}
                            </ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Phone</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.phone" placeholder="71559882"></ion-input>
                    </ion-item>
                </div>

                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="nextPage1">Next</ion-button>
                </div>
            </div>
            <div v-if="page === 2">
                <div class="input-group">
                    <ion-label class="label">Addresse</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.address" placeholder="1, liberty road"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Governorate</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.state" placeholder="Tunis"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Postal Code</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.zip_code" placeholder="2090"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Country</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.country_id" placeholder="Tunisie">                            
                            <ion-select-option 
                            v-for="country in countries"
                            :key="country.hashed_id" 
                            :value="country.hashed_id"
                            >
                            {{ country.title }}</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="nextPage2">Next</ion-button>
                </div>
            </div>
            <div v-if="page === 3">
                <div class="input-group">
                    <ion-label class="label">PDF language</ion-label>
                        <ion-item class="custom-input">
                            <ion-select v-model="form.language" placeholder="English">    
                                <ion-select-option value="english">English</ion-select-option>
                                <ion-select-option value="arabic">Arabic</ion-select-option>
                                <ion-select-option value="french">French</ion-select-option>
                            </ion-select>
                        </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Tax identification number</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.fiscal_id" placeholder="0000000/L/A/M/000"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Exercice</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.accounting_period_id" placeholder="January - December">                            
                            <ion-select-option 
                            v-for="accounting in accountings"
                            :key="accounting.hashed_id" 
                            :value="accounting.hashed_id"
                            >
                            {{ accounting.title }}</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Main currency</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.default_currency_id" placeholder="Dinar(s) Tunisien">
                            <ion-select-option 
                            v-for="currency in currencies"
                            :key="currency.hashed_id" 
                            :value="currency.hashed_id"
                            >
                            {{ currency.title }}</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="submitForm">Submit</ion-button>
                </div>
            </div>
        </div>
        </form>
      </ion-content>
    </ion-page>
  </template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { CreateCompanyForm } from '@/controllers/CreatecompanyController';
import { 
  addOutline, 
  trashOutline } from 'ionicons/icons';
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
  IonHeader
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
  loadActivities,
  nextPage1,
  nextPage2,
  submitForm,
  loadCountries,
  loadCurrencies,
  loadAccountingPeriod
} = CreateCompanyForm();

onMounted(() =>{
    loadActivities();
    loadCountries();
    loadCurrencies();
    loadAccountingPeriod();
    submitForm();
});
</script>



<style scoped>
ion-content {
  --background: white;
}
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
}
.logo-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative; 
}
.logo-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px solid var(--ion-color-medium);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  margin-bottom: 25px;

}
.logo-image {
  width: 100%;
  height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; 
  display: block;
  margin: 0 auto;
}
.add-button, .delete-button {
  position: absolute;
  --background: #dedace;
  color: #191602 !important;
  --border-radius: 30%;
  --padding: 0;
  width: 32px;
  height: 30px;
  margin: 0;
  z-index: 10;
}
.add-button {
  top: -12px;
  right: -12px;
}

.delete-button {
  bottom: -12px;
  right: -12px;
}
.add-button ion-icon,
.delete-button ion-icon {
  font-size: 20px;
  color: #0c0c09 !important;
  pointer-events: none; 
}



.input-group {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
}

.label {
    color: #47463d;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 15px;
}
.custom-input {
    color: #33322c;
    width: 350px;
    border-radius: 8px;
    --background: #eee;
    border: 1px solid #ccc;
}

.buttonContainer {
    display: flex;
    justify-content: center;
    width: 100%;

}
.next-button {
    margin-top: 40px;
    width: 160px;
    height: 50px;
    --background: #dfc925;
    border-radius: 150px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
</style>