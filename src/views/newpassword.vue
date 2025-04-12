<template>
    <ion-page>
      <ion-content>
        <div class="container">
          <div class="content-wrapper">
            <div class="image-container">
              <a href="/home">
                <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" />
              </a>
            </div>
  
            <h1 class="heading">Nouveau mot de passe</h1>
            <p class="signup-link">Définissez un nouveau mot de passe pour votre compte.</p>
  
            <ion-list class="list">
              <ion-item class="item">
                <ion-img src="/src/assets/cadenas.png" class="input-icon"></ion-img>
                <ion-input
                  v-model="newPassword"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  required
                  class="input-field"
                ></ion-input>
              </ion-item>
  
              <ion-item class="item">
                <ion-img src="/src/assets/cadenas.png" class="input-icon"></ion-img>
                <ion-input
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  required
                  class="input-field"
                ></ion-input>
              </ion-item>
            </ion-list>
  
            <ion-button
              expand="full"
              class="login-button"
              @click="updatePassword"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="!isLoading">Mettre à jour</span>
              <ion-spinner v-else name="crescent"></ion-spinner>
            </ion-button>
  
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import axios from "axios";
  import {
    IonPage,
    IonContent,
    IonButton,
    IonSpinner,
    IonItem,
    IonInput,
    IonList,
    IonImg,
  } from "@ionic/vue";
  const { 
  email, 
  token, 
  newPassword, 
  confirmPassword, 
  errorMessage, 
  successMessage, 
  isLoading, 
  isFormValid, 
  updatePassword 
} = useNewPasswordController();
</script>
 
  
  <style scoped>
  ion-content {
    --background: white;
  }
  
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
  }
  
  .content-wrapper {
    max-width: 400px;
    width: 100%;
    text-align: center;
  }
  
  .image-container {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .logo {
    height: 160px;
    width: 260px;
  }
  
  .heading {
    font-size: 1.7rem;
    line-height: 1.8;
    color: #47463d;
    margin-bottom: 1.5rem;
    font-weight: 550;
  }
  
  .signup-link {
    font-size: 0.9rem;
    color: #636e72;
    margin-bottom: 2rem;
  }
  
  .list {
    background: transparent;
    margin-bottom: 1.8rem;
  }
  
  .item {
    --background:#dfc925;
    --border-radius: 12px;
    --padding-start: 16px;
    --inner-padding-end: 16px;
    margin-bottom: 16px;
  }
  
  .input-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
  }
  
  .input-field {
    --padding-start: 0;
  }
  
  .login-button {
    --background: #47463d;
    --color: #ffffff;
    font-weight: 550;
    margin: 20px auto 0;
    --padding-top: 20px;
    --padding-bottom: 20px;
    width: 210px;
    display: block;
  }
  
  .login-button::part(native) {
    border-radius: 20px;
  }
  
  .error {
    color: red;
    margin-top: 10px;
  }
  
  .success {
    color: green;
    margin-top: 10px;
  }
  </style>