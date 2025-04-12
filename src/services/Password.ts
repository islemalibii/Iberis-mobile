import axios from 'axios';

const API_BASE_URL = 'https://api.iberis.io';

export const authService = {
    async sendResetCode(email: string) {
        try {
            const response = await axios.post(`${API_BASE_URL}/fr/api/private/user/reset`, { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erreur lors de l\'envoi du code.' };
        }
    },
    async verifyResetCode(token: string) {
        try {
            const response = await axios.post(`${API_BASE_URL}/fr/api/private/user/reset/check`, { token });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erreur lors de la vérification du code.' };
        }
    },

    async updatePassword(token: string, password: string, newPassword: string) {
        try {
            const response = await axios.post(`${API_BASE_URL}/fr/api/private/user/reset/new`, {
                token,
                password,
                new_password: newPassword,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erreur lors de la mise à jour du mot de passe.' };
        }
    },
};