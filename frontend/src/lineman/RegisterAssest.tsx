import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import axios from "axios";

// Fix for Leaflet's default icon issue with Webpack/Vite
// @ts-ignore: _getIconUrl is not typed in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RegisterAsset: React.FC = () => {
  const [assetType, setAssetType] = useState<string>("");
  const [assetDetails, setAssetDetails] = useState<string>("");
  const [pictures, setPictures] = useState<string>("");
  const [drawnItems, setDrawnItems] = useState<any>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting current location: ", error);
          setCurrentLocation([20.5937, 78.9629]); // fallback: Central India
        }
      );
    } else {
      console.log("Geolocation not supported");
      setCurrentLocation([20.5937, 78.9629]); // fallback
    }
  }, []);

  // Map Events Handler
  function MapEvents() {
    useMapEvents({
      locationfound: (e) => {
        setCurrentLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  const onCreated = (e: any) => {
    const { layerType, layer } = e;
    console.log(`Drawn ${layerType}:`, layer.toGeoJSON());
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(layer);
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const onEdited = () => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const onDeleted = () => {
    if (featureGroupRef.current) {
      setDrawnItems(featureGroupRef.current.toGeoJSON());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawnItems || drawnItems.features.length === 0) {
      alert("Please draw an asset on the map before submitting.");
      return;
    }

    const geometryType = drawnItems.features[0].geometry.type;
    let endpoint = "";
    let assetData: any = {
      type: assetType,
      category: assetType || "General",
      kpin: "N/A",
      frequency: 0,
      status: "Pending",
      Images: pictures,
      Details: assetDetails,
    };

    if (geometryType === "Point") {
      const [longitude, latitude] =
        drawnItems.features[0].geometry.coordinates;
      assetData = { ...assetData, longitude, latitude };
      endpoint = "/api/assets/point";
    } else if (geometryType === "LineString") {
      const coordinates = drawnItems.features[0].geometry.coordinates;
      assetData = { ...assetData, coordinates };
      endpoint = "/api/assets/linestring";
    } else {
      alert("Unsupported geometry type. Draw a Point or LineString.");
      return;
    }

    console.log("Submitting asset data:", assetData);

    try {
      const response = await axios.post(
        `http://localhost:4000${endpoint}`,
        assetData
      );
      console.log("API Response:", response.data);
      alert("Asset submitted successfully!");
      setAssetType("");
      setAssetDetails("");
      setPictures("");
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
        setDrawnItems(null);
      }
    } catch (error) {
      console.error("Error submitting asset:", error);
      alert("Failed to submit asset. Check console.");
    }
  };

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading map and current location...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#0a3d91]">
        Register New Asset
      </h1>

      <div className="flex-grow flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div className="h-1/2 sm:h-[50vh] md:h-[50vh] lg:h-full lg:w-3/5 flex-grow rounded-lg shadow-md overflow-hidden">
          <MapContainer
            center={currentLocation}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
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
                  marker: true,
                  polyline: true,
                  polygon: {
                    allowIntersection: false,
                    drawError: {
                      color: "#e1edce",
                      message: "<strong>Oh snap!</strong>: Change something...",
                    },
                    shapeOptions: {
                      color: "#bada55",
                    },
                  },
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>

        {/* Form */}
        <div className="h-1/2 sm:h-[50vh] md:h-[50vh] lg:h-full lg:w-2/5 p-6 bg-white rounded-lg shadow-md flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-[#0a3d91]">
            Asset Details
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex-grow flex flex-col"
          >
            <div>
              <label
                htmlFor="assetType"
                className="block text-sm font-medium text-gray-700"
              >
                Asset Type
              </label>
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
              <label
                htmlFor="pictures"
                className="block text-sm font-medium text-gray-700"
              >
                Pictures (URL/Text)
              </label>
              <input
                type="text"
                id="pictures"
                value={pictures}
                onChange={(e) => setPictures(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div className="flex-grow">
              <label
                htmlFor="assetDetails"
                className="block text-sm font-medium text-gray-700"
              >
                Details
              </label>
              <textarea
                id="assetDetails"
                value={assetDetails}
                onChange={(e) => setAssetDetails(e.target.value)}
                rows={4}
                className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm p-2 flex-grow"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-400 text-white p-3 rounded-md font-semibold hover:bg-orange-500 transition-colors"
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
