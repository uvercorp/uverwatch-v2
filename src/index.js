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
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";

// import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import PagesLayout from "layouts/PagesLayout";
import ReduxProvider from "provider/redux/ReduxProvider";
import App from "App";
// import ReduxProvider from './provider/redux/ReduxProvider'

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ReduxProvider>
  <BrowserRouter>
    <Switch>
      <Route path="/deployment" render={(props) => <AdminLayout {...props} />} />
      <Route path="/pages" render={(props) => <PagesLayout {...props} />} />
      <Redirect from="/" to="/pages/login" />
      {/* <Redirect from="/" to="/pages/create" /> */}
      {/* <Redirect from="/pages" to="/pages/welcome" /> */}
    </Switch>
  </BrowserRouter>
  </ReduxProvider>
  // <App/>
);
