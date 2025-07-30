import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// react-bootstrap components

import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
// import {addTeams,removeTeams} from 'provider/features/teamSlice';
import {useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import TeamList from "./TeamList";
import TeamAdd from "./TeamAdd";

function TeamPage(props) {
   const [teams, setTeam] = useState([]);
   const dispatch = useDispatch();
   const [currentPage,setCurrentPage] = useState('list');
   const [formType,setFormType] = useState('add');
   const [deploymentId,setDeploymentId] = useState(null);
   const [selectedRecord,setSelectedRecord] = useState([]);
   const [pending, setPending] = useState(false);
   const [pendingTeamPost, setPendingTeamPost] = useState(false);
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
     setTeam([...teams,newData]);
 
   }

   const searchTeam = (record)=>{
  //  dispatch(addTeams({name:record.name,teamId:record.id,teamData:[]}));
  //  navigate.push('/deployment/data_view?team='+record.id);
  //  props.setShow(false);

  }

  const removeColl = ()=>{
    dispatch(removeTeams({name:'',teamId:''}));
  }
 
   const updateListRecord = (updatedRecord)=>{
     
     const index = teams.findIndex((item) => item?.id === updatedRecord.id);
     setTeam((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));
 
   }
 
   const updateListRecordDelete = (id)=>{
     
       const newdata= teams.filter((item)=>item.id!==id);
             setTeam(newdata);
             setCurrentPage('list');
 
   }
   useEffect(() => {
     let deployment = localStorage.getItem('deployment');
     if (deployment && deployment !== undefined) {
       getTeamData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);
 
     }
    
   }, [props.show]);
 
   const getTeamData = async (deployment_id) => {
     setPending(true);
     setTeam([]);
     try {
       const response = await axiosInstance.get('getDeploymentTeam/' + deployment_id,
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
         let dData = response?.data?.teams;
         setTeam(dData);
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

 
  return (
    <>
      {/* Launch Button */}
     

      {/* Modal Backdrop and Content */}
    
              {currentPage == 'list' &&
     <TeamList deploymentId={deploymentId} searchTeam={searchTeam} toggleFormType={toggleFormType} pending={pending} setPending={setPending} teams={teams} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    }
    {currentPage == 'add' &&
     <TeamAdd deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} teams={teams} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

           
    </>
  );
}

export default TeamPage;