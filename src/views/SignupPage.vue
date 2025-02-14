<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <img src="@/assets/iberisLogo.png" alt="iberisLogo" class="logo" />
      <div class="signup-container">
        <h1>Welcome to the family !</h1>
        <p>You already have an account? <a href="#">Log in</a></p>

        <div class="socialButtons">
          <ion-button expand="block" fill="outline" class="socialBtn">
            <ion-icon slot="start" name="logo-google"></ion-icon> Google
          </ion-button>
          <ion-button expand="block" fill="outline" class="socialBtn">
            <ion-icon slot="start" name="logo-facebook"></ion-icon> Facebook
          </ion-button>
        </div>

        <p class="or">Or</p>

        <ion-list class="list">
          <ion-item class="item">
            <ion-input placeholder="Fullname"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input type="email" placeholder="Email"></ion-input>
          </ion-item>
          <ion-item class="item">
            <ion-input type="password" placeholder="Password"></ion-input>
          </ion-item>
        </ion-list>


        <div class="checkboxContainer">
          <ion-checkbox></ion-checkbox>
          <p class="conditions">By signing up, you accept the <a href="#">Utilisation Conditions</a></p>
        </div>

        <div class="buttonContainer">
          <ion-button expand="block" class="signupBtn">Sign up</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

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