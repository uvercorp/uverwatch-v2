import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import swal from 'sweetalert';
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Tab
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from '../../../../provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function UserAdd(props) {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [initialPassword, setInitialPassword] = useState("");
  const [formValue, setFormValue] = useState(
    {
      id: '',
      deployment: '',
      name: '',
      email: '',
      password: '',
      password_changed: 'false',
      deployment_role: '',
      access_level: '',
    }
  );

  useEffect(() => {
    if (props.record && props.formType == "update") {
      setFormValue(props.record);
     setInitialPassword(props.record.password);

    } else {
      setFormValue({
        id: '',
        deployment: props?.deploymentId,
        name: '',
        email: '',
        password: '',
        password_changed: 'false',
        deployment_role: '',
        access_level: '',
      })
    }
  //   setFormValue({
  //     ...formValue,
  //     password:''
  //  });
  }, [props.record, props.formType]);

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value
    });
  }

  const handleSubmit = () => {
    setFormValue({
      ...formValue,
      deployment: props?.deploymentId,
    });
    if (validateformData(formValue, setInvalidFields)) {
      // alert('form valid')

      addRecordInstance(formValue);
      setFormValue({
        name: '',
        deployment: props?.deploymentId,
        email: '',
        password: '',
        password_changed: 'false',
        deployment_role: '',
        access_level: '',
      })

    } else {
      setPending(false);
      setTimeout(() => {
        // Your data here
        setInvalidFields("");
      }, 5000)
    }


  }

  const handleUpdate = () => {
    if (validateformData(formValue, setInvalidFields)) {
      updateRecordInstance(formValue);
    } else {
      setTimeout(() => {
        // Your data here
        setInvalidFields("");
      }, 5000)
    }

  }

  const [invalidFields, setInvalidFields] = useState('');
  function validateformData(formData, setInvalidFields) {
    // alert(formData.password+" "+initialPassword);
    const invalidFields = []; // Array to store invalid field messages

    // Check for empty required fields
    if (!formData.name) {
      invalidFields.push('User Name');
    }
    if (!formData.email) {
      invalidFields.push('Email');
    }

    if (!formData.deployment_role) {
      invalidFields.push('Role');
    }
    if (!formData.access_level) {
      invalidFields.push('Access Level');
    }
    if (props.formType == "add" && !formData.password) {
      invalidFields.push('Password');
    }
    
    if (props.formType == "update") {
      // if(!formValue.password){
       
        // invalidFields.push('Password');
      //   setFormValue({
      //     ...formValue,
      //     password_changed:'false'
      //  });
       
      // }else{
       if(formValue.password !== initialPassword){
        setFormValue({
          ...formValue,
          password_changed:'true'
       });
       }else{
        setFormValue({
          ...formValue,
          password_changed:'f'
       });
       }
      
      // }
     
    }
    


    if (invalidFields.length > 0) {
      const errorText = `Please fill in the following required fields: ${invalidFields.join(', ')}`;
      setInvalidFields(errorText); // Update state with comma-separated error message
      return false; // Invalid data
    }

    return true; // Valid data
  }

  const addRecordInstance = async (data) => {

    setPending(true);
    const results = await axiosInstance.post('createDeploymentUser',
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
        //   withCredentials: true
      }
    );
    if (results?.data?.status == "success") {

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "User Added Successfully" } }))

      setPending(false);
      props.populateList(results?.data?.data);

    }
  }

  const updateRecordInstance = async (data) => {
    
    setPending(true);
    const results = await axiosInstance.post('updateDeploymentUser',
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
        //   withCredentials: true
      }
    );
    if (results?.data?.status == "success") {

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "User Updated Successfully" } }))

      setPending(false);
      props.updateListRecord(results?.data?.data);

    }
  }


  const handleDelete = (val) => {

    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {



          deleteRecord(val);
        } else {
          // swal("No Action Taken!");

        }
      });

  }

  const deleteRecord = async (idD) => {
    setPending(true);
    const results = await axiosInstance.post('deleteDeploymentUser',
      JSON.stringify({ id: idD }),
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
      }
    );
    if (results?.data?.status == 'success') {

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: " Deleted Successfully" } }))

      setPending(false);
      props?.updateListRecordDelete(idD);
    } else {
      //  alert("not deleted");
    }
  }
  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span>Users | <span className="text-[0.6em] capitalize"> {props?.formType} </span> </span>
              <Button variant="default" onClick={() => props?.setCurrentPage('list')}>Cancel</Button>

            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body >
          <hr />
          {pending && (<div className="flex items-center justify-center mb-4">
            <Spinner animation="grow" variant="warning" />
          </div>)}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.75,
            }}
            className="nav-bar"
          >

            <div className="md:min-h-[550px] relative">

              <div>
                <div className="mb-6">
                  <label for="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
                  <input type="text" onChange={handleChange} name="name" value={formValue.name} id="name" className=" focus:bg-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name of User" required />
                </div>

                <div className="mb-6">
                  <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                  <input type="email" onChange={handleChange} name="email" value={formValue.email} id="email" className=" focus:bg-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="User Login Email" required />

                </div>
                <div className="mb-6">
                  <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                  <input type="text" onChange={handleChange} id="password" name="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
                  <p className="text-gray-400 text-sm pt-2">
                    If you leave the field blank your password will not change
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 pt-4">
                <div className="mb-6">
                  <label for="deployment_role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role</label>
                  <select id="deployment_role" onChange={handleChange} name="deployment_role" value={formValue.deployment_role} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose a Role</option>
                  
                    {props?.roles?.map((record, index) => (
                      <option key={index} value={record?.id}>{record?.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label for="access_level" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Access Level</label>
                  <select id="access_level" onChange={handleChange} name="access_level" value={formValue.access_level} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected>Choose an Access Level</option>
                  
                    {props?.accessLevels?.map((record, index) => (
                      <option key={index} value={record?.level}>Level {record?.level} - ({record?.name})</option>
                    ))}
                  </select>
                </div>
                </div>
                <div>
                  {invalidFields !== "" && (<p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>)}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 ">
                  <div className="flex items-start justify-between">
                    {props.formType == "add" ?
                      <span>.</span> :
                      <a onClick={() => handleDelete(formValue?.id)} className="cursor-pointer text-red-600 hover:text-red-700">Delete</a>
                    }
                    {props.formType == "add" ? <button type="submit" onClick={handleSubmit} className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Add New</button> :
                      <button type="submit" onClick={handleUpdate} className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Save</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Card.Body>
      </Card>

    </>
  );
}

export default UserAdd;
