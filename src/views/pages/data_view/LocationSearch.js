import { useState } from "react";

function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;

    setIsLoading(true);

    try {
      // Fetch location data from OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0]; // Get the first result
        onLocationSelect(parseFloat(lat), parseFloat(lon)); // Pass coordinates to parent
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      alert("An error occurred while fetching location data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a place..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}

export default LocationSearch;