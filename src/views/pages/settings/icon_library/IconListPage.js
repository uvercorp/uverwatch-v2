import React, { useState, useMemo } from 'react';
import { DynamicIcon } from 'others/icons/DynamicIcon';
import { ICON_LIBRARY } from 'others/icons/icons';
import {
    Badge,
    Button,
    Card,
    Form,
    Navbar,
    Nav,
    Container,
    Row,
    Col,
    Tab
  } from "react-bootstrap";

const IconListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = useMemo(() => 
    ICON_LIBRARY.filter(icon =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);
return (
    <>

    <Card>
      <Card.Header>
        <Card.Title as="h4">

          <div className="flex items-start justify-between">
            <span>Icon Library | <span className="text-[0.6em]">List</span> </span>

          </div>
        </Card.Title>
      </Card.Header>
      <Card.Body >
        <hr />
        <div className="md:min-h-[300px]">
{
    React.createElement('div', { className: ' mx-auto ' },
        // React.createElement('h1', { className: 'text-3xl font-bold mb-6' }, 'Icon Library'),
        
        // Search Input
        React.createElement('div', { className: 'mb-8 max-w-md' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search icons...',
            className: 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            autoFocus: true
          })
        ),
    
        // Icon Grid
        React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4' },
          filteredIcons.length > 0 ? (
            filteredIcons.map(icon => 
              React.createElement('div', { 
                key: icon.class,
                className: 'p-4 border rounded-lg hover:bg-gray-50 text-center'
              },
                React.createElement(DynamicIcon, {
                  iconClass: icon.class,
                  className: 'text-3xl mb-2 mx-auto'
                }),
                React.createElement('span', { 
                  className: 'text-sm text-gray-600 break-words'
                }, icon.name)
              )
            )
          ) : (
            React.createElement('div', { className: 'col-span-full text-center text-gray-500 py-8' },
              'No icons found matching "', searchQuery, '"'
            )
          )
        )
      )

    }

         
        </div>


      </Card.Body>
    </Card>

  </>
)
  
  
};

export default IconListPage;