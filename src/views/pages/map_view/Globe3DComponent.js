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
import earthTextureDayPath from 'assets/textures/earth_daymap.jpg';
import earthTextureNightPath from 'assets/textures/earth_nightmap.jpg';
import countriesData from 'assets/textures/countries.geo.json';


// Define the initial rotation of the globe for consistent coordinate transformations.
// This matches the initial rotation applied to the earthMesh in the useEffect.
const initialGlobeRotationEuler = new THREE.Euler(
    THREE.MathUtils.degToRad(-10), // X rotation (tilt)
    THREE.MathUtils.degToRad(-(90 + 15)), // Y rotation (to center Africa)
    0, // Z rotation
    'XYZ' // Order of rotations
);

// Helper to convert LatLng to spherical coordinates for Three.js
// This assumes an unrotated globe where North Pole is +Y, 0 Longitude is +X, 90E is +Z.
const latLonToCartesian = (lat, lon, radius) => {
    const phi = THREE.MathUtils.degToRad(90 - lat); // Phi: polar angle (0 at North Pole, PI at South Pole)
    const theta = THREE.MathUtils.degToRad(-lon); // Theta: azimuthal angle. Negate lon to flip direction.

    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta), // X
        radius * Math.cos(phi),                   // Y
        radius * Math.sin(phi) * Math.sin(theta)  // Z
    );
};

// Helper to convert Cartesian coordinates on the globe to LatLng
// This assumes an unrotated globe where North Pole is +Y, 0 Longitude is +X, 90E is +Z.
const cartesianToLatLon = (vector, radius) => {
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(vector.y / radius));
    // Adjust longitude calculation based on how latLonToCartesian was defined
    // atan2(y, x) gives angle from +X axis. Our theta was -lon.
    // So, -lon_deg = THREE.MathUtils.radToDeg(Math.atan2(vector.z, vector.x))
    const lon = -THREE.MathUtils.radToDeg(Math.atan2(vector.z, vector.x));
    return { lat, lon };
};

// Function to load and process GeoJSON for Three.js lines
const loadCountryOutlines = async (radius) => {
    try {
        const geojson = countriesData; // Using imported JSON directly

        const points = []; // Array to hold all line segments
        // Initial resolution for the LineMaterial, will be updated on resize
        const initialResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

        const material = new LineMaterial({
            color: 0xffffff, // White lines for outlines
            linewidth: 1.5,  // Line thickness (in pixels)
            resolution: initialResolution, // Will be updated on resize
            dashed: false,
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
                    }
                    );
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
        return { lines: null, material: null };
    }
};

// Function to create a text sprite for a given text and position
const createTextSprite = (text, position, scaleFactor = 0.01) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 50; // Base font size for rendering on canvas
    const padding = 6;

    context.font = `${fontSize}px Arial`;
    const textMetrics = context.measureText(text);
    canvas.width = textMetrics.width + padding * 2;
    canvas.height = fontSize + padding * 2;

    context.font = `${fontSize}px Arial`; // Re-set font after canvas resize
    context.fillStyle = 'rgba(255, 255, 255, 0.8)'; // White text with some transparency
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Improves text clarity

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    // Set sprite scale based on its content and a scale factor
    // The sprite's size in world units will be (canvas.width / fontSize) * scaleFactor, (canvas.height / fontSize) * scaleFactor
    sprite.scale.set(canvas.width / fontSize * scaleFactor, canvas.height / fontSize * scaleFactor, 1);
    sprite.position.copy(position);

    return sprite;
};


