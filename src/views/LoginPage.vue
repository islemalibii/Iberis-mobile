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
                  class="fb-login-button"
                  data-size="large"
                  data-layout="default"
                  data-auto-logout-link="false"
                  data-use-continue-as="true"
                ></div>
              </div>
            </div>
          </div>

          <p class="or">Or</p>
          <ion-list class="list">
            <ion-item class="item">
              <ion-img src="/src/assets/email.png" class="input-icon"></ion-img>
              <ion-input
                type="email"
                placeholder="Email"
                :value="email"
                @ionInput="email = $event.target.value.trim()"
                class="input-field"
              ></ion-input>
            </ion-item>
            <p v-if="emailError" class="error">{{ emailError }}</p>

            <ion-item class="item">
              <ion-img src="/src/assets/cadenas.png" class="input-icon"></ion-img>
              <ion-input
                type="password"
                placeholder="Password"
                :value="password"
                @ionInput="password = $event.target.value.trim()"
                class="input-field"
              ></ion-input>
            </ion-item>
            <p v-if="passwordError" class="error">{{ passwordError }}</p>
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
  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';

  const trimmedEmail = email.value.trim();
  const trimmedPassword = password.value.trim();

  if (!trimmedEmail) {
    emailError.value = 'Email field cannot be empty!';
  }
  if (!trimmedPassword) {
    passwordError.value = 'Password field cannot be empty!';
  }

  if (emailError.value || passwordError.value) {
    return; 
  }

  try {
    const response = await login({ email: trimmedEmail, password: trimmedPassword });

    if (response.data.userExists) {
      localStorage.setItem('token', response.data.token);  
      router.push('/home'); 
    } else {
      errorMessage.value = 'No account found. Redirecting to sign-up...';
      setTimeout(() => {
        router.push('/signup');
      }, 2000);
    }
  } catch (error) {
    errorMessage.value = 'Invalid credentials. Please try again.';
  }
};


const handleGoogleSignUp = (response: any) => {
  console.log("Google Sign-In Response:", response);
  const idToken = response.credential;

  fetch("https://preprod-api.iberis.io/ar/api/private/user/google-signIn", {
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


const handleFacebookLogin = (response: any) => {
  if (response.status === "connected") {
    console.log("Facebook Sign-In Response:", response);
    const { accessToken } = response.authResponse;

    fetch("https://preprod-api.iberis.io/ar/api/private/user/facebook-signIn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken })
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
  } else {
    console.error("Facebook login failed", response);
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
        { theme: "outline", size: "large", width: "150" }
      );
    }
  };
  document.head.appendChild(googleScript);

  const facebookScript = document.createElement("script");
  facebookScript.src = "https://connect.facebook.net/en_US/sdk.js";
  facebookScript.async = true;
  facebookScript.onload = () => {
    window.FB.init({
      appId: "507777845320852",
      cookie: true,
      xfbml: true,
      version: "v15.0"
    });

    window.FB.Event.subscribe("auth.statusChange", handleFacebookLogin);
    window.FB.XFBML.parse();
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
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 30px;
}

.or {
  margin: 10px 0;
  font-weight: bold;
  color: #47463D;
}
</style>
