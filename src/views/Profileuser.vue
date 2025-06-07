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
                <p class="phone">
                  <img src="../assets/iphone.png" class="icon" />
                  {{ user.phone }}
                </p>
              </div>
        
              <div class="info-row">
                <p class="email">
                  <img src="../assets/email.png" class="icon" />
                  {{ user.email || "Non défini" }}
                </p>
              </div>

              <div class="info-row">
                <p class="companies">
                  <ion-icon :icon="businessOutline" class="icon"></ion-icon>
                  Entreprises possédées: {{ user.companiesOwned?.length || 0 }}
                </p>
                <p class="companies">
                  <ion-icon :icon="peopleOutline" class="icon"></ion-icon>
                  Entreprises rejointes: {{ user.companiesJoined?.length || 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <ion-item class="item" button @click="goToNotifications">
          <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
          <ion-label>Notifications</ion-label>
        </ion-item>
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
                  v-model="user.fullname"
                  :value="user.fullname"
                  @ionInput="user.fullname = $event.detail.value"
                  placeholder="Nom Complet"
                ></ion-input>
              </ion-item>
              <ion-item class="item">
                <ion-input
                  v-model="user.email"
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
                  v-model="user.phone"
                  placeholder="Téléphone"
                  readonly
                ></ion-input>
              </ion-item>
              <ion-item class="item">
                <ion-input
                  type="date"
                  v-model="user.birthday"
                  @ionInput="user.birthday = $event.detail.value"
                  placeholder="Anniversaire"
                ></ion-input>
              </ion-item>
              <ion-item class="item">
                <ion-select
                  v-model="user.gender"
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

           

            <ion-item class="item">
  <ion-label>Expiration de session</ion-label>
  <ion-toggle
    v-model="sessionExpirationEnabled"
    @ionChange="handleToggleChange($event.detail.checked)"
  ></ion-toggle>
</ion-item>

<template v-if="sessionExpirationEnabled">
  <ion-item class="item">
    <ion-label position="stacked">Durée (minutes)</ion-label>
    <ion-input
      type="number"
      min="1"
      v-model.number="sessionExpirationMinutes"
      placeholder="Durée en minutes"
    ></ion-input>
  </ion-item>
  
  <ion-button
    expand="block"
    @click="updateSessionExpirationSettings"
    :disabled="!sessionExpirationMinutes || sessionExpirationMinutes < 1"
  >
    <ion-spinner v-if="loading" name="crescent"></ion-spinner>
    <span v-else>Enregistrer la durée</span>
  </ion-button>
  
  <ion-note v-if="user.sessionExpiration">
    Durée actuelle: {{ user.sessionExpiration }} minutes
  </ion-note>
</template>

            <div class="buttonContainer">
              <ion-button expand="block" class="back-button" @click="previousPage">Retour</ion-button>
              <ion-button expand="block" class="next-button" @click="saveProfile">Enregistrer</ion-button>
            </div>
            <ion-item class="item">
              <ion-label color="danger">Supprimer mon compte</ion-label>
              <ion-button @click="confirmDeletion" fill="outline" color="danger">
                Supprimer
              </ion-button>
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
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonContent, IonAvatar, IonButton,
  IonInput, IonItem, IonList, IonSelect, IonSelectOption,
  IonLabel, IonToggle, IonIcon, IonToast,
  toastController
} from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';

import { businessOutline, peopleOutline } from 'ionicons/icons';
import { useUserController } from '@/controllers/UserController';
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
    const error = ref<string | null>(null);
    const showDeleteToast = ref(false);
    const deleteToastMessage = ref('');
    const page = ref(1);
    const sessionExpirationEnabled = ref(false);
    const sessionExpirationMinutes = ref<number | null>(0);
      const unreadCount = ref(0);
    const userController = useUserController();
    const {
      userProfile: user,
      loadUserProfile,
      updateProfile,
      updatePassword,
      updateSessionExpiration,
      uploadImage,
      requestAccountDeletion
    } = userController;

    const passwords = ref({
      old: '',
      new: '',
      confirm: ''
    });

    /*onMounted(async () => {
      try {
        await loadUserProfile();
      } catch (err) {
        error.value = "Session expirée - Veuillez vous reconnecter";
        console.error(err);
        router.push('/login');
      }
    });
*/
onMounted(async () => {
  await loadUserProfile();
  sessionExpirationEnabled.value = !!user.value.sessionExpiration;
  if (user.value.sessionExpiration) {
    sessionExpirationMinutes.value = user.value.sessionExpiration;
  }
});
    const changeImage = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files?.length) {
        try {
          await uploadImage(input.files[0]);
        } catch (err) {
          error.value = "Erreur lors du changement de photo";
          console.error(err);
        }
      }
      
    };
    
    const goToNotifications = () => {
      router.push('/notifications');
    };
    const toggleSessionExpiration = (enabled: boolean) => {
      sessionExpirationEnabled.value = enabled;
      if (!enabled) {
        disableSessionExpiration();
      }
    };

    const updateSessionExpirationSettings = async () => {
  if (!sessionExpirationMinutes.value || sessionExpirationMinutes.value < 1) {
    showToast('Durée invalide (min. 1 minute)', 'danger');
    return;
  }

  const { success, message } = await updateSessionExpiration(sessionExpirationMinutes.value);
  showToast(message, success ? 'success' : 'danger');
};

const showToast = async (message: string, color: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color
  });
  await toast.present();
};
const handleToggleChange = async (enabled: boolean) => {
  sessionExpirationEnabled.value = enabled;
  if (!enabled) {
    const { success, message } = await updateSessionExpiration(null);
    showToast(message, success ? 'success' : 'danger');
  }
};
const disableSessionExpiration = async () => {
  const result = await updateSessionExpiration(null);
  
  const toast = await toastController.create({
    message: result.message,
    duration: 2000,
    color: 'success'
  });
  await toast.present();
  
  // Recharger les données utilisateur
  await loadUserProfile();
};

    const confirmDeletion = () => {
      deleteToastMessage.value = "Êtes-vous sûr de vouloir supprimer votre compte ?";
      showDeleteToast.value = true;
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const triggerFileInput = () => fileInput.value?.click();
    
    const nextPage = () => {
      if (page.value < 3) {
        page.value++;
        if (page.value === 3) {
          saveProfile(true);
        }
      }
    };

    const previousPage = () => {
      if (page.value > 1) {
        page.value--;
      }
    };

    const saveProfile = async (forceProfileUpdate = false) => {
      try {
        if (forceProfileUpdate || page.value !== 3) {
          if (!user.value.fullname?.trim()) {
            throw new Error('Le nom complet est obligatoire');
          }

          await updateProfile({
            fullname: user.value.fullname,
            birthday: user.value.birthday,
            gender: user.value.gender,
            phone: user.value.phone,
            twoFactorEnabled: user.value.twoFactorEnabled
          });
        } else if (passwords.value.old && passwords.value.new && passwords.value.confirm) {
          if (passwords.value.new !== passwords.value.confirm) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          
          await updatePassword(passwords.value);
        } else {
          throw new Error('Action non reconnue');
        }

        const toast = await toastController.create({
          message: 'Profil mis à jour avec succès',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        await loadUserProfile();
        
      } catch (err: any) {
        console.error('[Vue] Erreur:', err.message);
        error.value = err.message;
      }
    };

    return {
      user,
      passwords,
      page,
      error,
      fileInput,
      showDeleteToast,
      deleteToastMessage,
      businessOutline,
      peopleOutline,
      changeImage,
      triggerFileInput,
      nextPage,
      previousPage,
      saveProfile,
      formatDate,
      confirmDeletion,
      sessionExpirationEnabled,
      sessionExpirationMinutes,
      toggleSessionExpiration,
      updateSessionExpirationSettings,
      notificationsOutline,
      goToNotifications,
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
/* Ajoutez dans votre section style */
.expiration-controls {
  margin-top: 15px;
  background: rgba(var(--ion-color-light-rgb), 0.3);
  border-radius: 12px;
  padding: 10px;
}

ion-note {
  display: block;
  text-align: center;
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
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
.expiration-controls {
  margin: 15px 0;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
}

.expiration-controls ion-item {
  --background: transparent;
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
/* Dans le style du composant */
.password-error {
  color: var(--ion-color-danger);
  font-size: 0.9rem;
  margin-top: 5px;
}

.password-success {
  color: var(--ion-color-success);
  font-size: 0.9rem;
  margin-top: 5px;
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
