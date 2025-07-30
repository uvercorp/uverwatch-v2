import { React, useState,useEffect } from "react";

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
  Tab
} from "react-bootstrap";

import { useLocation,useHistory } from "react-router-dom";

import {toggleLoadingBar,selectLoadingBar,toggleToaster,selectToasterData,selectToasterStatus} from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import LoadingIcon from 'others/icons/LoadingIcon';
import  axiosInstance  from "services/axios";
import {login,logout, selectUser} from 'provider/features/userSlice';


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

function SettingsPage() {
  const [pending, setPending] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);
  const [deploymentData, setDeploymentData] = useState(false);
  let locat = useLocation();
   const dispatch = useDispatch();
  let navigate = useHistory();
  const [currentPage, setCurrentPage] = useState('general');

  const toggleCurrentPage = (page) => {
    setCurrentPage(page);
}
useEffect(()=>{
  let deployment = localStorage.getItem('deployment');
  if (deployment && deployment !== undefined) { 
    // let dData = JSON.parse(localStorage.getItem('deployment') ?? '{}');
     getDeploymentData(JSON.parse(deployment).id);
   
    // console.log(JSON.parse(deployment));
    // console.log(JSON.parse(deployment).id);
  }
  
},[]);

const getDeploymentData = async (deployment_id)=>{
  try {
    setPending(true);
      const response = await axiosInstance.get('getDeploymentData/'+deployment_id,
        {
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('access')}`
           },
          //   withCredentials: true
        }
    );
    // console.log(response)
    
    // console.log(JSON.stringify(response?.data));
   if(response?.data){
    let dData = response?.data?.deployment_data;
    setDeploymentData(dData);
    // console.log(dData);
    setPending(false);

   }
    } catch (err) {
      
      if (!err?.response) {
      dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))
    } else if (err.response?.status === 400) {
       dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:loginErrors}}))
    } else if (err.response?.status === 401) {
      dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:err?.response.data['detail']}}))

    } else {
      
      dispatch(toggleToaster({isOpen:true,toasterData:{type:"error",msg:"Loading Failed, Check your internet and try again"}}))
      
    }
  
    }



}
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="3">
            <Card className="card-SettingsPage p-2 pr-4 grid grid-cols-2 gap-1 max-h-[650px] overflow-y-auto scrollbar scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400">
              <div onClick={() => toggleCurrentPage('general')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'general' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>General</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Change your deployment name, description, logo and other details</p>
              </div>
              
              <div onClick={() => toggleCurrentPage('surveys')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'surveys' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Surveys</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create and configure the surveys your deployment collects</p>
              </div>
              <div onClick={() => toggleCurrentPage('entity_layer')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'entity_layer' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Entity Layer</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create and configure the Entity your deployment Creates</p>
              </div>
              <div onClick={() => toggleCurrentPage('category')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'category' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Category</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create categories that your post can be grouped under</p>
              </div>
              <div onClick={() => toggleCurrentPage('tag')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'tag' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Tags</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create Tags that your post can be grouped with</p>
              </div>
              <div onClick={() => toggleCurrentPage('icon_library')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'icon_library' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Icon Library</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>List of Icon set that your deployment can choose from </p>
              </div>
              <div onClick={() => toggleCurrentPage('access_levels')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'access_levels' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Access Levels</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create And configure </p>
              </div>
              <div onClick={() => toggleCurrentPage('priority_levels')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'priority_levels' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Priority Levels</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create And configure </p>
              </div>
              <div onClick={() => toggleCurrentPage('impact_levels')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'impact_levels' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Impact Levels</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create And configure </p>
              </div>
              <div onClick={() => toggleCurrentPage('status')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'status' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Statuses</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create And configure </p>
              </div>
              <div onClick={() => toggleCurrentPage('users')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'users' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Users</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Teams Associated with you</p>
              </div>
              <div onClick={() => toggleCurrentPage('teams')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'teams' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Teams</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Manage People contributing to your deployment</p>
              </div>
              <div onClick={() => toggleCurrentPage('roles')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'roles' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Roles</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Create and manage user permissions</p>
              </div>

              <div onClick={() => toggleCurrentPage('geofence')} className={`min-h-[90px] shadow-sm rounded-sm cursor-pointer border border-1  border-gray-500 py-2 px-1 hover:text-[#FF9500] hover:border-y-yellow-600  ${currentPage == 'geofence' ? 'text-[#FF9500]' : 'text-[#000]' }`} >
                <div className="flex items-start gap-3">

                  <i className="nc-icon nc-pin-3 " style={{ fontSize: "18px" }} />
                  <h style={{ fontSize: "1.2em" }}>Geofences</h>

                </div>
                <p className="text-gray-500 mt-2 " style={{ fontSize: "13px" }}>Manage Geofence</p>
              </div>

            </Card>

          </Col>
          <Col md="9">
            {currentPage == 'general' &&
              <GeneralSettingsPage  organizationSizes ={deploymentData?.organization_sizes} deploymentCategories={deploymentData?.deployment_categories} />
            }
            {currentPage == "surveys" &&
              <SurveysPage surveys={deploymentData?.surveys}/>
            }
            {currentPage == "entity_layer" &&
              <EntitySurveysPage surveys={deploymentData?.surveys}/>
            }
            {currentPage == "icon_library" && <>
              {/* <IconLibraryPage /> */}
              <IconListPage/>
              </>
            }
            {currentPage == "category" &&
              <CategoryPage categories={deploymentData?.categories}/>
            }
            {currentPage == "tag" &&
              <TagPage />
            }
              {currentPage == "access_levels" &&
              <AccessLevelPage />
            }
            {currentPage == "impact_levels" &&
              <ImpactLevelPage />
            }
             {currentPage == "priority_levels" &&
              <PriorityLevelPage />
            }
            {currentPage == "status" &&
              <DeploymentStatusPage />
            }
            {currentPage == "users" &&
              <UsersPage />
            }
            {currentPage == "teams" &&
              <TeamPage />
            }
            {currentPage == "roles" &&
              <RolesPage />
            }

{currentPage == "geofence" &&
              <GoefencePage />
            }
            


          </Col>

        </Row>
      </Container>
    </>
  );
}

export default SettingsPage;
