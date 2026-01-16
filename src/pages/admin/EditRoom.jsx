import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Image,
  X,
  Plus,
  ArrowLeft,
  Wifi,
  Car,
  Wind,
  Tv,
  UtensilsCrossed,
  Shirt,
  PawPrint,
  Sofa,
  Shield,
  TreeDeciduous,
  Save,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import roomApi from '../../api/roomApi';
import AdminLayout from '../../components/admin/AdminLayout';
import MapPicker from '../../components/ui/MapPicker';

const ROOM_TYPES = ['Studio', 'Private', 'Shared', '1BHK', '2BHK', '3BHK', 'Apartment'];

const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'airConditioning', label: 'Air Conditioning', icon: Wind },
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'laundry', label: 'Laundry', icon: Shirt },
  { key: 'furnished', label: 'Furnished', icon: Sofa },
  { key: 'petFriendly', label: 'Pet Friendly', icon: PawPrint },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { key: 'balcony', label: 'Balcony', icon: TreeDeciduous },
  { key: 'security', label: 'Security', icon: Shield },
];

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roomType: 'Studio',
    price: '',
    size: '',
    beds: 1,
    bathrooms: 1,
    location: {
      city: '',
      area: '',
      address: '',
      coordinates: {
        latitude: null,
        longitude: null,
      },
      geoLocation: {
        type: 'Point',
        coordinates: [],
      },
      placeName: '',
      formattedAddress: '',
    },
    amenities: {
      wifi: false,
      airConditioning: false,
      parking: false,
      laundry: false,
      furnished: false,
      petFriendly: false,
      tv: false,
      kitchen: false,
      balcony: false,
      security: false,
    },
    images: [],
    isFeatured: false,
    status: 'available',
  });

  // Fetch room data on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomApi.getRoomById(id);
        const room = response.data.room;

        if (room) {
          setFormData({
            title: room.title || '',
            description: room.description || '',
            roomType: room.roomType || 'Studio',
            price: room.price || '',
            size: room.size || '',
            beds: room.beds || 1,
            bathrooms: room.bathrooms || 1,
            location: {
              city: room.location?.city || '',
              area: room.location?.area || '',
              address: room.location?.address || '',
              coordinates: {
                latitude: room.location?.coordinates?.latitude || room.location?.geoLocation?.coordinates?.[1] || null,
                longitude: room.location?.coordinates?.longitude || room.location?.geoLocation?.coordinates?.[0] || null,
              },
              geoLocation: room.location?.geoLocation || { type: 'Point', coordinates: [] },
              placeName: room.location?.placeName || '',
              formattedAddress: room.location?.formattedAddress || '',
            },
            amenities: {
              wifi: room.amenities?.wifi || false,
              airConditioning: room.amenities?.airConditioning || false,
              parking: room.amenities?.parking || false,
              laundry: room.amenities?.laundry || false,
              furnished: room.amenities?.furnished || false,
              petFriendly: room.amenities?.petFriendly || false,
              tv: room.amenities?.tv || false,
              kitchen: room.amenities?.kitchen || false,
              balcony: room.amenities?.balcony || false,
              security: room.amenities?.security || false,
            },
            images: room.images || [],
            isFeatured: room.isFeatured || false,
            status: room.status || 'available',
          });
        }
      } catch (error) {
        console.error('Failed to fetch room:', error);
        toast.error('Failed to load room data');
        navigate('/admin/rooms');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else if (name.startsWith('amenities.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        amenities: { ...prev.amenities, [field]: checked }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle map location change
  const handleMapLocationChange = (locationData) => {
    if (!locationData) {
      // Clear map location
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: { latitude: null, longitude: null },
          geoLocation: { type: 'Point', coordinates: [] },
          placeName: '',
          formattedAddress: '',
        }
      }));
      return;
    }

    const { longitude, latitude, placeName, formattedAddress } = locationData;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { latitude, longitude },
        geoLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        placeName: placeName || '',
        formattedAddress: formattedAddress || '',
      }
    }));
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      new URL(imageUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: imageUrl.trim(), public_id: `img_${Date.now()}` }]
    }));
    setImageUrl('');
    toast.success('Image added');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Room title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.size || Number(formData.size) <= 0) {
      toast.error('Please enter a valid size');
      return;
    }
    if (!formData.location.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!formData.location.area.trim()) {
      toast.error('Area is required');
      return;
    }
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        size: Number(formData.size),
        beds: Number(formData.beds),
        bathrooms: Number(formData.bathrooms),
      };

      await roomApi.updateRoom(id, payload);
      toast.success('Room updated successfully!');
      navigate('/admin/rooms');
    } catch (error) {
      console.error('Failed to update room:', error);
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/rooms')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Room</h1>
        <p className="text-gray-500 mt-1">Update room listing details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-green-500" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern Studio in Thamel"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={100}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the room, its features, and nearby attractions..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {ROOM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Size */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Pricing & Size
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (Rs/month) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rs</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="8000"
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (sqft) *
              </label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="450"
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beds
              </label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="e.g., Kathmandu"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area *
              </label>
              <input
                type="text"
                name="location.area"
                value={formData.location.area}
                onChange={handleChange}
                placeholder="e.g., Thamel"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="e.g., 123 Thamel Marg, near Garden of Dreams"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Map Picker */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Location on Map
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Search for a place or click on the map to set the exact location. You can drag the marker to adjust.
              </p>
              <MapPicker
                value={{
                  longitude: formData.location.coordinates?.longitude,
                  latitude: formData.location.coordinates?.latitude,
                  placeName: formData.location.placeName,
                  formattedAddress: formData.location.formattedAddress,
                }}
                onChange={handleMapLocationChange}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {AMENITIES.map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                  ${formData.amenities[key]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="checkbox"
                  name={`amenities.${key}`}
                  checked={formData.amenities[key]}
                  onChange={handleChange}
                  className="sr-only"
                />
                <Icon className={`w-5 h-5 ${formData.amenities[key] ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm ${formData.amenities[key] ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-green-500" />
            Images
          </h2>

          {/* Add Image URL */}
          <div className="flex gap-3 mb-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Image Preview Grid */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={`Room ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No images added yet</p>
              <p className="text-sm text-gray-400">Add image URLs above</p>
            </div>
          )}
        </div>

        {/* Featured Option */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-5 h-5 text-green-500 rounded border-gray-300 focus:ring-green-500"
            />
            <div>
              <span className="font-medium text-gray-900">Featured Room</span>
              <p className="text-sm text-gray-500">This room will be highlighted on the homepage</p>
            </div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/rooms')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditRoom;
