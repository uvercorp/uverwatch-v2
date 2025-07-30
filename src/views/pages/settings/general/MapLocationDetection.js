import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
// import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'
import markerIconPng from "../../../../assets/leaflet/marker-icon.png"
import markerShadowPnd from "../../../../assets/leaflet/marker-shadow.png"

export default function MapLicationDetection() {
  const mapRef = useRef();
  const userMarkerRef = useRef();

  var myIcon = leaflet.icon({
    iconUrl: markerIconPng,
    // iconSize: [38, 95],
    // iconAnchor: [22, 94],
    // popupAnchor: [-3, -76],
    shadowUrl: markerShadowPnd,
    // shadowSize: [68, 95],
    // shadowAnchor: [22, 94]
});

  const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0,
  });

  const [nearbyMarkers, setNearbyMarkers] = useLocalStorage(
    "NEARBY_MARKERS",
    []
  );

  const location = useGeoLocation();

  useEffect(() => {
    mapRef.current = leaflet
      .map("map")
      .setView([userPosition.latitude, userPosition.longitude], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    nearbyMarkers.forEach(({ latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude],{icon: myIcon})
        .addTo(mapRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );
    });

    mapRef.current.addEventListener("click", (e) => {
      const { lat: latitude, lng: longitude } = e.latlng;
      leaflet
        .marker([latitude, longitude],{icon: myIcon})
        .addTo(mapRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );

      setNearbyMarkers((prevMarkers) => [
        ...prevMarkers,
        { latitude, longitude },
      ]);
    });
  }, []);

  useEffect(() => {
    setUserPosition({ ...userPosition });

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
    }

    userMarkerRef.current = leaflet
      .marker([location.latitude, location.longitude],{icon: myIcon})
      .addTo(mapRef.current)
      .bindPopup("User");

    const el = userMarkerRef.current.getElement();
    if (el) {
      el.style.filter = "hue-rotate(120deg)";
    }

    mapRef.current.setView([location.latitude, location.longitude]);
  }, [location, userPosition.latitude, userPosition.longitude]);
  return <div id="map" ref={mapRef} style={{height:"500px"}}></div>;
}