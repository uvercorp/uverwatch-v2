import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// react-bootstrap components

import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import {addCollections,removeCollections} from 'provider/features/collectionSlice';
import {useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import CollectionList from "./CollectionList";
import CollectionAdd from "./CollectionAdd";

function CollectionPage(props) {
   const [collections, setCollection] = useState([]);
   const dispatch = useDispatch();
   const [currentPage,setCurrentPage] = useState('list');
   const [formType,setFormType] = useState('add');
   const [deploymentId,setDeploymentId] = useState(null);
   const [selectedRecord,setSelectedRecord] = useState([]);
   const [pending, setPending] = useState(false);
   const [pendingCollectionPost, setPendingCollectionPost] = useState(false);
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
     // alert('reach here')
     // closeModal();
     setCollection([...collections,newData]);
 
   }

   const searchCollection = (record)=>{
   dispatch(addCollections({name:record.name,collectionId:record.id,owner:record.created_by,accessLevel: record.access_level,collectionData:[]}));
   navigate.push('/deployment/data_view?collection='+record.id);
   props.setShow(false);

  }

  const removeColl = ()=>{
    dispatch(removeCollections({name:'',collectionId:''}));
  }
 
   const updateListRecord = (updatedRecord)=>{
     
     const index = collections.findIndex((item) => item?.id === updatedRecord.id);
     setCollection((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));
 
   }
 
   const updateListRecordDelete = (id)=>{
     
       const newdata= collections.filter((item)=>item.id!==id);
             setCollection(newdata);
             setCurrentPage('list');
 
   }
   useEffect(() => {
     let deployment = localStorage.getItem('deployment');
     if (deployment && deployment !== undefined) {
       getCollectionData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);
 
     }
    
   }, [props.show]);
 
   const getCollectionData = async (deployment_id) => {
     setPending(true);
     setCollection([]);
     try {
       const response = await axiosInstance.get('getDeploymentCollection/' + deployment_id,
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
         let dData = response?.data?.collections;
         setCollection(dData);
         // console.log(dData);
 
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

   const getCollectionPost = async (id) => {
    setPendingCollectionPost(true);
    // setCollection([]);
    try {
      const response = await axiosInstance.get('getCollectionPost/' + id,
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
        let dData = response?.data?.collections;
        setCollection(dData);
        // console.log(dData);

      }
    } catch (err) {
      setPendingCollectionPost(false);
      
    }

  }

  return (
    <>
      {/* Launch Button */}
     

      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {props.show && (
          <motion.div
            className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1900]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {setCollection([]);props.setShow(false);}} // Close modal when clicking outside
          >
            <motion.div
              className="absolute my-black-bg rounded-lg shadow-lg md:w-[50%] max-w-[1200px] p-0 overflow-y-auto max-h-[90vh] z-[1901]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
            >
              {/* Modal Header */}
             
              {/* Modal Body */}
              {currentPage == 'list' &&
     <CollectionList deploymentId={deploymentId} searchCollection={searchCollection} toggleFormType={toggleFormType} pending={pending} setPending={setPending} collections={collections} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    }
    {currentPage == 'add' &&
     <CollectionAdd deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} collections={collections} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

              {/* Close Button */}
              {/* <button
                onClick={() => {setCollection([]);props.setShow(false)}}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Close
              </button> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CollectionPage;