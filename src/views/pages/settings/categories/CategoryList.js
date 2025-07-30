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

function CategoryList(props) {
//   const [surveys, setSurveys] = useState([]);
//   const dispatch = useDispatch();
//   const [pending, setPending] = useState(false);
const isValidColor = (color) => {
  const style = new Option().style;
  style.color = color;
  return style.color !== '';
};

  return (
    <>

      <Card>
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span>Categories | <span className="text-[0.6em]">List</span> </span>
              <Button variant="warning" onClick={()=>props?.toggleFormType('add','')}>Add Category</Button>

            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body >
          <hr />
          <div className="md:min-h-[300px]">
          {(!props.pending && props?.categories?.length < 1) &&
    <div className="md:flex items-center justify-center ">
        <div className="bg-white p-5 font-semibold text-[1.5em]">No Results Found</div>
        </div>
}


          {props?.pending && (<div className="flex items-center justify-center mb-4">
               <Spinner animation="grow" variant="warning" />
               </div>)}
               <div className="grid grid-cols-1 gap-2">
                 
                 {props?.categories?.map((record,index)=>(
                   <div key={index} className="bg-[#f5f5f5] p-2 cursor-pointer" onClick={()=>props?.toggleFormType('update',record)}>
                    <i

className={`${record?.icon || 'fas fa-question-circle'} text-${record?.color || 'muted'}`}
style={{
    color: isValidColor(record.color) ? record.color : '#6c757d',
    fontSize: '1.2rem',
    marginRight: '8px'
}}
/>
                    {record.name}
                    </div>
                 ))}

            </div>
          </div>


        </Card.Body>
      </Card>

    </>
  );
}

export default CategoryList;
