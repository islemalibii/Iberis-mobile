import { verifyEmail, resendVerifyCode } from "@/services/authentification"; 
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute,useRouter } from "vue-router";

export function EmailVerification() {
    const code = ref(["", "", "", ""]);
    const inputs = ref<HTMLInputElement[]>([]);
    const errorMessage = ref('');
    const route = useRoute();
    const router = useRouter();
    const isVerifying = ref(false); 

    const email = ref(route.query.email?.toString() || "");
    const hashedUserId = ref(route.query.hashedId?.toString() || "");

    const isCodeComplete = computed(() => code.value.every((digit) => digit !== ""));
    const moveToNext = (index: number) => {
        if (code.value[index] && index < code.value.length - 1) {
          inputs.value[index + 1]?.focus();
        }
      };
      const updateDigit  = (index: number, event: Event) => {
        const target = event.target as HTMLInputElement;
        const newValue = target.value.replace(/[^0-9]/g, "");
        code.value = code.value.map((d, i) => i === index ? newValue : d);
        if (newValue && index < 3) {
          nextTick(() => {
            inputs.value[index + 1]?.focus();
          });
        }
      };
      const moveToPrev = (index: number) => {
        if (index > 0) {
          if (!code.value[index]) {
            code.value = code.value.map((d, i) => i === index - 1 ? "" : d);
          }
          inputs.value[index - 1]?.focus();
        }
      };
      const submitCode = async () => {
        if (!isCodeComplete.value) {
          console.log("Validation failed: incomplete code"); 
          errorMessage.value = "Please fill all code digits";
          return;
        }
        isVerifying.value = true;
        errorMessage.value = '';
        const verificationCode = code.value.join("");
        try {
          const response = await verifyEmail(email.value, verificationCode);
          if (!response.data || !response.status) {
            throw new Error("Invalid API response structure");
          }      
          if (response.status.code === 200) {
            console.log("Email successfully validated.");
            await router.push("/login");
            return;
          } 
          if (response.status.code === 403) {
            console.log("Email is already validated.");
            await router.push("/login");
            return;
          }
          if (response.status.code === 406) {
            errorMessage.value = "User is banned.";
          }
          if (response.status.code === 404) {
            errorMessage.value = "Invalid code or email not found.";
          }
          errorMessage.value = response?.status?.message || 
            response?.message || 
            "Verification failed";
        } catch (error) {
          console.error(" Verification Failed:", error);
        }
      };
      const resendCode = async () => {
        if (!hashedUserId.value) {
          errorMessage.value = "User ID is missing. Cannot resend code.";
          return;
      }  
      try {
        const response = await resendVerifyCode(hashedUserId.value);
        console.log("Resend Response:", response); // Debug log

        if (!response.status) {
          throw new Error("Invalid API response structure");
        }
        if (response.status.code === 200) {
          console.log("Verification code resent successfully!");
        }
        if (response.status.code === 402) {
          errorMessage.value = "User not found or already validated. !";
        }
        else {
          errorMessage.value = response.message || "Failed to resend code.";
        }
        } catch (error) {
            console.error("Resend Failed:", error);
            errorMessage.value = "Failed to resend code. Please try again.";
        }
      };

    onMounted(() => {
      nextTick(() => {
        inputs.value = Array.from(document.querySelectorAll(".code-box")) as HTMLInputElement[];
      });
    });
    return {
      code,
      inputs,
      errorMessage,
      email,
      hashedUserId,
      isCodeComplete,
      isVerifying,
      updateDigit,
      moveToNext,
      moveToPrev,
      submitCode,
      resendCode,
    };
}