<template>
    <ion-page>
      <ion-content>
          <div class="container">
            <h1 class="heading">Check your inbox</h1>
            <p class="paragraphe">
                An email has been sent from Iberis containing a code that you need to copy here to verify your email address.
                Didn't receive the email? No worries, just click the button below.
            </p>
  
            <div class="code-inputs">
                <input v-for="(digit, index) in code"
                    :key="index"
                    v-model="code[index]"
                    @input="moveToNext(index)"
                    @keydown.backspace="moveToPrev(index)"
                    maxlength="1"
                    type="text"
                    class="code-box"
                    ref="inputs"
                />
            </div>
            <div class="buttons">
                <ion-button expand="full" class="resend-button" @click="resendCode">Resend</ion-button>
                <ion-button expand="full" class="submit-button" :disabled="!isCodeComplete" @click="submitCode">Submit</ion-button>
            </div>
          </div>
      </ion-content>
    </ion-page>
  </template>
  
  
<script setup>
    import { ref, computed } from "vue";

    const code = ref(["", "", "", ""]);

    const isCodeComplete = computed(() => code.value.every((digit) => digit !== ""));
      const moveToNext = (index) => {
    if (code.value[index] && index < code.value.length - 1) {
      inputs.value[index + 1].focus();
    }
  };

    const moveToPrev = (index) => {
      if (!code.value[index] && index > 0) {
        inputs.value[index - 1].focus();
      }
    };

    const submitCode = () => alert("Submitting Code: " + code.value.join(""));
    const resendCode = () => alert("Resending Code...");
</script>


  
  
  <style scoped>
  ion-content {
    --background: white;
  }


  .container {
    max-width: 400px;
    width: 100%;
    text-align: center;
    padding: 24px;
  }
  
  
  .heading {
    font-size: 2.5rem;
    line-height: 1.8;
    color:  #47463D;
    margin-bottom: 3.5rem;
    font-weight: 550;
  }
  
.paragraphe {
    font-size: 0.9rem;
    line-height: 1.3;
    color: #636e72;
    margin-bottom: 7rem;
    max-width: 500px;
    margin-left: auto; 
    margin-right: auto;
    text-align: left;
    }


.code-inputs {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 10rem;
}

.code-box {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  border: 2px solid #636e72;
  border-radius: 8px;
  outline: none;
  background-color: white;
  color: black;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

  .resend-button , .submit-button {
    --background: #4753BE; 
    --color: #ffffff; 
    font-weight: 550;
    --padding-top: 12px; 
    --padding-bottom: 12px; 
    width: 150px; 
    border-radius: 100px;
}
.submit-button:disabled {
  background: #b2bec3;
}
  </style>
