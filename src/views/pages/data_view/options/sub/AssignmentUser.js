import React, { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "services/axios";
import { useDispatch } from "react-redux";
import { toggleToaster } from "provider/features/helperSlice";
import Spinner from "react-bootstrap/Spinner";
import swal from "sweetalert";

function AssignmentUser(props) {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [assignedTask, setassignedTask] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');

    if (deployment && deployment !== undefined) {
      fetchPostUserLookup(JSON.parse(deployment).id, props.postId);
    } else {
      window.location.replace('/pages/login');
    }
  }, [props.postId]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, availableUsers]);

  const fetchPostUserLookup = async (deployment_id, post_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(
        `getPostUserLookups/${deployment_id}/${post_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }
      );

      setPending(false);
      if (response?.data) {
        let dData = response?.data;

        // Filter out users who are already in the post
        const currentUserIds = dData?.post_users?.map(user => user.user) || [];
        const filteredAvailableUsers = dData?.users?.filter(user =>
          !currentUserIds.includes(user.id)
        ) || [];

        setAvailableUsers(filteredAvailableUsers);
        setFilteredUsers(filteredAvailableUsers);
        setCurrentUsers(dData?.post_users || []);
      }
    } catch (err) {
      setPending(false);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "error",
            msg: "Failed to load user data",
          },
        })
      );
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const saveUsersToPost = async () => {

    if (selectedUsers?.length === 0) {
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "warning",
            msg: "Please select at least one user",
          },
        })
      );
      return;
    }

    if (assignedTask === "") {
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "warning",
            msg: "Please Enter The Task",
          },
        })
      );
      return;
    }

    setPending(true);
    try {
      const response = await axiosInstance.post(
        "assignPostToUsers",
        {
          post_id: props.postId,
          task: assignedTask,
          user_ids: selectedUsers?.map((user) => user.id),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }
      );

      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "success",
            msg: response.data.message,
          },
        })
      );

      // Refresh lists
      setSelectedUsers([]);
      let deployment = localStorage.getItem('deployment');
      fetchPostUserLookup(JSON.parse(deployment).id, props.postId);
      setassignedTask("");
    } catch (error) {
      console.error("Error saving users:", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "error",
            msg: error.response?.data?.message || "Failed to save users",
          },
        })
      );
    } finally {
      setPending(false);
    }
  };

  const removeUserFromPost = async (userId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to remove this user from the post?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setPending(true);
        try {
          await axiosInstance.post(
            "removeUserFromPost",
            {
              post_id: props.postId,
              user_id: userId,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('access')}`
              },
            }
          );

          dispatch(
            toggleToaster({
              isOpen: true,
              toasterData: {
                type: "success",
                msg: "User removed successfully",
              },
            })
          );

          let deployment = localStorage.getItem('deployment');
          fetchPostUserLookup(JSON.parse(deployment).id, props.postId);
        } catch (error) {
          console.error("Error removing user:", error);
          dispatch(
            toggleToaster({
              isOpen: true,
              toasterData: {
                type: "error",
                msg: "Failed to remove user",
              },
            })
          );
        } finally {
          setPending(false);
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto my-gradient-bg ">
      <h3 className="text-lg font-semibold mb-3">
                  <i className="fas fa-list-ul mr-2"></i>
                  Currently Assigned Report
                </h3>

      {pending && (
        <div className="flex justify-center mb-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      {/* Current Users Section */}
      <div className="mb-8">
        {/* <h3 className="text-lg font-semibold mb-4">Current Users</h3> */}
        {currentUsers?.length === 0 ? (
          <p className="text-gray-400">No users in this post yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentUsers?.map((user) => (
              <div
                key={user.id}
                className="border  p-2 flex justify-between items-center"
              >
                <div>
                  <h5 className="font-medium">{user.name}</h5>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 ">
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeUserFromPost(user.user_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove from post"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Users Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Assign Report to User(s)</h3>

        {/* Search Form */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 my-input"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Available Users List */}
        {filteredUsers?.length === 0 ? (
          <p className="text-gray-400">
            {availableUsers?.length === 0 ? "No users available" : "No matching users found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`border  p-2 cursor-pointer transition-colors ${
                  selectedUsers.some((u) => u.id === user.id)
                  ? "border-blue-500 bg-[#3F1F2F]"
                    : "border-gray-200 bg-[#1F2F3F]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{user.name}</h5>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 ">
                        {user.role}
                      </span>
                    )}
                  </div>
                  {selectedUsers.some((u) => u.id === user.id) ? (
                    <FiCheck className="text-blue-500" />
                  ) : (
                    <FiPlus className="text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Users Preview */}
        {selectedUsers?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Selected Users ({selectedUsers?.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers?.map((user) => (
                <div
                  key={user.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1  flex items-center"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() =>
                      setSelectedUsers(
                        selectedUsers.filter((u) => u.id !== user.id)
                      )
                    }
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr/>
        <div className="grid grid-cols-1 md:flex md:items-start md:justify-between gap-2">
        <div className="md:w-[73%]">
                  <label className="block text-sm font-medium my-label">Task / Action</label>
                  <input
                    type="assignedTask"
                    value={assignedTask}
                    onChange={(e) => {
                      setassignedTask(e.target.value);
                      // validateassignedTask(e.target.value);
                    }}
                    className="mt-1 block w-full my-input"
                    required
                  />
                  </div>
                  <div className="md:w-[27%]">
                  <label className="block text-sm font-medium my-label text-black">.</label>
          <button
            onClick={saveUsersToPost}
            disabled={pending || selectedUsers?.length === 0}
            className={`px-4 py-2  text-white ${
              pending || selectedUsers?.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {pending ? "Assigning..." : "Assign To Users"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentUser;