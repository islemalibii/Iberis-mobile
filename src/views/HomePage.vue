<template>
  <ion-page>
    <ion-header :translucent="true">
  
    </ion-header>
    <ion-content :fullscreen="true">
      
      <div class="container">
        <div class="content-wrapper">
          <div class="image-container">
            <img 
              src="/src/assets/logo-iberis.png" 
              alt="Iberis Logo"
              class="logo"
            >
          </div>
          
          <h1 class="heading">Le Logiciel de <strong>Facturation</strong> qu'il vous faut</h1>
          
          <p class="description">
            Iberis est spécialement conçue pour les dirigeants de TPME, avec une solution intuitive, 
            pratique et parfaitement adaptée à leurs besoins.
          </p>

          <div class="button-group">
            <ion-button class="action-button" @click="goToSignup">Sign Up</ion-button>
            <ion-button class="action-button" @click="goToLogin">Log In</ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonButton } from '@ionic/vue';

import { useRouter } from 'vue-router'; 

const router = useRouter(); 
const goToLogin = () => {
  router.push('/login'); 
};
const goToSignup = () => {
  router.push('/signup'); 
};
</script>

<style scoped>
ion-content {
  --background: white;
}

.container {
  display: flex;
  min-height: 100%;
  padding: 24px;
}

.content-wrapper {
  margin: auto;
  max-width: 600px;
  width: 100%;
}

.image-container {
  text-align: center;
  margin-bottom: 55px;
}

.logo {
 
  height: 210px;
  width: 280px;
}

.heading {
  font-size: 1.6rem;
  line-height: 1.3;
  color: #2d3436;
  margin-bottom: 1.5rem;
  font-weight: 550;
  text-align: center; 
  margin-left: auto; 
  margin-right: auto; 
}

.heading strong {
  color: #DFC925;
  font-weight: 700;
}

.description {
  font-size: 0.9rem;
  line-height: 1.3;
  color: #636e72;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto; 
  margin-right: auto;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center; 
  gap: 20px; 
}

.action-button {
  --background: #DFC925;
  --background-hover: #cab40f;
  --color: #47463D;
  --border-radius: 17px;
  font-weight: 550;
  --padding-top: 20px; 
  --padding-bottom: 25px; 
  --padding-right: 100px; 
  --padding-left: 100px;
  font-size: 1.5rem;
}
</style>