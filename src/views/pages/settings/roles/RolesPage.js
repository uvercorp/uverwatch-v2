import { React, useState, useEffect } from "react";

// react-bootstrap components
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
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import RoleList from "./RoleList";
import RoleAdd from "./RoleAdd";

function RolesPage() {
const [roles, setRole] = useState([]);
   const dispatch = useDispatch();

  const [currentPage,setCurrentPage] = useState('list');
  const [formType,setFormType] = useState('add');
  const [deploymentId,setDeploymentId] = useState(null);
  const [selectedRecord,setSelectedRecord] = useState([]);
  const [pending, setPending] = useState(false);

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
    setRole([...roles,newData]);

  }

  const updateListRecord = (updatedRecord)=>{
    
    const index = roles.findIndex((item) => item?.id === updatedRecord.id);
    setRole((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));

  }

  const updateListRecordDelete = (id)=>{
    
      const newdata= roles.filter((item)=>item.id!==id);
            setRole(newdata);
            setCurrentPage('list');

  }
  useEffect(()=>{
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) { 
       getRoleData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);
    }
    
  },[]);
  
  const getRoleData = async (deployment_id)=>{
    setPending(true);
    try {
        const response = await axiosInstance.get('getDeploymentRoles/'+deployment_id,
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
     if(response?.data){
      let dData = response?.data?.roles;
      setRole(dData);
      // console.log(dData);
  
     }
      } catch (err) {
        setPending(false);
        if (!err?.response) {
        dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))
      } else if (err.response?.status === 400) {
         dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:loginErrors}}))
      } else if (err.response?.status === 401) {
        dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:err?.response.data['detail']}}))
  
      } else {
        
        dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))
        
      }
    
      }
  
  
  
  }   
  return (
    <>
     {currentPage == 'list' &&
     <RoleList deploymentId={deploymentId} toggleFormType={toggleFormType} pending={pending} setPending={setPending} roles={roles} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    }
    {currentPage == 'add' &&
     <RoleAdd deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} roles={roles} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

         
    </>
  );
}

export default RolesPage;
