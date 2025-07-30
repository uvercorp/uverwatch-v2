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
import React, { Component,useEffect,useState } from "react";
import { useLocation,useHistory, Route, Switch } from "react-router-dom";

import AdminNavbar from "../components/Navbars/AdminNavbar";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";

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
  let navigate = useHistory();
  const getRoutes = (routes) => {
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
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);
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
      if(depType == "private" && (isSignIn =="no" || isSignIn == undefined)){
        window.location.replace('/pages/login');
      }
    }else{
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
      <div className="wrapper">
        <Sidebar user={user} deployment={deployment} isLogin={userLogin} color={color} image={hasImage ? image : ""} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar user={user} isLogin={userLogin}/>
          <div className="content" style={{padding:0}}>
            <Switch>{getRoutes(routes)}</Switch>
          </div>
          <Footer />
        </div>
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
