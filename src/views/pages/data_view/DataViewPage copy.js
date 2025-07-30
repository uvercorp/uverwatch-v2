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

function DataViewPage() {
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


  return (
    <>
      <Card className="strpied-tabled-with-hover pr-3">
        <Card.Body className="table-full-width table-responsive px-0" style={{ padding: 0 }}>
          <Row>
            <Col md="2" className="md:min-h[800px]">
              <Card.Header>
                <Card.Title as="h4">Data View</Card.Title>
                <p className="card-category">Results : {filteredPosts?.length}</p>
                {(collectionOn && collectionIdNew !== 0) && (
                  <p className="flex items-start justify-between text-[0.65em]">
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
              </Card.Header>

              <div className="text-sm pl-2 font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px">
                  <li className="me-2">
                    <a
                      href="#"
                      className="inline-block p-4 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                      aria-current="page"
                    >
                      Surveys({selectedSurveys.length})
                    </a>
                  </li>
                </ul>
              </div>
              <div className="p-2 py-4">
                {uniqueSurveys.map((survey) => (
                  <div
                    key={survey}
                    className="flex items-start mb-2 p-2 pt-3 bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedSurveys.includes(survey)}
                        onChange={() => handleSurveyChange(survey)}
                        className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                        required
                      />
                    </div>
                    <label className="ms-2 text-sm font-medium text-black">
                      {survey}
                    </label>
                  </div>
                ))}
              </div>
            </Col>
            <Col md="10" className="p-2 bg-[#f5f5f5]">
              <FilterTopNav
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
              />
              <AdvancedSearchOverlay
  show={showAdvancedSearch}
  onClose={() => setShowAdvancedSearch(false)}
  onApply={() => setShowAdvancedSearch(false)}
  filters={advancedFilters}
  setFilters={setAdvancedFilters}
/>
<AddToCollectionBulkModal
  show={showAddToCollectionBulk}
  onClose={() => setAddToCollectionBulk(false)}
  
  filteredPosts={filteredPosts}
  
/>
    
              <br />
              {pending && (
                <div className="flex items-center justify-center mb-4">
                  <Spinner animation="grow" variant="warning" className="h-[100px]" />
                </div>
              )}
              <PostList 
                posts={sortedPosts}
                pending={pending}
                deletePost={handleDelete}
                removeFromCollection={handleRemove}
                updatePostStatus={handlePostUpdateStatus}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}

export default DataViewPage;