import React, { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "services/axios";
import { useDispatch } from "react-redux";
import { toggleToaster } from "provider/features/helperSlice";
import Spinner from "react-bootstrap/Spinner";
import swal from "sweetalert";

function CollectionUser(props) {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');

    if (deployment && deployment !== undefined) {
      fetchCollectionUserLookup(JSON.parse(deployment).id, props.collectionId);
    } else {
      window.location.replace('/pages/login');
    }
  }, [props.collectionId]);

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

  const fetchCollectionUserLookup = async (deployment_id, collection_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(
        `getCollectionUserLookups/${deployment_id}/${collection_id}`,
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
        
        // Filter out users who are already in the collection
        const currentUserIds = dData?.collection_users?.map(user => user.user) || [];
        const filteredAvailableUsers = dData?.users?.filter(user => 
          !currentUserIds.includes(user.id)
        ) || [];
        
        setAvailableUsers(filteredAvailableUsers);
        setFilteredUsers(filteredAvailableUsers);
        setCurrentUsers(dData?.collection_users || []);
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

  const saveUsersToCollection = async () => {
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

    setPending(true);
    try {
      const response = await axiosInstance.post(
        "addUsersToCollection",
        {
          collection_id: props.collectionId,
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
      fetchCollectionUserLookup(JSON.parse(deployment).id, props.collectionId);
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

  const removeUserFromCollection = async (userId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to remove this user from the collection?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setPending(true);
        try {
          await axiosInstance.post(
            "removeUserFromCollection",
            {
              collection_id: props.collectionId,
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
          fetchCollectionUserLookup(JSON.parse(deployment).id, props.collectionId);
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
    <div className="my-gradient-bg max-w-6xl mx-auto bg-white rounded-lg">
      <h4 className="font-bold mb-3">Manage Users in Collection</h4>

      {pending && (
        <div className="flex justify-center mb-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      {/* Current Users Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Users</h3>
        {currentUsers?.length === 0 ? (
          <p className="text-gray-500">No users in this collection yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentUsers?.map((user) => (
              <div
                key={user.id}
                className="border rounded-lg p-2 flex justify-between items-center"
              >
                <div>
                  <h5 className="font-medium">{user.name}</h5>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                      {user.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeUserFromCollection(user.user)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove from collection"
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
        <h3 className="text-lg font-semibold mb-4">Add Users to Collection</h3>
        
        {/* Search Form */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full my-input pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Available Users List */}
        {filteredUsers?.length === 0 ? (
          <p className="text-gray-500">
            {availableUsers?.length === 0 ? "No users available" : "No matching users found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                  selectedUsers.some((u) => u.id === user.id)
                    ? "border-blue-500 bg-[#3b3229]"
                    : "border-gray-200 hover:bg-[#3b3229]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{user.name}</h5>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
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
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
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
        <div className="flex justify-end">
          <button
            onClick={saveUsersToCollection}
            disabled={pending || selectedUsers?.length === 0}
            className={`px-4 py-2 rounded-md text-white ${
              pending || selectedUsers?.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {pending ? "Adding..." : "Add Selected Users"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollectionUser;