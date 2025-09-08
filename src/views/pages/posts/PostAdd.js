import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHistory, useParams } from "react-router-dom";
import swal from "sweetalert";
import {
  Card,
  Row,
  Col,
  Tab,
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import { toggleToaster, selectToasterData, selectToasterStatus } from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "services/axios";
import Spinner from "react-bootstrap/Spinner";
import MapPositionSelect from "./MapPositionSelect";
import { IconPicker } from "others/icons/IconPicker";
import TagInput from "./TagInput";
import useGeoLocation from "hooks/useGeoLocation";


function PostAdd(props) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
      const [accessLevel, setAccessLevel] = useState([]);
      const [impactLevel, setImpactLevel] = useState([]);
      const [priorityLevel, setPriorityLevel] = useState([]);
      const [statuses, setStatus] = useState([]);
      const [tagsList, setTagsList] = useState([]);
       const [setupComplete, setSetupComplete] = useState(false);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  const history = useHistory();
  const { surveyId, postId } = useParams();
  const location = useLocation();
  const [deploymentId, setDeploymentId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [customFiledsForUpdate, setCustomFieldForUpdate] = useState(null);
  const geoLocation = useGeoLocation();
  const [record, setRecord] = useState({});
  const [report, setReport] = useState({});
  const [formType, setFormType] = useState(location.pathname.includes('/edit/') ? 'update' : 'add');

  const [formValue, setFormValue] = useState({
    id: "",
    deployment: "",
    title: "",
    description: "",
    latitude: geoLocation.latitude,
    longitude: geoLocation.longitude,
    icon: "",
    color: "",
    tags: "",
    assessment: "",
    access_level: "",
    impact_level: "",
    priority_level: "",
    post_status: "",
    full_address: '',
      formatted_address: '',
    deployment_survey: surveyId || "",
    survey_fields: report?.custom_fields || record?.custom_fields || [], // Ensure survey_fields is always an array
    deployment_sub_category: null,
    user_type: userId ?? "member",
    deployment_user: userId ?? "",
  });

  const [customFieldValues, setCustomFieldValues] = useState({});

  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {
      setDeploymentId(JSON.parse(deployment).id);
      setFormValue(prev => ({ ...prev, deployment: JSON.parse(deployment).id }));
    } else {
      window.location.replace('/pages/login');
    }

    let user = localStorage.getItem('currentUser');
    if (user && user !== undefined) {
      setUserId(JSON.parse(user).id);
      setFormValue(prev => ({ ...prev, deployment_user: JSON.parse(user).id }));
    }

    getSurvey(surveyId);
    if (formType === 'add' && surveyId) {
    } else if (formType === 'update' && postId) {
      getPostData(postId);
    }
  }, [surveyId, postId, formType]);

  // Update formValue when userId changes
  useEffect(() => {
    if (userId) {
      setFormValue(prev => ({ ...prev, deployment_user: userId }));
    }
  }, [userId]);

  useEffect(() => {
    if (deploymentId) {
      getCategoryData(deploymentId);
    }
  }, [deploymentId]);

  // Update form values when geolocation changes
  useEffect(() => {
    if (geoLocation.latitude !== 0 && geoLocation.longitude !== 0) {
      setFormValue(prev => ({
        ...prev,
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
      }));
    }
  }, [geoLocation]);

  const handleIconSelection = ({ iconClass, color }) => {

    setFormValue({
      ...formValue,
      icon: iconClass,
      color: color,
    });
    console.log(formValue)
  };

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value,
    });
  };
  const handleLocationChange = (lat, long,fullAddress,formattedAddress) => {
    setFormValue({
      ...formValue,
      longitude: long,
      latitude: lat,
      full_address: fullAddress,
      formatted_address: formattedAddress,
    });
  }

  // const handleCustomFieldChange = (fieldName, value) => {
  //   setCustomFieldValues({
  //     ...customFieldValues,
  //     [fieldName]: value,
  //   });
  // };

  const handleCustomFieldChange = (fieldName, value,type='') => {
    if (value instanceof File) {
      // Handle image file upload
      setCustomFieldValues({
        ...customFieldValues,
        [fieldName]: value,
      });
    } else {
      // Handle other field types
      setCustomFieldValues({
        ...customFieldValues,
        [fieldName]: value,
      });
    }
  };


  const handleSubmit = async () => {
    const formData = new FormData();

    // Append regular form data
    Object.entries(formValue).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Ensure deployment id is always included
    if (deploymentId) {
      formData.set('deployment', deploymentId);
      formData.set('deployment_user', userId);
    }

    // Append custom field values
    Object.entries(customFieldValues).forEach(([fieldName, fieldValue]) => {
      if (fieldValue instanceof File) {
        // Append image file
        formData.append(`custom_field_values[${fieldName}]`, fieldValue);
      } else {
        // Append other field values
        formData.append(`custom_field_values[${fieldName}]`, fieldValue);
      }
    });

    // Log FormData to verify its contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (validateformData(formValue, setInvalidFields)) {

      addRecordInstance(formData);

    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    // Append regular form data
    Object.entries(formValue).forEach(([key, value]) => {
      formData.append(key, value);
    });
    // Ensure deployment id is always included
    if (deploymentId) {
      formData.set('deployment', deploymentId);
    }

    // Append custom field values
    Object.entries(customFieldValues).forEach(([fieldName, fieldValue]) => {
      if (fieldValue instanceof File) {
        // Append image file
        formData.append(`custom_field_values[${fieldName}]`, fieldValue);
      } else {
        // Append other field values
        formData.append(`custom_field_values[${fieldName}]`, fieldValue);
      }
    });

    if (validateformData(formValue, setInvalidFields)) {
      updateRecordInstance(formData);
    } else {
      setTimeout(() => {
        setInvalidFields("");
      }, 5000);
    }
  };

  const handleUpdate1 = () => {
    const data = {
      ...formValue,
      custom_field_values: customFieldValues,
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
    const invalidFields = [];
    if (!formData.title) invalidFields.push("Title");
    if (!formData.description) invalidFields.push("Description");
    if (!formData.latitude) {
      invalidFields.push('Latitude');
    }
    if (!formData.longitude) {
      invalidFields.push('Longitude');
    }
    if (!formData.tags) {
      invalidFields.push('Tags');
    }
    if (!formData.access_level) {
      invalidFields.push("Access Level");
    }
    if (record?.priority_enabled && !formData.priority_level) {
      invalidFields.push("Priority Level");
    }
    if (record?.impact_enabled && !formData.impact_level) {
      invalidFields.push("Impact Level");
    }

    if (!formData.post_status) {
      invalidFields.push("Status");
    }
    if (categories.length > 0 && !formData.deployment_sub_category) {
      invalidFields.push("Category");
    }

    if (invalidFields.length > 0) {
      const errorText = `Please fill in the following required fields: ${invalidFields.join(", ")}`;
      setInvalidFields(errorText);
      return false;
    }
    return true;
  }

  const addRecordInstance = async (data) => {

    setPending(true);
    try {
      const results = await axiosInstance.post(
        "addPostCustom",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: "Post Added Successfully" },
          })
        );
        setPending(false);
        history.push("/deployment/data_view");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      setPending(false);
    }
  };

  const updateRecordInstance = async (data) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "updatePostCustom",
        data,
        {
          headers: {
           "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: "Post Updated Successfully" },
          })
        );
        setPending(false);
        history.push("/deployment/data_view");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setPending(false);
    }
  };
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');

    if (deployment && deployment !== undefined) {

    } else {

      window.location.replace('/pages/login');
    }
    if (deployment && deployment !== undefined) {
      getCategoryData(JSON.parse(deployment).id);
      setDeploymentId(JSON.parse(deployment).id);
    }

  }, []);
  const getCategoryData = async (deployment_id) => {
         setPending(true);
         try {
             const response = await axiosInstance.get('getPostLookups/' + deployment_id,
                 {
                     headers: {
                         'Content-Type': 'application/json',
                         "Authorization": `Bearer ${localStorage.getItem('access')}`
                     },
                     //   withCredentials: true
                 }
             );

             setPending(false);
             if (response?.data) {
                 let dData = response?.data?.post_lookups;
                 setCategories(dData?.categories);
                 setImpactLevel(dData?.impact_levels);
                 setAccessLevel(dData?.access_levels);
                 setPriorityLevel(dData?.priority_levels);
                 setStatus(dData?.statuses);
                 setTagsList(dData?.tags || []); // Add this line

                 if ((dData?.categories?.length == 0) || (record?.priority_enabled && dData?.priority_levels?.length == 0) || (dData?.access_levels?.length == 0) || (record?.impact_enabled && dData?.impact_levels?.length == 0) || dData?.tags?.length == 0 || (dData?.statuses?.length == 0)) {
                  // alert('not completed')
                  setSetupComplete(false)
              } else {
                  setSetupComplete(true);
              }
                 // console.log(dData);

             }
         } catch (err) {
             setPending(false);


         }



     }

  const getSurvey = async (survey_id) => {
    // alert('am here getsurvey')
    // setPending(true);
    try {
      const response = await axiosInstance.get('getSurvey/' + survey_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
          //   withCredentials: true
        }
      );
      // console.log(response)

      // console.log(JSON.stringify(response?.data));
      setPending(false);
      if (response?.data) {
        let dData = response?.data?.surveys;
        // dData.unshift({id:0,survey_name:'Basic Post',survey_description:'desc'})
        // setSurveys(dData);
        console.log('survey id' + survey_id + ": data retrieved");
        console.log(dData[0]);

        // Set the record with survey data
        setRecord(dData[0]);

        let CustFields = dData[0].custom_fields;
        setCustomFieldForUpdate(CustFields);
        setFormValue(prev => ({
          ...prev,
          survey_fields: CustFields || [], // Ensure survey_fields is defined
          deployment_survey: survey_id,
        }));
        // Initialize custom field values if updating
        const initialValues = {};
        // console.log('props.record?.post_values');
        // console.log(props.record?.post_values);
        dData[0]?.post_values?.forEach((field) => {
          initialValues[field.field_name] = field.field_value || "";
        });
        setCustomFieldValues(initialValues);

      }
    } catch (err) {
      setPending(false);

    }

  }

  const getPostData = async (post_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get('getPost/' + post_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
        }
      );
      setPending(false);
      if (response?.data) {
        let postData = response?.data?.post;
        console.log('post id' + post_id + ": data retrieved");
        console.log(postData);

        // Set the record with post data
        setReport(postData);

        // Set form values with existing post data
        if(postData?.custom_fields?.length) {
          setFormValue({
            ...postData,
            survey_fields: postData.custom_fields || [],
          });
        }

        // Get survey data for this post
        if (postData.deployment_survey) {
          getSurvey(postData.deployment_survey);
        }

        // Initialize custom field values with existing data
        const initialValues = {};
        postData?.post_values?.forEach((field) => {
          initialValues[field.field_name] = field.field_value || "";
        });
        setCustomFieldValues(initialValues);
      }
    } catch (err) {
      setPending(false);
      console.error("Error fetching post data:", err);
    }
  }

  const renderCustomFields = () => {
    if (!formValue.survey_fields || formValue.survey_fields.length === 0) {
      return null; // Return nothing if survey_fields is undefined or empty
    }

    return formValue.survey_fields.map((field, index) => {
      const optionsArray = field.options ? JSON.parse(field.options) : [];
      switch (field.field_type) {
        case "text":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <input
                type="text"
                value={customFieldValues[field.field_name] || ""}
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value,field.field_type)}
                className="my-input block w-full p-2.5 "
                placeholder={field.field_name}
                required={field.required}
              />
            </div>
          );
        case "text_area":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <textarea
                type="text"
                value={customFieldValues[field.field_name] || ""}
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value,field.field_type)}
                className=" my-input block w-full p-2.5"
                placeholder={field.field_name}
                required={field.required}
                rows="2"
              ></textarea>
            </div>
          );
        case "number":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <input
                type="number"
                value={customFieldValues[field.field_name] || ""}
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value,field.field_type)}
                className=" my-input block w-full p-2.5 "
                placeholder={field.field_name}
                required={field.required}
              />
            </div>
          );
        case "enum":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <select
                value={customFieldValues[field.field_name] || ""}
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value,field.field_type)}
                className="  block w-full p-2.5 my-input"
                required={field.required}
              >
                <option value="">Select {field.field_name}</option>
                {optionsArray.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        case "date":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <input
                type="date"
                value={customFieldValues[field.field_name] || ""}
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value,field.field_type)}
                className="  block w-full p-2.5 my-input"
                required={field.required}
              />
            </div>
          );
        case "image":
          return (
            <div key={index} className="mb-6">
              <label htmlFor={field.field_name} className="block mb-2 text-sm font-medium my-label">
                {field.field_name}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCustomFieldChange(field.field_name, e.target.files[0],field.field_type)}
                className=" block w-full p-2.5 my-input"
                required={field.required}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="min-h-lvh flex items-start justify-center">
      <div className={formType === "add" ? "md:min-w-[80%] md:min-h-[80%]" : "md:min-w-[100%]"}>
        <Card className="my-gradient-bg">
          <Card.Header>
            <Card.Title as="h4">
              <div className="flex items-start justify-between my-sidebar-link">
                <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
                  Post : <span className="text-[0.6em] capitalize"> {formType} </span>{" "}
                  <span className="text-[0.6em] capitalize font-bold">{record?.survey_name}</span>
                </span>
              </div>
            </Card.Title>
          </Card.Header>
          <div className="px-4">
          <hr className="border-[#2e2c2b] mt-0 mb-2 pt-0 " />
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
              <div className="md:min-h-[450px] relative md:px-10">
                <div>
                  <Row>
                    <Col className="pr-1" md="12">
                    <label className="my-label">Location : <span className="itali">{formValue?.full_address}</span></label>
                      <div className="min-h-[250px] text-center bg-blue-100 border border-1 mr-2">

                        <MapPositionSelect mapHeight={'250px'} onLocationChange={handleLocationChange} latitude={formValue?.latitude} longitude={formValue?.longitude} />
                      </div>
                    </Col>
                  </Row>
                  <div className="grid gap-6 mb-6 md:grid-cols-2 pt-4">
                    <div>
                      <label htmlFor="latitude" className="block mb-2 text-sm font-medium my-label">Latitude</label>
                      <input type="text" id="latitude" name="latitude" onChange={handleChange} disabled value={formValue.latitude} className="my-input block p-2.5 w-full " placeholder="" required />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block mb-2 text-sm font-medium my-label">Longitude</label>
                      <input type="text" id="longitude" name="longitude" onChange={handleChange} disabled value={formValue.longitude} className="my-input block p-2.5 w-full " placeholder="" required />
                    </div>
                  </div>
                  <div className="grid gap-6 mb-6 md:grid-cols-2 pt-4">
                    <div className="mb-6">
                      <label
                        htmlFor="survey_description"
                        className="block mb-2 text-sm font-medium my-label"
                      >
                        Pick An Icon And Color
                      </label>
                      <IconPicker onSelection={handleIconSelection}
                        initialIconClass={formValue.icon}
                        initialColor={formValue.color}
                      />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="title" className="block mb-2 text-sm font-medium my-label">
                        Title
                      </label>
                      <input
                        type="text"
                        onChange={handleChange}
                        name="title"
                        value={formValue.title}
                        id="title"
                        className="my-input block p-2.5 w-full "
                        placeholder="Title of post"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="description" className="block mb-2 text-sm font-medium my-label">
                      Describe the post
                    </label>
                    <textarea
                      id="description"
                      onChange={handleChange}
                      name="description"
                      value={formValue.description}
                      rows="3"
                      className="my-input block p-2.5 w-full "
                      placeholder="Post Description..."
                    ></textarea>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="deployment_sub_category" className="block mb-2 text-sm font-medium my-label">Category</label>

                    <select style={{ width: "100%" }} className="my-input  min-h-[2.5em] " value={formValue.deployment_sub_category} required onChange={handleChange} name="deployment_sub_category">
                      <option>Select Category</option>
                      {categories?.map((record, index) => (
                        <option key={index} value={record?.id}>{record?.name}</option>
                      ))}

                    </select>
                  </div>
                  {/* <div className="mb-6">
                    <label htmlFor="tags" className="block mb-2 text-sm font-medium my-label">
                      Tags (comma seperated tags)
                    </label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="tags"
                      value={formValue.tags}
                      id="title"
                      className="my-input block p-2.5 w-full "
                      placeholder="Tags eg: tag1,tag2,tag3"
                      required
                    />
                  </div> */}
                  <div className="mb-6">
                      <label
                          htmlFor="tags"
                          className="block mb-2 text-sm font-medium my-label"
                        >
                          Tags (comma seperated tags) {formValue.tags}
                        </label>

  <TagInput
    initialTags={formValue?.tags}
    onTagsChange={(tags) => setFormValue({...formValue, tags})}
    allTags={tagsList}
  />
