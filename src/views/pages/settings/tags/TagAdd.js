import React, { useState, useEffect } from "react";
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
import { IconPicker } from "others/icons/IconPicker";

function TagAdd(props) {
    const [tags, setTags] = useState([]);
    const dispatch = useDispatch();
    const [pending, setPending] = useState(false);
    const [formValue, setFormValue] = useState({
        id: '',
        deployment: props?.deploymentId,
        name: '',
        description: '',
        icon: "",
        color: "",
        parent_id: null
    });
    const [invalidFields, setInvalidFields] = useState('');

    // Fetch existing tags for parent dropdown
    useEffect(() => {
        const deployment = localStorage.getItem('deployment');
        if (deployment) {
          getTagData(JSON.parse(deployment).id);
        }

    }, []);

     const getTagData = async (deployment_id) => {
        // setPending(true);
        try {
          const response = await axiosInstance.get(`getDeploymentTags/${deployment_id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
          });
        //   setCollections(response.data?.collections || []);
          setTags(response.data?.tags || []);
        } catch (err) {
          console.error(err);
        } finally {
          setPending(false);
        }
      };

    // Populate form for update
    useEffect(() => {
        if (props.record && props.formType === "update") {
            setFormValue({
                ...props.record,
                icon: props.record.icon || '',
                parent_id: props.record.parent_id || null
            });
        } else {
            setFormValue({
                id: '',
                deployment: props?.deploymentId,
                name: '',
                description: '',
                icon: "",
                color: "",
                parent_id: null
            });
        }
    }, [props.record, props.formType, props.deploymentId]);

    const handleChange = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value
        });
    }

    function validateformData(formData, setInvalidFields) {
        const invalid = [];
        if (!formData.name) invalid.push('Tag Name');
        if (!formData.description) invalid.push('Description');
        if (invalid.length > 0) {
            setInvalidFields(`Please fill in the following required fields: ${invalid.join(', ')}`);
            return false;
        }
        return true;
    }

    const addRecordInstance = async (data) => {
        setPending(true);
        const results = await axiosInstance.post('createDeploymentTag',
            JSON.stringify(data),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            }
        );
        if (results?.data?.status === "success") {
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Tag Added Successfully" } }));
            setPending(false);
            props.populateList(results.data.data);
        }
    }

    const updateRecordInstance = async (data) => {
        setPending(true);
        const results = await axiosInstance.post('updateDeploymentTag',
            JSON.stringify(data),
            {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            }
        );
        if (results?.data?.status === "success") {
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Tag Updated Successfully" } }));
            setPending(false);
            props.updateListRecord(results.data.data);
        }
    }

    const handleSubmit = () => {
        setFormValue({ ...formValue, deployment: props?.deploymentId });
        if (validateformData(formValue, setInvalidFields)) {
            addRecordInstance(formValue);
            setFormValue({ id: '', deployment: props?.deploymentId, name: '', description: '', icon: '', parent_id: null });
        } else {
            setTimeout(() => setInvalidFields(''), 5000);
        }
    }

    const handleUpdate = () => {
        if (validateformData(formValue, setInvalidFields)) {
            updateRecordInstance(formValue);
        } else {
            setTimeout(() => setInvalidFields(''), 5000);
        }
    }

    const handleDelete = (id) => {
        swal({ title: "Confirm Deletion", text: "Once confirmed, record will be deleted", icon: "warning", buttons: ["Cancel","Confirm"], dangerMode: true })
            .then(willDelete => willDelete && deleteRecord(id));
    }

    const deleteRecord = async (id) => {
        setPending(true);
        const results = await axiosInstance.post('deleteDeploymentTag', JSON.stringify({ id }), {
            headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${localStorage.getItem('access')}` }
        });
        if (results?.data?.status === 'success') {
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: 'success', msg: 'Deleted Successfully' } }));
            setPending(false);
            props.updateListRecordDelete(id);
        }
    }
    const handleIconSelection = ({ iconClass, color }) => {

        setFormValue({
            ...formValue,
            icon: iconClass,
            color: color,
        });
        // console.log(formValue)
    };

    return (
        <>
           <Card className="my-gradient-bg shadow-xl " >
                <Card.Header>
                    <Card.Title as="h4">
                        <div className="flex items-start justify-between">
                            <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">Tags : <span className="text-[0.6em] capitalize">{props?.formType}</span></span>
                            <button className="my-btn-cancel" onClick={() => props?.setCurrentPage('list')}>Cancel</button>
                        </div>
                    </Card.Title>
                </Card.Header>
                <div className="px-4">
          <hr className="border-[#2e2c2b] mt-0 mb-2 pt-0 " />
        </div>
                <Card.Body>

                    {pending && <div className="flex items-center justify-center mb-4"><Spinner animation="grow" variant="warning" /></div>}
                    {invalidFields && <p className="bg-red-700 shadow text-left p-3 rounded-xl text-white mb-4">{invalidFields}</p>}
                    <motion.div initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.75 }}>
                        <div className="md:min-h-[450px] relative">
                            <div className="mb-6">
                                <label htmlFor="name" className="block mb-2 my-label">Name</label>
                                <input type="text" name="name" id="name" value={formValue.name} onChange={handleChange} className="my-input block w-full p-2.5" placeholder="Name of Tag" required />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="description" className="block mb-2 my-label">Describe the Tag</label>
                                <textarea id="description" name="description" rows="3" value={formValue.description} onChange={handleChange} className="block p-2.5 w-full my-input" placeholder="Tag Description..."></textarea>
                            </div>
                            {/* Icon Field */}
                            <div className="grid gap-6 md:grid-cols-2 ">
                                                                <div className="mb-6">
                                                                    <label
                                                                        htmlFor="survey_description"
                                                                        className="block mb-2 my-label"
                                                                    >
                                                                        Pick An Icon And Color
                                                                    </label>
                                                                    <IconPicker onSelection={handleIconSelection}
                                                                        initialIconClass={formValue.icon}
                                                                        initialColor={formValue.color}
                                                                    />
                                                                </div>

                            {/* Parent Tag Dropdown */}
                            <div className="mb-6">
                                <label htmlFor="parent_id" className="block mb-2 my-label">Parent Tag (optional)</label>
                                <select name="parent_id" id="parent_id" value={formValue.parent_id} onChange={handleChange} className="block my-input w-full p-2.5">
                                    <option value="">-- Top Level --</option>
                                    {tags.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <div className="flex items-start justify-between">
                                    {props.formType === "update"
                                        ? <a onClick={() => handleDelete(formValue?.id)} className="cursor-pointer text-red-600 hover:text-red-700">Delete</a>
                                        : <span>.</span>
                                    }
                                    {props.formType === "add"
                                        ? <button onClick={handleSubmit} className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Add New</button>
                                        : <button onClick={handleUpdate} className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Save</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Card.Body>
            </Card>
        </>
    );
}

export default TagAdd;
