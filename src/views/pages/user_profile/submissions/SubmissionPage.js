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
// import TaskList from "./TaskList"
import SinglePostListCard from "../../data_view/SinglePostListCard";
import UpdatePostModal from "../../data_view/UpdatePostModal";
import AddToCollection from "../../data_view/options/AddToCollection";
import SharePost from "../../data_view/options/SharePost";
import AssignPost from "../../data_view/options/AssignPost";
import LinkPost from "../../data_view/options/LinkPost";

const SubmissionPage = (props) => {
  const [pending, setPending] = useState(false);
  const [postData, setPostData] = useState([]);
  const [show, setShow] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
const [showSharePost, setShowSharePost] = useState(false);
const [showLinkPost, setShowLinkPost] = useState(false);
const [showAssignPost, setShowAssignPost] = useState(false);
  const dispatch = useDispatch();

const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 25;

  // Calculate pagination
  const totalPosts = postData?.length || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = postData?.slice(indexOfFirstPost, indexOfLastPost) || [];

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger the animation of children
      },
    },
  };

  // Variants for each card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 }, // Start hidden and slightly below
    visible: { opacity: 1, y: 0 }, // Animate to visible and original position
  };

  const handleLinkPost = () =>{
    setShowLinkPost(true);
}
const handleSharePost = () =>{
  setShowSharePost(true);
}

const handleAssignPost = () =>{
  setShowAssignPost(true);
}

const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const handleMenuToggle = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

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

      getMySubmissions(JSON.parse(deployment).id);

    }

    if (deployment && deployment !== undefined) {

    } else {

      window.location.replace('/pages/login');
    }

  }, []);

  const getMySubmissions = async (deployment_id) => {

    try {
      setPending(true);
      const response = await axiosInstance.get('getMySubmissions/' + deployment_id,
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
        setPostData(uData?.posts)

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
<div className="px-0 pb-2 pt-1 bg-black min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons  text-[1.2em]">My Submissions</h1>
        <div className="pt-0">
          {/* <button className="px-3 pt-0 py-2 border bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Load Presets:</button> */}
          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Reports [{postData?.length}]</button>
        </div>
      </div>
      {pending && (
              <div className="flex items-center justify-center mb-4">
                <Spinner
                  animation="grow"
                  variant="warning"
                  className="h-[100px]"
                />
              </div>
            )}
        {
        (!props.pending  && postData?.length < 1) &&
        <div className="md:flex items-center justify-center md:min-h-[calc(100vh-200px)] bg-[#0e0b0a]">
            <div className=" text-[#faebd7] p-5 font-semibold text-[1.5em]">No Results Found For This Deployment</div>
            </div>

       }

<motion.div
        className={`max-h-[72vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 grid grid-cols-1 ${
          props?.rightOpen ? "space-y-0" : "md:grid-cols-3 gap-2"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {currentPosts.map((record, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <SinglePostListCard
                post={record}
                index={index}
                isMenuOpen={openMenuIndex === index}
                onMenuToggle={handleMenuToggle}
                showCollection={showCollection}
                setShowCollection={setShowCollection}
                show={show}
                setShow={setShow}
                setSelectedRecord={setSelectedRecord}
                removeFromCollection={props.removeFromCollection}
                deletePost={props.deletePost}
                updatePostStatus={props.updatePostStatus}
                handleAssignPost={handleAssignPost}
                handleLinkPost={handleLinkPost}
                handleSharePost={handleSharePost}
                rightOpen={props?.rightOpen}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls */}
      {/* <div className="bg-[#3F1F2F] my-gradient-bg py-1"> */}
      <div className="">
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
            className="px-3 py-1  bg-gray-700 text-white disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 ${
                currentPage === number ? 'bg-[#3F1F2F] text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="text-center text-sm text-gray-400 mt-2">
        Showing {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, totalPosts)} of {totalPosts} Reports
      </div>
      </div>


    <AddToCollection show={showCollection} setShow={setShowCollection} selectedRecord={selectedRecord}/>
    <SharePost show={showSharePost} setShow={setShowSharePost} selectedRecord={selectedRecord}/>
    <AssignPost show={showAssignPost} setShow={setShowAssignPost} selectedRecord={selectedRecord}/>
    <LinkPost show={showLinkPost} setShow={setShowLinkPost} selectedRecord={selectedRecord} allPosts={props?.posts}/>

    <UpdatePostModal show={show} setShow={setShow} selectedRecord={selectedRecord}/>
   </div>

    </>
  );
};

export default SubmissionPage;