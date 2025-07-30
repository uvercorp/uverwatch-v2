import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import "tailwindcss/tailwind.css";

export default function MapView() {
  useEffect(() => {
    // Optional: add any custom logic after mount
  }, []);

  return (
    <div className=" bg-black text-white flex items-center justify-center">
      <div className="relative bg-white rounded-full w-[600px] h-[600px] shadow-2xl overflow-hidden border-4 border-gray-300">
        <header className="absolute top-4 left-4 z-10">
          <h1 className="text-3xl font-bold tracking-widest text-white">MAP VIEW</h1>
        </header>

        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button className="bg-gray-700 text-white px-4 py-2 rounded shadow">Load Presets:</button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded shadow">Reports [271] :</button>
        </div>

        <MapContainer
          center={[20, 10]} // Centered over Africa/Europe
          zoom={2}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          style={{ borderRadius: "9999px", filter: "brightness(0.7) contrast(1.2)" }}
          worldCopyJump={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>

        {/* Zoom Controls */}
        <div className="absolute top-20 left-4 z-10 space-y-1">
          <button className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded text-white">+</button>
          <button className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded text-white">-</button>
        </div>

        {/* Location Dot Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
