import { useState } from 'react';
import { Heart, MapPin, Star, Bed, Maximize, Wifi, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';

const RoomCard = ({
  room,
  onFavoriteClick,
  showFavorite = true,
  isFavorite = false,
  variant = 'simple',
}) => {
  const [imageError, setImageError] = useState(false);

  const {
    id,
    _id,
    title,
    location,
    price,
    rating,
    image,
    images,
    imageUrl: propImageUrl,
    featured,
    isFeatured,
    isVerified,
    isNew,
    roomType,
    size,
    beds,
    amenities,
  } = room;

  const roomId = id || _id;

  // Get the first valid image URL from various possible sources
  const getImageUrl = () => {
    // If there was an error loading, use placeholder
    if (imageError) return PLACEHOLDER_IMAGE;

    // Check for direct image property (string)
    if (image && typeof image === 'string') return image;

    // Check for imageUrl property
    if (propImageUrl && typeof propImageUrl === 'string') return propImageUrl;

    // Check for images array from API
    if (images && Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];
      // Handle both { url: '...' } and direct string formats
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage?.url) return firstImage.url;
    }

    // Fallback to placeholder
    return PLACEHOLDER_IMAGE;
  };

  const imageUrl = getImageUrl();

  const handleImageError = () => {
    setImageError(true);
  };

  // Support both static location string and API location object
  const locationText = typeof location === 'string'
    ? location
    : `${location?.area}, ${location?.city}`;

  // Support both static rating number and API rating object
  const ratingValue = typeof rating === 'number'
    ? rating
    : rating?.average || 0;

  const reviewCount = typeof rating === 'object' ? rating?.count || 0 : 0;

  const isFeaturedRoom = featured || isFeatured;
  const hasWifi = amenities?.wifi;

  // Simple variant for landing page
  if (variant === 'simple') {
    return (
      <Link to={`/rooms/${roomId}`} className="block">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Image Container */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-40 object-cover"
              onError={handleImageError}
            />

            {/* Featured Badge */}
            {isFeaturedRoom && (
              <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded">
                Featured
              </span>
            )}

            {/* Favorite Button */}
            {showFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFavoriteClick?.(room);
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                aria-label="Add to favorites"
              >
                <Heart
                  size={16}
                  className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}
                />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
              <MapPin size={14} className="text-gray-400" />
              <span>{locationText}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {title}
            </h3>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <p>
                <span className="text-green-600 font-bold">
                  Rs {typeof price === 'number' ? price.toLocaleString() : price}
                </span>
                <span className="text-gray-500 text-sm">/month</span>
              </p>

              {ratingValue > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {ratingValue.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Detailed variant for listing page
  return (
    <Link to={`/rooms/${roomId}`} className="block">
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Image Container */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover"
          onError={handleImageError}
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex gap-2">
          {/* Featured Badge */}
          {isFeaturedRoom && (
            <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded">
              Featured
            </span>
          )}

          {/* Verified Badge */}
          {isVerified && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
              <Check size={12} />
              Verified
            </span>
          )}

          {/* New Badge */}
          {isNew && (
            <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded">
              New
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteClick?.(room);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label="Add to favorites"
          >
            <Heart
              size={16}
              className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Location and Rating Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} className="text-gray-400" />
            <span className="line-clamp-1">{locationText}</span>
          </div>

          {ratingValue > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{ratingValue.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>

        {/* Room Details Row */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          {roomType && (
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span>{roomType}</span>
            </div>
          )}
          {size && (
            <div className="flex items-center gap-1">
              <Maximize size={14} />
              <span>{size} sqft</span>
            </div>
          )}
          {hasWifi && (
            <div className="flex items-center gap-1">
              <Wifi size={14} />
              <span>WiFi</span>
            </div>
          )}
          {beds && !roomType && (
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span>{beds} Bed{beds > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Price and Button Row */}
        <div className="flex items-center justify-between">
          <p>
            <span className="text-green-600 font-semibold text-sm">
              Rs {typeof price === 'number' ? price.toLocaleString() : price}
            </span>
            <span className="text-gray-500 text-xs">/month</span>
          </p>

          <span
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            View Details
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default RoomCard;
