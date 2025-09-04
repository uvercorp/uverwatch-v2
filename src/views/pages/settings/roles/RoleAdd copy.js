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

function RoleAdd(props) {
  const [roles, setRoles] = useState([]);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [formValue, setFormValue] = useState(
    {
      id: '',
      deployment: '',
      name: '',
      description: '',
    }
  );

  useEffect(() => {
    if (props.record && props.formType == "update") {
      setFormValue(props.record);

    } else {
      setFormValue({
        id: '',
        deployment: props?.deploymentId,
        name: '',
        description: '',
      })
    }
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
        description: '',
      })

    } else {
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
    const invalidFields = []; // Array to store invalid field messages

    // Check for empty required fields
    if (!formData.name) {
      invalidFields.push('Role Name');
    }
    if (!formData.description) {
      invalidFields.push('Description');
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
    const results = await axiosInstance.post('createDeploymentRole',
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

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Role Added Successfully" } }))

      setPending(false);
      props.populateList(results?.data?.data);

    }
  }

  const updateRecordInstance = async (data) => {

    setPending(true);
    const results = await axiosInstance.post('updateDeploymentRole',
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

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Role Updated Successfully" } }))

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
    const results = await axiosInstance.post('deleteDeploymentRole',
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
      <Card className="my-gradient-bg shadow-xl  " >
        <Card.Header>
          <Card.Title as="h4">

            <div className="flex items-start justify-between">
              <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">Roles | <span className="text-[0.6em] capitalize"> {props?.formType} </span> </span>
              <button className="my-btn-cancel" onClick={() => props?.setCurrentPage('list')}>Cancel</button>

            </div>
          </Card.Title>
        </Card.Header>
        <div className="px-4">
          <hr className="border-[#2e2c2b] mt-0 mb-2 pt-0 " />
        </div>
        <Card.Body >

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

            <div className="md:min-h-[450px] relative">

              <div>
                <div className="mb-6">
                  <label for="name" className="block my-label">Name</label>
                  <input type="text" onChange={handleChange} name="name" value={formValue.name} id="name" className=" w-full my-input" placeholder="Name of Role" required />
                </div>

                <div className="mb-6">
                  <label for="description" className="block my-label">Describe the Role</label>
                  <textarea id="description" onChange={handleChange} name="description" value={formValue.description} rows="3" class="w-full my-input" placeholder="Role Description..."></textarea>

                </div>
                <div className="my-label">
                  {/* <hr /> */}
                  <p>Permissions</p>

                  <p>These options control what this type of role can make changes to. Visit our support guides to find out more.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Manage Users
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Manage Posts
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Manage Settings
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Data Import and Export
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Edit Own Post
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Manage Collections
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Delete Posts
                    </label>
                  </div>
                  <div className="flex items-start mb-4">
                    <div className="flex items-center h-5">
                      <input id="remember" type="checkbox" value="" className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                    </div>
                    <label for="remember" className="ms-2 text-sm font-medium my-label">Delete Own Post
                    </label>
                  </div>
                  </div>
                  <br/>
                  <br/>
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

export default RoleAdd;
