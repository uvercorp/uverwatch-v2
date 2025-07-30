import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import PostLinking from "./PostLinking";
import PostAssigning from "./PostAssigning";

function AssignPost(props) {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [checkedCollections, setCheckedCollections] = useState([]);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();
    const [currentUser, setCurrentUer] = useState('');
  const isValidColor = (color) => {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  };
  // Fetch collections when the component is shown
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {
      // getCollectionData(JSON.parse(deployment).id);
    }
    let user = localStorage.getItem('currentUser');


    if (user && user !== undefined) {
      setCurrentUer(JSON.parse(user));
      // alert(JSON.parse(user).id);
    }
  }, [props.show]);

  // Filter collections based on search query
  useEffect(() => {
    if (query) {
      const filtered = collections.filter(collection =>
        collection.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collections);
    }
  }, [query, collections]);

  // Fetch collections from the server
  const getCollectionData = async (deployment_id) => {
    setCollections([]);
    setPending(true);
    try {
      const response = await axiosInstance.get('getDeploymentCollection/' + deployment_id, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
      });
      if (response?.data) {
        setCollections(response.data.collections);
        setFilteredCollections(response.data.collections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (collectionId) => {
    setCheckedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId) // Uncheck
        : [...prev, collectionId] // Check
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (checkedCollections.length === 0) {
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Please select at least one collection." } }));
      return;
    }

    setPending(true);
    try {
      const data = {
        post_id: props.selectedRecord.id,
        collection_ids: checkedCollections,
      };
      const response = await axiosInstance.post('AddPostToCollection', data, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
      });
      if (response?.data?.status === "success") {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Post added to collections successfully." } }));
        props.setShow(false); // Close the modal
      }
    } catch (err) {
      console.error(err);
      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "An error occurred. Please try again." } }));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop and Content */}
      <AnimatePresence>
        {props.show && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setCollections([]); props.setShow(false); }} // Close modal when clicking outside
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg md:w-[55%] max-w-[1200px] p-8 overflow-y-auto max-h-[90vh] z-[1201]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
            >
              
      <div className="flex items-start justify-between">
      <span className="text-[1.4em] font-bold">Assign Post / Entity</span>
      </div>
      <hr/>
              <PostAssigning
  post={props?.selectedRecord} 
  
  userAccess={currentUser?.access_level}
/>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AssignPost;