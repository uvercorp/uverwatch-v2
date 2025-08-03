import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toggleToaster } from "provider/features/helperSlice";
import Spinner from "react-bootstrap/Spinner";
import swal from "sweetalert";
import { Tabs, Tab } from "react-bootstrap";
import axiosInstance from "services/axios";
import { motion, AnimatePresence } from "framer-motion";
import AssignmentUser from "./sub/AssignmentUser";
import AssignmentTeam from "./sub/AssignmentTeam";
// import Spinner from "react-bootstrap/Spinner";

const PostAssigning = ({ post, userAccess }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("users");
  const [pending, setPending] = useState(false);
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== "";
  };
  const [teams, setTeams] = useState([
    { id: 1, name: "Design Team", status: "pending" },
    { id: 2, name: "Dev Team", status: "accepted" },
  ]);
  const [newImage, setNewImage] = useState("");

  const user = {
    id: 1,
    name: "Joseph Okata Ntow",
    email: "okatantow@gmail.com",
    profile_image: "",
    role: "Admin",
    access_level: 2,
    permissions: ["create", "edit", "delete", "manage_users"],
    collections: ["Project Docs", "Templates"],
    posts: ["Getting Started Guide", "API Documentation"],
  };
  // User Assignment State
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUserAssignments, setCurrentUserAssignments] = useState([]);

  // Team Assignment State
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentTeamAssignments, setCurrentTeamAssignments] = useState([]);

  // Initial data fetch
  //   useEffect(() => {
  //     const fetchInitialData = async () => {
  //       try {
  //         setPending(true);
  //         const [
  //           usersRes,
  //           teamsRes,
  //           availableUsersRes,
  //           availableTeamsRes
  //         ] = await Promise.all([
  //           axios.get(`/api/posts/${post.id}/assigned-users`),
  //           axios.get(`/api/posts/${post.id}/assigned-teams`),
  //           axios.get(`/api/posts/${post.id}/available-users`),
  //           axios.get(`/api/posts/${post.id}/available-teams`)
  //         ]);

  //         setCurrentUserAssignments(usersRes.data);
  //         setCurrentTeamAssignments(teamsRes.data);
  //         setAvailableUsers(availableUsersRes.data);
  //         setAvailableTeams(availableTeamsRes.data);
  //         setFilteredUsers(availableUsersRes.data);
  //         setFilteredTeams(availableTeamsRes.data);
  //       } catch (error) {
  //         console.error('Initial data fetch failed:', error);
  //       } finally {
  //         setPending(false);
  //       }
  //     };

  //     if(post?.id) fetchInitialData();
  //   }, [post?.id]);

  useEffect(() => {
    let deployment = localStorage.getItem("deployment");

    if (deployment && deployment !== undefined) {
      // fetchCollectionUserLookup(JSON.parse(deployment).id, post?.id);
    } else {
      window.location.replace("/pages/login");
    }
  }, [post?.id]);

  const fetchCollectionUserLookup = async (deployment_id, collection_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(
        `getAssignedLookups/${deployment_id}/${collection_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setPending(false);
      if (response?.data) {
        let dData = response?.data;

        // Filter out users who are already in the collection
        const currentUserIds = dData?.users?.map((user) => user.user) || [];
        const filteredAvailableUsers =
          dData?.users?.filter((user) => !currentUserIds.includes(user.id)) ||
          [];

        //   setAvailableUsers(filteredAvailableUsers);
        //   setFilteredUsers(filteredAvailableUsers);
        //   setCurrentUsers(dData?.collection_users || []);
        setCurrentUserAssignments(dData?.user_assigned_posts);
        setCurrentTeamAssignments(dData?.team_assigned_posts);
        setAvailableUsers(dData?.users);
        setAvailableTeams(dData?.teams);
        setFilteredUsers(dData?.users);
        setFilteredTeams(dData?.teams);
      }
    } catch (err) {
      console.log(err);
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

  // User search filter
  useEffect(() => {
    const filterUsers = () => {
      if (!userSearchTerm) {
        setFilteredUsers(availableUsers);
        return;
      }

      const searchLower = userSearchTerm.toLowerCase();
      const filtered = availableUsers.filter(
        (user) =>
          user?.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [userSearchTerm, availableUsers]);

  // Team search filter
  useEffect(() => {
    const filterTeams = () => {
      if (!teamSearchTerm) {
        setFilteredTeams(availableTeams);
        return;
      }

      const searchLower = teamSearchTerm.toLowerCase();
      const filtered = availableTeams.filter(
        (team) =>
          team?.name.toLowerCase().includes(searchLower) ||
          (team.description &&
            team.description.toLowerCase().includes(searchLower))
      );
      setFilteredTeams(filtered);
    };

    filterTeams();
  }, [teamSearchTerm, availableTeams]);

  // User assignment functions
  const handleUserSelect = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const assignUsers = async () => {
    if (!selectedUsers.length) return;

    try {
      await axios.post(`/api/posts/${post.id}/assign-users`, {
        user_ids: selectedUsers.map((u) => u.id),
      });

      // Update local state
      setAvailableUsers((prev) =>
        prev.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
        )
      );
      setCurrentUserAssignments((prev) => [
        ...prev,
        ...selectedUsers.map((u) => ({ user: u, post_id: post.id })),
      ]);
      setSelectedUsers([]);
      setUserSearchTerm("");
    } catch (error) {
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: "Assignment failed" },
        })
      );
    }
  };

  const unassignUser = async (userId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to unassign this user?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (confirm) => {
      if (confirm) {
        try {
          await axios.delete(`/api/posts/${post.id}/unassign-user/${userId}`);

          // Find the unassigned user
          const unassignedUser = currentUserAssignments.find(
            (a) => a.user.id === userId
          )?.user;

          if (unassignedUser) {
            setAvailableUsers((prev) => [...prev, unassignedUser]);
          }

          setCurrentUserAssignments((prev) =>
            prev.filter((assignment) => assignment.user.id !== userId)
          );
        } catch (error) {
          console.error("Unassign failed:", error);
        }
      }
    });
  };

  // Team assignment functions
  const handleTeamSelect = (team) => {
    setSelectedTeams((prev) =>
      prev.some((t) => t.id === team.id)
        ? prev.filter((t) => t.id !== team.id)
        : [...prev, team]
    );
  };

  const assignTeams = async () => {
    if (!selectedTeams.length) return;

    try {
      await axios.post(`/api/posts/${post.id}/assign-teams`, {
        team_ids: selectedTeams.map((t) => t.id),
      });

      // Update local state
      setAvailableTeams((prev) =>
        prev.filter(
          (team) => !selectedTeams.some((selected) => selected.id === team.id)
        )
      );
      setCurrentTeamAssignments((prev) => [
        ...prev,
        ...selectedTeams.map((t) => ({ team: t, post_id: post.id })),
      ]);
      setSelectedTeams([]);
      setTeamSearchTerm("");
    } catch (error) {
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: "Assignment failed" },
        })
      );
    }
  };

  const unassignTeam = async (teamId) => {
    swal({
      title: "Confirm Removal",
      text: "Are you sure you want to unassign this team?",
      icon: "warning",
      buttons: ["Cancel", "Remove"],
      dangerMode: true,
    }).then(async (confirm) => {
      if (confirm) {
        try {
          await axios.delete(`/api/posts/${post.id}/unassign-team/${teamId}`);

          // Find the unassigned team
          const unassignedTeam = currentTeamAssignments.find(
            (a) => a.team.id === teamId
          )?.team;

          if (unassignedTeam) {
            setAvailableTeams((prev) => [...prev, unassignedTeam]);
          }

          setCurrentTeamAssignments((prev) =>
            prev.filter((assignment) => assignment.team.id !== teamId)
          );
        } catch (error) {
          console.error("Unassign failed:", error);
        }
      }
    });
  };

  // ... (Keep the same JSX structure as previous implementation, only state management changes)
  // The component rendering logic remains the same as before

  return (
    <div className="max-w-6xl mx-auto my-gradient-bg  p-0">
      <div className="bg-[#1F2F3F] hover:bg-[#3F1F2F] p-2 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5>
              <i
                className={`${post?.icon || "fas fa-question-circle"} text-${
                  post?.color || "muted"
                }`}
                style={{
                  color: isValidColor(post?.color) ? post?.color : "#6c757d",
                  fontSize: "1.2rem",
                  marginRight: "8px",
                }}
              />{" "}
              <span className="font-bold">{post.title}</span>
            </h5>
            <p className="mb-1 text-[0.94em]">{post.description}</p>
            <small className="text-muted">
              Access Level: {post.access_level}
            </small>
          </div>
        </div>
      </div>
      {pending && (
        <div className="flex justify-center mb-4">
          <Spinner animation="border" variant="warning" />
        </div>
      )}

      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75 }}
        className=" md:min-h-[500px]"
      >
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {/* {['users', 'teams'].map((tab) => ( */}
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 font-medium capitalize ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-user-friends mr-2"></i>
              Users
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`py-4 px-1 font-medium capitalize ${
                activeTab === "teams"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Teams
            </button>
            {/* ))} */}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "users" && (
            <>
              <AssignmentUser postId={post.id} />
            </>
          )}

          {activeTab === "teams" && (
            <>
              <AssignmentTeam postId={post.id} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PostAssigning;
