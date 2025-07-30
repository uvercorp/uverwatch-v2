import React, { useState, useEffect } from "react";
import { FiSearch, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import axiosInstance from "services/axios";
import { useDispatch } from "react-redux";
import { toggleToaster } from "provider/features/helperSlice";
import Spinner from "react-bootstrap/Spinner";
import swal from "sweetalert";

function CollectionTeam(props) {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');

    if (deployment && deployment !== undefined) {
      fetchCollectionTeamLookup(JSON.parse(deployment).id, props.collectionId);
    } else {
      window.location.replace('/pages/login');
    }
  }, [props.collectionId]);

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

  const fetchCollectionTeamLookup = async (deployment_id, collection_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(
        `getCollectionTeamLookups/${deployment_id}/${collection_id}`,
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
        
        // Filter out teams that are already in the collection
        const currentTeamIds = dData?.collection_teams?.map(team => team.team) || [];
        const filteredAvailableTeams = dData?.teams?.filter(team => 
          !currentTeamIds.includes(team.id)
        ) || [];
        
        setAvailableTeams(filteredAvailableTeams);
        setFilteredTeams(filteredAvailableTeams);
        setCurrentTeams(dData?.collection_teams || []);
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

  const saveTeamsToCollection = async () => {
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

    setPending(true);
    try {
      const response = await axiosInstance.post(
        "addTeamsToCollection",
        {
          collection_id: props.collectionId,
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

      // Refresh lists
      setSelectedTeams([]);
      let deployment = localStorage.getItem('deployment');
      fetchCollectionTeamLookup(JSON.parse(deployment).id, props.collectionId);
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

  const removeTeamFromCollection = async (teamId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to remove this team from the collection?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        setPending(true);
        try {
          await axiosInstance.post(
            "removeTeamFromCollection",
            {
              collection_id: props.collectionId,
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
          fetchCollectionTeamLookup(JSON.parse(deployment).id, props.collectionId);
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
    <div className="my-gradient-bg max-w-6xl mx-auto bg-white rounded-lg">
      <h4 className="font-bold mb-3">Manage Teams in Collection</h4>

      {pending && (
        <div className="flex justify-center mb-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      {/* Current Teams Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Teams</h3>
        {currentTeams?.length === 0 ? (
          <p className="text-gray-500">No teams in this collection yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTeams?.map((team) => (
              <div
                key={team.id}
                className="border rounded-lg p-2 flex justify-between items-center"
              >
                <div>
                  <h5 className="font-medium">{team.name}</h5>
                  <p className="text-sm text-gray-600">{team.description}</p>
                </div>
                <button
                  onClick={() => removeTeamFromCollection(team.team)}
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

      {/* Add Teams Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Add Teams to Collection</h3>
        
        {/* Search Form */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full my-input pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Available Teams List */}
        {filteredTeams?.length === 0 ? (
          <p className="text-gray-500">
            {availableTeams?.length === 0 ? "No teams available" : "No matching teams found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            {filteredTeams?.map((team) => (
              <div
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                  selectedTeams.some((t) => t.id === team.id)
                    ? "border-blue-500 bg-[#3b3229]"
                    : "border-gray-200 hover:bg-[#3b3229]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">{team.name}</h5>
                    <p className="text-sm text-gray-600">{team.description}</p>
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
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
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
        <div className="flex justify-end">
          <button
            onClick={saveTeamsToCollection}
            disabled={pending || selectedTeams?.length === 0}
            className={`px-4 py-2 rounded-md text-white ${
              pending || selectedTeams?.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {pending ? "Adding..." : "Add Selected Teams"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollectionTeam;