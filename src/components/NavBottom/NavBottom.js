
import React, { Component,useState,useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";

import { ReactComponent as AddReportIcon } from '../../assets/icons/add_location.svg';
import { ReactComponent as AddEntityIcon } from '../../assets/icons/crisis_alert.svg';
import { ReactComponent as MapViewIcon } from '../../assets/icons/globe_location_pin.svg';
import { ReactComponent as CardViewIcon } from '../../assets/icons/cards.svg';
import { ReactComponent as CollectionIcon } from '../../assets/icons/library_books.svg';
import { ReactComponent as GeofenceIcon } from '../../assets/icons/polyline.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings.svg';
import { ReactComponent as DashboardIcon } from '../../assets/icons/empty_dashboard.svg';

import icon from '../../assets/icons/add_location.svg';


import { Nav, Button, Card } from "react-bootstrap";

import { useSelector,useDispatch } from "react-redux";
import AddPostModal from "../../views/pages/posts/AddPostModal";
import CollectionPage from "../../views/pages/collection/CollectionPage";
import HelpPage from "../../views/pages/help/HelpPage";


function NavBottom({isOpen, toggleSidebar,routes,deployment,user,isLogin }) {
  const [modalShow, setModalShow] = useState(false);
  const [show, setShow] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const location = useLocation();
  const collectionOn =  useSelector((state)=>state.collection.collectionOn);
  const collectionId =  useSelector((state)=>state.collection.collectionId);
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? " my-red-bg" : "";
    // return "";
  };

 
  return (
   <>
   {/* Mobile Bottom Navigation */}
   <div className="fixed bottom-0 left-0 right-0 lg:hidden z-[1800] my-black-bg border-t border-gray-700 py-3 pb-2">
  <div className="flex flex-col items-center ">
    {/* Floating Add Button */}
    <NavLink
      to="post"
      
      className={`
        ${activeRoute('deployment/post')}
      bg-red-600 text-white p-3 rounded-full -mt-10 mb-2 shadow-lg hover:bg-red-700 transition-colors`}
    >
      {/* <AddReportIcon className="h-6 w-6" /> */}
      <div className="[&_path]:fill-[#fff] group-hover:[&_path]:fill-[#fff] transition-colors">
                  <AddReportIcon
                    className="animate-pulse h-7 w-7"
                  />
                </div>
    </NavLink>

    {/* Navigation Links */}
    <div className="w-full px-4 flex justify-between">
      <NavLink 
        to="dashboard" 
       
        className={`
          ${activeRoute('deployment/dashboard')}
        group flex flex-col items-center text-gray-300 hover:text-white text-xs hover:my-red-bg hover:no-underline p-2 px-4`}
    
        // onClick={toggleSidebar}
      >
        
        <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
                    <DashboardIcon
                      className=" h-7 w-7 mb-1"
                    />
                  </div>
                  <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors'>
                    Dashboard
                  </span>
      </NavLink>

      <NavLink 
        to="data_view" 
        className={`
          ${activeRoute('deployment/data_view')}
        group flex flex-col items-center text-gray-300 hover:text-white text-xs hover:my-red-bg hover:no-underline p-2 px-4`}
        // onClick={toggleSidebar}
      >
        <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
                    <CardViewIcon
                      className="h-7 w-7"
                    />
                  </div>
                  <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors'>
                    Card View
                  </span>
      </NavLink>

      <NavLink 
        to="map_view" 
        className={`
          ${activeRoute('deployment/map_view')}
        group flex flex-col items-center text-gray-300 hover:text-white text-xs hover:my-red-bg hover:no-underline p-2 px-4`}
        // onClick={toggleSidebar}
      >
        <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
                    <MapViewIcon
                      className=" h-7 w-7 mb-1"
                    />
                  </div>
                  <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors'>
                    Map View
                  </span>
      </NavLink>
    </div>
  </div>
</div>
   </>
  );
};
export default NavBottom;