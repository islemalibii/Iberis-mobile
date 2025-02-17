<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="content-wrapper">
          <div class="image-container">
            <a href="/home"> <img src="@/assets/iberisLogo.png" alt="iberisLogo" class="logo" /></a>
          </div>

          <h1 class="heading">Happy To See You Again!</h1>
          <p class="signup-link">
            You don't have an account? <a href="/signup">Create an account</a>
          </p>
          <div class="socialButtons">
  <ion-button expand="block" fill="outline" class="socialBtn">
    <img src="@/assets/google.png" name="logo-google" />
    <span class="button-text">Google</span>
  </ion-button>
  <ion-button expand="block" fill="outline" class="socialBtn">
    <img src="@/assets/facebook.png" name="logo-facebook" />
    <span class="button-text">Facebook</span>
  </ion-button>
</div>

<p class="or">Or</p>
          <ion-list class="list">
            <ion-item class="item">
  <ion-img src="/src/assets/email.png" class="input-icon"></ion-img>
  <ion-input 
    type="email" 
    placeholder="Email"
    :value="email"
    @ionInput="email = $event.target.value"
    class="input-field"
  ></ion-input>
</ion-item>

<ion-item class="item">
  <ion-img src="/src/assets/cadenas.png" class="input-icon"></ion-img>
  <ion-input 
    type="password" 
    placeholder="Password"
    :value="password"
    @ionInput="password = $event.target.value"
    class="input-field"
  ></ion-input>
</ion-item>
          </ion-list>

          <p class="forgot-password"><a href="#">Forgot your password?</a></p>

          <ion-button expand="full" class="login-button" @click="handleLogin">
            Log In
          </ion-button>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authService';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in both fields!';
    return;
  }

  try {
    const response = await login({ email: email.value, password: password.value });
    localStorage.setItem('token', response.data.token); 
    router.push('/Home'); 
  } catch (error) {
    errorMessage.value = 'Invalid credentials. Please try again.';
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
  color: #47463D;
  margin-bottom: 1.5rem;
  font-weight: 550;
}

.signup-link {
  font-size: 0.9rem;
  color: #636e72;
  margin-bottom: 2rem;
}

.signup-link a {
  color: #DFC925;
  text-decoration: none;
  font-weight: 600;
}

.list {
  background: transparent;
  margin-bottom: 1.8rem;
}

.item {
  --background: #cab40f;
  --border-radius: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 32px;
}

.input-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.input-field {
  --padding-start: 0;
}

.forgot-password {
  font-size: 0.9rem;
  color: #cab40f;
  margin-bottom: 2rem;
}

.login-button {
  --background: #47463D;
  --color: #ffffff;
  font-weight: 550;
  margin: 90px auto 0;
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
.socialButtons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 30px;

}
.socialBtn img {
  width: 80px;  
  height: 40px; 
  margin-right: 12px;
  object-fit: contain;
}
.socialBtn .button-text {
  font-weight: 200;
  font-size: 15px;
}

.socialBtn {
  
  font-size: 10px;

  color: #47463D;
  --border-color: #47463D;
  --border-radius: 10px; 
}

.or {
  margin: 10px 0;
  font-weight: bold;
  color: #47463D;
}
</style>