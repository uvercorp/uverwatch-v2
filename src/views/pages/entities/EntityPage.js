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

import EntitySelect from "./EntitySelect";
import EntityAddBasic from "./EntityAddBasic";
import EntityAdd from "./EntityAdd";

function EntityPage() {
    const [surveys, setSurveys] = useState([]);
    const dispatch = useDispatch();
    const [currentPage,setCurrentPage] = useState('list');
    const [formType,setFormType] = useState('add');
    const [deploymentId,setDeploymentId] = useState(null);
    const [userId,setUserId] = useState(null);
    const [selectedRecord,setSelectedRecord] = useState([]);
    const [pending, setPending] = useState(false);
  
    const toggleFormType = (formType,data) => {
      setCurrentPage('add');
      setFormType(formType);
      // if(formType == "add"){
      //   setSelectedRecord([]);
      // }else{
        setSelectedRecord(data);
      // }
    };
  
    const populateList = (newData)=>{
      // alert('reach here')
      // closeModal();
      setSurveys([...surveys,newData]);
  
    }
  
    const updateListRecord = (updatedRecord)=>{
      
      const index = surveys.findIndex((item) => item?.id === updatedRecord.id);
      setSurveys((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));
  
    }
  
    const updateListRecordDelete = (id)=>{
      
        const newdata= surveys.filter((item)=>item.id!==id);
              setSurveys(newdata);
              setCurrentPage('list');
  
    }
    useEffect(() => {
      let deployment = localStorage.getItem('deployment');
      if (deployment && deployment !== undefined) {
        getSurveyData(JSON.parse(deployment).id);
        setDeploymentId(JSON.parse(deployment).id);
  
      }
      let user = localStorage.getItem('currentUser');
      if (user && user !== undefined) {
        setUserId(JSON.parse(user).id);
      }

      if (deployment && deployment !== undefined) {
    
      }else{
      
        window.location.replace('/pages/login');
      }
  
    }, []);
  
    const getSurveyData = async (deployment_id) => {
      setPending(true);
      try {
        const response = await axiosInstance.get('getDeploymentEntitySurvey/' + deployment_id,
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
          let dData = response?.data?.surveys;
          dData.unshift({id:0,survey_name:'Basic Entity',survey_description:'desc'})
          setSurveys(dData);
          // console.log(dData);
  
        }
      } catch (err) {
        setPending(false);
        
      }
  
    }
  return (
    <>
     {currentPage == 'list' &&
     <EntitySelect userId={userId} deploymentId={deploymentId} toggleFormType={toggleFormType} pending={pending} setPending={setPending} surveys={surveys} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    }
    {(currentPage == 'add' && selectedRecord.id == 0) &&
     <EntityAddBasic userId={userId} deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} surveys={surveys} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }
    {(currentPage == 'add' && selectedRecord.id !== 0) &&
     <EntityAdd userId={userId} deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} surveys={surveys} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

         </>
  );
}

export default EntityPage;
