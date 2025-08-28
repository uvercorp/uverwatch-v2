import { React, useState, useEffect } from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Tab,
} from "react-bootstrap";

import { useLocation, useHistory } from "react-router-dom";

import {
  toggleLoadingBar,
  selectLoadingBar,
  toggleToaster,
  selectToasterData,
  selectToasterStatus,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "others/icons/LoadingIcon";
import axiosInstance from "services/axios";
import { login, logout, selectUser } from "provider/features/userSlice";

import GeneralSettingsPage from "./general/GeneralSettingsPage";
import SurveysPage from "./surveys/SurveysPage";
import CategoryPage from "./categories/CategoryPage";
import UsersPage from "./users/UsersPage";
import RolesPage from "./roles/RolesPage";
import EntitySurveysPage from "./entity_surveys/EntitySurveysPage";
import IconLibraryPage from "./icon_library/IconLibraryPage";
import IconListPage from "./icon_library/IconListPage";
import AccessLevelPage from "./access_level/AccessLevelPage";
import ImpactLevelPage from "./impact_level/ImpactLevelPage";
import PriorityLevelPage from "./priority_level/PriorityLevelPage";
import DeploymentStatusPage from "./status/DeploymentStatusPage";
import TeamPage from "./teams/TeamPage";
import TagPage from "./tags/TagPage";
import GoefencePage from "./geofence/GeofencePage";
import UserGeofenceManager from "../../../components/AdminPanel/UserGeofenceManager";

function SettingsPage() {
  const [pending, setPending] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);
  const [deploymentData, setDeploymentData] = useState(false);
  let locat = useLocation();
  const dispatch = useDispatch();
  let navigate = useHistory();
  const [currentPage, setCurrentPage] = useState("surveys");
  const [currentTab, setCurrentTab] = useState("schema");

  const toggleCurrentPage = (page, tab = "schema") => {
    setCurrentPage(page);
    // setCurrentTab(tab);
  };
  const toggleCurrentTab = (tab = "schema") => {
    setCurrentTab(tab);
    if(tab == 'system'){
      setCurrentPage('general');
    }
    if (tab == 'user_geofence_manager') {
      setCurrentPage('user_geofence_manager');
    }

    if(tab == 'accesses'){
      setCurrentPage('access_levels');
    }

    if(tab == 'schema'){
      setCurrentPage('surveys');
    }
    if(tab == 'tools'){
      setCurrentPage('icon_library');
    }
  };
  useEffect(() => {
    let deployment = localStorage.getItem("deployment");
    if (deployment && deployment !== undefined) {
      // let dData = JSON.parse(localStorage.getItem('deployment') ?? '{}');
      getDeploymentData(JSON.parse(deployment).id);

      // console.log(JSON.parse(deployment));
      // console.log(JSON.parse(deployment).id);
    }
  }, []);

  const getDeploymentData = async (deployment_id) => {
    try {
      setPending(true);
      const response = await axiosInstance.get(
        "getDeploymentData/" + deployment_id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          //   withCredentials: true
        }
      );
      // console.log(response)

      // console.log(JSON.stringify(response?.data));
      if (response?.data) {
        let dData = response?.data?.deployment_data;
        setDeploymentData(dData);
        // console.log(dData);
        setPending(false);
      }
    } catch (err) {
      if (!err?.response) {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: {
              type: "error",
              msg: "Loading Failed, Check your internet and try again",
            },
          })
        );
      } else if (err.response?.status === 400) {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "error", msg: loginErrors },
          })
        );
      } else if (err.response?.status === 401) {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: { type: "error", msg: err?.response.data["detail"] },
          })
        );
      } else {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: {
              type: "error",
              msg: "Loading Failed, Check your internet and try again",
            },
          })
        );
      }
    }
  };
  const tabs = ["System", "Schema", "Accesses", "Tools"];
  return (
    <div className="min-h-screen">
      <div className="flex items-start space-x-8  bg-black text-white font-mono pl-4">
        <h1 className="text-4xl  my-font-family-ailerons tracking-widest mb-6">
          SETTINGS
        </h1>

        {/* Tabs */}
        <div className="flex space-x-0 mb-4">
          {/* {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              tab === 'Schema' ? ' bg-gray-400 border-gray-500 text-black ' : 'bg-gray-900 border-gray-700'
            }`}
          >
            {tab}
          </button>
        ))} */}

          <button
          onClick={() => toggleCurrentTab('system')}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              currentTab === "system"
                ? " bg-gray-400 border-gray-500 text-black "
                : "my-black-bg border-gray-700"
            }`}
          >
            System
          </button>
          <button
          onClick={() => toggleCurrentTab('schema')}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              currentTab === "schema"
                ? " bg-gray-400 border-gray-500 text-black "
                : "my-black-bg border-gray-700"
            }`}
          >
            Schema
          </button>
          <button
          onClick={() => toggleCurrentTab('accesses')}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              currentTab === "accesses"
                ? " bg-gray-400 border-gray-500 text-black "
                : "my-black-bg border-gray-700"
            }`}
          >
            Accesses
          </button>
          <button
          onClick={() => toggleCurrentTab('tools')}
            className={`px-4 py-2 my-font-family-overpass-mono border ${
              currentTab === "tools"
                ? " bg-gray-400 border-gray-500 text-black "
                : "my-black-bg border-gray-700"
            }`}
          >
            Tools
          </button>
        </div>
      </div>
      <Container fluid className="my-black-bg">
        <Row>
          <Col md="4" className=" md:max-h-[650px] md:min-h-[580px]" style={{borderRight:"1px solid #f5f5f5"}}>
            <div className="space-y-3  p-2 pr-4 grid grid-cols-1 gap-1  my-scrollbar my-black-bg" >
            {currentTab == "system" && (<>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("general", "system")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "general"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>General: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Change your deployment name, description, logo and other
                  details
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("users")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "users"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Users: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Teams Associated with you
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("teams")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "teams"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Teams: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Manage People contributing to your deployment
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("roles")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "roles"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Roles: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create and manage user permissions
                </p>
              </div>
                <div
                  style={{ border: "1px solid #515153" }}
                  onClick={() => toggleCurrentPage("user_geofence_manager")}
                  className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${currentPage == "user_geofence_manager"
                      ? "text-black bg-gray-400"
                      : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                    }`}
                >
                  <div className="flex items-start gap-3 my-font-family-overpass-mono">
                    <i
                      className="nc-icon nc-pin-3 "
                      style={{ fontSize: "18px" }}
                    />
                    <h className="font-semibold" style={{ fontSize: "1.2em" }}>User Geofence Manager: </h>
                  </div>
                  <p
                    className=" mt-2 "
                    style={{ fontSize: "13px", paddingLeft: "10px" }}
                  >
                    Manage user geofence assignments and restrictions
                  </p>
                </div>
              </>
              )}

              {currentTab == "schema" && (<>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("surveys", "schema")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "surveys"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Taskings: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create and configure the surveys your deployment collects
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("entity_layer", "schema")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "entity_layer"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Entity Layer: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create and configure the Entity your deployment Creates
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("category", "schema")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "category"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Categories: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create categories that your post can be grouped under
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("tag", "schema")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "tag"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Tags: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Create Tags that your post can be grouped with
                </p>
              </div>
            </>)}
            {currentTab == "tools" && (<>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("icon_library", "tools")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "icon_library"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Icon Library: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  List of Icon set that your deployment can choose from{" "}
                </p>
              </div>
              <div
                style={{ border: "1px solid #515153" }}
                onClick={() => toggleCurrentPage("geofence")}
                className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                  currentPage == "geofence"
                    ? "text-black bg-gray-400"
                    : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 my-font-family-overpass-mono">
                  <i
                    className="nc-icon nc-pin-3 "
                    style={{ fontSize: "18px" }}
                  />
                  <h className="font-semibold" style={{ fontSize: "1.2em" }}>Geofences: </h>
                </div>
                <p
                  className=" mt-2 "
                  style={{ fontSize: "13px", paddingLeft: "10px" }}
                >
                  Manage Geofence
                </p>
              </div>
            </>)}
              {currentTab == "accesses" && (
                <>
                  <div
                    style={{ border: "1px solid #515153" }}
                    onClick={() =>
                      toggleCurrentPage("access_levels", "accesses")
                    }
                    className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                      currentPage == "access_levels"
                        ? "text-black bg-gray-400"
                        : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 my-font-family-overpass-mono">
                      <i
                        className="nc-icon nc-pin-3 "
                        style={{ fontSize: "18px" }}
                      />
                      <h className="font-semibold" style={{ fontSize: "1.2em" }}>Access Levels: </h>
                    </div>
                    <p
                      className=" mt-2 "
                      style={{ fontSize: "13px", paddingLeft: "10px" }}
                    >
                      Create And configure{" "}
                    </p>
                  </div>
                  <div
                    style={{ border: "1px solid #515153" }}
                    onClick={() =>
                      toggleCurrentPage("priority_levels", "accesses")
                    }
                    className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                      currentPage == "priority_levels"
                        ? "text-black bg-gray-400"
                        : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 my-font-family-overpass-mono">
                      <i
                        className="nc-icon nc-pin-3 "
                        style={{ fontSize: "18px" }}
                      />
                      <h className="font-semibold" style={{ fontSize: "1.2em" }}>Priority Levels: </h>
                    </div>
                    <p
                      className=" mt-2 "
                      style={{ fontSize: "13px", paddingLeft: "10px" }}
                    >
                      Create And configure{" "}
                    </p>
                  </div>
                  <div
                    style={{ border: "1px solid #515153" }}
                    onClick={() =>
                      toggleCurrentPage("impact_levels", "accesses")
                    }
                    className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                      currentPage == "impact_levels"
                        ? "text-black bg-gray-400"
                        : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 my-font-family-overpass-mono">
                      <i
                        className="nc-icon nc-pin-3 "
                        style={{ fontSize: "18px" }}
                      />
                      <h className="font-semibold" style={{ fontSize: "1.2em" }}>Impact Levels: </h>
                    </div>
                    <p
                      className=" mt-2 "
                      style={{ fontSize: "13px", paddingLeft: "10px" }}
                    >
                      Create And configure{" "}
                    </p>
                  </div>
                  <div
                    style={{ border: "1px solid #515153" }}
                    onClick={() => toggleCurrentPage("status", "accesses")}
                    className={`min-h-[115px] max-h-[115px] shadow-sm cursor-pointer  py-2 px-1  hover:border-y-yellow-600  ${
                      currentPage == "status"
                        ? "text-black bg-gray-400"
                        : "text-[#dbdbde] bg-[#333333] hover:text-black hover:bg-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 my-font-family-overpass-mono">
                      <i
                        className="nc-icon nc-pin-3 "
                        style={{ fontSize: "18px" }}
                      />
                      <h className="font-semibold" style={{ fontSize: "1.2em" }}>Statuses: </h>
                    </div>
                    <p
                      className=" mt-2 "
                      style={{ fontSize: "13px", paddingLeft: "10px" }}
                    >
                      Create And configure{" "}
                    </p>
                  </div>
                </>
              )}



            </div>
          </Col>
          <Col md="8" className="">
            {currentPage == "general" && (
              <GeneralSettingsPage
                organizationSizes={deploymentData?.organization_sizes}
                deploymentCategories={deploymentData?.deployment_categories}
              />
            )}
            {currentPage == "surveys" && (
              <SurveysPage surveys={deploymentData?.surveys} />
            )}
            {currentPage == "entity_layer" && (
              <EntitySurveysPage surveys={deploymentData?.surveys} />
            )}
            {currentPage == "icon_library" && (
              <>
                {/* <IconLibraryPage /> */}
                <IconListPage />
              </>
            )}
            {currentPage == "category" && (
              <CategoryPage categories={deploymentData?.categories} />
            )}
            {currentPage == "tag" && <TagPage />}
            {currentPage == "access_levels" && <AccessLevelPage />}
            {currentPage == "impact_levels" && <ImpactLevelPage />}
            {currentPage == "priority_levels" && <PriorityLevelPage />}
            {currentPage == "status" && <DeploymentStatusPage />}
            {currentPage == "users" && <UsersPage />}
            {currentPage == "teams" && <TeamPage />}
            {currentPage == "roles" && <RolesPage />}
            {currentPage == "user_geofence_manager" && <UserGeofenceManager deploymentId={deploymentData?.id || JSON.parse(localStorage.getItem('deployment'))?.id} />}

            {currentPage == "geofence" && <GoefencePage />}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SettingsPage;
