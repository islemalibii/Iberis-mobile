import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/Password';

export function useResetCheckController() {
    const router = useRouter();
    const route = useRoute();
    const email = ref(route.query.email || '');
    const code = ref(Array(4).fill(''));
    const errorMessage = ref('');
    const isLoading = ref(false);
    const inputs = ref([]);

    const isCodeComplete = computed(() => {
        return code.value.every((digit) => digit.length === 1);
    });
    const handleInput = (index, event) => {
        const value = event.target.value;
        if (value.length === 1 && index < 3) {
            inputs.value[index + 1]?.focus();
        } else if (value.length === 1 && index === 3) {
            inputs.value[index]?.blur();
        }
    };

    const handleBackspace = (index, event) => {
        if (event.target.value.length === 0 && index > 0) {
            inputs.value[index - 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text').trim();
        if (/^\d{4}$/.test(pasteData)) {
            for (let i = 0; i < 4; i++) {
                code.value[i] = pasteData[i];
            }
            inputs.value[3]?.focus();
        } else {
            errorMessage.value = 'Le code collé doit contenir exactement 4 chiffres.';
        }
    };

    const verifyCode = async () => {
        try {
            if (!isCodeComplete.value) {
                errorMessage.value = 'Veuillez entrer un code valide à 4 chiffres';
                return;
            }

            isLoading.value = true;
            const fullCode = code.value.join('');

            const response = await authService.verifyResetCode(fullCode);

            if (response.status?.code === 200) {
                router.push({
                    path: '/reset/check/new',
                    query: { email: email.value, token: fullCode },
                });
            } else {
                errorMessage.value = response.status?.message || 'Code invalide';
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du code :', error);
            errorMessage.value = error.message || 'Erreur de vérification';
        } finally {
            isLoading.value = false;
        }
    };

    const resendCode = async () => {
        try {
            isLoading.value = true;
            const response = await authService.sendResetCode(email.value);

            if (response.status?.code === 200) {
                errorMessage.value = 'Un nouveau code a été envoyé à votre email.';
            } else {
                errorMessage.value = response.status?.message || 'Erreur lors du renvoi du code';
            }
        } catch (error) {
            console.error('Erreur lors du renvoi du code :', error);
            errorMessage.value = error.message || 'Erreur lors du renvoi du code';
        } finally {
            isLoading.value = false;
        }
    };

    onMounted(() => {
        inputs.value = Array.from({ length: 4 }, (_, i) =>
            document.querySelector(`input[ref="input${i}"]`)
        );
    });

    return {
        email,
        code,
        errorMessage,
        isLoading,
        inputs,
        isCodeComplete,
        handleInput,
        handleBackspace,
        handlePaste,
        verifyCode,
        resendCode,
    };
}