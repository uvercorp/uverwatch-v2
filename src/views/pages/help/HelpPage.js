import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// react-bootstrap components

import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function HelpPage(props) {
   const [collections, setCollection] = useState([]);
   const dispatch = useDispatch();
   const [currentPage,setCurrentPage] = useState('list');
   const [formType,setFormType] = useState('add');
   

  return (
    <>
      {/* Launch Button */}
     

      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {props.showHelp && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => props.setShowHelp(false)} // Close modal when clicking outside
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg md:w-[50%] max-w-[1200px] p-8 overflow-y-auto max-h-[90vh] z-[1201]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
            >
              {/* Modal Header */}
             
              {/* Modal Body */}
              <div className="grid grid-cols-1">
                <div className="font-bold text-[1.2em]">Help & Support</div>
                <hr/>
                <a className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black" href="#" target="_blank">
                  <div className="">Documentation</div>
                  <div className="text-[0.8em]">Learn How to setup, Configur and manage your Uvawatch Deployment</div>

                  </a>
                  <a className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black" href="#" target="_blank">
                  <div className="">Report a Bug</div>
                  <div className="text-[0.8em]">Tell us when Something did not work the way you expected</div>

                  </a>
                  <a className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black" href="#" target="_blank">
                  <div className="">Features</div>
                  <div className="text-[0.8em]">See what Uvawatch can do and how it works</div>

                  </a>
                  <a className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black" href="#" target="_blank">
                  <div className="">Terms and conditions</div>
                  {/* <div className="text-[0.8em]">See what Uvawatch can do and how it works</div> */}

                  </a>
                  <a className="bg-gray-100 p-2 rounded-sm text-gray-700 mb-2 hover:text-black focus:text-black" href="#" target="_blank">
                  <div className="">Policy</div>
                  {/* <div className="text-[0.8em]">See what Uvawatch can do and how it works</div> */}

                  </a>
                  

              </div>

              {/* Close Button */}
              {/* <button
                onClick={() => props.setShowHelp(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Close
              </button> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default HelpPage;