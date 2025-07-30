import { React, useState, useEffect, useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Container,
  Row,
  Col,
  Tab,
} from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
  toggleLoadingBar,
  selectLoadingBar,
  toggleToaster,
  selectToasterData,
  selectToasterStatus,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "others/icons/LoadingIcon";
import axiosInstance from "services/axios";
import { login, logout, selectUser } from "provider/features/userSlice";
import Spinner from "react-bootstrap/Spinner";
import { addCollections, removeCollections } from "provider/features/collectionSlice";
import { toggleSearchValue } from "provider/features/globalSearchSlice";
import { CiEdit } from "react-icons/ci";
import { FaShare } from "react-icons/fa";
import SinglePostListCard from "./SinglePostListCard";
import PostList from "./PostList";
import FilterTopNav from "./FilterTopNav";
import PostSearch from "./PostSearch";
import LocationSearch from "./LocationSearch";
import AutocompleteLocationSearch from "./AutocompleteLocationSearch";
import useCSVExport from "hooks/useCSVExport";
import AdvancedSearchOverlay from "./options/AdvancedSearchOverlay";
import AddToCollectionBulkModal from "./options/AddToCollectionBulkModal";
import MapView from "./MapView"





const MyCard = ({ title, date, time, summary, location, tags, status, bgColor, hoverBgColor }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative p-3  mb-4  text-white transition-colors duration-300 bg-[#1F2F3F] hover:bg-[#3F1F2F]`}
      // className={`relative p-3  mb-4  text-white transition-colors duration-300 #1F2F3F ${bgColor} hover:${hoverBgColor}`}
    >
      {/* Title & Menu */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-extrabold my-font-family-courier-prime uppercase tracking-wide p-0 ">{title}</h2>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-300 hover:text-white text-lg"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-600 text-sm z-10 rounded shadow">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">View</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">Edit</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-sm text-gray-400 mb-1">
        <span className="mr-4">DATE: {date}</span>
        <span className="mr-4">TIME: {time}HRS</span>
        <span className="mr-4">📂 CATEGORY</span>
      </div>

      {/* Summary */}
      <p className="text-sm mb-2">{summary}</p>

      {/* Coordinates */}
      <p className="text-xs text-gray-400 mb-1">{location}</p>

      {/* Status */}
      <div className="text-xs mb-1">
        {status.map((item, index) => (
          <span key={index} className="mr-2 font-semibold">{item}</span>
        ))}
      </div>

      {/* Tags */}
      <div className="text-xs text-gray-400">
        Tagged: {tags.join(', ')}
      </div>
    </div>
  );
};


const CardView = () => {
  return (
    <div className="px-4 pb-2 pt-1 bg-black min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">CARD VIEW</h1>
        <div className="pt-0">
          <button className="px-3 pt-0 py-2 border bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Load Presets:</button>
          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Reports [271]</button>
        </div>
      </div>
      <div className="max-h-[90vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      <MyCard
        title="TITLE OF SPECIFIC THING IN CAPS..."
        date="28.02.25"
        time="0800"
        summary="This is where the detailed summary is supposed to go lorem ipsum dolor set amet ramulus piiple a uma law crimun astoria um. lorem ipsum dolor set amet."
        location="Tamale, 2.338646 6.451776, -2.333154 5.872868"
        status={['★ High', '☣ Severe', '⚡ Active']}
        tags={['Cool', 'Gym', 'Crossfit', 'Idea']}
        bgColor="bg-[#1F2F3F]"
        hoverBgColor="bg-[#1f2f3c]"
      />

      <MyCard
        title="TITLE OF SPECIFIC ON HOVER..."
        date="28.02.25"
        time="0800"
        summary="This is where the detailed summary is supposed to go lorem ipsum dolor set amet ramulus piiple a uma law crimun astoria um. lorem ipsum dolor set amet."
        location="Tamale, 2.338646 6.451776, -2.333154 5.872868"
        status={['★ High', '☣ Severe', '⚡ Active']}
        tags={['Cool', 'Gym', 'Crossfit', 'Idea']}
        bgColor="bg-[#3F1F2F]"
        hoverBgColor="bg-[#3F1F2F]"
      />
      
    </div>
    </div>
  );
};



const FilterSection = ({ title, items, selectedItems, toggleItem }) => {
  return (
    <div className="mb-6">
      <h3 className="my-sidebar-link font-bold tracking-wide uppercase text-sm mb-2">{title}</h3>
      {/* <div className="space-y-2 max-h-40 overflow-y-auto pr-1"> */}
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">

        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <div
              key={item}
              onClick={() => toggleItem(item)}
              className="flex items-center cursor-pointer group"
            >
              <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center my-black-bg group-hover:bg-gray-900">
                {isSelected && <span className="text-red-500 font-bold text-sm">X</span>}
              </div>
              <span className={`text-sm ${isSelected ? 'text-red-500 font-semibold' : 'my-sidebar-link'}`}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
      <hr className="border-gray-700 mt-4" />
    </div>
  );
};

const SidebarFilterPanel = () => {
  const [selected, setSelected] = useState([]);

  const toggleItem = (item) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const layers = ['Basic', 'Entity X126', 'Target V12', 'Cocobod', 'Antioch','more','lears','here'];
  const entities = ['Black Shmo', 'Atta Ayi', 'Driver Blue', 'X Com'];
  const trackers = ['Driver 1', 'Phone 243', 'Driver Blue', 'X Com','more','pass','com'];

  return (
    <div className="my-black-bg px-4 w-64 h-full overflow-y-auto pt-2">
      <FilterSection title="Layers" items={layers} selectedItems={selected} toggleItem={toggleItem} />
      <FilterSection title="Entities" items={entities} selectedItems={selected} toggleItem={toggleItem} />
      <FilterSection title="Trackers" items={trackers} selectedItems={selected} toggleItem={toggleItem} />
    </div>
  );
};





const FilterPanel = () => {
  return (
    <div className="w-70 my-black-bg text-gray-200 p-2 font-mono text-sm">
    {/* <div className="w-72 bg-[#0f0f0f] text-gray-200 p-4 font-mono text-sm"> */}
      <div className="max-h-[90vh] my-sidebar-link overflow-y-auto space-y-0 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">

        {/* Search */}
        <div>
          <label className="block mb-0">Search</label>
          <input type="text" className="w-full bg-transparent border border-gray-500 px-2 py-1" />
        </div>

        {/* Time Zone */}
        <div>
          <label className="block mb-0">Time Zone</label>
          <select className="w-full bg-transparent border border-gray-500 px-2 py-1">
            <option>UTC +1</option>
          </select>
          <p className="text-xs text-gray-500 italic mt-0">e.g UTC+00 = GMT</p>
        </div>

        {/* Date Range */}
        <div>
          <label className="block mb-0">Date Range</label>
          <div className="flex gap-2">
            <input type="text" className="w-1/2 bg-transparent border border-gray-500 px-2 py-1" value="28.02.25" />
            <input type="text" className="w-1/2 bg-transparent border border-gray-500 px-2 py-1" value="31.12.25" />
          </div>
          <p className="text-xs text-gray-500 italic mt-0">e.g 22.01.18 to 22.01.25</p>
        </div>

        {/* Time Range */}
        <div>
          <label className="block mb-0">Time Range</label>
          <div className="flex gap-2">
            <input type="text" className="w-1/2 bg-transparent border border-gray-500 px-2 py-1" value="0800HRS" />
            <input type="text" className="w-1/2 bg-transparent border border-gray-500 px-2 py-1" value="2359HRS" />
          </div>
          <p className="text-xs text-gray-500 italic mt-0">e.g 1500HRS to 2300HRS</p>
        </div>

        {/* Days of the Week */}
        <div>
          <label className="block mb-0">Days of the Week</label>
          <div className="flex gap-1 flex-wrap">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <button
                key={day}
                className={`text-[0.7em] px-1 py-0 border border-gray-500 ${
                  ['SUN', 'WED', 'FRI', 'SAT'].includes(day)
                    ? 'text-cyan-300 font-semibold'
                    : 'text-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Area Filter */}
        <div>
          {/* <label className="block mb-0 mt-1">Area Filter:</label> */}
          <div className="flex items-center border border-gray-500 mt-2">
            <input type="text" className="flex-grow bg-transparent px-2 py-1" placeholder="Area Filter..." />
            {/* <button className="px-2 text-gray-300">📍</button> */}
            <button className="px-2 text-gray-300">⋮</button>
          </div>
        </div>

        {/* Visualization */}
        <div>
          <h2 className="text-lg font-semibold mt-1 mb-1">Visualization</h2>

          <div className="mb-1">
            <label className="block mb-0">Playback Frequency</label>
            <select className="w-full bg-transparent border border-gray-500 px-2 py-1">
              <option>15 mins</option>
            </select>
          </div>

          <div>
            <label className="block mb-0">Playback Speed</label>
            <select className="w-full bg-transparent border border-gray-500 px-2 py-1">
              <option>1x</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-1 mt-2 grid grid-cols-1 items-end">
          <button className="w-[70%] ml-[30%] bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold">Save Presets</button>
          <button className="w-[70%] ml-[30%] bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold">Data Export</button>
          <button className="w-full bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold">Add to Collection</button>
        </div>

      </div>
    </div>
  );
};

import { FiMoreVertical } from "react-icons/fi";

const FilterOption = ({ label }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1 text-white  pr-3 mr-4 hover:text-gray-300"
      >
        <span className=" my-font-family-evogria tracking-wider text-[1.3em]">{label}</span>
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





function DataViewPage() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const exportToCSV = useCSVExport();
  const [pending, setPending] = useState(false);
  const [postData, setPostData] = useState([]);
  let urlLocation = useLocation();
  const [posts, setPost] = useState([]);
  const collectionOn = useSelector((state) => state.collection.collectionOn);
  const collectionIdNew = useSelector((state) => state.collection.collectionId);
  const collectionName = useSelector((state) => state.collection.collectionName);
  const searchEmpty = useSelector((state) => state.globalSearch.searchValueEmpty);
  const searchValue = useSelector((state) => state.globalSearch.searchValue);
  const searchParams = new URLSearchParams(urlLocation.search);
  const collectionId = searchParams.get("collection") || "0";
  const dispatch = useDispatch();
  let navigate = useHistory();
  // State for filters
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [locationFilter, setLocationFilter] = useState({
    latitude: null,
    longitude: null,
    range: null,
  });
  const [selectedPosters, setSelectedPosters] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedSubtags, setSelectedSubtags] = useState([]);
  const [selectedPriorityLevels, setSelectedPriorityLevels] = useState([]);
  const [selectedAccessLevels, setSelectedAccessLevels] = useState([]);
  // Add new state variables
const [showAddToCollectionBulk, setAddToCollectionBulk] = useState(false);

const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
const [advancedFilters, setAdvancedFilters] = useState({
  dateTime: null,
  year: '',
  month: '',
  day: '',
  time: '',
  keyword: ''
});


  const uniquePosters = [...new Set(posts.map(post => post.created_by_name))];
  const uniquePriorityLevels = [...new Set(posts.map(post => post.priority_level))];
  const uniqueAccessLevels = [...new Set(posts.map(post => post.access_level))];
  const uniqueSubcategories = [...new Set(posts.map(post => post.sub_category_name))];
  const uniqueSubtags = [...new Set(posts.map(post => post.sub_tag))];

  const [filteredPosts, setFilteredPosts] = useState(posts);
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const doExportToCSV = () => {
    exportToCSV(filteredPosts, 'data.csv');
  };

  // Sorting logic
  const sortedPosts = useMemo(() => {
    if (!sortConfig.key) return filteredPosts;

    return [...filteredPosts].sort((a, b) => {
      const safeCompare = (valA, valB) => {
        const aVal = valA || '';
        const bVal = valB || '';
        return aVal.localeCompare(bVal);
      };

      switch (sortConfig.key) {
        case 'created_at':
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;

        case 'alphabetical':
          return sortConfig.direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);

        case 'created_by_name':
          return sortConfig.direction === 'asc'
            ? safeCompare(a.created_by_name, b.created_by_name)
            : safeCompare(b.created_by_name, a.created_by_name);

        case 'category':
          const categoryCompare = safeCompare(a.category_name, b.category_name);
          if (categoryCompare !== 0) return categoryCompare;
          return safeCompare(a.sub_category_name, b.sub_category_name);

        case 'tags':
          const tagCompare = safeCompare(a.tag, b.tag);
          if (tagCompare !== 0) return tagCompare;
          return safeCompare(a.sub_tag, b.sub_tag);


        case 'priority_level':
          return sortConfig.direction === 'asc'
            ? (a.priority_level || 0) - (b.priority_level || 0)
            : (b.priority_level || 0) - (a.priority_level || 0);

        case 'assignment_person_name':
          return sortConfig.direction === 'asc'
            ? safeCompare(a.assignment_person_name, b.assignment_person_name)
            : safeCompare(b.assignment_person_name, a.assignment_person_name);

        default:
          return 0;
      }
    });
  }, [filteredPosts, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      if (['created_at', 'priority_level'].includes(key)) {
        direction = 'desc';
      }
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let deployment = localStorage.getItem("deployment");
    if (deployment && deployment !== undefined) {
      if (collectionId == "0") {
        getPostData(JSON.parse(deployment).id);
      } else {
        getCollectionPostData(collectionId);
      }
    }
  }, []);

  useEffect(() => {
    let deployment = localStorage.getItem("deployment");
    if (deployment && deployment !== undefined) {
      if (collectionId == "0" || collectionIdNew == "0") {
        getPostData(JSON.parse(deployment).id);
      } else {
        getCollectionPostData(collectionIdNew);
      }
    }
  }, [collectionIdNew, collectionOn]);

  const getPostData = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get("getPostData/" + deployment_id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (response?.data) {
        let dData = response?.data?.posts;
        setPost(dData);
        setPending(false);
      }
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };

  const getCollectionPostData = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get(
        "getCollectionPostData/" + deployment_id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (response?.data) {
        let dData = response?.data?.posts;
        setPost(dData);
        setPending(false);
      }
    } catch (err) {
      console.error(err);
      setPending(false);
    }
  };



  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const R = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const filtered = posts.filter((post) => {
      const surveyMatch =
        selectedSurveys.length === 0 ||
        selectedSurveys.includes(post.name_of_survey);

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(post.category_name);

      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(post.status);

      const postDate = new Date(post.created_at).setHours(0, 0, 0, 0);
      const startDate = dateRange[0]
        ? new Date(dateRange[0]).setHours(0, 0, 0, 0)
        : null;
      const endDate = dateRange[1]
        ? new Date(dateRange[1]).setHours(0, 0, 0, 0)
        : null;

      const dateMatch =
        (!startDate || postDate >= startDate) &&
        (!endDate || postDate <= endDate);

      const locationMatch =
        !locationFilter.latitude ||
        !locationFilter.longitude ||
        !locationFilter.range ||
        haversineDistance(
          locationFilter.latitude,
          locationFilter.longitude,
          parseFloat(post.latitude),
          parseFloat(post.longitude)
        ) <= locationFilter.range;

      const searchMatch =
        searchEmpty ||
        (searchValue &&
          (post.title?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.description?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.name_of_survey?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.category_name?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.created_by_name?.toLowerCase()?.includes(searchValue.toLowerCase())));

      const posterMatch = selectedPosters.length === 0 ||
        selectedPosters.includes(post.created_by_name);

      const subcategoryMatch = selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(post.sub_category_name);

      const subtagMatch = selectedSubtags.length === 0 ||
        selectedSubtags.includes(post.sub_tag);

      const priorityMatch = selectedPriorityLevels.length === 0 ||
        selectedPriorityLevels.includes(post.priority_level);

      const accessMatch = selectedAccessLevels.length === 0 ||
        selectedAccessLevels.includes(post.access_level);
// New advanced filters
const dateTimeMatch = !advancedFilters.dateTime || 
new Date(post.created_at) >= new Date(advancedFilters.dateTime);

const keywordMatch = !advancedFilters.keyword || 
Object.keys(post).some(key => {
  if (key === 'post_values') {
    return post[key].some(item => 
      // item.field_name.toLowerCase().includes(advancedFilters.keyword.toLowerCase()) ||
      item.field_value.toLowerCase().includes(advancedFilters.keyword.toLowerCase())
    );
  }
  const value = post[key];
  return typeof value === 'string' && 
    value.toLowerCase().includes(advancedFilters.keyword.toLowerCase());
});

 // NEW ADVANCED FILTERS
 const postDate2 = new Date(post.created_at);
    
 // Year filter
 if (advancedFilters.year && postDate2.getFullYear() !== parseInt(advancedFilters.year)) return false;
 
 // Month filter (1-12)
 if (advancedFilters.month && (postDate2.getMonth() + 1) !== parseInt(advancedFilters.month)) return false;
 
 // Day filter
 if (advancedFilters.day && postDate2.getDate() !== parseInt(advancedFilters.day)) return false;
 
 // Time filter
 if (advancedFilters.time) {
   const [filterHours, filterMinutes] = advancedFilters.time.split(':').map(Number);
   const postHours = postDate2.getHours();
   const postMinutes = postDate2.getMinutes();
   
   if (postHours !== filterHours || postMinutes !== filterMinutes) return false;
 }

 // Keyword search (include post_values)
 if (advancedFilters.keyword) {
   const searchTerm = advancedFilters.keyword.toLowerCase();
   const matchesMainFields = Object.entries(post).some(([key, value]) => {
     if (key === 'post_values') return false; // Handle separately
     return String(value).toLowerCase().includes(searchTerm);
   });

   const matchesPostValues = post.post_values?.some(item => 
     item.field_name?.toLowerCase().includes(searchTerm) ||
     item.field_value?.toLowerCase().includes(searchTerm)
   );

   if (!matchesMainFields && !matchesPostValues) return false;
 }

 return (
   surveyMatch &&
   categoryMatch &&
   statusMatch &&
   dateMatch &&
   locationMatch &&
   searchMatch &&
   posterMatch &&
   subcategoryMatch &&
   subtagMatch &&
   priorityMatch &&
   accessMatch
   
 );
});
    //   return (
    //     surveyMatch &&
    //     categoryMatch &&
    //     statusMatch &&
    //     dateMatch &&
    //     locationMatch &&
    //     searchMatch &&
    //     posterMatch &&
    //     subcategoryMatch &&
    //     subtagMatch &&
    //     priorityMatch &&
    //     accessMatch &&
    //     dateTimeMatch &&
    //   keywordMatch
    //   )
    // });

    setFilteredPosts(filtered);
  }, [selectedSurveys, selectedCategories, selectedStatuses, dateRange, locationFilter, selectedPosters, selectedSubcategories, selectedSubtags, selectedPriorityLevels,
    selectedAccessLevels, posts, searchEmpty, searchValue, advancedFilters]);

  // Handle checkbox changes
  const handleSurveyChange = (survey) => {
    setSelectedSurveys((prev) =>
      prev.includes(survey)
        ? prev.filter((s) => s !== survey) // Uncheck
        : [...prev, survey] // Check
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category) // Uncheck
        : [...prev, category] // Check
    );
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status) // Uncheck
        : [...prev, status] // Check
    );
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
  };

  // Add filter handlers
  const handlePosterChange = (poster) => {
    setSelectedPosters(prev =>
      prev.includes(poster) ? prev.filter(p => p !== poster) : [...prev, poster]
    );
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategory) ? prev.filter(s => s !== subcategory) : [...prev, subcategory]
    );
  };

  const handleSubtagChange = (subtag) => {
    setSelectedSubtags(prev =>
      prev.includes(subtag) ? prev.filter(s => s !== subtag) : [...prev, subtag]
    );
  };

  const handlePriorityLevelChange = (level) => {
    setSelectedPriorityLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleAccessLevelChange = (level) => {
    setSelectedAccessLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };


  // Clear all filters
  const clearFilters = () => {
    setSelectedSurveys([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setDateRange([null, null]);
    setLocationFilter({ latitude: null, longitude: null, range: null });
    dispatch(removeCollections({ name: "", collectionId: "" }));
    dispatch(toggleSearchValue(""));
    setSelectedPosters([]);
    // setSelectedCategoriesWithSub({});
    // setSelectedTagsWithSub({});
    setSelectedPriorityLevels([]);
    setSelectedAccessLevels([]);
    setAdvancedFilters({ dateTime: null, keyword: '' });
  };

  // Get unique values for filters
  const uniqueSurveys = [...new Set(posts.map((post) => post.name_of_survey))];
  const uniqueCategories = [...new Set(posts.map((post) => post.category_name))];
  const uniqueStatuses = [...new Set(posts.map((post) => post.status))];

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationFilter((prev) => ({
      ...prev,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    }));
  };

  const handleRangeSelect = (event) => {
    setLocationFilter((prev) => ({
      ...prev,
      range: parseFloat(event.target.value),
    }));
  };

  const handlePostUpdateStatus = (id, status) => {
    updateRecordStatus(id, status);
  };

  const handleDelete = (val) => {
    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteRecord(val);
      }
    });
  };

  const deleteRecord = async (idD) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "deletePost",
        JSON.stringify({ id: idD }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecordDelete(idD);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
  };

  const handleRemove = (val, col) => {
    swal({
      title: "Confirm Removal",
      text: "Once Confirmed, Record Will Be Removed",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        removeRecord(val, col);
      }
    });
  };

  const removeRecord = async (idD, collection) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "removePostFromCollection",
        JSON.stringify({ post_id: idD, collection_id: collection }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecordDelete(idD);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
  };

  const updateRecordStatus = async (idD, pStatus) => {
    setPending(true);
    try {
      const results = await axiosInstance.post(
        "publishPost",
        JSON.stringify({ id: idD, status: pStatus }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      if (results?.data?.status === "success") {
        let newData = results?.data?.data;
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "success", msg: results?.data?.message },
          })
        );
        setPending(false);
        updateListRecord(newData);
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      setPending(false);
    }
  };

  const updateListRecord = (updatedRecord) => {
    window.location.replace("/deployment/data_view");
    const index = posts.findIndex((item) => item?.id === updatedRecord.id);
    setPost((prevList) =>
      prevList.map((item, i) => (i === index ? updatedRecord : item))
    );
  };

  const updateListRecordDelete = (id) => {
    const newdata = posts.filter((item) => item.id !== id);
    setPost(newdata);
  };

  const handleAdditionToCollectionBulk = () =>{
       setAddToCollectionBulk(true);
  }
  return (<>
  {/* <FilterTopNav
          selectedCategories={selectedCategories}
          uniqueCategories={uniqueCategories}
          handleCategoryChange={handleCategoryChange}
          selectedStatuses={selectedStatuses}
          uniqueStatuses={uniqueStatuses}
          handleStatusChange={handleStatusChange}
          clearFilters={clearFilters}
          handleLocationSelect={handleLocationSelect}
          setLocationFilter={setLocationFilter}
          locationFilter={locationFilter}
          handleRangeSelect={handleRangeSelect}
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          exportToCSV={doExportToCSV}
          filteredPosts={filteredPosts}
          selectedPosters={selectedPosters}
          uniquePosters={uniquePosters}
          handlePosterChange={handlePosterChange}
          selectedSubcategories={selectedSubcategories}
          uniqueSubcategories={uniqueSubcategories}
          handleSubcategoryChange={handleSubcategoryChange}
          selectedSubtags={selectedSubtags}
          uniqueSubtags={uniqueSubtags}
          handleSubtagChange={handleSubtagChange}
          selectedPriorityLevels={selectedPriorityLevels}
          uniquePriorityLevels={uniquePriorityLevels}
          handlePriorityLevelChange={handlePriorityLevelChange}
          selectedAccessLevels={selectedAccessLevels}
          uniqueAccessLevels={uniqueAccessLevels}
          handleAccessLevelChange={handleAccessLevelChange}
          handleSort={handleSort}
          sortConfig={sortConfig}
          setShowAdvancedSearch={setShowAdvancedSearch}
          addToCollectionBulk={handleAdditionToCollectionBulk}
              /> */}
               <div className="relative  z-42 flex items-center justify- space-x-4 text-sm p-2 pt-4 pl-3">
        <div className="flex my-black-bg px-2 py-2 items-center justify-between pr-5" 
        style={{border:"1px solid #25201a", textDecoration:"none"}}>
          <FilterOption label="FILTER" />
          <FilterOption label="COLLECTION" />
          <FilterOption label="STATUS" />
          <FilterOption label="CATEGORY" />
          <FilterOption label="TAGS" />
          <FilterOption label="LOCATION" />
          <FilterOption label="SORT BY" />
        </div>
        <div className="pl-2">
        <span className="text-gray-400 hover:text-white cursor-pointer font-mono text-[1.6em] pl-3">› Advanced Filter</span>
          
        </div>
      </div>

<div className="flex-1 flex relative my-black-bg ">
      {/* Left Column */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-[300px] my-black-bg  z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${leftOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* <div className="p-4"> */}
          {/* <h3 className="text-lg font-bold mb-4">Left Panel</h3> */}
          {/* Left column content */}
          <div className="flex">
          <SidebarFilterPanel/>
          </div>
        
      </div>

      {/* Middle Column */}
      <div className="flex-1 lg:w-3/5 relative my-black-bg ">
        <div className=" h-full">
          {/* Toggle Buttons Container */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Filters
            </button>

            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          {/* <h2 className="text-2xl font-bold mb-4">Main Content</h2>
          <p className="text-gray-700">
            This is the main content area. It takes up the remaining space and adjusts based on the sidebar's state.
            Add your page content here.
          </p> */}
          {pending && (
                <div className="flex items-center justify-center mb-4">
                  <Spinner animation="grow" variant="warning" className="h-[100px]" />
                </div>
              )}
              <CardView/>
              {/* <MapView/> */}
              {/* <PostList 
                posts={sortedPosts}
                pending={pending}
                deletePost={handleDelete}
                removeFromCollection={handleRemove}
                updatePostStatus={handlePostUpdateStatus}
              /> */}
        </div>

        {/* Overlay for mobile */}
        {(leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          ></div>
        )}
      </div>

      {/* Right Column */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[300px] my-black-bg z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${rightOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        
        <FilterPanel/>
      </div>
    </div>
    </>
  )};

//   return (
//     <>
//       <Card className="strpied-tabled-with-hover pr-3">
//         <Card.Body className="table-full-width table-responsive px-0" style={{ padding: 0 }}>
//           <Row>
//             <Col md="2" className="md:min-h[800px]">
//               <Card.Header>
//                 <Card.Title as="h4">Data View</Card.Title>
//                 <p className="card-category">Results : {filteredPosts?.length}</p>
//                 {(collectionOn && collectionIdNew !== 0) && (
//                   <p className="flex items-start justify-between text-[0.65em]">
//                     <span>Collection "{collectionName}"</span>
//                     <span
//                       className="cursor-pointer underline text-red-600"
//                       onClick={() =>
//                         dispatch(removeCollections({ name: "", collectionId: "" }))
//                       }
//                     >
//                       Clear
//                     </span>
//                   </p>
//                 )}
//               </Card.Header>

//               <div className="text-sm pl-2 font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
//                 <ul className="flex flex-wrap -mb-px">
//                   <li className="me-2">
//                     <a
//                       href="#"
//                       className="inline-block p-4 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
//                       aria-current="page"
//                     >
//                       Surveys({selectedSurveys.length})
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//               <div className="p-2 py-4">
//                 {uniqueSurveys.map((survey) => (
//                   <div
//                     key={survey}
//                     className="flex items-start mb-2 p-2 pt-3 bg-gray-100 cursor-pointer"
//                   >
//                     <div className="flex items-center h-5">
//                       <input
//                         type="checkbox"
//                         checked={selectedSurveys.includes(survey)}
//                         onChange={() => handleSurveyChange(survey)}
//                         className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
//                         required
//                       />
//                     </div>
//                     <label className="ms-2 text-sm font-medium text-black">
//                       {survey}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </Col>
//             <Col md="10" className="p-2 bg-[#f5f5f5]">
//               <FilterTopNav
//                 selectedCategories={selectedCategories}
//                 uniqueCategories={uniqueCategories}
//                 handleCategoryChange={handleCategoryChange}
//                 selectedStatuses={selectedStatuses}
//                 uniqueStatuses={uniqueStatuses}
//                 handleStatusChange={handleStatusChange}
//                 clearFilters={clearFilters}
//                 handleLocationSelect={handleLocationSelect}
//                 setLocationFilter={setLocationFilter}
//                 locationFilter={locationFilter}
//                 handleRangeSelect={handleRangeSelect}
//                 dateRange={dateRange}
//                 handleDateRangeChange={handleDateRangeChange}
//                 exportToCSV={doExportToCSV}
//                 filteredPosts={filteredPosts}
//                 selectedPosters={selectedPosters}
//                 uniquePosters={uniquePosters}
//                 handlePosterChange={handlePosterChange}
//                 selectedSubcategories={selectedSubcategories}
//                 uniqueSubcategories={uniqueSubcategories}
//                 handleSubcategoryChange={handleSubcategoryChange}
//                 selectedSubtags={selectedSubtags}
//                 uniqueSubtags={uniqueSubtags}
//                 handleSubtagChange={handleSubtagChange}
//                 selectedPriorityLevels={selectedPriorityLevels}
//                 uniquePriorityLevels={uniquePriorityLevels}
//                 handlePriorityLevelChange={handlePriorityLevelChange}
//                 selectedAccessLevels={selectedAccessLevels}
//                 uniqueAccessLevels={uniqueAccessLevels}
//                 handleAccessLevelChange={handleAccessLevelChange}
//                 handleSort={handleSort}
//                 sortConfig={sortConfig}
//                 setShowAdvancedSearch={setShowAdvancedSearch}
//                 addToCollectionBulk={handleAdditionToCollectionBulk}
//               />
//               <AdvancedSearchOverlay
//   show={showAdvancedSearch}
//   onClose={() => setShowAdvancedSearch(false)}
//   onApply={() => setShowAdvancedSearch(false)}
//   filters={advancedFilters}
//   setFilters={setAdvancedFilters}
// />
// <AddToCollectionBulkModal
//   show={showAddToCollectionBulk}
//   onClose={() => setAddToCollectionBulk(false)}
  
//   filteredPosts={filteredPosts}
  
// />
    
//               <br />
//               {pending && (
//                 <div className="flex items-center justify-center mb-4">
//                   <Spinner animation="grow" variant="warning" className="h-[100px]" />
//                 </div>
//               )}
//               <PostList 
//                 posts={sortedPosts}
//                 pending={pending}
//                 deletePost={handleDelete}
//                 removeFromCollection={handleRemove}
//                 updatePostStatus={handlePostUpdateStatus}
//               />
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>
//     </>
//   );
// }

export default DataViewPage;