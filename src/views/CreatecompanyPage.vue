<template>
    <ion-page>
      <ion-header :translucent="true"></ion-header>
      <ion-content :fullscreen="true">
        <div class="container">
            <div v-if="page === 1">
                <div class="picture-placeholder">
                    <ion-icon name="image-outline" size="large"></ion-icon>
                </div>

                <div class="input-group">
                    <ion-label class="label">Company's name</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="name" @ionInput="name=$event.target.value" placeholder="GOOGLE ?"></ion-input>
                    </ion-item>
                </div>
            
                <div class="input-group">
                    <ion-label class="label">Activity</ion-label>
                    <ion-item class="custom-input">
                        <ion-select @ionChange="handleActivityChange" placeholder="Select an activity">
                            <ion-select-option 
                                v-for="(activity, index) in activities" 
                                :key="index" 
                                :value="activity.hashed_id">
                                {{ activity.title }}
                            </ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
            
                <div class="input-group">
                    <ion-label class="label">Phone</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="phone" @ionInput="phone=$event.target.value" placeholder="71559882" readonly></ion-input>
                    </ion-item>
                </div>

                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="nextPage1">Next</ion-button>
                </div>
            </div>


            <div v-if="page === 2">
                <div class="input-group">
                    <ion-label class="label">Addresse</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="adresse" @ionInput="adresse=$event.target.value" placeholder="1 , liberty road"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Governorate</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="governorate" @ionInput="governorate=$event.target.value" placeholder="Tunis"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Code postal</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="codepostal" @ionInput="codepostal=$event.target.value" placeholder="2090"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Country</ion-label>
                    <ion-item class="custom-input">
                        <ion-select :value="country" @ionInput="country=$event.target.value" placeholder="Tunisie">
                            <ion-select-option value="art">qatar</ion-select-option>
                            <ion-select-option value="tech">alregie</ion-select-option>
                            <ion-select-option value="commerce">russia</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>

                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="nextPage2">Next</ion-button>
                </div>
            </div>


            <div v-if="page === 3">
                <div class="input-group">
                    <ion-label class="label">PDF language</ion-label>
                    <ion-item :value="language" @ionInput="language=$event.target.value" class="custom-input">
                        <ion-select placeholder="english">
                            <ion-select-option value="art">english</ion-select-option>
                            <ion-select-option value="tech">arabic</ion-select-option>
                            <ion-select-option value="commerce">french</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Tax identification number</ion-label>
                    <ion-item class="custom-input">
                        <ion-input :value="tax" @ionInput="tax=$event.target.value" placeholder="0000000/L/A/M/000"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Exercice</ion-label>
                    <ion-item class="custom-input">
                        <ion-select :value="exercice" @ionInput="exercice=$event.target.value" placeholder="January - December">
                            <ion-select-option value="art">January - December</ion-select-option>
                            <ion-select-option value="art">January - December</ion-select-option>
                            <ion-select-option value="art">January - December</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Main currency</ion-label>
                    <ion-item class="custom-input">
                        <ion-select :value="currency" @ionInput="currency=$event.target.value" placeholder="Dinar(s) tunisien">
                            <ion-select-option value="art">Dinar(s) tunisien</ion-select-option>
                            <ion-select-option value="tech">dirham</ion-select-option>
                            <ion-select-option value="tech">dirham</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>

                <div class="buttonContainer">
                    <ion-button expand="block" class="next-button"  @click="submitForm">Submit</ion-button>
                </div>
            </div>

        </div>
      </ion-content>
    </ion-page>
  </template>

<script>

export default {
  data() {
    return {
      page: 1,
      form: {
        companyName: "",
        activity: "",
        phone: "",
        address: "",
        governorate: "",
        postalCode: "",
        country: "",
      },
      activities: [],
    };
  },

  methods: {
    async fetchActivities() {
        let token = localStorage.getItem("access_token");
        if (!token) {
            console.warn("No token found. Trying to log in...");
            token = await this.loginAndGetToken();
        }

        if (!token) {
            console.error("Authentication failed. Cannot fetch activities.");
            return;
        }

        try {
            const response = await fetch("https://preprod-api.iberis.io/fr/api/private/general/activities", {
            headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();
            console.log("Full API Response:", data);

            if (data?.data?.activities) {
            this.activities = data.data.activities;
            console.log("Fetched Activities:", this.activities);
            } else {
            console.warn("No activities found.");
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
        },

    handleActivityChange(event) {
        console.log("Raw Event Object:", event);

        if (!event || !event.detail || !event.detail.value) {
            console.error("Invalid selection event. Check if activities are loaded.");
            return;
        }

        this.form.activity = event.detail.value;
        console.log("Selected Activity:", this.form.activity);
    },
    
    nextPage1() {
      this.page = 2;
    },
    
    nextPage2() {
      this.page = 3;
    },
    
    submitForm() {
      alert("Form submitted!");
      console.log(this.form);
    },
  },

  mounted() {
    this.fetchActivities();
  },
};
</script>



<style scoped>
ion-content {
  --background: white;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
}

.picture-placeholder {
    width: 200px;
    height: 200px;
    background: #eee;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    margin-bottom: 90px;

    position: relative;
    left: 50%;
    transform: translateX(-50%);
}
.input-group {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
}

.label {
    color: #47463d;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 15px;
}
.custom-input {
    color: #33322c;
    width: 350px;
    border-radius: 8px;
    --background: #eee;
    border: 1px solid #ccc;
}

.buttonContainer {
    display: flex;
    justify-content: center;
    width: 100%;

}

.next-button {
    margin-top: 40px;
    width: 160px;
    height: 50px;
    --background: #dfc925;
    border-radius: 150px;
    color: white;
    font-size: 18px;
    font-weight: bold;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

</style>