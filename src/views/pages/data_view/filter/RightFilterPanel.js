import { React, useState, useEffect, useMemo,useRef } from "react";
import AutocompleteLocationSearch from "../AutocompleteLocationSearch";


export default function RightFilterPanel(props) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [query, setQuery] = useState('');
  const [showAreaFilterDropdown, setShowAreaFilterDropdown] = useState(false);
  const areaFilterRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (areaFilterRef.current && !areaFilterRef.current.contains(event.target)) {
        setShowAreaFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [])
  const clearFilters = () => {
    setQuery('');
    props.handleLocationSelect(null);
    props.handleRangeSelect({ target: { value: '' } });
  };
  // useEffect to detect when both dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      // alert('Selected Date Range: '+ startDate+" "+endDate)
      props?.handleDateRangeChange([startDate, endDate]);
    }
  }, [startDate, endDate]);
  return (
    <div className="w-70 my-black-bg text-gray-200 p-2 font-mono text-sm">
      {/* <div className="w-72 bg-[#0f0f0f] text-gray-200 p-4 font-mono text-sm"> */}
      <div className="max-h-[90vh] my-sidebar-link overflow-y-auto space-y-0 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">

        {/* Search */}
        <div>
          <label className="block mb-0">Search</label>
          <input type="text"
            placeholder="Search across all fields and post values..."
            value={props?.filters?.keyword}
            onChange={(e) => props?.setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            className="w-full bg-transparent border border-gray-500 px-2 py-1" />
        </div>

        {/* Time Zone */}
        {/* <div>
          <label className="block mb-0">Time Zone</label>
          <select className="w-full bg-transparent border border-gray-500 px-2 py-1">
            <option>UTC +1</option>
          </select>
          <p className="text-xs text-gray-500 italic mt-0">e.g UTC+00 = GMT</p>
        </div> */}

        {/* Date Range */}

        <div>
          <label className="block mb-0">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              name="start"
              className="w-1/2 bg-transparent border border-gray-500 px-1 py-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              name="end"
              className="w-1/2 bg-transparent border border-gray-500 px-1 py-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 italic mt-0">
            e.g 22.01.18 to 22.01.25
          </p>
        </div>

        {/* Time Range */}

        <div>
  <label className="block mb-0">Time Range</label>
  <div className="flex gap-2">
    <input
      type="number"
      className="w-1/2 bg-transparent border border-gray-500 px-2 py-1"
      value={props?.timeRange[0]}
      onChange={(e) => props?.setTimeRange([e.target.value, props?.timeRange[1]])}
    />
    <input
      type="number"
      className="w-1/2 bg-transparent border border-gray-500 px-2 py-1"
      value={props?.timeRange[1]}
      onChange={(e) => props?.setTimeRange([props?.timeRange[0], e.target.value])}
    />
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
        type="button"
        onClick={() =>
          props?.setSelectedDays(prev =>
            prev.includes(day)
              ? prev.filter(d => d !== day)
              : [...prev, day]
          )
        }
        className={`text-[0.7em] px-1 py-0 border border-gray-500 ${props?.selectedDays.includes(day)
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
        {/* <div ref={areaFilterRef} className="relative">
          <div className="flex items-center border border-gray-500 mt-2">
            <input
              type="text"
              className="flex-grow bg-transparent px-2 py-1"
              placeholder="Area Filter..."
              onClick={() => setShowAreaFilterDropdown(true)}
            />
            <button
              className="px-2 text-gray-300"
              onClick={() => setShowAreaFilterDropdown(!showAreaFilterDropdown)}
            >
              ⋮
            </button>
          </div>

          {showAreaFilterDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-[#0f0f0f] border border-gray-500 p-3 shadow-lg">
              <div className="text-right text-red-500 underline cursor-pointer" onClick={clearFilters}>
                clear
              </div>
              <div className="min-h-[200px] pt-3">
                <label>City Or Address</label>
                <AutocompleteLocationSearch
                  query={query}
                  onQueryChange={setQuery}
                  onLocationSelect={props.handleLocationSelect}
                  ref={autocompleteRef}
                />
                <br />
                <select
                  value={props?.locationFilter?.range || ""}
                  onChange={props.handleRangeSelect}
                  className="block w-full px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out appearance-none hover:bg-gray-50 cursor-pointer"
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
        </div> */}

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
          {/* <button className="w-[70%] ml-[30%] bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold">Save Presets</button> */}
          <button className="w-[70%] ml-[30%] bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold" onClick={() => props.exportToCSV()}>Data Export</button>
          <button className="w-full bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 font-semibold" onClick={() => props.addToCollectionBulk()}>Add to Collection</button>
        </div>

      </div>
    </div>
  );
};