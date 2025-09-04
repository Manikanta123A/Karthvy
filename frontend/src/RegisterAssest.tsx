import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import axios from 'axios'; // For dummy POST request

// Fix for Leaflet's default icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RegisterAsset: React.FC = () => {
  const [assetType, setAssetType] = useState<string>('');
  const [assetDetails, setAssetDetails] = useState<string>('');
  const [pictures, setPictures] = useState<string>(''); // For now, a dummy URL or text
  const [drawnItems, setDrawnItems] = useState<any>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting current location: ", error);
          // Default to a central location if geolocation fails
          setCurrentLocation([20.5937, 78.9629]); // Central India as a fallback
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Default to a central location if geolocation is not supported
      setCurrentLocation([20.5937, 78.9629]); // Central India as a fallback
    }
  }, []);

  // Custom component to handle map events
  function MapEvents() {
    useMapEvents({
      locationfound: (e) => {
        setCurrentLocation([e.latlng.lat, e.latlng.lng]);
      },
      // You can add more map event listeners here if needed
    });
    return null;
  }

  const onCreated = (e: any) => {
    const { layerType, layer } = e;
    console.log(`Drawn ${layerType}:`, layer.toGeoJSON());
    // Store the drawn layer data
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(layer);
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const onEdited = (e: any) => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const onDeleted = (e: any) => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawnItems) {
      alert("Please draw an asset on the map before submitting.");
      return;
    }

    const assetData = {
      type: assetType,
      details: assetDetails,
      pictures: pictures, // Placeholder for actual image upload
      geometry: drawnItems, // GeoJSON data of the drawn asset
      // For now, let's also include the current location as a point if available
      currentLocation: currentLocation ? { type: "Point", coordinates: [currentLocation[1], currentLocation[0]] } : null,
    };

    console.log("Submitting asset data:", assetData);

    // Dummy POST request to a placeholder URL
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', assetData);
      console.log("Dummy API Response:", response.data);
      alert("Asset submitted successfully (dummy request)!");
      // Clear form and map after submission
      setAssetType('');
      setAssetDetails('');
      setPictures('');
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
        setDrawnItems(null);
      }
    } catch (error) {
      console.error("Error submitting dummy asset:", error);
      alert("Failed to submit asset (dummy request). Check console for details.");
    }
  };

  if (!currentLocation) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading map and current location...</div>;
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#0a3d91]">Register New Asset</h1>
      
      {/* Overall Instructions */}
      <p className="text-center text-gray-700 mb-8 max-w-2xl mx-auto">
        Follow these two simple steps to register your asset: <strong>1. Draw on the map</strong> to mark its location, then <strong>2. Fill in the details</strong> in the form.
      </p>

      <div className="flex-grow flex flex-col md:flex-row gap-4">
        {/* Map Container */}
        <div className="flex-grow md:w-3/5 w-full h-80 md:h-full rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold text-center py-2 bg-white text-[#0a3d91] border-b border-gray-200">1. Draw Your Asset on the Map</h2>
          <MapContainer
            center={currentLocation}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            {currentLocation && (
              <Marker position={currentLocation}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={onCreated}
                onEdited={onEdited}
                onDeleted={onDeleted}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  // Enable point and line drawing
                  marker: true,
                  polyline: true,
                  polygon: {
                    allowIntersection: false, // Restricts shapes to simple polygons
                    drawError: {
                      color: '#e1edce',
                      message: '<strong>Oh snap!</strong>: Change something...'
                    },
                    shapeOptions: {
                      color: '#bada55'
                    }
                  }
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>

        {/* Asset Details Form */}
        <div className="md:w-2/5 w-full p-6 bg-white rounded-lg shadow-md flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-[#0a3d91]">2. Fill in Asset Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
            <div>
              <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">Asset Type</label>
              <input
                type="text"
                id="assetType"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="pictures" className="block text-sm font-medium text-gray-700">Pictures (URL/Text)</label>
              <input
                type="text"
                id="pictures"
                value={pictures}
                onChange={(e) => setPictures(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex-grow">
              <label htmlFor="assetDetails" className="block text-sm font-medium text-gray-700">Details</label>
              <textarea
                id="assetDetails"
                value={assetDetails}
                onChange={(e) => setAssetDetails(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 flex-grow resize-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-400 text-white p-3 rounded-md font-semibold hover:bg-orange-500 transition-colors mt-auto"
            >
              Add Asset
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsset;