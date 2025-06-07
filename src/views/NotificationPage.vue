<template>
  <ion-page>
    <ion-content :fullscreen="true" class="content">
      <!-- En-tête -->
      <div class="header-content">
        <img src="../assets/logo-iberis.png" alt="Iberis Logo" class="logo" @click="goToProfile">
        <ion-button fill="clear" @click.stop="showSettings = true" class="settings-btn">
          <ion-icon :icon="settingsOutline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <!-- Contenu principal -->
      <div class="notification-container" v-if="!showSettings">
        <div class="section-title">
          <h2>Notifications</h2>
          
        </div>

        <!-- Liste des notifications -->
        <ion-list class="notification-list" v-if="notifications.length > 0">
          <ion-item
            v-for="notification in notifications"
            :key="notification.notificationHashedId || notification.hashed_id"
            :class="{ 'unseen': !notification.seen_at }"
            @click="markAsRead(notification)"
          >
            <ion-icon
              :icon="getNotificationIcon(notification)"
              slot="start"
              class="icon"
              :color="!notification.seen_at ? 'primary' : 'medium'"
            />
            <ion-label>
              <h3>{{ notification.title }}</h3>
              <p>{{ notification.body || notification.content }}</p>
              <small>{{ formatDate(notification.created_at) }}</small>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="empty-state" v-else>
          <ion-icon :icon="notificationsOffOutline" size="large"></ion-icon>
          <p>Aucune notification</p>
        </div>
      </div>

      <!-- Panneau des paramètres en plein écran -->
      <div class="settings-container" v-if="showSettings">
        <div class="settings-header">
          <ion-button fill="clear" @click="showSettings = false" class="back-btn">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
          <h2>Paramètres de notification</h2>
        </div>

        <ion-list class="settings-list">
          <ion-item lines="none">
            <ion-icon :icon="notificationsOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Activer toutes les notifications</h3>
              <p>Recevoir toutes les notifications</p>
            </ion-label>
            <ion-toggle v-model="preferences.all" @ionChange="toggleAllNotifications" />
          </ion-item>

          <div class="divider"></div>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="logInOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Notification de Connexion</h3>
              <p>Alertes de sécurité lors des connexions</p>
            </ion-label>
            <ion-toggle v-model="preferences.login" />
          </ion-item>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="businessOutline" slot="start" class="icon" />
            <ion-label>
              <h3>La société se termine bientôt</h3>
              <p>Alerte avant suppression pour limite d'abonnement</p>
            </ion-label>
            <ion-toggle v-model="preferences.company" />
          </ion-item>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="personAddOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Invitation de collaborateur expirée</h3>
              <p>Notification quand une invitation expire</p>
            </ion-label>
            <ion-toggle v-model="preferences.invite" />
          </ion-item>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="cardOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Échéance de l'abonnement</h3>
              <p>Rappel avant fin de période d'abonnement</p>
            </ion-label>
            <ion-toggle v-model="preferences.subscription" />
          </ion-item>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="helpCircleOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Centre de support</h3>
              <p>Notifications sur vos tickets de support</p>
            </ion-label>
            <ion-toggle v-model="preferences.support" />
          </ion-item>

          <ion-item lines="none" :disabled="preferences.all">
            <ion-icon :icon="pricetagsOutline" slot="start" class="icon" />
            <ion-label>
              <h3>Nouveautés & Mises à jour</h3>
              <p>Emails occasionnels sur les nouvelles fonctionnalités</p>
            </ion-label>
            <ion-toggle v-model="preferences.birou" />
          </ion-item>
        </ion-list>

        <ion-button 
          expand="block" 
          class="save-button" 
          @click="savePreferences" 
          :disabled="isLoading"
        >
          <ion-spinner v-if="isLoading" name="crescent" />
          <span v-else>Enregistrer</span>
        </ion-button>
      </div>

      <!-- Toast de confirmation -->
      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :color="toastColor"
        position="top"
        duration="2000"
        @didDismiss="showToast = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent, IonItem, IonLabel, IonList, IonButton,
  IonToast, IonIcon, IonToggle, IonSpinner, IonSegment, IonSegmentButton
} from '@ionic/vue';
import {
  notificationsOutline, settingsOutline, notificationsOffOutline, arrowBackOutline,
  logInOutline, businessOutline, personAddOutline, cardOutline,
  helpCircleOutline, pricetagsOutline, mailOutline, alertCircleOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { useNotificationController } from '@/controllers/NotificationController';
import { useRouter } from 'vue-router';

const router = useRouter();
const {
  isLoading,
  error,
  notifications,
  updateNotificationPreferences,
  getNotifications
} = useNotificationController();

// États
const filterStatus = ref('all');
const showSettings = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Préférences
const preferences = ref({
  all: false,
  login: false,
  company: false,
  invite: false,
  subscription: false,
  support: false,
  birou: false,
  token: ''
});

// Chargement initial
onMounted(async () => {
  const { value } = await Preferences.get({ key: 'auth_token' });
  if (value) preferences.value.token = value;
  await loadNotifications();
});

const loadNotifications = async () => {
  try {
    await getNotifications(filterStatus.value === 'all' ? 0 : parseInt(filterStatus.value));
  } catch (err) {
    showToastMessage('Erreur lors du chargement', 'danger');
  }
};

const getNotificationIcon = (notification: any) => {
  if (!notification?.title) return mailOutline;
  if (notification.title.toLowerCase().includes('alerte')) return alertCircleOutline;
  return mailOutline;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const markAsRead = async (notification: any) => {
  if (!notification?.seen_at) {
    notification.seen_at = new Date().toISOString();
  }
};

const showToastMessage = (message: string, color: string = 'success') => {
  toastMessage.value = message;
  toastColor.value = color;
  showToast.value = true;
};

const goToProfile = () => {
  router.push('/profile');
};

const toggleAllNotifications = () => {
  if (preferences.value.all) {
    preferences.value.login = false;
    preferences.value.company = false;
    preferences.value.invite = false;
    preferences.value.subscription = false;
    preferences.value.support = false;
    preferences.value.birou = false;
  }
};

const savePreferences = async () => {
  try {
    const filteredPrefs: any = {};
    if (preferences.value.token) filteredPrefs.token = preferences.value.token;

    for (const [key, value] of Object.entries(preferences.value)) {
      if (value === true || key === 'token') {
        filteredPrefs[key] = value;
      }
    }

    await updateNotificationPreferences(filteredPrefs);
    showSettings.value = false;
    showToastMessage('Préférences enregistrées avec succès');
  } catch (err) {
    showToastMessage(error.value || 'Une erreur est survenue', 'danger');
  }
};
</script>

<style scoped>
.content {
  --background: #f8f8f8; /* Fond gris clair */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px;
}

.logo {
  height: 70px;
  width: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.settings-btn {
  --padding-start: 0;
  --padding-end: 0;
  color: #6b6b6b;
}

.notification-container {
  padding: 10px;
  max-width: 700px;
  margin: 0 auto;
}

.section-title {
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #dfc925; /* Noir pour le titre */
  margin-bottom: 12px;
}

.custom-segment {
  --background: #030303;
  border-radius: 8px;
  padding: 4px;
}

ion-segment-button {
  --color: #85898f;
  --color-checked: #1a1a1a;
  --indicator-color: #dfc925;
  --indicator-height: 3px;
  font-weight: 500;
}

.notification-list {
  background: rgb(240, 232, 148);
  border-radius: 12px;
  padding: 10px;
  font-weight: 900;
}
.item {
  --background: transparent;
  --padding-start: 12px;
  --padding-end: 12px;
  --inner-padding-end: 0;
  --min-height: 60px;
  --border-radius: 12px;
  color: black;


}

.notification-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 80px;
  --border-color: #f0f0f0;
  --background-hover: #fafafa;
  background-color: #dfc925;
  font-size: 1.4rem;


}

.notification-item.unseen {
  border-left: 4px solid #dfc925;
  background-color: rgba(223, 201, 37, 0.05);
}

.icon {
  font-size: 1.5rem;
  margin-right: 16px;
}

.notification-title {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.notification-content {
  color: #666666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-date {
  color: #9a9a9a;
  font-size: 0.8rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}


.empty-icon {
  color: #d1d1d6;
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #9a9a9a;
  font-size: 1rem;
  margin-top: 8px;
}

/* Styles pour le panneau des paramètres */


.settings-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.settings-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 auto;
}

.back-btn {
  --padding-start: 0;
  --padding-end: 0;
  color: #6b6b6b;
  position: absolute;
  left: 0;
}

.settings-list {
  background: transparent;
  padding: 0;
}

.settings-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 64px;
  --background-hover: #fafafa;
}

.settings-icon {
  color: #dfc925;
  font-size: 1.25rem;
  margin-right: 16px;
}

.settings-label h3 {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.settings-label p {
  color: #7a7a7a;
  font-size: 0.85rem;
  margin-top: 2px;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.custom-toggle {
  --background: #e0e0e0;
  --background-checked: #dfc925;
  --handle-background: white;
  --handle-background-checked: white;
}

.save-button {
  --background: #dfc925;
  --color: #1a1a1a;
  --border-radius: 19px;
  margin: 4px 0;
  padding: 7px 70px; /* réduit l'espace intérieur, ajustable */

}

.save-button:disabled {
  --background: #e2e8f0;
  --color: #a0aec0;
}

.custom-toast {
  --background: #2d3748;
  --color: white;
  --border-radius: 8px;
  font-size: 0.9rem;
}
</style>
