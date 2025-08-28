import { useState, useEffect } from 'react';
import {
	Table,
	Button,
	Form,
	Badge,
	Alert,
	Card
} from 'react-bootstrap';
import GeofenceAssignmentModal from '../GeofenceManager/GeofenceAssignmentModal';
import geofenceService from '../../services/geofenceService';

const UserGeofenceManager = ({ deploymentId }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalShow, setModalShow] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);

	const loadUsers = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await geofenceService.getUsersWithGeofences(deploymentId);
			if (response.status === 'success') {
				setUsers(response.users || []);
			} else {
				setError('Failed to load users');
			}
		} catch (error) {
			setError('Failed to load users: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleGeofences = async (userId, enabled) => {
		try {
			await geofenceService.toggleUserReportingGeofences(
				userId,
				deploymentId,
				enabled
			);

			setSuccessMessage(`Geofence restrictions ${enabled ? 'enabled' : 'disabled'} successfully`);
			loadUsers(); // Refresh data

			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			setError(error.message);
			setTimeout(() => setError(null), 5000);
		}
	};

	const handleRemoveGeofence = async (userId, geofenceId) => {
		if (!window.confirm('Are you sure you want to remove this geofence from the user?')) {
			return;
		}

		try {
			await geofenceService.removeUserGeofence(
				deploymentId,
				userId,
				geofenceId
			);

			setSuccessMessage('Geofence removed successfully');
			loadUsers(); // Refresh data

			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			setError(error.message);
			setTimeout(() => setError(null), 5000);
		}
	};

	const handleAddGeofence = (user) => {
		setSelectedUser(user);
		setModalShow(true);
	};

	const handleModalSuccess = () => {
		loadUsers();
		setSuccessMessage('Geofence assigned successfully');
		setTimeout(() => setSuccessMessage(null), 3000);
	};

	useEffect(() => {
		if (deploymentId) {
			loadUsers();
		}
	}, [deploymentId]);

	if (!deploymentId) {
		return (
			<Alert variant="warning">
				No deployment ID provided. Please select a deployment to manage geofences.
			</Alert>
		);
	}

	return (
		<div>
			<Card className="mb-4">
				<Card.Header>
					<h4 className="mb-0">
						<i className="fas fa-map-marker-alt me-2"></i>
						User Geofence Management
					</h4>
				</Card.Header>
				<Card.Body>
					<p className="text-muted mb-0">
						Manage which users can post content and where they can post from by assigning geofences.
					</p>
				</Card.Body>
			</Card>

			{error && (
				<Alert variant="danger" onClose={() => setError(null)} dismissible>
					{error}
				</Alert>
			)}

			{successMessage && (
				<Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
					{successMessage}
				</Alert>
			)}

			{loading ? (
				<div className="text-center py-5">
					<i className="fas fa-spinner fa-spin fa-3x"></i>
					<p className="mt-3">Loading users and geofence assignments...</p>
				</div>
			) : (
				<Card>
					<Card.Body className="p-0">
						<Table responsive className="mb-0">
							<thead className="table-light">
								<tr>
									<th>User</th>
									<th>Role</th>
									<th>Assigned Geofences</th>
									<th>Geofence Restrictions</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.length === 0 ? (
									<tr>
										<td colSpan="6" className="text-center py-4 text-muted">
											No users found with geofence assignments.
										</td>
									</tr>
								) : (
									users.map(user => (
										<tr key={user.id}>
											<td>
												<div className="d-flex align-items-center">
													<div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
														style={{ width: '40px', height: '40px' }}>
														<i className="fas fa-user text-white"></i>
													</div>
													<div>
														<div className="fw-bold">{user.user?.name || user.name || 'Unknown User'}</div>
														<div className="text-muted small">
															<i className="fas fa-envelope me-1"></i>
															{user.user?.email || user.email || 'No email'}
														</div>
													</div>
												</div>
											</td>
											<td>
												<Badge bg="secondary" className="d-flex align-items-center">
													<i className="fas fa-user-tag me-1"></i>
													{user.role?.name || 'No Role'}
												</Badge>
											</td>
											<td>
												<div className="d-flex flex-wrap gap-1">
													{user.geofences && user.geofences.length > 0 ? (
														user.geofences.map(geofence => (
															<Badge key={geofence.id} bg="primary" className="d-flex align-items-center position-relative">
																<i className="fas fa-map-marker-alt me-1"></i>
																{geofence.name}
																<button
																	type="button"
																	className="btn-close btn-close-white ms-2"
																	style={{ fontSize: '0.6rem', padding: '0.25rem' }}
																	onClick={() => handleRemoveGeofence(user.id, geofence.id)}
																	title={`Remove ${geofence.name}`}
																>
																	<i className="fas fa-trash-can"></i>
																</button>
															</Badge>
														))
													) : (
														<span className="text-muted">None assigned</span>
													)}
												</div>
											</td>
											<td>
												<Form.Check
													type="switch"
													checked={user.geofence_settings?.reporting_enabled !== false}
													onChange={(e) => handleToggleGeofences(user.id, e.target.checked)}
													label={user.geofence_settings?.reporting_enabled !== false ? 'Enabled' : 'Disabled'}
												/>
											</td>
											<td>
												<div className="d-flex gap-1">
													<Button
														variant="outline-primary"
														size="sm"
														onClick={() => handleAddGeofence(user)}
													>
														<i className="fas fa-plus me-1"></i>
														Add Geofence
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</Table>
					</Card.Body>
				</Card>
			)}

			<GeofenceAssignmentModal
				show={modalShow}
				onHide={() => {
					setModalShow(false);
					setSelectedUser(null);
				}}
				onSuccess={handleModalSuccess}
				userId={selectedUser?.id}
				deploymentId={deploymentId}
				currentUserGeofences={selectedUser?.geofences || []}
			/>
		</div>
	);
};

export default UserGeofenceManager;
