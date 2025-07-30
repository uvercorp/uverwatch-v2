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
  Tab
} from "react-bootstrap";
import { useLocation, NavLink } from "react-router-dom";
import MapTest from "views/Maptest";
import LocationSelectMap from "./LocationSelectMap";
import Spinner from 'react-bootstrap/Spinner';
import MapPositionSelect from "views/pages/posts/MapPositionSelect";
import ImageInput from "./ImageInput";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from "services/axios";

function GeneralSettingsPage(props) {
  const [settingsData, setSettingsData] = useState();
  const [deploymentData, setDeploymentData] = useState([]);
  const [deploymentDataReady, setDeploymentDataReady] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState(
    {
      id: '',
      about: '',
      name: '',
      email: '',
      latitude: '',
      longitude: '',
      size_of_organization: '',
      organization_name: '',
      display_name: '',
      deployment_category: '',
      description: '',
      full_address: '',
      formatted_address: '',
      
      
      logo: '',
      enable_user_signup: '',
      deployment_type: '',
      access_level: '',
      priority_level: '',
      impact_level: '',

    }
  );

  const setFormData = (deployment, settings) => {
    setFormValue({
      ...formValue,
      id: deployment.id,
      about: deployment.about,
      name: deployment.name,
      email: deployment.email,
      latitude: settings.latitude,
      longitude: settings.longitude,
      size_of_organization: deployment.size_of_organization,
      organization_name: deployment.organization_name,
      display_name: deployment.display_name,
      deployment_category: deployment.deployment_category,
      description: settings.description,
      logo: settings.logo,
      enable_user_signup: settings.enable_user_signup,
      deployment_type: settings.deployment_type,
      access_level: settings.access_level,
      priority_level: settings.priority_level,
      impact_level: settings.impact_level,
      full_address: settings.full_address,
      formatted_address_address: settings.formatted_address,

    });

  }



  useEffect(() => {
    let deployment = localStorage.getItem('deployment');
    if (deployment && deployment !== undefined) {

      getDeploymentData(JSON.parse(deployment).id);

    }
   
    if (deployment && deployment !== undefined) {
    
    }else{
    
      window.location.replace('/pages/login');
    }

  }, []);


  const getDeploymentData = async (deployment_id) => {

    try {
      setPending(true);
      const response = await axiosInstance.get('getDeploymentDataSettings/' + deployment_id,
        {
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('access')}`
          },
          //   withCredentials: true
        }
      );

      if (response?.data) {
        let dData = response?.data?.deployment_data;
        setFormData(response?.data?.deployment_data?.deployment, response?.data?.deployment_data?.settings);
        // setDeploymentData(dData);

        setPending(false);

      }
    } catch (err) {

      if (!err?.response) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))
      } else if (err.response?.status === 400) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: loginErrors } }))
      } else if (err.response?.status === 401) {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: err?.response.data['detail'] } }))

      } else {

        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "error", msg: "Loading Failed, Check your internet and try again" } }))

      }

    }



  }

  const handleChange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value
    });
  }
  const handleLocationChange = (lat, long,fullAddress,formattedAddress) => {
    setFormValue({
      ...formValue,
      longitude: long,
      latitude: lat,
      full_address: fullAddress,
      formatted_address: formattedAddress,
    });
  }

  
  const getAddress = async (lat,lng) => {
    // alert('here')
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'Your App Name/1.0 (your@email.com)',
                },
            }
        );
        // alert('is read')
        const data = await response.json();
        
        // Extract town and country from address components
        const fullAddress = data.display_name || 'Address not available';
        const address = data.address || {};
        const town = address.town || address.village || address.city || address.county || '';
        const country = address.country || '';

        
        // Format as "Town, Country" or fallbacks
        const formattedAddress = [town, country].filter(Boolean).join(', ') || 'Unknown location';
        // alert(formattedAddress);
        setFormValue({
          ...formValue,
          full_address: fullAddress,
          formatted_address: formattedAddress,
        });
    } catch (error) {
        console.error('Geocoding error:', error);
        // props?.onLocationChange(lat, lng, 'Location details unavailable');
    }
};


  const handleImageChange = (base64Data) => {
    // setBase64Image(base64Data);

    setFormValue({
      ...formValue,
      logo: base64Data
    });
  };

  const handleUpdate = () => {
    if (validateformData(formValue, setInvalidFields)) {
      updateRecordInstance(formValue);
    } else {
      setTimeout(() => {
        // Your data here
        setInvalidFields("");
      }, 5000)
    }

  }

  const [invalidFields, setInvalidFields] = useState('');
  function validateformData(formData, setInvalidFields) {
    const invalidFields = []; // Array to store invalid field messages
    // Check for empty required fields
    if (!formData.about) {
      invalidFields.push('About');
    }
    if (!formData.size_of_organization) {
      invalidFields.push('Organization Size');
    }
    if (!formData.organization_name) {
      invalidFields.push('Name of Organization');
    }
    if (!formData.deployment_category) {
      invalidFields.push('Category');
    }
    if (!formData.display_name) {
      invalidFields.push('Display Name');
    }



    if (invalidFields.length > 0) {
      const errorText = `Please fill in the following required fields: ${invalidFields.join(', ')}`;
      setInvalidFields(errorText); // Update state with comma-separated error message
      return false; // Invalid data
    }

    return true; // Valid data
  }

  const updateRecordInstance = async (data) => {

    setPending(true);
    const results = await axiosInstance.post('updateDeploymentDataSettings',
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
        //   withCredentials: true
      }
    );
    if (results?.data?.status == "success") {

      dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Deployment Updated Successfully" } }))

      setPending(false);
      // props.updateListRecord(results?.data?.data);
      setFormData(results?.data?.data?.deployment, results?.data?.data?.settings);
     
      localStorage.setItem('deployment',JSON.stringify(results?.data.data.deployment))
      localStorage.setItem('settings',JSON.stringify(results?.data.data.settings))
    }
  }

  return (
    <>

      <Card>
        <Card.Header>
          <Card.Title as="h4" className="flex items-start justify-between">
            <span>General</span>
            {pending && (<div className="flex items-center justify-center">
              <Spinner animation="grow" variant="warning" />
            </div>)}
          </Card.Title>
        </Card.Header>
        <Card.Body>

          <div className="relative">
            <Row>
              <Col className="pr-1" md="12">
                <Form.Group className="pr-2">
                  <label>Deployment Name </label>
                  <Form.Control
                    defaultValue="deployment."
                    disabled
                    placeholder="Deployment Name"
                    type="text"
                    name="name"
                    value={formValue?.name}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>


            </Row>
            <Row>
              <Col md="12">
                <Form.Group>
                  <label>About </label>
                  <Form.Control
                    cols="80"

                    placeholder="Describe Your Site Or Deployment"
                    rows="3"
                    // as="textarea"
                    value={formValue?.about}
                    onChange={handleChange}
                    name="about"
                    id="about"
                  >

                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mt-3">
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Display Name</label>
                  <Form.Control

                    placeholder="Display Name"
                    type="text"
                    value={formValue?.display_name}
                    name="display_name"
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col className="pl-1" md="6">
                <Form.Group>
                  <label htmlFor="exampleInputEmail1">
                    Contact Email address
                  </label>
                  <Form.Control
                    placeholder="Email"
                    type="email"
                    disabled
                    value={formValue?.email}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            
            {/* <br/> */}
            <Row className="mt-3">
              <Col className="pr-1" md="6">
                <label>Logo</label>
                <div className=" h-[250px] md:max-w-[400px] text-center items-center shawdow rounded-sm border border-1">

                  <ImageInput handleImageChange={handleImageChange} currentImage={formValue?.logo} />
                </div>
                {/* <Form.Group controlId="formFileSm" className="mb-3">
                  <Form.Label>Logo</Form.Label>
                  <Form.Control type="file" size="sm" />
                </Form.Group> */}
              </Col>
              <Col className="pr-1" md="6">
                <Form.Group className="pr-1">
                  <label>Organization Name</label>
                  <Form.Control

                    placeholder="Name of organization"
                    type="text"
                    value={formValue?.organization_name}
                    onChange={handleChange}
                    name="organization_name"
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>

              <Col className="pr-1" md="6">
                <Form.Group className="pr-2">
                  <label>Organization Size</label>

                  <br />
                  <Form.Select aria-label="Default select example" style={{ width: "100%" }} className="border border-gray-200 rounded-lg min-h-[2.5em]" required onChange={handleChange} value={formValue?.size_of_organization} name="size_of_organization">
                    <option>Select Size</option>
                    {props?.organizationSizes?.map((record, index) => (
                      <option key={index} value={record?.size}>{record?.size}</option>
                    ))}

                  </Form.Select>
                </Form.Group>

              </Col>
              <Col className="pr-1" md="6">
                <Form.Group className="pr-2">
                  <label>You are using Uverwatch for</label>

                  <Form.Select aria-label="Default select example" style={{ width: "100%" }} className="border border-gray-200 rounded-lg min-h-[2.5em] " required onChange={handleChange} value={formValue?.deployment_category} name="deployment_category">
                    <option>Select Category</option>
                    {props?.deploymentCategories?.map((record, index) => (
                      <option key={index} value={record?.id}>{record?.name}</option>
                    ))}

                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="12">
                <Form.Group className="pr-2 pt-3">
                  <label style={{ color: "#000" }}>Private Settings</label>
                </Form.Group>
                <hr />
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="12">
                <Form.Group className="pr-2">
                  <input
                    type="checkbox"
                    id="deployment_type"
                    name="deployment_type"
                    checked={formValue?.deployment_type === 'private'} // Check if deployment_type is 'private'
                    onChange={(e) => {
                      // Handle the change event to update the formValue
                      const newValue = e.target.checked ? 'private' : 'public';
                      // Update the formValue state (assuming you have a state setter function)
                      setFormValue({ ...formValue, deployment_type: newValue });
                    }}
                    style={{ height: '16px', width: '16px' }}
                  />
                  <label htmlFor="deployment_type" className="ml-2 lowercase text-gray-800">
                    Make this deployment private
                  </label>
                  <br />
                </Form.Group>
                <p className="text-[0.8em]">
                  Enabling this option makes your deployment and its data only accessible to registered users with the correct privileges, who must sign in for access.
                </p>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="12">
                <Form.Group className="pr-2">
                  <input
                    type="checkbox"
                    id="enable_user_signup"
                    name="enable_user_signup"
                    checked={formValue?.enable_user_signup === 'yes'} // Check if enable_user_signup is 'yes'
                    onChange={(e) => {
                      // Handle the change event to update the formValue
                      const newValue = e.target.checked ? 'yes' : 'no';
                      // Update the formValue state (assuming you have a state setter function)
                      setFormValue({ ...formValue, enable_user_signup: newValue });
                    }}
                    style={{ height: '16px', width: '16px' }}
                  />
                  <label htmlFor="enable_user_signup" className="ml-2 lowercase text-gray-800">
                    Disable user sign up?
                  </label>
                  <br />
                </Form.Group>
                <p className="text-[0.8em]">
                  Checking this disables the registration feature. Admins will have to manually add users.
                </p>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="pr-1" md="4">
                <Form.Group>
                  <label>Access Level  [1-3,1-5,1-10]</label>
                  <Form.Control

                    placeholder="access level"
                    type="number"
                    value={formValue?.access_level}
                    name="access_level"
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col className="pl-1" md="4">
                <Form.Group>
                  <label htmlFor="priority_level">
                    Priority Level  [1-3,1-5,1-10]
                  </label>
                  <Form.Control
                    placeholder="Priority Level"
                    type="number"
                    name="priority_level"
                    value={formValue?.priority_level}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>
              <Col className="pl-1" md="4">
                <Form.Group>
                  <label htmlFor="impact_level">
                    Impact Level [1-3,1-5,1-10]
                  </label>
                  <Form.Control
                    placeholder="Impact Level"
                    type="number"
                   name="impact_level"
                    value={formValue?.impact_level}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>

            </Row>
            <hr />
            <Row>
              <Col className="pr-1" md="12">
                <Form.Group className="mr-2">
                  <label>Location : <span className="itali">{formValue?.full_address}</span></label>
                  <Form.Control

                    placeholder="Pick Location from map below"
                    type="text"

                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="12">
                <div className="min-h-[300px] text-center bg-blue-100 border border-1 mr-2">

                  <MapPositionSelect mapHeight={'300px'} onLocationChange={handleLocationChange} latitude={formValue?.latitude} longitude={formValue?.longitude}/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group >
                  <label>Latitude </label>
                  <Form.Control

                    placeholder="latitude from map"
                    type="text"
                    disabled
                    name="latitude"
                    value={formValue?.latitude}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col className="pl-1" md="6">
                <Form.Group>
                  <label htmlFor="exampleInputEmail1">
                    Longitude
                  </label>
                  <Form.Control
                    placeholder="longitude from map"
                    type="text"
                    disabled
                    name="longitude"
                    value={formValue.longitude}
                    onChange={handleChange}
                  ></Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <br />
            <div>
              {invalidFields !== "" && (<p className='bg-red-700 shadow text-left p-3 rounded-xl text-white'>{invalidFields}</p>)}
            </div>
            <br />
            <br />


            <div className="absolute bottom-0 left-0 right-0 p-2 ">
              <div className="flex items-end justify-end gap-2">
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="default"
                >
                  Cancel
                </Button>
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="info"
                  onClick={handleUpdate}
                  disabled={pending}
                >
                  
                  {pending ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </div>
            <div className="clearfix"></div>
          </div>
        </Card.Body>
      </Card>

    </>
  );
}

export default GeneralSettingsPage;
