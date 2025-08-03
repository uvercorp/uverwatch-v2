import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BulkAddToCollection from '../../map_view/area_selection/BulkAddToCollection';

const AddToCollectionBulkModal = ({ show, onClose, filteredPosts }) => {



  return (
    <AnimatePresence>
      {show && (

             <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}

                      >
                        <motion.div
                          className="bg-gradient-to-b from-[#1c1b1a] to-[#080808]  shadow-lg md:w-[50%] max-w-[1200px] p-8 overflow-y-auto max-h-[90vh] z-[1201]"
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -50, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
                        >
            <div className="flex justify-between items-center mb-6">
              {/* <h2 className="text-2xl font-bold">Advanced Search / Filter</h2> */}
              <>.</>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <BulkAddToCollection selectedPosts={filteredPosts} selectedType='Item' setCurrentPage="List" closeModal={onClose}/>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCollectionBulkModal;