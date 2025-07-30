import React, { useState, useRef, useEffect } from "react";
import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import AutocompleteLocationSearch from "./AutocompleteLocationSearch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RxDashboard } from "react-icons/rx";

import { FiMoreVertical } from "react-icons/fi";

const FilterOption = ({ label }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center space-x-1 text-white pr-3 mr-4 hover:text-gray-300"
      >
        <span className="my-font-family-evogria tracking-wider text-[1.3em]">{label}</span>
        <FiMoreVertical className="text-white" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white text-black shadow-md rounded w-40 p-2 z-50">
          <p className="hover:bg-gray-100 p-1 cursor-pointer">Option 1</p>
          <p className="hover:bg-gray-100 p-1 cursor-pointer">Option 2</p>
          <p className="hover:bg-gray-100 p-1 cursor-pointer">Option 3</p>
        </div>
      )}
    </div>
  );
};




function FilterTopNav(props) {
  const [query, setQuery] = useState("");
  const autocompleteRef = useRef(null);

  const clearFilters = () => {
    setQuery("");
    if (autocompleteRef.current) {
      autocompleteRef.current.focus();
    }
    props.handleLocationSelect(null, null);
  };
  // Add sort label mapping
  const sortLabels = {
    created_at: 'Date/Time',
    alphabetical: 'Title',
    created_by_name: 'Poster Name',
    category: 'Category → Subcategory',
    tags: 'Tag → Subtags',
    priority_level: 'Priority Level',
    assignment_person_name: 'Assigned Person'
  };

  return (
    <>
      <div className="relative  z-[1810] flex items-center justify-between space-x-5 text-sm p-2 pt-3 pl-3">
             <div className="flex my-black-bg px-2 py-2 items-center justify-between pr-0 w-[78%]" 
             style={{border:"1px solid #25201a", textDecoration:"none"}}>
               <FilterOption label="FILTER" />
               <FilterOption label="COLLECTION" />
               <FilterOption label="STATUS" />
               <FilterOption label="CATEGORY" />
               <FilterOption label="TAGS" />
              
               <FilterOption label="SORT BY" />
               <NavDropdown
                               title={
                                 <div className="text-left">
                                   <div>Sort By </div>
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
                                 </div>
                               }
                               id="navbarSort"
                               className="border-l border-grey-500"
                             >
                               <NavDropdown.Item onClick={() => props.handleSort('created_at')}>
                                 Date/Time {props.sortConfig.key === 'created_at' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                               <NavDropdown.Item onClick={() => props.handleSort('alphabetical')}>
                                 Title Alphabetical {props.sortConfig.key === 'alphabetical' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                               <NavDropdown.Item onClick={() => props.handleSort('created_by_name')}>
                                 Poster Name {props.sortConfig.key === 'created_by_name' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                               <NavDropdown.Item onClick={() => props.handleSort('category')}>
                                 Category/Subcategory {props.sortConfig.key === 'category' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                               <NavDropdown.Item onClick={() => props.handleSort('tags')}>
                                 Tags/Subtags {props.sortConfig.key === 'tags' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
               
                               <NavDropdown.Item onClick={() => props.handleSort('priority_level')}>
                                 Priority Level {props.sortConfig.key === 'priority_level' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                               <NavDropdown.Item onClick={() => props.handleSort('assignment_person_name')}>
                                 Assigned Person {props.sortConfig.key === 'assignment_person_name' && `(${props.sortConfig.direction})`}
                               </NavDropdown.Item>
                             </NavDropdown>
                <a onClick={props.clearFilters} className="cursor-pointer text-sm text-red-600 p-0 m-0">
                               Clear Filters
                             </a>
             </div>
             <div className="pr-2">
             <span className="text-gray-400 hover:text-white cursor-pointer font-mono text-[1.6em] pr-3">› Advanced Filter</span>
               
             </div>
           </div> 
    </>
  );
}

export default FilterTopNav;