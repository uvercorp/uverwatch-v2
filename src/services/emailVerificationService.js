import axiosInstance from './axios';

class EmailVerificationService {
	/**
	 * Verify email with token
	 * @param {string} email - User's email
	 * @param {string} token - Verification token
	 * @returns {Promise} - API response
	 */
	static async verifyEmail(email, token) {
		try {
			const response = await axiosInstance.post('verifyEmail', {
				email,
				token
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Resend verification email
	 * @param {string} email - User's email
	 * @returns {Promise} - API response
	 */
	static async resendVerificationEmail(email) {
		try {
			const response = await axiosInstance.post('resendVerificationEmail', {
				email
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Extract email and token from verification URL
	 * @param {string} url - Current URL or verification link
	 * @returns {Object} - Object containing email and token
	 */
	static extractVerificationParams(url) {
		try {
			const urlParams = new URLSearchParams(url.split('?')[1]);
			const email = urlParams.get('email');
			const token = urlParams.get('token');

			return { email, token };
		} catch (error) {
			console.error('Error extracting verification parameters:', error);
			return { email: null, token: null };
		}
	}
}

export default EmailVerificationService;



