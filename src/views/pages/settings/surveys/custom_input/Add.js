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
import { FaPray } from "react-icons/fa";

function Add(props) {
    const [customInputs, setCustomInput] = useState([]);
    const dispatch = useDispatch();
    const [pending, setPending] = useState(false);
    const [formValue, setFormValue] = useState(
        {
            id: '',
            name: '',
            description: '',
        }
    );

    const [formValueUpate, setFormValueUpdate] = useState(
    {
        field_name: "",
        field_type: "",
        field_value: "",
        required: true,
        has_options: false, // Default to false
        options: []
    }
    );

    const [formCustomInput, setFormCustomInput] = useState(
        {
            field_name: "",
            field_type: "",
            field_value: "",
            required: true,
            has_options: false, // Default to false
            options: []
        }
        );

    useEffect(() => {
        if (props.customFieldView == 'update') {
// console.log(props.selectedUpdateRecord);
            alert('upating')
            setFormValue(props.selectedUpdateRecord);
            // Handle update logic if needed
        } else {
            // alert('new upating')
            setFormValue(props.record);
            setFormCustomInput({
                ...formCustomInput,
                field_type: props.record?.type,
                field_name: props.record.name,
                required: props.record.required || true,
                has_options: props.record?.type === 'enum' ? true : false, // Set has_options based on type
                options: props.record.options || []
            });
        }
    }, [props.record, props.customFieldView]);

    const handleChange = (event) => {
        setFormValue({
            ...formValue,
            [event.target.name]: event.target.value
        });

        if (event.target.name == 'name') {
            setFormCustomInput({
                ...formCustomInput,
                field_name: event.target.value,
            });
        }
        if (event.target.name == 'description') {
            setFormCustomInput({
                ...formCustomInput,
                field_value: event.target.value,
            });
        }
    }

    const handleRequiredChange = (event) => {
        setFormCustomInput({
            ...formCustomInput,
            required: event.target.checked
        });
    }

    const handleOptionChange = (index, event) => {
        const newOptions = [...formCustomInput.options];
        newOptions[index] = event.target.value;
        setFormCustomInput({
            ...formCustomInput,
            options: newOptions
        });
    }

    const addOption = () => {
        setFormCustomInput({
            ...formCustomInput,
            options: [...formCustomInput.options, '']
        });
    }

    const removeOption = (index) => {
        const newOptions = formCustomInput.options.filter((_, i) => i !== index);
        setFormCustomInput({
            ...formCustomInput,
            options: newOptions
        });
    }

    const HandleAdd = () => {
        // Validate if type is enum and options are less than 2
        if (formCustomInput.field_type === 'enum' && formCustomInput.options.length < 2) {
            swal("Error", "For enum type, at least two options must be added.", "error");
            return;
        }

        // Set has_options to true only if type is enum
        const updatedFormCustomInput = {
            ...formCustomInput,
            has_options: formCustomInput.field_type === 'enum' ? true : false
        };

        // Pass the updated data to the parent component
        props.addCustomField(updatedFormCustomInput);
    }

    const handleUpdate = () => {
        // Validate if type is enum and options are less than 2
        if (formCustomInput.field_type === 'enum' && formCustomInput.options.length < 2) {
            swal("Error", "For enum type, at least two options must be added.", "error");
            return;
        }

        // Set has_options to true only if type is enum
        const updatedFormCustomInput = {
            ...formCustomInput,
            has_options: formCustomInput.field_type === 'enum' ? true : false
        };

        // Pass the updated data to the parent component
        props.addCustomField(updatedFormCustomInput);
    }

    return (
        <>
            <div className="md:min-h-[450px] relative">
                <div>
                    <div className="mb-6">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" onChange={handleChange} name="name" value={formValue.name} id="name" className="focus:bg-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name of CustomInput" required />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add field description (optional)</label>
                        <textarea id="description" onChange={handleChange} name="description" value={formValue.description} rows="1" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white focus:bg-white" placeholder="CustomInput Description..."></textarea>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            <input type="checkbox" checked={formCustomInput.required} onChange={handleRequiredChange} className="mr-2" />
                            Required
                        </label>
                    </div>

                    {props.record?.type === 'enum' && (
                        <div className="mb-6">
                            <label className=" mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-start justify-between pb-2" style={{borderBottom:"1px solid grey"}}><span>Options</span> 
                            <button type="button" onClick={addOption} className="text-black btn-sm bg-[#f5f5f5] font-medium rounded-lg text-sm px-2 py-2.5 text-center">Add Option</button>
                            </label>
                            <div className="max-h-[100px] overflow-y-auto">
                            {formCustomInput.options.map((option, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e)}
                                        className="focus:bg-white bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Option"
                                    />
                                    <button type="button" onClick={() => removeOption(index)} className="ml-2 text-red-500 hover:text-red-700 sm">Remove</button>
                                </div>
                            ))}
                            </div>
                            
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="flex items-start justify-between">
                            <Button variant="default" onClick={() => props?.setCustomFieldView('list')}>Cancel</Button>
                            {props.customFieldView == "add" ?
                                <span>.</span> :
                                <span></span>
                            }
                            {props.customFieldView == "add" ?
                                <button type="submit" onClick={HandleAdd} className="text-black bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Add New</button> :
                                <button type="submit" onClick={handleUpdate} className="text-black bg-green-500 hover:bg-green-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Save</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Add;