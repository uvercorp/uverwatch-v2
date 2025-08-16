import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, NavLink } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import Spinner from 'react-bootstrap/Spinner';
import SaveToCollection from "./BulkAddToCollection";
import DisplayResult from "./DispalyResult";
import Geofence from "./Geofence";

function SelectedModal(props) {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [query, setQuery] = useState("");
  const [checkedCollections, setCheckedCollections] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [pending, setPending] = useState(false);
 const [currentPage,setCurrentPage] = useState('choose');
 const [selectedType,setSelectedType] = useState('');
  const dispatch = useDispatch();

  const toggleRecordType = (type) => {
    setFilteredPosts([]);
    setSelectedType(type);
    if(type == 'create_entity'){
      setCurrentPage('create_entity');
    }else if(type == 'geofence'){
      setCurrentPage('geofence');
    }else{
      setCurrentPage('display');
    }

    // setFormType(formType);
    if(type == "entities"){
      let toFilter = props.posts
      const entityPosts = toFilter.filter(post =>
        post.hasOwnProperty('is_entity') && post.is_entity === 'true'
      );
      setFilteredPosts(entityPosts);
    }else if(type == "posts"){
      let toFilter = props.posts
      const entityPosts = toFilter.filter(post =>
        post.hasOwnProperty('is_entity') && post.is_entity === 'false'
      );
      setFilteredPosts(entityPosts);
    }else{
      setFilteredPosts(props.posts);
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
            onClick={() => { setCollections([]); props.onClose(); props.onClearSelection(); setCurrentPage('choose')}} // Close modal when clicking outside
          >
            <motion.div
              className="bg-gradient-to-b from-[#1c1b1a] to-[#080808] rounded-lg shadow-lg md:w-[50%] max-w-[1200px] p-8  max-h-[90vh] z-[1201]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
              style={{border: "1px solid #2e2c2b"}}
            >

              {currentPage == 'choose' && <>
                <div className="flex items-start justify-between">
                <span className="text-[1.4em] font-bold">Filter By</span>
                <div className="flex items-center justify-center">
                  <div className="relative">
                   Area Results [{props.posts.length}]

                  </div>
                </div>
              </div>
              <div className="px-0">
        <hr className="border-[#454240] mt-4 pt-0 " />
      </div>
                <div className="md:min-h-[72vh] ">




<div className="grid grid-cols-2 gap-3 gap-x-4">


        <div className="my-gradient-bg h-[90px] text-lg  font-bold text-center p-3 cursor-pointer  py-3 hover:underline capitalize" onClick={() => toggleRecordType('posts')} style={{ border: "1px solid #f5f5f5" }}>Posts</div>
        <div className="my-gradient-bg h-[90px] text-lg font-bold text-center p-3 cursor-pointer  py-3 hover:underline capitalize" onClick={() => toggleRecordType('entities')} style={{ border: "1px solid #f5f5f5" }}> Entities</div>


</div>

<div className="px-0">
        <hr className="border-[#454240] mt-4  pt-0 " />
      </div>
{/* <br/> */}
<div className="grid grid-cols-2 gap-3 gap-x-4">
        <div className="my-gradient-bg h-[90px] text-lg font-bold text-center p-3 cursor-pointer  py-3 hover:underline capitalize" onClick={() => toggleRecordType('posts/entities')} style={{ border: "1px solid #f5f5f5" }}> Both</div>


             {/* <div className="bg-[#f5f5f5] h-[100px] text-lg font-bold text-center p-3 cursor-pointer rounded-sm py-3 hover:underline capitalize" onClick={() => toggleRecordType('create_entity')}> Create Entity</div> */}
        <div className="my-gradient-bg h-[90px] text-lg font-bold text-center p-3 cursor-pointer rounded-sm py-3 hover:underline capitalize" onClick={() => toggleRecordType('geofence')} style={{ border: "1px solid #f5f5f5" }}> Create Geo Fence</div>


</div>
</div>
              </>
    }
    {currentPage == 'collection' &&
    <SaveToCollection  selectedRecord={selectedRecord}/>

    }
    {currentPage == 'display' &&
    <DisplayResult  posts={filteredPosts} selectedType={selectedType} setCurrentPage={setCurrentPage}/>

    }

{currentPage == 'geofence' &&
    <Geofence show={props.show}
    onClose={props.onClose}
    onClearSelection={props.onClearSelection}
    posts={props.posts}
    geoFenceData={props.geoFenceData}
    onSaveGeoFence={props.onSaveGeoFence}
    selectedType={selectedType} setCurrentPage={setCurrentPage}
     />

    }

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SelectedModal;