import { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapPin, Search, Crosshair, X } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Default center: Kathmandu, Nepal
const DEFAULT_CENTER = {
  longitude: 85.324,
  latitude: 27.7172,
};

const DEFAULT_ZOOM = 13;

// Get Mapbox token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapPicker = ({
  value = {},
  onChange,
  className = '',
}) => {
  const mapRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);

  const [viewState, setViewState] = useState({
    longitude: value?.longitude || DEFAULT_CENTER.longitude,
    latitude: value?.latitude || DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  });

  const [marker, setMarker] = useState(
    value?.longitude && value?.latitude
      ? { longitude: value.longitude, latitude: value.latitude }
      : null
  );

  const [placeName, setPlaceName] = useState(value?.placeName || '');
  const [formattedAddress, setFormattedAddress] = useState(value?.formattedAddress || '');
  const [isDragging, setIsDragging] = useState(false);

  // Initialize geocoder
  useEffect(() => {
    if (!MAPBOX_TOKEN || !geocoderContainerRef.current || geocoderRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: null, // We'll handle map integration manually
      placeholder: 'Search for a place...',
      countries: 'np', // Restrict to Nepal
      proximity: {
        longitude: DEFAULT_CENTER.longitude,
        latitude: DEFAULT_CENTER.latitude,
      },
      marker: false,
    });

    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;

    geocoder.on('result', (e) => {
      const { center, place_name, text } = e.result;
      const [lng, lat] = center;

      setMarker({ longitude: lng, latitude: lat });
      setViewState((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15,
      }));
      setPlaceName(text || '');
      setFormattedAddress(place_name || '');

      onChange?.({
        longitude: lng,
        latitude: lat,
        placeName: text || '',
        formattedAddress: place_name || '',
      });
    });

    geocoder.on('clear', () => {
      clearMarker();
    });

    return () => {
      if (geocoderRef.current) {
        geocoderRef.current.onRemove();
        geocoderRef.current = null;
      }
    };
  }, [onChange]);

  // Update marker when value changes externally
  useEffect(() => {
    if (value?.longitude && value?.latitude) {
      setMarker({ longitude: value.longitude, latitude: value.latitude });
      setPlaceName(value.placeName || '');
      setFormattedAddress(value.formattedAddress || '');
    }
  }, [value?.longitude, value?.latitude, value?.placeName, value?.formattedAddress]);

  // Handle map click to place marker
  const handleMapClick = useCallback(
    (event) => {
      if (isDragging) return;

      const { lngLat } = event;
      const lng = lngLat.lng;
      const lat = lngLat.lat;

      setMarker({ longitude: lng, latitude: lat });

      // Reverse geocode to get place name
      if (MAPBOX_TOKEN) {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=np`
        )
          .then((res) => res.json())
          .then((data) => {
            const feature = data.features?.[0];
            const name = feature?.text || '';
            const address = feature?.place_name || '';

            setPlaceName(name);
            setFormattedAddress(address);

            onChange?.({
              longitude: lng,
              latitude: lat,
              placeName: name,
              formattedAddress: address,
            });
          })
          .catch(() => {
            onChange?.({
              longitude: lng,
              latitude: lat,
              placeName: '',
              formattedAddress: '',
            });
          });
      } else {
        onChange?.({
          longitude: lng,
          latitude: lat,
          placeName: '',
          formattedAddress: '',
        });
      }
    },
    [onChange, isDragging]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback((event) => {
    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (event) => {
      const lng = event.lngLat.lng;
      const lat = event.lngLat.lat;
      setIsDragging(false);

      // Reverse geocode to get place name
      if (MAPBOX_TOKEN) {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=np`
        )
          .then((res) => res.json())
          .then((data) => {
            const feature = data.features?.[0];
            const name = feature?.text || '';
            const address = feature?.place_name || '';

            setPlaceName(name);
            setFormattedAddress(address);

            onChange?.({
              longitude: lng,
              latitude: lat,
              placeName: name,
              formattedAddress: address,
            });
          })
          .catch(() => {
            onChange?.({
              longitude: lng,
              latitude: lat,
              placeName: '',
              formattedAddress: '',
            });
          });
      } else {
        onChange?.({
          longitude: lng,
          latitude: lat,
          placeName: '',
          formattedAddress: '',
        });
      }
    },
    [onChange]
  );

  // Clear marker
  const clearMarker = useCallback(() => {
    setMarker(null);
    setPlaceName('');
    setFormattedAddress('');
    onChange?.(null);
  }, [onChange]);

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        setMarker({ longitude: lng, latitude: lat });
        setViewState((prev) => ({
          ...prev,
          longitude: lng,
          latitude: lat,
          zoom: 15,
        }));

        // Reverse geocode
        if (MAPBOX_TOKEN) {
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=np`
          )
            .then((res) => res.json())
            .then((data) => {
              const feature = data.features?.[0];
              const name = feature?.text || '';
              const address = feature?.place_name || '';

              setPlaceName(name);
              setFormattedAddress(address);

              onChange?.({
                longitude: lng,
                latitude: lat,
                placeName: name,
                formattedAddress: address,
              });
            })
            .catch(() => {
              onChange?.({
                longitude: lng,
                latitude: lat,
                placeName: '',
                formattedAddress: '',
              });
            });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
      },
      { enableHighAccuracy: true }
    );
  }, [onChange]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <p className="text-yellow-700 text-sm">
          Mapbox token is not configured. Please add VITE_MAPBOX_TOKEN to your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Box */}
      <div className="flex gap-2">
        <div ref={geocoderContainerRef} className="flex-1 mapbox-geocoder-container" />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          title="Use my current location"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          style={{ width: '100%', height: '300px' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />

          {marker && (
            <Marker
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="bottom"
              draggable
              onDragStart={() => setIsDragging(true)}
              onDrag={handleMarkerDrag}
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="cursor-move relative">
                {/* Pulse ring at bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500/50 rounded-full animate-ping" />
                {/* Pin */}
                <svg width="24" height="32" viewBox="0 0 30 40" className="drop-shadow-md">
                  <path
                    d="M15 0C6.716 0 0 6.716 0 15c0 10 15 25 15 25s15-15 15-25C30 6.716 23.284 0 15 0z"
                    fill="#16a34a"
                  />
                  <circle cx="15" cy="14" r="5" fill="white" />
                </svg>
              </div>
            </Marker>
          )}
        </Map>

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600">
          Click on map to place marker, drag to adjust
        </div>
      </div>

      {/* Selected Location Info */}
      {marker && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {formattedAddress && (
                <p className="text-sm text-gray-700 truncate">{formattedAddress}</p>
              )}
              <p className="text-xs text-gray-500">
                Coordinates: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearMarker}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Clear location"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Styling for geocoder */}
      <style>{`
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder {
          width: 100%;
          max-width: none;
          box-shadow: none;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-family: inherit;
        }
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--input {
          height: 42px;
          padding: 8px 40px;
          font-size: 14px;
        }
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--icon-search {
          top: 12px;
          left: 12px;
        }
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--button {
          top: 8px;
          right: 8px;
        }
        .mapbox-geocoder-container .mapboxgl-ctrl-geocoder--suggestion {
          padding: 10px 15px;
        }
      `}</style>
    </div>
  );
};

export default MapPicker;
