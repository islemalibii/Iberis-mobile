<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <a href="/home">
        <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" />
      </a>
      <div class="signup-container">
        <h1>Réinitialisez votre mot de passe</h1>
        <p>Entrez votre email pour recevoir un code de réinitialisation :</p>

        <ion-list class="list">
          <ion-item class="item">
            <ion-input
              v-model="email"
              type="email"
              placeholder="Email"
              class="input-field"
              :disabled="isLoading"
            ></ion-input>
          </ion-item>
        </ion-list>

        <div class="buttonContainer">
          <ion-button 
            expand="block" 
            @click="handleSendCode" 
            class="signupBtn"
            :disabled="isLoading || !canResend"
          >
            <span v-if="!isLoading">Envoyer le code</span>
            <ion-spinner v-else name="crescent"></ion-spinner>
          </ion-button>
        </div>

        <p v-if="!canResend" class="info">
          Vous pourrez renvoyer un code dans {{ resendDelay }} secondes.
        </p>

        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton,
  IonSpinner 
} from '@ionic/vue';

const API_BASE_URL = 'https://api.iberis.io';
const router = useRouter();
const email = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const canResend = ref(true);
const resendDelay = ref(30);

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const startResendTimer = () => {
  canResend.value = false;
  const interval = setInterval(() => {
    resendDelay.value--;
    if (resendDelay.value <= 0) {
      clearInterval(interval);
      canResend.value = true;
      resendDelay.value = 30;
    }
  }, 1000);
};

const handleSendCode = async () => {
  try {
    errorMessage.value = '';
    successMessage.value = '';
    
    if (!email.value.trim()) {
      errorMessage.value = "Veuillez entrer un email";
      return;
    }
    
    if (!validateEmail(email.value)) {
      errorMessage.value = "Format d'email invalide";
      return;
    }

    isLoading.value = true;
    
    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/user/reset`,
      { email: email.value.trim() },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Réponse API:', response.data);

    if (process.env.NODE_ENV === 'development') {
      console.log('Code de réinitialisation (simulé):', response.data.resetCode);
      successMessage.value = `Code de réinitialisation (simulé) : ${response.data.resetCode}`;
    } else {
      successMessage.value = "Un code de réinitialisation a été envoyé à votre email.";
    }

    startResendTimer();
    setTimeout(() => {
      router.push({
        path: '/reset/check',
        query: { email: email.value }
      });
    }, 2000);

  } catch (error) {
    console.error('Erreur détaillée:', {
      config: error.config,
      response: error.response,
      message: error.message
    });
    
    if (error.code === 'ECONNABORTED') {
      errorMessage.value = "Le serveur ne répond pas. Veuillez réessayer plus tard.";
    } else if (!error.response) {
      errorMessage.value = "Problème de connexion. Vérifiez votre internet.";
    } else {
      const apiErrorCode = error.response?.data?.status?.code;
      
      switch(apiErrorCode) {
        case 205:
          errorMessage.value = "Format d'email invalide";
          break;
        case 500:
          errorMessage.value = "Aucun compte associé à cet email";
          break;
        default:
          errorMessage.value = "Erreur technique. Contactez le support.";
      }
    }
    
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.ion-padding {
  --background: white;
}
.signup-container {
  text-align: center;
  max-width: 600px;
  margin: auto;
}
.logo {
  width: 150px;
  margin-bottom: 10px;
}

h1 {
  font-size: 40px;
  color: #47463d;
}

p {
  font-size: 15px;
  color: #47463d;
}

.list {
  background: transparent;
}
.item {
  --background: #dfc925;
  --border-radius: 10px;
  --border-color: #47463d;
  --padding-start: 15px;
  --inner-padding-end: 15px;
  margin-bottom: 20px;
  margin-top: 15px;
}

.buttonContainer {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.signupBtn {
  --background: #47463d;
  --color: white;
  --border-radius: 8px;
  height: 35px;
  width: 150px;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.success {
  color: green;
  font-size: 14px;
  margin-top: 10px;
}

.info {
  color: #47463d;
  font-size: 14px;
  margin-top: 10px;
}
</style>