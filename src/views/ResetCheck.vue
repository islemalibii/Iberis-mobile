<template>
    <ion-page>
      <ion-content :fullscreen="true" class="ion-padding">
        <a href="/home">
          <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" />
        </a>
        <div class="signup-container">
          <h1>Vérification du code</h1>
          <p>Entrez le code reçu à l'adresse {{ email }}</p>
  
          <div class="code-inputs">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              v-model="code[index]"
              @input="handleInput(index, $event)"
              @keydown.delete="handleBackspace(index, $event)"
              @paste="handlePaste"
              maxlength="1"
              type="text"
              inputmode="numeric"
              class="code-box"
              :ref="(el) => (inputs[index] = el)"
            />
          </div>
  
          <!-- Boutons de vérification et renvoi de code -->
          <div class="buttonContainer">
            <ion-button
              @click="verifyCode"
              class="signupBtn"
              :disabled="isLoading || !isCodeComplete"
            >
              <span v-if="!isLoading">Vérifier</span>
              <ion-spinner v-else name="crescent"></ion-spinner>
            </ion-button>
            <ion-button
              @click="resendCode"
              class="signupBtn secondary"
              :disabled="isLoading"
            >
              Renvoyer le code
            </ion-button>
          </div>
  
          <!-- Affichage des messages d'erreur -->
          <div v-if="errorMessage" class="error-message">
            <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import axios from "axios";
  import {
    IonPage,
    IonContent,
    IonButton,
    IonSpinner,
    IonIcon,
  } from "@ionic/vue";
  import { alertCircleOutline } from "ionicons/icons";
  import { useResetCheckController } from '@/controllers/Resetcheck';

const { 
  email, 
  code, 
  errorMessage, 
  isLoading, 
  inputs, 
  isCodeComplete, 
  handleInput, 
  handleBackspace, 
  handlePaste, 
  verifyCode, 
  resendCode 
} = useResetCheckController();
  </script>
  
  <style scoped>
  .ion-padding {
    --background: white;
  }
  
  .signup-container {
    text-align: center;
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .logo {
    width: 150px;
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  }
  
  .code-inputs {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .code-box {
    width: 60px;
    height: 60px;
    text-align: center;
    font-size: 24px;
    border: 2px solid #ddd;
    border-radius: 8px;
    transition: border-color 0.3s ease;
  }
  
  .code-box:focus {
    border-color: #47463d;
    outline: none;
  }
  
  .buttonContainer {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .signupBtn {
    --background: #47463d;
    --color: white;
    --border-radius: 8px;
    height: 45px;
    width: 160px;
    font-size: 16px;
    transition: background-color 0.3s ease;
  }
  
  .signupBtn.secondary {
    --background: #6c757d;
  }
  
  .signupBtn:hover {
    --background: #333;
  }
  
  .error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
    color: #dc3545;
    font-size: 14px;
  }
  
  .error-icon {
    font-size: 18px;
  }
  </style>