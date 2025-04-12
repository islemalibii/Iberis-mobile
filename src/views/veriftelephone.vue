<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="container">
        <img src="@/assets/logo-iberis.png" alt="Logo Iberis" class="logo">
        <h1>Vérification du téléphone</h1>

        <div v-if="!otpSent" class="form-section">
          <ion-item class="input-item">
            <span class="country-code">+216</span>
            <ion-input
              v-model="phoneNumber"
              type="tel"
              placeholder="Numéro de téléphone"
              class="custom-input"
              :disabled="isLoading"
            ></ion-input>
          </ion-item>

          <ion-button 
            expand="block" 
            @click="sendOTP" 
            :disabled="!phoneNumber || isLoading"
            class="action-button"
          >
            <span v-if="!isLoading">Envoyer le code</span>
            <ion-spinner v-else name="crescent"></ion-spinner>
          </ion-button>
        </div>

        <div v-if="otpSent" class="form-section">
          <ion-item class="input-item">
            <ion-input
              v-model="otpCode"
              type="text"
              inputmode="numeric"
              placeholder="Code reçu"
              class="custom-input"
              :disabled="isLoading"
            ></ion-input>
          </ion-item>

          <ion-button 
            expand="block" 
            @click="verifyOTP" 
            :disabled="!otpCode || isLoading"
            class="action-button"
          >
            <span v-if="!isLoading">Vérifier</span>
            <ion-spinner v-else name="crescent"></ion-spinner>
          </ion-button>

          <p v-if="!canResend" class="info-text">
            Renvoyer un code dans {{ resendDelay }} secondes
          </p>
          <ion-button 
            v-else
            fill="clear"
            @click="sendOTP"
            class="resend-button"
          >
            Renvoyer le code
          </ion-button>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { 
  IonPage, 
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner
} from '@ionic/vue';
import { usePhoneVerificationController } from '@/controllers/VerifytlphController';

const {
  phoneNumber,
  otpCode,
  otpSent,
  errorMessage,
  isLoading,
  canResend,
  resendDelay,
  sendOTP,
  verifyOTP
} = usePhoneVerificationController();
</script>

<style scoped>
  ion-content {
    --background: white;
  }
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.logo {
  width: 210px;
  margin-bottom: 100px;
}

h1 {
  font-size: 24px;
  color: #47463D;
  margin-bottom: 30px;
  font-weight: 600;
}

.form-section {
  margin-bottom: 20px;
}

.input-item {
  --background: #DFC925;
  --border-radius: 12px;
  --padding-start: 15px;
  --inner-padding-end: 15px;
  margin-bottom: 25px;
}

.custom-input {
  --placeholder-color: #6c757d;
  --color: #47463D;
}

.action-button {
  --background: #47463D;
  --background-activated: #3a3a3a;
  --background-hover: #3a3a3a;
  --color: white;
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  margin-top: 10px;
}

.action-button:disabled {
  --background: #a8a8a8;
  opacity: 1;
}

.resend-button {
  --color: #47463D;
  margin-top: 15px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 15px;
}

.info-text {
  color: #6c757d;
  font-size: 14px;
  margin-top: 15px;
}
</style>