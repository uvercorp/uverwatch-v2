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
import CategoryList from "./CategoryList";
import CategoryAdd from "./CategoryAdd";

function CategoryPage(props) {
  const [categories, setCategories] = useState([]);
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
    setCategories([...categories,newData]);

  }

  const updateListRecord = (updatedRecord)=>{
    
    const index = categories.findIndex((item) => item?.id === updatedRecord.id);
    setCategories((prevList) => prevList.map((item, i) => i === index ? updatedRecord : item));

  }

  const updateListRecordDelete = (id)=>{
    
      const newdata= categories.filter((item)=>item.id!==id);
            setCategories(newdata);
            setCurrentPage('list');

  }

 useEffect(()=>{
   let deployment = localStorage.getItem('deployment');
   if (deployment && deployment !== undefined) { 
      getCategoryData(JSON.parse(deployment).id);
      setDeploymentId(JSON.parse(deployment).id);
   }
   
 },[]);
 
 const getCategoryData = async (deployment_id)=>{
   setPending(true);
   try {
       const response = await axiosInstance.get('getDeploymentSubCategories/'+deployment_id,
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
     let dData = response?.data?.categories;
     setCategories(dData);
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
     <CategoryList deploymentId={deploymentId} toggleFormType={toggleFormType} pending={pending} setPending={setPending} categories={categories} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    }
    {currentPage == 'add' &&
     <CategoryAdd deploymentId={deploymentId} toggleFormType={toggleFormType} formType={formType} setFormType={setFormType} record={selectedRecord} pending={pending} setPending={setPending} categories={categories} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }    
   </>
 );
}
export default CategoryPage;
