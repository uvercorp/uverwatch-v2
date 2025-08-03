import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Tab
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import MapTest from "views/Maptest";
// import LocationSelectMap from "./LocationSelectMap";
import Spinner from 'react-bootstrap/Spinner';
// import ImageInput from "./ImageInput";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from "services/axios";

const Security = (props) => {






  return (
     <>
 <style>{`
      .disabled\:opacity-50:disabled {
  opacity: 0.5;
}
.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}
      `}</style>


        {/* Tabs Navigation */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75 }}
          className=' md:min-h-[500px]'
        >

<form onSubmit={props?.handlePasswordChange} className="max-w-md space-y-4">
                {/* Current Password Input */}
                <div>
                  <label className="block text-sm font-medium my-label">Current Password</label>
                  <input
                    type="password"
                    value={props?.password.current}
                    onChange={(e) => props?.setPassword({ ...props?.password, current: e.target.value })}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                </div>

                {/* New Password Input with Validation */}
                <div>
                  <label className="block text-sm font-medium my-label">New Password</label>
                  <input
                    type="password"
                    value={props?.password.new}
                    onChange={(e) => {
                      props?.setPassword({ ...props?.password, new: e.target.value });
                      props?.validatePassword(e.target.value);
                    }}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                  <div className="mt-2 text-sm">
                    <div className={`flex items-center ${props?.passwordValidations.length ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{props?.passwordValidations.length ? '✓' : '✗'}</span>
                      8-15 characters
                    </div>
                    <div className={`flex items-center ${props?.passwordValidations.upperLower ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{props?.passwordValidations.upperLower ? '✓' : '✗'}</span>
                      Upper & lowercase letters
                    </div>
                    <div className={`flex items-center ${props?.passwordValidations.number ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{props?.passwordValidations.number ? '✓' : '✗'}</span>
                      At least one number
                    </div>
                    <div className={`flex items-center ${props?.passwordValidations.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{props?.passwordValidations.specialChar ? '✓' : '✗'}</span>
                      At least one special character
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium my-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={props?.password.confirm}
                    onChange={(e) => props?.setPassword({ ...props?.password, confirm: e.target.value })}
                    className="mt-1 block w-full my-input2"
                    required
                  />
                  {props?.password.confirm && (props?.password.new !== props?.password.confirm) && (
                    <div className="text-red-600 text-sm mt-1">Passwords do not match</div>
                  )}
                </div>

                {/* Submit Button */}
                <div className='flex items-start justify-between'>
                  <span>{" "}</span>
                <button
                  type="submit"
                  disabled={
                    !props?.password.current ||
                    !Object.values(props?.passwordValidations).every(v => v) ||
                    props?.password.new !== props?.password.confirm
                  }
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
                </div>
              </form>
        </motion.div>


    </>
  );
};

export default Security;