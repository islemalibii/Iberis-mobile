<template>
    <div class="container">
      <h2>Vérification du téléphone</h2>
      
      <div v-if="!otpSent">
        <label for="phone">Numéro de téléphone</label>
        <input v-model="phoneNumber" type="text" id="phone" placeholder="Entrez votre numéro" />
        <button :disabled="!phoneNumber" @click="sendOTP">Envoyer le code</button>
      </div>
      
      <div v-if="otpSent">
        <label for="otp">Code de vérification</label>
        <input v-model="otpCode" type="text" id="otp" placeholder="Entrez le code reçu" />
        <button :disabled="!otpCode" @click="verifyOTP">Vérifier</button>
      </div>
      
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const phoneNumber = ref('');
  const otpCode = ref('');
  const otpSent = ref(false);
  const errorMessage = ref('');

  

  </script>
  
  <style scoped>
  .container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    text-align: center;
  }
  input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
  </style>
  