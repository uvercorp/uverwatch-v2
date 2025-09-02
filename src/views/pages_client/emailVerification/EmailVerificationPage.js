import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { toggleToaster } from 'provider/features/helperSlice';
import EmailVerificationService from 'services/emailVerificationService';
import { Audio } from 'react-loader-spinner';

const EmailVerificationPage = () => {
	const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error, expired
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [resendLoading, setResendLoading] = useState(false);

	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();

	useEffect(() => {
		// Extract email and token from URL parameters
		const { email: urlEmail, token: urlToken } = EmailVerificationService.extractVerificationParams(location.search);

		if (urlEmail && urlToken) {
			setEmail(urlEmail);
			setToken(urlToken);
			// Automatically verify email
			handleEmailVerification(urlEmail, urlToken);
		} else {
			setVerificationStatus('error');
			setErrorMessage('Invalid verification link. Please check your email and try again.');
		}
	}, [location]);

	const handleEmailVerification = async (emailToVerify, tokenToVerify) => {
		setIsLoading(true);
		try {
			const response = await EmailVerificationService.verifyEmail(emailToVerify, tokenToVerify);

			if (response.status === 'success') {
				setVerificationStatus('success');
				dispatch(toggleToaster({
					isOpen: true,
					toasterData: {
						type: "success",
						msg: "Email verified successfully! You can now log in."
					}
				}));

				// Redirect to login after 3 seconds
				setTimeout(() => {
					history.push('/pages/login');
				}, 3000);
			} else {
				setVerificationStatus('error');
				setErrorMessage(response.message || 'Verification failed. Please try again.');
			}
		} catch (error) {
			console.error('Verification error:', error);

			if (error.response?.status === 400) {
				setVerificationStatus('error');
				setErrorMessage(error.response.data.message || 'Invalid verification token.');
			} else if (error.response?.status === 410) {
				setVerificationStatus('expired');
				setErrorMessage('Verification token has expired. Please request a new one.');
			} else {
				setVerificationStatus('error');
				setErrorMessage('Verification failed. Please check your internet connection and try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendVerification = async () => {
		if (!email) {
			dispatch(toggleToaster({
				isOpen: true,
				toasterData: {
					type: "error",
					msg: "Email address not found. Please check your verification link."
				}
			}));
			return;
		}

		setResendLoading(true);
		try {
			const response = await EmailVerificationService.resendVerificationEmail(email);

			if (response.status === 'success') {
				dispatch(toggleToaster({
					isOpen: true,
					toasterData: {
						type: "success",
						msg: "Verification email sent successfully! Please check your inbox."
					}
				}));
			} else {
				dispatch(toggleToaster({
					isOpen: true,
					toasterData: {
						type: "error",
						msg: response.message || 'Failed to resend verification email.'
					}
				}));
			}
		} catch (error) {
			console.error('Resend error:', error);
			dispatch(toggleToaster({
				isOpen: true,
				toasterData: {
					type: "error",
					msg: 'Failed to resend verification email. Please try again later.'
				}
			}));
		} finally {
			setResendLoading(false);
		}
	};

	const renderContent = () => {
		switch (verificationStatus) {
			case 'pending':
				return (
					<div className="text-center">
						<div className="inline-block mb-4">
							<Audio
								height="80"
								width="80"
								color="#4F46E5"
								ariaLabel="loading"
								wrapperStyle={{}}
								wrapperClass=""
							/>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Verifying your email...
						</h3>
						<p className="text-gray-600">
							Please wait while we verify your email address.
						</p>
					</div>
				);

			case 'success':
				return (
					<div className="text-center">
						<div className="mb-4">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
								<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Email Verified Successfully!
						</h3>
						<p className="text-gray-600 mb-4">
							Your email address has been verified. You will be redirected to the login page shortly.
						</p>
						<button
							onClick={() => history.push('/pages/login')}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Go to Login
						</button>
					</div>
				);

			case 'error':
				return (
					<div className="text-center">
						<div className="mb-4">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
								<svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Verification Failed
						</h3>
						<p className="text-gray-600 mb-4">
							{errorMessage}
						</p>
						<div className="space-y-2">
							<button
								onClick={handleResendVerification}
								disabled={resendLoading}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
							>
								{resendLoading ? (
									<>
										<Audio height="16" width="16" color="white" />
										<span className="ml-2">Sending...</span>
									</>
								) : (
									'Resend Verification Email'
								)}
							</button>
							<br />
							<button
								onClick={() => history.push('/pages/login')}
								className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Back to Login
							</button>
						</div>
					</div>
				);

			case 'expired':
				return (
					<div className="text-center">
						<div className="mb-4">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
								<svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Token Expired
						</h3>
						<p className="text-gray-600 mb-4">
							{errorMessage}
						</p>
						<div className="space-y-2">
							<button
								onClick={handleResendVerification}
								disabled={resendLoading}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
							>
								{resendLoading ? (
									<>
										<Audio height="16" width="16" color="white" />
										<span className="ml-2">Sending...</span>
									</>
								) : (
									'Request New Verification Email'
								)}
							</button>
							<br />
							<button
								onClick={() => history.push('/pages/login')}
								className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Back to Login
							</button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="sm:mx-auto sm:w-full sm:max-w-md"
			>
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Email Verification
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Verify your email address to complete your account setup
					</p>
				</div>
			</motion.div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
				>
					{renderContent()}
				</motion.div>
			</div>
		</div>
	);
};

export default EmailVerificationPage;



