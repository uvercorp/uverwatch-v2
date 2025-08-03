import { useEffect, useRef, useCallback } from "react";
import leaflet from "leaflet";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
import markerIconPng from "assets/leaflet/marker-icon.png";
import markerShadowPnd from "assets/leaflet/marker-shadow.png";

// Define the tile layers for different themes
const tileLayers = {
  light: leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }),
  dark: leaflet.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
  })
};

export default function MapPositionSelect(props) {
    const mapRef = useRef(null);
    const tileLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const geocodeTimeoutRef = useRef(null);
    const [userPosition] = useLocalStorage("USER_MARKER", {
        latitude: 0,
        longitude: 0,
    });
    const location = useGeoLocation();

    const myIcon = leaflet.icon({
        iconUrl: markerIconPng,
        shadowUrl: markerShadowPnd,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    // Smooth coordinate update without geocoding
    const handleDrag = useCallback((e) => {
        isDraggingRef.current = true;
        const { lat, lng } = e.latlng;
        props?.onLocationChange(lat, lng, null);
    }, [props]);

    // Final position update with geocoding
    const handleDragEnd = useCallback(async (e) => {
        isDraggingRef.current = false;
        const { lat, lng } = e.target.getLatLng();

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'Your App Name/1.0 (your@email.com)',
                    },
                }
            );
            const data = await response.json();

            // Extract town and country from address components
            const fullAddress = data.display_name || 'Address not available';
            const address = data.address || {};
            const town = address.town || address.village || address.city || address.county || '';
            const country = address.country || '';

            // Format as "Town, Country" or fallbacks
            const formattedAddress = [town, country].filter(Boolean).join(', ') || 'Unknown location';

            props?.onLocationChange(lat, lng, fullAddress, formattedAddress);
            userMarkerRef.current?.setPopupContent(fullAddress);
        } catch (error) {
            console.error('Geocoding error:', error);
            props?.onLocationChange(lat, lng, 'Location details unavailable');
        }
    }, [props]);

    // Map initialization
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = leaflet.map("map").setView(
                [userPosition.latitude, userPosition.longitude],
                13
            );

            // Add the initial tile layer based on props.map_theme
            const initialTheme = props.map_theme || 'light';
            tileLayerRef.current = tileLayers[initialTheme].addTo(mapRef.current);

            // Create marker once
            userMarkerRef.current = leaflet.marker(
                [userPosition.latitude, userPosition.longitude],
                {
                    icon: myIcon,
                    draggable: true
                }
            )
            .addTo(mapRef.current)
            .bindPopup("Select location");

            // Event listeners
            userMarkerRef.current
                .on('drag', handleDrag)
                .on('dragend', handleDragEnd);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update marker position when props change (without recreating marker)
    useEffect(() => {
        if (userMarkerRef.current && !isDraggingRef.current) {
            let newLatLng = "";
            if(props.latitude == 0 || props.latitude == null) {
                newLatLng = leaflet.latLng(location.latitude, location.longitude);
            } else {
                newLatLng = leaflet.latLng(props.latitude, props.longitude);
            }

            userMarkerRef.current.setLatLng(newLatLng);
            mapRef.current?.flyTo(newLatLng);
        }
    }, [props?.latitude, props?.longitude, location]);

    // Update map theme when props.map_theme changes
    useEffect(() => {
        if (mapRef.current && tileLayerRef.current && props.map_theme) {
            // Remove the current tile layer
            mapRef.current.removeLayer(tileLayerRef.current);

            // Add the new tile layer based on the theme
            tileLayerRef.current = tileLayers[props.map_theme].addTo(mapRef.current);
        }
    }, [props.map_theme]);

    return <div id="map" style={{ height: props?.mapHeight || "500px",borderRadius:'0' }}></div>;
}