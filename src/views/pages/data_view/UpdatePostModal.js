import { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostAddBasic from '../posts/PostAddBasic';
import PostAdd from '../posts/PostAdd';

function UpdatePostModal(props) {
  const [show, setShow] = useState(false);

  return (
    <>
      {/* Launch Button */}


      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {props.show && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-[1811]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Container */}
            <motion.div
              className="rounded-lg shadow-lg w-[60%] max-w-[1200px] py-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 max-h-[90vh] mx-auto mt-8"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{border: "1px solid #f5f5f5"}}
            >
              {/* Modal Header */}
              {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Custom Modal Styling
              </h2> */}

              {/* Modal Body */}
              {(props.selectedRecord.survey_name == 'basic') &&
     <PostAddBasic   record={props.selectedRecord} formType="update" show={props.show} setShow={props.setShow} />
}
{(props.selectedRecord.survey_name == 'custom') &&
     <PostAdd   record={props.selectedRecord} formType="update" show={props.show} setShow={props.setShow} />
}

              {/* Close Button */}
              {/* <button
                onClick={() => props.setShow(false)}
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

export default UpdatePostModal;