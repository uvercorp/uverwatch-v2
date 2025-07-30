import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS

function PostSearch({ posts }) {
  // State for filters
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]); // [startDate, endDate]
  const [locationFilter, setLocationFilter] = useState({
    latitude: null,
    longitude: null,
    range: null, // Range in kilometers
  });

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

      // Filter by categories
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(post.category_name);

      // Filter by statuses
      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(post.status);

      // Filter by date range
      const postDate = new Date(post.created_at);
      const dateMatch =
        (!dateRange[0] || postDate >= new Date(dateRange[0])) &&
        (!dateRange[1] || postDate <= new Date(dateRange[1]));

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

      return surveyMatch && categoryMatch && statusMatch && dateMatch && locationMatch;
    });

    setFilteredPosts(filtered);
  }, [
    selectedSurveys,
    selectedCategories,
    selectedStatuses,
    dateRange,
    locationFilter,
    posts,
  ]);

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

  // Clear all filters
  const clearFilters = () => {
    setSelectedSurveys([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setDateRange([null, null]);
    setLocationFilter({ latitude: null, longitude: null, range: null });
  };

  // Get unique values for filters
  const uniqueSurveys = [...new Set(posts.map((post) => post.name_of_survey))];
  const uniqueCategories = [...new Set(posts.map((post) => post.category_name))];
  const uniqueStatuses = [...new Set(posts.map((post) => post.status))];

  return (
    <div>
      {/* Filters */}
      <div>
        <h3>Surveys ({selectedSurveys.length})</h3>
        {uniqueSurveys.map((survey) => (
          <label key={survey}>
            <input
              type="checkbox"
              checked={selectedSurveys.includes(survey)}
              onChange={() => handleSurveyChange(survey)}
            />
            {survey}
          </label>
        ))}
      </div>

      <div>
        <h3>Categories ({selectedCategories.length})</h3>
        {uniqueCategories.map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>

      <div>
        <h3>Statuses ({selectedStatuses.length})</h3>
        {uniqueStatuses.map((status) => (
          <label key={status}>
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={() => handleStatusChange(status)}
            />
            {status}
          </label>
        ))}
      </div>

      <div>
        <h3>Date Range</h3>
        <DatePicker
          selectsRange={true}
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onChange={handleDateRangeChange}
          isClearable={true}
          placeholderText="Select a date range"
        />
      </div>

      <div>
        <h3>Location Filter</h3>
        <input
          type="number"
          placeholder="Latitude"
          value={locationFilter.latitude || ""}
          onChange={(e) =>
            setLocationFilter((prev) => ({
              ...prev,
              latitude: parseFloat(e.target.value),
            }))
          }
        />
        <input
          type="number"
          placeholder="Longitude"
          value={locationFilter.longitude || ""}
          onChange={(e) =>
            setLocationFilter((prev) => ({
              ...prev,
              longitude: parseFloat(e.target.value),
            }))
          }
        />
        <select
          value={locationFilter.range || ""}
          onChange={(e) =>
            setLocationFilter((prev) => ({
              ...prev,
              range: parseFloat(e.target.value),
            }))
          }
        >
          <option value="">Select Range</option>
          <option value="1">1 km</option>
          <option value="2">2 km</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="1000">1000 km</option>
          <option value="2000">2000 km</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "16px",
        }}
      >
        Clear Filters
      </button>

      {/* Display Filtered Posts */}
      <div>
        <h2>Filtered Posts</h2>
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <p>Survey: {post.name_of_survey}</p>
            <p>Category: {post.category_name}</p>
            <p>Status: {post.status}</p>
            <p>Created At: {post.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostSearch;