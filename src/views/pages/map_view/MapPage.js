import { React, useState, useEffect, useMemo } from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Container,
  Row,
  Col,
  Tab
} from "react-bootstrap";

import { useLocation, useHistory } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import axiosInstance from "services/axios";
import { login, logout, selectUser } from 'provider/features/userSlice';
import Spinner from 'react-bootstrap/Spinner';
import { addCollections, removeCollections } from 'provider/features/collectionSlice';
import { toggleSearchValue } from "provider/features/globalSearchSlice"
import { selectedSingleData, setSelectedSingleData } from 'provider/features/helperSlice';

import { CiEdit } from "react-icons/ci";
import { FaShare } from "react-icons/fa";
import MapDisplay from "./MapDisplay";
import FilterTopNav from "../data_view/FilterTopNav";
import useCSVExport from "hooks/useCSVExport";
import AdvancedSearchOverlay from "../data_view/options/AdvancedSearchOverlay";
import AddToCollectionBulkModal from "../data_view/options/AddToCollectionBulkModal";
import LeftFilterPanel from "../data_view/filter/LeftFilterPanel"
import RightFilterPanel from "../data_view/filter/RightFilterPanel"


function MapPage() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const exportToCSV = useCSVExport();
  const [pending, setPending] = useState(false);

  const [postData, setPostData] = useState([]);
  const [posts, setPost] = useState([]);
  const [deploymentId, setDeploymentId] = useState();

  const collectionOn = useSelector((state) => state.collection.collectionOn);
  const collectionIdNew = useSelector((state) => state.collection.collectionId);
  const collectionName = useSelector((state) => state.collection.collectionName);
  const searchEmpty = useSelector((state) => state.globalSearch.searchValueEmpty);
  const searchValue = useSelector((state) => state.globalSearch.searchValue);
  let urlLocation = useLocation();
  const searchParams = new URLSearchParams(urlLocation.search);
  const collectionId = searchParams.get('collection') || '0';
  const doExportToCSV = () => {
    exportToCSV(filteredPosts, 'data.csv');

  }
  const dispatch = useDispatch();
  let navigate = useHistory();
  const handleSelect = (eventKey) => alert(`selected ${eventKey}`);

  const handleReadMore = (record) => {
    dispatch(setSelectedSingleData({ record }));
    navigate.push('/deployment/detailed?type=' + (record.is_entity === "true" ? "entity" : "post") + "&id=" + record.id);

  }
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {
      setDeploymentId(JSON.parse(deployment).id);
      if (collectionId == "0") {
        getPostData(JSON.parse(deployment).id);

      } else {
        getCollectionPostData(collectionId);
      }
    }

  }, []);
  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
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
      const response = await axiosInstance.get('getPostDataMap/' + deployment_id,
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
      if (response?.data) {
        let dData = response?.data?.posts;
        // setPostData(dData);
        setPost(dData);
        // console.log(dData);
        setPending(false);

      }
    } catch (err) {

      //   if (!err?.response) {
      //   dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))
      // } else if (err.response?.status === 400) {
      //    dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:loginErrors}}))
      // } else if (err.response?.status === 401) {
      //   dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:err?.response.data['detail']}}))

      // } else {

      //   dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))

      // }

    }



  }
  const getCollectionPostData = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get('getCollectionPostData/' + deployment_id,
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
      if (response?.data) {
        let dData = response?.data?.posts;
        // setPostData(dData);
        setPost(dData);
        // console.log(dData);
        setPending(false);

      }
    } catch (err) {


    }



  }
  // State for filters
  const [selectedSurveys, setSelectedSurveys] = useState([]);
   const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  // const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [dateRange, setDateRange] = useState([null, null]); // [startDate, endDate]
  const [timeRange, setTimeRange] = useState(['', '']);
const [selectedDays, setSelectedDays] = useState([]); // e.g., ['MON', 'TUE']
  const [locationFilter, setLocationFilter] = useState({
    latitude: null,
    longitude: null,
    range: null, // Range in kilometers
  });
  // Inside DataViewPage component
  const [selectedPosters, setSelectedPosters] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
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
  const uniqueTags = [
    ...new Set(
      posts.flatMap(post =>
        post.tags
          ? post.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : []
      )
    )
  ];
  const uniqueSubtags = [...new Set(posts.map(post => post.sub_tag))];

  // State for filtered posts
  const [filteredPosts, setFilteredPosts] = useState(posts);
  // Haversine formula to calculate distance
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Update filtered posts whenever filters change
  useEffect(() => {
    const filtered = posts.filter((post) => {
      // Filter by surveys
      const surveyMatch =
        selectedSurveys.length === 0 ||
        selectedSurveys.includes(post.name_of_survey);
      const EntityMatch =
        selectedEntities.length === 0 ||
        selectedEntities.includes(post.name_of_survey);

      // Filter by categories
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(post.category_name) ||
        selectedCategories.includes(post.entity_type_name);

        const tagMatch =
  selectedTags.length === 0 ||
  selectedTags.some(tag => post.tags?.split(',').map(t => t.trim()).includes(tag));

      // Filter by statuses
      const statusMatch =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(post.status) ||
      selectedStatuses.includes(post.post_status_name);
      // Filter by date range
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

        // Time range filter
const postDateTime = new Date(post.created_at);
const postTimeStr = postDateTime.toTimeString().slice(0, 5).replace(':', ''); // e.g., "1430"

const timeStart = timeRange[0];
const timeEnd = timeRange[1];

const timeMatch =
  !timeStart || !timeEnd ||
  (postTimeStr >= timeStart && postTimeStr <= timeEnd);

// Day of the week filter
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const postDay = daysOfWeek[postDateTime.getDay()];

const dayMatch =
  selectedDays.length === 0 || selectedDays.includes(postDay);


      // Filter by location
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

      // Filter by search value
      const searchMatch =
        searchEmpty ||
        (searchValue &&
          (post.title?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.description?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.name_of_survey?.toLowerCase()?.includes(searchValue.toLowerCase()) ||
            post.category_name?.toLowerCase()?.includes(searchValue.toLowerCase())));

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
        EntityMatch &&
        categoryMatch &&
        statusMatch &&
        dateMatch &&
        timeMatch &&
        dayMatch &&
        locationMatch &&
        searchMatch &&
        posterMatch &&
        subcategoryMatch &&
        subtagMatch &&
        priorityMatch &&
        tagMatch &&
        accessMatch

      );
    });




    setFilteredPosts(filtered);
  }, [selectedSurveys, selectedCategories,selectedTags, selectedStatuses, dateRange, locationFilter, selectedPosters, selectedSubcategories, selectedSubtags, selectedPriorityLevels,
    selectedAccessLevels, posts, searchEmpty, searchValue, advancedFilters]);
  // Handle checkbox changes
  const handleSurveyChange = (survey) => {
    setSelectedSurveys((prev) =>
      prev.includes(survey)
        ? prev.filter((s) => s !== survey) // Uncheck
        : [...prev, survey] // Check
    );
  };
   // Handle checkbox entities
   const handleEntityChange = (survey) => {
    setSelectedEntities((prev) =>
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

  const handleTagChange = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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
  // Handle date range change
  const handleDateRangeChange = (dates) => {

    const [start, end] = dates;
    //  alert(start+"  "+end)
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
    setSelectedTags([]);
    setSelectedStatuses([]);
    setDateRange([null, null]);
    setLocationFilter({ latitude: null, longitude: null, range: null });
    dispatch(removeCollections({ name: '', collectionId: '' }));
    dispatch(toggleSearchValue(""));
    setSelectedPosters([]);
    // setSelectedCategoriesWithSub({});
    // setSelectedTagsWithSub({});
    setSelectedPriorityLevels([]);
    setSelectedAccessLevels([]);
    setAdvancedFilters({ dateTime: null, keyword: '' });
    setTimeRange(['', '']);
  setSelectedDays([]);
  };
  // Get unique values for filters
  const uniqueSurveys = [
    ...new Set(
      posts
        .filter((post) => post.is_entity === 'false')
        .map((post) => post.name_of_survey)
    ),
  ];
  const uniqueEntities = [
    ...new Set(
      posts
        .filter((post) => post.is_entity === 'true')
        .map((post) => post.name_of_survey)
    ),
  ];
  // const uniqueCategories = [...new Set(posts.map((post) => post.category_name))];
  const uniqueCategories = [...new Set(
    posts.flatMap(post => [post.category_name, post.entity_type_name])
        .filter(value => value) // Keeps only truthy (non-empty) values
)];

  const uniqueStatuses = [...new Set(
    posts.flatMap(post => [post.status, post.post_status_name])
  )];

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationFilter((prev) => ({
      ...prev,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    }))
  };

  const handleRangeSelect = (event) => {
    // alert(parseFloat(event.target.value));
    setLocationFilter((prev) => ({
      ...prev,
      range: parseFloat(event.target.value),
    }))
  }

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

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
  const handleAdditionToCollectionBulk = () => {
    setAddToCollectionBulk(true);
  }

  const onApplyPreset = (p) => {
    if (!p) return;
    setSelectedSurveys(p.selectedSurveys || []);
    setSelectedEntities(p.selectedEntities || []);
    setSelectedCategories(p.selectedCategories || []);
    setSelectedTags(p.selectedTags || []);
    setSelectedStatuses(p.selectedStatuses || []);
    setDateRange(p.dateRange || [null, null]);
    setTimeRange(p.timeRange || ["", ""]);
    setSelectedDays(p.selectedDays || []);
    setLocationFilter(p.locationFilter || { latitude: null, longitude: null, range: null });
    setSelectedPosters(p.selectedPosters || []);
    setSelectedSubcategories(p.selectedSubcategories || []);
    setSelectedSubtags(p.selectedSubtags || []);
    setSelectedPriorityLevels(p.selectedPriorityLevels || []);
    setSelectedAccessLevels(p.selectedAccessLevels || []);
    setAdvancedFilters(p.advancedFilters || { dateTime: null, keyword: '' });
    setSortConfig(p.sortConfig || { key: null, direction: 'asc' });
  };


  return (
    <>
    <div className="hidden md:block">
      <FilterTopNav
          viewKey={"map_view"}
          onApplyPreset={onApplyPreset}
          selectedSurveys={selectedSurveys}
          selectedEntities={selectedEntities}
          selectedCategories={selectedCategories}
          uniqueCategories={uniqueCategories}
          handleCategoryChange={handleCategoryChange}
          selectedTags={selectedTags}
          uniqueTags={uniqueTags}
          handleTagChange={handleTagChange}
          selectedStatuses={selectedStatuses}
          uniqueStatuses={uniqueStatuses}
          handleStatusChange={handleStatusChange}
          clearFilters={clearFilters}
          handleLocationSelect={handleLocationSelect}
          setLocationFilter={setLocationFilter}
          locationFilter={locationFilter}
          handleRangeSelect={handleRangeSelect}
          dateRange={dateRange}
          timeRange={timeRange}

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
          selectedDays={selectedDays}
          rightOpen={rightOpen}
          setRightOpen = {setRightOpen}
              />
              </div>



<div className="flex-1 flex relative my-black-bg ">
      {/* Left Column */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-[300px] my-black-bg  z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${leftOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* <div className="p-4"> */}
          {/* <h3 className="text-lg font-bold mb-4">Left Panel</h3> */}
          {/* Left column content */}
          {(collectionOn && collectionIdNew !== 0) && (
                  <p className="flex items-start justify-between text-[0.65em] text-white pl-4">
                    <span>Collection "{collectionName}"</span>
                    <span
                      className="cursor-pointer underline text-red-600"
                      onClick={() =>
                        dispatch(removeCollections({ name: "", collectionId: "" }))
                      }
                    >
                      Clear
                    </span>
                  </p>
                )}
          <div className="flex">
          <LeftFilterPanel handleSurveyChange={handleSurveyChange} handleEntityChange={handleEntityChange} selectedSurveys={selectedSurveys} selectedEntities={selectedEntities} uniqueEntities={uniqueEntities} uniqueSurveys={uniqueSurveys}/>
          {/* <LeftF */}
          </div>

      </div>

      {/* Middle Column */}
      <div
    className={`relative my-black-bg transition-all duration-300 ${
      !leftOpen && !rightOpen ? "w-full" :
      leftOpen && rightOpen ? "lg:w-3/5" :
      "lg:w-4/5"
    }`}
  >
        <div className=" h-full">
          {/* Toggle Buttons Container */}
          {/* <div className="lg:hidden flex justify-between items-center mb-4">
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
          </div> */}

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
              {/* <CardView/> */}
              {/* <MapView/> */}
              {/* <MapDisplay
                posts={sortedPosts}
                pending={pending}
                deletePost={handleDelete}
                removeFromCollection={handleRemove}
                updatePostStatus={handlePostUpdateStatus}
              /> */}
              <MapDisplay posts={filteredPosts} pending={pending} className="mt-4" deployment_id={deploymentId} handleReadMore={handleReadMore}/>
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
      <div
    className={`fixed inset-y-0 right-0 w-full max-w-[300px] my-black-bg z-40 shadow-xl transform transition-transform duration-300 lg:relative lg:w-1/5 ${
      rightOpen ? "translate-x-0" : "translate-x-full lg:w-0 lg:max-w-0"
    }`}
  >

        <RightFilterPanel
         exportToCSV={doExportToCSV}
         addToCollectionBulk={handleAdditionToCollectionBulk}
         filters={advancedFilters}
         setFilters={setAdvancedFilters}
         handleDateRangeChange={handleDateRangeChange}
         timeRange={timeRange}
         setTimeRange={setTimeRange}
         selectedDays={selectedDays}
         setSelectedDays={setSelectedDays}
         />
      </div>
    </div>
    <AddToCollectionBulkModal
  show={showAddToCollectionBulk}
  onClose={() => setAddToCollectionBulk(false)}

  filteredPosts={filteredPosts}

/>
  </>);
}

export default MapPage;
