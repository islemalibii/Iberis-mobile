import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/Password';

export function useResetPasswordController() {
    const router = useRouter();
    const email = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);
    const canResend = ref(true);
    const resendDelay = ref(60);

    const handleSendCode = async () => {
        if (!email.value) {
            errorMessage.value = 'Veuillez entrer une adresse email valide.';
            return;
        }
        try {
            isLoading.value = true;
            const response = await authService.sendResetCode(email.value);

            if (response.status?.code === 200) {
                successMessage.value = 'Un code de réinitialisation a été envoyé à votre email.';
                router.push('/reset/check');
                canResend.value = false;
                startResendTimer();
            } else {
                errorMessage.value = response.status?.message || 'Erreur lors de l\'envoi du code.';
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du code :', error);
            errorMessage.value = error.message || 'Erreur lors de l\'envoi du code.';
        } finally {
            isLoading.value = false;
        }
    };

    const startResendTimer = () => {
        const interval = setInterval(() => {
            if (resendDelay.value > 0) {
                resendDelay.value--;
            } else {
                clearInterval(interval);
                canResend.value = true;
                resendDelay.value = 60;
            }
        }, 1000);
    };

    return {
        email,
        errorMessage,
        successMessage,
        isLoading,
        canResend,
        resendDelay,
        handleSendCode,
    };
}