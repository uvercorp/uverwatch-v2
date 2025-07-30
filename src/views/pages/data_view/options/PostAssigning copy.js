import React, { useState, useEffect } from 'react';
import axiosInstance from 'services/axios'; // Assuming you have an axios instance configured
import { useDispatch } from 'react-redux';
import { toggleToaster } from 'provider/features/helperSlice';
import Spinner from 'react-bootstrap/Spinner';
import { FiSearch, FiCheck, FiX, FiPlus, FiUser, FiUsers } from 'react-icons/fi';

const PostAssigning = ({ postId }) => {
  const dispatch = useDispatch();
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [searchTermTeams, setSearchTermTeams] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
  const [selectedTeamsToAdd, setSelectedTeamsToAdd] = useState([]);

  useEffect(() => {
    fetchAssignedUsers(postId);
    fetchAvailableUsers();
    fetchAssignedTeams(postId);
    fetchAvailableTeams();
  }, [postId]);

  // Fetch assigned users for the post
  const fetchAssignedUsers = async (postId) => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get(`/api/posts/${postId}/assigned-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`, // Assuming you have an auth token
        },
      });
      setAssignedUsers(response.data);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to fetch assigned users.' } }));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch available users
  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get('/api/users', { // Adjust API endpoint as needed
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setAvailableUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching available users:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to fetch available users.' } }));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter available users
  useEffect(() => {
    if (searchTermUsers.trim() === '') {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTermUsers.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTermUsers, availableUsers]);

  // Handle user selection for adding
  const handleUserSelectToAdd = (user) => {
    if (selectedUsersToAdd.some((u) => u.id === user.id)) {
      setSelectedUsersToAdd(selectedUsersToAdd.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsersToAdd([...selectedUsersToAdd, user]);
    }
  };

  // Assign selected users to the post
  const assignUsersToPost = async () => {
    if (selectedUsersToAdd.length === 0) return;
    setLoadingUsers(true);
    try {
      await axiosInstance.post(`/api/posts/${postId}/assign-users`, {
        user_ids: selectedUsersToAdd.map(user => user.id),
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'success', msg: 'Users assigned to post successfully.' } }));
      setSelectedUsersToAdd([]);
      fetchAssignedUsers(postId);
      fetchAvailableUsers();
    } catch (error) {
      console.error('Error assigning users:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to assign users to post.' } }));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Unassign a user from the post
  const unassignUserFromPost = async (userId) => {
    if (!window.confirm('Are you sure you want to unassign this user?')) return;
    setLoadingUsers(true);
    try {
      await axiosInstance.delete(`/api/posts/${postId}/assigned-users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'success', msg: 'User unassigned successfully.' } }));
      fetchAssignedUsers(postId);
      fetchAvailableUsers();
    } catch (error) {
      console.error('Error unassigning user:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to unassign user.' } }));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch assigned teams for the post
  const fetchAssignedTeams = async (postId) => {
    setLoadingTeams(true);
    try {
      const response = await axiosInstance.get(`/api/posts/${postId}/assigned-teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setAssignedTeams(response.data);
    } catch (error) {
      console.error('Error fetching assigned teams:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to fetch assigned teams.' } }));
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch available teams
  const fetchAvailableTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await axiosInstance.get('/api/teams', { // Adjust API endpoint as needed
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      setAvailableTeams(response.data);
      setFilteredTeams(response.data);
    } catch (error) {
      console.error('Error fetching available teams:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to fetch available teams.' } }));
    } finally {
      setLoadingTeams(false);
    }
  };

  // Filter available teams
  useEffect(() => {
    if (searchTermTeams.trim() === '') {
      setFilteredTeams(availableTeams);
    } else {
      const filtered = availableTeams.filter(team =>
        team.name.toLowerCase().includes(searchTermTeams.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchTermTeams.toLowerCase()))
      );
      setFilteredTeams(filtered);
    }
  }, [searchTermTeams, availableTeams]);

  // Handle team selection for adding
  const handleTeamSelectToAdd = (team) => {
    if (selectedTeamsToAdd.some((t) => t.id === team.id)) {
      setSelectedTeamsToAdd(selectedTeamsToAdd.filter((t) => t.id !== team.id));
    } else {
      setSelectedTeamsToAdd([...selectedTeamsToAdd, team]);
    }
  };

  // Assign selected teams to the post
  const assignTeamsToPost = async () => {
    if (selectedTeamsToAdd.length === 0) return;
    setLoadingTeams(true);
    try {
      await axiosInstance.post(`/api/posts/${postId}/assign-teams`, {
        team_ids: selectedTeamsToAdd.map(team => team.id),
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'success', msg: 'Teams assigned to post successfully.' } }));
      setSelectedTeamsToAdd([]);
      fetchAssignedTeams(postId);
      fetchAvailableTeams();
    } catch (error) {
      console.error('Error assigning teams:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to assign teams to post.' } }));
    } finally {
      setLoadingTeams(false);
    }
  };

  // Unassign a team from the post
  const unassignTeamFromPost = async (teamId) => {
    if (!window.confirm('Are you sure you want to unassign this team?')) return;
    setLoadingTeams(true);
    try {
      await axiosInstance.delete(`/api/posts/${postId}/assigned-teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'success', msg: 'Team unassigned successfully.' } }));
      fetchAssignedTeams(postId);
      fetchAvailableTeams();
    } catch (error) {
      console.error('Error unassigning team:', error);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'error', msg: 'Failed to unassign team.' } }));
    } finally {
      setLoadingTeams(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Assign Users */}
        <div className="col-md-6 border-right p-4">
          <h3><FiUser className="mr-2" /> Assign Users</h3>

          {/* Current Assigned Users */}
          <div className="mb-4">
            <h5>Current Assigned Users:</h5>
            {loadingUsers ? (
              <Spinner animation="border" size="sm" />
            ) : assignedUsers.length === 0 ? (
              <p className="text-muted">No users assigned to this post yet.</p>
            ) : (
              <ul className="list-group">
                {assignedUsers.map(assignment => (
                  <li key={assignment.user_id} className="list-group-item d-flex justify-content-between align-items-center">
                    {assignment.user.name} ({assignment.user.email})
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => unassignUserFromPost(assignment.user_id)}
                    >
                      <FiX /> Unassign
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Users */}
          <div>
            <h5>Add Users:</h5>
            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search users..."
                value={searchTermUsers}
                onChange={(e) => setSearchTermUsers(e.target.value)}
              />
            </div>
            {loadingUsers ? (
              <Spinner animation="border" size="sm" />
            ) : filteredUsers.length === 0 ? (
              <p className="text-muted">No users found.</p>
            ) : (
              <ul className="list-group">
                {filteredUsers.map(user => (
                  <li
                    key={user.id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      selectedUsersToAdd.some(u => u.id === user.id) ? 'list-group-item-primary' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleUserSelectToAdd(user)}
                  >
                    {user.name} ({user.email})
                    {selectedUsersToAdd.some(u => u.id === user.id) ? (
                      <FiCheck className="text-primary" />
                    ) : (
                      <FiPlus className="text-success" />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {selectedUsersToAdd.length > 0 && (
              <button className="btn btn-primary mt-3" onClick={assignUsersToPost} disabled={loadingUsers}>
                {loadingUsers ? <Spinner animation="border" size="sm" /> : 'Assign Selected Users'}
              </button>
            )}
          </div>
        </div>

        {/* Assign Teams */}
        <div className="col-md-6 p-4">
          <h3><FiUsers className="mr-2" /> Assign Teams</h3>

          {/* Current Assigned Teams */}
          <div className="mb-4">
            <h5>Current Assigned Teams:</h5>
            {loadingTeams ? (
              <Spinner animation="border" size="sm" />
            ) : assignedTeams.length === 0 ? (
              <p className="text-muted">No teams assigned to this post yet.</p>
            ) : (
              <ul className="list-group">
                {assignedTeams.map(assignment => (
                  <li key={assignment.team_id} className="list-group-item d-flex justify-content-between align-items-center">
                    {assignment.team.name} ({assignment.team.description})
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => unassignTeamFromPost(assignment.team_id)}
                    >
                      <FiX /> Unassign
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Teams */}
          <div>
            <h5>Add Teams:</h5>
            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search teams..."
                value={searchTermTeams}
                onChange={(e) => setSearchTermTeams(e.target.value)}
              />
            </div>
            {loadingTeams ? (
              <Spinner animation="border" size="sm" />
            ) : filteredTeams.length === 0 ? (
              <p className="text-muted">No teams found.</p>
            ) : (
              <ul className="list-group">
                {filteredTeams.map(team => (
                  <li
                    key={team.id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      selectedTeamsToAdd.some(t => t.id === team.id) ? 'list-group-item-primary' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTeamSelectToAdd(team)}
                  >
                    {team.name} ({team.description})
                    {selectedTeamsToAdd.some(t => t.id === team.id) ? (
                      <FiCheck className="text-primary" />
                    ) : (
                      <FiPlus className="text-success" />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {selectedTeamsToAdd.length > 0 && (
              <button className="btn btn-primary mt-3" onClick={assignTeamsToPost} disabled={loadingTeams}>
                {loadingTeams ? <Spinner animation="border" size="sm" /> : 'Assign Selected Teams'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAssigning;