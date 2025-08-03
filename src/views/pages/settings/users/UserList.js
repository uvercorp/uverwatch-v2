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
  Tab,
  Table
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function UserList(props) {
//   const [surveys, setSurveys] = useState([]);
//   const dispatch = useDispatch();
//   const [pending, setPending] = useState(false);


  return (
    <>
    <div className="my-gradient-bg">
      <Card.Header style={{ paddingTop: "0px" }}>
        <Card.Title as="h4">
          <div className="flex items-start justify-between pb-0">
            <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
              Users:
              {/* <span className="text-[0.6em]">List</span>  */}
            </span>
            <Button
              variant="warning"
              onClick={() => props?.toggleFormType("add", "")}
            >
              Add New
            </Button>
          </div>
        </Card.Title>
      </Card.Header>
      <div className="px-4">
        <hr className="border-[#2e2c2b] mt-0 mb-6 pt-0 " />
      </div>

      <div style={{ paddingTop: "0px" }}>
        {/* <hr className="border-[#2e2c2b] mb-2" /> */}
        <div className="md:min-h-[300px] pl-4">
          {!props.pending && props?.users?.length < 1 && (
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
          {/* <div className="grid grid-cols-2 gap-3 pl-3">
            {props?.users?.map((record, index) => (
              <div className="flex gap[3%]" key={index}>
                <span className="text-white w-[5%]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className="text-white px-4 py-2 hover:bg-gray-800 bg-[#181717] p-2 cursor-pointer w-[92%] ml-2"
                  onClick={() => props?.toggleFormType("update", record)}
                  style={{ border: "1px solid #f5f5f5" }}
                >

                  {record.name}
                </div>
              </div>
            ))}
          </div> */}



<Table className="w-full text-sm text-left text-white bg-[#1a1a1a] border-t  border-gray-700">
  <thead className="bg-[#2a2a2a] text-white">
    <tr>
      <th className="px-4 py-2 border-t  border-gray-700">ID</th>
      <th className="px-4 py-2 border-t  border-gray-700">Name</th>
      <th className="px-4 py-2 border-t  border-gray-700">Role</th>
      <th className="px-4 py-2 border-t  border-gray-700">Email</th>
    </tr>
  </thead>
  <tbody>
    {props?.users?.map((record, index) => (
      <tr
        key={index}
        onClick={() => props?.toggleFormType('update', record)}
        className={`cursor-pointer hover:bg-[#333] transition-colors ${
          index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#2b2b2b]'
        }`}
      >
        <td className="px-4 py-2 border-t  border-gray-700">{record.id}</td>
        <td className="px-4 py-2 border-t  border-gray-700">{record.name}</td>
        <td className="px-4 py-2 border-t  border-gray-700">{record.role_name}</td>
        <td className="px-4 py-2 border-t  border-gray-700">{record.email}</td>
      </tr>
    ))}
  </tbody>
</Table>

        </div>
      </div>
    </div>




    </>
  );
}

export default UserList;
