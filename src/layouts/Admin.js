/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component, useEffect, useState } from "react";
import { useLocation, useHistory, Route, Switch } from "react-router-dom";

import AdminNavbar from "../components/Navbars/AdminNavbar";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import NavBottom from "../components/NavBottom/NavBottom";
import { MobileRestrictedRoute } from '../components/MobileRestrictedRoute';

import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toggleToaster, selectToasterData, selectToasterStatus } from '../provider/features/helperSlice';

import routes from "routes.js";

import sidebarImage from "assets/img/sidebar-3.jpg";

function Admin() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const getRoutesold = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/deployment") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };


// Modify the getRoutes function in your Admin component
const getRoutes = (routes) => {
  return routes.map((prop, key) => {
    if (prop.layout === "/deployment") {
      const Component = prop.component;
      return (
        <Route
          path={prop.layout + prop.path}
          render={(props) => (
            prop.mobileRestricted ? (
              <MobileRestrictedRoute>
                <Component {...props} />
              </MobileRestrictedRoute>
            ) : (
              <Component {...props} />
            )
          )}
          key={key}
        />
      );
    } else {
      return null;
    }
  });
};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const dispatch = useDispatch();
  const onToast = useSelector(selectToasterStatus);
  const toastData = useSelector(selectToasterData);
  const callToast = (type, msg) => {
    if (type == 'success') {
      toast.success(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (type == 'error') {
      toast.error(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (type == 'warning') {
      toast.warn(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else if (type == 'info') {
      toast.info(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      // toast(msg);
    }
    dispatch(toggleToaster({ isOpen: false, toasterData: { type: "", msg: "" } }))

  }
  useEffect(() => {
    //  callToast('success',"ndessage");
    callToast(toastData.type, toastData.msg);
  }, [onToast]);

  const [user, setUser] = useState();
  const [deployment, setDeployment] = useState();
  const [userLogin, setUserLogin] = useState();

  useEffect(() => {

    if (localStorage.getItem('currentUser')) {
      let uData = JSON.parse(localStorage.getItem('currentUser') ?? '{}');
      setUser(uData);
      let uLogin = localStorage.getItem('is_login') ?? '{}';
      setUserLogin(uLogin);
      let dData = JSON.parse(localStorage.getItem('deployment') ?? '{}');
      setDeployment(dData);
    }



  }, []);

  useEffect(() => {
    let deployment = localStorage.getItem('settings');
    if (deployment && deployment !== undefined) {
      let depType = JSON.parse(deployment).deployment_type;
      let isSignIn = localStorage.getItem('is_login')
      if (depType == "private" && (isSignIn == "no" || isSignIn == undefined)) {
        window.location.replace('/pages/login');
      }
    } else {
      window.location.replace('/pages/login');
    }

  }, [location]);

  return (
    <>
      <ToastContainer position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} deployment={deployment} isLogin={userLogin} color={color} image={hasImage ? image : ""} routes={routes} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
            onClick={toggleSidebar}
          ></div>
        )}
        {/* <div className="flex-1 md:ml-64"> */}

        <div className="flex-1 lg:ml-64 overflow-auto">

          <div className="flex lg:flex lg:items-end justify-between my-black-bg">
            <div className="p-4 lg:hidden ">
              <button
                onClick={toggleSidebar}
                className="text-gray-300 hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* <div>.</div> */}
            <AdminNavbar user={user} isLogin={userLogin}/>

          </div>
          {/* <div className="flex-1 p-6 bg-gray-100 min-h-screen"> */}
          {/* <div className="flex-1 p-6 bg-gray-100 h-full"> */}

          <div className="pb-[120px] lg:pb-0  overflow-auto my-black-bg pt-2 lg:pt-0">

            <Switch>{getRoutes(routes)}</Switch>
          </div>

          {/* <MainContent /> */}
        </div>
        <NavBottom isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} deployment={deployment} isLogin={userLogin} routes={routes} />
      </div>
      {/* <FixedPlugin
        hasImage={hasImage}
        setHasImage={() => setHasImage(!hasImage)}
        color={color}
        setColor={(color) => setColor(color)}
        image={image}
        setImage={(image) => setImage(image)}
      /> */}
    </>
  );
}

export default Admin;
