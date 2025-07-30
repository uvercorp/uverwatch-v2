import {React,useState} from "react";
import { MapContainer, TileLayer, useMap,Marker,Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
L.Icon.Default.imagePath='img/';
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

function MapTest(props) {
//   const [currentPage, setCurrentPage] = useState('general');
   
  return (
    <>

            {/* <Card>
              <Card.Header>
                <Card.Title as="h4">Roles</Card.Title>
              </Card.Header>
              <Card.Body> */}
              <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: props?.MapHeight, width: '100wh' }}>
  <TileLayer
    attribution='&copy;  contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Marker
  draggable={true}
   position={[51.505, -0.09]}>
    <Popup>
      A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
  </Marker>
</MapContainer>
                
              {/* </Card.Body>
            </Card> */}
         
    </>
  );
}

export default MapTest;
