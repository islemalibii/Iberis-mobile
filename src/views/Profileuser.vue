<template>
  <ion-page>
    <ion-header :translucent="true"></ion-header>

    <ion-content :fullscreen="true">
      <div class="container">
        <div class="top-section">
          <div class="logo-and-name">
            <img src="../assets/logo-iberis.png" alt="Logo" class="logo" />
            <h1 class="user-name">{{ user.fullname || "Invité" }}</h1>
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
                  <img src="../assets/email.png" class="icon" />
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
                    @ionInput="user.fullname = $event.detail.value"
                    placeholder="Nom Complet"
                  ></ion-input>

              </ion-item>
              <ion-item class="item">
                <ion-input
                    :value="user.email"
                    placeholder="Email"
                    readonly
                  ></ion-input>

              </ion-item>
            </ion-list>

            <ion-button expand="block" class="next-button" @click="nextPage">Suivant</ion-button>
          </div>

          <div v-if="page === 2">
            <ion-list class="list">
              <ion-item class="item">
                <ion-input
                    :value="user.phone"
                    placeholder="Téléphone"
                    readonly
                  ></ion-input>

              </ion-item>
              <ion-item class="item">
                <ion-input
                    type="date"
                    :value="user.birthday"
                    @ionInput="user.birthday = $event.detail.value"
                    placeholder="Anniversaire"
                  ></ion-input>

              </ion-item>
              <ion-item class="item">
                <ion-select
                    :value="user.gender"
                    @ionChange="user.gender = $event.detail.value"
                    placeholder="Sélectionnez votre sexe"
                  >
                    <ion-select-option value="male">Homme</ion-select-option>
                    <ion-select-option value="female">Femme</ion-select-option>
                    <ion-select-option value="other">Autre</ion-select-option>
                  </ion-select>

              </ion-item>
            </ion-list>

            <div class="buttonContainer">
              <ion-button expand="block" class="back-button" @click="previousPage">Retour</ion-button>
              <ion-button expand="block" class="next-button" @click="nextPage">Suivant</ion-button>
            </div>
          </div>

          <div v-if="page === 3">
            <ion-list class="list">
              <ion-item class="item">
                <ion-input
                    type="password"
                    v-model="passwords.old"
                    placeholder="Ancien mot de passe"
                  ></ion-input>

              </ion-item>
              <ion-item class="item">
                <ion-input
                    type="password"
                    v-model="passwords.new"
                    placeholder="Nouveau mot de passe"
                  ></ion-input>

              </ion-item>
              <ion-item class="item">
                <ion-input
                    type="password"
                    v-model="passwords.confirm"
                    placeholder="Confirmer le mot de passe"
                  ></ion-input>

              </ion-item>
            </ion-list>

            <div class="buttonContainer">
              <ion-button expand="block" class="back-button" @click="previousPage">Retour</ion-button>
              <ion-button expand="block" class="next-button" @click="saveProfile">Enregistrer</ion-button>
            </div>

            <ion-item class="item">
              <ion-label>Vérification en 2 étapes</ion-label>
              <ion-toggle 
                  :checked="user.twoFactorEnabled" 
                  @ionChange="user.twoFactorEnabled = $event.detail.checked"
                ></ion-toggle>

            </ion-item>
          </div>
        </div>
      </div>

      <ion-toast
        :is-open="!!error"
        :message="error"
        @didDismiss="error = null"
        color="danger"
        duration="3000"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonContent, IonAvatar, IonButton,
  IonInput, IonItem, IonList, IonSelect, IonSelectOption,
  IonLabel, IonToggle, IonIcon, IonToast
} from '@ionic/vue';
import { calendarOutline, businessOutline, peopleOutline } from 'ionicons/icons';
import { AuthService } from '@/services/User';

interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  image: string;
  birthday?: string;
  gender?: string;
  status: string;
  verificationCode: string;
  subscription: string;
  companiesOwned: string[];
  companiesJoined: string[];
  twoFactorEnabled: boolean;
}

export default defineComponent({
  name: 'ProfilePage',
  components: {
    IonPage, IonHeader, IonContent, IonAvatar, IonButton,
    IonInput, IonItem, IonList, IonSelect, IonSelectOption,
    IonLabel, IonToggle, IonIcon, IonToast
  },
  setup() {
    const router = useRouter();
    const fileInput = ref<HTMLInputElement | null>(null);
    const page = ref(1);
    const error = ref<string | null>(null);

    const user = ref<UserProfile>({
      id: 0,
      fullname: '',
      email: '',
      phone: '',
      image: 'https://example.com/default-avatar.jpg',
      status: 'Gratuit',
      verificationCode: '',
      subscription: 'Forever',
      companiesOwned: [],
      companiesJoined: [],
      twoFactorEnabled: false
    });
  

    const passwords = ref({
      old: '',
      new: '',
      confirm: ''
    });

    const loadUserData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await AuthService.fetchUserProfile(token);
        user.value = {
          ...user.value,
          ...profile,
          image: profile.image || user.value.image
        };
      } catch (err) {
        error.value = "Erreur de chargement du profil";
        console.error(err);
      }
    };

    const saveProfile = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await AuthService.updateProfile(token, {
          fullname: user.value.fullname,
          phone: user.value.phone,
          birthday: user.value.birthday,
          gender: user.value.gender,
          twoFactorEnabled: user.value.twoFactorEnabled
        });
        
        // Redirection après sauvegarde
        window.location.href = '/dashboard';
      } catch (err) {
        error.value = "Erreur lors de la sauvegarde";
        console.error(err);
      }
    };

    const changeImage = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files?.length) {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
          const imageUrl = await AuthService.uploadImage(token, input.files[0]);
          user.value.image = imageUrl;
        } catch (err) {
          error.value = "Erreur lors du changement de photo";
          console.error(err);
        }
      }
    };

    const handleInput = (field: string, event: any) => {
      (user.value as any)[field] = event.target.value;
    };

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const nextPage = () => page.value++;
    const previousPage = () => page.value--;

    onMounted(() => {
      loadUserData();
    });

    return {
      user,
      passwords,
      page,
      error,
      fileInput,
      calendarOutline,
      businessOutline,
      peopleOutline,
      changeImage,
      triggerFileInput,
      handleInput,
      nextPage,
      previousPage,
      saveProfile
    };
  }
});
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