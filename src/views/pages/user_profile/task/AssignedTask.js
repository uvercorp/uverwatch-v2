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
import TaskList from "./TaskList"

const AssignedTask = (props) => {
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

      // getUserData(JSON.parse(deployment).id);

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



  return (
     <>



        {/* Tabs Navigation */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75 }}
          className=' md:min-h-[500px] '
        >


          {/* Tab Content */}

                {/* <h3 className="text-lg font-semibold mb-4 text-white">Assigned Tasks</h3> */}
                <TaskList
              posts={props?.posts}
              pending={pending}
              updateListRecordPost = {props?.updateListRecordPost}
              // deletePost={handleDelete}
              // removeFromCollection={handleRemove}
              // updatePostStatus={handlePostUpdateStatus}
              // rightOpen={rightOpen}

            />
        </motion.div>


    </>
  );
};

export default AssignedTask;