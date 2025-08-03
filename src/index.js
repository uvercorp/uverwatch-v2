import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import PagesLayout from "layouts/PagesLayout";
import ReduxProvider from "provider/redux/ReduxProvider";
import AdminNotFound from "views/pages/notfound/AdminNotFound";
import PagesNotFound from "views/pages_client/notfound/PagesNotFound";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ReduxProvider>
    <BrowserRouter>
      <Switch>
        <Route path="/deployment" render={(props) => <AdminLayout {...props} />} />
        <Route path="/pages" render={(props) => <PagesLayout {...props} />} />
        <Redirect exact from="/" to="/pages/login" />

        {/* Catch-all for admin paths */}
        <Route path="/deployment/*" component={AdminNotFound} />

        {/* Catch-all for pages paths */}
        <Route path="/pages/*" component={PagesNotFound} />

        {/* Global catch-all for any other paths */}
        <Route component={PagesNotFound} />
      </Switch>
    </BrowserRouter>
  </ReduxProvider>
);