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
            ></ion-input>
          </ion-item>
        </ion-list>

        <div class="buttonContainer">
          <ion-button expand="block" @click="handleSendCode" class="signupBtn">Envoyer le code</ion-button>
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { sendResetCode } from '@/services/authentification';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonList, IonItem, IonInput, IonButton } from '@ionic/vue';

const router = useRouter();
const email = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSendCode = async () => {
  try {
    console.log('[DEBUG] Début de la procédure d\'envoi de code');
    errorMessage.value = '';
    successMessage.value = '';
    
    if (!email.value.trim()) {
      console.warn('[WARNING] Email vide détecté');
      errorMessage.value = "Veuillez entrer un email";
      return;
    }
    
    if (!validateEmail(email.value)) {
      console.warn('[WARNING] Format email invalide:', email.value);
      errorMessage.value = "Format d'email invalide";
      return;
    }

    isLoading.value = true;
    console.log('[DEBUG] Tentative d\'envoi à:', email.value.trim());
    
    const response = await sendResetCode(email.value.trim());
    console.log('[DEBUG] Réponse du serveur:', JSON.stringify(response, null, 2));
    
    if (response.status.code === 200) {
      console.log('[SUCCESS] Code envoyé avec succès');
      successMessage.value = "Code envoyé avec succès ! Vérifiez votre email.";
      
      setTimeout(() => {
        console.log('[NAVIGATION] Redirection vers /reset');
        router.push({
          path: '/reset',
          query: { email: email.value }
        });
      }, 2000);
    } else {
      console.warn('[WARNING] Réponse inattendue:', response);
    }
    
  } catch (error) {
    console.error('[ERROR] Erreur complète:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    
    errorMessage.value = error.response?.data?.message 
      || "Échec de l'envoi du code. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
    console.log('[DEBUG] Fin de la procédure (loading désactivé)');
  }
};
</script>

<style scoped>
.ion-padding {
--background: white;
}
.signup-container {
text-align: center;
max-width: 800px;
margin: auto;
}
.logo {
width: 150px;
margin-bottom: 10px;
}

h1 {
margin-top: 180px;
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
</style>