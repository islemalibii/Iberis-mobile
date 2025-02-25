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
            <ion-input :value="fullname" @ionInput="fullname=$event.target.value" placeholder="Fullname"></ion-input>
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

        <div class="buttonContainer">
          <ion-button expand="block" @click="Signup" class="signupBtn">Sign up</ion-button>
        </div>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; 
import { signup } from "@/services/authentification";

const name = ref("");
const email = ref("");
const password = ref("");
const acceptTerms = ref(false);
const errorMessage = ref('');
const router = useRouter();  

const checkConditions = () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value || !fullname.value || !password.value) {
      errorMessage.value = "fill all the fields.";
      return false;
    }
    if (!fullname.value || fullname.value.length < 3 || fullname.value.length > 50) {
      errorMessage.value = "Full name must be between 3-50 characters.";
      return false;
    }
    if (!email.value || !regex.test(email.value)) {
      errorMessage.value = "Please enter a valid email address.";
      return false;
    }
    if (!password.value || password.value.length < 6) {
      errorMessage.value = "Password must be at least 6 characters long.";
      return false;
    }
    if (!acceptTerms.value) {
      errorMessage.value = "You must accept the terms and conditions";
      return false;
  }

  return true;
};



const Signup = async () => {
  if (!checkConditions()) return;
  try {
    const response = await signup({
      name: fullname.value,
      email: email.value,
      password: password.value,
      terms: true},
      { withCredentials: true });


    if (response.data.status?.code === 402) { 
      errorMessage.value = "Email is already in use. Please try another one.";
    }
    
    if (response.data.status?.code === 403) { 
      console.log("Signup successful:", response.data);
      router.push('/verify'); 
    }


    if (error.response) {
      if (error.response.status === 422) {
        const errors = response.data.errors || {};
      if (errors.email) {
        errorMessage.value = "This email is already registered.";
      } else {
        errorMessage.value = "Validation failed. Please check your input.";
      }
      return;
      } 
    }
  }catch (error) {
    console.error("Signup failed:", error);
  } 

};



const handleGoogleSignUp = async (response) => {
  const idToken = response.credential;

  if (!idToken) {
    errorMessage.value = "Google authentication failed.";
    return;
  }
  if (!acceptTerms.value) {
    errorMessage.value = "You must accept the terms and conditions";
    return;
  }
  const userPayload = JSON.parse(atob(idToken.split(".")[1])); 

  const userData = {
    name: userPayload.name,
    email: userPayload.email,
    password: "google_oauth", 
    terms: true,
    google_id: userPayload.sub,  
    idToken
  };

  try {
    const res = await fetch("https://preprod-api.iberis.io/fr/api/private/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const responseData = await res.json();
    console.log("🚀 Backend Response:", responseData, "Status:", res.status);


    if (res.status === 402) {
      errorMessage.value = "This email is already registered. Please log in.";
      return;
    }

    if (res.status === 403 || responseData.status?.code === 403) {
      errorMessage.value = "Signup successful! Please verify your email.";
      setTimeout(() => {
        router.push("/verify");
      }, 2000);
      return;
    }

    if (res.status === 422 || responseData.status?.code === 422) {
      errorMessage.value = "Signup failed: Missing required information.";
      return;
    }
    if (!res.ok) {
      errorMessage.value = responseData.message || "Signup failed. Please try again.";
      return;
    }

  } catch (error) {
    console.error(" Signup error:", error);
    errorMessage.value = "Network error. Please try again.";
  }

};


const handleFacebookLogin = async (response) => {
  if (response.status === "connected") {
    try {
      if (!acceptTerms.value) {
        throw new Error("You must accept the terms and conditions");
      }

      const { accessToken } = response.authResponse;
      
      //si mfamesh mail fl fb 
      const fbUserInfo = await new Promise((resolve, reject) => {
        window.FB.api('/me?fields=name,email', (response) => { // Modified fields
          if (!response || response.error) {
            reject(response?.error || new Error('Failed to fetch Facebook profile'));
          } else {
            resolve(response);
          }
        });
      });

      console.log("Facebook User Info:", fbUserInfo);

      if (!fbUserInfo.email) {
        const manualEmail = prompt("Veuillez entrer votre adresse email:");
        if (!manualEmail) {
          throw new Error("Email is required to complete registration");
        }
        fbUserInfo.email = manualEmail;
      }

      const randomPassword = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);

      const res = await fetch("https://preprod-api.iberis.io/ar/api/private/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "facebook",
          access_token: accessToken,
          name: fbUserInfo.name,
          email: fbUserInfo.email.toLowerCase(),
          password: randomPassword,
          terms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.errors?.email?.[0] || data.status?.message;
        throw new Error(errorMsg || "Erreur d'inscription Facebook");
      }

      console.log("Inscription Facebook réussie:", data);
      router.push("/login");
    } catch (error) {
      errorMessage.value = error.message;
      console.error("Erreur Facebook:", error);
    }
  } else {
    errorMessage.value = "Échec de la connexion Facebook. Veuillez réessayer.";
  }
};





onMounted(() => {
  googleScript.src = "https://accounts.google.com/gsi/client";
  googleScript.async = true;
  googleScript.onload = () => {
    if (!document.getElementById("google-button").hasChildNodes()) {
      window.google?.accounts.id.initialize({
        client_id: "543531980890-o7btiuq1iod2423htc4c3av4i6l4j28h.apps.googleusercontent.com",
        callback: handleGoogleSignUp,
        ux_mode: "popup",
        scope: "openid email profile",
        response_type: "id_token",
        prompt: "select_account"
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-button"),
        { theme: "outline", size: "large", width: "220" }
      );
    }
  };
  document.head.appendChild(googleScript);

  const facebookScript = document.createElement("script");
  facebookScript.src = "https://connect.facebook.net/en_US/sdk.js";
  facebookScript.async = true;
  facebookScript.onload = () => {
    console.log("Facebook SDK loaded successfully");

    if (window.FB) {
      console.log("FB object exists");
      window.FB.init({
  appId: "507777845320852",
  cookie: true,
  xfbml: true,
  version: "v15.0",
  status: true,
  autoLogAppEvents: true,
});
      window.FB.Event.subscribe("auth.statusChange", handleFacebookLogin);
      window.FB.XFBML.parse();
    } else {
      console.error("FB object not found");
    }
  };
  document.head.appendChild(facebookScript);
});

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


</style>