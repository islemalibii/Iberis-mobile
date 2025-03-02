<template>
    <ion-page>
      <ion-content :fullscreen="true" class="ion-padding">
        <a href="/home">
          <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" />
        </a>
        <div class="signup-container">
          <h1>Vérification du code</h1>
          <p>Entrez le code reçu à l'adresse {{ email }}</p>
  
          <!-- Inputs pour le code à 4 chiffres -->
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
  
  const API_BASE_URL = "https://api.iberis.io";
  const router = useRouter();
  const route = useRoute();
  const email = ref(route.query.email || "");
  const code = ref(Array(4).fill("")); // Tableau pour stocker les 4 chiffres du code
  const errorMessage = ref("");
  const isLoading = ref(false);
  const inputs = ref([]); // Références des inputs
  
  // Vérifie si le code est complet (4 chiffres)
  const isCodeComplete = computed(() => {
    return code.value.every((digit) => digit.length === 1);
  });
  
  // Gestion de la saisie dans les inputs
  const handleInput = (index, event) => {
    const value = event.target.value;
    if (value.length === 1 && index < 3) {
      // Passe à l'input suivant
      inputs.value[index + 1]?.focus();
    } else if (value.length === 1 && index === 3) {
      // Si c'est la dernière case, on reste dessus
      inputs.value[index]?.blur();
    }
  };
  
  // Gestion de la suppression avec la touche backspace
  const handleBackspace = (index, event) => {
    if (event.target.value.length === 0 && index > 0) {
      // Retourne à l'input précédent
      inputs.value[index - 1]?.focus();
    }
  };
  
  // Gestion du collage (paste) du code
  const handlePaste = (event) => {
    event.preventDefault(); // Empêche le comportement par défaut
    const pasteData = event.clipboardData.getData("text").trim(); // Récupère le texte collé
    if (/^\d{4}$/.test(pasteData)) {
      // Vérifie si le texte collé est un code à 4 chiffres
      for (let i = 0; i < 4; i++) {
        code.value[i] = pasteData[i]; // Répartit les chiffres dans les cases
      }
      inputs.value[3]?.focus(); // Focus sur la dernière case
    } else {
      errorMessage.value = "Le code collé doit contenir exactement 4 chiffres.";
    }
  };
  
  const verifyCode = async () => {
    try {
      if (!isCodeComplete.value) {
        errorMessage.value = "Veuillez entrer un code valide à 4 chiffres";
        return;
      }
  
      isLoading.value = true;
      const fullCode = code.value.join(""); // Concatène les 4 chiffres
  
      const response = await axios.post(
        `${API_BASE_URL}/fr/api/private/user/reset/check`,
        { token: fullCode }
      );
  
      if (response.data.status?.code === 200) {
        router.push({
          path: "/reset/check/new",
          query: { email: email.value, token: fullCode },
        });
      } else {
        errorMessage.value = response.data.status?.message || "Code invalide";
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du code :", error);
      errorMessage.value =
        error.response?.data?.message || "Erreur de vérification";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Renvoi du code
  const resendCode = async () => {
    try {
      isLoading.value = true;
      const response = await axios.post(
        `${API_BASE_URL}/fr/api/private/user/reset`,
        { email: email.value }
      );
  
      if (response.data.status?.code === 200) {
        errorMessage.value = "Un nouveau code a été envoyé à votre email.";
      } else {
        errorMessage.value =
          response.data.status?.message || "Erreur lors du renvoi du code";
      }
    } catch (error) {
      console.error("Erreur lors du renvoi du code :", error);
      errorMessage.value =
        error.response?.data?.message || "Erreur lors du renvoi du code";
    } finally {
      isLoading.value = false;
    }
  };
  
  // Initialisation des références des inputs
  onMounted(() => {
    inputs.value = Array.from({ length: 4 }, (_, i) =>
      document.querySelector(`input[ref="input${i}"]`)
    );
  });
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