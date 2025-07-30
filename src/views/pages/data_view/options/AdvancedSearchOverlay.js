import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdvancedSearchOverlay = ({ show, onClose, onApply, filters, setFilters }) => {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const handleDateTimeChange = (date) => {
    if (!date) {
      setFilters(prev => ({
        ...prev,
        dateTime: null,
        year: '',
        month: '',
        day: '',
        time: ''
      }));
      return;
    }

    setFilters(prev => ({
      ...prev,
      dateTime: date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }));
  };

  const handleIndividualChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      dateTime: null, // Clear full datetime when individual fields change
      [name]: value
    }));
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-[1200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-[60%] max-w-[1200px] p-8 overflow-y-auto max-h-[90vh] mx-auto mt-8"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Advanced Search / Filter</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Date/Time Picker */}
              {/* <div>
                <label className="block text-sm font-medium mb-2">
                  Specific Date/Time
                </label>
                <DatePicker
                  selected={filters.dateTime}
                  onChange={handleDateTimeChange}
                  showTimeSelect
                  dateFormat="Pp"
                  isClearable
                  placeholderText="Select exact date and time"
                  className="w-full p-2 border rounded-md"
                />
              </div> */}

              {/* Individual Components */}
              <div className="grid grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={filters.year}
                    onChange={(e) => handleIndividualChange('year', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="YYYY"
                  />
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Month
                  </label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleIndividualChange('month', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Any Month</option>
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={filters.day}
                    onChange={(e) => handleIndividualChange('day', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="DD"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={filters.time}
                    onChange={(e) => handleIndividualChange('time', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Keyword Search */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Keywords
                </label>
                <input
                  type="text"
                  placeholder="Search across all fields and post values..."
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onApply}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedSearchOverlay;