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
  import { useRouter } from 'vue-router';
  import { sendResetCode } from '@/services/authentification';  
  
  const router = useRouter();
  const email = ref('');
  const errorMessage = ref('');
  
  const handleSendCode = async () => {
  try {
    const response = await sendResetCode({ email: email.value.trim() });
    if (response.data.success) {
      router.push(''); 
    } else {
      errorMessage.value = 'Email non trouvé ou invalide.';
    }
  } catch (error) {
    console.log('Erreur:', error); 
    errorMessage.value = 'Une erreur s\'est produite. Essayez encore.';
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
  