import React, { useState, useMemo, useEffect } from 'react';
import { Chrome } from '@uiw/react-color';
import { ICON_LIBRARY } from './icons';
import { DynamicIcon } from './DynamicIcon';

export const IconPicker = ({ onSelection, initialIconClass, initialColor }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize from props
  useEffect(() => {
    if (initialIconClass) {
      const icon = ICON_LIBRARY.find(icon => icon.class === initialIconClass);
      setSelectedIcon(icon || null);
    }
  }, [initialIconClass]);

  useEffect(() => {
    if (initialColor) {
      setSelectedColor(initialColor);
    }
  }, [initialColor]);

  // Filter icons based on search query
  const filteredIcons = useMemo(() =>
    ICON_LIBRARY.filter(icon =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const handleSelect = (icon) => {
    setSelectedIcon(icon);
    onSelection({ iconClass: icon.class, color: selectedColor });
    setIsOpen(false);
    setSearchQuery('');
  };

  return React.createElement('div', { className: 'relative my-4' },
    React.createElement('button', {
      type: 'button',
      className: 'px-4 py-2 border bg-gray-200 text-black hover:bg-gray-50 flex items-center gap-2',
      onClick: () => setIsOpen(!isOpen)
    },
      selectedIcon
        ? React.createElement(DynamicIcon, {
            iconClass: selectedIcon.class,
            color: selectedColor
          })
        : 'Select Icon + Color'
    ),

    isOpen && React.createElement('div', {
      className: 'absolute top-full left-0 z-50 bg-white border  shadow-lg p-4 mt-2 w-96'
    },
      // Search Input
      React.createElement('div', { className: 'mb-4' },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search icons...',
          className: 'w-full px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500',
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          'aria-label': 'Search icons'
        })
      ),



      // Icons Grid
      React.createElement('div', {
        className: 'grid grid-cols-5 gap-3 max-h-64 overflow-y-auto'
      },
        filteredIcons.length > 0 ? (
          filteredIcons.map(icon =>
            React.createElement('button', {
              key: icon.class,
              type: 'button',
              className: 'p-2 border  hover:bg-gray-100 text-black flex justify-center items-center',
              onClick: () => handleSelect(icon),
              'aria-label': `Select ${icon.name} icon`
            },
              React.createElement(DynamicIcon, { iconClass: icon.class })
            )
          )
        ) : (
          React.createElement('div', {
            className: 'col-span-5 text-center text-gray-500 py-4'
          },
            'No icons found matching your search'
          )
        )
      ),
        // Color Picker Section moved up
        React.createElement('div', { className: 'flex items-center gap-4 mb-4' },
          React.createElement(Chrome, {
            color: selectedColor,
            onChange: (color) => {
              setSelectedColor(color.hex);
              if (selectedIcon) {
                onSelection({
                  iconClass: selectedIcon.class,
                  color: color.hex
                });
              }
            },
            style: { width: '100%' }
          }),
          React.createElement('div', {
            className: 'w-8 h-8 rounded border shrink-0',
            style: { backgroundColor: selectedColor },
            'aria-label': 'Selected color preview'
          })
        )
    )
  );
};
