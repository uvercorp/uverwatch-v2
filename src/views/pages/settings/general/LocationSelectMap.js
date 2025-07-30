import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import LocationMarker from './LocationMarker'; // Adjust the import path as needed
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
L.Icon.Default.imagePath='img/';

const LocationSelectMap = () => {
  const [selectedLatLng, setSelectedLatLng] = useState(null);

  const handleLocationChange = (latlng) => {
    setSelectedLatLng(latlng);
    console.log('Selected LatLng:', latlng); // Optional: Log the selected coordinates
  };

  return (
    <div>
      <MapContainer
        center={{ lat: 51.505, lng: -0.09 }}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationChange={handleLocationChange} />
      </MapContainer>

      {/* Display the selected coordinates */}
      {selectedLatLng && (
        <div>
          <p>Latitude: {selectedLatLng.lat}</p>
          <p>Longitude: {selectedLatLng.lng}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSelectMap;

