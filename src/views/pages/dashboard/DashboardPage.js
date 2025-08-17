import { React, useState,useEffect } from "react";
import MiddleSection from "./MiddleSection";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import {
  toggleLoadingBar,
  selectLoadingBar,
  toggleToaster,
  selectToasterData,
  selectToasterStatus,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "others/icons/LoadingIcon";
import axiosInstance from "services/axios";
import { login, logout, selectUser } from "provider/features/userSlice";
import Spinner from "react-bootstrap/Spinner";
import { addCollections, removeCollections } from "provider/features/collectionSlice";
import { toggleSearchValue } from "provider/features/globalSearchSlice";
import UpdatePostModal from "../data_view/UpdatePostModal";
import AddToCollection from "../data_view/options/AddToCollection";
import SharePost from "../data_view/options/SharePost";
import AssignPost from "../data_view/options/AssignPost";
import LinkPost from "../data_view/options/LinkPost";

const DashboardPage = () => {
  const taskings = [
    'Tamale Water Shortage',
    'Dansoman Riots',
    'Bono East Food Shortage',
    'Naija Drug Cartel',
    'Koforidua Vigilantes',
    'Water Shortage',
    'Election Monitoring',
    'Public Sentiment Kevin Taylor',
    'Price of goods',
    'Corruption',
    'Bribery',
    'Police brutality',
  ];

  const tabs = ['System', 'Schema', 'Accesses', 'Tools'];
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
   const [pending, setPending] = useState(false);
  const [posts, setPost] = useState([]);
  const [mostRecentReports, setMostRecentReport] = useState([]);
  const [highImpactReports, setHighImpactReport] = useState([]);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [dashboardTopAnalytics, setDashboardTopAnalytics] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showSharePost, setShowSharePost] = useState(false);
  const [showAssignPost, setShowAssignPost] = useState(false);
  const [showLinkPost, setShowLinkPost] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pass down modal control functions to sections
  const modalControls = {
    setShowModal,
    setShowCollection,
    setShowSharePost,
    setShowAssignPost,
    setShowLinkPost,
    setSelectedRecord
  };

  useEffect(() => {
    let deployment = localStorage.getItem("deployment");
    if (deployment && deployment !== undefined) {
      // if (collectionId == "0") {
        getPostData(JSON.parse(deployment).id);
        getDashboardStas(JSON.parse(deployment).id);
        getDashboardTopAnalytics(JSON.parse(deployment).id);
      // } else {
      //   getCollectionPostData(collectionId);
      // }
    }
  }, []);
  const getPostData = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get("getDashboardReports/" + deployment_id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (response?.data) {
        let dData = response?.data?.posts;
        setPost(dData);
        setMostRecentReport(response?.data?.most_recent);
        setHighImpactReport(response?.data?.highest_impact);
        setPending(false);
      }
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };

  const getDashboardStas = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get("getDashboardStats/" + deployment_id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (response?.data) {
        let dData = response?.data?.counts;
        // setPost(dData);
        setDashboardStats(dData);

        setPending(false);
      }
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };

  const getDashboardTopAnalytics = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get("getDashboardTopAnalytics/" + deployment_id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (response?.data) {
        let dData = response?.data?.analytics;
        // setPost(dData);
        setDashboardTopAnalytics(dData);

        setPending(false);
      }
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white font-mono px-8">

      <div className='flex items-start space-x-8'>
     
      </div>



<div className="flex-1 flex relative my-black-bg ">
      {/* Left Column */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-[350px] my-black-bg  z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-2/6 ${leftOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* <div className="p-4"> */}
          <h3 className="text-lg font-bold mb-4">
            {/* Left Panel */}
            </h3>
          {/* Left column content */}
          <div className="flex">
          {/* <SidebarFilterPanel/> */}
          {pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" className="h-[100px]" />
            </div>
          )}
          </div>
          <LeftSection
          posts={mostRecentReports}
          pending={pending}
          deletePost=""
          removeFromCollection={""}
          updatePostStatus={""}
          dashboardTopAnalytics={dashboardTopAnalytics}
          modalControls={modalControls} 
          />

      </div>

      {/* Middle Column */}
      <div className="flex-1 lg:w-2/6 relative my-black-bg ">
        <div className=" h-full">
          {/* Toggle Buttons Container */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Filters
            </button>

            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Main Content */}

          <MiddleSection
          dashboardStats={dashboardStats}
          dashboardTopAnalytics={dashboardTopAnalytics}
          />
          {/* {pending && (
                <div className="flex items-center justify-center mb-4">
                  <Spinner animation="grow" variant="warning" className="h-[100px]" />
                </div>
              )}
              <CardView/> */}
              {/* <MapView/> */}
              {/* <PostList
                posts={sortedPosts}
                pending={pending}
                deletePost={handleDelete}
                removeFromCollection={handleRemove}
                updatePostStatus={handlePostUpdateStatus}
              /> */}
        </div>

        {/* Overlay for mobile */}
        {(leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          ></div>
        )}
      </div>

      {/* Right Column */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[350px] my-black-bg z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-2/6 ${rightOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>

        {/* This a panel place */}
        <RightSection
          posts={highImpactReports}
          pending={pending}
          deletePost=""
          removeFromCollection={""}
          updatePostStatus={""}
          modalControls={modalControls} 
          />
      </div>

      <AddToCollection
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
      />
      
      <UpdatePostModal
        show={showModal}
        setShow={setShowModal}
        selectedRecord={selectedRecord}
      />
    </div>

    </div>
  );
};

const SettingCard = ({ title, description, selected = false }) => (
  <div
    className={`p-2 text-left ${
      selected ? 'bg-[#a8a9ab] text-[#3c3d3f]' : 'bg-[#333333] '
    }`}
    style={{border:"1px solid #515153"}}
  >
    <h3 className="font-semibold text-lg mb-1 my-font-family-overpass-mono">{title}</h3>
    <p className="text-sm ">{description}</p>
  </div>
);

export default DashboardPage;
