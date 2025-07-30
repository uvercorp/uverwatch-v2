import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// react-bootstrap components

import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';

import {useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import GoefenceList from "./GeofenceList";
import GoefenceAdd from "./GoefenceAdd";

function GoefencePage(props) {
   const [geofence, setGoefence] = useState([]);
   const dispatch = useDispatch();
   const [currentPage,setCurrentPage] = useState('list');
   const [formType,setFormType] = useState('add');
   const [deploymentId,setDeploymentId] = useState(null);
   const [selectedRecord,setSelectedRecord] = useState([]);
   const [pending, setPending] = useState(false);
   let navigate = useHistory();
   
 
   const toggleFormType = (formType,data) => {
     setCurrentPage('add');
     setFormType(formType);
     if(formType == "add"){
       setSelectedRecord([]);
     }else{
       setSelectedRecord(data);
     }
   };
 
   const populateList = (newData)=>{
     setGoefence([...geofence,newData]);
 
   }

 
 
   const updateListRecord = (updatedRecord)=>{
     
     const index = geofence.findIndex((item) => item?.id === updatedRecord.id);
     setGoefence((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));
 
   }
 
   const updateListRecordDelete = (id)=>{
     
       const newdata= geofence.filter((item)=>item.id!==id);
             setGoefence(newdata);
             setCurrentPage('list');
 
   }
   useEffect(() => {
     let deployment = localStorage.getItem('deployment');
     if (deployment && deployment !== undefined) {
       getGoefenceData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);
 
     }
    
   }, [props.show]);
 
   const getGoefenceData = async (deployment_id) => {
     setPending(true);
     setGoefence([]);
     try {
       const response = await axiosInstance.get('getGeoFencesList/' + deployment_id,
         {
           headers: {
             'Content-Type': 'application/json',
             "Authorization": `Bearer ${localStorage.getItem('access')}`
           },
           //   withCredentials: true
         }
       );
       // console.log(response)
 
       // console.log(JSON.stringify(response?.data));
       setPending(false);
       if (response?.data) {
        // alert('am here')
         let dData = response?.data?.fences;
         setGoefence(response?.data?.fences);
         console.log(dData);
 
       }
     } catch (err) {
       setPending(false);
       if (!err?.response) {
         dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))
       } else if (err.response?.status === 400) {
         dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
       } else if (err.response?.status === 401) {
         dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['detail'] } }))
       } else {
         dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }));
       }
     }
 
   }

 

  return (
    <>
      {/* Launch Button */}
     

      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {
          <motion.div
           
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            // onClick={() => {setGoefence([]);props.setShow(false);}} // Close modal when clicking outside
          >
            <motion.div
              className="bg-white rounded-lg  p-8 overflow-y-auto  "
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
            >
              {/* Modal Header */}
             
              {/* Modal Body */}
              {currentPage == 'list' &&
     <GoefenceList deploymentId={deploymentId}  toggleFormType={toggleFormType} pending={pending} setPending={setPending} geofence={geofence} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    }
    {currentPage == 'add' &&
     <GoefenceAdd accessLevel = {4} deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} geofence={geofence} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

              {/* Close Button */}
              {/* <button
                onClick={() => {setGoefence([]);props.setShow(false)}}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Close
              </button> */}
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>
  );
}

export default GoefencePage;