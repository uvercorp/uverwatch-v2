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
import UserList from "./UserList";
import UserAdd from "./UserAdd";

function UsersPage() {
const [users, setUser] = useState([]);
const [roles, setRole] = useState([]);
const [accessLevels, setAccessLevel] = useState([]);
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
    setUser([...users,newData]);

  }

  const updateListRecord = (updatedRecord)=>{
    
    const index = users.findIndex((item) => item?.id === updatedRecord.id);
    setUser((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));

  }

  const updateListRecordDelete = (id)=>{
    
      const newdata= users.filter((item)=>item.id!==id);
            setUser(newdata);
            setCurrentPage('list');

  }

  useEffect(()=>{
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) { 
       getUserData(JSON.parse(deployment).id);
       setDeploymentId(JSON.parse(deployment).id);
    }
    
  },[]);
  
  const getUserData = async (deployment_id)=>{
    setPending(true);
    try {
        const response = await axiosInstance.get('getDeploymentUsers/'+deployment_id,
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
      let dData = response?.data?.users;
      let drole = response?.data?.roles;
      let aLevel = response?.data?.access_levels;
      setUser(dData);
      setRole(drole);
      setAccessLevel(aLevel);
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
     <UserList deploymentId={deploymentId} toggleFormType={toggleFormType} pending={pending} setPending={setPending} users={users} roles={roles}  currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    }
    {currentPage == 'add' &&
     <UserAdd deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} roles={roles} users={users} accessLevels={accessLevels} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }
   
    </>
  );
}

export default UsersPage;
