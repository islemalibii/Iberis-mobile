import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { PhoneVerificationModel } from '@/services/authentification';

export const usePhoneVerificationController = () => {
  const router = useRouter();
  const phoneNumber = ref('');
  const otpCode = ref('');
  const otpSent = ref(false);
  const errorMessage = ref('');
  const isLoading = ref(false);
  const canResend = ref(true);
  const resendDelay = ref(120);
  const country = ref('tn');
  const countdown = ref(0);
  let resendTimer: number | null = null;

  const validatePhoneNumber = (): boolean => {
    errorMessage.value = '';
    if (!phoneNumber.value || phoneNumber.value.length !== 8 || isNaN(Number(phoneNumber.value))) {
      errorMessage.value = 'Numéro invalide. Il doit contenir 8 chiffres.';
      return false;
    }
    return true;
  };

  const validateOtp = (): boolean => {
    errorMessage.value = '';
    if (!otpCode.value || otpCode.value.length !== 4 || isNaN(Number(otpCode.value))) {
      errorMessage.value = 'Le code doit contenir 4 chiffres.';
      return false;
    }
    return true;
  };

  const handleSessionExpired = (message: string) => {
    if (message.includes('Session expirée')) {
      errorMessage.value = message;
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return true;
    }
    return false;
  };

  const sendOTP = async () => {
    console.log('Début de sendOTP');
    if (!validatePhoneNumber()) return;
  
    isLoading.value = true;
    errorMessage.value = '';
  
    try {
      console.log('Appel à PhoneVerificationModel.sendOtp');
      const { success, message } = await PhoneVerificationModel.sendOtp(phoneNumber.value, country.value);
      console.log('Résultat de sendOtp:', { success, message });
  
      if (success) {
        console.log('OTP envoyé avec succès');
        otpSent.value = true;
        startResendTimer();
      } else {
        console.log('Échec de l\'envoi OTP:', message);
        errorMessage.value = message || "Échec de l'envoi du code";
      }
    } catch (error) {
      console.error('Erreur capturée dans sendOTP:', error);
      errorMessage.value = 'Erreur lors de la communication avec le serveur';
    } finally {
      isLoading.value = false;
      console.log('Fin de sendOTP');
    }
  };
  const verifyOTP = async () => {
    console.log('Début de verifyOTP');
    if (!validateOtp()) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      console.log('Appel à PhoneVerificationModel.verifyOtp');
      const { success, message } = await PhoneVerificationModel.verifyOtp(otpCode.value);
      console.log('Résultat de verifyOtp:', { success, message });

      if (success) {
        console.log('Code OTP validé - redirection vers /create-company');
        router.push('/create-company'); 
      } else {
        console.log('Échec de la vérification OTP:', message);
        if (message && !handleSessionExpired(message)) {
          errorMessage.value = message || 'Code de vérification invalide';
        }
      }
    } catch (error) {
      console.error('Erreur capturée dans verifyOTP:', error);
      errorMessage.value = 'Erreur lors de la vérification';
    } finally {
      isLoading.value = false;
      console.log('Fin de verifyOTP');
    }
  };
  const startResendTimer = () => {
    canResend.value = false;
    countdown.value = resendDelay.value;

    if (resendTimer) {
      clearInterval(resendTimer);
    }

    resendTimer = window.setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        if (resendTimer) {
          clearInterval(resendTimer);
          resendTimer = null;
        }
        canResend.value = true;
      }
    }, 1000);
  };

  // Nettoyage du timer lorsque le composant est démonté
  const cleanup = () => {
    if (resendTimer) {
      clearInterval(resendTimer);
    }
  };

  return {
    phoneNumber,
    otpCode,
    otpSent,
    errorMessage,
    isLoading,
    canResend,
    countdown,
    sendOTP,
    verifyOTP,
    cleanup
  };
};