export class LocationSecurityChecker {
	constructor() {
		this.suspiciousPatterns = [];
		this.lastLocations = new Map();
		this.locationHistory = new Map();
	}

	// Detect suspicious location patterns
	detectSuspiciousLocation(userId, locationData) {
		const riskFactors = {
			gps_accuracy: this.checkGPSAccuracy(locationData.accuracy),
			movement_speed: this.checkMovementSpeed(userId, locationData),
			sudden_jump: this.checkSuddenLocationJump(userId, locationData),
			circular_pattern: this.checkCircularPattern(userId, locationData),
			browser_suspicion: this.checkBrowserSuspicion(locationData)
		};

		const riskScore = this.calculateRiskScore(riskFactors);

		if (riskScore > 70) {
			this.reportSuspiciousLocation(userId, locationData, riskFactors, riskScore);
		}

		return {
			riskScore,
			riskFactors,
			isSuspicious: riskScore > 70
		};
	}

	checkGPSAccuracy(accuracy) {
		// GPS accuracy should typically be 1-10 meters
		// Very high accuracy (< 1m) or very low accuracy (> 100m) is suspicious
		if (accuracy < 1) return 0.8; // Suspiciously accurate
		if (accuracy > 100) return 0.6; // Suspiciously inaccurate
		if (accuracy > 50) return 0.3; // Somewhat inaccurate
		return 0.1; // Normal accuracy
	}

	checkMovementSpeed(userId, currentLocation) {
		const lastLocation = this.lastLocations.get(userId);
		if (!lastLocation) {
			this.lastLocations.set(userId, currentLocation);
			return 0;
		}

		const distance = this.calculateDistance(
			lastLocation.latitude,
			lastLocation.longitude,
			currentLocation.latitude,
			currentLocation.longitude
		);

		const timeDiff = (new Date(currentLocation.timestamp) - new Date(lastLocation.timestamp)) / 1000; // seconds
		const speed = distance / timeDiff; // meters per second

		// Suspicious if speed > 50 m/s (180 km/h) - likely impossible for walking/running
		if (speed > 50) return 0.9;
		if (speed > 20) return 0.6;
		if (speed > 10) return 0.3;

		return 0;
	}

	checkSuddenLocationJump(userId, currentLocation) {
		const lastLocation = this.lastLocations.get(userId);
		if (!lastLocation) return 0;

		const distance = this.calculateDistance(
			lastLocation.latitude,
			lastLocation.longitude,
			currentLocation.latitude,
			currentLocation.longitude
		);

		const timeDiff = (new Date(currentLocation.timestamp) - new Date(lastLocation.timestamp)) / 1000;

		// Suspicious if location changed by > 1km in < 1 minute
		if (distance > 1000 && timeDiff < 60) return 0.8;
		if (distance > 500 && timeDiff < 30) return 0.6;

		return 0;
	}

	checkCircularPattern(userId, currentLocation) {
		// Check if user is moving in suspicious circular patterns
		// This could indicate GPS spoofing software
		const userLocations = this.getUserLocationHistory(userId);
		if (userLocations.length < 10) return 0;

		// Simple circular pattern detection
		const center = this.calculateCenter(userLocations.slice(-10));
		const radius = this.calculateAverageRadius(userLocations.slice(-10), center);

		// If all recent locations are within a very small radius, it's suspicious
		const locationsInRadius = userLocations.slice(-10).filter(loc =>
			this.calculateDistance(loc.latitude, loc.longitude, center.lat, center.lng) < radius * 0.1
		);

		if (locationsInRadius.length > 8) return 0.7;
		return 0;
	}

	checkBrowserSuspicion(locationData) {
		// Check for browser-specific indicators of spoofing
		const userAgent = navigator.userAgent;
		const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

		// Mobile devices should have better GPS accuracy
		if (isMobile && locationData.accuracy > 50) return 0.4;

		// Check for developer tools indicators
		if (window.outerHeight - window.innerHeight > 200) return 0.3;

		return 0;
	}

	calculateRiskScore(riskFactors) {
		const weights = {
			gps_accuracy: 0.25,
			movement_speed: 0.25,
			sudden_jump: 0.20,
			circular_pattern: 0.15,
			browser_suspicion: 0.15
		};

		let totalScore = 0;
		for (const [factor, score] of Object.entries(riskFactors)) {
			totalScore += score * weights[factor];
		}

		return Math.round(totalScore * 100);
	}

	async reportSuspiciousLocation(userId, locationData, riskFactors, riskScore) {
		try {
			const token = localStorage.getItem('access');
			if (!token) return;

			await fetch('/api/reportSuspiciousLocation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					user_id: userId,
					deployment_id: this.getCurrentDeploymentId(),
					location_data: locationData,
					risk_factors: riskFactors,
					risk_score: riskScore,
					timestamp: new Date().toISOString()
				})
			});
		} catch (error) {
			console.error('Failed to report suspicious location:', error);
		}
	}

	// Update location history for a user
	updateLocationHistory(userId, locationData) {
		if (!this.locationHistory.has(userId)) {
			this.locationHistory.set(userId, []);
		}

		const history = this.locationHistory.get(userId);
		history.push({
			...locationData,
			timestamp: new Date().toISOString()
		});

		// Keep only last 50 locations
		if (history.length > 50) {
			history.splice(0, history.length - 50);
		}

		this.locationHistory.set(userId, history);
		this.lastLocations.set(userId, locationData);
	}

	// Get location history for a user
	getUserLocationHistory(userId) {
		return this.locationHistory.get(userId) || [];
	}

	// Utility methods
	calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = lat1 * Math.PI / 180;
		const φ2 = lat2 * Math.PI / 180;
		const Δφ = (lat2 - lat1) * Math.PI / 180;
		const Δλ = (lon2 - lon1) * Math.PI / 180;

		const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	calculateCenter(locations) {
		const totalLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
		const totalLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
		return {
			lat: totalLat / locations.length,
			lng: totalLng / locations.length
		};
	}

	calculateAverageRadius(locations, center) {
		const distances = locations.map(loc =>
			this.calculateDistance(loc.latitude, loc.longitude, center.lat, center.lng)
		);
		return distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
	}

	// Get current deployment ID from localStorage or URL
	getCurrentDeploymentId() {
		// Try to get from localStorage first
		const deploymentId = localStorage.getItem('deploymentId');
		if (deploymentId) return deploymentId;

		// Try to extract from URL
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('deployment') || urlParams.get('deploymentId');
	}

	// Clear location history for a user
	clearUserLocationHistory(userId) {
		this.locationHistory.delete(userId);
		this.lastLocations.delete(userId);
	}

	// Get security statistics
	getSecurityStats() {
		const totalUsers = this.locationHistory.size;
		const suspiciousUsers = Array.from(this.locationHistory.entries())
			.filter(([userId, history]) => {
				const lastLocation = history[history.length - 1];
				if (!lastLocation) return false;

				const risk = this.detectSuspiciousLocation(userId, lastLocation);
				return risk.isSuspicious;
			}).length;

		return {
			totalUsers,
			suspiciousUsers,
			suspiciousPercentage: totalUsers > 0 ? (suspiciousUsers / totalUsers) * 100 : 0
		};
	}
}

export default new LocationSecurityChecker();
