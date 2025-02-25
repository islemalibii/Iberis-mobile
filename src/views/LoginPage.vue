<template>
  <ion-page>
    <ion-content>
      <div class="container">
        <div class="content-wrapper">
          <div class="image-container">
            <a href="/home">
              <img src="../assets/logo-iberis.png" alt="iberisLogo" class="logo" />
            </a>
          </div>

          <h1 class="heading">Happy To See You Again!</h1>
          <p class="signup-link">
            You don't have an account? <a href="/signup">Create an account</a>
          </p>

          <div class="socialButtons">
            <div class="google-button-container">
              <div id="google-button"></div>
            </div>

            <div class="facebook-button-container">
              <div id="facebook-button">
                <div
                  class="fb-login-button" data-size="large" data-auto-logout-link="false" data-use-continue-as="true"></div>
              </div>
            </div>
          </div>

          <p class="or">Or</p>
          <ion-list class="list">
            <ion-item class="item">
              <ion-img src="/src/assets/email.png" class="input-icon"></ion-img>
              <ion-input type="email" placeholder="Email" :value="email" @ionInput="email = $event.target.value.trim()" class="input-field"></ion-input>
            </ion-item>
            <p v-if="emailError" class="error">{{ emailError }}</p>

            <ion-item class="item">
              <ion-img src="/src/assets/cadenas.png" class="input-icon"></ion-img>
              <ion-input type="password" placeholder="Password" :value="password" @ionInput="password = $event.target.value.trim()" class="input-field"></ion-input>
            </ion-item>
            <p v-if="passwordError" class="error">{{ passwordError }}</p>
          </ion-list>

          <p class="forgot-password">
            <router-link to="/reset">Forgot your password?</router-link>
          </p>

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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authentification';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const emailError = ref('');
const passwordError = ref('');
const handleLogin = async () => {
  const trimmedEmail = email.value.trim();
  const trimmedPassword = password.value.trim();

  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

  if (!trimmedEmail) {
    emailError.value = 'Email field cannot be empty!';
    return;
  }
  if (!trimmedPassword) {
    passwordError.value = 'Password field cannot be empty!';
    return;
  }

  try {
    const response = await fetch('https://preprod-api.iberis.io/fr/api/private/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      
      },
      body: JSON.stringify({
        email: trimmedEmail,
        password: trimmedPassword,
      }),
    });

    const data = await response.json(); 

    if (response.status === 401) {
      errorMessage.value = 'Identifiants incorrects ou accès non autorisé.';
      return;
    }

    if (data.status && data.status.code === 402) {
      errorMessage.value = "Veuillez valider votre adresse e-mail avant de vous connecter.";
      return;
    }

    if (data.status && data.status.code === 200) {
      console.log("Login successful:", data);
      router.push('/home'); 
    } else {
      errorMessage.value = "Erreur inattendue. Code : " + (data.status?.code || "inconnu");
    }

  } catch (error) {
    console.error("Login failed:", error);
    errorMessage.value = 'Échec de la connexion. Veuillez réessayer.';
  }
};

const handleGoogleSignUp = (response: any) => {
  console.log("Google Sign-In Response:", response);
  const idToken = response.credential;

  fetch("https://preprod-api.iberis.io/ar/api/private/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  })

    .then((res) => res.json())
    .then((data) => {
      if (data.userExists) {
        localStorage.setItem('token', data.token); 
        router.push('/home');  
      } else {
        router.push('/signup');
      }
    })
    .catch((err) => console.error("Error:", err));
};


const handleFacebookLogin = (response) => {
  console.log("Facebook login response:", response);
  if (response.status === 'connected') {
    const { accessToken } = response.authResponse;
    if (!accessToken) {
      console.error("Access token is missing");
      errorMessage.value = 'Access token is missing. Please try again.';
      return;
    }

    fetch('https://preprod-api.iberis.io/fr/api/private/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status?.code === 200) {
          router.push('/home');
        } else {
          errorMessage.value = data.status?.message || 'Facebook login failed. Please try again.';
        }
      })
      
      .catch(err => {
        console.error('Error with Facebook login:', err);
        errorMessage.value = 'Facebook login failed. Please try again.';
      });
  } else {
    console.error('Facebook login failed:', response);
    errorMessage.value = 'Facebook login failed. Please try again.';
  }
};


onMounted(() => {
  const googleScript = document.createElement("script");
  googleScript.src = "https://accounts.google.com/gsi/client";
  googleScript.async = true;
  googleScript.onload = () => {
    if (!document.getElementById("google-button")?.hasChildNodes()) {
      window.google?.accounts.id.initialize({
        client_id: "543531980890-o7btiuq1iod2423htc4c3av4i6l4j28h.apps.googleusercontent.com",
        callback: handleGoogleSignUp,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-button"),
        { theme: "outline", size: "large", width: "220" }
      );
    }
  };
  document.head.appendChild(googleScript);

  const facebookScript = document.createElement('script');
  facebookScript.src = 'https://connect.facebook.net/en_US/sdk.js';
  facebookScript.async = true;
  facebookScript.onload = () => {
    window.FB.init({
      appId: '507777845320852', 
      cookie: true,
      xfbml: true,
      version: 'v15.0',
    });

    window.FB.Event.subscribe('auth.statusChange', handleFacebookLogin);
  };
  document.head.appendChild(facebookScript);
});
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
  color: #47463D;
}
</style>
