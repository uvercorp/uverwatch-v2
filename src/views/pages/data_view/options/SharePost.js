import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';

function SharePost(props) {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [checkedCollections, setCheckedCollections] = useState([]);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();

  // Fetch collections when the component is shown
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {
      getCollectionData(JSON.parse(deployment).id);
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
              className="bg-white rounded-lg shadow-lg md:w-[50%] max-w-[1200px] p-8 overflow-y-auto max-h-[90vh] z-[1201]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
            >
              <div className="flex items-start justify-between">
                <span className="text-[1.4em] font-bold">Add To Collection</span>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {/* Search Input */}
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 w-64 md:w-80 lg:w-96 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <hr />
              <div className="md:min-h-[300px]">
                {pending && (
                  <div className="flex items-center justify-center mb-4">
                    <Spinner animation="grow" variant="warning" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {filteredCollections.map((collection) => (
                    <div key={collection.id} className="bg-[#f5f5f5] p-2 cursor-pointer flex items-center">
                      <input
                        type="checkbox"
                        checked={checkedCollections.includes(collection.id)}
                        onChange={() => handleCheckboxChange(collection.id)}
                        className="mr-2"
                      />
                      {collection.name}
                    </div>
                  ))}
                </div>
              </div>
              {/* Submit Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                  disabled={pending}
                >
                  {pending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SharePost;