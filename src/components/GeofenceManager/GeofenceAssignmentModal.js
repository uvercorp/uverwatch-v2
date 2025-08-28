import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import geofenceService from '../../services/geofenceService';

const GeofenceAssignmentModal = ({
	show,
	onHide,
	onSuccess,
	userId,
	deploymentId,
	availableGeofences = [],
	currentUserGeofences = []
}) => {
	const [selectedGeofence, setSelectedGeofence] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [geofences, setGeofences] = useState([]);
	const [hasLoaded, setHasLoaded] = useState(false);


	const loadAvailableGeofences = useCallback(async () => {
		try {
			setLoading(true);
			const response = await geofenceService.getAvailableGeofences(deploymentId);
			if (response.status === 'success') {
				setGeofences(response.geofences || []);
				setHasLoaded(true);
			}
		} catch (error) {
			setError('Failed to load available geofences');
		} finally {
			setLoading(false);
		}
	}, [deploymentId]);

	useEffect(() => {
		if (show) {
			// Reset state when modal opens
			if (!selectedGeofence) {
				setSelectedGeofence('');
			}
			setError(null);

			if (!hasLoaded && availableGeofences.length === 0) {
				loadAvailableGeofences();
			} else if (availableGeofences.length > 0) {
				setGeofences(availableGeofences);
			}
		}
	}, [show, availableGeofences, loadAvailableGeofences, hasLoaded]);

	const handleAssignGeofence = async () => {
		if (!selectedGeofence) {
			setError('Please select a geofence');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await geofenceService.addUserGeofence(
				userId,
				selectedGeofence,
				deploymentId
			);

			onSuccess();
			onHide();
			setSelectedGeofence('');
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setSelectedGeofence('');
		setError(null);
		setHasLoaded(false);
		onHide();
	};

	const availableOptions = geofences.filter(
		geofence => !currentUserGeofences.find(
			userGeofence => userGeofence.id === geofence.id
		)
	);

	return (
		<>
			{/* Modal Backdrop and Content */}
			<AnimatePresence>
				{show && (
					<motion.div
						className="fixed inset-0 bg-black bg-opacity-50 z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						onClick={handleClose} // Close modal when clicking outside
					>
						{/* Modal Container */}
						<motion.div
							className="bg-[#1c1b1a] shadow-lg p-8 overflow-y-auto max-h-[90vh] mx-auto mt-8
										w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
							initial={{ y: -100, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -100, opacity: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
							style={{ border: "1px solid #2e2c2b" }}
						>
							{/* Modal Header */}
							<div className="font-bold text-[1.2em] text-gray-100 mb-6">Assign Geofence to User</div>
							<hr className="border-[#2e2c2b] mb-6" />

							{/* Modal Body */}
							<div>
								{error && (
									<div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 flex justify-between items-center">
										<span>{error}</span>
										<button
											onClick={() => setError(null)}
											className="text-red-300 hover:text-red-100 text-lg font-bold"
										>
											×
										</button>
									</div>
								)}

								{loading && geofences.length === 0 ? (
									<div className="text-center py-4">
										<i className="fas fa-spinner fa-spin fa-2x text-gray-400"></i>
										<p className="mt-2 text-gray-300">Loading available geofences...</p>
									</div>
								) : (
									<div>
										<div className="mb-6">
											<label className="block text-gray-300 text-sm font-medium mb-2">
												Select Geofence:
											</label>
											<select
												value={selectedGeofence}
												onChange={(e) => setSelectedGeofence(e.target.value)}
												disabled={loading}
												className="w-full bg-[#2e2c2b] border border-[#3b3229] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
											>
												<option value="">Choose a geofence to assign</option>
												{availableOptions.map(geofence => (
													<option key={geofence.id} value={geofence.id}>
														{geofence.name} - {geofence.description || 'No description'}
													</option>
												))}
											</select>
										</div>

										{availableOptions.length === 0 && (
											<div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded text-center">
												All available geofences are already assigned to this user.
											</div>
										)}
									</div>
								)}
							</div>

							{/* Modal Footer */}
							<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#2e2c2b]">
								<button
									onClick={handleClose}
									disabled={loading}
									className="px-6 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Cancel
								</button>
								<button
									onClick={handleAssignGeofence}
									disabled={!selectedGeofence || loading || availableOptions.length === 0}
									className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<>
											<i className="fas fa-spinner fa-spin me-2"></i>
											Assigning...
										</>
									) : (
										'Assign Geofence'
									)}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default GeofenceAssignmentModal;
