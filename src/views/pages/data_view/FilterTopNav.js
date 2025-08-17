import React, { useState, useRef, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import axiosInstance from "services/axios";
import { useSelector, useDispatch } from 'react-redux';
import {addCollections,removeCollections} from 'provider/features/collectionSlice';
import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import AutocompleteLocationSearch from "./AutocompleteLocationSearch";


import { FiMoreVertical } from "react-icons/fi";

function FilterTopNav(props) {
  const [query, setQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const autocompleteRef = useRef(null);
  const [deploymentId,setDeploymentId] = useState(null);
  const [collections, setCollection] = useState([]);
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  let navigate = useHistory();
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const toggleDropdown1 = (name) => {
  if (activeDropdown === name) {
    setActiveDropdown(null);
    setTagSearchTerm(''); // Reset search term
  } else {
    setActiveDropdown(name);
  }
};

  // Dropdown options data
  const dropdownOptions = {
    // FILTER: ["Option 1", "Option 2", "Option 3"],
    // COLLECTION: ["Collection 1", "Collection 2"],
    // STATUS: ["Active", "Inactive", "Pending"],
    // CATEGORY: ["Tech", "Design", "Marketing"],
    // TAGS: ["Urgent", "Important", "Follow-up"],
    // "SORT BY": ["Date/Time", "Title", "Poster Name"]
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedOutside = true;

      // Check if click was inside any dropdown
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });

      if (clickedOutside) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // const clearFilters = () => {
  //   props?.clearFilters();
  //   setQuery("");
  //   if (autocompleteRef.current) {
  //     autocompleteRef.current.focus();
  //   }
  //   props.handleLocationSelect(null, null);
  //   setActiveDropdown(null);
  // };

  const clearFilters = () => {
    setQuery('');
    props.handleLocationSelect(null);
    props.handleRangeSelect({ target: { value: '' } });
    props?.clearFilters();
  };

  const sortLabels = {
    created_at: 'Date/Time',
    alphabetical: 'Title',
    created_by_name: 'Poster Name',
    category: 'Category → Subcategory',
    tags: 'Tag → Subtags',
    priority_level: 'Priority Level',
    assignment_person_name: 'Assigned Person'
  };

  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {
      getCollectionData(JSON.parse(deployment).id);
      setDeploymentId(JSON.parse(deployment).id);

    }

  }, []);

  const searchCollection = (record)=>{
    dispatch(addCollections({name:record.name,collectionId:record.id,owner:record.created_by,accessLevel: record.access_level,collectionData:[]}));
    navigate.push('/deployment/data_view?collection='+record.id);
    // props.setShow(false);

   }

  const getCollectionData = async (deployment_id) => {
    setPending(true);
    setCollection([]);
    try {
      const response = await axiosInstance.get('getDeploymentCollection/' + deployment_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
          //   withCredentials: true
        }
      );
      // console.log(response)

      // console.log(JSON.stringify(response?.data));
      setPending(false);
      if (response?.data) {
        let dData = response?.data?.collections;
        setCollection(dData);
        // console.log(dData);

      }
    } catch (err) {
      // setPending(false);
      // if (!err?.response) {
      //   dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))
      // } else if (err.response?.status === 400) {
      //   dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
      // } else if (err.response?.status === 401) {
      //   dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['detail'] } }))
      // } else {
      //   dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }));
      // }
    }

  }
  return (
    <>
      <div className="relative z-[1810] flex items-center justify-between space-x-5 text-sm p-2 pt-3 pl-3">
        <div
          className="flex my-black-bg px-2 py-2 items-center justify-between pr-0 w-[78%]"
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          {Object.keys(dropdownOptions).map((label) => (
            <div className="relative" key={label} ref={el => dropdownRefs.current[label] = el}>
              <button
                onClick={() => toggleDropdown(label)}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                  {label}
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === label && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {dropdownOptions[label].map((option) => (
                    <p
                      key={option}
                      className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                      onClick={() => {
                        // Handle option selection here
                        console.log(`${label} selected:`, option);
                        setActiveDropdown(null);
                      }}
                    >
                      {option}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
           <div className="relative"  ref={el => dropdownRefs.current['COLLECTION'] = el}>
              <button
                onClick={() => toggleDropdown("COLLECTION")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                 COLLECTION
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === "COLLECTION" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
{collections?.map((record, index) => (
                    <p
                    key={index}
                      className="hover:bg-gray-600 p-1 cursor-pointer m-0 truncate w-full"
                      onClick={() => {
                        // Handle option selection here
                        searchCollection(record);
                        setActiveDropdown(null);
                      }}
                    >
                      {record.name}
                    </p>
))}

                </div>
              )}

            </div>
          <div className="relative"  ref={el => dropdownRefs.current['STATUS'] = el}>
              <button
                onClick={() => toggleDropdown("STATUS")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                 STATUS({props?.selectedStatuses.length})
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === "STATUS" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {/* {dropdownOptions[label].map((option) => (
                    <p
                      key={option}
                      className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                      onClick={() => {
                        // Handle option selection here
                        console.log(`${label} selected:`, option);
                        setActiveDropdown(null);
                      }}
                    >
                      {option}
                    </p>
                  ))} */}
                  <div key='is_flagged' className="flex items-start mb-1 pt-1  hover:bg-gray-600 p-1 cursor-pointer m-0">
                      <div className="flex items-center h-4">
                        <input type="checkbox"
                          checked={props?.selectedStatuses.includes('flagged')}
                          onChange={() => props?.handleStatusChange('flagged')} className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-900 dark:ring-offset-gray-800" />
                      </div>
                      <label for="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">Flagged
                      </label>
                    </div>
                   {props?.uniqueStatuses.map((status) => (

                    <div key={status} className="flex items-start mb-1 pt-1  hover:bg-gray-600 p-1 cursor-pointer m-0">
                      <div className="flex items-center h-4">
                        <input type="checkbox"
                          checked={props?.selectedStatuses.includes(status)}
                          onChange={() => props?.handleStatusChange(status)} className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-900 dark:ring-offset-gray-800" />
                      </div>
                      <label for="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">{status}
                      </label>
                    </div>

                ))}

                </div>
              )}

            </div>
            <div className="relative"  ref={el => dropdownRefs.current['CATEGORY'] = el}>
              <button
                onClick={() => toggleDropdown("CATEGORY")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                CATEGORY({props?.selectedCategories.length})
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === "CATEGORY" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {/* {dropdownOptions[label].map((option) => (
                    <p
                      key={option}
                      className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                      onClick={() => {
                        // Handle option selection here
                        console.log(`${label} selected:`, option);
                        setActiveDropdown(null);
                      }}
                    >
                      {option}
                    </p>
                  ))} */}
                    {props?.uniqueCategories.map((category) => (

                    <div key={category} className="flex items-start mb-1 pt-1  hover:bg-gray-600 p-1 cursor-pointer m-0">
                      <div className="flex items-center h-4">
                        <input type="checkbox"
                          checked={props.selectedCategories.includes(category)}
                          onChange={() => props.handleCategoryChange(category)} className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                      </div>
                      <label for="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">{category}
                      </label>
                    </div>

                ))}
                </div>
              )}

            </div>
            {/* <div className="relative"  ref={el => dropdownRefs.current['TAGS'] = el}>
              <button
                onClick={() => toggleDropdown("TAGS")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                TAGS({props?.selectedTags.length})
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === "TAGS" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  
                    {props?.uniqueTags.map((category) => (

                    <div key={category} className="flex items-start mb-1 pt-1  hover:bg-gray-600 p-1 cursor-pointer m-0">
                      <div className="flex items-center h-4">
                        <input type="checkbox"
                          checked={props.selectedTags.includes(category)}
                          onChange={() => props.handleTagChange(category)} className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                      </div>
                      <label for="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">{category}
                      </label>
                    </div>

                ))}
                </div>
              )}

            </div> */}
             <div className="relative"  ref={el => dropdownRefs.current['LOCATION'] = el}>
              <button
                onClick={() => toggleDropdown("LOCATION")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                LOCATION
                </span>
                <FiMoreVertical className="text-white" />
              </button>

              {activeDropdown === "LOCATION" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50 max-h-[50VH] min-w-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                 
                    {/* {props?.uniqueCategories.map((category) => (

                    <div key={category} className="flex items-start mb-1 pt-1  hover:bg-gray-600 p-1 cursor-pointer m-0">
                      <div className="flex items-center h-4">
                        <input type="checkbox"
                          checked={props.selectedCategories.includes(category)}
                          onChange={() => props.handleCategoryChange(category)} className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                      </div>
                      <label for="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">{category}
                      </label>
                    </div>

                ))} */}
                <div className="text-right text-red-500 underline cursor-pointer" onClick={clearFilters}>
                  clear
                </div>
                <div className="min-h-[400px]  pt-3">
                  <label>City Or Address</label>
                  <AutocompleteLocationSearch
                    query={query} // Pass query state
                    onQueryChange={setQuery} // Pass setter for query
                    onLocationSelect={props.handleLocationSelect}
                    ref={autocompleteRef} // Pass ref to child
                  />
                  <br />
                  <select
                    value={props?.selectedRange || ""}
                    onChange={props.handleRangeSelect}
                    className="block w-full px-4 py-2 text-base my-input"
                  >
                    <option value="1">Within 1 km</option>
                    <option value="2">Within 2 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                    <option value="100">Within 100 km</option>
                    <option value="500">Within 500 km</option>
                    <option value="1000">Within 1000 km</option>
                  </select>
                </div>
                </div>
              )}

            </div>
<div className="relative" ref={el => dropdownRefs.current['TAGS'] = el}>
  <button
    onClick={() => toggleDropdown("TAGS")}
    className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
  >
    <span className="my-font-family-evogria tracking-wider text-[1.3em]">
      TAGS({props?.selectedTags.length})
    </span>
    <FiMoreVertical className="text-white" />
  </button>

  {activeDropdown === "TAGS" && (
    <div className="absolute top-full mt-0 right-0 bg-[#1F2F3F] text-white shadow-md w-40 p-2 z-50 max-h-[50VH] flex flex-col">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search tags..."
        className="w-full p-1 mb-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        value={tagSearchTerm}
        onChange={(e) => setTagSearchTerm(e.target.value)}
      />
      
      {/* Tags List Container */}
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 flex-grow">
        {props.uniqueTags
          .filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
          .map((category) => (
            <div key={category} className="flex items-start mb-1 pt-1 hover:bg-gray-600 p-1 cursor-pointer m-0">
              <div className="flex items-center h-4">
                <input 
                  type="checkbox"
                  checked={props.selectedTags.includes(category)}
                  onChange={() => props.handleTagChange(category)} 
                  className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" 
                />
              </div>
              <label htmlFor="published" className="ms-2 capitalize text-sm font-medium text-white truncate w-full">
                {category}
              </label>
            </div>
          ))
        }
      </div>
    </div>
  )}
</div> 


            <div className="relative"  ref={el => dropdownRefs.current['SORTBY'] = el}>
              <button
                onClick={() => toggleDropdown("SORTBY")}
                className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
              >
                <span className="my-font-family-evogria tracking-wider text-[1.3em]">
                 SORT BY
                </span>
                <FiMoreVertical className="text-white" />
                {props.sortConfig.key && (
                                     <div className="text-muted" style={{
                                       fontSize: '0.5rem',
                                       lineHeight: '1',
                                       marginTop: '0px',
                                       fontWeight: 400
                                     }}>
                                       {sortLabels[props.sortConfig.key]} {props.sortConfig.key ? `(${props.sortConfig.direction})` : ''}
                                     </div>
                                   )}
              </button>

              {activeDropdown === "SORTBY" && (
                <div className="absolute top-full mt-0 right-0  bg-[#1F2F3F]  text-white shadow-md w-40 p-2 z-50">
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('created_at');
                    setActiveDropdown(null);
                  }}
                  >
                    Date/Time {props.sortConfig.key === 'created_at' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                    props.handleSort('alphabetical')
                    setActiveDropdown(null);
                  }}
                  >
                     Title Alphabetical {props.sortConfig.key === 'alphabetical' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('created_by_name');
                    setActiveDropdown(null);
                  }}
                  >
                   Poster Name {props.sortConfig.key === 'created_by_name' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('category');
                    setActiveDropdown(null);
                  }}
                  >
                    Category/Subcategory {props.sortConfig.key === 'category' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('tags');
                    setActiveDropdown(null);
                  }}
                  >
                    Tags/Subtags {props.sortConfig.key === 'tags' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('priority_level');
                    setActiveDropdown(null);
                  }}
                  >
                    Priority Level {props.sortConfig.key === 'priority_level' && `(${props.sortConfig.direction})`}
                  </p>
                  <p
                  className="hover:bg-gray-600 p-1 cursor-pointer m-0"
                  onClick={() => {
                     props.handleSort('assignment_person_name');
                    setActiveDropdown(null);
                  }}
                  >
                    Assigned Person {props.sortConfig.key === 'assignment_person_name' && `(${props.sortConfig.direction})`}
                  </p>

                </div>
              )}

            </div>


          <a
            onClick={clearFilters}
            className="cursor-pointer text-sm text-red-600 p-0 m-0"
          >
            Clear Filters
          </a>
        </div>

        <div className="pr-2">
          <span className="text-gray-400 hover:text-white cursor-pointer font-mono text-[1.6em] pr-3" onClick={() => props?.setRightOpen(!props?.rightOpen)}>
          {props?.rightOpen ? '▼' : '›'} Advanced Filter
          </span>
        </div>
      </div>
    </>
  );
}

export default FilterTopNav;
