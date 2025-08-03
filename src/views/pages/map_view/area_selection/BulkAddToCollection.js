import { React, useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import Spinner from 'react-bootstrap/Spinner';
import axiosInstance from "services/axios";

function BulkAddToCollection({ selectedPosts, setCurrentPage, selectedType, closeModal }) {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [checkedCollections, setCheckedCollections] = useState([]);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();

  // Fetch collections on mount
  useEffect(() => {
    const deployment = localStorage.getItem('deployment');
    if (deployment) {
      getCollectionData(JSON.parse(deployment).id);
    }
  }, []);

  // Filter collections based on search
  useEffect(() => {
    setFilteredCollections(
      query
        ? collections.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
        : collections
    );
  }, [query, collections]);

  // Fetch collections
  const getCollectionData = async (deployment_id) => {
    setPending(true);
    try {
      const response = await axiosInstance.get(`getDeploymentCollection/${deployment_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      setCollections(response.data?.collections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  // Handle collection selection
  const handleCheckboxChange = (collectionId) => {
    setCheckedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Save ALL passed posts to selected collections
  const handleBulkSave = async () => {
    if (checkedCollections.length === 0) {
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Select at least 1 collection." }
      }));
      return;
    }

    setPending(true);
    try {
      const response = await axiosInstance.post('bulkAddPostsToCollection', {
        post_ids: selectedPosts.map(post => post.id), // All posts are included
        collection_ids: checkedCollections,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
      });
      console.log(response);
      if (response.data?.data?.status === "success") {
        dispatch(toggleToaster({
          isOpen: true,
          toasterData: {
            type: "success",
            msg: `Added ${selectedPosts.length} post(s) to ${checkedCollections.length} collection(s).`
          }
        }));
        setShow(false); // Close modal
      }
    } catch (err) {
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Failed to save. Try again." }
      }));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#080808] to-[#1c1b1a] p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#f5f5f5]">
          Add <span className="text-blue-600">{selectedPosts.length}</span> Post(s) to Collections
        </h2>
        <div className="relative w-64">
          <input
            type="text"
            className="bg-[#2a2a2a] text-white pl-10 pr-4 py-2 w-full border rounded-lg"
            placeholder="Search collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute left-3 top-2.5">🔍</span>
        </div>
      </div>

      <div className="min-h-[300px] mb-4">
        {pending ? (
          <Spinner animation="border" variant="primary" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredCollections.map(collection => (
              <div key={collection.id} className="bg-[#1c1b1a] hover:bg-[#3b3229] text-gray-200 transition-colors flex items-center p-2 ">
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
        )}
      </div>

      <div className="flex justify-end gap-2">
        {selectedType != 'Item' &&
          <button
            onClick={() => setCurrentPage('list')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>

        }
        {selectedType == 'Item' &&
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>

        }
        <button
          onClick={handleBulkSave}
          disabled={pending || checkedCollections.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {pending ? "Saving..." : "Save to Selected Collections"}
        </button>
      </div>
    </div>
  );
}

export default BulkAddToCollection;