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
    <div className="my-gradient-bg">
      <Card.Header style={{ paddingTop: "0px" }}>
        <Card.Title as="h4">
          <div className="flex items-start justify-between pb-0">
            <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
              Geofences:
              {/* <span className="text-[0.6em]">List</span>  */}
            </span>
            {/* <Button
              variant="warning"
              onClick={() => props?.toggleFormType("add", "")}
            >
              Add New
            </Button> */}
          </div>
        </Card.Title>
      </Card.Header>
      <div className="px-4">
        <hr className="border-[#2e2c2b] mt-0 mb-6 pt-0 " />
      </div>

      <div style={{ paddingTop: "0px" }}>
        {/* <hr className="border-[#2e2c2b] mb-2" /> */}
        <div className="md:min-h-[300px] pl-4">
          {!props.pending && props?.geofence?.length < 1 && (
            <div className="md:flex items-center justify-center ">
              <div className="text-white p-5 font-semibold text-[1.5em]">
                No Results Found
              </div>
            </div>
          )}

          {props?.pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pl-3">
            {props?.geofence?.map((record, index) => (
              <div className="flex gap[3%]" key={index}>
                <span className="text-white w-[5%]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className="text-white px-4 py-2 hover:bg-gray-800 bg-[#181717] p-2 cursor-pointer w-[92%] ml-2"
                  onClick={() => props?.toggleFormType("update", record)}
                  style={{ border: "1px solid #f5f5f5" }}
                >
                  {/* <i
                    className={`${
                      record?.icon || "fas fa-question-circle"
                    } text-${record?.color || "muted"}`}
                    style={{
                      color: isValidColor(record.color)
                        ? record.color
                        : "#6c757d",
                      fontSize: "1.2rem",
                      marginRight: "8px",
                    }}
                  /> */}
                  {record.name}
                </div>
                {/* <div className="text-[0.8em]">{record.description}</div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>




    </>
  );
}

export default GoefenceList;
