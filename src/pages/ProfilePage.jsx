import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Mail, Phone, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header, Footer } from '../components/layout';
import { profileApi } from '../api';
import { getImageUrl } from '../utils/imageUtils';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          streetAddress: response.data.user.address?.street || '',
          city: response.data.user.address?.city || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setUploadingAvatar(true);
    try {
      const response = await profileApi.uploadProfilePicture(file);
      if (response.success) {
        toast.success('Profile picture updated successfully');
        setProfile((prev) => ({
          ...prev,
          user: response.data
        }));
        setAvatarPreview(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await profileApi.updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        streetAddress: formData.streetAddress,
        city: formData.city
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96 pt-20">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-12 px-4">
          <p className="text-center text-gray-600">Failed to load profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, stats } = profile;
  
  // Helper function to get avatar URL
  const avatarUrl = getImageUrl(user.avatar);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12 px-0 sm:px-0 lg:px-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div 
                  onClick={handleAvatarClick}
                  className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-300 transition relative group"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Preview image error:', e);
                      }}
                    />
                  ) : user.avatar && avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Avatar URL:', avatarUrl);
                        console.error('Avatar image error:', e);
                      }}
                    />
                  ) : (
                    <User className="text-gray-400" size={40} />
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-white" size={20} />
                    ) : (
                      <Upload className="text-white" size={20} />
                    )}
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* User Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>

                  {/* Stats */}
                  <div className="flex gap-8">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.bookings}
                      </p>
                      <p className="text-gray-600 text-sm">Bookings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.saved}
                      </p>
                      <p className="text-gray-600 text-sm">Saved</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setEditing(!editing)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Tabs/Sections */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Personal Info Tab */}
            <div className="mb-8">
              <div className="pb-4 border-b border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-green-500">
                  Personal Info
                </h2>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <User className="text-gray-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Basic Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="text-gray-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Address
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <User className="text-gray-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Basic Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 px-4 py-3 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <p className="text-gray-600">{user.firstName}</p>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <p className="text-gray-600">{user.lastName}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 rounded-lg mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-600">{user.email}</p>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-600">
                        {user.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="text-gray-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Address
                      </h3>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 rounded-lg mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <p className="text-gray-600">
                        {user.address?.street || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <p className="text-gray-600">
                        {user.address?.city || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
