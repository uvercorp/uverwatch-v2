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
import SurveyList from "./EntitySurveyList";
import SurveyAdd from "./EntitySurveyAdd";
import EntitySurveyList from "./EntitySurveyList";
import EntitySurveyAdd from "./EntitySurveyAdd";

function EntitySurveysPage(props) {
  const [surveys, setSurveys] = useState([]);
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
        setSurveys(dData);
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
    {currentPage == 'list' &&
     <EntitySurveyList deploymentId={deploymentId} toggleFormType={toggleFormType} pending={pending} setPending={setPending} surveys={surveys} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    }
    {currentPage == 'add' &&
     <EntitySurveyAdd deploymentId={deploymentId} toggleFormType={toggleFormType} record={selectedRecord} pending={pending} setPending={setPending} formType={formType} setFormType={setFormType} surveys={surveys} currentPage={currentPage} setCurrentPage={setCurrentPage} populateList={populateList} updateListRecord={updateListRecord} updateListRecordDelete={updateListRecordDelete}/>
    }

    </>
  );
}

export default EntitySurveysPage;
