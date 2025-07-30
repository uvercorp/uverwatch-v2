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

      <Card>
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span>Users | <span className="text-[0.6em]">List</span> </span>
              <Button variant="warning" onClick={()=>props?.toggleFormType('add','')}>Add User</Button>

            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body className="table-full-width table-responsive px-3">
                <hr/>
                {props?.pending && (<div className="flex items-center justify-center mb-4">
                <Spinner animation="grow" variant="warning" />
                </div>)}
                
               
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Name</th>
                      {/* <th className="border-0">Name</th> */}
                      <th className="border-0">Role</th>
                      <th className="border-0">Email</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                   
                    
                    {props?.users?.map((record,index)=>(
                      <tr key={index} onClick={()=>props?.toggleFormType('update',record)} className="cursor-pointer">
                      <td >{record.id}</td>
                      <td >{record.name}</td>
                      <td >{record.role_name}</td>
                      {/* <td >{record.deployment_role}</td> */}
                      <td >{record.email}</td>
                      </tr>
                    ))}

                     
                      
                   
                    
                   
                  </tbody>
                </Table>
              </Card.Body>
      </Card>

    </>
  );
}

export default UserList;
