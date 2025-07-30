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
import { useState,useEffect } from "react";

function AccountInfo(props) {

      const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        upperLower: false,
        number: false,
        specialChar: false
      });
    
      const validatePassword = (pass) => {
        const newValidations = {
          length: pass.length >= 8 && pass.length <= 15,
          upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(pass),
          number: /\d/.test(pass),
          specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
        };
        setPasswordValidations(newValidations);
        return Object.values(newValidations).every(v => v);
      };
    
      // Update password validation status when password changes
      useEffect(() => {
        const isValid = validatePassword(props.formValue.password || '');
        props.setPasswordValidated(isValid);
      }, [props.formValue.password]);
    
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
                <Form className="md:min-h-[367px]">
                    <h3 className="block items-start text-blue-900 font-bold text-[17px] md:text-[20px] pt-0 mt-0" style={{ textAlign: "left" }}>Account Information</h3>
                    <p className="hidden md:block items-start text-gray-500" style={{ textAlign: "left" }}>Please provide your display name, email, login password</p>

                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start mt-1" controlId="exampleForm.ControlInput1">
                        <div className="block items-start text-blue-900" style={{ textAlign: "left" }}>Display Name<span className="pl-2 text-sm text-[0.7em] text-gray-500">Display Name</span></div>
                        <Form.Control
                            type="text"
                            placeholder="Display Name  "
                            autoFocus
                            onChange={props.handleChange}
                            name="display_name"
                            value={props.formValue.display_name}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start" >
                        <Form.Label className="block items-start text-blue-900" style={{ textAlign: "left" }}>Admin Name<span className="pl-2 text-sm text-[0.6em] text-gray-500">Full Name of Administrator</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Name of site Admin "
                            name="admin_name"
                            onChange={props.handleChange}
                            value={props.formValue.admin_name}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start" >
                        <Form.Label className="block items-start text-blue-900" style={{ textAlign: "left" }}>Email<span className="pl-2 text-sm text-[0.6em] text-gray-500">You will use this email to login</span></Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Login Email  "
                            name="email"
                            onChange={props.handleChange}
                            value={props.formValue.email}
                        />
                    </Form.Group>

                   
                                        <Form.Group className="mb-3 grid grid-cols-1  items-start justify-start" >
            <Form.Label className="block items-start text-blue-900" style={{ textAlign: "left" }}>Password<span className="pl-2 text-sm text-[0.6em] text-gray-500">You will use this password to login</span></Form.Label>
            <Form.Control
              type="password"
              placeholder="Login Password  "
              onChange={props.handleChange}
              name="password"
              value={props.formValue.password}
            />
            <div className="mt-2 text-sm grid grid-cols-2">
              <div className={`flex items-center ${passwordValidations.length ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{passwordValidations.length ? '✓' : '✗'}</span>
                8-15 characters
              </div>
              <div className={`flex items-center ${passwordValidations.upperLower ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{passwordValidations.upperLower ? '✓' : '✗'}</span>
                Upper & lowercase letters
              </div>
              <div className={`flex items-center ${passwordValidations.number ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{passwordValidations.number ? '✓' : '✗'}</span>
                At least one number
              </div>
              <div className={`flex items-center ${passwordValidations.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{passwordValidations.specialChar ? '✓' : '✗'}</span>
                At least one special character
              </div>
            </div>
          </Form.Group>
                </Form>
            </motion.div>
        </>
    );
}

export default AccountInfo;
