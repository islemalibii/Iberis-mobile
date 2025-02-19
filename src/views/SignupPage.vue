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

        <ion-button expand="block" fill="outline" class="socialBtn">
          <ion-icon slot="start" name="logo-facebook"></ion-icon> Facebook
        </ion-button>
      </div>
      <p class="or">Or</p>

        <ion-list class="list">
          <ion-item class="item">
            <ion-input :value="fullname" @ionInput="fullname = $event.target.value" placeholder="Fullname"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input :value="email" @ionInput="email = $event.target.value" type="email" placeholder="Email"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input :value="password" @ionInput="password = $event.target.value" type="password" placeholder="Password" clearInput="true"></ion-input>
          </ion-item>
        </ion-list>


        <div class="checkboxContainer">
          <ion-checkbox :checked="acceptTerms" @ionChange="acceptTerms = $event.detail.checked"></ion-checkbox>
          <p class="conditions" >By signing up, you accept the <a href="#">Utilisation Conditions</a></p>
        </div>

        <div class="buttonContainer">
          <ion-button expand="block" @click="Signup" class="signupBtn">Sign up</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
  </template>


<script setup>
  import { ref, onMounted } from "vue";
  import { signup } from "@/services/authentification";

  const fullname = ref("");
  const email = ref("");
  const password = ref("");
  const acceptTerms = ref(false);

  const Signup = async () => {
    if (!fullname.value || !email.value || !password.value) {
      console.error("Please fill in all fields");
      return;
    }
    if (!acceptTerms.value) {
      console.error("You must accept the terms and conditions");
      return;
    }

    try {
      const response = await signup({
        name: fullname.value,
        email: email.value,
        password: password.value,
      });
      console.log("Signup successful:", response.data);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleGoogleSignUp = (response) => {
    console.log("Google Sign-In Response:", response);
    const idToken = response.credential;

    fetch("https://preprod-api.iberis.io/ar/api/private/user/google-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Server response:", data))
      .catch((err) => console.error("Error:", err));
  };

  onMounted(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
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
    document.head.appendChild(script);
  });

  const GoogleSignup = () => {
    window.google.accounts.id.prompt();
  };
</script>




<style scoped>
.ion-padding{
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
  color: #47463D;
}

p {
  font-size: 15px;
  color: #47463D;
}
.socialButtons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 30px;

}

.socialBtn {
  flex: 1;
  font-size: 16px;
  text-transform: none;
  color: #47463D;
  --border-color: #47463D;
  --border-radius: 10px; 
}

.or {
  margin: 10px 0;
  font-weight: bold;
  color: #47463D;
}

.list{
  background: transparent;
}
.item {
  --background: #DFC925;
  --border-radius: 10px; 
  --border-color: #47463D;
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
.conditions{
  font-size: 15px;
  color: #47463D;
}



#google-button {
  display: flex;
  justify-content: center;

}

.buttonContainer {
  margin-top:50px;
  display: flex;
  justify-content: center;
}
.signupBtn {
  --background: #47463D;
  --color: white;
  --border-radius:8px;
  height:35px;
  width:150px;

}
</style>