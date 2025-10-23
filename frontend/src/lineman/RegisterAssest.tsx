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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]); // Keep this for now to easily remove the JSX later
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assetIdToDelete, setAssetIdToDelete] = useState<any>("")
  const [drawnItems, setDrawnItems] = useState<any>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [AssestType, SetAssestType] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);


  const dropdown: { [key: string]: string[] } = {
    "Water": ["Pipes", "Water Tanks", "Valves"],
    "Electricity": ["Poles", "Transformers", "Wires"],
    "Municipal": ["Street Lights", "Garbage Bins", "Benches"],
  }
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

    const category = localStorage.getItem("category");
    if (category && dropdown[category]) {
      setAssetType(dropdown[category][0]);
      SetAssestType(dropdown[category]);
    }
  }, []);


  const handleDelete = async ()=>{
    try {
      const response = await axios.post(
        `http://localhost:4000/api/assets/delete`,{
          assetId:assetIdToDelete
        },
        {
         withCredentials:true
        }
      );
      console.log("API Response:", response.data);
      alert("Asset submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting asset:", error);
      alert("Failed to submit asset. Check console.");
    }
  }
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get only the first file
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setSelectedImages([file]); // Only one image
    setImagePreview([URL.createObjectURL(file)]); // Only one preview
  };

  const removeImage = () => {
    setSelectedImages([]);
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawnItems || drawnItems.features.length === 0) {
      alert("Please draw an asset on the map before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("type", assetType);
    formData.append("category", assetType || "General");
    formData.append("kpin", "N/A");
    formData.append("frequency", "0");
    formData.append("status", "Pending");
    formData.append("Details", assetDetails);

    selectedImages.forEach((image) => {
      formData.append("Images", image);
    });

    const geometryType = drawnItems.features[0].geometry.type;
    let endpoint = "";

    if (geometryType === "Point") {
      const [longitude, latitude] =
        drawnItems.features[0].geometry.coordinates;
      formData.append("longitude", longitude.toString());
      formData.append("latitude", latitude.toString());
      endpoint = "/api/assets/point";
    } else if (geometryType === "LineString") {
      const coordinates = drawnItems.features[0].geometry.coordinates;
      formData.append("coordinates", JSON.stringify(coordinates));
      endpoint = "/api/assets/linestring";
    } else {
      alert("Unsupported geometry type. Draw a Point or LineString.");
      return;
    }

    console.log("Submitting asset data:", formData);

    try {
      const response = await axios.post(
        `http://localhost:4000${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },withCredentials:true
        }
      );
      console.log("API Response:", response.data);
      alert("Asset submitted successfully!");
      setAssetType("");
      setAssetDetails("");
      setSelectedImages([]);
      setImagePreview([]);
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
    <div className="flex flex-col min-h-screen p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#0a3d91] dark:text-gray-100">
        Register New Asset
      </h1>


       <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter Asset ID to delete"
          value={assetIdToDelete}
          onChange={(e) => setAssetIdToDelete(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Delete
        </button>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="h-[50vh] lg:h-auto rounded-lg shadow-xl overflow-hidden">
          <MapContainer
            center={currentLocation}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full rounded-lg"
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

        {/* Form Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-[#0a3d91] dark:text-gray-100">
            Asset Details
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex-grow flex flex-col"
          >
            <div>
              <label
                htmlFor="assetType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Asset Type
              </label>
              <select
                id="assetType"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="">Select Asset Type</option>
                {AssestType.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="pictures"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
              >
                Asset Photo (Max 1)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="asset-photo-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#0a3d91] text-white rounded-md hover:bg-[#082a6b] transition-colors duration-200 shadow-md"
                >
                  Choose File
                </button>
                {selectedImages.length > 0 && (
                  <span className="text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                    {selectedImages[0].name}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <label
                htmlFor="assetDetails"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Details
              </label>
              <textarea
                id="assetDetails"
                value={assetDetails}
                onChange={(e) => setAssetDetails(e.target.value)}
                rows={4}
                className="mt-1 block w-full border text-black dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm p-2 flex-grow focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0a3d91] text-white p-3 rounded-md font-semibold hover:bg-[#082a6b] transition-colors duration-200 shadow-md mt-auto"
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
