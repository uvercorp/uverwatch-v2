import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
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
import {
  toggleLoadingBar,
  selectLoadingBar,
  toggleToaster,
  selectToasterData,
  selectToasterStatus,
} from "provider/features/helperSlice";
import { useSelector, useDispatch } from "react-redux";
import SelectedModal from "./area_selection/SelectedModal";
import Globe3DComponent from "./Globe3DComponent";

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
    ) : (
      this.props.children
    );
  }
}
// Timeline Control Component
const TimelineControl = ({
  intervals,
  currentInterval,
  granularity,
  isPlaying,
  onIntervalSelect,
  onPlayPause,
  onGranularityChange,
}) => {
  const timelineRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current && timelineRef.current) {
      const container = timelineRef.current;
      const selected = selectedRef.current;
      container.scrollTo({
        left:
          selected.offsetLeft -
          container.offsetWidth / 2 +
          selected.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentInterval]);

  // Helper function to format interval labels
  const getIntervalLabels = (startDate) => {
    const date = new Date(startDate);
    switch (granularity) {
      case "hour":
        return {
          primary: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          secondary: date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }),
        };
      case "day":
        return {
          primary: date.toLocaleDateString("en-US", { day: "numeric" }),
          secondary: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
      case "week":
        const weekNumber = Math.ceil(date.getDate() / 7);
        return {
          primary: `Week ${weekNumber}`,
          secondary: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
      case "month":
        return {
          primary: date.toLocaleDateString("en-US", { month: "short" }),
          secondary: date.getFullYear(),
        };
      case "year":
        return {
          primary: date.getFullYear(),
          secondary: "",
        };
      default:
        return { primary: "", secondary: "" };
    }
  };

  return (
    <div
      className="timeline-control bg-[#1F2F3F] p-3  shadow-lg"
      style={{ minWidth: "280px" }}

    >

      <div className="controls d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${isPlaying ? "btn-danger" : "btn-success"}`}
          onClick={onPlayPause}
          style={{borderRadius:"0px !important"}}
        >
          <i className={`fas fa-${isPlaying ? "pause" : "play"}`} />
        </button>

        {/* Granularity Controls */}
        <div className="btn-group bg-[#000] text-white" style={{borderRadius:"0px !important"}}>
          {["hour", "day", "week", "month", "year"].map((g) => (
            <button
              key={g}
              className={`btn btn-sm text-white ${
                granularity === g ? "btn-primary" : "btn-outline-secondary "
              }`}
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
          overflowX: "auto",
          paddingBottom: "8px",
          scrollbarWidth: "thin",
        }}
      >
        {intervals.map((interval) => {
          const labels = getIntervalLabels(interval.start);
          return (
            <div
              key={interval.key}
              ref={(el) =>
                interval.key === currentInterval?.key
                  ? (selectedRef.current = el)
                  : null
              }
              className={`timeline-interval p-2  text-nowrap ${
                interval.key === currentInterval?.key
                  ? "bg-primary text-white"
                  : "bg-[#000]"
              }`}
              style={{ cursor: "pointer", minWidth: "80px" }}
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
    if (!currentInterval || !timelineExtremes.start)
      return { top: 0, height: 0 };

    const totalDuration = timelineExtremes.end - timelineExtremes.start;
    const startPosition =
      ((currentInterval.start - timelineExtremes.start) / totalDuration) * 100;
    const endPosition =
      ((currentInterval.end - timelineExtremes.start) / totalDuration) * 100;

    return {
      top: `${100 - endPosition}%`,
      height: `${endPosition - startPosition}%`,
    };
  }, [currentInterval, timelineExtremes]);

  const handleClick = (e) => {
    if (rulerRef.current) {
      const rect = rulerRef.current.getBoundingClientRect();
      const clickPosition = 1 - (e.clientY - rect.top) / rect.height;
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
        position: "absolute",
        left: "20px",
        top: "20px",
        bottom: "20px",
        width: "40px",
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        cursor: "pointer",
      }}
      ref={rulerRef}
      onClick={handleClick}
    >
      <div
        className="ruler-track"
        style={{
          position: "absolute",
          left: "50%",
          top: "10%",
          bottom: "10%",
          width: "4px",
          backgroundColor: "#e9ecef",
          transform: "translateX(-50%)",
          borderRadius: "2px",
        }}
      >
        {currentInterval && (
          <div
            className="current-interval"
            style={{
              position: "absolute",
              left: "0",
              width: "100%",
              backgroundColor: "#1971c2",
              borderRadius: "2px",
              transition: "all 0.3s ease",
              ...calculatePosition,
            }}
          />
        )}
      </div>

      {/* Top Date Label */}
      <div
        className="ruler-label top-label"
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%) rotate(-90deg)",
          whiteSpace: "nowrap",
          fontSize: "0.8rem",
          color: "#495057",
        }}
      >
        {timelineExtremes.end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* Bottom Date Label */}
      <div
        className="ruler-label bottom-label"
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%) rotate(-90deg)",
          whiteSpace: "nowrap",
          fontSize: "0.8rem",
          color: "#495057",
        }}
      >
        {timelineExtremes.start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      {/* Current Time Marker */}
      {currentInterval && (
        <div
          className="current-time-marker"
          style={{
            position: "absolute",
            left: "50%",
            width: "12px",
            height: "12px",
            backgroundColor: "#1971c2",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            top: `${100 - calculatePosition.top}%`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      )}
    </div>
  );
};
const GeoFenceControls = ({
  geoFences,
  visibleGeoFences,
  onToggleGeoFence,
  onToggleAll
}) => {
  const allChecked = geoFences.length > 0 &&
    geoFences.every(fence => visibleGeoFences[fence.id]);
  const someChecked = geoFences.length > 0 &&
    geoFences.some(fence => visibleGeoFences[fence.id]) && !allChecked;

  return (
    <div
    className="geo-fence-controls-container "
    style={{
      position: 'fixed', // Changed from absolute to fixed
      bottom: '40px',
      left: '260px', // Move 200px left of the map container
      zIndex: 1200,
      transition: 'left 0.3s ease',
      width: '250px'
    }}
  >
    <div className="geo-fence-controls bg-[#1F2F3F] p-3 shadow-lg max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
    <h3 className="my-sidebar-link font-bold tracking-wide uppercase text-sm mb-2 text-white">Geofences({geoFences.length})</h3>

      {/* Check All Toggle */}
      {/* <div
        onClick={() => onToggleAll(!allChecked)}
        className="flex items-center cursor-pointer group mb-3"
      >
        <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center bg-[#1F2F3F] group-hover:bg-gray-900">
          {allChecked && <span className="text-red-500 font-bold text-sm">X</span>}
          {someChecked && <span className="text-red-500 font-bold text-sm">-</span>}
        </div>
        <span className={`text-sm ${allChecked ? 'text-red-500 font-semibold' : 'text-white'}`}>
          {allChecked ? 'Uncheck All' : 'Check All'}
        </span>
      </div> */}

      {/* GeoFence List */}
      <div className="geo-fence-list space-y-2">
        {geoFences.map((fence) => (
          <div
            key={fence.id}
            onClick={() => onToggleGeoFence(fence.id)}
            className="flex items-center cursor-pointer group"
          >
            <div className="w-5 h-5 border border-gray-500 mr-2 flex items-center justify-center bg-[#1F2F3F] group-hover:bg-gray-900">
              {visibleGeoFences[fence.id] && <span className="text-red-500 font-bold text-sm">X</span>}
            </div>
            <span className={`text-sm truncate w-full capitalize ${visibleGeoFences[fence.id] ? 'text-red-500 font-semibold' : 'text-white'}`}>
              {fence.name}
            </span>
          </div>
        ))}
      </div>
    </div>
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
  const [visibleGeoFences, setVisibleGeoFences] = useState({});
  const [geoFenceLayers, setGeoFenceLayers] = useState({}); // Add this to your state

  // Timeline state
  const [filteredPosts, setFilteredPosts] = useState(props.posts);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [timelineExtremes, setTimelineExtremes] = useState({
    start: null,
    end: null,
  });
  const [granularity, setGranularity] = useState("day");
  const [showTimeline, setShowTimeline] = useState(false);

  // New state for map view management
  const [show3DGlobe, setShow3DGlobe] = useState(true); // Start with 3D globe
  const [initialLeafletFlyDone, setInitialLeafletFlyDone] = useState(false); // Tracks if initial fly-to on Leaflet is done
  const [leafletInitialTarget, setLeafletInitialTarget] = useState(null); // Stores lat/lon from globe click

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
      className: "custom-marker",
      iconSize: [30, 30], // Matches the actual icon dimensions
      iconAnchor: [15, 30], // Center-bottom of the icon (x, y)
      popupAnchor: [0, -30], // Adjust popup position relative to icon
    });
  };

  // Calculate timeline intervals
  const { intervals, formattedExtremes } = useMemo(() => {
    if (!timelineExtremes.start || !timelineExtremes.end)
      return { intervals: [], formattedExtremes: {} };

    const intervals = [];
    let current = new Date(timelineExtremes.start);
    const end = new Date(timelineExtremes.end);

    // Normalize start based on granularity
    switch (granularity) {
      case "hour":
        current.setMinutes(0, 0, 0);
        break;
      case "day":
        current.setHours(0, 0, 0, 0);
        break;
      case "week":
        current.setDate(current.getDate() - current.getDay()); // Start of week (Sunday)
        current.setHours(0, 0, 0, 0);
        break;
      case "month":
        current.setDate(1);
        current.setHours(0, 0, 0, 0);
        break;
      case "year":
        current.setMonth(0, 1);
        current.setHours(0, 0, 0, 0);
        break;
      default:
        break;
    }

    while (current <= end) {
      const start = new Date(current);
      const intervalEnd = new Date(current);

      switch (granularity) {
        case "hour":
          intervalEnd.setHours(current.getHours() + 1);
          break;
        case "day":
          intervalEnd.setDate(current.getDate() + 1);
          break;
        case "week":
          intervalEnd.setDate(current.getDate() + 7);
          break;
        case "month":
          intervalEnd.setMonth(current.getMonth() + 1);
          break;
        case "year":
          intervalEnd.setFullYear(current.getFullYear() + 1);
          break;
        default:
          break;
      }

      intervals.push({
        start,
        end: intervalEnd,
        key: start.toISOString(),
      });

      current = new Date(intervalEnd);
    }

    return {
      intervals,
      formattedExtremes: {
        start: timelineExtremes.start.toLocaleDateString(),
        end: timelineExtremes.end.toLocaleDateString(),
      },
    };
  }, [timelineExtremes, granularity]);

  const handleCenterMyLocation = useCallback(() => {
    if (!mapRef.current || !location.latitude) return;

    // Create or update user marker
    const createUserIcon = () =>
      leaflet.divIcon({
        html: `
          <div style="position: absolute; left: 0; top: 0; width: 24px; height: 24px; color: #000000;
              font-size: 24px; display: flex; align-items: center; justify-content: center; text-shadow: 0 0 3px #ffffff;">
              <i class="fa-solid fa-circle-user"></i>
          </div>
        `,
        className: "user-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.latitude, location.longitude]);
      userMarkerRef.current.setIcon(createUserIcon());
    } else {
      userMarkerRef.current = leaflet
        .marker([location.latitude, location.longitude], {
          icon: createUserIcon(),
        })
        .addTo(mapRef.current);
    }

    // Fly to user's location
    mapRef.current.flyTo([location.latitude, location.longitude], 13, {
      duration: 1.5,
    });
  }, [location]);

  // Update timeline extremes when posts change
  useEffect(() => {
    if (props.posts.length === 0) return;

    const postDates = props.posts.map((p) => new Date(p.created_at).getTime());
    const start = new Date(Math.min(...postDates));
    const end = new Date(Math.max(...postDates));
    setTimelineExtremes({ start, end });
    setCurrentInterval(null);
  }, [props.posts]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentInterval((prev) => {
        const currentIndex = intervals.findIndex((i) => i.key === prev?.key);
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

    const filtered = props.posts.filter((post) => {
      const postDate = new Date(post.created_at);
      return (
        postDate >= currentInterval.start && postDate < currentInterval.end
      );
    });
    setFilteredPosts(filtered);
  }, [currentInterval, props.posts, showTimeline]);

  // Update markers when filtered posts change
  useEffect(() => {
    if (!clusterGroupRef.current) return;

    clusterGroupRef.current.clearLayers();
    const markers = filteredPosts.map((post) => {
      const icon = createCustomIcon(post?.icon, post?.color);
      const popup = createPopup(post);
      return leaflet
        .marker([Number(post.latitude), Number(post.longitude)], {
          icon,
          post,
        })
        .bindPopup(popup);
    });
    clusterGroupRef.current.addLayers(markers);
  }, [filteredPosts]);

  // Function to initialize Leaflet map
  const initializeLeafletMap = useCallback(() => {
    if (mapRef.current) return; // Prevent re-initialization

    mapRef.current = leaflet.map("map", {
      preferCanvas: true,
      center: [0, 20], // Default center (Africa) - will be overridden by flyToInitialLocation
      zoom: 2, // Default zoom - will be overridden by flyToInitialLocation
      worldCopyJump: true,
    });

    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    setupClustering();
    setupDrawingTools();
    setupEventListeners();
    setTimeout(() => {
      loadGeoFences();
    }, 2000); // Load geofences after map is ready
  }, []); // No dependencies, as it sets up static map elements

  const setupClustering = () => {
    clusterGroupRef.current = leaflet
      .markerClusterGroup({
        iconCreateFunction: (cluster) =>
          leaflet.divIcon({
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
            className: "custom-cluster",
            iconSize: [40, 40],
          }),
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      })
      .addTo(mapRef.current);
  };

  const setupDrawingTools = () => {
    drawnItemsRef.current = new leaflet.FeatureGroup().addTo(mapRef.current);
    drawControlRef.current = new leaflet.Control.Draw({
      position: "topright",
      draw: {
        polygon: { showArea: true },
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: { featureGroup: drawnItemsRef.current },
    }).addTo(mapRef.current);
  };

  const setupEventListeners = () => {
    mapRef.current.on("draw:created", handleDrawCreated);
    mapRef.current.on("draw:deleted", handleDrawDeleted);
    // Listen for zoom events on the Leaflet map to potentially switch back to globe
    mapRef.current.on("zoomend", handleLeafletZoom);
  };

  const cleanupMap = () => {
    if (mapRef.current) {
      mapRef.current.off(); // Remove all event listeners
      mapRef.current.remove(); // Remove map from DOM and destroy it
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

    const filtered = postsRef.current.filter((post) => {
      try {
        return bounds.contains(
          leaflet.latLng(Number(post.latitude), Number(post.longitude))
        );
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
      <div className=" p-2  bg-[#1F2F3F] hover:bg-[#3F1F2F]">
        <h6 className="fw-bold mb-2 truncate w-full my-font-family-courier-prime capitalize text-gray-50">{fence.name}</h6>
        <div className="text-muted small">
          <div className="truncate w-full text-gray-100">Created: {new Date(fence.created_at).toLocaleDateString()}</div>
          <div className="truncate w-full text-gray-100">Coordinates: {fence.coordinates.length - 1} points</div>
        </div>
      </div>
    );
    return container;
  };
  useEffect(() => {
    return () => {
      // Cleanup layers when component unmounts
      Object.values(geoFenceLayers).forEach(layer => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
    };
  }, [geoFenceLayers]);
  const toggleGeoFenceVisibility = useCallback((fenceId) => {
    setVisibleGeoFences(prev => {
      const newVisibility = {
        ...prev,
        [fenceId]: !prev[fenceId] // This will properly toggle even if undefined
      };

      const layer = geoFenceLayers[fenceId];
      if (layer) {
        if (newVisibility[fenceId]) {
          if (!drawnItemsRef.current.hasLayer(layer)) {
            drawnItemsRef.current.addLayer(layer);
          }
        } else {
          if (drawnItemsRef.current.hasLayer(layer)) {
            drawnItemsRef.current.removeLayer(layer);
          }
        }
      }

      return newVisibility;
    });
  }, [geoFenceLayers]);

  const toggleAllGeoFences = useCallback((checked) => {
    setVisibleGeoFences(prev => {
      const newVisibility = {};

      Object.entries(geoFenceLayers).forEach(([fenceId, layer]) => {
        newVisibility[fenceId] = checked;

        if (checked) {
          if (!drawnItemsRef.current.hasLayer(layer)) {
            drawnItemsRef.current.addLayer(layer);
          }
        } else {
          if (drawnItemsRef.current.hasLayer(layer)) {
            drawnItemsRef.current.removeLayer(layer);
          }
        }
      });

      return newVisibility;
    });
  }, [geoFenceLayers]);

  const loadGeoFences1 = async () => {
    let deployment = localStorage.getItem("deployment");
    let deployment_id = JSON.parse(deployment).id;
    try {
      const response = await axiosInstance.get(
        "getGeoFences/" + deployment_id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (response?.data) {
        const loadedFences = response.data.fences;
        setGeoFences(loadedFences);

        // Clear existing geo-fence layers before adding new ones
        drawnItemsRef.current.eachLayer((layer) => {
          if (layer.options.metadata?.type === "geo-fence") {
            drawnItemsRef.current.removeLayer(layer);
          }
        });

        loadedFences.forEach((fence) => {
          const polygon = leaflet
            .polygon(
              fence.coordinates.map((coord) => [coord.lat, coord.lng]),
              {
                color: "#ff0000",
                fillOpacity: 0.1,
                metadata: {
                  type: "geo-fence",
                  id: fence.id,
                  name: fence.name,
                  created_at: fence.created_at,
                },
              }
            )
            .bindPopup(() => createGeoFencePopup(fence));

          polygon.on("click", (e) => {
            e.target.openPopup();
          });

          drawnItemsRef.current.addLayer(polygon);
        });
      }
    } catch (err) {
      console.error("Error loading geo-fences:", err);
    }
  };

const loadGeoFences2 = async () => {
  let deployment = localStorage.getItem("deployment");
  let deployment_id = JSON.parse(deployment).id;
  try {
    const response = await axiosInstance.get(
      "getGeoFences/" + deployment_id,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );

    if (response?.data) {
      const loadedFences = response.data.fences;
      setGeoFences(loadedFences);

      // Clear existing geo-fence layers before adding new ones
      Object.values(geoFenceLayers).forEach(layer => {
        if (drawnItemsRef.current.hasLayer(layer)) {
          drawnItemsRef.current.removeLayer(layer);
        }
      });

      const newLayers = {};
      loadedFences.forEach((fence) => {
        const polygon = leaflet.polygon(
          fence.coordinates.map((coord) => [coord.lat, coord.lng]),
          {
            color: "#ff0000",
            fillOpacity: 0.1,
            metadata: {
              type: "geo-fence",
              id: fence.id,
              name: fence.name,
              created_at: fence.created_at,
            },
          }
        ).bindPopup(() => createGeoFencePopup(fence));

        polygon.on("click", (e) => {
          e.target.openPopup();
        });

        newLayers[fence.id] = polygon;

        // Add to map if visible (or if visibility not set yet)
        if (visibleGeoFences[fence.id] !== false) {
          drawnItemsRef.current.addLayer(polygon);
          setVisibleGeoFences(prev => ({...prev, [fence.id]: true}));
        }
      });

      setGeoFenceLayers(newLayers);
    }
  } catch (err) {
    console.error("Error loading geo-fences:", err);
  }
};
const loadGeoFences = async () => {
  let deployment = localStorage.getItem("deployment");
  let deployment_id = JSON.parse(deployment).id;
  try {
    const response = await axiosInstance.get(
      "getGeoFences/" + deployment_id,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );

    if (response?.data) {
      const loadedFences = response.data.fences;
      setGeoFences(loadedFences);

      // Clear existing geo-fence layers
      Object.values(geoFenceLayers).forEach(layer => {
        if (drawnItemsRef.current.hasLayer(layer)) {
          drawnItemsRef.current.removeLayer(layer);
        }
      });

      const newLayers = {};
      const newVisibility = {};

      loadedFences.forEach((fence) => {
        const polygon = leaflet.polygon(
          fence.coordinates.map((coord) => [coord.lat, coord.lng]),
          {
            color: "#ff0000",
            fillOpacity: 0.1,
            metadata: {
              type: "geo-fence",
              id: fence.id,
              name: fence.name,
              created_at: fence.created_at,
            },
          }
        ).bindPopup(() => createGeoFencePopup(fence));

        polygon.on("click", (e) => {
          e.target.openPopup();
        });

        newLayers[fence.id] = polygon;
        newVisibility[fence.id] = false; // Set all fences to unchecked by default

        // Don't add to map initially (since they're unchecked)
      });

      setGeoFenceLayers(newLayers);
      setVisibleGeoFences(newVisibility); // Update visibility state
    }
  } catch (err) {
    console.error("Error loading geo-fences:", err);
  }
};
  const handleSaveGeoFence = async (geoFence) => {
    let deployment = localStorage.getItem("deployment");
    let deployment_id = JSON.parse(deployment).id;
    try {
      const data = {
        ...geoFence,
        coordinates: geoFence.coordinates.flat(),
        deployment: deployment_id,
      };
      const response = await axiosInstance.post("saveGeoFence", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (response?.data?.status === "success") {
        dispatch(
          toggleToaster({
            isOpen: true,
            toasterData: {
              type: "success",
              msg: "Geofence Added successfully.",
            },
          })
        );
        const newFence = response.data.fence;
        const newLayer = lastDrawnLayer;
        newLayer.bindPopup(() => createGeoFencePopup(newFence));
        newLayer.options.metadata = {
          type: "geo-fence",
          id: newFence.id,
          name: newFence.name,
          created_at: newFence.created_at,
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

  // --- New Logic for 3D Globe to Leaflet Transition ---

  // Callback from 3D Globe when user zooms in enough
  const handleGlobeZoomIn = useCallback(() => {
    // When zooming in on globe, we transition to Leaflet.
    // Reset initialLeafletFlyDone to ensure Leaflet flies to the *new* target (either user location or globe click).
    setInitialLeafletFlyDone(false);
    setShow3DGlobe(false); // Hide globe, show Leaflet
  }, []);

  // Callback from 3D Globe when user clicks on a point
  const handleGlobeClick = useCallback(({ lat, lon }) => {
    setLeafletInitialTarget({ lat, lon }); // Store the clicked location
    setShow3DGlobe(false); // Switch to Leaflet map
    setInitialLeafletFlyDone(false); // Ensure Leaflet flies to this new target
  }, []);

  // Callback from Leaflet map when user zooms out enough
  const handleLeafletZoom = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      // Define a threshold zoom level to switch back to the globe
      // Increased threshold for easier activation
      const zoomOutThreshold = 4; // Changed from 3 to 4 for better responsiveness
      if (currentZoom <= zoomOutThreshold && !show3DGlobe) {
        setShow3DGlobe(true); // Switch back to 3D globe
        setLeafletInitialTarget(null); // Clear the target as we are going back to globe
      }
    }
  }, [show3DGlobe]);

  // Effect to handle Leaflet map visibility and initialization/cleanup
  useEffect(() => {
    if (!show3DGlobe) {
      // If Leaflet map should be visible
      if (!mapRef.current) {
        initializeLeafletMap();
      }
      // Crucial: Invalidate size when it becomes visible to ensure proper rendering
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    } else {
      // If 3D globe should be visible (Leaflet map hidden)
      // Clean up Leaflet map if it exists, to prevent memory leaks and ensure clean re-init
      cleanupMap();
      // Reset leafletInitialTarget when going back to globe, so it doesn't persist for the next Leaflet display
      setLeafletInitialTarget(null);
    }
  }, [show3DGlobe, initializeLeafletMap]);

  // Effect for handling initial location fly-to on Leaflet map
  useEffect(() => {
    const flyToInitialLocation = async () => {
      // Only run if Leaflet map is visible, map is initialized, and we haven't flown yet
      if (!mapRef.current || show3DGlobe || initialLeafletFlyDone) return;

      // Prioritize globe click target if available
      if (leafletInitialTarget) {
        try {
          // Reverse geocode the clicked point to get the country name
          const reverseGeocodeResponse = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${leafletInitialTarget.lat}&lon=${leafletInitialTarget.lon}`
          );
          const countryName = reverseGeocodeResponse.data.address.country;

          if (countryName) {
            // Geocode the country name to get its bounding box
            const geocodeResponse = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${countryName}&limit=1&extratags=1`
            );
            if (geocodeResponse.data && geocodeResponse.data.length > 0) {
              const bbox = geocodeResponse.data[0].boundingbox;
              const southWest = leaflet.latLng(bbox[0], bbox[2]);
              const northEast = leaflet.latLng(bbox[1], bbox[3]);
              const countryBounds = leaflet.latLngBounds(southWest, northEast);

              mapRef.current.flyToBounds(countryBounds, {
                duration: 1.5,
                easeLinearity: 0.7,
                maxZoom: 10,
              });
              setInitialLeafletFlyDone(true);
              return; // Exit after flying to country
            }
          }
        } catch (error) {
          console.error(
            "Error getting country from globe click or flying to it:",
            error
          );
          // Fallback to flying to the exact point if country lookup fails
          mapRef.current.flyTo(
            [leafletInitialTarget.lat, leafletInitialTarget.lon],
            10,
            { duration: 1.5 }
          );
          setInitialLeafletFlyDone(true);
          return;
        }
      }

      // Fallback to user's current location if no specific target from globe click or country lookup failed
      if (!location.latitude) return;

      const createUserIcon = () =>
        leaflet.divIcon({
          html: `
                  <div style="position: absolute; left: 0; top: 0; width: 24px; height: 24px; color: #000000;
                      font-size: 24px; display: flex; align-items: center; justify-content: center; text-shadow: 0 0 3px #ffffff;">
                      <i class="fa-solid fa-circle-user"></i>
                  </div>
              `,
          className: "user-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24],
        });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([
          location.latitude,
          location.longitude,
        ]);
        userMarkerRef.current.setIcon(createUserIcon());
      } else {
        userMarkerRef.current = leaflet
          .marker([location.latitude, location.longitude], {
            icon: createUserIcon(),
          })
          .addTo(mapRef.current);
      }

      try {
        const reverseGeocodeResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`
        );
        const countryName = reverseGeocodeResponse.data.address.country;

        if (countryName) {
          const geocodeResponse = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${countryName}&limit=1&extratags=1`
          );
          if (geocodeResponse.data && geocodeResponse.data.length > 0) {
            const bbox = geocodeResponse.data[0].boundingbox;
            const southWest = leaflet.latLng(bbox[0], bbox[2]);
            const northEast = leaflet.latLng(bbox[1], bbox[3]);
            const countryBounds = leaflet.latLngBounds(southWest, northEast);

            mapRef.current.flyToBounds(countryBounds, {
              duration: 1.5,
              easeLinearity: 0.7,
              maxZoom: 10,
            });
            setInitialLeafletFlyDone(true);
          }
        }
      } catch (error) {
        console.error("Error getting user's country or flying to it:", error);
        mapRef.current.flyTo([location.latitude, location.longitude], 13, {
          duration: 1.5,
        });
        setInitialLeafletFlyDone(true);
      }
    };

    // Only attempt to fly if we are in Leaflet view and mapRef.current is available
    if (!show3DGlobe && mapRef.current) {
      flyToInitialLocation();
    }
  }, [location, initialLeafletFlyDone, show3DGlobe, leafletInitialTarget]); // Add leafletInitialTarget to dependencies

  useEffect(() => {
    // This effect should only run when Leaflet map is active and posts change
    if (!mapRef.current || show3DGlobe || !clusterGroupRef.current) return;

    clusterGroupRef.current.clearLayers();
    const markers = postsRef.current.map((post) => {
      const icon = createCustomIcon(post?.icon, post?.color);
      const popup = createPopup(post);
      return leaflet
        .marker([Number(post.latitude), Number(post.longitude)], { icon, post })
        .bindPopup(popup);
    });
    clusterGroupRef.current.addLayers(markers);
  }, [props.posts, show3DGlobe]); // Also depend on show3DGlobe

  const createPopup = (post) => {
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      <PopupSinglePost
        post={post}
        show={show}
        setShow={setShow}
        setSelectedRecord={setSelectedRecord}
        handleReadMore={props?.handleReadMore}
      />
    );
    return container;
  };

  // Add timeline control to the return statement
  return (
    <>
      <style>{`
              /* Your existing CSS styles */
              .leaflet-marker-icon, .leaflet-div-icon { background: none !important; border: none !important; }
              .custom-cluster { background: none !important; border: none !important; }
              .leaflet-draw-toolbar a { background-image: url(https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/images/spritesheet.png) !important; }
              .modal { z-index: 10000; }
              .leaflet-draw-toolbar { background-color:white; margin-top: 45px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 8px !important; }
              .leaflet-popup-content{
    width: 300px !important;
      }
              .geo-fence-popup .leaflet-popup-content-wrapper { border-radius: 8px; max-width: 200px; }
              .geo-fence-popup h6 { font-size: 0.9rem;  margin-bottom: 0.5rem; }
              .geo-fence-popup .text-muted { font-size: 0.8rem;  }
              .timeline-control { position: absolute; bottom: 20px; left: 20px; right: 20px; z-index: 1000; max-width: calc(100% - 40px); overflow-x: auto; }
              .timeline-scroller { display: flex; gap: 8px; padding-bottom: 8px; }
              .timeline-scroller::-webkit-scrollbar { height: 6px; background-color: #f5f5f5; }
              .timeline-scroller::-webkit-scrollbar-thumb { background-color: #888; border-radius: 3px; }
              /* Add some styles for the container */
              .map-container-wrapper {
                  position: relative;
                  height: calc(100vh - 165px);
                  width: 100%;
                  background-color: #f5f5f5;
              }
              #map {
                  height: 100%; /* Make Leaflet map fill its parent */
                  width: 100%;
              }
              /* Ensure 3D Globe also fills its parent */
              .three-globe-container {
                  position: absolute;
                  top: 0;
                  left: 0;
                  height: 100%;
                  width: 100%;
                  z-index: 1; /* Below Leaflet controls if they are always visible */
              }
                  .leaflet-popup-content-wrapper, .leaflet-popup-tip {
    background: transparent;
    color: #333;
    box-shadow: none;
}
          `}</style>
      <div className="px-4 pb-2 pt-1 min-h-screen font-mono text-white">
        <div className="flex justify-between items-center mb-2 pr-0">
          <h1 className="text-2xl tracking-widest my-font-family-ailerons text-[1.7em]">
            MaP VIEW
          </h1>
          <div className="pt-0">
            <button className="px-3 pt-0 py-2 border  bg-gray-400 border-gray-500 text-black mr-2 text-sm hover:bg-gray-300">
              Reports [{props?.posts?.length}]
            </button>
          </div>
        </div>
        <div className="map-container-wrapper">
          {/* 3D Globe Component - conditionally rendered */}
          {show3DGlobe && (
            <div className="three-globe-container">
              <Globe3DComponent
                onGlobeReady={() => console.log("3D Globe is ready")}
                onZoomInThreshold={handleGlobeZoomIn} // Callback to switch to Leaflet
                // The onZoomOutThreshold for Globe3DComponent is about the globe's internal zoom,
                // not for switching back from Leaflet. So, we can keep it simple or remove if not needed.
                // For now, it's not directly used for switching back FROM Leaflet.
                onGlobeClick={handleGlobeClick} // Callback for globe clicks
                initialTargetLatLon={leafletInitialTarget} // Pass target to globe if needed
              />
            </div>
          )}

          {/* Leaflet Map Div - conditionally rendered */}
          <div id="map" style={{ display: show3DGlobe ? "none" : "block" }}>
            {/* Leaflet controls go here if you want them on top of the map */}
            <div className="leaflet-top leaflet-right">
              <div className="leaflet-control leaflet-bar p-2 bg-white shadow">
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={toggleTimeline}
                >
                  {showTimeline ? "Hide" : "Show"} Timeline
                </button>

                <span className="text-sm text-gray-600">
                  {props.posts?.length || 0} Results
                  {selectedPosts.length > 0 &&
                    ` | ${selectedPosts.length} selected`}
                </span>
                {/* Button to explicitly go back to 3D globe */}
                {!show3DGlobe && (
                  <button
                    className="btn btn-sm btn-info ms-2"
                    onClick={() => setShow3DGlobe(true)}
                  >
                    View Globe
                  </button>
                )}
                  <button
      className="btn btn-sm  me-2 ml-2 cursor-pointer"
      onClick={handleCenterMyLocation}
      disabled={!location.latitude}
      title="Center on my location"
    >
      {/* <i className="fas fa-align-center" /> */}
      <i class="fa-solid fa-location-crosshairs h-5 w-5"></i>
    </button>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* End map-container-wrapper */}
        {/* Timeline component - conditionally rendered outside map container but still based on showTimeline state */}
        {!show3DGlobe && geoFences.length > 0 && (
  <GeoFenceControls
    geoFences={geoFences}
    visibleGeoFences={visibleGeoFences}
    onToggleGeoFence={toggleGeoFenceVisibility}
    onToggleAll={toggleAllGeoFences}
  />
)}
        {showTimeline && timelineExtremes.start && (
          <TimelineControl
            intervals={intervals}
            currentInterval={currentInterval}
            granularity={granularity}
            isPlaying={isPlaying}
            onIntervalSelect={setCurrentInterval}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onGranularityChange={setGranularity}
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
