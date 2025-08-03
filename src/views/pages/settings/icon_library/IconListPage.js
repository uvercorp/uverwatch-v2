import React, { useState, useMemo } from 'react';
import { DynamicIcon } from 'others/icons/DynamicIcon';
import { ICON_LIBRARY } from 'others/icons/icons';
import { Card } from "react-bootstrap";

const IconListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Improved filtering with deduplication
  const filteredIcons = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // First deduplicate the icons by class name
    const uniqueIcons = [];
    const seenClasses = new Set();

    for (const icon of ICON_LIBRARY) {
      if (!seenClasses.has(icon.class)) {
        seenClasses.add(icon.class);
        uniqueIcons.push(icon);
      }
    }

    // Then filter by search query
    return query === ''
      ? uniqueIcons
      : uniqueIcons.filter(icon =>
          icon.name.toLowerCase().includes(query) ||
          icon.class.toLowerCase().includes(query)
        );
  }, [searchQuery]);

  return (
    <div className="my-gradient-bg">
      <Card.Header style={{ paddingTop: "0px" }}>
        <Card.Title as="h4">
          <div className="flex items-start justify-between pb-0">
            <span className="my-font-family-overpass-mono font-semibold text-[#dbdbde]">
              Icon Library
            </span>
          </div>
        </Card.Title>
      </Card.Header>

      <div className="px-4">
        <hr className="border-[#2e2c2b] mt-0 mb-6 pt-0" />
      </div>

      <div style={{ paddingTop: "0px" }}>
        <div className="md:min-h-[300px] pl-4">
          <div className="mx-auto">
            {/* Search Input */}
            <div className="mb-8 max-w-md">
              <input
                type="text"
                placeholder="Search icons by name or class..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredIcons.length > 0 ? (
                filteredIcons.map(icon => (
                  <div
                    key={`${icon.class}-${icon.name}`} // More unique key
                    className="p-4 border rounded-lg cursor-pointer bg-gray-800 text-white hover:bg-gray-700 text-center"
                  >
                    <DynamicIcon
                      iconClass={icon.class}
                      className="text-3xl mb-2 mx-auto"
                    />
                    <span className="text-sm break-words block">
                      {icon.name}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1 break-all">
                      {icon.class}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No icons found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconListPage;