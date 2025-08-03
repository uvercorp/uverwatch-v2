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
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import { IconPicker } from "others/icons/IconPicker";
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Name } from "ajv";
import TeamUser from "./sub/TeamUser";

function TeamAdd(props) {
    const [collections, setTeam] = useState([]);
    const [accessLevel, setAccessLevel] = useState([]);
    const dispatch = useDispatch();
    const [pending, setPending] = useState(false);
    const [activeTab, setActiveTab] = useState('collections');

    const tabs = [
      { id: 'collections', label: 'Entry' },

      { id: 'users', label: 'Team Users' }
    ];

    const renderTabContent = () => {
      switch (activeTab) {
        case 'collections':
          return <TeamsTab />;
        case 'teams':
          return <TeamsTab />;
        case 'users':
          return <UsersTab />;
        default:
          return <TeamsTab />;
      }
    };

    const [formValue, setFormValue] = useState(
        {
            id: '',
            deployment: '',
            name: '',
            description: '',
            access_level: "",
            created_by:"",
            icon: "",
            color: "",
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
                access_level: "",
                created_by:"",
                icon: "",
                color: "",
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
                icon: "",
                access_level: "",
                color: "",
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
            invalidFields.push('Team Name');
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
        const results = await axiosInstance.post('createDeploymentTeam',
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

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Team Added Successfully" } }))

            setPending(false);
            props.populateList(results?.data?.data);
            props?.setCurrentPage('list');

        }else{
            setPending(false);
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: results?.data?.message } }))
        }
    }

    const updateRecordInstance = async (data) => {

        setPending(true);
        const results = await axiosInstance.post('updateDeploymentTeam',
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

            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Team Updated Successfully" } }))

            setPending(false);
            props.updateListRecord(results?.data?.data);
            props?.setCurrentPage('list');

        }else{
            setPending(false);
            dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: results?.data?.message } }))
        }
    }
    const handleIconSelection = ({ iconClass, color }) => {

        setFormValue({
            ...formValue,
            icon: iconClass,
            color: color,
        });
        console.log(formValue)
    };

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
        const results = await axiosInstance.post('deleteDeploymentTeam',
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
            getLookupData(JSON.parse(deployment).id);

        }

    }, []);
    const getLookupData = async (deployment_id) => {
        // setPending(true);
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
                // setCategories(dData?.categories);
                // setImpactLevel(dData?.impact_levels);
                setAccessLevel(dData?.access_levels);
                // setPriorityLevel(dData?.priority_levels);
                // setStatus(dData?.statuses);
                // console.log(dData);

            }
        } catch (err) {
            setPending(false);


        }



    }


    return (
        <>

        <Card className="my-gradient-bg shadow-xl text-white " >
                <Card.Header>
                    <Card.Title as="h4">

                        <div className="flex items-start justify-between">
                            <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">Team | <span className="text-[0.6em] capitalize"> {props?.formType} <span className="italic">: {formValue?.name}</span> </span> </span>
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
                              <div className="max-w-4xl mx-auto ">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
        {props.formType == 'update' && <>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </>}
        </nav>
      </div>
      <div className="py-6 md:min-h-[450px] relative">
        {/* {renderTabContent()} */}
        {activeTab == 'collections' &&
        <div className="">

        <div>
        {/* <div className="grid gap-6 md:grid-cols-2 "> */}
                <div className="mb-6 text-stone-900">
                    <label
                        htmlFor="survey_description"
                        className="block text-sm text-gray-400 mb-1"
                    >
                        Pick An Icon And Color
                    </label>
                    <IconPicker onSelection={handleIconSelection}
                        initialIconClass={formValue.icon}
                        initialColor={formValue.color}
                    />
                </div>

            {/* </div> */}
            <div className="grid gap-6 md:grid-cols-2 ">
                <div className="mb-6">
                    <label for="name" className="block my-label">Team Name</label>
                    <input type="text" onChange={handleChange} name="name" value={formValue.name} id="name" className=" w-full my-input" placeholder="Name of Team" required />
                </div>
                <div className="mb-6">
                    <label htmlFor="access_level" className="block my-label">Access Level</label>

                    <select style={{ width: "100%" }} className="w-full my-input min-h-[2.5em] " value={formValue.access_level} required onChange={handleChange} name="access_level">
                        <option>Select Access Level</option>
                        {accessLevel?.map((record, index) => (
                            <option key={index} value={record?.level}>{record?.name} level[{record?.level}] </option>
                        ))}

                    </select>
                </div>
            </div>
            <div className="mb-6">
                <label for="description" className="block my-label">Describe the Team</label>
                <textarea id="description" onChange={handleChange} name="description" value={formValue.description} rows="3" class="w-full my-input" placeholder="Team Description..."></textarea>

            </div>
            <div>
                {invalidFields !== "" && (<p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 ">
                <div className="flex items-start justify-between">
                    {props.formType == "add" ?
                        <span>.</span> :
                        <a onClick={() => handleDelete(formValue?.id)} className="cursor-pointer text-red-600 hover:text-red-700" disabled={pending}>Delete</a>
                    }
                    {props.formType == "add" ? <button type="submit" onClick={handleSubmit} disabled={pending} className="text-white bg-yellow-500 hover:bg-yellow-600  font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Add New</button> :
                        <button type="submit" onClick={handleUpdate} disabled={pending} className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Save</button>
                    }
                </div>
            </div>
        </div>
    </div>
        }

         {activeTab == 'users' &&
        <TeamUser  teamId={formValue.id}/>
        }
      </div>
    </div>


                    </motion.div>
                </Card.Body>
            </Card>

        </>
    );
}

export default TeamAdd;
