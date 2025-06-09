<template>
  <ion-page>
    <ion-header :translucent="true">
 
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="container">
    

   
        <div class="profile-header">
           <!--<div class="logo-section">
            <img src="../assets/logo-iberis.png" alt="Logo" class="company-logo" />
          </div>-->
          
          <div class="user-card">
            <h1 class="user-name">{{ user.fullname || "Guest" }}</h1>
            
            <div class="user-stats">
              <div class="stat-item">
                <img src="../assets/profile.png" class="stat-icon" />
                <span>{{ user.status || "Not defined" }}</span>
              </div>
              <div class="stat-item">
                <img src="../assets/iphone.png" class="stat-icon" />
                <span>{{ user.phone }}</span>
              </div>
              <div class="stat-item">
                <img src="../assets/email.png" class="stat-icon" />
                <span>{{ user.email || "Not defined" }}</span>
              </div>
            </div>

            <div class="company-stats">
              <div class="company-stat">
                <ion-icon :icon="businessOutline" class="company-icon"></ion-icon>
                <span>{{ user.companiesOwned?.length || 0 }} Owned</span>
              </div>
              <div class="company-stat">
                <ion-icon :icon="peopleOutline" class="company-icon"></ion-icon>
                <span>{{ user.companiesJoined?.length || 0 }} Joined</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Button -->
        <div class="notification-section">
          <ion-button class="notification-button" fill="outline" @click="goToNotifications">
            <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
            Notifications
          </ion-button>
        </div>

        <!-- Form Container -->
        <div class="form-container">
          <!-- Page 1: Profile Info -->
               <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-step" :class="{ active: page >= 1 }">1</div>
          <div class="progress-line" :class="{ active: page >= 2 }"></div>
          <div class="progress-step" :class="{ active: page >= 2 }">2</div>
          <div class="progress-line" :class="{ active: page >= 3 }"></div>
          <div class="progress-step" :class="{ active: page >= 3 }">3</div>
        </div>
          <div v-if="page === 1" class="fade-enter-active">
            <h2 class="section-title">Personal Information</h2>
            
            <div class="avatar-section">
              <div class="avatar-container">
                <ion-avatar class="profile-avatar">
                  <img :src="user.image" alt="Avatar" />
                </ion-avatar>
                <div class="avatar-overlay" @click="triggerFileInput">
                  <ion-icon :icon="addOutline" class="avatar-edit-icon"></ion-icon>
                </div>
              </div>
              <ion-button class="avatar-button" fill="outline" @click="triggerFileInput">
                Change Photo
              </ion-button>
              <input
                type="file"
                accept="image/*"
                @change="changeImage"
                style="display: none"
                ref="fileInput"
              />
            </div>

            <div class="input-group">
              <ion-label class="label">Full Name</ion-label>
              <ion-item class="custom-input">
                <ion-input
                  v-model="user.fullname"
                  :value="user.fullname"
                  @ionInput="user.fullname = $event.detail.value"
                  placeholder="Your full name"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Email</ion-label>
              <ion-item class="custom-input readonly">
                <ion-input
                  v-model="user.email"
                  placeholder="Your email"
                  readonly
                ></ion-input>
              </ion-item>
            </div>

            <div class="button-container">
              <ion-button expand="block" class="next-button" @click="nextPage">
                Next
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Page 2: Personal Details -->
          <div v-if="page === 2" class="fade-enter-active">
            <h2 class="section-title">Personal Details</h2>

            <div class="input-group">
              <ion-label class="label">Phone</ion-label>
              <ion-item class="custom-input readonly">
                <ion-input
                  v-model="user.phone"
                  placeholder="Your phone number"
                  readonly
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Birth Date</ion-label>
              <ion-item class="custom-input">
                <ion-input
                  type="date"
                  v-model="user.birthday"
                  @ionInput="user.birthday = $event.detail.value"
                  placeholder="Your birthday"
                ></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-label class="label">Gender</ion-label>
              <ion-item class="custom-input">
                <ion-select
                  v-model="user.gender"
                  @ionChange="user.gender = $event.detail.value"
                  placeholder="Select your gender"
                >
                  <ion-select-option value="male">Male</ion-select-option>
                  <ion-select-option value="female">Female</ion-select-option>
                  <ion-select-option value="other">Other</ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="button-container">
              <ion-button fill="outline" class="back-button" @click="previousPage">
                <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                Back
              </ion-button>
              <ion-button class="next-button" @click="nextPage">
                Next
                <ion-icon :icon="arrowForward" slot="end"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Page 3: Security Settings -->
          <div v-if="page === 3" class="fade-enter-active">
            <h2 class="section-title">Security Settings</h2>

            <div class="password-section">
              <div class="input-group">
                <ion-label class="label">Old Password</ion-label>
                <ion-item class="custom-input">
                  <ion-input
                    type="password"
                    v-model="passwords.old"
                    placeholder="Old password"
                  ></ion-input>
                </ion-item>
              </div>

              <div class="input-group">
                <ion-label class="label">New Password</ion-label>
                <ion-item class="custom-input">
                  <ion-input
                    type="password"
                    v-model="passwords.new"
                    placeholder="New password"
                  ></ion-input>
                </ion-item>
              </div>

              <div class="input-group">
                <ion-label class="label">Confirm Password</ion-label>
                <ion-item class="custom-input">
                  <ion-input
                    type="password"
                    v-model="passwords.confirm"
                    placeholder="Confirm password"
                  ></ion-input>
                </ion-item>
              </div>
            </div>

            <!-- Session Expiration Settings -->
            <div class="session-section">
              <div class="toggle-container">
                <ion-item class="toggle-item">
                  <ion-label>Session Expiration</ion-label>
                  <ion-toggle
                    v-model="sessionExpirationEnabled"
                    @ionChange="handleToggleChange($event.detail.checked)"
                  ></ion-toggle>
                </ion-item>
              </div>

              <div v-if="sessionExpirationEnabled" class="expiration-controls">
                <div class="input-group">
                  <ion-label class="label">Duration (minutes)</ion-label>
                  <ion-item class="custom-input">
                    <ion-input
                      type="number"
                      min="1"
                      v-model.number="sessionExpirationMinutes"
                      placeholder="Duration in minutes"
                    ></ion-input>
                  </ion-item>
                </div>
                
                <ion-button
                  expand="block"
                  class="session-button"
                  @click="updateSessionExpirationSettings"
                  :disabled="!sessionExpirationMinutes || sessionExpirationMinutes < 1"
                >
                  <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                  <span v-else>Save Duration</span>
                </ion-button>
                
                <ion-note v-if="user.sessionExpiration" class="session-note">
                  Current duration: {{ user.sessionExpiration }} minutes
                </ion-note>
              </div>
            </div>

            <div class="button-container">
              <ion-button fill="outline" class="back-button" @click="previousPage">
                <ion-icon :icon="arrowBack" slot="start"></ion-icon>
                Back
              </ion-button>
              <ion-button class="submit-button" @click="saveProfile">
                <ion-icon :icon="checkmark" slot="start"></ion-icon>
                Save
              </ion-button>
            </div>
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
  IonLabel, IonToggle, IonIcon, IonToast, IonToolbar, IonTitle,
  IonSpinner, IonNote, toastController
} from '@ionic/vue';
import { 
  notificationsOutline, businessOutline, peopleOutline,
  addOutline, arrowForward, arrowBack, checkmark,
  warningOutline, trashOutline
} from 'ionicons/icons';
import { useUserController } from '@/controllers/UserController';

