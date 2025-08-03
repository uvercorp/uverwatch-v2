import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

// Confirmed working imports for Line components from 'three/addons'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry';
import { LineSegments2 } from 'three/addons/lines/LineSegments2';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// IMPORTANT: Ensure these paths are correct and the images exist in your assets/textures folder!
// Using placeholder images for demonstration purposes as actual paths might not be accessible.
// In a real application, you would replace these with your actual image paths.
// const earthTextureDayPath = 'https://placehold.co/2048x1024/000000/FFFFFF?text=Earth+Daymap';
// const earthTextureNightPath = 'https://placehold.co/2048x1024/000000/FFFFFF?text=Earth+Nightmap';
import earthTextureDayPath from 'assets/textures/earth_daymap.jpg';

import earthTextureNightPath from 'assets/textures/earth_nightmap.jpg';
import countriesData from 'assets/textures/countries.geo.json';


// Helper to convert LatLng to spherical coordinates for Three.js
const latLonToCartesian = (lat, lon, radius) => {
    const phi = THREE.MathUtils.degToRad(90 - lat); // Phi: polar angle (0 at North Pole, PI at South Pole)
    const theta = THREE.MathUtils.degToRad(-lon); // Theta: azimuthal angle. Negate lon to flip direction.

    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta), // X
        radius * Math.cos(phi),                   // Y
        radius * Math.sin(phi) * Math.sin(theta)  // Z
    );
};

// Function to load and process GeoJSON for Three.js lines
const loadCountryOutlines = async (radius) => {

    try {
        // IMPORTANT: Check if this URL is accessible and returns valid GeoJSON.
        // const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/main/data/countries.geojson');assets/textures/earth_daymap.jpg
        // const response = await fetch('../assets/textures/countries.geo.json');
        // const response = await fetch(countriesData);
        // if (!response.ok) {
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const geojson = await response.json();
        const geojson = countriesData;


        const points = []; // Array to hold all line segments
        // Initial resolution for the LineMaterial, will be updated on resize
        const initialResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

        const material = new LineMaterial({
            color: 0xffffff, // White lines for outlines
            linewidth: 1.5,  // Line thickness (in pixels)
            resolution: initialResolution, // Will be updated on resize
            dashed: false,
            // Adjusting these properties to potentially fix blinking/flickering
            alphaToCoverage: false, // Set to false for better compatibility/stability
            transparent: true,      // Lines are inherently transparent
            depthWrite: false,      // Disable depth writing to prevent z-fighting with the globe
            depthTest: true,        // Keep depth testing to ensure lines are occluded by the globe
        });

        geojson.features.forEach(feature => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates.forEach(ring => {
                    for (let i = 0; i < ring.length - 1; i++) {
                        const p1 = latLonToCartesian(ring[i][1], ring[i][0], radius);
                        const p2 = latLonToCartesian(ring[i + 1][1], ring[i + 1][0], radius);
                        points.push(p1.x, p1.y, p1.z);
                        points.push(p2.x, p2.y, p2.z);
                    }
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        for (let i = 0; i < ring.length - 1; i++) {
                            const p1 = latLonToCartesian(ring[i][1], ring[i][0], radius);
                            const p2 = latLonToCartesian(ring[i + 1][1], ring[i + 1][0], radius);
                            points.push(p1.x, p1.y, p1.z);
                            points.push(p2.x, p2.y, p2.z);
                        }
                    });
                });
            }
        });

        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(new Float32Array(points));

        const lines = new LineSegments2(geometry, material);
        lines.computeLineDistances(); // Necessary for proper line rendering

        return { lines, material };

    } catch (error) {
        console.error("Error loading country outlines:", error);
        // Do not throw error here, allow the component to render without outlines if fetch fails
        return { lines: null, material: null };
    }
};

