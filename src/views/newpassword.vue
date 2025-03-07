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
  
            <!-- Affichage des messages d'erreur -->
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  
            <!-- Affichage des messages de succès -->
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
  
  const API_BASE_URL = "https://api.iberis.io";
  const router = useRouter();
  const route = useRoute();
  const email = ref(route.query.email || "");
  const token = ref(route.query.token || "");
  const newPassword = ref("");
  const confirmPassword = ref("");
  const errorMessage = ref("");
  const successMessage = ref("");
  const isLoading = ref(false);
  
  const isFormValid = computed(() => {
    return (
      newPassword.value.length >= 8 &&
      confirmPassword.value.length >= 8 &&
      newPassword.value === confirmPassword.value
    );
  });
  const updatePassword = async () => {
  try {
    if (!isFormValid.value) {
      errorMessage.value = "Veuillez remplir correctement les champs.";
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    console.log("Données envoyées à l'API :", {
      token: token.value,
      password: newPassword.value,
      new_password: confirmPassword.value,
    });

    const response = await axios.post(
      `${API_BASE_URL}/fr/api/private/user/reset/new`,
      {
        token: token.value,
        password: newPassword.value,
        new_password: confirmPassword.value,
      },
      {
        timeout: 5000, 
      }
    );

    console.log("Réponse de l'API :", response.data);

    if (response.data.status?.code === 200) {
      successMessage.value = "Votre mot de passe a été mis à jour avec succès.";
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else if (response.data.status?.code === 404) {
      errorMessage.value = "Jeton non trouvé. Veuillez réessayer.";
    } else if (response.data.status?.code === 500) {
      errorMessage.value = "Le jeton a expiré. Veuillez demander un nouveau jeton.";
    } else if (response.data.status?.code === 501) {
      errorMessage.value = "Les mots de passe ne correspondent pas.";
    } else {
      errorMessage.value =
        response.data.status?.message || "Erreur lors de la mise à jour du mot de passe.";
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    if (error.code === "ERR_NETWORK") {
      errorMessage.value = "Problème de connexion au serveur. Vérifiez votre connexion Internet.";
    } else {
      errorMessage.value =
        error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe.";
    }
  } finally {
    isLoading.value = false;
  }
};
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