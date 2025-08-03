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
import React, { Component,useEffect } from "react";
import { useLocation, Route, Switch, } from "react-router-dom";


import { motion, AnimatePresence } from "framer-motion";

import routes from "routes.js";

import sidebarImage from "../assets/img/sidebar-3.jpg";
import FrontNavbar from "./FrontNavbar";
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toggleToaster, selectToasterData, selectToasterStatus } from '../provider/features/helperSlice';

function PagesLayout() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const pathname = location.pathname;
  const mainPanel = React.useRef(null);
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/pages") {
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
  React.useEffect(() => {
    // document.documentElement.scrollTop = 0;
    // document.scrollingElement.scrollTop = 0;
    // mainPanel.current.scrollTop = 0;
    // if (
    //   window.innerWidth < 993 &&
    //   document.documentElement.className.indexOf("nav-open") !== -1
    // ) {
    //   document.documentElement.classList.toggle("nav-open");
    //   var element = document.getElementById("bodyClick");
    //   element.parentNode.removeChild(element);
    // }
  }, [location]);
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
      {/* <div className="wrapper"> */}
      {/* <Sidebar color={color} image={hasImage ? image : ""} routes={routes} /> */}
      {/* <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content"> */}
      {/* <FrontNavbar transparent />
            <Switch>{getRoutes(routes)}</Switch> */}
      {/* </div>
          <Footer />
        </div> */}
      {/* </div> */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={pathname}
          initial="initialState"
          animate="animateState"
          exit="exitState"
          transition={{
            duration: 0.75,
          }}
          variants={{

          }}
          // className="base-page-size"
        >
          {/* <FrontNavbar transparent /> */}
          <Switch>{getRoutes(routes)}</Switch>
        </motion.div>
      </AnimatePresence>

    </>
  );
}

export default PagesLayout;
