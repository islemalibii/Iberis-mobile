<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
 <a href="/home">     <img src="@/assets/logo-iberis.png" alt="iberisLogo" class="logo" /></a>
      <div class="signup-container">
        <h1>Welcome to the family !</h1>
        <p>You already have an account? <a href="/login">Log in</a></p>

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
    import { ref } from 'vue';
    import { signup } from '@/services/authService';

    const fullname = ref('');
    const email = ref('');
    const password = ref('');
    const acceptTerms = ref(false);



    const Signup = async () => {

        console.log('Fullname:', fullname.value);
        console.log('Email:', email.value);
        console.log('Password:', password.value);
        console.log('Accept Terms:', acceptTerms.value);

        if (!fullname.value || !email.value || !password.value) {
        console.error('Please fill in all fields');
        return;
    }

        if (!acceptTerms.value) {
            console.error('You must accept the terms and conditions');
            return;
        }


        const userData = {
        name: fullname.value,
        email: email.value,
        password: password.value,
    };

    try {
        const response = await signup(userData);
        console.log('Signup successful:', response.data);
    } catch (error) {
        console.error('Signup failed:', error);
    }
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