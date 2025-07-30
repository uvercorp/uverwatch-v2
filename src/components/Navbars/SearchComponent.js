import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import{toggleSearchValue} from "../../provider/features/globalSearchSlice"
const SearchComponent = () => {
  const dispatch = useDispatch();
   const searchEmpty = useSelector((state) => state.globalSearch.searchValueEmpty);
    const searchValue = useSelector((state) => state.globalSearch.searchValue);
  const [query, setQuery] = useState(searchValue);
  

  const handleSearch = () => {
    // onSearch(query); // Pass the search query to the parent component
    dispatch(toggleSearchValue(query));
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      handleSearch(); // Trigger search on Enter key press
    } else {
      handleSearch(); // Trigger search on every keyup (optional)
    }
  };

   useEffect(() => {
      setQuery(searchValue);
  
    }, [searchEmpty, searchValue]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* Search Input */}
        <input
          type="text"
          className="pl-10 pr-4 py-2 w-64 md:w-80 lg:w-96 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleKeyUp}
        />
      </div>
    </div>
  );
};

export default SearchComponent;