export default defineComponent({
  name: 'ProfilePage',
  components: {
    IonPage, IonHeader, IonContent, IonAvatar, IonButton,
    IonInput, IonItem, IonList, IonSelect, IonSelectOption,
    IonLabel, IonToggle, IonIcon, IonToast, IonToolbar, IonTitle,
    IonSpinner, IonNote
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
    const loading = ref(false);
    
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
          error.value = "Error changing photo";
          console.error(err);
        }
      }
    };
    
    const goToNotifications = () => {
      router.push('/notifications');
    };

    const updateSessionExpirationSettings = async () => {
      if (!sessionExpirationMinutes.value || sessionExpirationMinutes.value < 1) {
        showToast('Invalid duration (min. 1 minute)', 'danger');
        return;
      }

      loading.value = true;
      const { success, message } = await updateSessionExpiration(sessionExpirationMinutes.value);
      loading.value = false;
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

    const confirmDeletion = () => {
      deleteToastMessage.value = "Are you sure you want to delete your account?";
      showDeleteToast.value = true;
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
            throw new Error('Full name is required');
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
            throw new Error('Passwords do not match');
          }
          
          await updatePassword(passwords.value);
        } else {
          throw new Error('Unrecognized action');
        }

        const toast = await toastController.create({
          message: 'Profile updated successfully',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        await loadUserProfile();
        
      } catch (err: any) {
        console.error('[Vue] Error:', err.message);
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
      sessionExpirationEnabled,
      sessionExpirationMinutes,
      loading,
      businessOutline,
      peopleOutline,
      notificationsOutline,
      addOutline,
      arrowForward,
      arrowBack,
      checkmark,
      warningOutline,
      trashOutline,
      changeImage,
      triggerFileInput,
      nextPage,
      previousPage,
      saveProfile,
      confirmDeletion,
      updateSessionExpirationSettings,
      handleToggleChange,
      goToNotifications,
    };
  }
});
</script>



