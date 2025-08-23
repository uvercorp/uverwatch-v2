import { useEffect, useRef, useCallback } from "react";
import leaflet from "leaflet";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
import markerIconPng from "assets/leaflet/marker-icon.png";
import markerShadowPnd from "assets/leaflet/marker-shadow.png";

export default function MapPositionSelectEntity(props) {
    const mapRef = useRef(null);
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

    // Center map on user's location and trigger address lookup
    const handleCenterMyLocation = useCallback(() => {
        if (!mapRef.current || !location.latitude) return;

        const newLatLng = leaflet.latLng(location.latitude, location.longitude);

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(newLatLng);

            // Create mock event to trigger drag handlers
            const mockEvent = {
                target: {
                    getLatLng: () => newLatLng
                },
                latlng: newLatLng
            };

            // Update position immediately
            handleDrag(mockEvent);

            // Trigger full geocoding
            handleDragEnd(mockEvent);
        }

        // Fly to user's location
        mapRef.current.flyTo(newLatLng, 13, {
            duration: 1.5,
        });
    }, [location, handleDrag, handleDragEnd]);

    // Map initialization
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = leaflet.map("map").setView(
                [userPosition.latitude, userPosition.longitude],
                13
            );

            leaflet
                .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors',
                })
                .addTo(mapRef.current);

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
            if(props.latitude == 0) {
                newLatLng = leaflet.latLng(location.latitude, location.longitude);
            } else {
                newLatLng = leaflet.latLng(props.latitude, props.longitude);
            }

            userMarkerRef.current.setLatLng(newLatLng);
            mapRef.current?.flyTo(newLatLng);
        }
    }, [props.latitude, props.longitude, location]);

    return (
        <div style={{ position: 'relative', height: props?.mapHeight || "500px" }}>
            <div id="map" style={{ height: '100%', width: '100%' }}></div>
            <button
                className="btn btn-sm btn-light"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    boxShadow: '0 1px 5px rgba(0,0,0,0.2)'
                }}
                onClick={handleCenterMyLocation}
                disabled={!location.latitude}
                title="Center on my location"
            >
                <i className="fa-solid fa-location-crosshairs" style={{ fontSize: '16px' }}></i>
            </button>
        </div>
    );
}