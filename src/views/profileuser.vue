<template>
    <ion-page>
      <ion-header :translucent="true"></ion-header>
  
      <ion-content :fullscreen="true">
        <div class="container">
          <div class="top-section">
            <div class="logo-and-name">
              <img src="../assets/logo-iberis.png" alt="Logo" class="logo" />
              <h1 class="user-name">Salut {{ user.fullname || "Invité" }}</h1>
            </div>
  
            <div class="user-info">
              <div class="info-grid">
                <div class="info-row">
                  <p class="status">
                    <img src="../assets/profile.png" class="icon" />
                    {{ user.status || "Non défini" }}
                  </p>
                  <p class="verified">
                    <img src="../assets/iphone.png" class="icon" />
                    Vérifié: {{ user.verificationCode || "Non vérifié" }}
                  </p>
                </div>
  
                <div class="info-row">
                  <p class="email">
                    <img src="../assets/gmail.png" class="icon" />
                    {{ user.email || "Non défini" }}
                  </p>
                </div>
  
                <div class="info-row">
                  <p class="subscription">
                    <ion-icon :icon="calendarOutline" class="icon"></ion-icon>
                    {{ user.subscription || "Non défini" }}
                  </p>
                  <p class="companies">
                    <ion-icon :icon="businessOutline" class="icon"></ion-icon>
                    Entreprise(s) possédées: {{ user.companiesOwned || "Aucune" }}
                  </p>
                  <p class="companies">
                    <ion-icon :icon="peopleOutline" class="icon"></ion-icon>
                    Entreprise(s) rejointes: {{ user.companiesJoined || "Aucune" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
  
          <div class="form-section">
            <div v-if="page === 1">
              <div class="avatar-section">
                <input
                  type="file"
                  accept="image/*"
                  @change="changeImage"
                  style="display: none"
                  ref="fileInput"
                />
                <ion-avatar @click="triggerFileInput">
                  <img :src="user.image" alt="Avatar" />
                </ion-avatar>
                <ion-button fill="outline" @click="triggerFileInput">Changer la photo</ion-button>
              </div>
  
              <ion-list class="list">
                <ion-item class="item">
                  <ion-input
                    :value="user.fullname"
                    @ionInput="user.fullname = $event.target.value"
                    placeholder="Nom Complet"
                  ></ion-input>
                </ion-item>
                <ion-item class="item">
                  <ion-input
                    :value="user.email"
                    @ionInput="user.email = $event.target.value"
                    placeholder="Email"
                    readonly
                  ></ion-input>
                </ion-item>
              </ion-list>
  
              <ion-button expand="block" class="next-button" @click="nextPage1">Suivant</ion-button>
            </div>
  
            <div v-if="page === 2">
              <ion-list class="list">
                <ion-item class="item">
                  <ion-input
                    :value="user.phone"
                    @ionInput="user.phone = $event.target.value"
                    placeholder="Téléphone"
                  ></ion-input>
                </ion-item>
                <ion-item class="item">
                  <ion-input
                    type="date"
                    :value="user.birthday"
                    @ionInput="user.birthday = $event.target.value"
                    placeholder="Anniversaire"
                  ></ion-input>
                </ion-item>
                <ion-item class="item">
                  <ion-select
                    :value="user.gender"
                    @ionChange="user.gender = $event.target.value"
                    placeholder="Sélectionnez votre sexe"
                  >
                    <ion-select-option value="male">Homme</ion-select-option>
                    <ion-select-option value="female">Femme</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-list>
  
              <div class="buttonContainer">
                <ion-button expand="block" class="back-button" @click="previousPage">Retour</ion-button>
                <ion-button expand="block" class="next-button" @click="nextPage2">Suivant</ion-button>
              </div>
            </div>
  
            <div v-if="page === 3">
              <ion-list class="list">
                <ion-item class="item">
                  <ion-input
                    type="password"
                    :value="passwords.old"
                    @ionInput="passwords.old = $event.target.value"
                    placeholder="Ancien mot de passe"
                  ></ion-input>
                </ion-item>
                <ion-item class="item">
                  <ion-input
                    type="password"
                    :value="passwords.new"
                    @ionInput="passwords.new = $event.target.value"
                    placeholder="Nouveau mot de passe"
                  ></ion-input>
                </ion-item>
                <ion-item class="item">
                  <ion-input
                    type="password"
                    :value="passwords.confirm"
                    @ionInput="passwords.confirm = $event.target.value"
                    placeholder="Confirmer le mot de passe"
                  ></ion-input>
                </ion-item>
              </ion-list>
  
              <div class="buttonContainer">
                <ion-button expand="block" class="back-button" @click="previousPage">Retour</ion-button>
                <ion-button expand="block" class="next-button" @click="updatePassword">Mettre à jour</ion-button>
              </div>
  
              <ion-item class="item">
                <ion-label>Vérification en 2 étapes</ion-label>
                <ion-toggle v-model="user.twoFactor"></ion-toggle>
              </ion-item>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import { calendarOutline, businessOutline, peopleOutline } from 'ionicons/icons';
  export default {
    data() {
      let storedUser = null;
      try {
        const userString = localStorage.getItem('user');
        storedUser = userString ? JSON.parse(userString) : null;
      } catch (e) {
        console.error("Erreur de parsing :", e);
        storedUser = null;
      }
  
      return {
        page: 1,
        user: storedUser || {
          image: "https://mamzellesenvadrouille.com/wp-content/uploads/2022/10/Madrid-1140x912.jpeg.webp",
          fullname: "Invité",
          email: "",
          phone: "",
          birthday: "",
          gender: "",
          status: "Gratuit",
          verificationCode: "",
          subscription: "Forever",
          companiesOwned: "Aucune",
          companiesJoined: "Aucune",
          twoFactor: false,
        },
        passwords: {
          old: "",
          new: "",
          confirm: "",
        }
      };
    },
    methods: {
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      changeImage(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.user.image = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      },
      nextPage1() {
        this.page = 2;
      },
      nextPage2() {
        this.page = 3;
      },
      previousPage() {
        if (this.page > 1) {
          this.page -= 1;
        }
      },
      updatePassword() {
        if (this.passwords.new !== this.passwords.confirm) {
          alert("Les mots de passe ne correspondent pas.");
          return;
        }
        alert("Mot de passe mis à jour !");
      },
    },
    mounted() {
      if (!localStorage.getItem('jwt_token')) {
        this.$router.push('/login');
      }
    }
  };
  </script>
  
  <style scoped>
  ion-content {
    --background: white;
  }
  
  .container {
    display: flex;
    flex-direction: column;
    padding: 24px;
  }
  
  .top-section {
    width: 100%;
  }
  
  .logo {
    width: 180px;
    text-align: left;
  }
  
  .user-name {
    font-size: 22px;
    font-weight: 600;
    color: #333;
  }
  
  .info-grid {
    width: 100%;
    display: grid;
    gap: 1px;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #555;
  }
  
  .icon {
    margin-right: 8px;
    width: 20px;
    height: 22px;
  }
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .list {
    background: transparent;
    width: 100%;
  }
  
  .item {
    --background: #a6a49c;
    --border-radius: 10px;
    --border-color: #47463d;
    --padding-start:15px;
    --inner-padding-end: 15px;
    margin-bottom: 20px;
    margin-top: 45px;
    color: #333;
  }
  
  .next-button {
    margin-top: 20px;
    width: 100%;
    font-weight: 600;
    --background: #dfc925;
    --color: #474646;
  }
  
  .back-button {
    margin-top: 20px;
    width: 100%;
    font-weight: 600;
    --background: #6c757d;
    --color: #474646;
  }
  
  .buttonContainer {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 20px;
  }
  </style>