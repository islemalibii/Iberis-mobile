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
                        <ion-input v-model="form.companyName" placeholder="GOOGLE ?"></ion-input>
                   </ion-item>
                </div>
            
                <div class="input-group">
                    <ion-label class="label">Activity</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.activity" @ionChange="handleActivityChange" placeholder="Select an activity">
                            <ion-select-option
                            v-for="(activity, index) in activities"
                            :key="index"
                            :value="activity.hashed_id"
                            >
                            {{ activity.title }}
                            </ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
            
                <div class="input-group">
                    <ion-label class="label">Phone</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.phone" placeholder="71559882" readonly></ion-input>
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
                        <ion-input v-model="form.address" placeholder="1, liberty road"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Governorate</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.governorate" placeholder="Tunis"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Code postal</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.postalCode" placeholder="2090"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Country</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.country" @ionChange="form.country = $event.detail.value" placeholder="Tunisie">                            
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
                        <ion-item class="custom-input"></ion-item>
                            <ion-select v-model="form.language" @ionChange="form.language = $event.detail.value" placeholder="English">    
                                <ion-select-option value="art">english</ion-select-option>
                                <ion-select-option value="tech">arabic</ion-select-option>
                                <ion-select-option value="commerce">french</ion-select-option>
                            </ion-select>
                </div>
                <div class="input-group">
                    <ion-label class="label">Tax identification number</ion-label>
                    <ion-item class="custom-input">
                        <ion-input v-model="form.tax" placeholder="0000000/L/A/M/000"></ion-input>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Exercice</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.exercice" @ionChange="form.exercice = $event.detail.value" placeholder="January - December">                            
                            <ion-select-option value="art">January - December</ion-select-option>
                            <ion-select-option value="art">January - December</ion-select-option>
                            <ion-select-option value="art">January - December</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>
                <div class="input-group">
                    <ion-label class="label">Main currency</ion-label>
                    <ion-item class="custom-input">
                        <ion-select v-model="form.currency" @ionChange="form.currency = $event.detail.value" placeholder="Dinar(s) Tunisien">
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

<script setup lang="ts">
import { Preferences } from '@capacitor/preferences';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Activity {
  hashed_id: string;
  title: string;
}
interface FormData {
  companyName: string;
  activity: string;
  phone: string;
  address: string;
  governorate: string;
  postalCode: string;
  country: string;
  language: string;
  tax: string;
  exercice: string;
  currency: string;
}
const router = useRouter();
const page = ref(1);
const form = ref<FormData>({
  companyName: "",
  activity: "",
  phone: "",
  address: "",
  governorate: "",
  postalCode: "",
  country: "",
  language: "",
  tax: "",
  exercice: "",
  currency: "",
});
const activities = ref<Activity[]>([]);

const fetchActivities = async () => {
  console.log("Fetching activities...");
  try {

    const { value: token } = await Preferences.get({ key: 'auth_token' });
    console.log("Retrieved Token:", token);

    if (!token) {
      console.error("No token found");
      router.push('/login');
      return;
    }
    const response = await fetch(
      "https://preprod-api.iberis.io/fr/api/private/general/activities",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Response Text:", text);
    }


    const data = await response.json();
    
    if (data?.data?.activities?.length) {
      activities.value = data.data.activities as Activity[];
      console.log("Fetched Activities:", activities.value);
    } else if (data?.activities?.length) {
      activities.value = data.activities as Activity[];
      console.log("Fetched Activities from root:", activities.value);
    } else {
      console.warn("No activities found in response:", data);
    }
  } catch (error) {
    console.error("Error fetching activities:", error);
    router.push('/login');
  }
};


const handleActivityChange = (event: CustomEvent) => {
  console.log("Raw Event Object:", event);

  if (!event || !event.detail || !event.detail.value) {
    console.error("Invalid selection event. Check if activities are loaded.");
    return;
  }

  form.value.activity = event.detail.value;
  console.log("Selected Activity:", form.value.activity);
};

const nextPage1 = () => {
  page.value = 2;
};

const nextPage2 = () => {
  page.value = 3;
};
const submitForm = () => {
  alert("Form submitted!");
  console.log(form.value);
};

onMounted(async () => {
  console.log("Component mounted, calling fetchActivities...");
  await fetchActivities();
});

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