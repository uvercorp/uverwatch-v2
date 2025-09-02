
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


function Sidebar({isOpen, toggleSidebar, color, image, routes,deployment,user,isLogin }) {
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

    useEffect(() => {
  let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {

    }else{

      window.location.replace('/pages/login');
    }
  }, [location]);

  return (<>
    <div className={`fixed inset-y-0 left-0 w-64 z-[1800] my-black-bg text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out `} style={{borderRight: "1px solid gray"}}>
    {/* <div className={`fixed inset-y-0 left-0 w-64 my-black-bg text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-[800]`}> */}

      <div className=' border-b border-gray-700 grid grid-col-1 pl-2'>
        <div className="flex items-center justify-between p-2 mt-3 ">
          <div className='flex item-start'>
            <img src="../../favicon/favicon-32x32.png" className='mr-2 mt-1 h-7 w-7' />
            <h1 className="text-3xl my-sidebar-color my-font-family-evogria">UVERWATCH</h1>

          </div>
          <button onClick={toggleSidebar} className="md:hidden my-black-bg text-gray-100 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>


        </div>
        {/* <div className=' grid grid-col-1 items-start justify-start'> */}
        <p className='pl-1 mb-2 my-font-family-ailerons text-[1.6em]'>{deployment?.display_name}</p>
        <p className='pl-2 mb-4 font-bold my-sidebar-color my-font-family-courier-prime text-[1.3em]'>POV :{user?.name.split(' ')[0]}</p>
        {/* </div> */}

      </div>
      <div className='px-3'>
        {/* <nav className="mt-4"> */}

        <NavLink
          key=''
          to='/deployment/post'
          className={`
            ${activeRoute('deployment/post')}
          group mt-3 hidden md:flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}

          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <AddReportIcon
              className="animate-pulse h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Add Report
          </span>

        </NavLink>
        <NavLink
          key=''
          to='entity'
          className={`
            ${activeRoute('deployment/entity')}
          group mt-3 flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <AddEntityIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Add Entity
          </span>

        </NavLink>
        <NavLink
          key=''
          to={collectionOn ? 'map_view?collection='+collectionId : 'map_view'}
          className={`
            ${activeRoute('deployment/map_view')}
          group mt-3 hidden md:flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <MapViewIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Map View
          </span>

        </NavLink>

        <NavLink
          key=''
          to={collectionOn ? 'data_view?collection='+collectionId : 'data_view'}
          className={`
            ${activeRoute('deployment/data_view')}
          group mt-3 hidden md:flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <CardViewIcon
              className="h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Card View
          </span>

        </NavLink>

        <a
          key=''
          href='#'
          className={`
            ${activeRoute('deployment/collections')}
          group mt-3 flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          // onClick={toggleSidebar}
          onClick={() => {toggleSidebar();setShow(true);}}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <CollectionIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] hover:no-underline transition-colors'>
            Collections
          </span>

        </a>

        <NavLink
          key=''
          to='dashboard'
          className={`
            ${activeRoute('deployment/dashboard')}
          group mt-3 hidden md:flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <DashboardIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Dashboard
          </span>

        </NavLink>
        <NavLink
          key=''
          to='incoming'
          className={`
            ${activeRoute('deployment/incoming')}
          group mt-3 hidden md:flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <DashboardIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
             Whatsapp Report
          </span>

        </NavLink>
        {isLogin == 'yes' &&

        <NavLink
          key=''
          to='settings'
          className={`
            ${activeRoute('deployment/settings')}
          group mt-3 flex items-start border-gray-700 px-3 py-2 text-gray-200 hover:my-red-bg hover:no-underline"`}
          onClick={toggleSidebar}
          style={{border:"1px solid #25201a", textDecoration:"none"}}
        >
          <div className="[&_path]:fill-[#858c8e] group-hover:[&_path]:fill-[#f5f5f5] mr-2 transition-colors">
            <SettingsIcon
              className=" h-7 w-7"
            />
          </div>
          <span className='my-sidebar-link group-hover:text-[#f5f5f5] transition-colors my-font-family-overpass-mono '>
            Settings
          </span>

        </NavLink>

        }
        {/* <nav className="mt-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white"
              onClick={toggleSidebar}
            >
              {item.name}
            </navlink>
          ))}
        </nav> */}
      </div>

    </div>
    <CollectionPage show={show} setShow={setShow}/>
    <HelpPage showHelp={showHelp} setShowHelp={setShowHelp}/>
</>);
};
export default Sidebar;