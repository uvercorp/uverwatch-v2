import React, { useEffect, useRef, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import leaflet from "leaflet";
import "leaflet.markercluster";
import "leaflet-draw";
import useLocalStorage from "hooks/useLocalStorage";
import useGeoLocation from "hooks/useGeoLocation";
import axios from "axios";
import markerIconPng from "assets/leaflet/marker-icon.png";
import markerShadowPnd from "assets/leaflet/marker-shadow.png";
import PopupSinglePost from "./PopupSinglePost";
import UpdatePostModal from "../data_view/UpdatePostModal";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet-draw/dist/leaflet.draw.css";
import axiosInstance from "services/axios";
import { toggleLoadingBar, selectLoadingBar, toggleToaster, selectToasterData, selectToasterStatus } from 'provider/features/helperSlice';
import { useSelector, useDispatch } from 'react-redux';
import SelectedModal from "./area_selection/SelectedModal";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Map Error:", error, info);
  }

  render() {
    return this.state.hasError ? (
      <div className="alert alert-danger m-3">
        Map display unavailable - Please check your data and try again
      </div>
    ) : this.props.children;
  }
}
// Timeline Control Component
const TimelineControl1 = ({
  intervals,
  currentInterval,
  granularity,
  isPlaying,
  onIntervalSelect,
  onPlayPause,
  onGranularityToggle
}) => {
  const timelineRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current && timelineRef.current) {
      const container = timelineRef.current;
      const selected = selectedRef.current;
      container.scrollTo({
        left: selected.offsetLeft - container.offsetWidth / 2 + selected.offsetWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [currentInterval]);

  return (
    <div className="timeline-control bg-white p-3 rounded shadow-lg" style={{ minWidth: '300px' }}>
      <button
        className="btn btn-sm btn-secondary"
        onClick={onGranularityToggle}
      >
        {granularity.charAt(0).toUpperCase() + granularity.slice(1)}
      </button>
      <div className="controls d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${isPlaying ? 'btn-danger' : 'btn-success'}`}
          onClick={onPlayPause}
        >
          <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`} />
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={onGranularityToggle}
        >
          {granularity === 'date' ? 'Hour View' : 'Day View'}
        </button>
      </div>

      <div
        ref={timelineRef}
        className="timeline-scroller d-flex gap-2"
        style={{
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }}
      >
        {intervals.map((interval) => (
          <div
            key={interval.key}
            ref={el => interval.key === currentInterval?.key ? selectedRef.current = el : null}
            className={`timeline-interval p-2 rounded text-nowrap ${interval.key === currentInterval?.key
                ? 'bg-primary text-white'
                : 'bg-light'
              }`}
            style={{ cursor: 'pointer', minWidth: '80px' }}
            onClick={() => onIntervalSelect(interval)}
          >
            <div className="text-center small">
              {granularity === 'date' ? (
                <>
                  <div className="fw-bold">{interval.date}</div>
                  <div>{interval.monthYear}</div>
                </>
              ) : (
                <>
                  <div className="fw-bold">{interval.hour}</div>
                  <div>{interval.date}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const TimelineControl = ({
  intervals,
  currentInterval,
  granularity,
  isPlaying,
  onIntervalSelect,
  onPlayPause,
  onGranularityChange
}) => {
  const timelineRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current && timelineRef.current) {
      const container = timelineRef.current;
      const selected = selectedRef.current;
      container.scrollTo({
        left: selected.offsetLeft - container.offsetWidth / 2 + selected.offsetWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [currentInterval]);

  // Helper function to format interval labels
  const getIntervalLabels = (startDate) => {
    const date = new Date(startDate);
    switch (granularity) {
      case 'hour':
        return {
          primary: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          secondary: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        };
      case 'day':
        return {
          primary: date.toLocaleDateString('en-US', { day: 'numeric' }),
          secondary: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      case 'week':
        const weekNumber = Math.ceil(date.getDate() / 7);
        return {
          primary: `Week ${weekNumber}`,
          secondary: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      case 'month':
        return {
          primary: date.toLocaleDateString('en-US', { month: 'short' }),
          secondary: date.getFullYear()
        };
      case 'year':
        return {
          primary: date.getFullYear(),
          secondary: ''
        };
      default:
        return { primary: '', secondary: '' };
    }
  };

  return (
    <div className="timeline-control bg-white p-3 rounded shadow-lg" style={{ minWidth: '300px' }}>
      <div className="controls d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${isPlaying ? 'btn-danger' : 'btn-success'}`}
          onClick={onPlayPause}
        >
          <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`} />
        </button>

        {/* Granularity Controls */}
        <div className="btn-group">
          {['hour', 'day', 'week', 'month', 'year'].map((g) => (
            <button
              key={g}
              className={`btn btn-sm ${granularity === g ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onGranularityChange(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="timeline-scroller d-flex gap-2"
        style={{
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }}
      >
        {intervals.map((interval) => {
          const labels = getIntervalLabels(interval.start);
          return (
            <div
              key={interval.key}
              ref={el => interval.key === currentInterval?.key ? selectedRef.current = el : null}
              className={`timeline-interval p-2 rounded text-nowrap ${interval.key === currentInterval?.key
                  ? 'bg-primary text-white'
                  : 'bg-light'
                }`}
              style={{ cursor: 'pointer', minWidth: '80px' }}
              onClick={() => onIntervalSelect(interval)}
            >
              <div className="text-center small">
                <div className="fw-bold">{labels.primary}</div>
                {labels.secondary && <div>{labels.secondary}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Vertical Time Ruler Component
const VerticalTimeRuler = ({ currentInterval, timelineExtremes }) => {
  const rulerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePosition = useMemo(() => {
    if (!currentInterval || !timelineExtremes.start) return { top: 0, height: 0 };

    const totalDuration = timelineExtremes.end - timelineExtremes.start;
    const startPosition = ((currentInterval.start - timelineExtremes.start) / totalDuration) * 100;
    const endPosition = ((currentInterval.end - timelineExtremes.start) / totalDuration) * 100;

    return {
      top: `${100 - endPosition}%`,
      height: `${endPosition - startPosition}%`
    };
  }, [currentInterval, timelineExtremes]);

  const handleClick = (e) => {
    if (rulerRef.current) {
      const rect = rulerRef.current.getBoundingClientRect();
      const clickPosition = 1 - ((e.clientY - rect.top) / rect.height);
      const selectedTime = new Date(
        timelineExtremes.start.getTime() +
        clickPosition * (timelineExtremes.end - timelineExtremes.start)
      );
      // You can add logic to update currentInterval here
    }
  };

  if (!timelineExtremes.start) return null;

  return (
    <div
      className="vertical-time-ruler"
      style={{
        position: 'absolute',
        left: '20px',
        top: '20px',
        bottom: '20px',
        width: '40px',
        zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer'
      }}
      ref={rulerRef}
      onClick={handleClick}
    >
      <div className="ruler-track" style={{
        position: 'absolute',
        left: '50%',
        top: '10%',
        bottom: '10%',
        width: '4px',
        backgroundColor: '#e9ecef',
        transform: 'translateX(-50%)',
        borderRadius: '2px'
      }}>
        {currentInterval && (
          <div
            className="current-interval"
            style={{
              position: 'absolute',
              left: '0',
              width: '100%',
              backgroundColor: '#1971c2',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              ...calculatePosition
            }}
          />
        )}
      </div>

      {/* Top Date Label */}
      <div className="ruler-label top-label" style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-90deg)',
        whiteSpace: 'nowrap',
        fontSize: '0.8rem',
        color: '#495057'
      }}>
        {timelineExtremes.end.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>

      {/* Bottom Date Label */}
      <div className="ruler-label bottom-label" style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-90deg)',
        whiteSpace: 'nowrap',
        fontSize: '0.8rem',
        color: '#495057'
      }}>
        {timelineExtremes.start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>

      {/* Current Time Marker */}
      {currentInterval && (
        <div className="current-time-marker" style={{
          position: 'absolute',
          left: '50%',
          width: '12px',
          height: '12px',
          backgroundColor: '#1971c2',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          top: `${100 - calculatePosition.top}%`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      )}
    </div>
  );
};

// Modified MapDisplayComponent with Timeline
function MapDisplayComponent(props) {
  // Existing state
  const [show, setShow] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [geoFenceData, setGeoFenceData] = useState(null);
  const [lastDrawnLayer, setLastDrawnLayer] = useState(null);
  const [geoFences, setGeoFences] = useState([]);

  // Timeline state
  const [filteredPosts, setFilteredPosts] = useState(props.posts);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [timelineExtremes, setTimelineExtremes] = useState({ start: null, end: null });
  const [granularity, setGranularity] = useState('day');
  const [showTimeline, setShowTimeline] = useState(false);




  // Add toggle function
  const toggleTimeline = () => {
    setShowTimeline(!showTimeline);
    if (!showTimeline) {
      setCurrentInterval(null);
    }
  };

  // Existing refs and hooks
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const drawControlRef = useRef(null);
  const postsRef = useRef(props.posts);
  const dispatch = useDispatch();

  const [userPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0,
  });

  const location = useGeoLocation();
  useEffect(() => {
    postsRef.current = props.posts;
  }, [props.posts]);

  const defaultIcon = leaflet.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPnd,
    iconSize: [30, 46],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });



  const createCustomIcon = (iconClass, color) => {
    if (!iconClass || !color) return defaultIcon;
  
    return leaflet.divIcon({
      html: `
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          color: ${color};
          font-size: 28px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 0 0 3px #ffffff;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        ">
          <i class="${iconClass}"></i>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],       // Matches the actual icon dimensions
      iconAnchor: [15, 30],     // Center-bottom of the icon (x, y)
      popupAnchor: [0, -30]     // Adjust popup position relative to icon
    });
  };
  // Calculate timeline intervals
  const { intervals, formattedExtremes } = useMemo(() => {
    if (!timelineExtremes.start || !timelineExtremes.end) return { intervals: [], formattedExtremes: {} };

    const intervals = [];
    let current = new Date(timelineExtremes.start);
    const end = new Date(timelineExtremes.end);

    // Normalize start based on granularity
    switch (granularity) {
      case 'hour':
        current.setMinutes(0, 0, 0);
        break;
      case 'day':
        current.setHours(0, 0, 0, 0);
        break;
      case 'week':
        current.setDate(current.getDate() - current.getDay()); // Start of week (Sunday)
        current.setHours(0, 0, 0, 0);
        break;
      case 'month':
        current.setDate(1);
        current.setHours(0, 0, 0, 0);
        break;
      case 'year':
        current.setMonth(0, 1);
        current.setHours(0, 0, 0, 0);
        break;
    }

    while (current <= end) {
      const start = new Date(current);
      const intervalEnd = new Date(current);

      switch (granularity) {
        case 'hour':
          intervalEnd.setHours(current.getHours() + 1);
          break;
        case 'day':
          intervalEnd.setDate(current.getDate() + 1);
          break;
        case 'week':
          intervalEnd.setDate(current.getDate() + 7);
          break;
        case 'month':
          intervalEnd.setMonth(current.getMonth() + 1);
          break;
        case 'year':
          intervalEnd.setFullYear(current.getFullYear() + 1);
          break;
      }

      intervals.push({
        start,
        end: intervalEnd,
        key: start.toISOString()
      });

      current = new Date(intervalEnd);
    }

    return {
      intervals,
      formattedExtremes: {
        start: timelineExtremes.start.toLocaleDateString(),
        end: timelineExtremes.end.toLocaleDateString()
      }
    };
  }, [timelineExtremes, granularity]);


  // Update timeline extremes when posts change
  useEffect(() => {
    if (props.posts.length === 0) return;

    const postDates = props.posts.map(p => new Date(p.created_at).getTime());
    const start = new Date(Math.min(...postDates));
    const end = new Date(Math.max(...postDates));
    setTimelineExtremes({ start, end });
    setCurrentInterval(null);
  }, [props.posts]);


  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentInterval(prev => {
        const currentIndex = intervals.findIndex(i => i.key === prev?.key);
        if (currentIndex >= intervals.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return intervals[currentIndex + 1];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, intervals]);

  // Filter posts based on current interval
  useEffect(() => {
    if (!showTimeline || !currentInterval) {
      setFilteredPosts(props.posts);
      return;
    }

    const filtered = props.posts.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate >= currentInterval.start && postDate < currentInterval.end;
    });
    setFilteredPosts(filtered);
  }, [currentInterval, props.posts, showTimeline]);

  // Update markers when filtered posts change
  useEffect(() => {
    if (!clusterGroupRef.current) return;

    clusterGroupRef.current.clearLayers();
    const markers = filteredPosts.map(post => {
      const icon = createCustomIcon(post?.icon, post?.color);
      const popup = createPopup(post);
      return leaflet.marker([
        Number(post.latitude),
        Number(post.longitude)
      ], {
        icon,
        post
      }).bindPopup(popup);
    });
    clusterGroupRef.current.addLayers(markers);
  }, [filteredPosts]);

  useEffect(() => {
    try {
      if (!mapRef.current) {
        initializeMap();
        setupClustering();
        setupDrawingTools();
        setupEventListeners();
        setTimeout(() => {
          loadGeoFences();
        }, 2000);
      }
    } catch (error) {
      console.error("Map initialization failed:", error);
    }

    return () => cleanupMap();
  }, []);

  const initializeMap = () => {
    mapRef.current = leaflet.map("map", {
      preferCanvas: true
    }).setView([userPosition.latitude, userPosition.longitude], 13);

    leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
  };

  const setupClustering = () => {
    clusterGroupRef.current = leaflet.markerClusterGroup({
      iconCreateFunction: (cluster) => leaflet.divIcon({
        html: `<div style="
          background-color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid red;
          color: red;
          font-weight: bold;
        ">${cluster.getChildCount()}</div>`,
        className: 'custom-cluster',
        iconSize: [40, 40]
      }),
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    }).addTo(mapRef.current);
  };

  const setupDrawingTools = () => {
    drawnItemsRef.current = new leaflet.FeatureGroup().addTo(mapRef.current);
    drawControlRef.current = new leaflet.Control.Draw({
      position: 'topright',
      draw: {
        polygon: { showArea: true },
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: { featureGroup: drawnItemsRef.current }
    }).addTo(mapRef.current);
  };

  const setupEventListeners = () => {
    mapRef.current.on('draw:created', handleDrawCreated);
    mapRef.current.on('draw:deleted', handleDrawDeleted);
  };

  const cleanupMap = () => {
    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  const handleDrawCreated = async (e) => {
    const layer = e.layer;
    drawnItemsRef.current.addLayer(layer);
    setLastDrawnLayer(layer);

    const geoJson = layer.toGeoJSON();
    setGeoFenceData(geoJson.geometry.coordinates);

    filterPostsByLayer(layer);
    setShowSelectionModal(true);
  };

  const handleDrawDeleted = (e) => {
    const deletedLayers = e.layers;
    deletedLayers.eachLayer((layer) => {
      if (layer === lastDrawnLayer) {
        setGeoFenceData(null);
        updateSelection([]);
        setLastDrawnLayer(null);
      }
    });
  };

  const filterPostsByLayer = (layer) => {
    if (!layer) {
      updateSelection([]);
      return;
    }

    let bounds;
    try {
      if (layer.getBounds) {
        bounds = layer.getBounds();
      } else if (layer.getLatLngs) {
        bounds = leaflet.latLngBounds(layer.getLatLngs()[0]);
      }
    } catch (error) {
      console.error("Error processing layer:", error);
      updateSelection([]);
      return;
    }

    const filtered = postsRef.current.filter(post => {
      try {
        return bounds.contains(leaflet.latLng(
          Number(post.latitude),
          Number(post.longitude)
        ));
      } catch {
        return false;
      }
    });

    updateSelection(filtered);
  };

  const updateSelection = (filtered) => {
    setSelectedPosts(filtered);
    props.onAreaSelected?.(filtered);
  };

  const createGeoFencePopup = (fence) => {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      <div className="geo-fence-popup p-2 bg-white">
        <h6 className="fw-bold mb-2">{fence.name}</h6>
        <div className="text-muted small">
          <div>Created: {new Date(fence.created_at).toLocaleDateString()}</div>
          <div>Coordinates: {fence.coordinates.length - 1} points</div>
        </div>
      </div>
    );
    return container;
  };

  const loadGeoFences = async () => {
    let deployment = localStorage.getItem('deployment');
    let deployment_id = JSON.parse(deployment).id;
    try {
      const response = await axiosInstance.get('getGeoFences/' + deployment_id, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        }
      });

      if (response?.data) {
        const loadedFences = response.data.fences;
        setGeoFences(loadedFences);

        drawnItemsRef.current.eachLayer(layer => {
          if (layer.options.metadata?.type === 'geo-fence') {
            drawnItemsRef.current.removeLayer(layer);
          }
        });

        loadedFences.forEach(fence => {
          const polygon = leaflet.polygon(
            fence.coordinates.map(coord => [coord.lat, coord.lng]),
            {
              color: '#ff0000',
              fillOpacity: 0.1,
              metadata: {
                type: 'geo-fence',
                id: fence.id,
                name: fence.name,
                created_at: fence.created_at
              }
            }
          ).bindPopup(() => createGeoFencePopup(fence));

          polygon.on('click', (e) => {
            e.target.openPopup();
          });

          drawnItemsRef.current.addLayer(polygon);
        });
      }
    } catch (err) {
      console.error("Error loading geo-fences:", err);
    }
  };

  const handleSaveGeoFence = async (geoFence) => {
    let deployment = localStorage.getItem('deployment');
    let deployment_id = JSON.parse(deployment).id;
    try {
      const data = {
        ...geoFence,
        coordinates: geoFence.coordinates.flat(),
        deployment: deployment_id
      };
      const response = await axiosInstance.post('saveGeoFence', data, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('access')}`
        },
      });
      if (response?.data?.status === "success") {
        dispatch(toggleToaster({ isOpen: true, toasterData: { type: "success", msg: "Geofence Added successfully." } }));
        const newFence = response.data.fence;
        const newLayer = lastDrawnLayer;
        newLayer.bindPopup(() => createGeoFencePopup(newFence));
        newLayer.options.metadata = {
          type: 'geo-fence',
          id: newFence.id,
          name: newFence.name,
          created_at: newFence.created_at
        };
        loadGeoFences();
      }
    } catch (err) {
      console.error("Error saving geo-fence:", err);
    }
  };

  const handleClearSelection = () => {
    if (lastDrawnLayer) {
      drawnItemsRef.current.removeLayer(lastDrawnLayer);
      setLastDrawnLayer(null);
    }
    setGeoFenceData(null);
    updateSelection([]);
  };

  // useEffect(() => {
  //   if (!mapRef.current || !location.latitude) return;

  //   userMarkerRef.current?.remove();
  //   userMarkerRef.current = leaflet.marker([location.latitude, location.longitude], {
  //     icon: createCustomIcon("fa-solid fa-circle-user", "#000000")
  //   }).addTo(mapRef.current);

  //   mapRef.current.flyTo([location.latitude, location.longitude]);
  // }, [location]);

  useEffect(() => {
    if (!mapRef.current || !location.latitude) return;
  
 

    const createUserIcon = () => leaflet.divIcon({
      html: `
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          color: #000000;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 0 0 3px #ffffff;
        ">
          <i class="fa-solid fa-circle-user"></i>
        </div>
      `,
      className: 'user-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24],  // Center-bottom of the icon
      popupAnchor: [0, -24]
    });
  
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.latitude, location.longitude]);
      userMarkerRef.current.setIcon(createUserIcon());
    } else {
      userMarkerRef.current = leaflet.marker(
        [location.latitude, location.longitude],
        { icon: createUserIcon() }
      ).addTo(mapRef.current);
    }
  
    // Adjust view with padding if needed
    mapRef.current.flyTo([location.latitude, location.longitude], mapRef.current.getZoom(), {
      paddingTopLeft: [0, 50], // Adjust based on your UI elements
      paddingBottomRight: [0, 50]
    });
  }, [location]);

  
  useEffect(() => {
    if (!postsRef.current || !clusterGroupRef.current) return;

    clusterGroupRef.current.clearLayers();
    const markers = postsRef.current.map(post => {
      const icon = createCustomIcon(post?.icon, post?.color);
      const popup = createPopup(post);
      return leaflet.marker([
        Number(post.latitude),
        Number(post.longitude)
      ], {
        icon,
        post
      }).bindPopup(popup);
    });
    clusterGroupRef.current.addLayers(markers);
  }, [props.posts]);

  const createPopup = (post) => {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      <PopupSinglePost
        post={post}
        show={show}
        setShow={setShow}
        setSelectedRecord={setSelectedRecord}
      />
    );
    return container;
  };


  // Add timeline control to the return statement
  return (
    <>
      <style>{`
       .leaflet-marker-icon, .leaflet-div-icon {
          background: none !important;
          border: none !important;
        }
        .custom-cluster {
          background: none !important;
          border: none !important;
        }
        .leaflet-draw-toolbar a {
          background-image: url(https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/images/spritesheet.png) !important;
        }
        .modal {
          z-index: 10000;
        }
        .leaflet-draw-toolbar {
          background-color:white;
          margin-top: 45px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border-radius: 8px !important;
        }
        .geo-fence-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          max-width: 100px;
          // box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .geo-fence-popup h6 {
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .geo-fence-popup .text-muted {
          font-size: 0.8rem;
          color: #666;
        }
       .timeline-control {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 1000;
  max-width: calc(100% - 40px);
  overflow-x: auto;
}

.timeline-scroller {
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
}
        .timeline-scroller::-webkit-scrollbar {
          height: 6px;
          background-color: #f5f5f5;
        }
        .timeline-scroller::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 3px;
        }
      `}</style>
<div className="px-4 pb-2 pt-1 min-h-screen font-mono text-white">
      <div className="flex justify-between items-center mb-2 pr-0">
        <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">MaP VIEW</h1>
        <div className="pt-0">
          {/* <button className="px-3 pt-0 py-2 border bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Load Presets:</button> */}
          <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">Reports [{props?.posts?.length}]</button>
        </div>
      </div>
      {/* Existing map div */}
      <div id="map" style={{
        height: "calc(100vh - 165px)",
        width: "100%",
        backgroundColor: "#f5f5f5",
        position: "relative"
      }}>
        <div className="leaflet-top leaflet-right">

          <div className="leaflet-control leaflet-bar p-2 bg-white shadow">
            <button
              className="btn btn-sm btn-secondary me-2"
              onClick={toggleTimeline}
            >
              {showTimeline ? 'Hide' : 'Show'} Timeline
            </button>
            <span className="text-sm text-gray-600">
              {props.posts?.length || 0} Results
              {selectedPosts.length > 0 && ` | ${selectedPosts.length} selected`}
            </span>
          </div>
        </div>
      </div>
      {/* <VerticalTimeRuler 
    currentInterval={currentInterval}
    timelineExtremes={timelineExtremes}
  /> */}
      {/* Timeline component */}
      {showTimeline && timelineExtremes.start && (
        <TimelineControl
          intervals={intervals}
          currentInterval={currentInterval}
          granularity={granularity}
          isPlaying={isPlaying}
          onIntervalSelect={setCurrentInterval}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onGranularityChange={setGranularity} // Corrected prop name
        />
      )}
      <SelectedModal
        show={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        onClearSelection={handleClearSelection}
        posts={selectedPosts}
        geoFenceData={geoFenceData}
        onSaveGeoFence={handleSaveGeoFence}
      />

      <UpdatePostModal
        show={show}
        setShow={setShow}
        selectedRecord={selectedRecord}
      />
      </div>
    </>
  );
}

export default function MapDisplay(props) {
  return (
    <ErrorBoundary>
      <MapDisplayComponent {...props} />
    </ErrorBoundary>
  );
}