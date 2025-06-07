<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <a href="/home">
        <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" />
      </a>
      <div class="signup-container">
        <h1>Welcome to the family !</h1>
        <p>You already have an account? <a href="/login">Log in</a></p>

        <div class="socialButtons">
          <div class="google-button-container">
            <div id="google-button"></div>
          </div>

          <div class="facebook-button-container">
            <div id="facebook-button">
              <div class="fb-login-button" data-size="large" data-layout="default" data-auto-logout-link="false" data-use-continue-as="true">
              </div>
            </div>
          </div>
        </div>
 
        <p class="or">Or</p>

        <ion-list class="list">
          <ion-item class="item">
            <ion-input :value="name" @ionInput="name=$event.target.value" placeholder="Fullname"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input :value="email" @ionInput="email=$event.target.value" type="email" placeholder="Email"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input :value="password" @ionInput="password=$event.target.value" type="password" placeholder="Password" clearInput="true"></ion-input>
          </ion-item>
        </ion-list>

        <div class="checkboxContainer">
          <ion-checkbox :checked="acceptTerms" @ionChange="acceptTerms = $event.detail.checked"></ion-checkbox>
          <p class="conditions">
            By signing up, you accept the <a href="#">Utilisation Conditions</a>
          </p>
        </div>

        <div class="captcha-container">
          <div
            ref="hcaptchaElement"
            class="h-captcha"
            data-sitekey="584e15f0-a2b4-4314-ba44-e546d99ae57e"
            data-callback="onCaptchaVerified"
            data-error-callback="onCaptchaError"
            data-expired-callback="onCaptchaExpired"
          ></div>
          <p v-if="captchaStatus" class="captcha-status">{{ captchaStatus }}</p>
        </div>

        <div class="buttonContainer">
          <ion-button expand="block" @click="Signup" class="signupBtn">Sign up</ion-button>
        </div>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue";
import { useSignupController } from "@/controllers/SignupController";

const { name, email, password, acceptTerms, errorMessage, Signup, initializeSocialLogins, setCaptchaToken } =
  useSignupController();

const hcaptchaElement = ref<HTMLElement | null>(null);
const captchaStatus = ref("Loading hCaptcha...");

// Wait for hCaptcha to be available
const waitForHCaptcha = (): Promise<any> => {
  return new Promise((resolve) => {
    if (window.hcaptcha) {
      resolve(window.hcaptcha);
      return;
    }

    const checkHCaptcha = () => {
      if (window.hcaptcha) {
        resolve(window.hcaptcha);
      } else {
        setTimeout(checkHCaptcha, 100);
      }
    };
    
    checkHCaptcha();
  });
};

const initializeHCaptcha = async () => {
  try {
    console.log("Waiting for hCaptcha to load...");
    captchaStatus.value = "Waiting for hCaptcha to load...";
    
    await waitForHCaptcha();
    
    console.log("hCaptcha available:", window.hcaptcha);
    captchaStatus.value = "hCaptcha loaded, rendering widget...";
    
    await nextTick();
    
    if (hcaptchaElement.value) {
      console.log("Rendering hCaptcha widget...");
      window.hcaptcha.render(hcaptchaElement.value, {
        sitekey: "584e15f0-a2b4-4314-ba44-e546d99ae57e",
        callback: "onCaptchaVerified",
        "error-callback": "onCaptchaError",
        "expired-callback": "onCaptchaExpired"
      });
      captchaStatus.value = "hCaptcha widget rendered successfully!";
      setTimeout(() => {
        captchaStatus.value = "";
      }, 3000);
    } else {
      console.error("hCaptcha element not found");
      captchaStatus.value = "Error: hCaptcha element not found";
    }
  } catch (error) {
    console.error("Error initializing hCaptcha:", error);
    captchaStatus.value = `Error loading hCaptcha: ${error}`;
  }
};

onMounted(async () => {
  console.log("Component mounted, current URL:", window.location.href);
  
  // Initialize social logins first
  initializeSocialLogins();
  
  // Then initialize hCaptcha
  await initializeHCaptcha();
});

declare global {
  interface Window {
    onCaptchaVerified: (token: string) => void;
    onCaptchaError: (error: any) => void;
    onCaptchaExpired: () => void;
    hcaptcha: any;
  }
}

window.onCaptchaVerified = function (token: string) {
  console.log('hCaptcha verified successfully:', token);
  setCaptchaToken(token);
  captchaStatus.value = "✅ Captcha verified!";
};

window.onCaptchaError = function (error: any) {
  console.error('hCaptcha error:', error);
  captchaStatus.value = `❌ Captcha error: ${error}`;
};

window.onCaptchaExpired = function () {
  console.log('hCaptcha expired');
  setCaptchaToken("");
  captchaStatus.value = "⏰ Captcha expired, please verify again";
};
</script>


<style scoped>
.ion-padding {
  --background: white;
}
.signup-container {
  text-align: center;
  max-width: 600px;
  margin: auto;
}
.logo {
  width: 150px;
  margin-bottom: 10px;
}

h1 {
  font-size: 40px;
  color: #47463d;
}

p {
  font-size: 15px;
  color: #47463d;
}


.socialButtons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px; 
  margin-bottom: 20px;
  margin-top: 30px;
  width: 100%;
}

#facebook-button , #facebook-button{ 
  width: 250px; 
  height: 50px; 
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;

}
.google-button-container, .facebook-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.fb-login-button {
  transform: scale(0.95); 
  width: 100%;
}


.or {
  margin: 10px 0;
  font-weight: bold;
  color: #47463d;
}

.list {
  background: transparent;
}
.item {
  --background: #dfc925;
  --border-radius: 10px;
  --border-color: #47463d;
  --padding-start: 15px;
  --inner-padding-end: 15px;
  margin-bottom: 20px;
  margin-top: 15px;
}

.checkboxContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.conditions {
  font-size: 15px;
  color: #47463d;
}

.buttonContainer {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}
.signupBtn {
  --background: #47463d;
  --color: white;
  --border-radius: 8px;
  height: 35px;
  width: 150px;
}

.captcha-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
  overflow: visible;
}

.h-captcha {
  display: block !important;
  visibility: visible !important;
  min-height: auto;
  max-width: 100%;
  transform-origin: center;
}

/* Media query for mobile devices */
@media screen and (max-width: 400px) {
  .h-captcha {
    transform: scale(0.85); /* Scale down slightly on mobile */
    margin: 0 auto;
  }
}

/* For very small screens */
@media screen and (max-width: 340px) {
  .h-captcha {
    transform: scale(0.75); /* Scale down more on very small screens */
  }
}

.captcha-status {
  margin-top: 10px;
  font-size: 14px;
}   
</style>