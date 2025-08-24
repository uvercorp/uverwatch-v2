import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SinglePostListCardForDashboard from "../data_view/SinglePostListCardForDashboard";
import UpdatePostModal from "../data_view/UpdatePostModal";
import AddToCollection from "../data_view/options/AddToCollection";
import SharePost from "../data_view/options/SharePost";
import AssignPost from "../data_view/options/AssignPost";
import LinkPost from "../data_view/options/LinkPost";
import { isPending } from "@reduxjs/toolkit";


function TopLocations(props) {
  const topLocations = props?.dashboardTopAnalytics?.top_locations || [];

  // Calculate max count for scaling
  const maxLocationCount = topLocations.length > 0
    ? Math.max(...topLocations.map(loc => loc.post_count), 1)
    : 1;

  // Color classes for different positions
  const locationColors = [
    'bg-red-700',    // First place
    'bg-orange-600', // Second place
    'bg-blue-500'    // Third place
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 pt-0">
        <span className="text-xl font-semibold mb-2 p-0 w-full text-white py-1 text-[1.8em]">
          TOP <span className="bg-gray-400 text-black">03:</span> LOCATIONS
        </span>
      </div>

      {topLocations.slice(0, 3).map((location, index) => (
        <div key={index} className="grid grid-cols-2 gap-0.5 w-full p-0">
          <span className="text-xl font-semibold w-full py-0 truncate">
            {location?.address || 'No address available'}
          </span>
          <div className="w-full h-3 mr-0">
            <div
              className={`h-6 p-1 text-white ${locationColors[index] || 'bg-gray-500'}`}
              style={{
                width: `${((location?.post_count || 0) / maxLocationCount) * 100}%`,
                minWidth: 'fit-content' // Ensures count is always visible
              }}
            >
              {location?.post_count || 0}
            </div>
          </div>
        </div>
      ))}

      {/* Show empty states if less than 3 locations */}
      {topLocations.length < 3 && (
        Array.from({ length: 3 - topLocations.length }).map((_, index) => (
          <div key={`empty-${index}`} className="grid grid-cols-2 gap-0.5 w-full p-0">
            <span className="text-xl font-semibold w-full py-1 text-gray-400">
              No location #{index + topLocations.length + 1}
            </span>
            <div className="w-full h-4 mr-0">
              <div className="h-8 p-2 bg-gray-300 text-gray-600" style={{ width: '0%' }}>
                0
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function LeftSection(props) {
  const [show, setShow] = useState(false);
  // const [showCollection, setShowCollection] = useState(false);
  // const [selectedRecord, setSelectedRecord] = useState(null);
  // const [showSharePost, setShowSharePost] = useState(false);
  // const [showLinkPost, setShowLinkPost] = useState(false);
  // const [showAssignPost, setShowAssignPost] = useState(false);
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


  const { 
    setShowModal, 
    setShowCollection,
    setShowSharePost,
    setShowAssignPost,
    setShowLinkPost,
    setSelectedRecord 
  } = props.modalControls;

  // Update all handlers to use the new setters
  const handleMenuClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const handleMenuToggle = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

   // Handler functions that use the modal controls
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleAddToCollection = (record) => {
    setSelectedRecord(record);
    setShowCollection(true);
  };

  const handleShare = (record) => {
    setSelectedRecord(record);
    setShowSharePost(true);
  };

  const handleAssign = (record) => {
    setSelectedRecord(record);
    setShowAssignPost(true);
  };

  const handleLink = (record) => {
    setSelectedRecord(record);
    setShowLinkPost(true);
  };


  return (
    <>
      <div className="px-1 pb-2 pt-0 bg-black min-h-screen font-mono text-white">
        <h2 className="text-xl font-semibold mb-2">MOST RECENT ({props?.posts?.length})</h2>
        {/* <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest  text-[1.7em]">CARD VIEW</h1>
        <div className="pt-0">

          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Reports [{props?.posts?.length}]</button>
        </div>
      </div> */}

        {!props.pending && props?.posts?.length < 1 && (
          <div className="md:flex items-center justify-center md:min-h-[calc(100vh-300px)] bg-[#0e0b0a]">
            <div className=" text-[#faebd7] p-5 font-semibold text-[1.5em]">
              No Results Found For This Deployment
            </div>
          </div>
        )}
        <motion.div
          className="max-h-[65vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
          // style={{ maxHeight: "calc(100vh - 220px)" }} // Adjust maxHeight as needed
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {/* {props?.posts?.map((record, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            transition={{ duration: 0.5, delay: index * 0.2 }} // Add delay based on index
          >
            <SinglePostListCard post={record} showCollection={showCollection} setShowCollection={setShowCollection}
            show={show} setShow={setShow} setSelectedRecord={setSelectedRecord} removeFromCollection={props.removeFromCollection}
            deletePost={props.deletePost} updatePostStatus={props.updatePostStatus}
            handleAssignPost={handleAssignPost}
            handleLinkPost={handleLinkPost}
            handleSharePost={handleSharePost}

            />
          </motion.div>
        ))} */}
            {props?.posts?.map((record, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* <SinglePostListCardForDashboard
                  post={record}
                  index={index}
                  isMenuOpen={openMenuIndex === index}
                  onMenuToggle={handleMenuToggle}
                 
                  
                 

                  onEdit={handleMenuClick}
        onAddToCollection={handleAddToCollection}

                /> */}
                <SinglePostListCardForDashboard
                post={record}
                index={index}
                isMenuOpen={openMenuIndex === index}
                onMenuToggle={handleMenuToggle}
                setShowCollection={setShowCollection}
                  show={show}
                  setShow={setShow}
                  setSelectedRecord={setSelectedRecord}
                  removeFromCollection={props.removeFromCollection}
                  deletePost={props.deletePost}
                  updatePostStatus={props.updatePostStatus}
                onEdit={handleEdit}
                onAddToCollection={handleAddToCollection}
                onShare={handleShare}
                onAssign={handleAssign}
                onLink={handleLink}
              />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <TopLocations
        dashboardTopAnalytics={props?.dashboardTopAnalytics} />

        {/* <AddToCollection
          show={showCollection}
          setShow={setShowCollection}
          selectedRecord={selectedRecord}
        />
        <SharePost
          show={showSharePost}
          setShow={setShowSharePost}
          selectedRecord={selectedRecord}
        />
        <AssignPost
          show={showAssignPost}
          setShow={setShowAssignPost}
          selectedRecord={selectedRecord}
        />
        <LinkPost
          show={showLinkPost}
          setShow={setShowLinkPost}
          selectedRecord={selectedRecord}
          allPosts={props?.posts}
        />

        <UpdatePostModal
        
          show={show}
          setShow={setShow}
          selectedRecord={selectedRecord}
        /> */}
      </div>
    </>
  );
}

export default LeftSection;
