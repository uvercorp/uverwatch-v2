import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SinglePostListCard from "./SinglePostListCard";
import UpdatePostModal from "./UpdatePostModal";
import AddToCollection from "./options/AddToCollection";
import SharePost from "./options/SharePost";
import AssignPost from "./options/AssignPost";
import LinkPost from "./options/LinkPost";
import { isPending } from "@reduxjs/toolkit";

function PostList(props) {
  const [show, setShow] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
const [showSharePost, setShowSharePost] = useState(false);
const [showLinkPost, setShowLinkPost] = useState(false);
const [showAssignPost, setShowAssignPost] = useState(false);
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

  return (<>
      <div className="px-4 pb-2 pt-1 bg-black min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">CARD VIEW</h1>
        <div className="pt-0">
          {/* <button className="px-3 pt-0 py-2 border bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Load Presets:</button> */}
          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Reports [{props?.posts?.length}]</button>
        </div>
      </div>
      
        {
        (!props.pending  && props?.posts?.length < 1) &&
        <div className="md:flex items-center justify-center md:min-h-[calc(100vh-200px)] bg-[#0e0b0a]">
            <div className=" text-[#faebd7] p-5 font-semibold text-[1.5em]">No Results Found For This Deployment</div>
            </div>
    
       }
    <motion.div
      className="max-h-[90vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      // style={{ maxHeight: "calc(100vh - 220px)" }} // Adjust maxHeight as needed
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
       
        {props?.posts?.map((record, index) => (
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
        ))}
      </AnimatePresence>
      
    </motion.div>
    <AddToCollection show={showCollection} setShow={setShowCollection} selectedRecord={selectedRecord}/>
    <SharePost show={showSharePost} setShow={setShowSharePost} selectedRecord={selectedRecord}/>
    <AssignPost show={showAssignPost} setShow={setShowAssignPost} selectedRecord={selectedRecord}/>
    <LinkPost show={showLinkPost} setShow={setShowLinkPost} selectedRecord={selectedRecord} allPosts={props?.posts}/>

    <UpdatePostModal show={show} setShow={setShow} selectedRecord={selectedRecord}/> 
   </div>

  </>);
}

export default PostList;