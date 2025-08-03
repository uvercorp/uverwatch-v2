import React, { useState, useEffect, useRef } from 'react';

const TagInput = ({ initialTags = '', onTagsChange, allTags = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState(() => {
    return initialTags ? initialTags.split(',').map(t => t.trim()).filter(t => t) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const containerRef = useRef(null);

  // Initialize tags from initialTags when component mounts or initialTags changes
  useEffect(() => {
    alert('called')
    const newTags = initialTags ? initialTags.split(',').map(t => t.trim()).filter(t => t) : [];
    console.log('existing');
    console.log(newTags);
    console.log(initialTags);
    // if(initialTags !== ""){
    // setTags(newTags);

    // }
  }, []);

  // Update filtered suggestions whenever input or tags change
  useEffect(() => {
    const lowerCaseInput = inputValue.toLowerCase();
    const selectedTagNames = new Set(tags);

    const filtered = allTags.filter(tag => {
      const matchesInput = tag.name.toLowerCase().includes(lowerCaseInput);
      const notSelected = !selectedTagNames.has(tag.name);
      return matchesInput && notSelected;
    });

    setFilteredSuggestions(filtered);
    onTagsChange(tags.join(','));
  }, [inputValue, tags, allTags]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        if (inputValue.trim()) {
          addTag(inputValue.trim());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      setTags(prev => [...prev, tagName]);
      setInputValue('');
    }
  };

  const removeTag = (index) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (tag, e) => {
    e.preventDefault();
    e.stopPropagation();
    addTag(tag.name);
    setInputValue('');
    setShowSuggestions(true); // Keep suggestions open for multiple selections
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-2 mb-2 min-h-10 p-2   bg-black my-input">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center px-2.5 py-0.5  text-sm font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              className="ml-1.5 inline-flex text-blue-500 hover:text-blue-700 focus:outline-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeTag(index);
              }}
            >
              <span className="sr-only">Remove tag</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[100px] border-0 focus:ring-0 p-0 text-sm focus:outline-none my-input"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 bg-black shadow-lg text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm"
          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
        >
          {filteredSuggestions.map((tag) => (
            <div
              key={tag.id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-900"
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              onClick={(e) => handleSuggestionClick(tag, e)}
            >
              <div className="font-medium text-gray-300">{tag.name}</div>
              {tag.description && (
                <div className="mt-1 text-xs text-gray-500">{tag.description}</div>
              )}
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default TagInput;