
import { useState } from 'react';
import { useLocation, a } from "react-router-dom";
// import { Routes, Route } from 'react-router-dom';
// import Sidebar from './Sidebar';
import { ReactComponent as AddReportIcon } from 'assets/icons/add_location.svg';
import { ReactComponent as AddEntityIcon } from 'assets/icons/crisis_alert.svg';
import { ReactComponent as MapViewIcon } from 'assets/icons/globe_location_pin.svg';
import { ReactComponent as CardViewIcon } from 'assets/icons/cards.svg';
import { ReactComponent as CollectionIcon } from 'assets/icons/library_books.svg';
import { ReactComponent as GeofenceIcon } from 'assets/icons/polyline.svg';
import { ReactComponent as SettingsIcon } from 'assets/icons/settings.svg';
import { ReactComponent as DashboardIcon } from 'assets/icons/empty_dashboard.svg';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-black text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
      <div className=' border-b border-gray-700 grid grid-col-1'>
        <div className="flex items-center justify-between p-5">
          <div className='flex item-start'>
            <img src="favicon/favicon-32x32.png" className='mr-2' />
            <h1 className="text-3xl font-bold">UVERWATCH</h1>

          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>


        </div>
        {/* <div className=' grid grid-col-1 items-start justify-start'> */}
        <h2 className='pl-4 mb-4'>CIVIC</h2>
        <h2 className='pl-4 mb-8 font-bold'>POV : Micheal</h2>
        {/* </div> */}

      </div>
      <div className='px-4'>
        <nav className="mt-4">

          <a
            key=''
            href=''
            className="block border border-gray-700 px-4 py-2 text-gray-200 hover:bg-red-700 hover:text-white"
            onClick={toggleSidebar}
          >
            Add Report
          </a>

        </nav>


        <nav className="mt-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white"
              onClick={toggleSidebar}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};


const MainContent = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="flex-1 flex relative">
      {/* Left Column */}
      <div className={`fixed inset-y-0 left-0 w-full max-w-[300px] bg-white z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${leftOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Left Panel</h3>
          {/* Left column content */}
          <Section title="Layers" items={['Basic', 'Entity X126', 'Target V12', 'Cocobed', 'Antioch']} />
          <Section title="Entities" items={['Black Shmo', 'Atta Ayl', 'Driver Blue', 'X Com']} />
          <Section title="Trackers" items={['Driver 1', 'Phone 243', 'Driver Blue', 'X Com']} />


        </div>
      </div>

      {/* Middle Column */}
      <div className="flex-1 lg:w-3/5 relative">
        <div className="p-6 h-full">
          {/* Toggle Buttons Container */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Filters
            </button>

            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="p-2 bg-gray-800 text-white rounded-lg shadow-md flex items-center"
            >
              Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <h2 className="text-2xl font-bold mb-4">Main Content</h2>
          <p className="text-gray-700">
            This is the main content area. It takes up the remaining space and adjusts based on the sidebar's state.
            Add your page content here.
          </p>
        </div>

        {/* Overlay for mobile */}
        {(leftOpen || rightOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          ></div>
        )}
      </div>

      {/* Right Column */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[300px] bg-white z-40 shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:block lg:w-1/5 ${rightOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Right Panel</h3>
          {/* Right column content */}
          <AdvancedFilter />
          <AreaFilter />
          <SavePresets />
        </div>
      </div>
    </div>
  );
};
const AddReportPage = () => {
  return (
    <div className="flex-1 p-6 bg-gray-100 h-full">
      <h2 className="text-2xl font-bold mb-4">Add Report</h2>
      <p className="text-gray-700">
        This is the Add Report page content.
      </p>
    </div>
  );
};
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
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-gray-800 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="pb-24 lg:pb-0">
          <MainContent />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-gray-800 border-t border-gray-700 py-3">
        <div className="flex flex-col items-center">
          {/* Floating Add Button */}
          <a
            href="/post"
            className="bg-red-500 text-white p-3 rounded-full -mt-10 mb-2 shadow-lg hover:bg-red-600 transition-colors"
          >
            <AddReportIcon className="h-6 w-6" />
          </a>

          {/* Navigation Links */}
          <div className="w-full px-4 flex justify-between">
            <a
              href="/dashboard"
              className="flex flex-col items-center text-gray-300 hover:text-white text-xs"
              onClick={toggleSidebar}
            >
              <DashboardIcon className="h-6 w-6 mb-1" />
              Dashboard
            </a>

            <a
              href="/data_view"
              className="flex flex-col items-center text-gray-300 hover:text-white text-xs"
              onClick={toggleSidebar}
            >
              <CardViewIcon className="h-6 w-6 mb-1" />
              Card View
            </a>

            <a
              href="/map_view"
              className="flex flex-col items-center text-gray-300 hover:text-white text-xs"
              onClick={toggleSidebar}
            >
              <MapViewIcon className="h-6 w-6 mb-1" />
              Map View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}