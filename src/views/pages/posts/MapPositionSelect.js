import { useEffect, useRef, useCallback, useState } from "react";
import leaflet from "leaflet";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
import markerIconPng from "assets/leaflet/marker-icon.png";
import markerShadowPnd from "assets/leaflet/marker-shadow.png";
import useIsMobile from "hooks/useIsMobile";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isMobile = useIsMobile();

  // Timer for distinguishing single vs double click on desktop
  const singleClickTimerRef = useRef(null);
  const DOUBLE_CLICK_DELAY_MS = 300;

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

  // Debounced search for locations using Nominatim API
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'Your App Name/1.0 (your@email.com)',
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce the search input
  useEffect(() => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      geocodeTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300); // 300ms debounce delay
    } else {
      setSearchResults([]);
    }

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Handle selecting a search result
  const handleSelectResult = useCallback((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Update marker position
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    }
    
    // Update map view
    mapRef.current?.flyTo([lat, lng], 13, {
      duration: 1.5,
    });
    
    // Trigger the location change callback
    props?.onLocationChange(lat, lng, result.display_name, result.display_name);
    
    // Clear search results and hide suggestions
    setSearchResults([]);
    setSearchQuery("");
    setShowSuggestions(false);
  }, [props]);

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

  const handleCenterMyLocation = useCallback(() => {
    if (!mapRef.current || !location.latitude) return;

    // Create a new LatLng object for the user's location
    const newLatLng = leaflet.latLng(location.latitude, location.longitude);

    // Update marker position
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(newLatLng);

      // Create a mock event to trigger the drag handlers
      const mockEvent = {
        target: {
          getLatLng: () => newLatLng
        },
        latlng: newLatLng
      };

      // Update position immediately
      handleDrag(mockEvent);

      // Then trigger the full geocoding
      handleDragEnd(mockEvent);
    }

    // Fly to user's location
    mapRef.current.flyTo(newLatLng, 13, {
      duration: 1.5,
    });
  }, [location, handleDrag, handleDragEnd]);

  const handlePinSelection = useCallback((event) => {
    if (event.latlng) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(event.latlng);
      }

      props?.onLocationChange(event.latlng.lat, event.latlng.lng, null);
    }
  }, [props]);

  // Handle contextmenu event (longpress) for mobile
  const handleContextMenu = useCallback((event) => {
    if (isMobile) {
      event.preventDefault();
      handlePinSelection(event);
    }
  }, [isMobile, handlePinSelection]);

  // Desktop: single-click places pin unless a double-click occurs
  const handleClick = useCallback((event) => {
    if (!isMobile) {
      if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = setTimeout(() => {
        handlePinSelection(event);
        singleClickTimerRef.current = null;
      }, DOUBLE_CLICK_DELAY_MS);
    }
  }, [isMobile, handlePinSelection]);

  // Desktop: double-click zooms; cancel pending single-click placement
  const handleDoubleClick = useCallback((event) => {
    if (!isMobile) {
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = null;
      }
      // Let Leaflet's default doubleClickZoom handle zooming
      // No pin placement on double click
    }
  }, [isMobile]);

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

      mapRef.current.on('click', handleClick);
      mapRef.current.on('contextmenu', handleContextMenu);
      mapRef.current.on('dblclick', handleDoubleClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleClick);
        mapRef.current.off('contextmenu', handleContextMenu);
        mapRef.current.off('dblclick', handleDoubleClick);

        mapRef.current.remove();
        mapRef.current = null;
      }
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = null;
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
      mapRef.current?.flyTo(newLatLng, undefined, {
          animate: false
        });
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

  return (
    <div style={{ position: 'relative', height: props?.mapHeight || "500px" }}>
      <div id="map" style={{ height: '100%', width: '100%', borderRadius: '0' }}></div>
      
      {/* Search Bar */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '50px',
          zIndex: 1000,
          width: isMobile ? 'calc(100% - 80px)' : '300px',
          backgroundColor: 'white',
          color:"black",
          borderRadius: '0px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          padding: '5px'
        }}
      >
        <div style={{ display: 'flex', position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for a location..."
            style={{
              flex: 1,
              border: 'none',
              padding: '8px',
              outline: 'none',
              borderRadius: '0px'
            }}
          />
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <i className="fa-solid fa-spinner fa-spin"></i>
            </div>
          )}
        </div>
        
        {/* Search Suggestions */}
        {showSuggestions && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1001,
              marginTop: '5px'
            }}
          >
            {searchResults.map((result, index) => (
              <div
                key={index}
                onMouseDown={() => handleSelectResult(result)} // Use onMouseDown to fire before onBlur
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>
      
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
          justifyContent: 'center'
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