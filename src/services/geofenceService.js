import axiosInstance from './axios';
import { baseURL } from 'others/env';

export class GeofenceService {
	constructor() {
		this.baseURL = baseURL;
	}

	// Get user's assigned geofences
	async getUserGeofences(deploymentId, userId) {
		try {
			const response = await axiosInstance.get(
				`/getUserGeofences/${deploymentId}/${userId}`,
				{
					headers: {
						'Content-Type': 'application/json',
						"Authorization": `Bearer ${localStorage.getItem('access')}`
					}
				}
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to get user geofences: ${error.message}`);
		}
	}

	// Validate user location against assigned geofences
	async validateUserLocation(userId, deploymentId, latitude, longitude) {
		try {
			const response = await axiosInstance.post('/validateUserLocation', {
				user_id: userId,
				deployment_id: deploymentId,
				latitude,
				longitude
			}, {
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${localStorage.getItem('access')}`
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(`Location validation failed: ${error.message}`);
		}
	}

	// Add geofence to user
	async addUserGeofence(userId, geofenceId, deploymentId) {
		try {
			const response = await axiosInstance.post('/addUserGeofence', {
				user_id: userId,
				geofence_id: geofenceId,
				deployment_id: deploymentId
			}, {
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${localStorage.getItem('access')}`
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(`Failed to add geofence: ${error.message}`);
		}
	}

	// Remove geofence from user
	async removeUserGeofence(deploymentId, userId, geofenceId) {
		try {
			const response = await axiosInstance.delete(
				`/removeUserGeofence/${deploymentId}/${userId}/${geofenceId}`,
				{
					headers: {
						'Content-Type': 'application/json',
						"Authorization": `Bearer ${localStorage.getItem('access')}`
					}
				}
			);
			return response.data;
		} catch (error) {
			throw new Error(`Failed to remove geofence: ${error.message}`);
		}
	}

	// Toggle user reporting geofences
	async toggleUserReportingGeofences(userId, deploymentId, enabled) {
		try {
			const response = await axiosInstance.post('/toggleUserReportingGeofences', {
				user_id: userId,
				deployment_id: deploymentId,
				enabled
			}, {
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${localStorage.getItem('access')}`
				}
			});
			return response.data;
		} catch (error) {
			throw new Error(`Failed to toggle geofences: ${error.message}`);
		}
	}

	// Get all available geofences for a deployment
	async getAvailableGeofences(deploymentId) {
		try {
			const response = await axiosInstance.get(`getAvailableGeofences/${deploymentId}`, {
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${localStorage.getItem('access')}`
				}
			});

			if (response?.data?.geofences) {
				return {
					status: 'success',
					geofences: response.data.geofences
				};
			} else {
				return {
					status: 'success',
					geofences: []
				};
			}
		} catch (error) {
			throw new Error(`Failed to get available geofences: ${error.message}`);
		}
	}

	// Get users with their geofence assignments
	async getUsersWithGeofences(deploymentId) {
		try {
			const response = await axiosInstance.get(`getDeploymentUsersWithGeofences/${deploymentId}`, {
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${localStorage.getItem('access')}`
				}
			});

			if (response?.data?.users) {
				return {
					status: 'success',
					users: response.data.users
				};
			} else {
				return {
					status: 'success',
					users: []
				};
			}
		} catch (error) {
			console.error('Error loading users with geofences:', error);
			throw new Error(`Failed to get users with geofences: ${error.message}`);
		}
	}
}

export default new GeofenceService();
