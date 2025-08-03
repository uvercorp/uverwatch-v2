import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SingleIncomingListCard from "./SingleIncomingListCard";
import UpdatePostModal from "../data_view/UpdatePostModal";
import AddToCollection from "../data_view/options/AddToCollection";
import SharePost from "../data_view/options/SharePost";
import AssignPost from "../data_view/options/AssignPost";
import LinkPost from "../data_view/options/LinkPost";
import { isPending } from "@reduxjs/toolkit";

function IncomingList(props) {
  const [show, setShow] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
const [showSharePost, setShowSharePost] = useState(false);
const [showLinkPost, setShowLinkPost] = useState(false);
const [showAssignPost, setShowAssignPost] = useState(false);

const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 50;

  // Calculate pagination
  const totalPosts = props?.posts?.length || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = props?.posts?.slice(indexOfFirstPost, indexOfLastPost) || [];

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

  return (<>
      <div className="px-4 pb-2 pt-1 bg-black min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">INCOMING WHATSAPP REPORTS</h1>
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
        className={`max-h-[72vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 grid grid-cols-1 ${
          props?.rightOpen ? "space-y-0" : "md:grid-cols-2 gap-2"
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
              <SingleIncomingListCard
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

  </>);
}

export default IncomingList;