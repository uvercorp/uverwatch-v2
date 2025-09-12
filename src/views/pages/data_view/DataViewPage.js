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
import {
  addCollections,
  removeCollections,
} from "provider/features/collectionSlice";
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
import MapView from "./MapView";
import LeftFilterPanel from "./filter/LeftFilterPanel";
import RightFilterPanel from "./filter/RightFilterPanel";

const Section = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">{title}</h3>
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item}
          className="text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const AdvancedFilter = () => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">
      Advanced Filter
    </h3>
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search"
        className="w-full px-2 py-1 border rounded-md"
      />

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span>Time Zone</span>
        <span>UTC +1</span>
        <span className="col-span-2 text-xs text-gray-400">
          @@ UPC000 = ONE
        </span>

        <span>Date Range</span>
        <span>28.02.25 - 31.12.25</span>
        <span className="col-span-2 text-xs text-gray-400">
          @@ 24.01.18 to 24.01.25
        </span>

        <span>Time Range</span>
        <span>0809HRS - 2359HRS</span>
        <span className="col-span-2 text-xs text-gray-400">
          @@ 1500HRS to 2300HRS
        </span>
      </div>

      <div className="text-sm">
        <p>Days of the Week</p>
        <p className="text-xs text-gray-500 mt-1">
          SERV MORE YOUR NEED THUS TALK SAFE
        </p>
      </div>
    </div>
  </div>
);

const AreaFilter = () => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">Area Filter</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span>Playback Frequency</span>
        <span>15 mins</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Playback Speed</span>
        <span>1x</span>
      </div>
    </div>
  </div>
);

const SavePresets = () => (
  <div>
    <h3 className="text-sm font-semibold text-gray-500 mb-2">Save Presets</h3>
    <div className="flex gap-2">
      <button className="flex-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm">
        Data Export
      </button>
      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
        Add to Collection
      </button>
    </div>
  </div>
);

const MyCard = ({
  title,
  date,
  time,
  summary,
  location,
  tags,
  status,
  bgColor,
  hoverBgColor,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`relative p-3  mb-4  text-white transition-colors duration-300 bg-[#1F2F3F] hover:bg-[#3F1F2F]`}
    >
      {/* Title & Menu */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-extrabold my-font-family-courier-prime uppercase tracking-wide p-0 ">
          {title}
        </h2>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-300 hover:text-white text-lg"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-600 text-sm z-10 rounded shadow">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                View
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                Edit
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                Delete
              </button>
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
          <span key={index} className="mr-2 font-semibold">
            {item}
          </span>
        ))}
      </div>

      {/* Tags */}
      <div className="text-xs text-gray-400">Tagged: {tags.join(", ")}</div>
    </div>
  );
};

const CardView = () => {
  return (
    <div className="px-4 pb-2 pt-1 bg-black min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">
          CARD VIEW
        </h1>
        <div className="pt-0">
          <button className="px-3 pt-0 py-2 border bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">
            Load Presets:
          </button>
          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">
            Reports [271]
          </button>
        </div>
      </div>
      <div className="max-h-[90vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <MyCard
          title="TITLE OF SPECIFIC THING IN CAPS..."
          date="28.02.25"
          time="0800"
          summary="This is where the detailed summary is supposed to go lorem ipsum dolor set amet ramulus piiple a uma law crimun astoria um. lorem ipsum dolor set amet."
          location="Tamale, 2.338646 6.451776, -2.333154 5.872868"
          status={["★ High", "☣ Severe", "⚡ Active"]}
          tags={["Cool", "Gym", "Crossfit", "Idea"]}
          bgColor="bg-[#1F2F3F]"
          hoverBgColor="bg-[#1f2f3c]"
        />

        <MyCard
          title="TITLE OF SPECIFIC ON HOVER..."
          date="28.02.25"
          time="0800"
          summary="This is where the detailed summary is supposed to go lorem ipsum dolor set amet ramulus piiple a uma law crimun astoria um. lorem ipsum dolor set amet."
          location="Tamale, 2.338646 6.451776, -2.333154 5.872868"
          status={["★ High", "☣ Severe", "⚡ Active"]}
          tags={["Cool", "Gym", "Crossfit", "Idea"]}
          bgColor="bg-[#3F1F2F]"
          hoverBgColor="bg-[#3F1F2F]"
        />
      </div>
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
  const collectionName = useSelector(
    (state) => state.collection.collectionName
  );
  const searchEmpty = useSelector(
    (state) => state.globalSearch.searchValueEmpty
  );
  const searchValue = useSelector((state) => state.globalSearch.searchValue);
  const searchParams = new URLSearchParams(urlLocation.search);
  const collectionId = searchParams.get("collection") || "0";
  const dispatch = useDispatch();
  let navigate = useHistory();
  // State for filters
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedRange, setSelectedRange] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [timeRange, setTimeRange] = useState(["", ""]);
  // const [timeRange, setTimeRange] = useState(['0800', '2359']);
  const [selectedDays, setSelectedDays] = useState([]); // e.g., ['MON', 'TUE']
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
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateTime: null,
    year: "",
    month: "",
    day: "",
    time: "",
    keyword: "",
  });

  const uniquePosters = [...new Set(posts.map((post) => post.created_by_name))];
  const uniquePriorityLevels = [
    ...new Set(posts.map((post) => post.priority_level)),
  ];
  const uniqueAccessLevels = [
    ...new Set(posts.map((post) => post.access_level)),
  ];
  const uniqueSubcategories = [
    ...new Set(posts.map((post) => post.sub_category_name)),
  ];

 // Helper function for proper capitalization (optional)
 function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

  // Helper function to count occurrences and sort by population
  const getSortedItemsByCount = (items, getItemCount) => {
    const itemCounts = {};
    items.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + getItemCount(item);
    });

    return Object.keys(itemCounts)
      .sort((a, b) => itemCounts[b] - itemCounts[a])
      .filter(item => item); // Remove empty/null items
  };

  // Get all tags and count their occurrences
  const allTags = posts.flatMap(post =>
    post.tags
      ? post.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)
      : []
  );
  const uniqueTags = getSortedItemsByCount(allTags, (tag) => 1)
    .map(tag => capitalizeFirstLetter(tag)); // Optional: restore capitalization



  const uniqueSubtags = [...new Set(posts.map((post) => post.sub_tag))];

  const [filteredPosts, setFilteredPosts] = useState(posts);
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  // Bulk selection state
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [showAddToCollectionBulkSelected, setShowAddToCollectionBulkSelected] = useState(false);

  const doExportToCSV = () => {
    exportToCSV(filteredPosts, "data.csv");
  };

  // Sorting logic
  const sortedPosts = useMemo(() => {
    if (!sortConfig.key) return filteredPosts;

    return [...filteredPosts].sort((a, b) => {
      const safeCompare = (valA, valB) => {
        const aVal = valA || "";
        const bVal = valB || "";
        return aVal.localeCompare(bVal);
      };

      switch (sortConfig.key) {
        case "created_at":
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;

        case "alphabetical":
          return sortConfig.direction === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);

        case "created_by_name":
          return sortConfig.direction === "asc"
            ? safeCompare(a.created_by_name, b.created_by_name)
            : safeCompare(b.created_by_name, a.created_by_name);

        case "category":
          const categoryCompare = safeCompare(a.category_name, b.category_name);
          if (categoryCompare !== 0) return categoryCompare;
          return safeCompare(a.sub_category_name, b.sub_category_name);

        case "tags":
          const tagCompare = safeCompare(a.tag, b.tag);
          if (tagCompare !== 0) return tagCompare;
          return safeCompare(a.sub_tag, b.sub_tag);

        case "priority_level":
          return sortConfig.direction === "asc"
            ? (a.priority_level || 0) - (b.priority_level || 0)
            : (b.priority_level || 0) - (a.priority_level || 0);

        case "assignment_person_name":
          return sortConfig.direction === "asc"
            ? safeCompare(a.assignment_person_name, b.assignment_person_name)
            : safeCompare(b.assignment_person_name, a.assignment_person_name);

        default:
          return 0;
      }
    });
  }, [filteredPosts, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      if (["created_at", "priority_level"].includes(key)) {
        direction = "desc";
      }
    }
    setSortConfig({ key, direction });
  };

  // Selection helpers
  const toggleSelectPost = (postId) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const selectPostsOnPage = (pagePostIds, shouldSelect) => {
    setSelectedPostIds((prev) => {
      if (shouldSelect) {
        const merged = new Set([...prev, ...pagePostIds]);
        return Array.from(merged);
      }
      const pageSet = new Set(pagePostIds);
      return prev.filter((id) => !pageSet.has(id));
    });
  };

  const selectAllFiltered = () => {
    setSelectedPostIds(filteredPosts.map((p) => p.id));
  };

  const clearSelection = () => setSelectedPostIds([]);

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
      const EntityMatch =
        selectedEntities.length === 0 ||
        selectedEntities.includes(post.name_of_survey);

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(post.category_name) ||
        selectedCategories.includes(post.entity_type_name);

        const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.some(tag => post.tags?.split(',').map(t => t.trim()).includes(tag));

      // const statusMatch =
      //   selectedStatuses.length === 0 || selectedStatuses.includes(post.status);
      const statusMatch =
  selectedStatuses.length === 0 ||
  selectedStatuses.includes(post.status) ||
  selectedStatuses.includes(post.flagged_status) ||
  selectedStatuses.includes(post.post_status_name);

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
      const postTimeStr = postDateTime
        .toTimeString()
        .slice(0, 5)
        .replace(":", ""); // e.g., "1430"

      const timeStart = timeRange[0];
      const timeEnd = timeRange[1];

      const timeMatch =
        !timeStart ||
        !timeEnd ||
        (postTimeStr >= timeStart && postTimeStr <= timeEnd);

      // Day of the week filter
      const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const postDay = daysOfWeek[postDateTime.getDay()];

      const dayMatch =
        selectedDays.length === 0 || selectedDays.includes(postDay);

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
            post.description
              ?.toLowerCase()
              ?.includes(searchValue.toLowerCase()) ||
            post.name_of_survey
              ?.toLowerCase()
              ?.includes(searchValue.toLowerCase()) ||
            post.category_name
              ?.toLowerCase()
              ?.includes(searchValue.toLowerCase()) ||
            post.created_by_name
              ?.toLowerCase()
              ?.includes(searchValue.toLowerCase())));

      const posterMatch =
        selectedPosters.length === 0 ||
        selectedPosters.includes(post.created_by_name);

      const subcategoryMatch =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(post.sub_category_name);

      const subtagMatch =
        selectedSubtags.length === 0 || selectedSubtags.includes(post.sub_tag);

      const priorityMatch =
        selectedPriorityLevels.length === 0 ||
        selectedPriorityLevels.includes(post.priority_level);

      const accessMatch =
        selectedAccessLevels.length === 0 ||
        selectedAccessLevels.includes(post.access_level);
      // New advanced filters
      const dateTimeMatch =
        !advancedFilters.dateTime ||
        new Date(post.created_at) >= new Date(advancedFilters.dateTime);

      const keywordMatch =
        !advancedFilters.keyword ||
        Object.keys(post).some((key) => {
          if (key === "post_values") {
            return post[key].some((item) =>
              // item.field_name.toLowerCase().includes(advancedFilters.keyword.toLowerCase()) ||
              item.field_value
                .toLowerCase()
                .includes(advancedFilters.keyword.toLowerCase())
            );
          }
          const value = post[key];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(advancedFilters.keyword.toLowerCase())
          );
        });

      // NEW ADVANCED FILTERS
      const postDate2 = new Date(post.created_at);

      // Year filter
      if (
        advancedFilters.year &&
        postDate2.getFullYear() !== parseInt(advancedFilters.year)
      )
        return false;

      // Month filter (1-12)
      if (
        advancedFilters.month &&
        postDate2.getMonth() + 1 !== parseInt(advancedFilters.month)
      )
        return false;

      // Day filter
      if (
        advancedFilters.day &&
        postDate2.getDate() !== parseInt(advancedFilters.day)
      )
        return false;

      // Time filter
      if (advancedFilters.time) {
        const [filterHours, filterMinutes] = advancedFilters.time
          .split(":")
          .map(Number);
        const postHours = postDate2.getHours();
        const postMinutes = postDate2.getMinutes();

        if (postHours !== filterHours || postMinutes !== filterMinutes)
          return false;
      }

      // Keyword search (include post_values)
      if (advancedFilters.keyword) {
        const searchTerm = advancedFilters.keyword.toLowerCase();
        const matchesMainFields = Object.entries(post).some(([key, value]) => {
          if (key === "post_values") return false; // Handle separately
          return String(value).toLowerCase().includes(searchTerm);
        });

        const matchesPostValues = post.post_values?.some(
          (item) =>
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
  }, [
    selectedSurveys,
    selectedEntities,
    selectedCategories,
    selectedTags,
    selectedStatuses,
    dateRange,
    timeRange,
    selectedDays,
    locationFilter,
    selectedPosters,
    selectedSubcategories,
    selectedSubtags,
    selectedPriorityLevels,
    selectedAccessLevels,
    posts,
    searchEmpty,
    searchValue,
    advancedFilters,
  ]);

  // Handle checkbox changes
  const handleSurveyChange = (survey) => {
    setSelectedSurveys(
      (prev) =>
        prev.includes(survey)
          ? prev.filter((s) => s !== survey) // Uncheck
          : [...prev, survey] // Check
    );
  };

  // Handle checkbox entities
  const handleEntityChange = (survey) => {
    setSelectedEntities(
      (prev) =>
        prev.includes(survey)
          ? prev.filter((s) => s !== survey) // Uncheck
          : [...prev, survey] // Check
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(
      (prev) =>
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
    setSelectedStatuses(
      (prev) =>
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
    setSelectedPosters((prev) =>
      prev.includes(poster)
        ? prev.filter((p) => p !== poster)
        : [...prev, poster]
    );
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((s) => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const handleSubtagChange = (subtag) => {
    setSelectedSubtags((prev) =>
      prev.includes(subtag)
        ? prev.filter((s) => s !== subtag)
        : [...prev, subtag]
    );
  };

  const handlePriorityLevelChange = (level) => {
    setSelectedPriorityLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleAccessLevelChange = (level) => {
    setSelectedAccessLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSurveys([]);
    setSelectedEntities([]);
    setSelectedCategories([]);
    setSelectedTags([]);
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
    setAdvancedFilters({ dateTime: null, keyword: "" });
    setTimeRange(["", ""]);
    setSelectedDays([]);
  };

  // Get unique values for filters
  // const uniqueSurveys = [...new Set(posts.map((post) => post.name_of_survey))];
  const uniqueSurveys = [
    ...new Set(
      posts
        .filter((post) => post.is_entity === "false")
        .map((post) => post.name_of_survey)
    ),
  ];
  const uniqueEntities = [
    ...new Set(
      posts
        .filter((post) => post.is_entity === "true")
        .map((post) => post.name_of_survey)
    ),
  ];
  // Get all categories and count their occurrences
  const allCategories = posts.flatMap(post => [post.category_name, post.entity_type_name])
    .filter(value => value); // Keeps only truthy (non-empty) values
  const uniqueCategories = getSortedItemsByCount(allCategories, (category) => 1);
  // const uniqueStatuses = [...new Set(posts.map((post) => post.status))];
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
    }));
  };

  const handleRangeSelect = (event) => {
    setSelectedRange(event.target.value);
    // setLocationFilter((prev) => ({
    //   ...prev,
    //   range: parseFloat(event.target.value),
    // }));
  };

    useEffect(() => {
   setLocationFilter((prev) => ({
      ...prev,
      range: parseFloat(selectedRange),
    }));
  }, [selectedLocation,selectedRange]);

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
  // Silent helpers for bulk ops (no redirect/toast per item)
  const deleteRecordSilent = async (idD) => {
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
        updateListRecordDelete(idD);
        return { id: idD, ok: true };
      }
      return { id: idD, ok: false, error: results?.data };
    } catch (error) {
      return { id: idD, ok: false, error };
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
  const updateRecordStatusSilent = async (idD, pStatus) => {
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
        const newData = results?.data?.data;
        setPost((prevList) =>
          prevList.map((item) => (item?.id === newData.id ? newData : item))
        );
        return { id: idD, ok: true };
      }
      return { id: idD, ok: false, error: results?.data };
    } catch (error) {
      return { id: idD, ok: false, error };
    }
  };

  // Bulk operations
  const handleBulkDelete = () => {
    if (selectedPostIds.length === 0) return;
    swal({
      title: "Confirm Bulk Deletion",
      text: `Delete ${selectedPostIds.length} report(s)? This cannot be undone`,
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (!willDelete) return;
      setPending(true);
      const results = await Promise.allSettled(
        selectedPostIds.map((id) => deleteRecordSilent(id))
      );
      const successes = results
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter((x) => x && x.ok).length;
      const failures = selectedPostIds.length - successes;
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: {
            type: failures === 0 ? "success" : "warning",
            msg:
              failures === 0
                ? `Deleted ${successes} report(s).`
                : `Deleted ${successes} report(s), ${failures} failed.`,
          },
        })
      );
      setPending(false);
      clearSelection();
    });
  };

  const handleBulkSetStatus = async (statusValue) => {
    if (!statusValue || selectedPostIds.length === 0) return;
    setPending(true);
    const results = await Promise.allSettled(
      selectedPostIds.map((id) => updateRecordStatusSilent(id, statusValue))
    );
    const successes = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((x) => x && x.ok).length;
    const failures = selectedPostIds.length - successes;
    dispatch(
      toggleToaster({
        isOpen: true,
        toasterData: {
          type: failures === 0 ? "success" : "warning",
          msg:
            failures === 0
              ? `Updated status for ${successes} report(s).`
              : `Updated status for ${successes} report(s), ${failures} failed.`,
        },
      })
    );
    setPending(false);
    clearSelection();
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

  const handleAdditionToCollectionBulk = () => {
    setAddToCollectionBulk(true);
  };

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
    setAdvancedFilters(p.advancedFilters || { dateTime: null, keyword: "" });
    setSortConfig(p.sortConfig || { key: null, direction: "asc" });
  };
  return (
    <>
      <div className="hidden md:block">
        <FilterTopNav
          viewKey={"data_view"}
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
          handleRangeSelect={handleRangeSelect}
          selectedRange={selectedRange}
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
          selectedDays={selectedDays}
          advancedFilters={advancedFilters}
          setShowAdvancedSearch={setShowAdvancedSearch}
          addToCollectionBulk={handleAdditionToCollectionBulk}
          rightOpen={rightOpen}
          setRightOpen = {setRightOpen}
        />
      </div>

      <div className="flex-1 flex relative my-black-bg ">
        {/* Left Column */}

        <div
          className={`fixed inset-y-0 left-0 w-full max-w-[300px] my-black-bg  z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${
            leftOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {collectionOn && collectionIdNew !== 0 && (
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
            <LeftFilterPanel
              handleSurveyChange={handleSurveyChange}
              handleEntityChange={handleEntityChange}
              selectedSurveys={selectedSurveys}
              selectedEntities={selectedEntities}
              uniqueEntities={uniqueEntities}
              uniqueSurveys={uniqueSurveys}
            />
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


            {pending && (
              <div className="flex items-center justify-center mb-4">
                <Spinner
                  animation="grow"
                  variant="warning"
                  className="h-[100px]"
                />
              </div>
            )}
            {/* Bulk selection/action bar */}
            <div className="px-4 py-2 text-xs text-white relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  {selectedPostIds.length > 0 ? (
                    <span>{selectedPostIds.length} selected</span>
                  ) : (
                    <span className="text-gray-400">No selection</span>
                  )}
                </div>

                {/* Full actions on >= sm */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                    onClick={selectAllFiltered}
                  >
                    Select all filtered
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                    onClick={clearSelection}
                  >
                    Clear selection
                  </button>
                  <button
                    disabled={selectedPostIds.length === 0}
                    className="px-2 py-1 bg-red-700 hover:bg-red-600 rounded disabled:bg-gray-600"
                    onClick={handleBulkDelete}
                  >
                    Delete selected
                  </button>
                  <select
                    className="px-2 py-1 bg-gray-800 rounded"
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) handleBulkSetStatus(val);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      Set status…
                    </option>
                    {uniqueStatuses
                      .filter((s) => s && String(s).trim() !== "")
                      .map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {String(s).toLowerCase() === "archived" ? "Archived" : s}
                        </option>
                      ))}
                    {!uniqueStatuses
                      .map((s) => String(s || "").toLowerCase())
                      .includes("archived") && <option value="archived">Archived</option>}
                  </select>
                  <button
                    disabled={selectedPostIds.length === 0}
                    className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded disabled:bg-gray-600"
                    onClick={() => setShowAddToCollectionBulkSelected(true)}
                  >
                    Add to collection
                  </button>
                </div>

                {/* Compact actions on < sm */}
                <div className="sm:hidden flex justify-end">
                  <button
                    className="px-3 py-1 bg-gray-800 rounded border border-gray-700"
                    onClick={() => setShowBulkMenu((v) => !v)}
                  >
                    Bulk actions
                  </button>
                </div>
              </div>

              {showBulkMenu && (
                <div className="sm:hidden absolute right-4 mt-2 w-56 bg-[#1f1f1f] border border-gray-700 rounded shadow-lg z-20 p-2">
                  <button
                    className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded"
                    onClick={() => {
                      selectAllFiltered();
                      setShowBulkMenu(false);
                    }}
                  >
                    Select all filtered
                  </button>
                  <button
                    className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded"
                    onClick={() => {
                      clearSelection();
                      setShowBulkMenu(false);
                    }}
                  >
                    Clear selection
                  </button>
                  <button
                    disabled={selectedPostIds.length === 0}
                    className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => {
                      setShowBulkMenu(false);
                      handleBulkDelete();
                    }}
                  >
                    Delete selected
                  </button>
                  <div className="px-2 py-2">
                    <label className="block mb-1 text-gray-300">Set status</label>
                    <select
                      className="w-full px-2 py-1 bg-gray-800 rounded"
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleBulkSetStatus(val);
                        e.target.value = "";
                        setShowBulkMenu(false);
                      }}
                    >
                      <option value="" disabled>
                        Choose…
                      </option>
                      {uniqueStatuses
                        .filter((s) => s && String(s).trim() !== "")
                        .map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {String(s).toLowerCase() === "archived" ? "Archived" : s}
                          </option>
                        ))}
                      {!uniqueStatuses
                        .map((s) => String(s || "").toLowerCase())
                        .includes("archived") && <option value="archived">Archived</option>}
                    </select>
                  </div>
                  <button
                    disabled={selectedPostIds.length === 0}
                    className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded disabled:opacity-50"
                    onClick={() => {
                      setShowAddToCollectionBulkSelected(true);
                      setShowBulkMenu(false);
                    }}
                  >
                    Add to collection
                  </button>
                </div>
              )}
            </div>
            {/* <CardView/> */}
            {/* <MapView/> */}
            <PostList
              posts={sortedPosts}
              pending={pending}
              deletePost={handleDelete}
              removeFromCollection={handleRemove}
              updatePostStatus={handlePostUpdateStatus}
              rightOpen={rightOpen}
              selectedPostIds={selectedPostIds}
              onToggleSelect={toggleSelectPost}
              onSelectPage={selectPostsOnPage}

            />
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
            // onApply={() => setShowAdvancedSearch(false)}
            filters={advancedFilters}
            setFilters={setAdvancedFilters}
            handleDateRangeChange={handleDateRangeChange}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            handleLocationSelect={handleLocationSelect}
            setLocationFilter={setLocationFilter}
            locationFilter={locationFilter}
            handleRangeSelect={handleRangeSelect}
          />
        </div>
      </div>
      <AddToCollectionBulkModal
        show={showAddToCollectionBulk}
        onClose={() => setAddToCollectionBulk(false)}
        filteredPosts={filteredPosts}
      />
      <AddToCollectionBulkModal
        show={showAddToCollectionBulkSelected}
        onClose={() => setShowAddToCollectionBulkSelected(false)}
        filteredPosts={posts.filter((p) => selectedPostIds.includes(p.id))}
      />
    </>
  );
}

export default DataViewPage;