<style scoped>
ion-content {
  --background: #f5f5f5;
  
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
    color: #191602;
}

.page-title {
  color: #191602;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 16px;
}

/* Progress Bar */
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 400px;
}

.progress-step {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dedace;
  color: #191602;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.progress-step.active {
  background: #dfc925;
  color: white;
}

.progress-line {
  flex: 1;
  height: 3px;
  background: #dedace;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.progress-line.active {
  background: #dfc925;
}

/* Profile Header */
.profile-header {
  
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin-bottom: 16px;
}

.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.company-logo {
  width: 120px;
  height: auto;
}

.user-card {
  text-align: center;
}

.user-name {
  font-size: 28px;
  font-weight: 600;
  color: #dfc925;
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.stat-icon {
  width: 20px;
  height: 20px;
}

.company-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.company-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #47463d;
  font-weight: 500;
}

.company-icon {
  font-size: 20px;
  color: #dfc925;
}

/* Notification Section */
.notification-section {
  margin-bottom: 24px;
  width: 100%;
  max-width: 600px;
}

.notification-button {
  width: 100%;
  --border-color: #dfc925;
  --color: #dfc925;
  --border-radius: 12px;
  height: 48px;
}

/* Form Container */
.form-container {

  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.section-title {
  color: #191602;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border: 3px solid #dfc925;
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #dfc925;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid white;
}

.avatar-edit-icon {
  color: white;
  font-size: 18px;
}

.avatar-button {
  --border-color: #dfc925;
  --color: #dfc925;
  --border-radius: 24px;
}

/* Input Groups */
.input-group {

  margin-bottom: 24px;
  width: 100%;
}

.label {
  color: #47463d;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.custom-input {
    color: #000;
  --background: #f8f8f8;
  --border-radius: 8px;
  --border-width: 1px;
  --border-color: #dedace;
  margin-top: 4px;
}

.custom-input:hover {
  --border-color: #dfc925;
}

.custom-input.readonly {
  --background: #f0f0f0;
  opacity: 0.7;
}

/* Password Section */
.password-section {
  margin-bottom: 32px;
}

/* Session Section */
.session-section {
  margin-bottom: 32px;
  color: #000;
}

.toggle-container {
  margin-bottom: 16px;
}

.toggle-item {
  --background: #f8f8f8;
  --border-radius: 8px;
  --border-width: 1px;
  --border-color: #dedace;
}

.expiration-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #dedace;
    color: #000;
}

.session-button {
  --background: #dfc925;
    color: #000;

  --border-radius: 8px;
  margin-top: 16px;
}

.session-note {
    color: #000;

  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

/* Button Container */
.button-container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
}

.next-button,
.back-button,
.submit-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  --border-radius: 24px;
  text-transform: none;
}

.next-button,
.submit-button {
  --background: #dfc925;
  --color: white;
}

.back-button {
  --border-color: #dfc925;
  --color: #dfc925;
}

/* Danger Zone */



/* Animations */
.fade-enter-active {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .form-container {
    padding: 24px;
  }
  
  .button-container {
    flex-direction: column;
  }
  
  .user-stats {
    align-items: center;
  }
  
  .company-stats {
    flex-direction: column;
    align-items: center;
  }
}
</style>