import React from "react";

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

function DeploymentInfo(props) {
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
                <h3 className="block items-start text-white my-font-family-courier-prime font-bold text-[17px] md:text-[20px] pt-0 mt-0" style={{ textAlign: "left" }}>Deployment Information</h3>
                <p className="hidden md:block items-start text-gray-500" style={{ textAlign: "left" }}>Please provide your deployment name, dloyement url</p>
                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start mt-1" controlId="exampleForm.ControlInput1">
                        <div className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>Deployment Name<span className="pl-2 text-sm text-[0.6em] text-gray-500">Appears at the top of your deployment site</span></div>
                        <input
                            type="text"
                            placeholder="Title of your deployment  "
                            autoFocus
                            onChange={props.handleChange}
                            name="name"
                            value={props.formValue.name}
                            required
                            className="w-full my-input2"
                        />
                    </Form.Group>
                    <Form.Group className="mb-1 grid grid-cols-1  items-start justify-start" >
                        <Form.Label className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>Deployment URL<span className="pl-2 text-sm text-[0.6em] text-gray-500">Web Address of your deployment</span></Form.Label>
                        <input
                            type="text"
                            placeholder="url "
                            autoFocus
                            name="url"
                            onChange={props.handleChange}
                            value={props.formValue.url}
                            required
                            className="w-full my-input2"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start" >
                        <Form.Label className="block items-start text-[#f5f5f5]" style={{ textAlign: "left" }}>eg: url.uverwatch.com<span className="pl-2 text-sm text-[0.6em] text-gray-500">your deployment url</span></Form.Label>
                    </Form.Group>
                    {/* <Form.Group
                        className="mb-3 grid grid-cols-1  items-start"
                        controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label className="block items-start">Example textarea</Form.Label>
                        <input as="textarea" rows={3} />
                    </Form.Group> */}
                </Form>
            </motion.div>
        </>
    );
}

export default DeploymentInfo;
