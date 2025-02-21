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
              <div 
                class="fb-login-button" 
                data-size="large" 
                data-layout="default" 
                data-auto-logout-link="false" 
                data-use-continue-as="true">
              </div>
            </div>
          </div>
        </div>

        <p class="or">Or</p>

        <ion-list class="list">
          <ion-item class="item">
            <ion-input
              :value="fullname"
              @ionInput="fullname = $event.target.value"
              placeholder="Fullname"
            ></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input
              :value="email"
              @ionInput="email = $event.target.value"
              type="email"
              placeholder="Email"
            ></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input
              :value="password"
              @ionInput="password = $event.target.value"
              type="password"
              placeholder="Password"
              clearInput="true"
            ></ion-input>
          </ion-item>
        </ion-list>

        <div class="checkboxContainer">
          <ion-checkbox
            :checked="acceptTerms"
            @ionChange="acceptTerms = $event.detail.checked"
          ></ion-checkbox>
          <p class="conditions">
            By signing up, you accept the <a href="#">Utilisation Conditions</a>
          </p>
        </div>

        <div class="buttonContainer">
          <ion-button expand="block" @click="Signup" class="signupBtn">Sign up</ion-button>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; 
import { signup } from "@/services/authentification";

const fullname = ref("");
const email = ref("");
const password = ref("");
const acceptTerms = ref(false);
const errorMessage = ref('');
const router = useRouter();  

const checkConditions = (socialSignup = false) => {
  if (!socialSignup) {
    if (!fullname.value || !email.value || !password.value) {
      errorMessage.value = "Please fill in all fields";
      return false;
    }
    if (!acceptTerms.value) {
      errorMessage.value = "You must accept the terms and conditions";
      return false;
    }
  }
  return true;
};



const Signup = async () => {
  console.log("Signup function triggered");
  if (!checkConditions()) return;

  try {
    const response = await signup({
      name: fullname.value,
      email: email.value,
      password: password.value,
    });
    console.log("Signup successful:", response.data);
    errorMessage.value = "Signup successful!";
    router.push('/login');  
  } catch (error) {
    console.error("Signup failed:", error);
    errorMessage.value = "Signup failed: " + error.message;
  }
};

const handleGoogleSignUp = (response) => {
  console.log("Google Sign-In Response:", response);

  if (!checkConditions(true)) return; 

  const idToken = response.credential;

  fetch("https://preprod-api.iberis.io/ar/api/private/user/google-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("HTTP error " + res.status); 
      }
      return res.text(); 
    })
    .then((text) => {
      console.log("Raw response from server:", text); 
      try {
        const data = JSON.parse(text); 
        console.log("Parsed server response:", data);
        errorMessage.value = "Signup successful!";
        router.push("/home");
      } catch (e) {
        console.error("Error parsing JSON:", e);
        errorMessage.value = "Signup failed: Invalid JSON response.";
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      errorMessage.value = "Signup failed: " + err.message;
    });
};





const handleFacebookLogin = (response) => {
  if (response.status === "connected") {
    console.log("Facebook Sign-In Response:", response);

    if (!checkConditions(true)) return; 

    const { accessToken } = response.authResponse;

    fetch("https://preprod-api.iberis.io/ar/api/private/user/facebook-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response:", data);
        errorMessage.value = "Signup successful!";
        router.push("/home"); 
      })
      .catch((err) => {
        console.error("Error:", err);
        errorMessage.value = "Signup failed: " + err.message;
      });
  } else {
    console.error("Facebook login failed", response);
    errorMessage.value = "Facebook login failed.";
  }
};


onMounted(() => {
  const googleScript = document.createElement("script");
  googleScript.src = "https://accounts.google.com/gsi/client";
  googleScript.async = true;
  googleScript.onload = () => {
    if (!document.getElementById("google-button").hasChildNodes()) {
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
    console.log("Facebook SDK loaded successfully");

    if (window.FB) {
      console.log("FB object exists");
      window.FB.init({
        appId: "507777845320852",
        cookie: true,
        xfbml: true,
        version: "v15.0"
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
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 30px;
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
.facebook-button-container {
  display: flex;
  justify-content: center;
  margin-top: 0px;
}
</style>