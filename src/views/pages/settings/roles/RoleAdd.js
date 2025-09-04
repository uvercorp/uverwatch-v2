import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import swal from 'sweetalert';
import {
  Badge,
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Tab,
  Spinner
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from '../../../../provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";

function RoleAdd(props) {
  // Define all permission fields
  const permissionFields = [
    "manage_users",
    "manage_settings",
    "manage_posts",
    "edit_own_post",
    "delete_posts",
    "delete_own_post",
    "manage_collections",
    "data_import_and_export",
    "manage_entities",
    "delete_entities",
    "delete_own_entity",
    "edit_own_entity",
    "manage_teams"
  ];

  // Initialize form with all permission fields
  const initialFormState = {
    id: '',
    deployment: props?.deploymentId || '',
    name: '',
    description: '',
    ...permissionFields.reduce((acc, field) => ({ ...acc, [field]: "no" }), {})
  };

  const [formValue, setFormValue] = useState(initialFormState);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [invalidFields, setInvalidFields] = useState('');

  useEffect(() => {
    if (props.record && props.formType === "update") {
      // Ensure all permission fields have values (convert null to "no")
      const updatedRecord = { ...props.record };
      permissionFields.forEach(field => {
        if (updatedRecord[field] === null || updatedRecord[field] === undefined) {
          updatedRecord[field] = "no";
        }
      });
      setFormValue(updatedRecord);
    } else {
      setFormValue({
        ...initialFormState,
        deployment: props?.deploymentId
      });
    }
  }, [props.record, props.formType, props.deploymentId]);

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value
    });
  }

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormValue({
      ...formValue,
      [name]: checked ? "yes" : "no"
    });
  }

  const handleSubmit = () => {
    setFormValue({
      ...formValue,
      deployment: props?.deploymentId,
    });
    if (validateFormData(formValue, setInvalidFields)) {
      addRecordInstance(formValue);
      setFormValue({
        ...initialFormState,
        deployment: props?.deploymentId,
      })
    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000)
    }
  }

  const handleUpdate = () => {
    if (validateFormData(formValue, setInvalidFields)) {
      updateRecordInstance(formValue);
    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000)
    }
  }

  function validateFormData(formData, setInvalidFields) {
    const invalidFields = [];

    if (!formData.name) {
      invalidFields.push('Role Name');
    }
    if (!formData.description) {
      invalidFields.push('Description');
    }

    if (invalidFields.length > 0) {
      const errorText = `Please fill in the following required fields: ${invalidFields.join(', ')}`;
      setInvalidFields(errorText);
      return false;
    }

    return true;
  }

  const addRecordInstance = async (data) => {
    setPending(true);
    try {
      const results = await axiosInstance.post('createDeploymentRole',
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }
      );
      if (results?.data?.status == "success") {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Role Added Successfully" } }))
        setPending(false);
        props.populateList(results?.data?.data);
      }
    } catch (error) {
      console.error("Error adding role:", error);
      setPending(false);
    }
  }

  const updateRecordInstance = async (data) => {
    setPending(true);
    try {
      const results = await axiosInstance.post('updateDeploymentRole',
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }
      );
      if (results?.data?.status == "success") {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Role Updated Successfully" } }))
        setPending(false);
        props.updateListRecord(results?.data?.data);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setPending(false);
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
        }
      });
  }

  const deleteRecord = async (idD) => {
    setPending(true);
    try {
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
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setPending(false);
    }
  }

  const renderPermissionCheckboxes = () => {
    return permissionFields.map((field, index) => {
      const label = field.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      return (
        <div key={index} className="flex items-start mb-4">
          <div className="flex items-center h-5">
            <input
              id={field}
              name={field}
              type="checkbox"
              checked={formValue[field] === "yes"}
              onChange={handleCheckboxChange}
              className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
            />
          </div>
          <label htmlFor={field} className="ms-2 text-sm font-medium my-label">
            {label}
          </label>
        </div>
      );
    });
  }

  return (
    <>
      <Card className="my-gradient-bg shadow-xl" >
        <Card.Header>
          <Card.Title as="h4">
            <div className="flex items-start justify-between">
              <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
                Roles | <span className="text-[0.6em] capitalize"> {props?.formType} </span>
              </span>
              <button className="my-btn-cancel" onClick={() => props?.setCurrentPage('list')}>Cancel</button>
            </div>
          </Card.Title>
        </Card.Header>
        <div className="px-4">
          <hr className="border-[#2e2c2b] mt-0 mb-2 pt-0" />
        </div>
        <Card.Body>
          {pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>
          )}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
            className="nav-bar"
          >
            <div className="md:min-h-[450px] relative">
              <div>
                <div className="mb-6">
                  <label htmlFor="name" className="block my-label">Name</label>
                  <input 
                    type="text" 
                    onChange={handleChange} 
                    name="name" 
                    value={formValue.name} 
                    id="name" 
                    className="w-full my-input" 
                    placeholder="Name of Role" 
                    required 
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block my-label">Describe the Role</label>
                  <textarea 
                    id="description" 
                    onChange={handleChange} 
                    name="description" 
                    value={formValue.description} 
                    rows="3" 
                    className="w-full my-input" 
                    placeholder="Role Description..."
                  ></textarea>
                </div>
                
                <div className="my-label">
                  <p>Permissions</p>
                  <p>These options control what this type of role can make changes to.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {renderPermissionCheckboxes()}
                  </div>
                  <br/>
                  <br/>
                </div>
                
                <div>
                  {invalidFields !== "" && (
                    <p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>
                  )}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className="flex items-start justify-between">
                    {props.formType === "add" ? (
                      <span>.</span>
                    ) : (
                      <a onClick={() => handleDelete(formValue?.id)} className="cursor-pointer text-red-600 hover:text-red-700">Delete</a>
                    )}
                    {props.formType === "add" ? (
                      <button 
                        type="submit" 
                        onClick={handleSubmit} 
                        className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                      >
                        Add New
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        onClick={handleUpdate} 
                        className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                      >
                        Save
                      </button>
                    )}
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