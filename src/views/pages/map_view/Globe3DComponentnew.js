import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry';
import { LineSegments2 } from 'three/addons/lines/LineSegments2';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import earthTextureDayPath from 'assets/textures/earth_daymap.jpg';
import earthTextureNightPath from 'assets/textures/earth_nightmap.jpg';
import countriesData from 'assets/textures/countries.geo.json';
import axios from 'axios';

// Initial rotation configuration
const initialGlobeRotationEuler = new THREE.Euler(
    THREE.MathUtils.degToRad(-10),
    THREE.MathUtils.degToRad(-(90 + 15)),
    0,
    'XYZ'
);

// Helper functions
const latLonToCartesian = (lat, lon, radius) => {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(-lon);

    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
};

const cartesianToLatLon = (vector, radius) => {
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(vector.y / radius));
    const lon = -THREE.MathUtils.radToDeg(Math.atan2(vector.z, vector.x));
    return { lat, lon };
};

const loadCountryOutlines = async (radius) => {
    try {
        const points = [];
        const initialResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

        const material = new LineMaterial({
            color: 0xffffff,
            linewidth: 1.5,
            resolution: initialResolution,
            dashed: false,
            alphaToCoverage: false,
            transparent: true,
            depthWrite: false,
            depthTest: true,
        });

        countriesData.features.forEach(feature => {
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
        lines.computeLineDistances();

        return { lines, material };

    } catch (error) {
        console.error("Error loading country outlines:", error);
        return { lines: null, material: null };
    }
};

const createTextSprite = (text, position, scaleFactor = 0.01) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 50;
    const padding = 6;

    context.font = `${fontSize}px Arial`;
    const textMetrics = context.measureText(text);
    canvas.width = textMetrics.width + padding * 2;
    canvas.height = fontSize + padding * 2;

    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / fontSize * scaleFactor, canvas.height / fontSize * scaleFactor, 1);
    sprite.position.copy(position);

    return sprite;
};

const loadCountryNameSprites = async (radius) => {
    const sprites = [];
    try {
        countriesData.features.forEach(feature => {
            const countryName = feature.properties.name;
            if (!countryName) return;

            let coordinates = [];
            if (feature.geometry.type === 'Polygon') {
                coordinates = feature.geometry.coordinates[0];
            } else if (feature.geometry.type === 'MultiPolygon') {
                if (feature.geometry.coordinates.length > 0 && feature.geometry.coordinates[0].length > 0) {
                    coordinates = feature.geometry.coordinates[0][0];
                }
            }

            if (coordinates.length === 0) return;

            let sumLat = 0;
            let sumLon = 0;
            coordinates.forEach(coord => {
                sumLon += coord[0];
                sumLat += coord[1];
            });
            const centroidLat = sumLat / coordinates.length;
            const centroidLon = sumLon / coordinates.length;

            const spritePosition = latLonToCartesian(centroidLat, centroidLon, radius + 0.02);
            const rotatedSpritePosition = spritePosition.clone().applyEuler(initialGlobeRotationEuler);

            const sprite = createTextSprite(countryName, rotatedSpritePosition);
            sprite.visible = false;
            sprites.push(sprite);
        });
    } catch (error) {
        console.error("Error loading country name sprites:", error);
    }
    return sprites;
};

const getCountryFromCoordinates = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        return response.data.address?.country;
    } catch (error) {
        console.error("Error getting country from coordinates:", error);
        return null;
    }
};

