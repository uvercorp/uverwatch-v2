import { React, useEffect } from "react";

// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
    Form
} from "react-bootstrap";
import { motion } from "framer-motion";

function OrganizationInfo(props) {
    useEffect(() => {
        // console.log('lookup log');
        // console.log(props?.lookup)

    }, []);
    return (
        <>
            <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    duration: 0.75,
                }}
                className="nav-bar"
            >
                <Form className="md:min-h-[387px]">
                    <h3 className="block items-start text-white my-font-family-courier-prime font-bold text-[17px] md:text-[20px] pt-0 mt-0" style={{ textAlign: "left" }}>Organization Information</h3>
                    <p className="hidden md:block items-start text-gray-500" style={{ textAlign: "left" }}>Please provide your Organization name, size and Area</p>

                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start mt-1" controlId="exampleForm.ControlInput1">
                        <div className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>Organization Name<span className="pl-2 text-sm text-[0.6em] text-gray-500">Name of your Organisation Different from deployment name</span></div>
                        <input
                            type="text"
                            placeholder="Organzation Name  "
                            autoFocus
                            onChange={props.handleChange}
                            name="organization_name"
                            value={props.formValue.organization_name}
                            required
                            className="w-full my-input2"
                        />
                    </Form.Group>
                    {/* <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start" >
                        <Form.Label className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>Size Of Organization<span className="pl-2 text-sm text-[0.6em] text-gray-500">Number of People working with your Organisation</span></Form.Label>
                        <input
                            type="text"
                            placeholder="Organization Size : 1-10,11-25,26-50  "
                            autoFocus
                            onChange={props.handleChange}
                            name="size_of_organization"
                            value={props.formValue.size_of_organization}
                            required
                        />
                    </Form.Group> */}
                    <Form.Group
                        className="mb-3 grid grid-cols-1  items-start"

                    >
                        <Form.Label className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>Size Of Organization<span className="pl-2 text-sm text-[0.6em] text-gray-500">Number of People working with your Organisation</span></Form.Label>
                        <Form.Select aria-label="Default select example" className="w-full my-input2 min-h-[2.5em]" required onChange={props.handleChange} value={props.formValue.size_of_organizationy} name="size_of_organization">
                            <option>Select Size</option>
                            {props?.lookup?.organization_sizes?.map((record, index) => (
                                <option key={index} value={record?.id}>{record?.size}</option>
                            ))}

                        </Form.Select>

                        {/* <input as="textarea" rows={3} /> */}
                    </Form.Group>

                    <Form.Group
                        className="mb-3 grid grid-cols-1  items-start"

                    >
                        <Form.Label className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>What are you using Uverwatch for?<span className="pl-2 text-sm text-[0.6em] text-gray-500">Select Below</span></Form.Label>

                        <Form.Select aria-label="Default select example" className="w-full my-input2 min-h-[2.5em]" required onChange={props.handleChange} value={props.formValue.deployment_category} name="deployment_category">
                            <option>Select Category</option>
                            {props?.lookup?.categories?.map((record, index) => (
                                <option key={index} value={record?.id}>{record?.name}</option>
                            ))}

                        </Form.Select>

                        {/* <input as="textarea" rows={3} /> */}
                    </Form.Group>
                </Form>
            </motion.div>
        </>
    );
}

export default OrganizationInfo;
