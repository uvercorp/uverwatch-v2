import { useState, useEffect, useCallback } from 'react';
import useGeoLocation from './useGeoLocation';
import geofenceService from '../services/geofenceService';

export const useGeofenceValidation = (userId, deploymentId) => {
	const { latitude, longitude } = useGeoLocation();
	const [isValidLocation, setIsValidLocation] = useState(null);
	const [validationError, setValidationError] = useState(null);
	const [isValidating, setIsValidating] = useState(false);
	const [userGeofences, setUserGeofences] = useState([]);
	const [geofenceEnabled, setGeofenceEnabled] = useState(true);

	// Load user's assigned geofences
	const loadUserGeofences = useCallback(async () => {
		if (!userId || !deploymentId) return;

		try {
			const response = await geofenceService.getUserGeofences(deploymentId, userId);
			if (response.status === 'success') {
				setUserGeofences(response.geofences || []);
				setGeofenceEnabled(response.geofence_enabled !== false); // Default to true if not specified
			} else {
				setUserGeofences([]);
				setGeofenceEnabled(false);
			}
		} catch (error) {
			setUserGeofences([]);
			setGeofenceEnabled(false);
		}
	}, [userId, deploymentId]);

	// Validate current location
	const validateLocation = useCallback(async () => {
		if (!latitude || !longitude || !userId || !deploymentId || !geofenceEnabled) {
			if (!geofenceEnabled) {
				setIsValidLocation(true); // If geofences are disabled, location is always valid
				setValidationError(null);
			}
			return;
		}

		setIsValidating(true);
		setValidationError(null);

		try {
			const response = await geofenceService.validateUserLocation(
				userId,
				deploymentId,
				latitude,
				longitude
			);

			if (response.status === 'success') {
				setIsValidLocation(response.isValid);
				if (!response.isValid) {
					setValidationError(response.message || 'Location is outside assigned geofences');
				}
			} else {
				setIsValidLocation(false);
				setValidationError(response.message || 'Location validation failed');
			}
		} catch (error) {
			setIsValidLocation(false);
			setValidationError(error.response?.data?.message || error.message);
		} finally {
			setIsValidating(false);
		}
	}, [latitude, longitude, userId, deploymentId, geofenceEnabled]);

	// Auto-validate when location changes
	useEffect(() => {
		if (latitude && longitude && userGeofences.length > 0 && geofenceEnabled) {
			validateLocation();
		} else if (latitude && longitude && (!geofenceEnabled || userGeofences.length === 0)) {
			// If geofences are disabled or user has no geofences, location is valid
			setIsValidLocation(true);
			setValidationError(null);
		}
	}, [latitude, longitude, userGeofences, geofenceEnabled, validateLocation]);

	// Load geofences on mount
	useEffect(() => {
		loadUserGeofences();
	}, [loadUserGeofences]);

	// Check if geofence validation is required
	const isGeofenceValidationRequired = geofenceEnabled && userGeofences.length > 0;

	// Create location object for components that need it
	const location = latitude && longitude ? { latitude, longitude } : null;

	// Get validation status message
	const getValidationStatus = () => {
		if (!geofenceEnabled) {
			return {
				status: 'disabled',
				message: 'Geofence restrictions are disabled for this user',
				color: 'info'
			};
		}

		if (userGeofences.length === 0) {
			return {
				status: 'no-geofences',
				message: 'No geofences assigned to this user',
				color: 'warning'
			};
		}

		if (isValidating) {
			return {
				status: 'validating',
				message: 'Validating location...',
				color: 'info'
			};
		}

		if (isValidLocation === null) {
			return {
				status: 'not-checked',
				message: 'Location not yet validated',
				color: 'warning'
			};
		}

		if (isValidLocation) {
			return {
				status: 'valid',
				message: `Location is within assigned geofence${userGeofences.length > 1 ? 's' : ''}`,
				color: 'success'
			};
		}

		return {
			status: 'invalid',
			message: validationError || 'Location is outside assigned geofences',
			color: 'danger'
		};
	};

	return {
		isValidLocation,
		validationError,
		isValidating,
		userGeofences,
		geofenceEnabled,
		isGeofenceValidationRequired,
		validateLocation,
		loadUserGeofences,
		getValidationStatus,
		location,
		latitude,
		longitude
	};
};