const Globe3DComponent = ({ onGlobeReady, onZoomInThreshold }) => {
    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const earthMeshRef = useRef(null);
    const outlineLinesRef = useRef(null);
    const lineMaterialRef = useRef(null); // Reference to the material for resolution updates
    const dayTextureRef = useRef(null); // Ref to store the loaded day texture object
    const nightTextureRef = useRef(null); // Ref to store the loaded night texture object

    const [isZoomedInEnough, setIsZoomedInEnough] = useState(false);

    // Callback to check if camera is zoomed in enough
    const checkZoomThreshold = useCallback(() => {
        if (cameraRef.current && onZoomInThreshold && earthMeshRef.current) {
            const distance = cameraRef.current.position.distanceTo(earthMeshRef.current.position);
            // Threshold is 1.2 times the globe radius. Adjust as needed.
            const threshold = earthMeshRef.current.geometry.parameters.radius * 1.2;

            if (distance < threshold && !isZoomedInEnough) {
                setIsZoomedInEnough(true);
                onZoomInThreshold(); // Callback to parent to switch to Leaflet
            } else if (distance >= threshold && isZoomedInEnough) {
                setIsZoomedInEnough(false);
            }
        }
    }, [isZoomedInEnough, onZoomInThreshold]);

    // Handles window resize, updates camera aspect, renderer size, and line material resolution
    const handleResize = useCallback(() => {
        const currentMount = mountRef.current;
        if (currentMount && cameraRef.current && rendererRef.current && lineMaterialRef.current) {
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            // Crucial for LineMaterial to update its resolution on resize
            lineMaterialRef.current.resolution.set(currentMount.clientWidth, currentMount.clientHeight);
        }
    }, []);

    // Function to zoom in
    const zoomIn = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.dollyIn(1.2); // Adjust zoom factor as needed
            controlsRef.current.update();
            checkZoomThreshold(); // Re-check zoom threshold after manual zoom
        }
    }, [checkZoomThreshold]);

    // Function to zoom out
    const zoomOut = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.dollyOut(1.2); // Adjust zoom factor as needed
            controlsRef.current.update();
            checkZoomThreshold(); // Re-check zoom threshold after manual zoom
        }
    }, [checkZoomThreshold]);

    // Handle double click to zoom in
    const handleDoubleClick = useCallback((event) => {
        if (controlsRef.current) {
            // Dolly in by a factor. This will zoom towards the controls target.
            controlsRef.current.dollyOut(1.5); // Stronger zoom for double click
            controlsRef.current.update();
            checkZoomThreshold(); // Re-check zoom threshold after double click zoom
        }
    }, [checkZoomThreshold]);


    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        let scene, camera, renderer, controls, earthMesh;
        let animationFrameId;

        try {
            // 1. Scene Setup
            scene = new THREE.Scene();
            sceneRef.current = scene;
            camera = new THREE.PerspectiveCamera(
                75, // FOV
                currentMount.clientWidth / currentMount.clientHeight, // Aspect Ratio
                0.1, // Near clipping plane
                1000 // Far clipping plane
            );
            cameraRef.current = camera;
            camera.position.set(0, 0, 1.7); // Camera on +Z looking at origin

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            rendererRef.current = renderer;
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            currentMount.appendChild(renderer.domElement);

            // 2. Earth Globe
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const textureLoader = new THREE.TextureLoader();

            // Load textures
            const loadedDayTexture = textureLoader.load(earthTextureDayPath,
                () => { /* console.log('Day texture loaded'); */ },
                undefined,
                (err) => { console.error('Error loading day texture:', err); }
            );
            dayTextureRef.current = loadedDayTexture;

            const loadedNightTexture = textureLoader.load(earthTextureNightPath,
                () => { /* console.log('Night texture loaded'); */ },
                undefined,
                (err) => { console.error('Error loading night texture:', err); }
            );
            nightTextureRef.current = loadedNightTexture;

            const material = new THREE.MeshPhongMaterial({ map: loadedDayTexture });
            earthMesh = new THREE.Mesh(geometry, material);
            scene.add(earthMesh);
            earthMeshRef.current = earthMesh;

            // Initial rotation to center Africa and add a slight tilt
            // With 0 longitude at +X axis and camera on +Z looking at origin:
            // To bring Africa (approx 15E) to face the camera (which is at +Z, looking at -Z),
            // we need to rotate the globe clockwise by (90 + 15) degrees.
            earthMesh.rotation.y = THREE.MathUtils.degToRad(-(90 + 15)); // Rotates clockwise (negative Y-axis rotation)
            earthMesh.rotation.x = THREE.MathUtils.degToRad(-10); // Slight tilt for perspective

            // 3. Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 2);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 3, 5);
            scene.add(directionalLight);

            // 4. Country Outlines
            // Load outlines using the adjusted latLonToCartesian function
            loadCountryOutlines(1.001) // Slightly larger radius to avoid z-fighting
                .then(({ lines, material: lineMat }) => {
                    if (lines) {
                        scene.add(lines);
                        outlineLinesRef.current = lines;
                        lineMaterialRef.current = lineMat;
                        // Ensure initial resolution is set for the line material
                        lineMat.resolution.set(currentMount.clientWidth, currentMount.clientHeight);
                        // Also apply the same initial rotation to the lines so they align with the globe
                        lines.rotation.copy(earthMesh.rotation);
                    }
                })
                .catch(error => {
                    console.error("Failed to add country outlines to scene:", error);
                    // Continue without outlines if loading fails
                });

            // 5. Orbit Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controlsRef.current = controls;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 1.1; // Minimum zoom distance
            controls.maxDistance = 5;    // Maximum zoom distance
            controls.zoomSpeed = 0.5;
            controls.addEventListener('change', checkZoomThreshold); // Listen for control changes to check zoom

            // 6. Animation Loop
            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            // 7. Handle Resize
            window.addEventListener('resize', handleResize);

            onGlobeReady && onGlobeReady();

        } catch (error) {
            console.error("Three.js initialization failed:", error);
            // Re-throw to be caught by an ErrorBoundary if implemented
            throw error;
        }

        // Cleanup function for useEffect
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (controls) controls.removeEventListener('change', checkZoomThreshold);
            if (controls) controls.dispose();
            if (renderer) renderer.dispose();
            if (currentMount && renderer && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            window.removeEventListener('resize', handleResize);

            // Dispose of Three.js assets to prevent memory leaks
            if (earthMesh && earthMesh.material) earthMesh.material.dispose();
            if (earthMesh && earthMesh.geometry) earthMesh.geometry.dispose();

            if (dayTextureRef.current) dayTextureRef.current.dispose();
            if (nightTextureRef.current) nightTextureRef.current.dispose();

            if (outlineLinesRef.current) {
                outlineLinesRef.current.geometry.dispose();
                outlineLinesRef.current.material.dispose();
            }
            if (scene) scene.clear();
        };
    }, [checkZoomThreshold, onGlobeReady, handleResize, earthTextureDayPath, earthTextureNightPath]);


    // Function to reset the globe view to its initial state
    const resetGlobeView = useCallback(() => {
        if (controlsRef.current && earthMeshRef.current && cameraRef.current) {
            // Reset to show Africa with the new rotation
            earthMeshRef.current.rotation.y = THREE.MathUtils.degToRad(-(90 + 15));
            earthMeshRef.current.rotation.x = THREE.MathUtils.degToRad(-10);
            if (outlineLinesRef.current) { // Ensure lines also reset their rotation
                outlineLinesRef.current.rotation.copy(earthMeshRef.current.rotation);
            }
            cameraRef.current.position.set(0, 0, 2.0); // Reset camera distance
            controlsRef.current.target.set(0, 0, 0); // Reset target to origin
            controlsRef.current.update(); // Update controls to apply changes
            setIsZoomedInEnough(false); // Reset zoom state
        }
    }, []);

    return (
        <div
            ref={mountRef}
            className="relative w-full h-full flex justify-center items-center" // Use flex for centering
            style={{
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 60%, black 100%)',
                overflow: 'hidden',
            }}
            onDoubleClick={handleDoubleClick} // Add double click listener
        >
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4  flex flex-col space-y-2 z-10">
                <button
                    onClick={zoomIn}
                    className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button
                    onClick={zoomOut}
                    className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                </button>
            </div>
            {/* Reset View Button */}
            <div className="absolute bottom-4 left-4 z-10">
                <button
                    onClick={resetGlobeView}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    Reset View
                </button>
            </div>
        </div>
    );
};

export default Globe3DComponent;
