import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

const LocationChecker = ({
	isValidLocation,
	validationError,
	isValidating,
	onRetry,
	userGeofences = [],
	geofenceEnabled = true,
	onViewGeofences
}) => {

	// if (isValidating) {
	// 	return (
	// 		<Alert variant="info" className="mb-3">
	// 			<div className="d-flex align-items-center">
	// 				<Spinner animation="border" size="sm" className="me-2" />
	// 				<span>Validating your location against assigned geofences...</span>
	// 			</div>
	// 		</Alert>
	// 	);
	// }

	// if (!geofenceEnabled) {
	// 	return (
	// 		<Alert variant="info" className="mb-3">
	// 			<div className="d-flex align-items-center">
	// 				<i className="fas fa-info-circle me-2"></i>
	// 				<span>Geofence restrictions are disabled for your account.</span>
	// 			</div>
	// 		</Alert>
	// 	);
	// }

	// if (userGeofences.length === 0) {
	// 	return (
	// 		<Alert variant="warning" className="mb-3">
	// 			<div className="d-flex align-items-center">
	// 				<i className="fas fa-exclamation-triangle me-2"></i>
	// 				<span>No geofences assigned to your account. Contact an administrator.</span>
	// 			</div>
	// 		</Alert>
	// 	);
	// }

	// if (isValidLocation === null) {
	// 	return (
	// 		<Alert variant="warning" className="mb-3">
	// 			<div className="d-flex align-items-center">
	// 				<i className="fas fa-exclamation-triangle me-2"></i>
	// 				<span>Your location needs to be validated before posting.</span>
	// 			</div>
	// 			<div className="mt-2">
	// 				<Button size="sm" variant="outline-warning" onClick={onRetry}>
	// 					Check Location
	// 				</Button>
	// 			</div>
	// 		</Alert>
	// 	);
	// }

	// if (isValidLocation) {
	// 	return (
	// 		<Alert variant="success" className="mb-3">
	// 			<div className="d-flex align-items-center">
	// 				<i className="fas fa-check-circle me-2"></i>
	// 				<span>
	// 					Location valid! You are within your assigned geofence{userGeofences.length > 1 ? 's' : ''}.
	// 				</span>
	// 			</div>
	// 			<div className="mt-2">
	// 				<small className="text-muted">
	// 					<i className="fas fa-map-marker-alt me-1"></i>
	// 					{userGeofences.map(g => g.name).join(', ')}
	// 				</small>
	// 			</div>
	// 		</Alert>
	// 	);
	// }

	return (
		<div className="alert alert-danger mb-3">
			<div className="d-flex align-items-center">
				<i className="fas fa-times-circle me-2"></i>
				<span>Location validation failed</span>
			</div>
			<div className="mt-2">
				<p className="mb-2">{validationError}</p>
				<p className="mb-2 text-muted">
					You must be within your assigned geofence{userGeofences.length > 1 ? 's' : ''} to post content.
				</p>
				<div className="d-flex gap-2">
					<Button size="sm" variant="outline-danger" onClick={onRetry}>
						Retry Location Check
					</Button>
					{onViewGeofences && (
						<Button size="sm" variant="primary" onClick={onViewGeofences}>
							View My Geofences
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default LocationChecker;