// Function to load country name sprites
const loadCountryNameSprites = async (radius) => {
    const sprites = [];
    try {
        const geojson = countriesData; // Using imported JSON directly

        geojson.features.forEach(feature => {
            const countryName = feature.properties.name;
            if (!countryName) return;

            let coordinates = [];
            if (feature.geometry.type === 'Polygon') {
                coordinates = feature.geometry.coordinates[0]; // Outer ring
            } else if (feature.geometry.type === 'MultiPolygon') {
                // Take the first polygon's outer ring for simplicity
                if (feature.geometry.coordinates.length > 0 && feature.geometry.coordinates[0].length > 0) {
                    coordinates = feature.geometry.coordinates[0][0];
                }
            }

            if (coordinates.length === 0) return;

            // Calculate a simple centroid for the country (average of all points)
            let sumLat = 0;
            let sumLon = 0;
            coordinates.forEach(coord => {
                sumLon += coord[0];
                sumLat += coord[1];
            });
            const centroidLat = sumLat / coordinates.length;
            const centroidLon = sumLon / coordinates.length;

            // Position the sprite slightly above the globe surface
            const spritePosition = latLonToCartesian(centroidLat, centroidLon, radius + 0.02); // 0.02 units above globe

            // Apply the initial globe rotation to the sprite position
            const rotatedSpritePosition = spritePosition.clone().applyEuler(initialGlobeRotationEuler);

            const sprite = createTextSprite(countryName, rotatedSpritePosition);
            sprite.visible = false; // Initially hidden
            sprites.push(sprite);
        });
    } catch (error) {
        console.error("Error loading country name sprites:", error);
    }
    return sprites;
};

const Globe3DComponent = ({ onGlobeReady, onZoomInThreshold, onZoomOutThreshold, onGlobeClick, initialTargetLatLon }) => {
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
    const countryNameSpritesRef = useRef([]); // Ref to store country name sprites

    const [isZoomedInEnough, setIsZoomedInEnough] = useState(false);
    const [showCountryNames, setShowCountryNames] = useState(false); // New state for country names visibility


    // Callback to check if camera is zoomed in enough or out enough
    const checkZoomThreshold = useCallback(() => {
        if (cameraRef.current && earthMeshRef.current) {
            const distance = cameraRef.current.position.distanceTo(earthMeshRef.current.position);
            // Threshold is 1.2 times the globe radius. Adjust as needed.
            const threshold = earthMeshRef.current.geometry.parameters.radius * 1.2;
            // Define a threshold for zooming out to switch back to the globe
            const zoomOutGlobeThreshold = earthMeshRef.current.geometry.parameters.radius * 3.0; // E.g., 3 times the radius

            if (distance < threshold && !isZoomedInEnough) {
                // Zoomed in beyond threshold
                setIsZoomedInEnough(true);
                onZoomInThreshold && onZoomInThreshold(); // Callback to parent to switch to Leaflet
            } else if (distance >= zoomOutGlobeThreshold && isZoomedInEnough) { // Check for zoom out threshold
                // Zoomed out beyond threshold (back to globe view)
                setIsZoomedInEnough(false);
                onZoomOutThreshold && onZoomOutThreshold(); // Callback to parent to switch back to Globe
            }
        }
    }, [isZoomedInEnough, onZoomInThreshold, onZoomOutThreshold]);

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

    // Handle double click to zoom in and pass clicked coordinates
    const handleDoubleClick = useCallback((event) => {
        if (controlsRef.current) {
            controlsRef.current.dollyOut(1.2); // Adjust zoom factor as needed
            controlsRef.current.update();
            checkZoomThreshold(); // Re-check zoom threshold after manual zoom
        }
        const currentMount = mountRef.current;
        if (!currentMount || !cameraRef.current || !earthMeshRef.current || !onGlobeClick || !controlsRef.current) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(earthMeshRef.current);

        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const radius = earthMeshRef.current.geometry.parameters.radius;

            // To get the correct lat/lon, we need to apply the inverse of the globe's
            // initial rotation to the intersection point, as our latLonToCartesian
            // assumes an unrotated globe.
            const inverseRotationQuaternion = new THREE.Quaternion().setFromEuler(initialGlobeRotationEuler).invert();
            const unrotatedPoint = intersectionPoint.clone().applyQuaternion(inverseRotationQuaternion);

            const { lat, lon } = cartesianToLatLon(unrotatedPoint, radius);

            // Pass the clicked lat/lon to the parent component
            onGlobeClick({ lat, lon });

            // Dolly in towards the intersection point
            controlsRef.current.target.copy(intersectionPoint);
            controlsRef.current.dollyIn(1.5); // Stronger zoom for double click
            controlsRef.current.update();
            checkZoomThreshold(); // Re-check zoom threshold after double click zoom
        }
    }, [onGlobeClick, checkZoomThreshold]);

    // Handle single click on the globe to get Lat/Lon (kept separate for clarity if different behavior is desired)
    const handleClick = useCallback((event) => {
        const currentMount = mountRef.current;
        if (!currentMount || !cameraRef.current || !earthMeshRef.current || !onGlobeClick) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(earthMeshRef.current);

        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const radius = earthMeshRef.current.geometry.parameters.radius;

            const inverseRotationQuaternion = new THREE.Quaternion().setFromEuler(initialGlobeRotationEuler).invert();
            const unrotatedPoint = intersectionPoint.clone().applyQuaternion(inverseRotationQuaternion);

            const { lat, lon } = cartesianToLatLon(unrotatedPoint, radius);
            onGlobeClick({ lat, lon });
        }
    }, [onGlobeClick]);


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

            // Apply the initial rotation to center Africa and add a slight tilt
            earthMesh.rotation.copy(initialGlobeRotationEuler);

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

                loadCountryNameSprites(1.001) // Same radius as outlines
                .then(sprites => {
                    countryNameSpritesRef.current = sprites;
                    sprites.forEach(sprite => scene.add(sprite));
                })
                .catch(error => {
                    console.error("Failed to load country name sprites:", error);
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

            // If an initial target is provided, set the camera and controls to focus on it
            if (initialTargetLatLon) {
                const radius = earthMesh.geometry.parameters.radius;
                // Convert target lat/lon to Cartesian on an unrotated globe
                const alignedPoint = latLonToCartesian(initialTargetLatLon.lat, initialTargetLatLon.lon, radius);
                // Apply the globe's initial rotation to get the target point in world coordinates
                const targetWorldPoint = alignedPoint.clone().applyEuler(initialGlobeRotationEuler);

                controls.target.copy(targetWorldPoint);

                // Position camera slightly away from the target, looking at it
                // We want the camera to be a certain distance from the target, along the line from origin to target
                const cameraDistance = 2.0; // A good default distance for the camera to be from the center
                const cameraPosition = targetWorldPoint.clone().normalize().multiplyScalar(cameraDistance);
                camera.position.copy(cameraPosition);

                controls.update(); // Update controls to apply the new target and camera position
            }

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
    }, [checkZoomThreshold, onGlobeReady, handleResize, initialTargetLatLon]); // Added initialTargetLatLon to dependencies

    // Effect to toggle visibility of country name sprites
    useEffect(() => {
        countryNameSpritesRef.current.forEach(sprite => {
            sprite.visible = showCountryNames;
        });
    }, [showCountryNames]);
    // Function to reset the globe view to its initial state
    const resetGlobeView = useCallback(() => {
        if (controlsRef.current && earthMeshRef.current && cameraRef.current) {
            // Reset globe mesh rotation to its initial state
            earthMeshRef.current.rotation.copy(initialGlobeRotationEuler);
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
            className="relative w-full h-full flex justify-center items-center cursor-pointer" // Use flex for centering
            style={{
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 60%, black 100%)',
                overflow: 'hidden',
            }}
            onDoubleClick={handleDoubleClick} // Add double click listener
            onClick={handleClick} // Add single click listener for globe interaction
        >
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4  flex flex-col space-y-0 z-10">
                <button
                    onClick={zoomOut}
                    className="p-2 bg-gray-600 text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button
                    onClick={zoomIn}
                    className="p-2 bg-gray-600 text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                </button>
            </div>
            {/* Reset View Button */}
            <div className="absolute bottom-4 left-4 z-10">
                <button
                    onClick={resetGlobeView}
                    className="px-2 py-1 bg-gray-600 text-white  shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    Reset View
                </button>
            </div>
             {/* Show Country Names Button */}
             <div className="absolute bottom-4 right-4 z-10"> {/* Positioned at bottom right */}
                <button
                    onClick={() => setShowCountryNames(prev => !prev)}
                    className="px-2 py-1 bg-gray-600 text-white  shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    {showCountryNames ? 'Hide Names' : 'Show Names'}
                </button>
            </div>
        </div>
    );
};

export default Globe3DComponent;
