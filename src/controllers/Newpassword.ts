import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/Password';

export function useNewPasswordController() {
    const router = useRouter();
    const route = useRoute();
    const email = ref(route.query.email || '');
    const token = ref(route.query.token || '');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const isFormValid = computed(() => {
        return (
            newPassword.value.length >= 8 &&
            confirmPassword.value.length >= 8 &&
            newPassword.value === confirmPassword.value
        );
    });
    const updatePassword = async () => {
        try {
            if (!isFormValid.value) {
                errorMessage.value = 'Veuillez remplir correctement les champs.';
                return;
            }
            isLoading.value = true;
            errorMessage.value = '';
            successMessage.value = '';
            const response = await authService.updatePassword(
                token.value,
                newPassword.value,
                confirmPassword.value
            );

            if (response.status?.code === 200) {
                successMessage.value = 'Votre mot de passe a été mis à jour avec succès.';
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                errorMessage.value = response.status?.message || 'Erreur lors de la mise à jour du mot de passe.';
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe :', error);
            errorMessage.value = error.message || 'Erreur lors de la mise à jour du mot de passe.';
        } finally {
            isLoading.value = false;
        }
    };

    return {
        email,
        token,
        newPassword,
        confirmPassword,
        errorMessage,
        successMessage,
        isLoading,
        isFormValid,
        updatePassword,
    };
}