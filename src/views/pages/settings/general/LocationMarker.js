import React, { useState } from 'react';
import { useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
L.Icon.Default.imagePath='img/';

const LocationMarker = ({ onLocationChange }) => {
    // alert('location marker callled');
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationChange(e.latlng); // Pass the new coordinates to the parent
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
};

export default LocationMarker;
