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
import { CiEdit } from "react-icons/ci";

function GoefenceList(props) {
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  };
  useEffect(() => {
      // alert('geofence ready ; '+props?.geofence?.length)
      console.log(props.geofence);
    }, [props.geofence]);
  return (
    <>

      <Card>
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span> Geofences | <span className="text-[0.6em]">List</span> </span>
              {/* <Button variant="warning" onClick={()=>props?.toggleFormType('add','')}>Add Status</Button> */}

            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body >
          <hr />
          <div className="md:min-h-[300px]">
            {(!props.pending && props?.geofence?.length < 1) &&
              <div className="md:flex items-center justify-center ">
                <div className="bg-white p-5 font-semibold text-[1.5em]">No Results Found</div>
              </div>
            }


            {props?.pending && (<div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>)}
            <div className="grid grid-cols-2 gap-2">
           
              {props?.geofence?.map((record, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between" >
                  <div onClick={() => props?.toggleFormType('update', record)} className="cursor-pointer">
                    <div className="">

                      {record.name} </div>
                    <div className="text-[0.8em]">{record.description}</div>
                  </div>
                  <div>
                    <div onClick={() => props?.toggleFormType('update', record)}>
                      <CiEdit className="h-5 w-5 cursor-pointer" />
                    </div>
                  </div>

                </div>

              ))}

            </div>
          </div>


        </Card.Body>
      </Card>

    </>
  );
}

export default GoefenceList;
