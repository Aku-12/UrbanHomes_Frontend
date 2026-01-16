import { useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Default center: Kathmandu, Nepal
const DEFAULT_CENTER = {
  longitude: 85.324,
  latitude: 27.7172,
};

const DEFAULT_ZOOM = 15;

// Get Mapbox token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapViewer = ({
  longitude,
  latitude,
  title,
  address,
  showPopup = true,
  showGoogleMapsButton = true,
  height = '300px',
  className = '',
}) => {
  const mapRef = useRef(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Use provided coordinates or default
  const coords = {
    longitude: longitude || DEFAULT_CENTER.longitude,
    latitude: latitude || DEFAULT_CENTER.latitude,
  };

  const [viewState, setViewState] = useState({
    longitude: coords.longitude,
    latitude: coords.latitude,
    zoom: DEFAULT_ZOOM,
  });

  // Open in Google Maps
  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    window.open(url, '_blank');
  };

  // Get directions in Google Maps
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
    window.open(url, '_blank');
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MapPin className="w-12 h-12 mb-2 text-gray-400" />
          <p className="text-sm">Map not available</p>
          {longitude && latitude && (
            <p className="text-xs mt-1">
              Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: '100%', height }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          scrollZoom={false}
        >
          <NavigationControl position="top-right" />

          {/* Location Marker */}
          <Marker
            longitude={coords.longitude}
            latitude={coords.latitude}
            anchor="bottom"
            onClick={() => setPopupOpen(true)}
          >
            <div className="cursor-pointer relative transition-transform hover:scale-105">
              {/* Pulse ring at bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500/50 rounded-full animate-ping" />
              {/* Pin */}
              <svg width="26" height="34" viewBox="0 0 30 40" className="drop-shadow-md">
                <path
                  d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25s15-15 15-25C30 6.716 23.284 0 15 0z"
                  fill="#16a34a"
                />
                <circle cx="15" cy="14" r="5" fill="white" />
              </svg>
            </div>
          </Marker>

          {/* Popup */}
          {showPopup && popupOpen && (
            <Popup
              longitude={coords.longitude}
              latitude={coords.latitude}
              anchor="bottom"
              offset={[0, -30]}
              onClose={() => setPopupOpen(false)}
              closeOnClick={false}
            >
              <div className="p-2 max-w-[200px]">
                {title && (
                  <p className="font-medium text-gray-900 text-sm">{title}</p>
                )}
                {address && (
                  <p className="text-gray-600 text-xs mt-1">{address}</p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Action Buttons */}
      {showGoogleMapsButton && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </button>
          <button
            type="button"
            onClick={handleGetDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </button>
        </div>
      )}
    </div>
  );
};

export default MapViewer;
