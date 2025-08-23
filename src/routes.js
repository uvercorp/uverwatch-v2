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
// import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";
import Icons from "views/Icons.js";
import Maps from "views/Maps.js";
import Notifications from "views/Notifications.js";
import Upgrade from "views/Upgrade.js";
import MapPage from "views/pages/map_view/MapPage";
import SettingsPage from "views/pages/settings/SettingsPage";
import ActivityPage from "views/pages/activity/ActivityPage";
import DashboardPage from "views/pages/dashboard/DashboardPage";
import DataViewPage from "views/pages/data_view/DataViewPage";
import IncomingPage from "views/pages/whatsapp/IncomingPage";
import UserProfilePage from "views/pages/user_profile/UserProfilePage";
import CollectionPage from "views/pages/collection/CollectionPage";
import HelpPage from "views/pages/help/HelpPage";
import WelcomePage from "views/pages_client/welcome/WelcomePage";
import CreateDeploymentPage from "views/pages_client/create_deployment/CreateDeploymentPage";
import LoginPage from "views/pages_client/login/LoginPage";
import EmailVerificationPage from "views/pages_client/emailVerification/EmailVerificationPage";
import MapTest from "views/Maptest";
import PostPage from "views/pages/posts/PostPage";
import MapLocationDetection from "views/pages/settings/general/MapLocationDetection";
import EntityPage from "views/pages/entities/EntityPage";
import DetailedSingleData from "views/pages/data_view/options/DetailedSingleData";
import AdminNotFound from "views/pages/notfound/AdminNotFound";
import MobileNotAllowed from "views/pages/mobile-not-allowed/MobileNotAllowed";
import PagesNotFound from "views/pages_client/notfound/PagesNotFound";

const dashboardRoutes = [
  {
    path: "/map_view",
    name: "Map View",
    icon: "nc-icon nc-pin-3",
    component: MapPage,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/post",
    name: "Reports",
    icon: "nc-icon nc-pin-3",
    component: PostPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/post/add",
    name: "Add New Report",
    icon: "nc-icon nc-pin-3",
    component: PostPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/data_view",
    name: "Data View",
    icon: "nc-icon nc-layers-3",
    component: DataViewPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/incoming",
    name: "Whatsapp Incoming Report",
    icon: "nc-icon nc-layers-3",
    component: IncomingPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/entity",
    name: "Entities",
    icon: "nc-icon nc-pin-3",
    component: EntityPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/entity/add",
    name: "Add New Entity",
    icon: "nc-icon nc-pin-3",
    component: EntityPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/activity",
    name: "Activity",
    icon: "nc-icon nc-bullet-list-67",
    component: ActivityPage,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "nc-icon nc-settings-gear-64",
    component: SettingsPage,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-settings-gear-64",
    component: DashboardPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/collections",
    name: "Collections",
    icon: "nc-icon nc-circle-09",
    component: CollectionPage,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "/detailed",
    name: "Detailed View",
    icon: "nc-icon nc-circle-09",
    component: DetailedSingleData,
    layout: "/deployment",
    mobileRestricted: false,
  },
  // {
  //   path: "/help",
  //   name: "Help And Support",
  //   icon: "nc-icon nc-circle-09",
  //   component: HelpPage,
  //   layout: "/deployment"
  // },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfilePage,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/maps",
    name: "Map View",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/table",
    name: "Table List",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-paper-2",
    component: Typography,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "nc-icon nc-atom",
    component: Icons,
    layout: "/deployment",
    mobileRestricted: true,
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "nc-icon nc-bell-55",
    component: Notifications,
    layout: "/deployment",
    mobileRestricted: true,
  },
  // {
  //   path: "",
  //   name: "Welcome",
  //   icon: "nc-icon nc-bell-55",
  //   component: WelcomePage,
  //   layout: "/pages"
  // },
  {
    path: "/welcome",
    name: "Welcome",
    icon: "nc-icon nc-bell-55",
    component: WelcomePage,
    layout: "/pages",
  },
  {
    path: "/create",
    name: "Create Deployment",
    icon: "nc-icon nc-bell-55",
    component: CreateDeploymentPage,
    layout: "/pages",
  },
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-bell-55",
    component: LoginPage,
    layout: "/pages",
  },
  {
    path: "/verify-email",
    name: "Email Verification",
    icon: "nc-icon nc-bell-55",
    component: EmailVerificationPage,
    layout: "/pages",
  },
  {
    path: "/mobile-not-allowed",
    name: "Mobile Restricted",
    component: MobileNotAllowed,
    layout: "/deployment"
  },
  {
    path: "*",
    name: "Not Found",
    icon: "nc-icon nc-bell-55",
    component: AdminNotFound,
    layout: "/deployment",
    mobileRestricted: false,
  },
  {
    path: "*",
    name: "Not Found",
    icon: "nc-icon nc-bell-55",
    component: PagesNotFound,
    layout: "/pages",
  }

  // {
  //   path: "/maptest",
  //   name: "MapTest",
  //   icon: "nc-icon nc-bell-55",
  //   component: MapTest,
  //   layout: "/deployment"
  // }
];

export default dashboardRoutes;
