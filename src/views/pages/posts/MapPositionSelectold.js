import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
import markerIconPng from "assets/leaflet/marker-icon.png";
import markerShadowPnd from "assets/leaflet/marker-shadow.png";

export default function MapPositionSelect(props) {
    const mapRef = useRef(null); // Initialize mapRef with null
    const userMarkerRef = useRef(null);

    // Define the marker icon with proper anchor points
    const myIcon = leaflet.icon({
        iconUrl: markerIconPng,
        shadowUrl: markerShadowPnd,
        iconSize: [25, 41], // Default size for Leaflet marker
        iconAnchor: [12, 41], // Anchor point of the icon
        popupAnchor: [1, -34], // Anchor point for the popup
        shadowSize: [41, 41], // Size of the shadow
    });

    const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
        latitude: 0,
        longitude: 0,
    });

    const location = useGeoLocation();

    // Initialize the map
    useEffect(() => {
        // Ensure the map container exists
        if (!mapRef.current) {
            mapRef.current = leaflet.map("map").setView([userPosition.latitude, userPosition.longitude], 13);

            leaflet
                .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                })
                .addTo(mapRef.current);
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove(); // Remove the map instance if it exists
                mapRef.current = null; // Reset mapRef to null
            }
        };
    }, []);

    // Update marker and map view when location changes
    useEffect(() => {
        if (!location.latitude || !location.longitude || !mapRef.current) return;

        console.log("Updating Marker Position:", [location.latitude, location.longitude]);

        // Remove existing marker if it exists
        if (userMarkerRef.current) {
            mapRef.current.removeLayer(userMarkerRef.current);
        }


        // Notify parent component of location change
        if (props?.latitude && props?.latitude !== null) {
            // Add new marker with proper icon and anchor points
            userMarkerRef.current = leaflet
                .marker([props?.latitude, props?.longitude], { icon: myIcon, draggable: true })
                .addTo(mapRef.current)
                .bindPopup("User Position");



            // Update map view to the new location
            mapRef.current.flyTo([props?.latitude, props?.longitude]);

        } else {
            // Add new marker with proper icon and anchor points
            userMarkerRef.current = leaflet
                .marker([location.latitude, location.longitude], { icon: myIcon, draggable: true })
                .addTo(mapRef.current)
                .bindPopup("User Position");


            // Update map view to the new location
            mapRef.current.flyTo([location.latitude, location.longitude]);


            props?.onLocationChange(location.latitude, location.longitude);
        }
        // Style the marker
        const el = userMarkerRef.current.getElement();
        if (el) {
            el.style.filter = "hue-rotate(120deg)";
        }
        // Handle marker dragging
        userMarkerRef.current.on("drag", (e) => {
            const { lat: latitude, lng: longitude } = e.latlng;
            props?.onLocationChange(latitude, longitude);
        });
    }, [location]);

    return <div id="map" style={{ height: props?.mapHeight || "500px" }}></div>;
}