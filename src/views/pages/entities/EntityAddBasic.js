
import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
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
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import MapTest from "views/Maptest";
import LocationSelectMap from "../settings/general/LocationSelectMap";
import MapPositionSelectEntity from "./MapPositionSelectEntity";
import { IconPicker } from "others/icons/IconPicker";

function EntityAddBasic(props) {
    const [surveys, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accessLevel, setAccessLevel] = useState([]);
    const [impactLevel, setImpactLevel] = useState([]);
    const [priorityLevel, setPriorityLevel] = useState([]);
    const [statuses, setStatus] = useState([]);
    const [tagsList, setTagsList] = useState([]);
    const dispatch = useDispatch();
    const [pending, setPending] = useState(false);
    let navigate = useHistory();
    const [deploymentId, setDeploymentId] = useState(null);
    const [formValue, setFormValue] = useState(
        {
            id: '',
            deployment: props?.deploymentId,
            title: '',
            description: '',
            latitude: '',
            longitude: '',
            deployment_survey: props?.record.id,
            entity_type: '',
            icon: "",
            color: "",
            assessment: "",
            access_level: "",
            impact_level: "",
            priority_level: "",
            post_status: "",
            full_address: '',
      formatted_address: '',
            user_type: props?.userId == null ? 'anonymous' : 'member',
            deployment_user: props?.userId,
        }
    );

    useEffect(() => {

        if (props.record && props.formType == "update") {
            setFormValue(props.record);

        } else {
            setFormValue({
                id: '',
                deployment: props?.deploymentId,
                title: '',
                latitude: '',
                longitude: '',
                deployment_survey: props?.record.id,
                entity_type: '',
                icon: "",
                color: "",
                assessment: "",
                access_level: "",
                impact_level: "",
                priority_level: "",
                post_status: "",
                full_address: '',
      formatted_address: '',
                user_type: props?.userId == null ? 'anonymous' : 'member',
                deployment_user: props?.userId,
            })
        }
    }, [props.record, props.formType]);

    const handleChange = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value
        });
    }

    const handleIconSelection = ({ iconClass, color }) => {

        setFormValue({
            ...formValue,
            icon: iconClass,
            color: color,
        });
        console.log(formValue)
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


    const handleSubmit = () => {
        setFormValue({
            ...formValue,
            deployment: props?.deploymentId,
        });
        if (validateformData(formValue, setInvalidFields)) {

            addRecordInstance(formValue);


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
        if (!formData.title) {
            invalidFields.push('Name');
        }
        if (!formData.description) {
            invalidFields.push('Description');
        }
        if (!formData.latitude) {
            invalidFields.push('Latitude');
        }
        if (!formData.longitude) {
            invalidFields.push('Longitude');
        }

        if (categories.length > 0) {
            if (!formData.entity_type) {
                invalidFields.push('Entity Type');
            }

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
        const results = await axiosInstance.post('addEntityBasic',
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

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Entity Added Successfully" } }))

            setPending(false);
            props.populateList(results?.data?.data);
            navigate.push('/deployment/data_view');

        }
    }

    const updateRecordInstance = async (data) => {

        setPending(true);
        const results = await axiosInstance.post('updateEntityBasic',
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

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Entity Updated Successfully" } }))

            setPending(false);
            props.setShow(false)
            window.location.replace('/deployment/data_view');
            // props.updateListRecord(results?.data?.data);

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
        const results = await axiosInstance.post('deleteDeploymentEntity',
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
            const response = await axiosInstance.get('getEntityLookups/' + deployment_id,
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
                let dData = response?.data?.deployment_data;
                setCategories(dData?.categories);
                setImpactLevel(dData?.impact_levels);
                setAccessLevel(dData?.access_levels);
                setPriorityLevel(dData?.priority_levels);
                setStatus(dData?.statuses);
                setTagsList(dData?.tags || []); // Add this line
                // console.log(dData);

            }
        } catch (err) {
            setPending(false);


        }



    }

    return (
        <>
            <div className="my-gradient-bg min-h-lvh flex items-start justify-center">

                <div className={props?.formType == 'add' ? 'md:min-w-[80%] md:min-h-[80%]' : 'md:min-w-[80%]'}>
                    <Card className="my-gradient-bg">
                        <Card.Header>
                            <Card.Title as="h4">

                                <div className="flex items-start justify-between">
                                    <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]" >Entity : <span className="text-[0.6em] capitalize"> {props?.formType} </span> <span className="text-[0.6em] capitalize font-bold">{props?.record.survey_name}</span></span>
                                    {/* <Button variant="default" onClick={() => props?.setCurrentPage('list')}>Cancel</Button> */}

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

                            >

                                <div className="my-gradient-bg md:min-h-[450px] relative md:px-10">

                                    <div>
                                        <Row>
                                            <Col className="pr-1" md="12">
                                            <label className="my-label">Location : <span className="itali">{formValue?.full_address}</span></label>
                                                <div className="min-h-[250px] text-center bg-blue-100 border border-1 mr-2">

                                                    <MapPositionSelectEntity mapHeight={'250px'} onLocationChange={handleLocationChange} latitude={formValue?.latitude} longitude={formValue?.longitude} />
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="grid gap-6 mb-6 md:grid-cols-2 pt-4">
                                            <div>
                                                <label htmlFor="latitude" className="block mb-2 text-sm font-medium my-label">Latitude</label>
                                                <input type="text" id="latitude" name="latitude" onChange={handleChange} disabled value={formValue.latitude} className="my-input block w-full" placeholder="" required />
                                            </div>
                                            <div>
                                                <label htmlFor="longitude" className="block mb-2 text-sm font-medium my-label">Longitude</label>
                                                <input type="text" id="longitude" name="longitude" onChange={handleChange} disabled value={formValue.longitude} className="my-input block w-full" placeholder="" required />
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
                                                <label htmlFor="entity_type" className="block mb-2 text-sm font-medium my-label">Entity Type  : {categories?.length}</label>

                                                <select style={{ width: "100%" }} className="border my-input  min-h-[2.5em]" value={formValue.entity_type} required onChange={handleChange} name="entity_type">
                                                    <option>Select Type</option>
                                                    {categories?.map((record, index) => (
                                                        <option key={index} value={record?.id}>{record?.name}</option>
                                                    ))}

                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="title" className="block mb-2 text-sm font-medium my-label">Title/Name</label>
                                            <input type="text" onChange={handleChange} name="title" value={formValue.title} id="title" className=" my-input block w-full" placeholder="Name of Entity" required />
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="description" className="block mb-2 text-sm font-medium my-label">Describe the Entity</label>
                                            <textarea id="description" onChange={handleChange} name="description" value={formValue.description} rows="3" class="block p-2.5 w-full my-input" placeholder="Entity Description..."></textarea>

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
                                                className="my-input block w-full"
                                                placeholder="Write Assessment"
                                                required
                                            />
                                        </div>
                                        <div>
                                            {invalidFields !== "" && (<p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>)}
                                        </div>
                                        {/* <div className="absolute bottom-0 left-0 right-0 p-2 "> */}
                                        <div className=" p-2 ">
                                            <div className="flex items-start justify-between">
                                                <span>.</span>
                                                <div className="flex items-end gap-2">
                                                    {props.formType == 'add' && (<>
                                                        <button type="submit" onClick={() => props?.setCurrentPage('list')} className="text-black bg-gray-200 hover:bg-gray-100  font-medium  text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Cancel</button>
                                                        <button type="submit" onClick={handleSubmit} className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center " disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
                                                    </>)}
                                                    {props.formType == 'update' && (<>
                                                        <button type="submit" onClick={() => props.setShow(false)} className="text-black bg-gray-200 hover:bg-gray-100  font-medium  text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Cancel</button>
                                                        <button type="submit" onClick={handleUpdate} className="text-white bg-green-500 hover:bg-green-600  font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center " disabled={pending}>{pending ? "Saving..." : "Save Changes"}</button>
                                                    </>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

        </>
    );
}

export default EntityAddBasic;
