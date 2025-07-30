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

function EntitySurveyList(props) {

  return (
    <>

      <Card>
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span>Entity Layer | <span className="text-[0.6em]">List</span> </span>
              <Button variant="warning" onClick={()=>props?.toggleFormType('add','')}>Add Layer</Button>

            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body >
          <hr />
          <div className="md:min-h-[300px]">
          { (!props.pending && props?.surveys?.length < 1) &&
    <div className="md:flex items-center justify-center ">
        <div className="bg-white p-5 font-semibold text-[1.5em]">No Results Found</div>
        </div>
}


            {props?.pending && (<div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

              {props?.surveys?.map((record, index) => (
                <div key={index} className="bg-[#f5f5f5] p-2 py-3 cursor-pointer" onClick={()=>props?.toggleFormType('update',record)}>{record.survey_name}</div>
              ))}

            </div>
          </div> 


        </Card.Body>
      </Card>

    </>
  );
}

export default EntitySurveyList;
