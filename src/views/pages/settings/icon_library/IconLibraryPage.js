import React, { useState } from 'react';
import { IconPicker } from 'others/icons/IconPicker';

export default  function IconLibraryPage(){
  const [formData, setFormData] = useState({
    title: '',
    icon: null,
    color: '#000000'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit to your API
    console.log('Form data:', formData);
  };

  return React.createElement('form', { onSubmit: handleSubmit, className: 'max-w-md mx-auto p-4' },
    React.createElement('input', {
      type: 'text',
      name: 'title',
      value: formData.title,
      onChange: (e) => setFormData(prev => ({ ...prev, title: e.target.value })),
      placeholder: 'Post Title',
      className: 'w-full mb-4 px-3 py-2 border rounded'
    }),

    React.createElement(IconPicker, {
      onSelection: ({ iconClass, color }) => 
        setFormData(prev => ({ ...prev, icon: iconClass, color }))
    }),

    React.createElement('button', {
      type: 'submit',
      className: 'mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
    }, 'Create Post')
  );
};