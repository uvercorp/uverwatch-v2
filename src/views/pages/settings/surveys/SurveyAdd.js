import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
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
import CsvImporter from "./CsvImporter";

function SurveyAdd(props) {
  const [surveys, setSurveys] = useState([]);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [surverFields, setSurveyFields] = useState(['title', 'description', 'latitude', 'longitude', 'formatted_address']);
  const [selectedUpdateRecord, setSelectedUpdateRecord] = useState();
  const [show, setShow] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [customFieldView, setCustomFieldView] = useState('list');
  const [formValue, setFormValue] = useState({
    id: "",
    deployment: "",
    survey_name: "",
    survey_description: "",
    priority_enabled: false,
    impact_enabled: false,
  });

  useEffect(() => {
    if (props.record && props.formType === "update") {
      setFormValue({
        ...props.record,
        priority_enabled: props.record.priority_enabled || false,
        impact_enabled: props.record.impact_enabled || false,
      });
      setCustomFields(props.record.custom_fields || []);
      props.record.custom_fields.forEach(element => {
        surverFields.push(element.field_name);
      });
    } else {
      setFormValue({
        id: "",
        deployment: props?.deploymentId,
        survey_name: "",
        survey_description: "",
        priority_enabled: false,
        impact_enabled: false,
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

  const handleCustomFieldChange = (index, field, value) => {
    const updatedCustomFields = [...customFields];
    updatedCustomFields[index][field] = value;
    setCustomFields(updatedCustomFields);
  };

  const addCustomField = (obj) => {
    // alert(obj.field_name);
    setCustomFields([
      ...customFields, obj
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
        "createDeploymentSurvey",
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
            toasterData: { type: "success", msg: "Survey Added Successfully" },
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
        "updateDeploymentSurvey",
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
            toasterData: { type: "success", msg: "Survey Updated Successfully" },
          })
        );
        setPending(false);
        props.updateListRecord(results?.data?.data);
      }
    } catch (error) {
      console.error("Error updating survey:", error);
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
        "deleteDeploymentSurvey",
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
      <Card className="my-gradient-bg shadow-xl " >
        <Card.Header>
          <Card.Title as="h4">
            <div className="flex items-start justify-between">
              <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
                Taskings: {" "}
                <span className="text-[0.6em] capitalize"> {props?.formType} </span>{" "}
              </span>
              <button className="my-btn-cancel" onClick={() => props?.setCurrentPage('list')}>Cancel</button>
            </div>
          </Card.Title>
        </Card.Header>
        <div className="px-4">
          <hr className="border-[#2e2c2b] mt-0 mb-2 pt-0 " />
        </div>
        <Card.Body className="relative h-[calc(100vh-200px)] overflow-hidden">

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
                    htmlFor="survey_name"
                    className="block mb-2 my-label"
                  >
                    Survey Name
                  </label>
                  <input
                    type="text"
                    onChange={handleChange}
                    name="survey_name"
                    value={formValue.survey_name}
                    id="survey_name"
                    className="w-full my-input"
                    placeholder="Name of Survey"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="survey_description"
                    className="block mb-2 my-label"
                  >
                    Describe the survey
                  </label>
                  <textarea
                    id="survey_description"
                    onChange={handleChange}
                    name="survey_description"
                    value={formValue.survey_description}
                    rows="3"
                    className="block p-2.5 w-full my-input"
                    placeholder="Survey Description..."
                  ></textarea>
                </div>

                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="priority_enabled"
                        name="priority_enabled"
                        checked={formValue.priority_enabled}
                        onChange={(e) => setFormValue({
                          ...formValue,
                          priority_enabled: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="priority_enabled" className="my-label">
                        Enable Priority Field
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="impact_enabled"
                        name="impact_enabled"
                        checked={formValue.impact_enabled}
                        onChange={(e) => setFormValue({
                          ...formValue,
                          impact_enabled: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="impact_enabled" className="my-label">
                        Enable Impact Field
                      </label>
                    </div>
                  </div>
                  <small className="text-gray-400 text-sm mt-2 block">
                    When enabled, users can set priority and impact levels when creating posts.
                    When disabled, lowest priority and impact are automatically assigned.
                  </small>
                </div>
                <div>
                  <div className="flex items-start justify-between my-label">
                    <span >Fields </span>
                    <button
                      className="nav-link border flex items-start justify-between gap-1 bg-gray-400 hover:bg-gray-500 hover:border-red-500"
                      style={{ border: "2px solid red" }}
                      variant="default"
                      onClick={() => { setCustomFieldView('list'); setShow(true); }}
                    >
                      <span className="text-black mr-2">Add Field</span>
                      <i className="nc-icon nc-simple-add text-black" />
                    </button>
                  </div>
                  <hr />

                  <div className="grid grid-cols-1">
                    <div className="bg-gray-300 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <i className="nc-icon nc-grid-45" />
                        <div className="p-0">Title</div>
                      </div>
                      <div>
                        {/* <CiEdit className="h-5 w-5 cursor-pointer" /> */}
                      </div>
                    </div>

                    <div className="bg-gray-300 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
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
                      <div key={index} className="bg-gray-300 p-2  px-4 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black flex items-start justify-between">
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
            className="absolute bottom-0 left-0 right-0 my-gradient-bg p-4 shadow-lg z-50"
          >
            <div className="flex items-start justify-between">
              {props.formType === "add" ? (
                <span>.</span>
              ) : (
                <div>
                  <a
                    onClick={() => handleDelete(formValue?.id)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    Delete
                  </a>
                  <a
                    onClick={() => setShowCsv(true)}
                    className="cursor-pointer text-green-600 hover:text-green-700 ml-3"
                  >
                    Csv Importer
                  </a>

                </div>
              )}

              {props.formType === "add" ? (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium  text-sm w-full sm:w-auto px-5 py-2.5 text-center "
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
          <CustomModal show={show} setShow={setShow} addCustomField={addCustomField} customFieldView={customFieldView} handleCustomFieldChange={handleCustomFieldChange} setCustomFieldView={setCustomFieldView} selectedUpdateRecord={selectedUpdateRecord} />
          <AnimatePresence>
            {showCsv && (
              <motion.div
                className="fixed inset-0 my-gradient-bg bg-opacity-50 z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              // onClick={() => setShowCsv(false)}
              >
                {/* Modal Container */}
                <motion.div
                  className="my-gradient-bg shadow-lg p-4 overflow-y-auto  max-h-[90vh] mx-auto mt-4
                         w-[90%] sm:w-[80%] lg:w-[75%] xl:w-[60%] 2xl:w-[70%]"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ border: "1px solid #2e2c2b" }}
                >
                  {/* Modal Header */}


                  <CsvImporter surveyFields={surverFields} survey={props?.record} setShowCsv={setShowCsv} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card.Body>
      </Card>
    </>
  );
}

export default SurveyAdd;