</div>
                  <div className="mb-6">
                    <label htmlFor="assessment" className="block mb-2 text-sm font-medium my-label">
                      Assessment (text to help with understanding )
                    </label>
                    <input
                      type="text"
                      onChange={handleChange}
                      name="assessment"
                      value={formValue.assessment}
                      id="title"
                      className="my-input block p-2.5 w-full "
                      placeholder="Write Assessment"
                      required
                    />
                  </div>
                  {/* Render custom fields */}
                  {renderCustomFields()}
                  <div className="grid gap-6 md:grid-cols-2 ">
                                            <div className="mb-6">
                                                <label htmlFor="access_level" className="block mb-2 text-sm font-medium my-label">Access Level</label>

                                                <select style={{ width: "100%" }} className="my-input  min-h-[2.5em] " value={formValue.access_level} required onChange={handleChange} name="access_level">
                                                    <option>Select Access Level</option>
                                                    {accessLevel?.map((record, index) => (
                                                        <option key={index} value={record?.level}>{record?.name} level[{record?.level}] </option>
                                                    ))}

                                                </select>
                                            </div>
                                            {record?.impact_enabled && (
                                              <div className="mb-6">
                                                <label htmlFor="impact_level" className="block mb-2 text-sm font-medium my-label">Impact Level</label>

                                                <select style={{ width: "100%" }} className="my-input  min-h-[2.5em] " value={formValue.impact_level} required onChange={handleChange} name="impact_level">
                                                  <option>Select Impact Level</option>
                                                  {impactLevel?.map((record, index) => (
                                                    <option key={index} value={record?.level}>{record?.name} level[{record?.level}]</option>
                                                  ))}

                                                </select>
                                              </div>
                                            )}
                                            {record?.priority_enabled && (
                                              <div className="mb-6">
                                                <label htmlFor="priority_level" className="block mb-2 text-sm font-medium my-label">Priority Level</label>

                                                <select style={{ width: "100%" }} className="my-input  min-h-[2.5em] " value={formValue.priority_level} required onChange={handleChange} name="priority_level">
                                                  <option>Select Priority Level</option>
                                                  {priorityLevel?.map((record, index) => (
                                                    <option key={index} value={record?.level}>{record?.name} level[{record?.level}]</option>
                                                  ))}

                                                </select>
                                              </div>
                                            )}
                                            <div className="mb-6">
                                              <label htmlFor="status" className="block mb-2 text-sm font-medium my-label">Post Status</label>

                                              <select style={{ width: "100%" }} className="my-input  min-h-[2.5em] " value={formValue.post_status} required onChange={handleChange} name="post_status">
                                                <option>Select Status Level</option>
                                                {statuses?.map((record, index) => (
                                                  <option key={index} value={record?.id}>{record?.name} </option>
                                                ))}

                                              </select>
                                            </div>
                                          </div>
                  {invalidFields !== "" && (
                    <p className="bg-red-700 shadow text-left p-2  text-white">{invalidFields}</p>
                  )}
 {!setupComplete ? <>
                                            <div className="md:flex items-center justify-center">
                                                <div className="bg-white  font-semibold text-[1.2em] text-red-500">Please You need to Finish Setup at Settings Before You Can Add A post; Especialy Category, Access Level, Impact Level, Priority Level, Tags </div>
                                            </div>
                                        </> : <>
                  <div className="p-2">
                    <div className="flex items-start justify-between">
                      <span>.</span>
                      <div className="flex items-end gap-2">
                        {!postId ? (
                          <>
                            <button
                              type="submit"

                              onClick={() => props?.setCurrentPage("list")}
                              className="text-black bg-gray-200 hover:bg-gray-100 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              onClick={handleSubmit}
                              disabled={pending}
                              className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                              {pending ? "Submitting..." : "Submit"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="submit"
                              disabled={pending}
                              onClick={() => props.setShow(false)}
                              className="text-black bg-gray-200 hover:bg-gray-100 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              onClick={handleUpdate}
                              disabled={pending}
                              className="text-white bg-green-500 hover:bg-green-600 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                            >
                              {pending ? "Saving..." : "Save Changes"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  </>}
                </div>
              </div>
            </motion.div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default PostAdd;