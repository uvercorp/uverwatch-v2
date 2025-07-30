import React, { useState, useEffect } from "react";
import { color, motion } from "framer-motion";
import swal from "sweetalert";
import { CiEdit } from "react-icons/ci";
import {
  Badge,
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Tab,
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from '../../../../provider/features/helperSlice';
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "others/icons/LoadingIcon";
import axiosInstance from "services/axios";
import Spinner from "react-bootstrap/Spinner";
import CustomModal from "./custom_input/CustomModal";
import { IconPicker } from "others/icons/IconPicker";

function EntitySurveyAdd(props) {
  const [surveys, setSurveys] = useState([]);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [selectedUpdateRecord, setSelectedUpdateRecord] = useState();
  const [show, setShow] = useState(false);
  const [customFieldView, setCustomFieldView] = useState('list');
  const [formValue, setFormValue] = useState({
    id: "",
    deployment: "",
    survey_name: "",
    survey_description: "",
    icon: "",
    color: "",
  });

  useEffect(() => {
    if (props.record && props.formType === "update") {
      setFormValue(props.record);
      setCustomFields(props.record.custom_fields || []);
    } else {
      setFormValue({
        id: "",
        deployment: props?.deploymentId,
        survey_name: "",
        survey_description: "",
        icon: "",
        color: "",
      });
      setCustomFields([]);
    }
  }, [props.record, props.formType, props.deploymentId]);

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value,
    });
  };

  const handleIconSelection = ({iconClass,color}) => {
    
    setFormValue({
      ...formValue,
      icon: iconClass,
      color: color,
    });
    
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...customFields];
    updatedCustomFields[index][field] = value;
    setCustomFields(updatedCustomFields);
  };

  const addCustomField = (obj) => {
    // alert(obj.field_name);
    setCustomFields([
      ...customFields,obj
    //   {
    //     field_name: "",
    //     field_type: "text",
    //     field_value: null,
    //     required: true,
    //     has_options: false,
    //     options: [],
    //   },
//     { field_name: "Is Minor", field_type: "enum",field_value: null,required:true, has_options:true,options:['true','false','single']},
//     { field_name: "Marital Status", field_type: "enum",field_value: null,required:true, has_options:true,options:['maried','devorced','single']},
// { field_name: "Date of Birth", field_type: "date", field_value: null ,required:true, has_options:false,options:[] },

    ]);
    setShow(false);
  };

  const handleSubmit = () => {
    const data = {
      ...formValue,
      custom_fields: customFields,
    };
    if (validateformData(data, setInvalidFields)) {
      addRecordInstance(data);
      setFormValue({
        survey_name: "",
        deployment: props?.deploymentId,
        survey_description: "",
      });
      setCustomFields([]);
    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000);
    }
  };

  const handleUpdate = () => {
    const data = {
      ...formValue,
      custom_fields: customFields,
    };
    if (validateformData(data, setInvalidFields)) {
      updateRecordInstance(data);
    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000);
    }
  };

  const [invalidFields, setInvalidFields] = useState("");
  function validateformData(formData, setInvalidFields) {
    const invalidFields = []; // Array to store invalid field messages

    // Check for empty required fields
    if (!formData.survey_name) {
      invalidFields.push("Survey Name");
    }
    if (!formData.survey_description) {
      invalidFields.push("Description");
    }

    if (invalidFields.length > 0) {
      const errorText = `Please fill in the following required fields: ${invalidFields.join(", ")}`;
      setInvalidFields(errorText); // Update state with comma-separated error message
      return false; // Invalid data
    }

    return true; // Valid data
  }

  const addRecordInstance = async (data) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "createDeploymentEntitySurvey",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: "Entity Layer Added Successfully" },
          })
        );
        setPending(false);
        props.populateList(results?.data?.data);
      }
    } catch (error) {
      console.error("Error adding survey:", error);
      setPending(false);
    }
  };

  const updateRecordInstance = async (data) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "updateDeploymentEntitySurvey",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: "Entity Layer Updated Successfully" },
          })
        );
        setPending(false);
        props.updateListRecord(results?.data?.data);
      }
    } catch (error) {
      console.error("Error updating Entity Layer:", error);
      setPending(false);
    }
  };

  const handleDelete = (val) => {
    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteRecord(val);
      }
    });
  };

  const deleteRecord = async (idD) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "deleteDeploymentEntitySurvey",
        JSON.stringify({ id: idD }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: "Deleted Successfully" },
          })
        );
        setPending(false);
        props?.updateListRecordDelete(idD);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title as="h4">
            <div className="flex items-start justify-between">
              <span>
                Entity Layer |{" "}
                <span className="text-[0.6em] capitalize"> {props?.formType} </span>{" "}
              </span>
              <Button variant="default" onClick={() => props?.setCurrentPage("list")}>
                Cancel
              </Button>
            </div>
          </Card.Title>
        </Card.Header>
        <Card.Body className="relative h-[calc(100vh-200px)] overflow-hidden">
          <hr />
          {pending && (
            <div className="flex items-center justify-center mb-4">
              <Spinner animation="grow" variant="warning" />
            </div>
          )}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
            className="nav-bar h-full"
          >
            <div className="relative h-full">
              {/* general_form with scrolling */}
              <div id="general_form" className="h-[calc(100%-80px)] overflow-y-auto pb-20 scrollbar scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400 pr-2">
              <div className="mb-6">
                  <label
                    htmlFor="survey_description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Pick An Icon And Color
                  </label>
                  <IconPicker onSelection={handleIconSelection} />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="survey_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                     Name
                  </label>
                  <input
                    type="text"
                    onChange={handleChange}
                    name="survey_name"
                    value={formValue.survey_name}
                    id="survey_name"
                    className="focus:bg-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Name "
                    required
                  />
                   
                    
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="survey_description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Describe the Layer
                  </label>
                  <textarea
                    id="survey_description"
                    onChange={handleChange}
                    name="survey_description"
                    value={formValue.survey_description}
                    rows="3"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300  dark:bg-gray-700 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white  focus:bg-white"
                    placeholder="Survey Description..."
                  ></textarea>
                </div>
                
                <div>
                  <div className="flex items-start justify-between">
                    <span>Fields </span>
                    <Button
                      className="nav-link border flex items-start justify-between gap-1 hover:bg-gray-400 hover:border-red-500"
                      style={{ border: "2px solid red" }}
                      variant="default"
                      onClick={() => {setCustomFieldView('list'); setShow(true);}}
                    >
                      <span className="text-black mr-2">Add Field</span>
                      <i className="nc-icon nc-simple-add text-black" />
                    </Button>
                  </div>
                  <hr />

                  <div className="grid grid-cols-1">
                    <div className="bg-gray-100 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <i className="nc-icon nc-grid-45" />
                        <div className="p-0">Name</div>
                      </div>
                      <div>
                        {/* <CiEdit className="h-5 w-5 cursor-pointer" /> */}
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <i className="nc-icon nc-grid-45" />
                        <div className="p-0">Description</div>
                      </div>
                      <div>
                        {/* <CiEdit className="h-5 w-5 cursor-pointer" /> */}
                      </div>
                    </div>
                    <hr />
                    {customFields?.map((record, index) => (
                      <div key={index} className="bg-gray-100 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <i className="nc-icon nc-grid-45" />
                          <div className="p-0 font-bold">{record.field_name}</div>
                        </div>
                        {/* <div onClick={() => {setSelectedUpdateRecord(record);setCustomFieldView('update'); setShow(true);}}>
                          <CiEdit className="h-5 w-5 cursor-pointer" />
                        </div> */}
                      </div>
                    ))}
                  </div>
                  <hr />
                </div>
                <div>
                  {invalidFields !== "" && (
                    <p className="bg-red-700 shadow text-left p-3 rounded-xl text-white">
                      {invalidFields}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          {/* action_buttons fixed at the bottom of the Card.Body */}
          <div
            id="action_buttons"
            className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50"
          >
            <div className="flex items-start justify-between">
              {props.formType === "add" ? (
                <span>.</span>
              ) : (
                <a
                  onClick={() => handleDelete(formValue?.id)}
                  className="cursor-pointer text-red-600 hover:text-red-700"
                >
                  Delete
                </a>
              )}
              {props.formType === "add" ? (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
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
          <CustomModal show={show} setShow={setShow} addCustomField={addCustomField} customFieldView={customFieldView} setCustomFieldView={setCustomFieldView} selectedUpdateRecord={selectedUpdateRecord}/>
        </Card.Body>
      </Card>
    </>
  );
}

export default EntitySurveyAdd;