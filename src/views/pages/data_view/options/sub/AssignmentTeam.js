import React, { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "services/axios";
import { useDispatch } from "react-redux";
import { toggleToaster } from "provider/features/helperSlice";
import Spinner from "react-bootstrap/Spinner";
import swal from "sweetalert";

function AssignmentTeam(props) {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [assignedTask, setassignedTask] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');

    if (deployment && deployment !== undefined) {
      fetchPostTeamLookup(JSON.parse(deployment).id, props.postId);
    } else {
      window.location.replace('/pages/login');
    }
  }, [props.postId]);

  // Filter teams based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTeams(availableTeams);
    } else {
      const filtered = availableTeams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, availableTeams]);

  const fetchPostTeamLookup = async (deployment_id, post_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(
        `getPostTeamLookups/${deployment_id}/${post_id}`,
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

        // Filter out teams that are already in the post
        const currentTeamIds = dData?.post_teams?.map(team => team.team) || [];
        const filteredAvailableTeams = dData?.teams?.filter(team =>
          !currentTeamIds.includes(team.id)
        ) || [];

        setAvailableTeams(filteredAvailableTeams);
        setFilteredTeams(filteredAvailableTeams);
        setCurrentTeams(dData?.post_teams || []);
      }
    } catch (err) {
      setPending(false);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "error",
            msg: "Failed to load team data",
          },
        })
      );
    }
  };

  const handleTeamSelect = (team) => {
    if (selectedTeams.some((t) => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter((t) => t.id !== team.id));
    } else {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const saveTeamsToPost = async () => {
    if (selectedTeams?.length === 0) {
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "warning",
            msg: "Please select at least one team",
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
        "assignPostToTeams",
        {
          post_id: props.postId,
          task: assignedTask,
          team_ids: selectedTeams?.map((team) => team.id),
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

      // Refresh listaaaaa
      setSelectedTeams([]);
      let deployment = localStorage.getItem('deployment');
      fetchPostTeamLookup(JSON.parse(deployment).id, props.postId);
      setassignedTask("");
    } catch (error) {
      console.error("Error saving teams:", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: "error",
            msg: error.response?.data?.message || "Failed to save teams",
          },
        })
      );
    } finally {
      setPending(false);
    }
  };

  const removeTeamFromPost = async (teamId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to remove this team from the post?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setPending(true);
        try {
          await axiosInstance.post(
            "removeTeamFromPost",
            {
              post_id: props.postId,
              team_id: teamId,
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
                msg: "Team removed successfully",
              },
            })
          );

          let deployment = localStorage.getItem('deployment');
          fetchPostTeamLookup(JSON.parse(deployment).id, props.postId);
        } catch (error) {
          console.error("Error removing team:", error);
          dispatch(
            toggleToaster({
              isOpen: true,
              toasterData: {
                type: "error",
                msg: "Failed to remove team",
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
                  Currently Assigned Teams
                </h3>

      {pending && (
        <div className="flex justify-center mb-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      {/* Current Teams Section */}
      <div className="mb-8">

        {currentTeams?.length === 0 ? (
          <p className="text-gray-400">No teams in this post yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTeams?.map((team) => (
              <div
                key={team.id}
                className="border  p-2 flex justify-between items-center bg-[#3F1F2F]"
              >
                <div>
                  <h5 className="font-medium">{team.name}</h5>
                  <p className="text-sm text-gray-400">{team.description}</p>
                </div>
                <button
                  onClick={() => removeTeamFromPost(team.team_id)}
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

      {/* Add Teams Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Teams to A Report</h3>

        {/* Search Form */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 my-input"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Available Teams List */}
        {filteredTeams?.length === 0 ? (
          <p className="text-gray-400">
            {availableTeams?.length === 0 ? "No teams available" : "No matching teams found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            {filteredTeams?.map((team) => (
              <div
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={`border  p-2 cursor-pointer transition-colors ${
                  selectedTeams.some((t) => t.id === team.id)
                    ? "border-blue-500 bg-[#3F1F2F]"
                    : "border-gray-200 bg-[#1F2F3F]"
                }`}
              >

                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{team.name}</h5>
                    <p className="text-sm text-gray-400">{team.description}</p>
                  </div>
                  {selectedTeams.some((t) => t.id === team.id) ? (
                    <FiCheck className="text-blue-500" />
                  ) : (
                    <FiPlus className="text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Teams Preview */}
        {selectedTeams?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Selected Teams ({selectedTeams?.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTeams?.map((team) => (
                <div
                  key={team.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1  flex items-center"
                >
                  <span>{team.name}</span>
                  <button
                    onClick={() =>
                      setSelectedTeams(
                        selectedTeams.filter((t) => t.id !== team.id)
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
            onClick={saveTeamsToPost}
            disabled={pending || selectedTeams?.length === 0}
            className={`px-4 py-2  text-white ${
              pending || selectedTeams?.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {pending ? "Assigning..." : "Assign To Teams"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
export default AssignmentTeam;