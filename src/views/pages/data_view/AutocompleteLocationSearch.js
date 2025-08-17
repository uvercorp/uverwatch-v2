import React, { forwardRef, useEffect,useState } from "react";

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const AutocompleteLocationSearch = forwardRef(
  ({ query, onQueryChange, onLocationSelect }, ref) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch location suggestions from OpenStreetMap Nominatim
    const fetchSuggestions = async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]); // Clear suggestions if query is too short
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        alert("An error occurred while fetching location suggestions.");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounced version of fetchSuggestions with 500ms delay
    const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

    // Handle input change
    const handleInputChange = (e) => {
      const value = e.target.value;
      onQueryChange(value); // Update query state in parent
      debouncedFetchSuggestions(value); // Use debounced function
    };

    // Handle selection of a suggestion
    const handleSuggestionClick = (suggestion) => {
      const { lat, lon } = suggestion;
      onQueryChange(suggestion.display_name); // Update query state in parent
      setSuggestions([]); // Clear suggestions
      onLocationSelect(parseFloat(lat), parseFloat(lon)); // Pass coordinates to parent
    };

    return (
      <div className="relative w-full max-w-md">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search for a place..."
          value={query}
          onChange={handleInputChange}
          ref={ref} // Attach ref to input
          className="w-full px-4 py-2  focus:border-transparent my-input"
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-5 h-5 text-gray-500 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-[#1d2a38] hover:bg-[#3F1F2F] border border-gray-300  shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-[#371c2a]"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default AutocompleteLocationSearch;