const Globe3DComponent = ({
    onGlobeReady,
    onZoomInThreshold,
    onZoomOutThreshold,
    onGlobeClick,
    initialTargetLatLon,
    userLocation
}) => {
    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const earthMeshRef = useRef(null);
    const outlineLinesRef = useRef(null);
    const lineMaterialRef = useRef(null);
    const dayTextureRef = useRef(null);
    const nightTextureRef = useRef(null);
    const countryNameSpritesRef = useRef([]);

    const [isZoomedInEnough, setIsZoomedInEnough] = useState(false);
    const [showCountryNames, setShowCountryNames] = useState(false);
    const [isCentering, setIsCentering] = useState(false);

    const checkZoomThreshold = useCallback(() => {
        if (cameraRef.current && earthMeshRef.current) {
            const distance = cameraRef.current.position.distanceTo(earthMeshRef.current.position);
            const threshold = earthMeshRef.current.geometry.parameters.radius * 1.2;
            const zoomOutGlobeThreshold = earthMeshRef.current.geometry.parameters.radius * 3.0;

            if (distance < threshold && !isZoomedInEnough) {
                setIsZoomedInEnough(true);
                onZoomInThreshold && onZoomInThreshold();
            } else if (distance >= zoomOutGlobeThreshold && isZoomedInEnough) {
                setIsZoomedInEnough(false);
                onZoomOutThreshold && onZoomOutThreshold();
            }
        }
    }, [isZoomedInEnough, onZoomInThreshold, onZoomOutThreshold]);

    const handleResize = useCallback(() => {
        const currentMount = mountRef.current;
        if (currentMount && cameraRef.current && rendererRef.current && lineMaterialRef.current) {
            cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            lineMaterialRef.current.resolution.set(currentMount.clientWidth, currentMount.clientHeight);
        }
    }, []);

    const zoomIn = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.dollyIn(1.2);
            controlsRef.current.update();
            checkZoomThreshold();
        }
    }, [checkZoomThreshold]);

    const zoomOut = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.dollyOut(1.2);
            controlsRef.current.update();
            checkZoomThreshold();
        }
    }, [checkZoomThreshold]);

    const handleDoubleClick = useCallback((event) => {
        if (controlsRef.current) {
            controlsRef.current.dollyOut(1.2);
            controlsRef.current.update();
            checkZoomThreshold();
        }
        const currentMount = mountRef.current;
        if (!currentMount || !cameraRef.current || !earthMeshRef.current || !onGlobeClick || !controlsRef.current) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObject(earthMeshRef.current);

        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const radius = earthMeshRef.current.geometry.parameters.radius;
            const inverseRotationQuaternion = new THREE.Quaternion().setFromEuler(initialGlobeRotationEuler).invert();
            const unrotatedPoint = intersectionPoint.clone().applyQuaternion(inverseRotationQuaternion);
            const { lat, lon } = cartesianToLatLon(unrotatedPoint, radius);

            onGlobeClick({ lat, lon });
            controlsRef.current.target.copy(intersectionPoint);
            controlsRef.current.dollyIn(1.5);
            controlsRef.current.update();
            checkZoomThreshold();
        }
    }, [onGlobeClick, checkZoomThreshold]);

    const handleClick = useCallback((event) => {
        const currentMount = mountRef.current;
        if (!currentMount || !cameraRef.current || !earthMeshRef.current || !onGlobeClick) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (event.clientX / currentMount.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / currentMount.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, cameraRef.current);
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

    const resetGlobeView = useCallback(() => {
        if (controlsRef.current && earthMeshRef.current && cameraRef.current) {
            earthMeshRef.current.rotation.copy(initialGlobeRotationEuler);
            if (outlineLinesRef.current) {
                outlineLinesRef.current.rotation.copy(earthMeshRef.current.rotation);
            }
            cameraRef.current.position.set(0, 0, 2.0);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
            setIsZoomedInEnough(false);
        }
    }, []);

    const centerOnMyLocation = useCallback(async () => {
        alert('is clc')
        if (!userLocation?.latitude || !earthMeshRef.current || !controlsRef.current) return;

        setIsCentering(true);
        try {
            const country = await getCountryFromCoordinates(userLocation.latitude, userLocation.longitude);
            if (!country) {
                const radius = earthMeshRef.current.geometry.parameters.radius;
                const alignedPoint = latLonToCartesian(userLocation.latitude, userLocation.longitude, radius);
                const targetWorldPoint = alignedPoint.clone().applyEuler(initialGlobeRotationEuler);

                controlsRef.current.target.copy(targetWorldPoint);
                cameraRef.current.position.copy(targetWorldPoint.clone().multiplyScalar(1.5));
                controlsRef.current.update();
                return;
            }

            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&polygon_geojson=1`
            );

            if (response.data && response.data.length > 0) {
                const bbox = response.data[0].boundingbox.map(Number);
                const centerLat = (bbox[0] + bbox[1]) / 2;
                const centerLon = (bbox[2] + bbox[3]) / 2;

                const radius = earthMeshRef.current.geometry.parameters.radius;
                const alignedPoint = latLonToCartesian(centerLat, centerLon, radius);
                const targetWorldPoint = alignedPoint.clone().applyEuler(initialGlobeRotationEuler);

                controlsRef.current.target.copy(targetWorldPoint);
                cameraRef.current.position.copy(targetWorldPoint.clone().multiplyScalar(1.5));
                controlsRef.current.update();
            }
        } catch (error) {
            console.error("Error centering on location:", error);
        } finally {
            setIsCentering(false);
        }
    }, [userLocation, initialGlobeRotationEuler]);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        let scene, camera, renderer, controls, earthMesh;
        let animationFrameId;

        try {
            // Scene Setup
            scene = new THREE.Scene();
            sceneRef.current = scene;
            camera = new THREE.PerspectiveCamera(
                75,
                currentMount.clientWidth / currentMount.clientHeight,
                0.1,
                1000
            );
            cameraRef.current = camera;
            camera.position.set(0, 0, 1.7);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            rendererRef.current = renderer;
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            currentMount.appendChild(renderer.domElement);

            // Earth Globe
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const textureLoader = new THREE.TextureLoader();

            const loadedDayTexture = textureLoader.load(earthTextureDayPath,
                () => {},
                undefined,
                (err) => { console.error('Error loading day texture:', err); }
            );
            dayTextureRef.current = loadedDayTexture;

            const loadedNightTexture = textureLoader.load(earthTextureNightPath,
                () => {},
                undefined,
                (err) => { console.error('Error loading night texture:', err); }
            );
            nightTextureRef.current = loadedNightTexture;

            const material = new THREE.MeshPhongMaterial({ map: loadedDayTexture });
            earthMesh = new THREE.Mesh(geometry, material);
            scene.add(earthMesh);
            earthMeshRef.current = earthMesh;
            earthMesh.rotation.copy(initialGlobeRotationEuler);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 2);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 3, 5);
            scene.add(directionalLight);

            // Country Outlines
            loadCountryOutlines(1.001)
                .then(({ lines, material: lineMat }) => {
                    if (lines) {
                        scene.add(lines);
                        outlineLinesRef.current = lines;
                        lineMaterialRef.current = lineMat;
                        lineMat.resolution.set(currentMount.clientWidth, currentMount.clientHeight);
                        lines.rotation.copy(earthMesh.rotation);
                    }
                })
                .catch(error => {
                    console.error("Failed to add country outlines to scene:", error);
                });

            loadCountryNameSprites(1.001)
                .then(sprites => {
                    countryNameSpritesRef.current = sprites;
                    sprites.forEach(sprite => scene.add(sprite));
                })
                .catch(error => {
                    console.error("Failed to load country name sprites:", error);
                });

            // Orbit Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controlsRef.current = controls;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 1.1;
            controls.maxDistance = 5;
            controls.zoomSpeed = 0.5;
            controls.addEventListener('change', checkZoomThreshold);

            if (initialTargetLatLon) {
                const radius = earthMesh.geometry.parameters.radius;
                const alignedPoint = latLonToCartesian(initialTargetLatLon.lat, initialTargetLatLon.lon, radius);
                const targetWorldPoint = alignedPoint.clone().applyEuler(initialGlobeRotationEuler);

                controls.target.copy(targetWorldPoint);
                const cameraPosition = targetWorldPoint.clone().normalize().multiplyScalar(2.0);
                camera.position.copy(cameraPosition);
                controls.update();
            }

            // Animation Loop
            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            window.addEventListener('resize', handleResize);
            onGlobeReady && onGlobeReady();

        } catch (error) {
            console.error("Three.js initialization failed:", error);
            throw error;
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (controls) controls.removeEventListener('change', checkZoomThreshold);
            if (controls) controls.dispose();
            if (renderer) renderer.dispose();
            if (currentMount && renderer && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            window.removeEventListener('resize', handleResize);

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
    }, [checkZoomThreshold, onGlobeReady, handleResize, initialTargetLatLon]);

    useEffect(() => {
        countryNameSpritesRef.current.forEach(sprite => {
            sprite.visible = showCountryNames;
        });
    }, [showCountryNames]);

    return (
        <div
            ref={mountRef}
            className="relative w-full h-full flex justify-center items-center cursor-pointer"
            style={{
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 60%, black 100%)',
                overflow: 'hidden',
            }}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
        >
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex flex-col space-y-0 z-10">
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

            {/* Center on My Location Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={centerOnMyLocation}
                    disabled={!userLocation || isCentering}
                    className="px-3 py-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 flex items-center"
                >
                    {isCentering ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Centering...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            My Location
                        </span>
                    )}
                </button>
            </div>

            {/* Reset View Button */}
            <div className="absolute bottom-4 left-4 z-10">
                <button
                    onClick={resetGlobeView}
                    className="px-2 py-1 bg-gray-600 text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    Reset View
                </button>
            </div>

            {/* Show Country Names Button */}
            <div className="absolute bottom-4 right-4 z-10">
                <button
                    onClick={() => setShowCountryNames(prev => !prev)}
                    className="px-2 py-1 bg-gray-600 text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200"
                >
                    {showCountryNames ? 'Hide Names' : 'Show Names'}
                </button>
            </div>
        </div>
    );
};

export default Globe3DComponent;