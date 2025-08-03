import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Tab
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import MapTest from "views/Maptest";
// import LocationSelectMap from "./LocationSelectMap";
import Spinner from 'react-bootstrap/Spinner';
// import ImageInput from "./ImageInput";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from "services/axios";
import AssignedTask from "./task/AssignedTask";
import Security from "./Security"
import SubmissionPage from "./submissions/SubmissionPage"

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('assigned tasks');
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upperLower: false,
    number: false,
    specialChar: false
  });

  const validatePassword = (pass) => {
    setPasswordValidations({
      length: pass.length >= 8 && pass.length <= 15,
      upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(pass),
      number: /\d/.test(pass),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    });
  };
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();
  const [teams, setTeams] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [newImage, setNewImage] = useState('');
  const [user, setUser] = useState();
  const [permissions, setPermissions] = useState();

  // const user = {
  //   id: 1,
  //   name: "Joseph Okata Ntow",
  //   email: "okatantow@gmail.com",
  //   profile_image: "",
  //   role: "Admin",
  //   access_level: 2,
  //   permissions: ['create', 'edit', 'delete', 'manage_users'],
  //   collections: ['Project Docs', 'Templates'],
  //   posts: ['Getting Started Guide', 'API Documentation']
  // };

  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {

      getUserData(JSON.parse(deployment).id);

    }

    if (deployment && deployment !== undefined) {

    } else {

      window.location.replace('/pages/login');
    }

  }, []);

  const getUserData = async (deployment_id) => {

    try {
      setPending(true);
      const response = await axiosInstance.get('getUserData/' + deployment_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
          //   withCredentials: true
        }
      );

      if (response?.data) {
        let uData = response?.data
        // console.log(uData);
        setUser(uData?.user[0]);
        setTeams(uData?.teams);
        setUserPosts(uData?.user_assigned_posts);

        // setFormData(response?.data?.deployment_data?.deployment, response?.data?.deployment_data?.settings);
        // setDeploymentData(dData);

        setPending(false);

      }
    } catch (err) {

      if (!err?.response) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))
      } else if (err.response?.status === 400) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
      } else if (err.response?.status === 401) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['detail'] } }))

      } else {

        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))

      }

    }



  }
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     setNewImage(reader.result);
    //   };
    //   reader.readAsDataURL(file);
    // }
    if (file) {

      // if (event.target.files && event.target.files[0]) {
          let fileSize =file.size; // in bytes
          let maxSize = "1500000";
          if(fileSize>maxSize){
            alert('Sorry You Cannot Upload an image size more than ' + parseInt(maxSize)/1000000 + ' MB');
            setTimeout(()=>{
              // this.imageUrl = this.defaultImageUrl;
              setNewImage("");
            }, 500);
            return false;
          }else{
              const reader = new FileReader();

              reader.onload = (e) => {
                setNewImage(e.target.result);
                // setSelectedImage(e.target.result); // Base64 data URL
                // handleImageChange(e.target.result); // Pass to parent component
                uploadPicture(e.target.result);
              };

              reader.readAsDataURL(file);
          }


  }
  };

  const handleTeamAction = (teamId, action) => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    changePassword();
    // Add password change logic here
  };
  const changePassword= async () => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "updatePassword",
        JSON.stringify(password),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        let newData = results?.data?.team;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecord(newData);
        setPassword({ current: '', new: '', confirm: '' })
        setPasswordValidations({
          length: false,
          upperLower: false,
          number: false,
          specialChar: false
        });

      }
      if (results?.data?.status === "error") {
        let newData = results?.data?.user;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "error", msg: results?.data?.message },
          })
        );
        setPending(false);
        // updateListRecord(newData);
      }
      setPassword({ current: '', new: '', confirm: '' })
      setPasswordValidations({
        length: false,
        upperLower: false,
        number: false,
        specialChar: false
      });
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
    setPending(false);
  };

  const uploadPicture= async (base64) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "uploadProfileImage",
        JSON.stringify({ profile_image: base64 }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        let newData = results?.data?.user;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecord(newData);
      }

    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
    setPending(false);
  };
  const handleAccept = (record_id, value, text) => {
    swal({
      title: "Confirm " + text,
      text: "Once Confirmed, Record Status will change",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        upTeamInviteStatus(record_id, value);
      }
    });
  };
  const upTeamInviteStatus = async (idD, pStatus) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "manageTeamInvite",
        JSON.stringify({ id: idD, status: pStatus }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        let newData = results?.data?.team;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecord(newData);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
  };
  const updateListRecord = (updatedRecord) => {

    const index = teams.findIndex((item) => item?.id === updatedRecord.id);
    setTeams((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));

  }
  const updateListRecordPost = (updatedRecord) => {

    const index = userPosts.findIndex((item) => item?.id === updatedRecord.id);
    setUserPosts((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));

  }
  return (
     <>
      <style>{`
      .disabled\:opacity-50:disabled {
  opacity: 0.5;
}
.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}
      `}</style>
    <div className="min-h-lvh flex items-start justify-center py-1 px-1">
      {/* <div className="md:min-w-[80%] md:min-h-[80%]  my-gradient-bg   overflow-hidden"> */}
      <div className="md:min-w-[100%] md:min-h-[80%]  my-gradient-bg   overflow-hidden">

        {/* Profile Header */}

        <div className="bg-gradient-to-r from-[#2e2f30] to-[#2a2033] p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                {newImage || user?.profile_image ? (
                  <img
                    src={newImage || user?.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {user?.name.charAt(0)}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <input type="file" className="hidden" onChange={handleImageChange} />
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-blue-100">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm ">
                {user?.role}
              </span>
            </div>
          </div>
          {pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" className="h-[100px]" />
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75 }}
          className=' md:min-h-[500px]'
        >
          <div className="border-b border-black">
            <nav className="flex space-x-8 px-6">
              {/* {['permissions', 'teams', 'collections', 'posts', 'security'].map((tab) => ( */}
              {['assigned tasks','my submissions','teams', 'security','permissions' ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 my-font-family-overpass-mono font-medium capitalize ${activeTab === tab
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 my-gradient-bg">
          {activeTab === 'assigned tasks' && (

                <AssignedTask
                posts = {userPosts}
                updateListRecordPost = {updateListRecordPost}
                />

            )}

{activeTab === 'my submissions' && (

<SubmissionPage
posts = {userPosts}
/>

)}

            {activeTab === 'permissions' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">User Permissions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions?.map((permission) => (
                    <div key={permission} className="bg-gray-50 px-4 py-2 rounded-md capitalize">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Team Invitations</h3>
                <div className="space-y-4">
                  {teams?.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3   my-label" style={{border: "1px solid #2e2c2b"}}>
                      <div>
                        <h4 className="font-medium capitalize">{team.team_name}</h4>
                        <p>{team.team_description}</p>
                        <span
                          className={`text-sm font-semibold capitalize ${team.invitation_status === 'pending'
                            ? 'text-gray-500'
                            : team.invitation_status === 'accepted'
                              ? 'text-green-500'
                              : team.invitation_status === 'leave'
                                ? 'text-yellow-500'
                                : team.invitation_status === 'declined'
                                  ? 'text-red-500'
                                  : 'text-gray-500' // default fallback
                            }`}
                        >
                          {team.invitation_status}
                        </span>
                      </div>
                      <div className="space-x-2">
                        {team.invitation_status === 'pending' && (
                          <>
                            <button className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                              onClick={() => handleAccept(team.id, 'accepted', 'Acceptance')}>
                              Accept
                            </button>
                            <button className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                              onClick={() => handleAccept(team.id, 'declined', 'Decline')}>
                              Decline
                            </button>
                          </>
                        )}
                        {team.invitation_status === 'accepted' && (
                          <button
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                            // onClick={() => handleTeamAction(team.id, 'leave')}
                            onClick={() => handleAccept(team.id, 'leave', 'Leave')}
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                       {activeTab === 'security' && (
                        <>
                        <Security
                        handlePasswordChange ={handlePasswordChange}
                        password = {password}
                        setPassword = {setPassword}
                        validatePassword={validatePassword}
                        passwordValidations = {passwordValidations}

                        />
              {/* <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">

                <div>
                  <label className="block text-sm font-medium my-label">Current Password</label>
                  <input
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium my-label">New Password</label>
                  <input
                    type="password"
                    value={password.new}
                    onChange={(e) => {
                      setPassword({ ...password, new: e.target.value });
                      validatePassword(e.target.value);
                    }}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                  <div className="mt-2 text-sm">
                    <div className={`flex items-center ${passwordValidations.length ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{passwordValidations.length ? '✓' : '✗'}</span>
                      8-15 characters
                    </div>
                    <div className={`flex items-center ${passwordValidations.upperLower ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{passwordValidations.upperLower ? '✓' : '✗'}</span>
                      Upper & lowercase letters
                    </div>
                    <div className={`flex items-center ${passwordValidations.number ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{passwordValidations.number ? '✓' : '✗'}</span>
                      At least one number
                    </div>
                    <div className={`flex items-center ${passwordValidations.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{passwordValidations.specialChar ? '✓' : '✗'}</span>
                      At least one special character
                    </div>
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium my-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                  {password.confirm && (password.new !== password.confirm) && (
                    <div className="text-red-600 text-sm mt-1">Passwords do not match</div>
                  )}
                </div>


                <div className='flex items-start justify-between'>
                  <span>{" "}</span>
                <button
                  type="submit"
                  disabled={
                    !password.current ||
                    !Object.values(passwordValidations).every(v => v) ||
                    password.new !== password.confirm
                  }
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
                </div>
              </form> */}
              </>
            )}
            {/* Add similar sections for Collections and Posts */}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default UserProfilePage;