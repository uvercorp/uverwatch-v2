import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// react-bootstrap components

import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import List from "./List";
import Add from "./Add";

function CustomModal(props) {
   const [customInputs, setCustomInput] = useState([]);
   const dispatch = useDispatch();
   const [currentPage,setCurrentPage] = useState('list');
   const [formType,setFormType] = useState('add');
   const [deploymentId,setDeploymentId] = useState(null);
   const [selectedRecord,setSelectedRecord] = useState([]);
   const [pending, setPending] = useState(false);

   const toggleFormType = (formType,data) => {

     setFormType(formType);
     if(formType == "add"){
       props.setCustomFieldView('add');
       setSelectedRecord(data);
     }else{
      props.customFieldView = 'update';
      setSelectedRecord(props.selectedUpdateRecord);
     }
   };





   useEffect(() => {
    console.log('selectedUpdateRecord');
    console.log(props.selectedUpdateRecord);
    setSelectedRecord(props.selectedUpdateRecord);

  }, [props.selectedUpdateRecord]);

   useEffect(() => {
     let deployment = localStorage.getItem('deployment');
     if (deployment && deployment !== undefined) {
       getCustomInputData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);

     }

   }, []);

   const getCustomInputData = async (deployment_id) => {
     setPending(true);
     try {
       const response = await axiosInstance.get('getCustomInput',
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
         let dData = response?.data?.custom_inputs;
         setCustomInput(dData);
         // console.log(dData);

       }
     } catch (err) {
       setPending(false);

     }

   }

  return (
    <>
      {/* Launch Button */}


      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {props.show && (
           <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           onClick={() => props.setShow(false)} // Close modal when clicking outside
         >
            {/* Modal Container */}
            <motion.div
              className="my-gradient-bg  shadow-lg p-8 overflow-y-auto max-h-[90vh] mx-auto mt-8
                         w-[90%] sm:w-[80%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
              style={{border: "1px solid #2e2c2b"}}
            >
               <div className="font-bold text-[1.2em] text-gray-100">Add Field</div>
               <hr className="border-[#2e2c2b] mb-6" />
              {/* Modal Header */}

              {props.customFieldView == 'list' &&
    <div className="grid grid-cols-2 gap-3">
    {customInputs?.map((record, index) => (
      <div key={index}  onClick={()=>toggleFormType('add',record)} className="bg-[#1c1b1a] hover:bg-[#3b3229] p-2  text-gray-200 cursor-pointer  hover:text-gray-100 focus:text-gray-100">

      {/* <div key={index}  onClick={()=>toggleFormType('add',record)} className="bg-gray-100 p-2 rounded-sm text-gray-700 cursor-pointer  hover:text-black focus:text-black"> */}
      <div className="">{record.name}</div>
      <div className="text-[0.8em]">{record.description}</div>

      </div>
   ))}


    </div>
    }
    {(props.customFieldView == 'add' || props.customFieldView == 'update') &&
     <Add  addCustomField={props.addCustomField} customFieldView={props.customFieldView} setCustomFieldView={props.setCustomFieldView} record={selectedRecord} selectedUpdateRecord={props.selectedUpdateRecord} formType={formType}  />
    }


              {/* Close Button */}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CustomModal;