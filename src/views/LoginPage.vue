<template>
    <ion-page>
      <ion-header>
      </ion-header>
      <ion-content>
        <div class="container">
          <div class="content-wrapper">
            <div class="image-container">
              <img 
                src="/src/images/logo-iberis.png" 
                alt="Iberis Logo"
                class="logo"
              >
            </div>
            <h1 class="heading">Happy To See You Again!</h1>
            <p class="signup-link">
              You don't have an account? <a href="/signup">Create an account</a>
            </p>
  
            <ion-list class="list">
              <ion-item class="item">
                <ion-img src="/src/images/email.png" class="input-icon"></ion-img>
                <ion-input type="email" placeholder="Email" class="input-field"></ion-input>
              </ion-item>
  
              <ion-item class="item">
                <ion-img src="/src/images/cadenas.png" class="input-icon"></ion-img>
                <ion-input type="password" placeholder="Password" class="input-field"></ion-input>
              </ion-item>
            </ion-list>
  
            <p class="forgot-password"><a href="/gvg"></a>Forgot your password?</p>
  
            <ion-button expand="full" class="login-button" @click="handleLogin">
              Log In
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonPage, IonHeader, IonContent, IonItem, IonInput, IonList, IonImg, IonButton } from '@ionic/vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  
  const handleLogin = () => {
    console.log('Email:', email.value);
    console.log('Password:', password.value);
  
    router.push('/dashboard'); 
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
    color:  #47463D;
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

.item:first-child {
    margin-top: 20px; 
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
  </style>