// Sidebar.jsx
import { Fragment } from 'react';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`transform top-0 left-0 w-64 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex`}
    >
      <div className="p-4 border-r border-gray-200 h-full">
        <h1 className="text-2xl font-bold mb-6">UVERWATCH</h1>
        
        <Section title="Layers" items={['Basic', 'Entity X126', 'Target V12', 'Cocobed', 'Antioch']} />
        <Section title="Entities" items={['Black Shmo', 'Atta Ayl', 'Driver Blue', 'X Com']} />
        <Section title="Trackers" items={['Driver 1', 'Phone 243', 'Driver Blue', 'X Com']} />
        
        <AdvancedFilter />
        <AreaFilter />
        <SavePresets />
      </div>
    </aside>
  );
}

const Section = ({ title, items }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">{title}</h3>
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="text-gray-700 hover:bg-gray-50 px-2 py-1 rounded">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const AdvancedFilter = () => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">Advanced Filter</h3>
    <div className="space-y-4">
      <input type="text" placeholder="Search" className="w-full px-2 py-1 border rounded-md" />
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span>Time Zone</span>
        <span>UTC +1</span>
        <span className="col-span-2 text-xs text-gray-400">@@ UPC000 = ONE</span>
        
        <span>Date Range</span>
        <span>28.02.25 - 31.12.25</span>
        <span className="col-span-2 text-xs text-gray-400">@@ 24.01.18 to 24.01.25</span>
        
        <span>Time Range</span>
        <span>0809HRS - 2359HRS</span>
        <span className="col-span-2 text-xs text-gray-400">@@ 1500HRS to 2300HRS</span>
      </div>
      
      <div className="text-sm">
        <p>Days of the Week</p>
        <p className="text-xs text-gray-500 mt-1">SERV MORE YOUR NEED THUS TALK SAFE</p>
      </div>
    </div>
  </div>
);

const AreaFilter = () => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 mb-2">Area Filter</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span>Playback Frequency</span>
        <span>15 mins</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Playback Speed</span>
        <span>1x</span>
      </div>
    </div>
  </div>
);

const SavePresets = () => (
  <div>
    <h3 className="text-sm font-semibold text-gray-500 mb-2">Save Presets</h3>
    <div className="flex gap-2">
      <button className="flex-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm">
        Data Export
      </button>
      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
        Add to Collection
      </button>
    </div>
  </div>
);