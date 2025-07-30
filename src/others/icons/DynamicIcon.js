import React from 'react';

export const DynamicIcon = ({ iconClass, color, size = 'text-xl' }) => React.createElement(
  'i', 
  {
    className: `${iconClass} ${size} inline-block align-middle`,
    style: { color },
    'aria-hidden': true
  }
);