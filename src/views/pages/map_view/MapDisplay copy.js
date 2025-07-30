import React, { useEffect, useRef, useState } from "react";
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

function SelectedPostsModal({ 
  show, 
  onClose, 
  posts, 
  geoFenceData,
  onSaveGeoFence,
  onClearSelection 
}) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for the geo-fence');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveGeoFence({
        name: name.trim(),
        coordinates: geoFenceData
      });
      setName('');
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save geo-fence');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`modal fade ${show ? 'show d-block' : 'd-none'}`} 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {posts.length > 0 ? 
                `${posts.length} Posts in Selected Area` : 
                "Create New Geo-Fence"}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {posts.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Posts within area:</h6>
                <div className="list-group" style={{ 
                  maxHeight: '40vh', 
                  overflowY: 'auto',
                  scrollbarWidth: 'thin'
                }}>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="list-group-item list-group-item-action d-flex gap-3 py-3"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <div>
                          <h6 className="mb-1 fw-bold">{post.title}</h6>
                          <p className="mb-0 text-muted small">{post.description}</p>
                        </div>
                        <small className="text-nowrap">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="geo-fence-form">
              <label htmlFor="geoFenceName" className="form-label fw-bold">
                Geo-Fence Details
              </label>
              <input
                type="text"
                id="geoFenceName"
                className="form-control mb-3"
                placeholder="Enter geo-fence name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
              />
              
              <div className="alert alert-info mb-0">
                {posts.length === 0 && "No posts found in the selected area. "}
                You can save this area as a geo-fence to monitor future posts.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={onClearSelection}
              disabled={isSaving}
            >
              Clear Current Area
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Geo-Fence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapDisplayComponent(props) {
  const [show, setShow] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [geoFenceData, setGeoFenceData] = useState(null);
  const [lastDrawnLayer, setLastDrawnLayer] = useState(null);
  const [geoFences, setGeoFences] = useState([]);
  
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
          position: relative;
          transform: translate(-50%, -100%);
          color: ${color};
          font-size: 28px;
          text-shadow: 0 0 3px #ffffff;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        ">
          <i class="${iconClass}"></i>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [12, 24]
    });
  };

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

  useEffect(() => {
    if (!mapRef.current || !location.latitude) return;
    
    userMarkerRef.current?.remove();
    userMarkerRef.current = leaflet.marker([location.latitude, location.longitude], { 
      icon: createCustomIcon("fa-solid fa-circle-user", "#000000")
    }).addTo(mapRef.current);
    
    mapRef.current.flyTo([location.latitude, location.longitude]);
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
      `}</style>
      
      <div id="map" style={{ 
        height: "calc(100vh - 165px)",
        width: "100%",
        backgroundColor: "#f5f5f5"
      }}>
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control leaflet-bar p-2 bg-white shadow">
            <span className="text-sm text-gray-600">
              {props.posts?.length || 0} Results
              {selectedPosts.length > 0 && ` | ${selectedPosts.length} selected`}
            </span>
          </div>
        </div>
      </div>

      {/* <SelectedPostsModal */}
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